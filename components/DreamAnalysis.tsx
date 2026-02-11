import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeDream, DreamAnalysisResponse } from '../services/aiService';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import VoiceInput from './VoiceInput';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

const generateDreamKey = (text: string): string => {
    return `dream_${text.toLowerCase().trim().split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0)}`;
};

const DreamAnalysis: React.FC = () => {
    const [dreamText, setDreamText] = useState('');
    const [result, setResult] = useState<DreamAnalysisResponse | null>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [servicePrice, setServicePrice] = useState(49);
    const [readingId, setReadingId] = useState<string | null>(null);

    const { t, language } = useTranslation();
    const { openPayment } = usePayment();
    const { db } = useDb();
    const { user } = useAuth();
    const reportRef = useRef<HTMLDivElement>(null);

    const reportImage = db.image_assets?.find((a: any) => a.id === 'report_bg_dream')?.path ||
        "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800";

    useEffect(() => {
        fetchServicePrice();
    }, []);

    const fetchServicePrice = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('price')
                .eq('name', 'Dream Analysis')
                .eq('status', 'active')
                .single();

            if (!error && data) {
                setServicePrice(data.price);
                console.log('✅ Dream Analysis price loaded:', data.price);
            }
        } catch (err) {
            console.error('Error fetching price:', err);
        }
    };

    const saveToDatabase = async (dreamData: DreamAnalysisResponse) => {
        try {
            if (!supabase) return null;

            const dreamKey = generateDreamKey(dreamText);

            const { data: reading, error: readingError } = await supabase
                .from('readings')
                .insert([{
                    user_id: user?.id || null,
                    type: 'dream-analysis',
                    title: 'Dream Interpretation',
                    subtitle: `Symbols: ${dreamData.symbols.slice(0, 3).join(', ')}`,
                    content: dreamData.meaning,
                    is_paid: isPaid,
                    meta_data: {
                        dream_key: dreamKey,
                        symbols: dreamData.symbols,
                        lucky_numbers: dreamData.luckyNumbers
                    }
                }])
                .select()
                .single();

            if (readingError) {
                console.error('❌ Reading save error:', readingError);
                return null;
            }

            const { data: cache, error: cacheError } = await supabase
                .from('dream_analysis_cache')
                .upsert([{
                    dream_key: dreamKey,
                    dream_text: dreamText,
                    symbols: dreamData.symbols,
                    emotions: dreamData.emotions || [],
                    archetypes: dreamData.archetypes || [],
                    lucky_numbers: dreamData.luckyNumbers,
                    interpretation: dreamData.meaning,
                    guidance: dreamData.guidance || '',
                    reading_id: reading.id,
                    user_id: user?.id || null,
                    is_paid: isPaid,
                    language: language
                }], { onConflict: 'dream_key' })
                .select()
                .single();

            if (cacheError) {
                console.error('❌ Cache save error:', cacheError);
            } else {
                console.log('✅ Dream cache saved:', cache);
            }

            console.log('✅ Dream reading saved:', reading.id);
            setReadingId(reading.id);
            return reading.id;

        } catch (error) {
            console.error('❌ Database save error:', error);
            return null;
        }
    };

    const savePaymentRecord = async (readId: string) => {
        try {
            const { data: txn, error: txnError } = await supabase
                .from('transactions')
                .insert([{
                    user_id: user?.id || null,
                    service_type: 'dream-analysis',
                    service_title: 'Dream Interpretation',
                    amount: servicePrice,
                    currency: 'INR',
                    status: 'success',
                    payment_method: 'upi',
                    payment_provider: 'manual',
                    reading_id: readId,
                    order_id: `DREAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    metadata: {
                        dream_preview: dreamText.substring(0, 100),
                        symbols: result?.symbols || []
                    }
                }])
                .select()
                .single();

            if (txnError) {
                console.error('❌ Transaction save error:', txnError);
            } else {
                console.log('✅ Transaction saved:', txn);

                await supabase
                    .from('readings')
                    .update({ is_paid: true })
                    .eq('id', readId);
            }

        } catch (error) {
            console.error('❌ Payment save error:', error);
        }
    };

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

    useEffect(() => {
        if (isPaid && reportRef.current) {
            setTimeout(() => {
                reportRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }, [isPaid]);

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
        setReadingId(null);

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

            await saveToDatabase(response);

        } catch (err: any) {
            clearInterval(timer);
            setError("Failed to interpret dream. The mists are too thick.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadMore = () => {
        console.log('💰 Opening payment for Dream Analysis - Price:', servicePrice);

        window.scrollTo({ top: 0, behavior: 'smooth' });

        openPayment(
            async () => {
                console.log('✅ Payment success callback triggered');

                const currentReadingId = readingId || await saveToDatabase(result!);

                if (currentReadingId) {
                    await savePaymentRecord(currentReadingId);
                    setIsPaid(true);
                    console.log('✅ Payment completed and saved');

                    setTimeout(() => {
                        if (reportRef.current) {
                            reportRef.current.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 500);
                } else {
                    console.error('❌ No reading ID available for payment');
                }
            },
            'Dream Analysis',
            servicePrice
        );
    };

    return (
        <div>
            <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('backToHome')}
            </Link>

            {/* MAIN INPUT CONTAINER */}
            <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/60 rounded-xl shadow-2xl border border-indigo-500/30 backdrop-blur-md">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-cinzel font-bold text-indigo-300 mb-2 drop-shadow-lg">Dream Interpreter</h2>
                    <p className="text-indigo-100/70 font-lora italic">Unlock the messages of your subconscious mind.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* LEFT: Input Area */}
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={dreamText}
                                onChange={(e) => setDreamText(e.target.value)}
                                placeholder="I was flying over a golden ocean..."
                                className="w-full h-64 p-4 bg-black/40 border border-indigo-500/30 rounded-lg text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none placeholder-indigo-400/30 font-lora text-lg leading-relaxed shadow-inner"
                            />
                            <div className="absolute bottom-4 right-4">
                                <VoiceInput onResult={(text) => setDreamText(prev => prev + ' ' + text)} />
                            </div>
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 border-indigo-400/50 shadow-lg"
                        >
                            {isLoading ? "Consulting the Oracle..." : "Interpret Dream"}
                        </Button>
                        {error && (
                            <p className="text-red-400 text-center text-sm bg-red-900/20 p-2 rounded border border-red-500/20 animate-shake">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* RIGHT: Results Preview */}
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

                                {!isPaid ? (
                                    <div className="relative">
                                        <div className="bg-black/40 p-4 rounded-xl border border-indigo-500/20 text-indigo-100 font-lora italic leading-relaxed text-sm relative overflow-hidden min-h-[150px]">
                                            <span className="text-3xl text-indigo-500/30 absolute top-0 left-2">"</span>
                                            {result.meaning.substring(0, 160)}...
                                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                                        </div>
                                        <div className="mt-4">
                                            <Button
                                                onClick={handleReadMore}
                                                className="w-full bg-gradient-to-r from-amber-600 to-amber-800 border-amber-500 shadow-xl py-4 font-cinzel tracking-widest hover:shadow-2xl transform hover:scale-105 transition-all"
                                            >
                                                🔓 Unlock Full Interpretation - ₹{servicePrice}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                                        <p className="text-green-400 font-bold">✅ Full Report Unlocked!</p>
                                        <p className="text-xs text-green-300 mt-1">Scroll down to read</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FULL REPORT SECTION - OUTSIDE MAIN CONTAINER */}
            {result && isPaid && (
                <div ref={reportRef} className="mt-8 animate-fade-in-up scroll-mt-24">
                    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/60 rounded-xl shadow-2xl border border-indigo-500/30 backdrop-blur-md">
                        <div className="text-center mb-8">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-indigo-500 shadow-2xl overflow-hidden">
                                <img
                                    src={cloudManager.resolveImage(reportImage)}
                                    alt="Dream Analysis"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-5xl font-cinzel font-black text-white mb-3 uppercase tracking-wider">
                                Dream Interpretation
                            </h1>
                            <p className="text-xl text-indigo-300 font-lora italic">
                                Subconscious Wisdom
                            </p>
                        </div>

                        {chartData?.luckyNumbers && (
                            <div className="mb-8 p-6 bg-amber-900/30 rounded-2xl border border-amber-500/30 text-center">
                                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest mb-4">
                                    Your Lucky Numbers
                                </h3>
                                <div className="flex justify-center gap-4">
                                    {chartData.luckyNumbers.map((n: number, i: number) => (
                                        <div
                                            key={i}
                                            className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-900 rounded-full text-white font-cinzel font-black text-2xl border-2 border-amber-400 shadow-lg"
                                        >
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.symbols && result.symbols.length > 0 && (
                            <div className="mb-8 p-6 bg-indigo-900/30 rounded-2xl border border-indigo-500/30">
                                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 text-center">
                                    Key Symbols in Your Dream
                                </h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {result.symbols.map((s: string, i: number) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-black/40 rounded-full text-indigo-200 border border-indigo-500/20 text-sm font-semibold"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {((result.emotions && result.emotions.length > 0) || (result.archetypes && result.archetypes.length > 0)) && (
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {result.emotions && result.emotions.length > 0 && (
                                    <div className="p-6 bg-purple-900/30 rounded-2xl border border-purple-500/30">
                                        <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-4">
                                            Emotional Themes
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.emotions.map((e: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-black/40 rounded-full text-purple-200 border border-purple-500/20 text-sm">
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.archetypes && result.archetypes.length > 0 && (
                                    <div className="p-6 bg-pink-900/30 rounded-2xl border border-pink-500/30">
                                        <h3 className="text-sm font-bold text-pink-300 uppercase tracking-widest mb-4">
                                            Archetypal Energies
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.archetypes.map((a: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-black/40 rounded-full text-pink-200 border border-pink-500/20 text-sm">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-black/20 rounded-2xl p-8 border border-indigo-500/20">
                            <FullReport
                                reading={result.meaning}
                                category="dream-analysis"
                                title="Dream Interpretation"
                                subtitle="Subconscious Wisdom"
                                imageUrl={cloudManager.resolveImage(reportImage)}
                                chartData={chartData}
                            />
                        </div>

                        {result.guidance && (
                            <div className="mt-8 p-8 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl border-2 border-purple-500/30">
                                <h3 className="text-2xl font-cinzel font-black text-purple-300 mb-4 text-center">
                                    ✨ Practical Guidance
                                </h3>
                                <p className="text-purple-100 font-lora leading-relaxed text-center text-lg">
                                    {result.guidance}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DreamAnalysis;
