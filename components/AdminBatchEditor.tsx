import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';

const TABLES = ['services', 'store_items', 'config', 'image_assets', 'users', 'report_formats', 'gemstones'];

const AdminBatchEditor: React.FC = () => {
    const [targetTable, setTargetTable] = useState(TABLES[0]);
    const [jsonInput, setJsonInput] = useState('[\n  {\n    "id": "item_id_here",\n    "fields": {\n      "status": "active"\n    }\n  }\n]');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const parsedUpdates = useMemo(() => {
        try {
            const data = JSON.parse(jsonInput);
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }, [jsonInput]);

    const handleCommit = async () => {
        if (parsedUpdates.length === 0) {
            setError("Manifestation failed: Invalid JSON or empty array.");
            return;
        }

        if (!window.confirm(`Initiate Sovereign Rewrite? This will modify ${parsedUpdates.length} records in ${targetTable}.`)) {
            return;
        }

        setError(null);
        setIsProcessing(true);
        setProgress(10); // Start progress immediately
        setResults([]);

        try {
            // Fix: Remove the third argument (progress callback) as invokeBatchUpdate only accepts two arguments (table, updates)
            const finalResults = await dbService.invokeBatchUpdate(
                targetTable, 
                parsedUpdates
            );

            if (!finalResults || finalResults.length === 0) {
                throw new Error("Function returned no data. Check Edge Function logs.");
            }

            setResults(finalResults);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            
            // Check for partial failures
            const fails = finalResults.filter((r: any) => !r.result).length;
            if (fails > 0) {
                setError(`Completed with ${fails} anomalies. See ledger for details.`);
            }

        } catch (e: any) {
            console.error("Batch UI Error:", e);
            setError(`Link Severed: ${e.message || "Unknown Gateway Error"}`);
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    };

    const successCount = results.filter(r => r.result).length;
    const errorCount = results.filter(r => !r.result).length;

    return (
        <div className="min-h-screen bg-[#030308] p-4 md:p-8 font-mono text-sm text-gray-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
                    <div className="flex items-center gap-6">
                        <Link to="/admin/dashboard" className="bg-gray-900/50 p-3 rounded-xl text-amber-500 hover:text-white border border-amber-500/20 shadow-lg transition-all active:scale-90">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-cinzel font-black text-white uppercase tracking-widest leading-none">Bulk <span className="gold-gradient-text">Manifestation</span></h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.6em] mt-2 font-mono">Service-Role Proxy Protocol 3.0</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card className="p-8 bg-[#0b0c15] border-amber-500/10 shadow-2xl rounded-[2rem]">
                            <div className="mb-8">
                                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3 ml-1">Target Dimension</label>
                                <select 
                                    value={targetTable} 
                                    onChange={(e) => setTargetTable(e.target.value)}
                                    className="w-full bg-black/60 border border-gray-800 rounded-xl p-4 text-amber-400 font-bold outline-none focus:border-amber-500 transition-all shadow-inner"
                                >
                                    {TABLES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3 ml-1">
                                    <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Update Payload (JSON)</label>
                                    <span className={`text-[9px] font-bold ${parsedUpdates.length > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {parsedUpdates.length} OBJECTS READY
                                    </span>
                                </div>
                                <textarea 
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    className="w-full h-80 bg-black/80 border border-gray-800 rounded-2xl p-6 text-blue-300 font-mono text-xs focus:border-blue-500 outline-none transition-all shadow-inner leading-relaxed custom-scrollbar"
                                />
                            </div>

                            <Button 
                                onClick={handleCommit} 
                                disabled={isProcessing || parsedUpdates.length === 0}
                                className={`w-full py-6 font-black uppercase tracking-[0.4em] text-xs rounded-2xl transition-all transform active:scale-95 shadow-2xl ${isProcessing ? 'bg-gray-800 text-gray-500' : 'bg-amber-600 hover:bg-amber-500 text-black'}`}
                            >
                                {isProcessing ? 'SYNCHRONIZING...' : 'COMMIT TO VAULT'}
                            </Button>
                        </Card>

                        {error && (
                            <div className="bg-red-950/30 border border-red-500 p-4 rounded-xl text-red-400 text-xs animate-shake flex gap-3 items-center">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <strong className="block uppercase tracking-widest mb-1">Critical Error</strong>
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {isProcessing && (
                            <div className="animate-fade-in-up">
                                <ProgressBar progress={progress} message="Bypassing RLS Protections..." estimatedTime="Fast-track enabled" />
                            </div>
                        )}

                        <Card className="bg-black/40 border-gray-800 rounded-[2rem] overflow-hidden flex flex-col h-[700px]">
                            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">Operation Ledger</h3>
                                <div className="flex gap-4">
                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Success: {successCount}</span>
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">Failed: {errorCount}</span>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {results.length === 0 && !isProcessing && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                                        <span className="text-6xl mb-4 grayscale">📜</span>
                                        <p className="text-[10px] uppercase tracking-widest">Awaiting Manifestation</p>
                                    </div>
                                )}
                                
                                {results.map((res, i) => (
                                    <div key={i} className={`p-3 rounded-lg border flex justify-between items-center animate-fade-in-up ${res.result ? 'bg-green-950/10 border-green-500/20' : 'bg-red-950/10 border-red-500/20'}`} style={{ animationDelay: `${i * 10}ms` }}>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">ID: {res.id}</span>
                                            {res.status === 'not_found' && <span className="text-[9px] text-red-400 mt-1 uppercase tracking-tighter">Record not found in database</span>}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${res.result ? 'text-green-500' : 'text-red-500'}`}>
                                            {res.result ? 'SUCCESS ✅' : 'FAILED ❌'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBatchEditor;