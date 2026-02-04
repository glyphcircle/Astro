import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeDream, DreamAnalysisResponse } from '../services/geminiService';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import VoiceInput from './VoiceInput';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';

const DreamAnalysis: React.FC = () => {
  const [dreamText, setDreamText] = useState('');
  const [result, setResult] = useState<DreamAnalysisResponse | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { db } = useDb();

  // Dynamic Image
  const reportImage = db.image_assets?.find((a: any) => a.id === 'report_bg_dream')?.path || "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800";

  // 🔑 Auto-trigger PDF logic
  useEffect(() => {
    const flag = sessionStorage.getItem('autoDownloadPDF');
    if (flag && isPaid && result) {
      sessionStorage.removeItem('autoDownloadPDF');
      console.log('🚀 Auto-triggering PDF for Dream Analysis...');
      setTimeout(() => {
        const btn = document.querySelector('[data-report-download="true"]') as HTMLButtonElement | null;
        btn?.click();
      }, 1500);
    }
  }, [isPaid, result]);

  const handleAnalyze = async () => {
    if (!dreamText.trim() || dreamText.length < 5) {
        setError('Please describe your dream in more detail.');
        return;
    }

    setIsLoading(true);
    setProgress(0);
    setError('');
    setResult(null);
    setChartData(null);
    setIsPaid(false);

    const timer = setInterval(() => setProgress(p => (p >= 90 ? p : p + 5)), 200);

    try {
        const response = await analyzeDream(dreamText, language);
        clearInterval(timer);
        setProgress(100);
        setResult(response);

        setChartData({
            luckyNumbers: response.luckyNumbers,
            vedicMetrics: [
                { label: 'Sattva (Purity)', sub: 'Clarity', value: Math.floor(Math.random() * 30 + 60) },
                { label: 'Rajas (Passion)', sub: 'Action', value: Math.floor(Math.random() * 40 + 30) },
                { label: 'Tamas (Inertia)', sub: 'Subconscious', value: Math.floor(Math.random() * 40 + 20) },
            ],
            elementalBalance: [
                { element: 'Ether', sanskrit: 'Akasha', score: Math.floor(Math.random() * 50 + 50) },
                { element: 'Water', sanskrit: 'Jala', score: Math.floor(Math.random() * 50 + 30) },
                { element: 'Fire', sanskrit: 'Agni', score: Math.floor(Math.random() * 50 + 20) },
                { element: 'Air', sanskrit: 'Vayu', score: Math.floor(Math.random() * 50 + 40) },
            ]
        });

    } catch (err: any) {
        clearInterval(timer);
        setError("Failed to interpret dream. The mists are too thick.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleReadMore = () => openPayment(() => setIsPaid(true));

  return (
    <div>
        <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('backToHome')}
        </Link>

        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/60 rounded-xl shadow-2xl border border-indigo-500/30 backdrop-blur-md">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-cinzel font-bold text-indigo-300 mb-2 drop-shadow-lg">Dream Interpreter</h2>
                <p className="text-indigo-100/70 font-lora italic">Unlock the messages of your subconscious mind.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <div className="relative">
                        <textarea value={dreamText} onChange={(e) => setDreamText(e.target.value)} placeholder="I was flying over a golden ocean..." className="w-full h-64 p-4 bg-black/40 border border-indigo-500/30 rounded-lg text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none placeholder-indigo-400/30 font-lora text-lg leading-relaxed shadow-inner" />
                        <div className="absolute bottom-4 right-4"><VoiceInput onResult={(text) => setDreamText(prev => prev + ' ' + text)} /></div>
                    </div>
                    <Button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 border-indigo-400/50 shadow-lg">
                        {isLoading ? "Consulting the Oracle..." : "Interpret Dream"}
                    </Button>
                    {error && <p className="text-red-400 text-center text-sm bg-red-900/20 p-2 rounded border border-red-500/20 animate-shake">{error}</p>}
                </div>

                <div className="min-h-[20rem] bg-black/20 rounded-lg border border-indigo-500/20 p-6 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                            <ProgressBar progress={progress} message="Decoding Symbols..." />
                        </div>
                    )}
                    {!result && !isLoading && (
                        <div className="flex-grow flex flex-col items-center justify-center text-indigo-300/40 text-center">
                            <span className="text-7xl mb-4 animate-float opacity-50">🌙</span>
                            <p className="font-lora italic">Describe your dream to reveal its hidden meaning and cosmic frequencies.</p>
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/30 shadow-lg">
                                    <h4 className="text-[10px] text-indigo-300 uppercase tracking-widest mb-3 font-bold">Key Symbols</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.symbols.map((s, i) => (
                                            <span key={i} className="text-[10px] bg-black/40 px-2 py-1 rounded-full text-indigo-200 border border-indigo-500/20">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-amber-900/20 p-3 rounded-xl border border-amber-500/30 text-center shadow-lg group">
                                    <h4 className="text-[10px] text-amber-300 uppercase tracking-widest mb-3 font-bold">Luck Frequencies</h4>
                                    <div className="flex justify-center gap-2">
                                        {result.luckyNumbers.map((n, i) => (
                                            <div key={i} className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-900 rounded-full text-white font-cinzel font-black border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] transform group-hover:scale-110 transition-transform">
                                                {n}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                {!isPaid ? (
                                    <div className="flex flex-col h-full">
                                        <div className="bg-black/40 p-4 rounded-xl border border-indigo-500/20 text-indigo-100 font-lora italic leading-relaxed text-sm relative overflow-hidden flex-grow">
                                            <span className="text-3xl text-indigo-500/30 absolute top-0 left-2">"</span>
                                            {result.meaning.substring(0, 160)}...
                                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                                        </div>
                                        <div className="mt-4">
                                            <Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-amber-800 border-amber-500 shadow-xl py-4 font-cinzel tracking-widest">
                                                Unlock Full Interpretation
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-h-[30rem] overflow-y-auto custom-scrollbar pr-2">
                                        <FullReport 
                                            reading={result.meaning} 
                                            category="dream-analysis"
                                            title="Dream Interpretation" 
                                            subtitle="Subconscious Wisdom" 
                                            imageUrl={cloudManager.resolveImage(reportImage)} 
                                            chartData={chartData} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default DreamAnalysis;