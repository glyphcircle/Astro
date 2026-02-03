
import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "The AI is gazing into the cosmos...", 
  fullScreen = false 
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      {/* Crystal Ball Container */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-xl animate-pulse"></div>
        
        {/* The Ball */}
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.5)] border border-indigo-400/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/50 to-indigo-950/90 backdrop-blur-sm">
          
          {/* Inner Swirling Mist */}
          <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-[spin_8s_linear_infinite]"></div>
          
          {/* Core Light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-fuchsia-500/30 rounded-full blur-md animate-pulse"></div>
          
          {/* Reflection */}
          <div className="absolute top-4 left-6 w-8 h-4 bg-white/10 rounded-full blur-[2px] rotate-[-45deg]"></div>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-amber-400 rounded-full blur-[1px] shadow-[0_0_10px_#FBBF24]"></div>
        </div>
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
          <div className="absolute bottom-2 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_8px_#22D3EE]"></div>
        </div>
      </div>

      {/* Loading Text */}
      <h3 className="text-xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 animate-pulse text-center px-4">
        {text}
      </h3>
      <p className="text-amber-500/60 text-xs mt-2 font-lora italic tracking-wider">
        Aligning energy frequencies...
      </p>
    </div>
  );
};

export default LoadingSpinner;
