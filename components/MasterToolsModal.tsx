import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Modal from './shared/Modal';

interface MasterToolsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const MasterToolsModal: React.FC<MasterToolsModalProps> = ({ isVisible, onClose }) => {
  const { db } = useDb();
  const navigate = useNavigate();

  const CONFIG_TABLES = [
    { key: 'services', label: 'Offerings', icon: '🔮', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-500/30' },
    { key: 'config', label: 'App Config', icon: '🛠️', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500/30' },
    { key: 'image_assets', label: 'Image Vault', icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-500/30' },
    { key: 'users', label: 'User Directory', icon: '👥', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/30' },
    { key: 'store_items', label: 'Vedic Store', icon: '🛒', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30' },
    { key: 'payment_providers', label: 'Payment API', icon: '💳', color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-500/30' },
  ];

  const handleNavigate = (table: string) => {
    onClose();
    navigate(`/admin/db/${table}`);
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="p-8 bg-[#0F0F23] rounded-3xl border border-amber-500/20 w-full max-w-lg mx-auto flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
            <div>
                <h2 className="text-3xl font-cinzel font-black text-amber-100 uppercase tracking-tighter">Sovereign Registry</h2>
                <p className="text-[9px] text-amber-500/50 uppercase tracking-[0.4em] font-bold">Administrative Table Maintenance</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl transition-colors">&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            {CONFIG_TABLES.map((t) => {
                const count = db[t.key]?.length || 0;
                return (
                    <div 
                        key={t.key}
                        onClick={() => handleNavigate(t.key)}
                        className={`group relative p-5 rounded-2xl border ${t.border} ${t.bg} hover:bg-opacity-40 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 shadow-lg flex flex-col items-center text-center`}
                    >
                        <span className="text-3xl mb-3 group-hover:animate-pulse transition-transform">{t.icon}</span>
                        <h3 className="font-cinzel font-black text-amber-100 uppercase tracking-widest text-[10px] mb-1">{t.label}</h3>
                        <div className={`text-xl font-mono font-bold ${t.color}`}>{count}</div>
                        <p className="text-[8px] text-gray-500 uppercase mt-2 tracking-tighter">Records Active</p>
                    </div>
                );
            })}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-6 border-t border-white/5">
            <button 
                onClick={() => { onClose(); navigate('/admin/payment-settings'); }} 
                className="bg-orange-600 hover:bg-orange-500 border border-orange-400 text-white text-[11px] py-4 rounded-xl font-black transition-all uppercase tracking-[0.3em] shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
                <span>💳</span> Payment QR Settings
            </button>
            <button 
                onClick={() => { onClose(); navigate('/admin/dashboard'); }} 
                className="bg-gray-800 hover:bg-gray-700 border border-white/10 text-white text-[11px] py-4 rounded-xl font-black transition-all uppercase tracking-[0.3em] shadow-lg active:scale-95"
            >
                Enter Admin Command Center
            </button>
            <button 
                onClick={() => { onClose(); navigate('/admin/config'); }}
                className="w-full py-4 rounded-xl border border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 font-cinzel font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
                Advanced Configuration Panel
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default MasterToolsModal;