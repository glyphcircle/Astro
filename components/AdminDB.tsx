import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Card from './shared/Card';
import Modal from './shared/Modal';
import { toDriveEmbedUrl } from '../drive';

const AdminDB: React.FC = () => {
    const { table } = useParams<{ table: string }>();
    const { db, refreshTable, updateEntry, createEntry, deleteEntry, toggleStatus } = useDb();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const tableName = table || 'services';
    const data = db[tableName] || [];

    // 🔒 READ-ONLY FIELDS (never editable)
    const SYSTEM_FIELDS = ['id', 'created_at', 'updated_at'];

    useEffect(() => {
        console.log('📂 [AdminDB] Syncing Registry:', tableName);
        refreshTable(tableName);
    }, [tableName, refreshTable]);

    const headers = useMemo(() => {
        if (tableName === 'services') {
            return ['name', 'price', 'description', 'path', 'image', 'status'];
        }
        let rawHeaders = data.length > 0 ? Object.keys(data[0]).filter(h => h !== 'id' && h !== 'status') : [];
        return rawHeaders.filter(h => !SYSTEM_FIELDS.includes(h));
    }, [data, tableName]);

    const openCreateModal = () => {
        const initialForm: Record<string, any> = {};
        const formFields = tableName === 'services'
            ? ['id', 'name', 'price', 'description', 'status', 'path', 'image']
            : data.length > 0 ? Object.keys(data[0]) : ['id', 'name'];

        formFields.forEach(header => {
            if (!SYSTEM_FIELDS.includes(header)) {
                if (header === 'price' || header === 'stock') {
                    initialForm[header] = 0;
                } else if (header === 'status') {
                    initialForm[header] = 'active';
                } else {
                    initialForm[header] = '';
                }
            }
        });

        setFormData(initialForm);
        setIsNewRecord(true);
        setStatus('idle');
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record: any) => {
        console.log(`🛠️ [UI] Inspecting artifact: ${record.id}`)
        // Copy ALL fields (don't filter yet)
        setFormData({ ...record });
        setIsNewRecord(false);
        setStatus('idle');
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm(`Permanently delete artifact "${id}"?`)) return;

        try {
            await deleteEntry(tableName, id);
            refreshTable(tableName);
        } catch (err: any) {
            alert(`Purge failed: ${err.message}`);
        }
    };

    const handleCommit = async () => {
        console.log('📡 [UI] Initiating Cloud Synchronization...');
        setStatus('saving');
        setErrorMsg(null);
        
        const recordId = formData.id;
        const payload = { ...formData };
        
        // ONLY remove system fields
        SYSTEM_FIELDS.forEach(field => delete payload[field]);
        
        console.log('💾 [UI] Payload before submit:', payload);

        try {
            let result;
            if (isNewRecord) {
                console.log('🆕 [UI] Creating new entry...');
                result = await createEntry(tableName, payload);
                console.log('✅ [UI] Create successful!', result);
            } else {
                if (!recordId) throw new Error('IDENTIFICATION_ERROR: Cannot modify artifact without valid id.');
                console.log(`📡 [UI] Update for ID: ${recordId}`)
                result = await updateEntry(tableName, recordId, payload);
                console.log('✅ [UI] Update result:', result);
                
                // VERIFY update actually happened - check for empty array return
                // result might be an object or an array depending on implementation, 
                // robust check covers both.
                if (!result || (Array.isArray(result) && result.length === 0)) {
                    throw new Error('UPDATE_ABORTED: Server returned empty record set. Verify RLS policies or permissions.');
                }
            }

            setStatus('success');
            
            // Wait longer before closing to allow user to see success
            setTimeout(() => {
                setIsModalOpen(false);
                setStatus('idle');
                refreshTable(tableName);
            }, 1500);

        } catch (err: any) {
            console.error('💥 [UI] Commit failed:', err);
            setStatus('error');
            setErrorMsg(err.message || 'Celestial Link Failed: Update rejected by server.');

            setTimeout(() => {
                setStatus('idle');
                setErrorMsg(null);
            }, 5000);
        }
    };

    return (
        <div className="min-h-screen bg-[#020205] pt-32 p-4 md:p-8 md:pt-40 font-mono text-gray-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/admin/dashboard"
                            className="bg-gray-900 px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all text-[11px] font-bold tracking-widest text-amber-500 shadow-xl flex items-center gap-2"
                        >
                            <span>←</span>
                            <span>DASHBOARD</span>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-cinzel font-black text-white uppercase tracking-widest">{tableName}</h1>
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.5em] font-bold">Active Registry Entries</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-grow lg:w-80">
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full bg-black/60 border border-white/10 rounded-full px-6 py-3 text-sm text-white outline-none focus:border-amber-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-amber-600 hover:bg-amber-500 text-black font-black px-8 py-3 rounded-full text-[11px] uppercase tracking-widest transition-all shadow-2xl"
                        >
                            + NEW ENTRY
                        </button>
                    </div>
                </div>

                {/* Table */}
                <Card className="bg-black/40 border-white/5 overflow-hidden rounded-[2rem] shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-black border-b border-white/5">
                                <tr>
                                    {headers.map(h => (
                                        <th key={h} className="p-6">{h}</th>
                                    ))}
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data
                                    .filter((r: any) => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((row: any) => (
                                        <tr key={row.id} className="hover:bg-amber-500/[0.03] transition-colors group">
                                            {headers.map(h => {
                                                const val = row[h];
                                                const isImageField = ['image', 'image_url', 'logo_url'].includes(h);
                                                const isStatusField = h === 'status';

                                                return (
                                                    <td key={h} className="p-6 text-[12px] truncate max-w-[200px] font-mono font-medium text-gray-400">
                                                        {isImageField && val ? (
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={toDriveEmbedUrl(String(val))}
                                                                    alt="icon"
                                                                    className="w-8 h-8 rounded object-cover border border-white/10"
                                                                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/black/amber?text=?')}
                                                                />
                                                            </div>
                                                        ) : isStatusField ? (
                                                            <button
                                                                onClick={() => toggleStatus(tableName, row.id)}
                                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${val === 'active'
                                                                    ? 'bg-green-900/20 text-green-400 border-green-500/30'
                                                                    : 'bg-red-900/20 text-red-400 border-red-500/30'
                                                                    }`}
                                                            >
                                                                {val}
                                                            </button>
                                                        ) : (
                                                            String(val ?? '-')
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-6 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => openEditModal(row)}
                                                        className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/30 px-5 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all"
                                                    >
                                                        Modify
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        className="bg-red-500/5 hover:bg-red-600 text-red-500/60 hover:text-white border border-red-500/10 px-5 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all"
                                                    >
                                                        Purge
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal */}
            <Modal
                isVisible={isModalOpen}
                onClose={() => {
                    console.log('🚪 [UI] Modal onClose triggered, resetting all states');
                    setIsModalOpen(false);
                    setStatus('idle');
                    setErrorMsg(null);
                }}
            >
                <div className="p-10 bg-[#0a0a14] rounded-[2.4rem] border border-amber-500/20 w-full max-w-lg relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)]">
                    <div className="mb-10">
                        <h3 className="text-3xl font-cinzel font-black text-white tracking-[0.1em] uppercase mb-1">
                            {isNewRecord ? 'NEW ARTIFACT' : 'MODIFY RECORD'}
                        </h3>
                        <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.5em] font-bold">Secure Registry Authorization</p>
                    </div>

                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                        {Object.keys(formData)
                            .filter(k => !SYSTEM_FIELDS.includes(k))
                            .map(key => (
                                <div key={key} className="space-y-2">
                                    <label className="block text-[10px] text-gray-500 uppercase font-black ml-1 tracking-[0.2em]">{key}</label>
                                    {key === 'status' ? (
                                        <select
                                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500"
                                            value={formData[key]}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        >
                                            <option value="active">active</option>
                                            <option value="inactive">inactive</option>
                                        </select>
                                    ) : ['image', 'image_url', 'logo_url'].includes(key) ? (
                                        <textarea
                                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500 font-mono min-h-[100px] resize-y"
                                            value={formData[key] ?? ''}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                            placeholder="Full Google Drive URL (https://drive.google.com/file/d/...)"
                                        />
                                    ) : (
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500 font-mono"
                                            value={formData[key] ?? ''}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                            placeholder={`Enter ${key}...`}
                                            type={key.includes('price') || key.includes('stock') ? 'number' : 'text'}
                                        />
                                    )}
                                </div>
                            ))}
                            
                        {/* 🔒 Primary Key Read Only Section */}
                        {!isNewRecord && formData.id && (
                          <div className="pt-4 border-t border-white/5 opacity-40">
                            <label className="block text-[9px] text-gray-500 uppercase font-black ml-1 tracking-[0.2em]">
                              Primary Identifier (Read Only)
                            </label>
                            <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-gray-400 text-xs font-mono cursor-not-allowed">
                              {formData.id}
                            </div>
                          </div>
                        )}
                    </div>

                    {errorMsg && (
                        <div className="mt-8 p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-400 text-[10px] text-center uppercase tracking-widest">
                            {errorMsg}
                        </div>
                    )}

                    <div className="mt-12">
                        <button
                            onClick={handleCommit}
                            disabled={status === 'saving'}
                            className={`w-full py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl ${status === 'saving'
                                ? 'bg-gray-800 text-gray-500 cursor-wait'
                                : status === 'error'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-amber-600 hover:bg-amber-500 text-black'
                                }`}
                        >
                            {status === 'saving'
                                ? '⏳ SYNCING VAULT...'
                                : status === 'error'
                                    ? '❌ SYNC FAILED'
                                    : 'COMMIT TO VAULT'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDB;