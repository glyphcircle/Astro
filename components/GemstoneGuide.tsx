
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import Modal from './shared/Modal';
import { useDb } from '../hooks/useDb';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import { getGemstoneGuidance, generateMantraAudio } from '../services/geminiService';
import { SmartDatePicker } from './SmartAstroInputs';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { cloudManager } from '../services/cloudManager';
import OptimizedImage from './shared/OptimizedImage';

const GemstoneGuide: React.FC = () => {
  const { db } = useDb();
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { saveReading, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'oracle' | 'library'>('oracle');
  const [libraryFilter, setLibraryFilter] = useState<string | null>(null);
  const [selectedGem, setSelectedGem] = useState<any | null>(null);

  // Refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const libraryTopRef = useRef<HTMLDivElement>(null);

  // Oracle State
  const [formData, setFormData] = useState({ name: '', dob: '', intent: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isAdmin = user && ['master@glyphcircle.com', 'admin@glyphcircle.com'].includes(user.email);

  const serviceConfig = db.services?.find((s: any) => s.id === 'gemstones');
  const servicePrice = serviceConfig?.price || 49;

  useEffect(() => {
    const cached = localStorage.getItem('glyph_user_details');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFormData(prev => ({ ...prev, name: parsed.name || '', dob: parsed.dob || '' }));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    return () => {
        if (audioSourceRef.current) audioSourceRef.current.stop();
        if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const handleListenMantra = async () => {
    if (!result?.mantra?.sanskrit || isSpeaking || isAudioLoading) return;
    
    setIsAudioLoading(true);
    setError('');

    try {
        // 1. Initialize Context on User Gesture
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioCtx = audioCtxRef.current;
        
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        // 2. Fetch High-Quality Spoken Mantra
        const audioBuffer = await generateMantraAudio(result.mantra.sanskrit);

        // 3. Playback
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        
        source.onended = () => {
            setIsSpeaking(false);
            audioSourceRef.current = null;
        };

        source.start();
        audioSourceRef.current = source;
        setIsSpeaking(true);
    } catch (e) {
        console.error("Audio playback error:", e);
        setError("The Oracle's voice is distant. Please check your connection.");
    } finally {
        setIsAudioLoading(false);
    }
  };

  const stopMantra = () => {
      if (audioSourceRef.current) {
          audioSourceRef.current.stop();
          audioSourceRef.current = null;
          setIsSpeaking(false);
      }
  };

  const handleConsultOracle = async () => {
      if (!formData.name || !formData.dob || !formData.intent) {
          setError('Please complete all fields.');
          return;
      }
      localStorage.setItem('glyph_user_details', JSON.stringify({ name: formData.name, dob: formData.dob }));

      setIsLoading(true);
      setProgress(0);
      setResult(null);
      setError('');
      setIsPaid(false);

      const timer = setInterval(() => setProgress(p => (p >= 90 ? p : p + 5)), 250);

      try {
          const apiResult = await getGemstoneGuidance(formData.name, formData.dob, formData.intent, language === 'hi' ? 'Hindi' : 'English');
          clearInterval(timer);
          setProgress(100);
          setResult(apiResult);

          saveReading({
              type: 'astrology',
              title: `Gemstone for ${formData.intent}`,
              content: apiResult.fullReading,
              subtitle: apiResult.primaryGem.name,
              image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=400"
          });
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
      } catch (err: any) {
          clearInterval(timer);
          setError(err.message || "The oracle is silent.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
            <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('backToHome')}
            </Link>

            <div className="text-center mb-8">
                <h1 className="text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-2">
                    Crystal Oracle & Mantra Guide
                </h1>
                <p className="text-amber-100/60 font-lora">Discover your power stone and sacred sound vibration.</p>
            </div>

            <div className="flex justify-center mb-10">
                <div className="bg-gray-900/80 p-1 rounded-full border border-amber-500/30 flex">
                    <button onClick={() => { setActiveTab('oracle'); setLibraryFilter(null); }} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'oracle' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>🔮 Personal Reading</button>
                    <button onClick={() => { setActiveTab('library'); setLibraryFilter(null); }} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>📚 Stone Library</button>
                </div>
            </div>

            {activeTab === 'oracle' && (
                <div className="flex flex-col gap-12 items-center">
                    {!result && (
                    <div className="w-full max-w-xl">
                        <Card className="p-8 border-l-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] bg-gray-900/80 backdrop-blur-xl">
                            <h3 className="text-xl font-bold text-emerald-300 mb-6 font-cinzel text-center border-b border-gray-700 pb-4">Consult the Oracle</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase mb-1 font-bold tracking-wider">Your Name</label>
                                    <input 
                                        ref={nameInputRef}
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                        className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white focus:border-emerald-500 transition-all placeholder-gray-600" 
                                        placeholder="Enter full name" 
                                    />
                                </div>
                                <div>
                                    <SmartDatePicker value={formData.dob} onChange={(d) => setFormData({...formData, dob: d})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase mb-1 font-bold tracking-wider">What do you seek?</label>
                                    <textarea 
                                        value={formData.intent} 
                                        onChange={(e) => setFormData({...formData, intent: e.target.value})} 
                                        className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white focus:border-emerald-500 h-24 resize-none transition-all placeholder-gray-600" 
                                        placeholder="e.g. Wealth, Health, Harmony..." 
                                    />
                                </div>
                                <Button onClick={handleConsultOracle} disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 shadow-lg py-4 text-lg font-cinzel">
                                    {isLoading ? "Channeling Energies..." : "Reveal My Gemstone"}
                                </Button>
                                {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-500/20 animate-pulse">{error}</p>}
                            </div>
                        </Card>
                    </div>
                    )}

                    <div ref={resultRef} className="w-full max-w-5xl min-h-[200px]">
                        {isLoading && <div className="mt-8 max-w-md mx-auto"><ProgressBar progress={progress} message="Analyzing Planetary Alignments..." /></div>}
                        
                        {result && !isLoading && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-gray-900 to-black border border-emerald-500/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl group">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-xs text-emerald-400 uppercase tracking-[0.2em] font-bold">Recommended Gemstone</h4>
                                            <span className="text-4xl">💍</span>
                                        </div>
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 shadow-[0_0_20px_rgba(16,185,129,0.4)] border-2 border-white/20 flex-shrink-0 animate-pulse-glow"></div>
                                            <div>
                                                <h2 className="text-3xl md:text-4xl font-cinzel font-black text-white leading-tight">{result.primaryGem.name}</h2>
                                                <p className="text-emerald-200 text-lg italic font-serif">{result.primaryGem.sanskritName}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 font-lora">
                                            <p><strong className="text-emerald-400 block text-xs uppercase mb-1 font-sans tracking-wider">Why this stone?</strong> {result.primaryGem.reason}</p>
                                            <p><strong className="text-emerald-400 block text-xs uppercase mb-1 font-sans tracking-wider">Wearing Method</strong> {result.primaryGem.wearingMethod}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-xs text-purple-400 uppercase tracking-[0.2em] font-bold">Sacred Mantra</h4>
                                                <span className="text-4xl">🕉️</span>
                                            </div>
                                            <div className="text-center my-8">
                                                <p className="text-3xl md:text-4xl font-bold text-amber-100 font-cinzel drop-shadow-md leading-relaxed py-2">{result.mantra.sanskrit}</p>
                                                <p className="text-base text-gray-400 mt-2 italic font-lora">"{result.mantra.pronunciation}"</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <button 
                                                onClick={isSpeaking ? stopMantra : handleListenMantra}
                                                disabled={isAudioLoading}
                                                className={`px-6 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border ${isSpeaking ? 'bg-red-900/40 border-red-500/50 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-purple-900/30 hover:bg-purple-800/50 border-purple-500/30 text-purple-200'}`}
                                            >
                                                {isAudioLoading ? (
                                                    <><span className="w-4 h-4 border-2 border-purple-200 border-t-transparent rounded-full animate-spin"></span> Connecting...</>
                                                ) : (
                                                    <span>{isSpeaking ? '⏹️ Stop' : '🔊 Listen'}</span>
                                                )}
                                            </button>
                                        </div>
                                        {error && <p className="text-[10px] text-red-400 text-center mt-2 font-mono uppercase tracking-tighter">{error}</p>}
                                    </div>
                                </div>

                                <div className="w-full">
                                    {!isPaid ? (
                                        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-amber-500/30 p-8 text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-cinzel font-bold text-amber-200 mb-4">Unlock Complete Vedic Analysis</h3>
                                                <div className="grid md:grid-cols-2 gap-4 text-left max-w-xl mx-auto mb-8 text-sm text-gray-300">
                                                    <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Detailed Planetary Positions</div>
                                                    <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Prana Pratishtha Rituals</div>
                                                    <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Lifetime Prediction</div>
                                                    <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Metal & Day Selection</div>
                                                    <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Diet Restrictions</div>
                                                    <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Downloadable PDF</div>
                                                </div>
                                                <Button onClick={() => openPayment(() => setIsPaid(true), 'Gemstone Report', servicePrice)} className="px-12 py-4 text-lg bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 shadow-xl border-amber-400/50">Read More (Payment Required)</Button>
                                                {isAdmin && <button onClick={() => setIsPaid(true)} className="block mx-auto mt-4 text-xs text-amber-500 underline opacity-50 hover:opacity-100">Admin Bypass</button>}
                                            </div>
                                        </Card>
                                    ) : (
                                        <FullReport reading={result.fullReading} title="Gemstone & Mantra Report" subtitle="Vedic Remedial Measures" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'library' && (
                <div ref={libraryTopRef}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                        {(db.gemstones || []).map((gem: any) => (
                            <div key={gem.id} onClick={() => setSelectedGem(gem)} className="group bg-gray-900 border border-gray-700 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 shadow-md">
                                <div className="h-40 bg-gray-800 relative">
                                    <OptimizedImage src={gem.image} alt={gem.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" containerClassName="w-full h-full" />
                                    <div className="absolute bottom-3 left-3"><span className="text-white font-bold font-cinzel text-lg block leading-none">{gem.name}</span><span className="text-amber-400 text-[10px] uppercase font-bold tracking-widest">{gem.planet}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedGem && (
                        <Modal isVisible={!!selectedGem} onClose={() => setSelectedGem(null)}>
                            <div className="p-6 bg-gray-900 text-amber-50">
                                <h2 className="text-3xl font-bold text-white font-cinzel mb-2">{selectedGem.name}</h2>
                                <p className="text-amber-400 font-bold uppercase text-xs mb-4">{selectedGem.planet}</p>
                                <div className="space-y-4 text-sm">
                                    <p><strong className="text-amber-500">Sanskrit:</strong> {selectedGem.sanskrit}</p>
                                    <p><strong className="text-amber-500">Benefits:</strong> {selectedGem.benefits}</p>
                                    <div className="bg-black/40 p-4 rounded border border-purple-500/30">
                                        <p className="text-purple-300 font-bold mb-1">Sacred Mantra</p>
                                        <p className="text-lg font-cinzel">{selectedGem.mantra}</p>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default GemstoneGuide;

