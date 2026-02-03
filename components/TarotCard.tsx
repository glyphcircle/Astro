
import React, { useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import OptimizedImage from './shared/OptimizedImage';

// Type from parent
export interface TarotCardData {
    id: string;
    name: string;
    number: number;
    type: 'Major' | 'Minor';
    suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
    rank?: string;
    image?: string; // Support for specific artwork URLs
}

interface TarotCardProps {
  card: TarotCardData;
  isSelected: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// 1. STATIC CONSTANTS - MOVED OUTSIDE COMPONENT
const MAJOR_ICONS: Record<number, string> = {
    0: '🃏', 1: '🧙', 2: '📜', 3: '👸', 4: '👑', 5: '⛪', 
    6: '💞', 7: '🛡️', 8: '🦁', 9: '🕯️', 10: '🎡', 11: '⚖️',
    12: '🙃', 13: '💀', 14: '🏺', 15: '👿', 16: '🌩️', 17: '⭐',
    18: '🌔', 19: '🌞', 20: '🎺', 21: '🌍'
};

const SUIT_ICONS: Record<string, string> = {
    'Wands': '🔥',
    'Cups': '🏆',
    'Swords': '🗡️',
    'Pentacles': '🪙'
};

const RANK_SHORTHAND: Record<string, string> = {
    'Ace': 'A', 'Two': '2', 'Three': '3', 'Four': '4', 'Five': '5',
    'Six': '6', 'Seven': '7', 'Eight': '8', 'Nine': '9', 'Ten': '10',
    'Page': 'P', 'Knight': 'Kn', 'Queen': 'Q', 'King': 'K'
};

const ROMAN_NUMERALS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

const TEXTURE_STYLE = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
    opacity: 0.15,
    mixBlendMode: 'overlay' as const,
    pointerEvents: 'none' as const
};

const SACRED_GEOMETRY_STYLE = {
    backgroundImage: `
        radial-gradient(circle at 50% 50%, transparent 10%, rgba(245,158,11,0.1) 11%, transparent 12%),
        radial-gradient(circle at 0% 0%, transparent 10%, rgba(245,158,11,0.1) 11%, transparent 12%),
        radial-gradient(circle at 100% 0%, transparent 10%, rgba(245,158,11,0.1) 11%, transparent 12%),
        radial-gradient(circle at 0% 100%, transparent 10%, rgba(245,158,11,0.1) 11%, transparent 12%),
        radial-gradient(circle at 100% 100%, transparent 10%, rgba(245,158,11,0.1) 11%, transparent 12%)
    `,
    backgroundSize: '30px 30px'
};

// Helper to generate visual themes
const getCardTheme = (card: TarotCardData) => {
  // 1. MAJOR ARCANA
  if (card.type === 'Major') {
    return {
      bgGradient: 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black',
      border: 'border-amber-400',
      accent: 'text-amber-300',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
      orb: 'bg-amber-500/20',
      icon: MAJOR_ICONS[card.number] || '🔮',
      topLabel: ROMAN_NUMERALS[card.number] || card.number.toString(),
      cornerSymbol: 'M'
    };
  } 
  
  // 2. MINOR ARCANA
  const suit = card.suit || 'Wands';
  const rankShort = card.rank ? RANK_SHORTHAND[card.rank] : '?';
  const icon = SUIT_ICONS[suit] || '✧';

  switch (suit) {
    case 'Wands': // Fire
      return {
        bgGradient: 'bg-gradient-to-b from-red-950 via-orange-900 to-black',
        border: 'border-orange-500/60',
        accent: 'text-orange-300',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
        orb: 'bg-orange-500/20',
        icon,
        topLabel: rankShort,
        cornerSymbol: '🔥'
      };
    case 'Cups': // Water
      return {
        bgGradient: 'bg-gradient-to-b from-blue-950 via-cyan-900 to-black',
        border: 'border-cyan-400/60',
        accent: 'text-cyan-300',
        glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
        orb: 'bg-cyan-500/20',
        icon,
        topLabel: rankShort,
        cornerSymbol: '💧'
      };
    case 'Swords': // Air
      return {
        bgGradient: 'bg-gradient-to-b from-slate-900 via-gray-800 to-black',
        border: 'border-gray-400/60',
        accent: 'text-gray-300',
        glow: 'shadow-[0_0_15px_rgba(209,213,219,0.3)]',
        orb: 'bg-slate-500/20',
        icon,
        topLabel: rankShort,
        cornerSymbol: '🌬️'
      };
    case 'Pentacles': // Earth
      return {
        bgGradient: 'bg-gradient-to-b from-emerald-950 via-green-900 to-black',
        border: 'border-emerald-500/60',
        accent: 'text-emerald-300',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        orb: 'bg-emerald-500/20',
        icon,
        topLabel: rankShort,
        cornerSymbol: '🌿'
      };
    default:
        return {
            bgGradient: 'bg-gray-900', border: 'border-gray-500', accent: 'text-gray-300', glow: '', orb: '', icon: '?', topLabel: '?', cornerSymbol: '?'
        };
  }
};

const TarotCard: React.FC<TarotCardProps> = ({ card, isSelected, onClick }) => {
  const { t, isRTL } = useTranslation();
  const theme = useMemo(() => getCardTheme(card), [card]);
  const translatedName = t(card.name);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (navigator.vibrate) navigator.vibrate(20);
    onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative w-full cursor-pointer
        aspect-[2/3] 
        perspective-1000 z-10 
        transition-all duration-500 ease-out will-change-transform
        ${isSelected ? 'scale-100 z-40' : 'hover:-translate-y-2 hover:z-30 hover:scale-105'}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* CARD CONTAINER (Flip logic) */}
      <div 
        className={`
          relative w-full h-full rounded-xl transition-all duration-700 transform-style-3d shadow-2xl
          ${isSelected ? 'rotate-y-180' : ''}
          ${!isSelected ? 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]' : ''}
        `}
      >
        
        {/* ==============================
            FRONT (The Card Back Pattern)
            Visible BEFORE selection
           ============================== */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl backface-hidden 
                     border border-amber-600/30 bg-[#0a0a1a] overflow-hidden"
        >
            {/* Sacred Geometry Pattern */}
            <div className="absolute inset-0 opacity-30" style={SACRED_GEOMETRY_STYLE}></div>
            
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 z-10" style={TEXTURE_STYLE}></div>

            {/* Center Eye Emblem */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-1/3 aspect-square rounded-full border border-amber-500/30 flex items-center justify-center relative bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                     <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping opacity-20"></div>
                     <span className="text-[150%] filter drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] opacity-90">👁️</span>
                </div>
            </div>

            {/* Inner Border */}
            <div className="absolute inset-1 border border-amber-500/20 rounded-lg pointer-events-none"></div>
        </div>


        {/* ==============================
            BACK (The Reveal / Face)
            Visible AFTER selection
           ============================== */}
        <div 
          className={`
            absolute inset-0 w-full h-full rounded-xl overflow-hidden rotate-y-180 backface-hidden
            flex flex-col items-center justify-between p-2 sm:p-3
            border-2 ${theme.border}
            ${theme.bgGradient}
            ${theme.glow}
          `}
        >
          {/* Paper Texture Overlay (Face) */}
          <div className="absolute inset-0 z-0" style={TEXTURE_STYLE}></div>

          {/* Header: Number/Rank and Corner Symbol */}
          <div className={`relative z-10 w-full flex justify-between px-1 pt-1 font-cinzel text-xs sm:text-sm font-black ${theme.accent} opacity-90`}>
              <span>{theme.topLabel}</span>
              <span className="text-[10px] sm:text-xs opacity-70">{theme.cornerSymbol}</span>
          </div>

          {/* MAIN IMAGERY */}
          <div className="relative z-10 flex-grow flex items-center justify-center w-full min-h-0 py-2">
             
             {/* Option A: Specific Artwork Image (if provided) */}
             {card.image ? (
                 <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-inner">
                     <OptimizedImage 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                     />
                     {/* Gloss overlay */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                 </div>
             ) : (
                 /* Option B: CSS Crystal Ball (Default Fallback) */
                 <div className="relative w-[85%] aspect-square flex items-center justify-center max-h-full">
                     {/* Orb Glow */}
                     <div className={`absolute inset-0 rounded-full ${theme.orb} blur-xl animate-pulse`}></div>
                     
                     {/* The Crystal Ball Itself */}
                     <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 shadow-inner flex items-center justify-center overflow-hidden backdrop-blur-sm group-hover:scale-105 transition-transform duration-700">
                         {/* Mist */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                         
                         {/* Icon - Scaled */}
                         <div className="relative z-10 w-full h-full flex items-center justify-center filter drop-shadow-lg transform leading-none">
                            <span className="text-[3em] sm:text-[4em] md:text-[5em] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{theme.icon}</span>
                         </div>
                         
                         {/* Reflection */}
                         <div className="absolute top-[15%] left-[20%] w-[20%] h-[10%] bg-white/40 rounded-full blur-[2px] rotate-[-45deg]"></div>
                     </div>
                 </div>
             )}
          </div>

          {/* Footer: Name */}
          <div className="relative z-10 w-full text-center pb-1 flex-shrink-0">
              <div className={`
                w-full py-1.5
                bg-black/60 backdrop-blur-md rounded border-t ${theme.border}
                text-amber-50 font-cinzel font-bold text-[9px] sm:text-[10px] md:text-xs tracking-wide
                flex items-center justify-center
                px-1 min-h-[1.75rem] shadow-lg
              `}>
                <span className="truncate w-full drop-shadow-md">{translatedName}</span>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TarotCard;
