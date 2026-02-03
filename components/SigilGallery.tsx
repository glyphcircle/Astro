
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SIGILS, getLevel, getNextLevel } from '../services/gamificationConfig';
import Card from './shared/Card';
import { Link } from 'react-router-dom';

const SigilGallery: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.gamification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-amber-200/50 font-cinzel">The records are clouded...</p>
      </div>
    );
  }

  const { karma, streak, unlockedSigils, readingsCount } = user.gamification;
  const currentLevel = getLevel(karma);
  const nextLevel = getNextLevel(karma);
  const progressPercent = Math.min(100, Math.max(0, ((karma - currentLevel.minKarma) / (nextLevel.minKarma - currentLevel.minKarma)) * 100));

  // Helper to calculate progress for specific sigils
  const getSigilProgress = (sigilId: string) => {
    switch (sigilId) {
      case 'awakening': return Math.min(100, (readingsCount / 1) * 100);
      case 'consistent_soul': return Math.min(100, (streak / 3) * 100);
      case 'dedicated_devotee': return Math.min(100, (streak / 7) * 100);
      case 'tarot_master': return Math.min(100, (karma / 500) * 100);
      case 'high_priest': return Math.min(100, (karma / 2000) * 100);
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <Link to="/home" className="inline-flex items-center text-amber-200/60 hover:text-amber-200 transition-colors mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-5xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-300 to-amber-200 mb-2 drop-shadow-lg">
            Mystic Achievements
          </h1>
          <p className="text-amber-100/60 font-lora italic tracking-wider">Your soul's progress through the cosmic hierarchy.</p>
        </header>

        {/* Level Progression Card */}
        <Card className="mb-10 p-8 border-amber-500/30 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-colors duration-1000"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-purple-900 p-1 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex-shrink-0 animate-pulse-glow">
              <div className="w-full h-full rounded-full bg-gray-900 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Level</span>
                <span className="text-5xl font-cinzel font-black text-amber-200">{currentLevel.level}</span>
              </div>
            </div>

            <div className="flex-grow w-full">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-cinzel font-bold text-amber-100">{currentLevel.title}</h2>
                  <p className="text-amber-500/60 text-xs font-mono uppercase tracking-[0.2em]">Ascension Path</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-white">{karma}</span>
                  <span className="text-gray-500 text-sm ml-2">Karma</span>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">
                  <span>Progress to {nextLevel.title}</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 p-[1px]">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 via-pink-600 to-purple-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(219,39,119,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-600 mt-2 text-right italic">
                  Gain {nextLevel.minKarma - karma} more Karma to ascend.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sigils Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SIGILS.map(sigil => {
            const isUnlocked = unlockedSigils.includes(sigil.id);
            const progress = getSigilProgress(sigil.id);

            return (
              <Card 
                key={sigil.id} 
                className={`
                  relative p-6 flex flex-col items-center text-center transition-all duration-500 group
                  ${isUnlocked 
                    ? 'bg-gradient-to-b from-gray-900/80 to-purple-900/20 border-amber-500/40 shadow-[0_0_30px_rgba(139,92,246,0.1)]' 
                    : 'bg-black/20 border-gray-800 opacity-60 grayscale'
                  }
                `}
              >
                {/* Sigil Icon */}
                <div className={`
                  text-5xl mb-4 transition-transform duration-700
                  ${isUnlocked ? 'animate-float drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'opacity-40'}
                `}>
                  {sigil.icon}
                </div>

                {/* Sigil Info */}
                <h3 className={`text-lg font-cinzel font-bold mb-1 ${isUnlocked ? 'text-amber-200' : 'text-gray-500'}`}>
                  {sigil.name}
                </h3>
                <p className="text-xs text-gray-400 mb-6 font-lora leading-relaxed min-h-[3em]">
                  {sigil.description}
                </p>

                {/* Progress Mini Bar (Only for locked) */}
                {!isUnlocked && (
                  <div className="w-full mt-auto">
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500/40 transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-gray-600 mt-1 block uppercase font-bold tracking-tighter">
                      Progress: {progress.toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Unlocked Glow */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SigilGallery;
