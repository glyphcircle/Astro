
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../shared/Card';

interface GemstoneRecommendationProps {
  gemstones: any;
  userName: string;
}

const GemstoneRecommendation: React.FC<GemstoneRecommendationProps> = ({ gemstones, userName }) => {
  const { primary, avoid } = gemstones;

  if (!primary) return null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900">Celestial Gemstone Prescription</h3>
        <p className="text-sm font-lora italic text-amber-800/60 mt-1">Armor for your soul's journey</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-8 bg-gradient-to-br from-[#fffcf0] to-white border-amber-500/30 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-6xl shadow-2xl border-4 border-white/20 animate-pulse-glow">
              💎
            </div>
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-1">Primary Life-Stone</h4>
              <h2 className="text-4xl font-cinzel font-black text-amber-900 leading-tight">{primary.name}</h2>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full">Planet: {primary.p}</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full">Metal: {primary.m}</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full">Finger: {primary.f}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-amber-600/5 p-4 rounded-2xl border border-amber-600/10">
              <p className="text-[10px] font-black uppercase text-amber-800 mb-2">Sacred Mantra</p>
              <p className="text-sm font-cinzel font-bold leading-relaxed">{primary.mantra}</p>
            </div>
            <div className="bg-amber-600/5 p-4 rounded-2xl border border-amber-600/10">
              <p className="text-[10px] font-black uppercase text-amber-800 mb-2">Ritual Day</p>
              <p className="text-sm font-cinzel font-bold">{primary.d}</p>
            </div>
          </div>

          <Link 
            to={`/store?category=Gemstones&product=${primary.name.toLowerCase().replace(/\s+/g, '-')}`}
            state={{ from: 'astrology-report', reportData: { userName } }}
            className="block mt-8"
          >
            <button className="w-full py-4 bg-amber-900 text-white font-cinzel font-black rounded-xl hover:bg-black transition-all shadow-xl uppercase tracking-widest text-xs">
              View Authenticated {primary.name} in Store
            </button>
          </Link>
        </Card>

        <Card className="p-8 bg-red-50 border-red-200">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-6 text-center">Gemstones to Avoid</h4>
           <div className="space-y-4">
              {avoid.map((stone: string) => (
                <div key={stone} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-red-100 text-red-900 font-bold text-sm">
                   <span className="text-lg">🚫</span> {stone}
                </div>
              ))}
           </div>
           <p className="text-[10px] italic text-red-700/60 mt-6 text-center leading-relaxed">
             These vibrations may conflict with your natal frequencies.
           </p>
        </Card>
      </div>
    </div>
  );
};

export default GemstoneRecommendation;
