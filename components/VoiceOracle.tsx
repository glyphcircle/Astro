import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './shared/Card';
import VoiceInput from './VoiceInput';
import Button from './shared/Button';
import { createSageSession } from '../services/geminiService';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { ACTION_POINTS } from '../services/gamificationConfig';

const WISDOM_CATEGORIES = [
    { id: 'karma', label: 'Karmic Debt', icon: '🌀', prompt: 'Focus on my past actions and future consequences.' },
    { id: 'wealth', label: 'Artha (Wealth)', icon: '🪙', prompt: 'Focus on my material proosperity and career path.' },
    { id: 'vitality', label: 'Prana (Health)', icon: '🌿', prompt: 'Focus on my physical energy and ayurvedic balance.' },
    { id: 'love', label: 'Kama (Desire)', icon: '❤️', prompt: 'Focus on my emotional bondssand heart-center.' }
];

const VoiceOracle: React.FC = () => {
  const { t } = useTranslation();
  const { awardKarma, saveReading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<{sender: 'user' | 'oracle', text: string}[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const DEFAULT_LOGO = 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO';

  useEffect(() => {
      initSession();
  }, []);

  const initSession = (categoryPrompt: string = "") => {
      try {
          const systemInstruction = `You are Sage Vashishtha, an ancient Vedic master.    
          Your tone is profound, mystical, yet compassionate. Use metaphors of stars, prana, and dharma.
          Keep responses concise (under 60 words). ${categoryPrompt}`;
          const s = createSageSession(systemInstruction, "Voice");
          setSession(s);
      } catch (e) {
          console.error("Sage connection failed:", e);
      }
  };

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, isProcessing]);

  const speak = (text: string) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.7; // Deeper, more sage-like
      utterance.rate = 0.85; // Slower, more deliberate
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
  };

  const handleInput = async (text: string) => {
      if (!text.trim()) return;
      setHistory(prev => [...prev, { sender: 'user', text }]);
      setIsProcessing(true);

      try {
          if (session) {
              const res = await session.sendMessage({ message: text });
              const reply = res.text || "The mists of time obscure my vision. Ask again, Seeker.";
              setHistory(prev => [...prev, { sender: 'oracle', text: reply }]);
              speak(reply);
              awardKarma(ACTION_POINTS.READING_COMPLETE / 4);
          }
      } catch (e) {
          setHistory(prev => [...prev, { sender: 'oracle', text: "The cosmic link is unstable. Recenter your energy." }]);
      } finally {
          setIsProcessing(false);
      }
  };

  const selectCategory = (cat: typeof WISDOM_CATEGORIES[0]) => {
      setActiveCategory(cat.id);
      setHistory([{ sender: 'oracle', text: `Energy redirected to ${cat.label}. How may I guide your journey?` }]);
      initSession(cat.prompt);
  };

  const handleManifestDecree = () => {
      if (history.length < 2) return;

      const fullTranscript = history.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
      saveReading({
          type: 'remedy',
          title: "Voice Oracle Transcript",
          subtitle: activeCategory ? `${activeCategory.toUpperCase()} Focus` : "General Guidance",
          content: fullTranscript,
          image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800"
      });
      alert("Decree manifested in your History.");
      navigate('/history');
  };

  return (
    <div className="relative min-h-screen bg-skin-base pt-12 pb-32 overflow-hidden transition-colors duration-500">
        {/* 🌌 ATMOSPHERIC LAYER */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15)_0%,transparent_50%)]"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-blue-900/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
            <header className="flex flex-col items-center text-center mb-12">
                <Link to="/home" className="inline-flex items-center text-skin-text opacity-40 hover:opacity-100 hover:text-skin-accent transition-all mb-8 group">
                    <span className="text-2xl mr-3 group-hover:-translate-x-2 transition-transform">←</span>
                    <span className="font-cinzel font-black uppercase tracking-widest text-[10px]">Exit Sanctuary</span>
                </Link>

                {/* 🌟 IMPERIAL SEAL HEADER */}
                <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border-[3px] border-dashed border-skin-accent/20 rounded-full animate-[spin_120s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-skin-accent/10 rounded-full animate-[spin_80s_linear_infinite_reverse]"></div>

                    {/* Pulsing Aura */}
                    <div className={`absolute inset-[-30px] rounded-full blur-3xl transition-all duration-1000 ${isSpeaking ? 'bg-skin-accent/20 scale-110 opacity-80' : 'bg-blue-500/10 scale-100 opacity-40'}`}></div>

                    {/* The Sage Mirror */}
                    <div className={`w-40 h-40 bg-black rounded-full border-[6px] border-skin-accent shadow-[0_0_60px_rgba(245,158,11,0.4)] flex items-center justify-center overflow-hidden transform transition-all duration-700 ${isSpeaking ? 'scale-110' : 'hover:scale-105'}`}>
                         <div className="p-8 relative">
                             {isSpeaking && (
                                 <div className="absolute inset-0 bg-skin-accent/10 animate-ping rounded-full"></div>
                             )}
                             <img src={DEFAULT_LOGO} alt="Seal" className={`w-full h-full object-contain brightness-125 ${isSpeaking ? 'animate-pulse' : ''}`} />
                         </div>
                    </div>
                </div>

                <h1 className="text-6xl md:text-7xl font-cinzel font-black text-skin-text uppercase tracking-tighter mb-4 drop-shadow-2xl">
                    Voice <span className="gold-gradient-text">Oracle</span>
                </h1>
                <div className="flex items-center gap-6 mb-12">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-skin-accent/40"></div>
                    <p className="text-skin-text opacity-60 font-lora italic text-lg uppercase tracking-[0.2em]">The Sage is Listening</p>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-skin-accent/40"></div>
                </div>

                {/* WISDOM SPHERES (Categories) */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {WISDOM_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => selectCategory(cat)}
                            className={`px-6 py-3 rounded-full border transition-all flex items-center gap-3 active:scale-95 ${activeCategory === cat.id ? 'bg-skin-accent border-skin-accent text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-skin-surface/40 border-skin-border/20 text-skin-text opacity-60 hover:opacity-100 hover:border-skin-accent/50'}`}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* 🛡️ THE SACRED INTERACTION BOUNDARY */}
            <div className="sacred-boundary rounded-[3rem] bg-skin-surface/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">

                {/* Chat Records Container */}
                <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar">
                    {history.length === 0 && !isProcessing && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                            <div className="text-8xl mb-8 animate-float">🐚</div>
                            <h3 className="text-2xl font-cinzel font-bold text-skin-text uppercase tracking-widest">Invoke the Oracle</h3>
                            <p className="max-w-xs mt-4 text-sm font-lora italic">"Speak your query into the cosmic void. The Sage shall manifest the truth in vibration."</p>      
                        </div>
                    )}

                    {history.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`relative max-w-[85%] md:max-w-[70%] p-6 rounded-3xl shadow-2xl border transition-all ${
                                msg.sender === 'user'
                                ? 'bg-gradient-to-br from-amber-600 to-amber-900 border-skin-accent/50 text-white rounded-tr-none'
                                : 'bg-[#fffcf0] text-[#2d0a18] border-amber-900/10 rounded-tl-none font-lora italic'
                            }`}>
                                {/* Message Decoration */}
                                {msg.sender === 'oracle' && (
                                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-black rounded-full border border-skin-accent/30 flex items-center justify-center text-xs">
                                        🕉️
                                    </div>
                                )}

                                <p className={`text-lg md:text-xl leading-relaxed ${msg.sender === 'user' ? 'font-bold' : 'font-medium'}`}>
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-skin-surface/20 border border-skin-border/10 p-6 rounded-3xl rounded-tl-none flex gap-3 items-center">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-skin-accent rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-skin-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-skin-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-skin-accent opacity-60">Consulting Akasha</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Interaction Dock */}
                <div className="p-8 border-t border-skin-border/10 bg-skin-surface/60 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-8">
                        <div className="relative group">
                            <div className={`absolute inset-[-20px] rounded-full blur-2xl transition-all duration-500 ${isSpeaking ? 'bg-red-500/20' : 'bg-skin-accent/20 group-hover:bg-skin-accent/40'}`}></div>
                            <VoiceInput onResult={handleInput} className="scale-[2.5] relative z-10" />
                        </div>
                        <p className="text-[10px] text-skin-accent opacity-40 font-black uppercase tracking-[0.5em] animate-pulse">
                            {isSpeaking ? 'The Sage is Speaking' : 'Touch to Transmit Voice'}
                        </p>

                        {history.length >= 2 && (
                            <div className="pt-4 border-t border-skin-border/10 w-full flex justify-center">
                                <button
                                    onClick={handleManifestDecree}
                                    className="px-8 py-3 bg-skin-surface border border-skin-border text-skin-accent text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-skin-accent hover:text-black transition-all active:scale-95"
                                >
                                    📜 Manifest Imperial Decree
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Boundary Accents */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-10">   
                    <span className="text-6xl font-cinzel">ॐ</span>
                </div>
            </div>

            {/* Footer Cryptography */}
            <div className="mt-12 text-center">
                <p className="text-[8px] font-mono text-gray-700 uppercase tracking-[0.6em]">
                    End-to-End Spiritual Encryption • Node: {Math.random().toString(36).substring(2, 12).toUpperCase()}
                </p>
            </div>
        </div>
    </div>
  );
};

export default VoiceOracle;