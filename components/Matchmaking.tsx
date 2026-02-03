import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { SmartDatePicker } from './SmartAstroInputs';

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const Matchmaking: React.FC = () => {
  const { t } = useTranslation();
  const [boyName, setBoyName] = useState('');
  const [girlName, setGirlName] = useState('');
  const [boyNak, setBoyNak] = useState(NAKSHATRAS[0]);
  const [girlNak, setGirlNak] = useState(NAKSHATRAS[0]);
  const [boyDob, setBoyDob] = useState('');
  const [girlDob, setGirlDob] = useState('');

  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Calculating Gunas...');

  const calculateCompatibility = () => {
      setIsLoading(true); setProgress(0); setScore(null);
      setStatusMessage('Aligning Planetary Positions...');
      const timer = setInterval(() => setProgress(prev => prev >= 90 ? prev : prev + 10), 300);
      setTimeout(() => {
          clearInterval(timer); setProgress(100);
          const boyDobVal = boyDob ? new Date(boyDob).getTime() : 0;
          const girlDobVal = girlDob ? new Date(girlDob).getTime() : 0;
          const seed = boyName.length + girlName.length + NAKSHATRAS.indexOf(boyNak) + (boyDobVal % 100);
          setScore(12 + (seed % 25));
          setIsLoading(false);
      }, 3000);
  };

  const getVerdict = (s: number) => {
      if (s >= 28) return { text: "Excellent Union (Uttam)", color: "text-green-400" };   
      if (s >= 18) return { text: "Good Compatibility (Madhyam)", color: "text-yellow-400" };
      return { text: "Incompatible (Adham)", color: "text-red-400" };
  };

  const isValid = boyName && girlName && boyDob && girlDob;

  return (
    <div className="relative min-h-screen bg-[#050510] pt-12 pb-24 overflow-hidden">      
        <div className="max-w-6xl mx-auto px-4 relative z-10">
            <Link to="/home" className="inline-flex items-center text-amber-200/60 hover:text-amber-400 transition-all mb-12 group">
                <span className="text-2xl mr-3 group-hover:-translate-x-2 transition-transform">←</span>
                <span className="font-cinzel font-black uppercase tracking-widest text-xs">Exit Sanctuary</span>
            </Link>

            {/* 🌟 CELESTIAL RADIANT HEADER */}
            <div className="flex flex-col items-center text-center mb-16">
                <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
                    <div className="absolute inset-[-40px] bg-[radial-gradient(circle,rgba(239,68,68,0.15)_0%,transparent_70%)] animate-pulse rounded-full blur-2xl"></div>
                    <div className="w-32 h-32 bg-black rounded-full border-4 border-red-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                        <span className="text-6xl animate-pulse">❤️</span>
                    </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-cinzel font-black text-white uppercase tracking-widest mb-4">
                    Vedic <span className="text-red-500">Matchmaking</span>
                </h1>
                <p className="text-amber-100/60 font-lora italic text-lg max-w-xl mx-auto">Ashta Koota Guna Milan - The Ancient Science of Relational Alignment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <Card className="imperial-card p-10 border-l-4 border-blue-500 rounded-[2.5rem] bg-black/40">
                    <h3 className="text-2xl font-cinzel font-black text-blue-300 mb-8 uppercase tracking-widest border-b border-white/5 pb-4">Seeker Alpha</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 ml-1">Name</label>
                            <input value={boyName} onChange={e => setBoyName(e.target.value)} className="w-full bg-gray-900 border border-blue-500/20 rounded-xl p-4 text-white outline-none focus:border-blue-500" placeholder="Enter Name" />
                        </div>
                        <SmartDatePicker value={boyDob} onChange={setBoyDob} />
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 ml-1">Birth Star</label>
                            <select value={boyNak} onChange={e => setBoyNak(e.target.value)} className="w-full bg-gray-900 border border-blue-500/20 rounded-xl p-4 text-white outline-none">
                                {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>

                <Card className="imperial-card p-10 border-r-4 border-pink-500 rounded-[2.5rem] bg-black/40">
                    <h3 className="text-2xl font-cinzel font-black text-pink-300 mb-8 uppercase tracking-widest border-b border-white/5 pb-4 text-right">Seeker Omega</h3>
                    <div className="space-y-6">
                        <div className="text-right">
                            <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 mr-1">Name</label>
                            <input value={girlName} onChange={e => setGirlName(e.target.value)} className="w-full bg-gray-900 border border-pink-500/20 rounded-xl p-4 text-white text-right outline-none focus:border-pink-500" placeholder="Enter Name" />
                        </div>
                        <div className="text-right">
                            <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 mr-1">Date of Birth</label>
                            <SmartDatePicker value={girlDob} onChange={setGirlDob} />     
                        </div>
                        <div className="text-right">
                            <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 mr-1">Birth Star</label>
                            <select value={girlNak} onChange={e => setGirlNak(e.target.value)} className="w-full bg-gray-900 border border-pink-500/20 rounded-xl p-4 text-white text-right outline-none">
                                {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-16 text-center">
                <Button onClick={calculateCompatibility} disabled={isLoading || !isValid} className="px-16 py-6 bg-gradient-to-r from-blue-600 via-red-600 to-pink-600 rounded-full text-lg font-cinzel font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30">
                    {isLoading ? "Merging Astral Charts..." : "Execute Alignment Check"}  
                </Button>
            </div>

            {isLoading && <ProgressBar progress={progress} message={statusMessage} />}    

            {score !== null && !isLoading && (
                <div className="mt-20 animate-fade-in-up">
                    <Card className="imperial-card bg-[#fffcf0] text-black p-12 rounded-[3rem] shadow-2xl max-w-2xl mx-auto text-center relative overflow-hidden sacred-boundary">  
                        <p className="text-gray-500 text-xs font-cinzel font-black uppercase tracking-[0.4em] mb-4">Total Karmic Resonance</p>
                        <div className="text-9xl font-black text-[#2d0a18] mb-6 font-cinzel relative inline-block">
                            {score} <span className="text-3xl text-gray-400 absolute bottom-4 -right-12">/ 36</span>
                        </div>
                        <h3 className={`text-4xl font-cinzel font-black mt-4 mb-8 uppercase tracking-widest ${getVerdict(score).color.replace('text', 'text-opacity-90 text')}`}>   
                            {getVerdict(score).text}
                        </h3>
                        <div className="mt-12 pt-10 border-t border-black/10 grid grid-cols-2 gap-8 text-[11px] text-left font-cinzel font-black uppercase tracking-widest">        
                            <div className="flex justify-between border-b border-black/5 pb-2"><span>Varna (Spiritual)</span><span className="text-green-700">1 / 1</span></div>    
                            <div className="flex justify-between border-b border-black/5 pb-2"><span>Yoni (Instinct)</span><span className="text-amber-600">2 / 4</span></div>      
                            <div className="flex justify-between border-b border-black/5 pb-2"><span>Maitri (Mental)</span><span className="text-green-700">5 / 5</span></div>      
                            <div className="flex justify-between border-b border-black/5 pb-2"><span>Nadi (Health)</span><span className={score > 18 ? "text-green-700" : "text-red-700"}>{score > 18 ? "8" : "0"} / 8</span></div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
};

export default Matchmaking;