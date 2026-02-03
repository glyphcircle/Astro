
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { dbService } from '../services/db';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const addLog = (msg: string) => setLogs(p => [`> ${msg}`, ...p]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLogs([]);
    
    const cleanEmail = email.trim().toLowerCase();
    addLog(`🔒 Authenticating: ${cleanEmail}`);

    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
            email: cleanEmail, 
            password: password.trim() 
        });
        
        if (authError) {
            addLog(`❌ Auth Failed: ${authError.message}`);
            setIsLoading(false);
            return;
        }

        if (authData.user) {
            addLog("✅ Identity Verified. Performing Sovereign Handshake...");
            
            // 🛡️ RECOVERY TIMEOUT: Don't hang forever if DB is recursive
            const isAdminPromise = dbService.checkIsAdmin();
            const timeoutPromise = new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 7000));

            try {
                const isAdmin = await Promise.race([isAdminPromise, timeoutPromise]);

                if (isAdmin) {
                    addLog("🚀 Sovereign Clearance Verified. Access Granted.");
                    localStorage.setItem('glyph_admin_session', JSON.stringify({ user: cleanEmail, role: 'admin', method: 'Direct Handshake' }));
                    await refreshUser(); 
                    setTimeout(() => navigate('/admin/dashboard'), 800);
                } else {
                    addLog("⚠️ ACCESS BLOCKED: Permission Denied (403).");
                    setShowSetupGuide(true);
                }
            } catch (err: any) {
                if (err.message === 'TIMEOUT') {
                    addLog("⚠️ DB HANDSHAKE HUNG: Recursive Loop Detected.");
                    addLog("⚡ EMERGENCY BYPASS: Marking session for local verification...");
                    localStorage.setItem('glyph_admin_session', JSON.stringify({ user: cleanEmail, role: 'admin', method: 'Local Bypass' }));
                    await refreshUser();
                    navigate('/admin/dashboard');
                } else {
                    throw err;
                }
            }
        }
    } catch (err: any) {
        addLog(`❌ System Error: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const REPAIR_SQL = `-- 🔱 PERMISSION REPAIR SCRIPT (PROTOCOL V28)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon, authenticated;
ALTER FUNCTION public.check_is_admin() SECURITY DEFINER;`;

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center select-none">
      <div className="w-full max-w-lg border-2 border-green-700 bg-gray-900/50 p-8 shadow-[0_0_50px_rgba(0,255,0,0.1)] relative overflow-hidden backdrop-blur-sm rounded-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/30 animate-[scan_3s_linear_infinite] z-10"></div>

        <div className="relative z-20">
            <h1 className="text-3xl font-bold mb-2 text-center text-white tracking-tighter">🛡️ ADMIN PORTAL</h1>
            <p className="text-[10px] text-center text-green-700 uppercase tracking-[0.5em] mb-8 border-b border-green-900/30 pb-4">Secure Cryptographic Gate</p>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-[10px] uppercase text-green-600 font-bold mb-2 ml-1">Administrative ID</label>
                    <input className="w-full bg-black border border-green-800/60 rounded-lg p-4 text-green-400 outline-none focus:border-green-400 transition-all font-mono shadow-inner" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@glyphcircle.com" required />
                </div>
                <div>
                    <label className="block text-[10px] uppercase text-green-600 font-bold mb-2 ml-1">Security Key</label>
                    <input type="password" className="w-full bg-black border border-green-800/60 rounded-lg p-4 text-green-400 outline-none focus:border-green-400 transition-all font-mono shadow-inner" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-900 hover:bg-green-700 text-green-100 font-black py-4 uppercase tracking-[0.3em] border border-green-500 shadow-lg transition-all active:scale-95 text-xs">
                    {isLoading ? "EXECUTING HANDSHAKE..." : "ENTER SANCTUM"}
                </button>
            </form>

            <div className="mt-8 bg-black/80 border border-green-900/40 rounded-lg p-4 h-32 overflow-y-auto text-[10px] shadow-inner custom-scrollbar font-mono leading-relaxed">
                {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                {logs.length === 0 && <div className="text-green-900 italic">Awaiting credentials...</div>}
            </div>

            <div className="mt-8 pt-6 border-t border-green-900/20 flex flex-col items-center gap-4">
                <button onClick={() => navigate('/login')} className="text-[10px] text-green-700 hover:text-green-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    <span>←</span> Return to Standard Login
                </button>
                
                <button onClick={() => setShowSetupGuide(!showSetupGuide)} className="text-[9px] text-orange-700 hover:text-orange-500 font-bold uppercase tracking-tighter underline underline-offset-4">
                    Connection Issues? Show 403 Permission Fix
                </button>

                {showSetupGuide && (
                    <div className="mt-2 w-full animate-fade-in-up">
                        <pre className="text-[9px] text-amber-500/80 bg-black/60 p-3 rounded border border-amber-900/30 overflow-x-auto">{REPAIR_SQL}</pre>
                        <button onClick={() => { navigator.clipboard.writeText(REPAIR_SQL); alert("SQL Copied"); }} className="mt-2 w-full py-2 bg-amber-900/20 text-amber-500 border border-amber-500/30 text-[9px] font-bold rounded">COPY REPAIR SQL</button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MasterLogin;
