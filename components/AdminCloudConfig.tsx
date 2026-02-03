
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useDb } from '../hooks/useDb';
import { cloudManager, CloudProvider } from '../services/cloudManager';
import { supabase } from '../services/supabaseClient';
import AdminContextHelp from './AdminContextHelp';

const PROVIDER_OPTIONS = ['Google Drive', 'Dropbox', 'AWS S3', 'Firebase Storage'];

const AdminCloudConfig: React.FC = () => {
  const { db, refresh } = useDb();
  const [formData, setFormData] = useState<Partial<CloudProvider>>({ provider: 'Google Drive' });
  const [isEditing, setIsEditing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const providers: CloudProvider[] = db.cloud_providers || [];

  useEffect(() => {
    checkSupabase();
  }, []);

  const checkSupabase = async () => {
      // Simple ping to check if we can read config table
      const { error } = await supabase.from('config').select('count', { count: 'exact', head: true });
      if (error) setConnectionStatus('❌ Disconnected (Check .env)');
      else setConnectionStatus('✅ Connected to Supabase');
  };

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refresh();
      await checkSupabase();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleEdit = (provider: CloudProvider) => {
    setFormData(provider);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setFormData({ provider: 'Google Drive', is_active: false });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Name required");
    await cloudManager.saveProvider(formData as any);
    setIsEditing(false);
    refresh(); // Refresh DB context
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-gray-300">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Cloud Infrastructure</h1>
                    <p className="text-sm text-gray-500">Manage Asset Sources & Database Connection</p>
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

            {/* DB STATUS CARD */}
            <Card className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border-green-500/30 p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Serverless Database</h3>
                        <p className="text-sm text-gray-300">PostgreSQL (Supabase) via REST API</p>
                    </div>
                    <div className="px-4 py-2 bg-black/40 rounded border border-gray-600 font-bold text-sm">
                        {connectionStatus}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LIST PANEL */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-200">Asset Providers</h3>
                        <button onClick={handleCreate} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">+ NEW</button>
                    </div>
                    
                    <div className="space-y-3">
                        {providers.filter(p => p.status === 'active').map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => handleEdit(p)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${p.id === formData.id ? 'bg-gray-800 border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-900 text-blue-300">
                                        {p.provider}
                                    </span>
                                    {p.is_active && <span className="text-[10px] text-green-400 font-bold">● LIVE</span>}
                                </div>
                                <h4 className="font-bold text-white truncate">{p.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDITOR PANEL */}
                <Card className="lg:col-span-2 bg-gray-800 border-gray-700 p-6">
                    {isEditing ? (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white">{formData.id ? 'Edit Provider' : 'New Connection'}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Provider Type</label>
                                    <select 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.provider}
                                        onChange={e => setFormData({...formData, provider: e.target.value as any})}
                                    >
                                        {PROVIDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Name</label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase text-gray-500 mb-1">API Key / Token</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none font-mono"
                                        value={formData.api_key || ''}
                                        onChange={e => setFormData({...formData, api_key: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Root Folder / Bucket</label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.folder_id || formData.bucket_name || ''}
                                        onChange={e => setFormData({...formData, folder_id: e.target.value, bucket_name: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 p-3 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:border-green-500">
                                        <input 
                                            type="checkbox"
                                            className="w-5 h-5 accent-green-500"
                                            checked={formData.is_active || false}
                                            onChange={e => setFormData({...formData, is_active: e.target.checked})}
                                        />
                                        <span className={`text-sm font-bold ${formData.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                                            {formData.is_active ? 'ENABLED (LIVE)' : 'DISABLED'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-700">
                                <Button onClick={handleSave} className="flex-1 bg-green-700 hover:bg-green-600">Save</Button>
                                <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <p>Select a provider to configure.</p>
                        </div>
                    )}
                </Card>
            </div>
            
            <AdminContextHelp context="cloud" />
        </div>
    </div>
  );
};

export default AdminCloudConfig;
