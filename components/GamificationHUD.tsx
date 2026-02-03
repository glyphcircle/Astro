
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLevel, getNextLevel, SIGILS } from '../services/gamificationConfig';
import Card from './shared/Card';
import Modal from './shared/Modal';
import { useNavigate } from 'react-router-dom';

const GamificationHUD: React.FC = () => {
  const { user, newSigilUnlocked, clearSigilNotification } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showSigilToast, setShowSigilToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
      if (newSigilUnlocked) {
          setShowSigilToast(true);
          const timer = setTimeout(() => {
              setShowSigilToast(false);
              clearSigilNotification();
          }, 4000);
          return () => clearTimeout(timer);
      }
  }, [newSigilUnlocked, clearSigilNotification]);

  if (!user || !user.gamification) return null;

  const { karma, streak, unlockedSigils } = user.gamification;
  const currentLevel = getLevel(karma);
  const nextLevel = getNextLevel(karma);
  const progressPercent = Math.min(100, Math.max(0, ((karma - currentLevel.minKarma) / (nextLevel.minKarma - currentLevel.minKarma)) * 100));

  const handleViewGallery = () => {
    setShowModal(false);
    navigate('/achievements');
  };

  return (
    <>
      {/* HUD HEADER BAR */}
      <div className="fixed top-20 left-4 z-40 md:top-24 flex flex-col gap-2 pointer-events-auto">
          {/* Level Badge - Click to open modal */}
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-full px-3 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400 transition-all group"
          >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-purple-800 flex items-center justify-center text-xs font-bold border border-amber-300">
                  {currentLevel.level}
              </div>
              <div className="flex flex-col items-start">
                  <span className="text-[10px] text-amber-100 font-cinzel uppercase tracking-wider group-hover:text-amber-300">{currentLevel.title}</span>
                  <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-purple-500" style={{ width: `${progressPercent}%` }}></div>
                  </div>
              </div>
          </button>

          {/* Streak Flame */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-full px-3 py-1.5 shadow-lg w-max" title="Daily Login Streak">
              <span className="text-lg animate-pulse">🔥</span>
              <span className="text-xs font-bold text-red-200 font-mono">{streak} Day{streak !== 1 ? 's' : ''}</span>
          </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {showSigilToast && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] animate-fade-in-up">
              <div className="bg-gradient-to-b from-purple-900 to-black p-6 rounded-xl border-2 border-amber-400 shadow-[0_0_50px_rgba(217,70,239,0.6)] text-center">
                  <div className="text-4xl mb-2 animate-bounce">✨</div>
                  <h3 className="text-2xl font-cinzel font-bold text-amber-200 mb-1">Sigil Unlocked!</h3>
                  <p className="text-purple-300 font-bold text-lg">{newSigilUnlocked}</p>
              </div>
          </div>
      )}

      {/* GRIMOIRE MODAL */}
      <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="p-6 bg-[#0F0F23] text-amber-50 max-h-[80vh] overflow-y-auto">
              <div className="text-center mb-6">
                  <h2 className="text-2xl font-cinzel font-bold text-amber-300">Grimoire of Ascension</h2>
                  <p className="text-amber-200/50 text-xs uppercase tracking-[0.3em]">Your Spiritual Journey</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-black/30 p-3 rounded border border-amber-500/20 text-center">
                      <div className="text-2xl font-bold text-purple-400">{karma}</div>
                      <div className="text-[9px] uppercase text-gray-500">Total Karma</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-amber-500/20 text-center">
                      <div className="text-2xl font-bold text-red-400">{streak}</div>
                      <div className="text-[9px] uppercase text-gray-500">Day Streak</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-amber-500/20 text-center">
                      <div className="text-2xl font-bold text-blue-400">{user.gamification.readingsCount}</div>
                      <div className="text-[9px] uppercase text-gray-500">Readings</div>
                  </div>
              </div>

              {/* Progress to Next Level */}
              <div className="mb-8">
                  <div className="flex justify-between text-xs text-amber-200 mb-2">
                      <span>Current: {currentLevel.title}</span>
                      <span>Next: {nextLevel.title}</span>
                  </div>
                  <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-700 relative">
                      <div className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white shadow-black drop-shadow-md">
                          {karma} / {nextLevel.minKarma} Karma
                      </div>
                  </div>
              </div>

              {/* Sigils Grid Preview */}
              <div className="flex justify-between items-center mb-4 border-b border-amber-500/20 pb-2">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                    Mystic Sigils ({unlockedSigils.length}/{SIGILS.length})
                </h3>
                <button 
                  onClick={handleViewGallery}
                  className="text-[10px] text-blue-400 hover:text-white uppercase font-bold tracking-widest underline"
                >
                  Full Gallery
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                  {SIGILS.slice(0, 6).map(sigil => {
                      const isUnlocked = unlockedSigils.includes(sigil.id);
                      return (
                          <div 
                            key={sigil.id} 
                            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${isUnlocked ? 'bg-amber-900/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-gray-900/50 border-gray-800 opacity-50 grayscale'}`}
                          >
                              <div className={`text-3xl mb-2 ${isUnlocked ? 'animate-float' : ''}`}>{sigil.icon}</div>
                              <div className="text-[10px] font-bold text-center text-amber-100 mb-1">{sigil.name}</div>
                          </div>
                      )
                  })}
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full mt-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 text-xs uppercase font-bold tracking-wider"
              >
                  Close Grimoire
              </button>
          </div>
      </Modal>
    </>
  );
};

export default GamificationHUD;
