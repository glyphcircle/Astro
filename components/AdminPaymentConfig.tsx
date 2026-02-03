
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useDb } from '../hooks/useDb';
import { paymentManager, PaymentProvider } from '../services/paymentManager';

const PROVIDER_TYPES = ['razorpay', 'stripe', 'paypal'];

const AdminPaymentConfig: React.FC = () => {
  const { db, refresh } = useDb();
  const [formData, setFormData] = useState<Partial<PaymentProvider>>({ provider_type: 'razorpay' });
  const [isEditing, setIsEditing] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Validation State
  const [flashError, setFlashError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Get from DB Context
  const providers: PaymentProvider[] = db.payment_providers || [];

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refresh();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleEdit = (provider: PaymentProvider) => {
    setFormData(provider);
    setIsEditing(true);
    setTestStatus({});
    setFlashError(null);
  };

  const handleCreate = () => {
    setFormData({ provider_type: 'razorpay', is_active: true, country_codes: 'GLOBAL' });
    setIsEditing(true);
    setTestStatus({});
    setFlashError(null);
  };

  const triggerFlash = (message: string) => {
      setFlashError(message);
      setIsFlashing(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      setTimeout(() => setIsFlashing(false), 800);
  };

  const validateForm = (): boolean => {
      if (!formData.name?.trim()) {
          triggerFlash("Configuration Name is missing.");
          return false;
      }
      if (!formData.api_key?.trim()) {
          triggerFlash("Public API Key is required.");
          return false;
      }
      return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    await paymentManager.saveProvider(formData as any);
    setIsEditing(false);
    refresh();
    setFlashError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this provider configuration?")) {
        await paymentManager.deleteProvider(id);
        refresh();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await paymentManager.toggleActive(id, currentStatus);
    refresh();
  };

  const handleTestTransaction = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const res = await paymentManager.testTransaction(formData as PaymentProvider);
    setTestStatus(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-gray-300">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Payment Gateway Manager</h1>
                    <p className="text-sm text-gray-500">Configure global transaction routes. Auto-detect region.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-amber-200 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
                        <span className="text-xs font-bold uppercase">Refresh</span>
                    </button>
                    <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">&larr; Dashboard</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LIST PANEL */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-200">Active Gateways</h3>
                        <button onClick={handleCreate} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">+ NEW</button>
                    </div>
                    
                    <div className="space-y-3">
                        {providers.filter(p => p.status === 'active').map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => handleEdit(p)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${p.id === formData.id ? 'bg-gray-800 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${p.provider_type === 'razorpay' ? 'bg-blue-900 text-blue-300' : p.provider_type === 'stripe' ? 'bg-purple-900 text-purple-300' : 'bg-orange-900 text-orange-300'}`}>
                                        {p.provider_type}
                                    </span>
                                    <button 
                                        onClick={(e) => handleToggleActive(p.id, p.is_active, e)}
                                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_active ? 'bg-green-900/30 text-green-400 border-green-600' : 'bg-gray-700 text-gray-400 border-gray-600'}`}
                                    >
                                        {p.is_active ? '● LIVE' : '○ OFF'}
                                    </button>
                                </div>
                                <h4 className="font-bold text-white truncate">{p.name}</h4>
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>{p.currency}</span>
                                    <span className="font-mono">{p.country_codes}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDITOR PANEL */}
                <Card className={`lg:col-span-2 bg-gray-800 border-gray-700 p-6 transition-all duration-300 ${isFlashing ? 'ring-4 ring-red-500 shadow-[0_0_50px_rgba(220,38,38,0.5)] bg-red-900/10' : ''}`}>
                    {isEditing ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                                <h3 className="text-xl font-bold text-white">{formData.id ? 'Edit Gateway' : 'New Gateway'}</h3>
                                {formData.id && (
                                    <button 
                                        onClick={() => handleDelete(formData.id!)}
                                        className="text-red-400 hover:text-red-300 text-xs px-3"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            {/* Flash Error Banner */}
                            {flashError && (
                                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3 animate-bounce">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <div className="font-bold text-sm uppercase tracking-widest">Action Required</div>
                                        <div className="text-xs">{flashError}</div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Provider Type</label>
                                    <select 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none uppercase"
                                        value={formData.provider_type}
                                        onChange={e => setFormData({...formData, provider_type: e.target.value as any})}
                                    >
                                        {PROVIDER_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Config Name <span className="text-red-500">*</span></label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        placeholder="e.g. Razorpay India Prod"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Public API Key (Client ID) <span className="text-red-500">*</span></label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                                        placeholder="rzp_test_... or pk_test_..."
                                        value={formData.api_key || ''}
                                        onChange={e => setFormData({...formData, api_key: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Region Codes (ISO)</label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none font-mono uppercase"
                                        placeholder="IN,US or GLOBAL"
                                        value={formData.country_codes || ''}
                                        onChange={e => setFormData({...formData, country_codes: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Currency</label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none uppercase"
                                        placeholder="INR, USD"
                                        value={formData.currency || ''}
                                        onChange={e => setFormData({...formData, currency: e.target.value})}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase text-gray-500 mb-1">API Secret / Private Key <span className="text-red-500">*</span></label>
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                                        placeholder="**************************"
                                        value={formData.api_secret || ''}
                                        onChange={e => setFormData({...formData, api_secret: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Test & Status Area */}
                            <div className="bg-black/30 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-bold text-gray-300">Transaction Test</h4>
                                    <button 
                                        onClick={handleTestTransaction}
                                        disabled={loading}
                                        className="text-xs bg-amber-900/50 hover:bg-amber-800 text-amber-300 px-3 py-1 rounded border border-amber-800 transition-colors"
                                    >
                                        {loading ? 'Processing...' : 'Initiate ₹1 Test'}
                                    </button>
                                </div>
                                {testStatus.message && (
                                    <div className={`text-xs p-2 rounded ${testStatus.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                        {testStatus.success ? '✅' : '❌'} {testStatus.message}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-700">
                                <Button onClick={handleSave} className="flex-1 bg-green-700 hover:bg-green-600">
                                    Save Provider
                                </Button>
                                <button 
                                    onClick={() => { setIsEditing(false); setFlashError(null); }}
                                    className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <span className="text-6xl mb-4">💳</span>
                            <p>Select a payment gateway to configure</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    </div>
  );
};

export default AdminPaymentConfig;
