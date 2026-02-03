
import React from 'react';

interface ProgressBarProps {
  progress: number;
  message?: string;
  estimatedTime?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message, estimatedTime }) => {
  return (
    <div className="w-full max-w-md mx-auto my-6 p-4 bg-black/40 rounded-lg border border-amber-500/20 backdrop-blur-sm animate-fade-in-up">
      <div className="flex justify-between items-center mb-2 text-sm text-amber-200">
        <span className="font-cinzel font-bold tracking-wider text-xs sm:text-sm">{message || 'Consulting the Stars...'}</span>
        <span className="font-mono text-amber-400">{Math.min(100, Math.round(progress))}%</span>
      </div>
      
      <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(251,191,36,0.4)] relative"
          style={{ width: `${progress}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      {estimatedTime && (
        <div className="text-right mt-2 text-[10px] text-amber-200/50 italic font-lora">
          Est. time: <span className="text-amber-300">{estimatedTime}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
