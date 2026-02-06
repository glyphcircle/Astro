import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Card from './shared/Card';
import AdminContextHelp from './AdminContextHelp';
import { useAuth } from '../context/AuthContext';
import OptimizedImage from './shared/OptimizedImage';

const InventoryAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            const { data } = await supabase.from('v_low_stock_alerts').select('*');
            if (data) setAlerts(data);
            setIsLoading(false);
        };
        fetchAlerts();
    }, []);

    if (isLoading || alerts.length === 0) return null;

    return (
        <Card className="mb-6 border-l-4 border-amber-600 bg-amber-950/20 backdrop-blur-md p-6">
            <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl">⚠️</span>
                <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-amber-500">Inventory Registry Alerts</h3>
                    <p className="text-[10px] text-amber-100/60 uppercase">Artifacts nearing exhaustion in physical dimension</p>
                </div>
            </div>
            <div className="space-y-2">
                {alerts.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-black/40 rounded border border-amber-500/10 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded overflow-hidden bg-gray-900 border border-white/10">
                                <OptimizedImage src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white uppercase">{item.name}</p>
                                <p className="text-[9px] text-gray-500 font-mono">SKU: {item.sku} | STOCK: {item.available_stock}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs font-black ${item.alert_level === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>
                                {item.available_stock} LEFT
                            </p>
                            <p className="text-[8px] text-gray-600 uppercase font-bold">{item.alert_level}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const SystemStatus: React.FC = () => {
    const [stats, setStats] = useState({
        supabase: 'Checking...',
        sqlite: 'Active',
        latency: 0,
        lastSync: new Date().toLocaleTimeString(),
        error: ''
    });
    const [isError, setIsError] = useState(false);

    const checkHealth = async () => {
        const start = Date.now();
        try {
            const { error } = await supabase.from('v_active_services').select('id').limit(1);
            const latency = Date.now() - start;
            
            if (error) throw new Error(error.message || JSON.stringify(error));

            setStats({
                supabase: 'Operational',
                sqlite: 'Synced',
                latency,
                lastSync: new Date().toLocaleTimeString(),
                error: ''
            });
            setIsError(false);
        } catch (e: any) {
            const msg = e.message || String(e);
            console.error("Dashboard Health Check Error:", msg);
            setStats(prev => ({ ...prev, supabase: 'Connection Error', error: msg }));
            setIsError(true);
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className={`mb-6 border-l-4 ${isError ? 'border-red-600' : 'border-green-500'} bg-black/40 backdrop-blur-md`}>
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${isError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                        {!isError && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>}
                    </div>
                    <div>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Infrastructure Health</h3>
                        <div className="flex gap-4 mt-1">
                            <div className="text-sm font-bold text-white">Cloud: <span className={isError ? 'text-red-400' : 'text-green-400'}>{stats.supabase}</span></div>
                            <div className="text-sm font-bold text-white">Cache: <span className="text-blue-400">{stats.sqlite}</span></div>
                        </div>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Latency: <span className="text-amber-400">{stats.latency}ms</span></div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Last Check: <span className="text-amber-400">{stats.lastSync}</span></div>
                </div>
            </div>
        </Card>
    );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdminVerified, logout } = useAuth();
  const [adminUser] = useState<any>(() => {
      try {
          const session = localStorage.getItem('glyph_admin_session');
          return session ? JSON.parse(session) : null;
      } catch (e) { return null; }
  });

  useEffect(() => {
    if (!isAdminVerified && !adminUser) navigate('/login');
  }, [navigate, isAdminVerified, adminUser]);

  const handleLogout = () => {
      localStorage.removeItem('glyph_admin_session');
      logout();
      navigate('/login');
  };

  if (!isAdminVerified && !adminUser) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-sans p-4">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-green-500 font-cinzel font-bold tracking-widest text-sm animate-pulse">INITIALIZING SECURE LINK...</h2>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-sans p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-cinzel font-bold text-white mb-2 tracking-widest">Admin Sanctum</h1>
            <p className="text-green-400 text-sm font-mono tracking-widest uppercase">IDENTIFIED: {adminUser?.user || user?.email || 'Authorized Entity'}</p>
        </div>

        <SystemStatus />
        <InventoryAlerts />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/home')} className="group p-6 bg-blue-900/20 hover:bg-blue-600 border border-blue-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-3 shadow-lg">
                <span className="text-3xl group-hover:scale-110 transition-transform">👤</span>
                <span className="font-bold text-blue-100 uppercase tracking-widest text-xs">Run App as User</span>
            </button>
            <button onClick={() => navigate('/admin/config')} className="group p-6 bg-purple-900/20 hover:bg-purple-600 border border-purple-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-3 shadow-lg">
                <span className="text-3xl group-hover:scale-110 transition-transform">⚙️</span>
                <span className="font-bold text-purple-100 uppercase tracking-widest text-xs">Full Configuration</span>
            </button>
            <button onClick={() => navigate('/admin/batch-editor')} className="group p-6 bg-amber-900/20 hover:bg-amber-600 border border-amber-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-3 shadow-lg">
                <span className="text-3xl group-hover:scale-110 transition-transform">⚡</span>
                <span className="font-bold text-amber-100 uppercase tracking-widest text-xs">Bulk Manifestation</span>
            </button>
            <button onClick={() => navigate('/admin/payments')} className="group p-6 bg-emerald-900/20 hover:bg-emerald-600 border border-emerald-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-3 shadow-lg">
                <span className="text-3xl group-hover:scale-110 transition-transform">💳</span>
                <span className="font-bold text-emerald-100 uppercase tracking-widest text-xs">Payment Routes</span>
            </button>
            <button onClick={() => navigate('/admin/revenue')} className="group p-6 bg-indigo-900/20 hover:bg-indigo-600 border border-indigo-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-3 shadow-lg col-span-1 sm:col-span-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">📈</span>
                <span className="font-bold text-indigo-100 uppercase tracking-widest text-xs">Financial Analytics</span>
            </button>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 text-center">
            <button onClick={handleLogout} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest underline underline-offset-4">De-Authorize Session</button>
        </div>
      </div>
      <AdminContextHelp context="dashboard" />
    </div>
  );
};

export default AdminDashboard;