
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { cloudManager } from '../services/cloudManager';

// --- CONFIGURATION: Route to Table Mapping ---
const PAGE_TABLE_MAP: Record<string, string[]> = {
  '/store': ['store_items', 'store_categories', 'store_orders', 'store_discounts'],
  '/home': ['featured_content', 'services', 'image_assets'],
  '/tarot': ['readings', 'image_assets', 'content', 'report_formats'], 
  '/palmistry': ['readings', 'image_assets', 'report_formats'],
  '/face-reading': ['readings', 'image_assets', 'report_formats'],
  '/numerology': ['readings', 'users', 'image_assets', 'services', 'report_formats'],
  '/astrology': ['readings', 'users', 'image_assets', 'services', 'report_formats'],
  '/matchmaking': ['readings', 'image_assets', 'report_formats'],
  '/remedy': ['remedy_requests', 'readings', 'image_assets', 'report_formats'],
  '/dream-analysis': ['readings', 'image_assets', 'report_formats'],
  '/referrals': ['users', 'transactions'],
  '/leaderboard': ['users'],
  '/admin/revenue': ['transactions', 'store_orders'],
  '/admin/config': ['config', 'advertisement_config', 'payment_config', 'report_formats'],
  '/admin/payments': ['payment_providers', 'payment_config', 'payment_methods'],
  '/profile': ['users', 'user_subscriptions', 'transactions']
};

const DEFAULT_TABLES = ['users', 'transactions', 'feedback', 'logs'];

const ContextDbNavigator: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { db, createEntry, updateEntry, toggleStatus } = useDb();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'table' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState<any>(null);

  // 1. SECURITY CHECK
  const isMaster = user?.role === 'admin';
  if (!isMaster) return null;

  // 2. DETERMINE RELEVANT TABLES
  const relevantTables = useMemo(() => {
    const path = location.pathname;
    // Check exact match or partial match
    const matchedKey = Object.keys(PAGE_TABLE_MAP).find(k => path.startsWith(k));
    const tables = matchedKey ? PAGE_TABLE_MAP[matchedKey] : DEFAULT_TABLES;
    
    // Filter out tables that don't exist in DB schema to avoid crashes
    return tables.filter(t => db[t] !== undefined);
  }, [location.pathname, db]);

  // 3. HANDLERS
  const handleTableSelect = (table: string) => {
    setActiveTable(table);
    setViewMode('table');
    setSearchTerm('');
  };

  const handleBack = () => {
    if (viewMode === 'edit') {
      setViewMode('table');
      setEditData(null);
    } else if (viewMode === 'table') {
      setViewMode('list');
      setActiveTable(null);
    }
  };

  const handleExport = () => {
    if (!activeTable) return;
    const data = db[activeTable] || [];
    if (data.length === 0) return alert("No data to export");

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row: any) => Object.values(row).map(v => 
      typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : `"${v}"`
    ).join(','));
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTable}_context_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSave = () => {
    if (!activeTable || !editData) return;
    
    if (editData.id && db[activeTable].find((r: any) => r.id === editData.id)) {
        updateEntry(activeTable, editData.id, editData);
    } else {
        createEntry(activeTable, editData);
    }
    setViewMode('table');
    setEditData(null);
  };

  // 4. RENDERERS
  const renderList = () => (
    <div className="grid grid-cols-2 gap-3">
      {relevantTables.map(t => (
        <button 
          key={t}
          onClick={() => handleTableSelect(t)}
          className="flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all group"
        >
          <span className="text-amber-100 font-bold text-sm capitalize">{t.replace(/_/g, ' ')}</span>
          <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-1 rounded font-mono group-hover:bg-amber-500 group-hover:text-black transition-colors">
            {db[t]?.length || 0}
          </span>
        </button>
      ))}
      {relevantTables.length === 0 && (
        <div className="col-span-2 text-center text-gray-500 text-sm py-4">
          No configured tables for this route context.
        </div>
      )}
    </div>
  );

  const renderTable = () => {
    if (!activeTable) return null;
    const records = db[activeTable] || [];
    const filtered = records.filter((r: any) => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()));
    const columns = records.length > 0 ? Object.keys(records[0]) : ['id', 'status'];

    return (
      <div className="flex flex-col h-[60vh]">
        <div className="flex gap-2 mb-4">
          <input 
            className="flex-grow bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
            placeholder="Search records..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button onClick={() => { setEditData({}); setViewMode('edit'); }} className="bg-green-700 text-white px-3 py-2 rounded text-sm hover:bg-green-600">+</button>
          <button onClick={handleExport} className="bg-blue-700 text-white px-3 py-2 rounded text-sm hover:bg-blue-600">📥</button>
        </div>
        
        <div className="overflow-auto custom-scrollbar flex-grow border border-gray-700 rounded bg-gray-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800 text-amber-500 sticky top-0">
              <tr>
                {columns.map(c => <th key={c} className="p-2 border-b border-gray-700 whitespace-nowrap">{c}</th>)}
                <th className="p-2 border-b border-gray-700 text-right">Act</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {filtered.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-800 border-b border-gray-800">
                  {columns.map(c => {
                    const val = row[c];
                    const strVal = String(val || '');
                    const isUrl = typeof val === 'string' && strVal.startsWith('http');
                    const showPreview = isUrl && (
                        c.toLowerCase().includes('image') || 
                        c.toLowerCase().includes('photo') || 
                        c.toLowerCase().includes('logo') || 
                        c.toLowerCase() === 'path' || 
                        c.toLowerCase() === 'url' || 
                        strVal.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ||
                        strVal.includes('images.unsplash.com') ||
                        strVal.includes('drive.google.com')
                    );

                    return (
                        <td key={c} className="p-2 truncate max-w-[150px]" title={strVal}>
                          {isUrl && showPreview ? (
                              <div className="flex items-center gap-2">
                                  <img 
                                      src={cloudManager.resolveImage(strVal)} 
                                      alt="prev" 
                                      className="w-5 h-5 rounded border border-gray-600 object-cover flex-shrink-0" 
                                      onError={(e) => e.currentTarget.style.display = 'none'}
                                  />
                                  <span className="truncate">{strVal}</span>
                              </div>
                          ) : (
                              typeof val === 'object' ? '{...}' : strVal
                          )}
                        </td>
                    );
                  })}
                  <td className="p-2 text-right flex justify-end gap-1">
                    <button onClick={() => { setEditData(row); setViewMode('edit'); }} className="text-blue-400 hover:text-white">✎</button>
                    <button onClick={() => toggleStatus(activeTable, row.id)} className={`${row.status==='active'?'text-green-400':'text-red-400'} hover:text-white`}>
                      {row.status === 'active' ? '●' : '○'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEdit = () => {
    if (!editData) return null;
    const fields = Object.keys(editData).length > 0 ? Object.keys(editData) : (db[activeTable!]?.[0] ? Object.keys(db[activeTable!]![0]) : ['id', 'name']);

    return (
      <div className="h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        <h4 className="text-amber-400 mb-4 font-bold border-b border-gray-700 pb-2">
          {editData.id ? `Edit #${editData.id}` : 'New Record'}
        </h4>
        <div className="space-y-3">
          {fields.map(key => (
            <div key={key}>
              <label className="block text-xs text-gray-500 uppercase mb-1">{key}</label>
              {key === 'status' ? (
                 <select 
                    value={editData[key] || 'active'}
                    onChange={e => setEditData({...editData, [key]: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white"
                 >
                   <option value="active">active</option>
                   <option value="inactive">inactive</option>
                 </select>
              ) : (
                <input 
                  disabled={key === 'id' && !!editData.id}
                  className={`w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white ${key === 'id' ? 'opacity-50' : ''}`}
                  value={typeof editData[key] === 'object' ? JSON.stringify(editData[key]) : (editData[key] || '')}
                  onChange={e => setEditData({...editData, [key]: e.target.value})}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={handleSave} className="flex-1 bg-green-700 hover:bg-green-600 text-sm">Save</Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-36 right-0 z-50 bg-amber-600 text-white pl-3 pr-2 py-2 rounded-l-lg shadow-lg border-l border-t border-b border-amber-400 hover:bg-amber-500 transition-all transform hover:scale-105 flex items-center gap-2 font-bold text-xs"
        title={`Manage DB: ${location.pathname}`}
      >
        <span>🔗 DB</span>
        {activeTable && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
      </button>

      {/* 2. Modal Overlay */}
      <Modal isVisible={isOpen} onClose={() => setIsOpen(false)}>
        <div className="bg-[#0F0F23] text-amber-50 rounded-xl max-w-4xl w-full mx-4 flex flex-col max-h-[85vh] border border-amber-500/30 shadow-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              {viewMode !== 'list' && (
                <button onClick={handleBack} className="text-gray-400 hover:text-white mr-2 text-xl">←</button>
              )}
              <div>
                <h3 className="text-lg font-cinzel font-bold text-amber-400">
                  {viewMode === 'list' ? 'Context Database' : activeTable?.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                  Context: {location.pathname}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>

          {/* Body */}
          <div className="p-4 flex-grow bg-gray-900/80">
            {viewMode === 'list' && renderList()}
            {viewMode === 'table' && renderTable()}
            {viewMode === 'edit' && renderEdit()}
          </div>

          {/* Footer */}
          {viewMode === 'list' && (
             <div className="p-3 bg-gray-900 border-t border-gray-700 text-center text-[10px] text-gray-500">
               Auto-detected {relevantTables.length} tables for this route.
             </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ContextDbNavigator;
