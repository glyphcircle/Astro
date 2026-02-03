
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { dbService } from '../services/db';
import { useDb } from '../hooks/useDb';

const BackupManager: React.FC = () => {
  const { refresh } = useDb();
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('glyph_last_backup_time')
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refresh();
      setTimeout(() => setIsRefreshing(false), 800);
  };
  
  // 1. EXPORT: Fetch from Supabase
  const handleExport = async (format: 'json' | 'csv', tableName?: string) => {
    try {
      let data: any;
      let fileName = 'glyph-backup';

      if (format === 'json') {
          // Fetch critical tables
          const users = await dbService.getAll('users');
          const readings = await dbService.getAll('readings');
          const payments = await dbService.getAll('transactions');
          data = { users, readings, payments };
          fileName += `-${new Date().toISOString().split('T')[0]}.json`;
      } else if (tableName) {
          data = await dbService.getAll(tableName);
          fileName = `glyph-${tableName}-${new Date().toISOString().split('T')[0]}.csv`;
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
          alert("No data found to export.");
          return;
      }

      let content = '';
      let type = '';

      if (format === 'json') {
          content = JSON.stringify(data, null, 2);
          type = 'application/json';
      } else {
          // CSV Conversion
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map((obj: any) => 
            Object.values(obj).map(v => 
                typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : `"${v}"`
            ).join(',')
          );
          content = [headers, ...rows].join('\n');
          type = 'text/csv';
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (format === 'json') {
          const now = new Date().toLocaleString();
          localStorage.setItem('glyph_last_backup_time', now);
          setLastBackup(now);
      }

    } catch (e: any) {
      console.error("Export failed", e);
      alert("Export Failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-gray-300">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Disaster Recovery</h1>
                    <p className="text-sm text-gray-500">Export System Data (Supabase)</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-amber-200 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
                        <span className="text-xs font-bold uppercase">Refresh</span>
                    </button>
                    <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300">&larr; Dashboard</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* EXPORT CARD */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>⬇️</span> Export Data
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Download a snapshot of users, readings, and transactions from the cloud.
                    </p>
                    
                    <div className="bg-black/30 p-4 rounded border border-gray-700 text-xs mb-6">
                        <p className="text-gray-500 mb-1 uppercase tracking-widest">Last Backup</p>
                        <p className="text-green-400 font-mono text-base">{lastBackup || 'Never'}</p>
                    </div>

                    <Button onClick={() => handleExport('json')} className="w-full bg-blue-600 hover:bg-blue-500 border-none">
                        Download JSON Snapshot
                    </Button>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Quick CSV Exports</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleExport('csv', 'users')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">Users</button>
                            <button onClick={() => handleExport('csv', 'readings')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">Readings</button>
                            <button onClick={() => handleExport('csv', 'transactions')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">Payments</button>
                        </div>
                    </div>
                </Card>

                {/* INFO CARD */}
                <Card className="bg-gray-800 border-blue-900/30 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>☁️</span> Cloud Managed
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Your data is securely hosted on Supabase with point-in-time recovery enabled by default on the server side.
                    </p>
                    <p className="text-sm text-gray-400">
                        Manual restores must be performed via the Supabase Dashboard SQL Editor or CLI tools to ensure data integrity and Row Level Security compliance.
                    </p>
                    
                    <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-300">
                        <strong>Note:</strong> Client-side JSON import is disabled for security in the cloud environment.
                    </div>
                </Card>

            </div>
        </div>
    </div>
  );
};

export default BackupManager;
