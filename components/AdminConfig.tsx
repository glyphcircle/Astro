import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Card from './shared/Card';
import ThemeCustomizer from './ThemeCustomizer';

const AdminConfig: React.FC = () => {
  const { db, refresh, refreshTable, updateEntry, createEntry } = useDb();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'constants' | 'theme'>('theme');

  const TABLE_GROUPS = [
    {
      title: "Celestial Mechanics",
      tables: [
        { id: 'config', name: 'Global Constants', icon: '⚙️' },
        { id: 'services', name: 'Divine Offerings', icon: '🔮' },
        { id: 'report_formats', name: 'Decree Templates', icon: '📜' }
      ]
    },
    {
      title: "Spiritual Marketplace",
      tables: [
        { id: 'store_items', name: 'Sacred Inventory', icon: '🛒' },
        { id: 'payment_providers', name: 'Gateway Routes', icon: '💳' },
        { id: 'payment_methods', name: 'Dakshina Icons', icon: '💰' }
      ]
    },
    {
      title: "Soul Records",
      tables: [
        { id: 'profiles', name: 'Seeker Registry', icon: '👥' },
        { id: 'readings', name: 'Akashic History', icon: '👁️' },
        { id: 'image_assets', name: 'Image Vault', icon: '🖼️' }
      ]
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-skin-base p-6 font-mono text-skin-text pb-20">        
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-skin-border pb-6">
          <div>
            <h1 className="text-4xl font-cinzel font-black text-skin-text tracking-tighter uppercase">Registry <span className="text-skin-accent">Control</span></h1>
            <p className="text-[10px] text-skin-text opacity-40 uppercase tracking-[0.5em] font-bold">Maintenance Protocol Active</p>
          </div>
          <div className="flex gap-4">
             <button onClick={handleRefresh} className="px-5 py-2.5 bg-skin-surface border border-skin-border rounded-xl text-skin-accent text-[10px] font-black uppercase tracking-widest hover:bg-skin-hover transition-all flex items-center gap-2">
                <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span> {isRefreshing ? 'Syncing...' : 'Sync Vault'}
             </button>
             <button onClick={() => navigate('/home')} className="px-5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                &larr; Exit
             </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setActiveTab('theme')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'theme' ? 'bg-skin-accent text-skin-button-text border-skin-accent shadow-lg' : 'bg-skin-surface text-skin-text/60 border-skin-border'}`}
            >
                🎨 Appearance Engine
            </button>
            <button 
                onClick={() => setActiveTab('constants')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'constants' ? 'bg-skin-accent text-skin-button-text border-skin-accent shadow-lg' : 'bg-skin-surface text-skin-text/60 border-skin-border'}`}
            >
                ⚙️ Core Parameters
            </button>
        </div>

        {activeTab === 'theme' ? (
            <div className="animate-fade-in-up">
                <ThemeCustomizer />
            </div>
        ) : (
            <section className="animate-fade-in-up">
              <div className="space-y-12">
                  {TABLE_GROUPS.map((group, gIdx) => (
                      <div key={group.title} style={{ animationDelay: `${gIdx*100}ms` }}>
                          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-skin-text opacity-30 mb-6 ml-2">{group.title}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {group.tables.map(table => (
                                  <Link 
                                      key={table.id}
                                      to={`/admin/db/${table.id}`}
                                      className="group p-6 bg-skin-surface border border-skin-border rounded-[2.5rem] hover:border-skin-accent transition-all hover:scale-[1.03] active:scale-95 shadow-xl relative overflow-hidden"
                                  >
                                      <div className="flex justify-between items-start mb-4">   
                                          <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{table.icon}</span>
                                          <span className="text-2xl font-mono font-black text-skin-text opacity-10 group-hover:text-skin-accent group-hover:opacity-40">{db[table.id]?.length || 0}</span>
                                      </div>
                                      <h4 className="font-cinzel font-black text-skin-text group-hover:text-white uppercase tracking-wider">{table.name}</h4>
                                      <p className="text-[9px] text-skin-text opacity-30 mt-2 uppercase tracking-widest font-bold">Manage Registry Entry &rarr;</p>
                                  </Link>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
            </section>
        )}

        <div className="mt-20 pt-8 border-t border-skin-border text-center">
             <Link to="/admin/dashboard" className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest underline underline-offset-8">
               Return to Control Center
             </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;