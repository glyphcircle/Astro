
import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../hooks/useTranslation';

const LargeTextMode: React.FC = () => {
  const { highContrast, largeText, toggleHighContrast, toggleLargeText } = useAccessibility();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 left-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full shadow-xl flex items-center justify-center text-white border-2 border-white focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform hover:scale-110"
        aria-label="Accessibility Settings"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
           <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-64 bg-gray-900 border border-amber-500/30 rounded-lg shadow-2xl p-4 animate-fade-in-up origin-bottom-left">
           <h3 className="text-amber-100 font-bold mb-4 font-cinzel text-lg border-b border-amber-500/20 pb-2">Accessibility</h3>
           
           <div className="space-y-4">
               {/* Large Text Toggle */}
               <button 
                 onClick={toggleLargeText}
                 className={`w-full p-3 rounded flex items-center justify-between font-bold transition-colors ${largeText ? 'bg-amber-600 text-white' : 'bg-gray-800 text-amber-200 hover:bg-gray-700'}`}
               >
                  <span className="text-lg">Aa</span>
                  <span className="text-sm">{largeText ? 'Large Text: ON' : 'Large Text: OFF'}</span>
               </button>

               {/* High Contrast Toggle */}
               <button 
                 onClick={toggleHighContrast}
                 className={`w-full p-3 rounded flex items-center justify-between font-bold transition-colors ${highContrast ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-gray-800 text-amber-200 hover:bg-gray-700'}`}
               >
                  <span className="text-lg">◐</span>
                  <span className="text-sm">{highContrast ? 'Contrast: HIGH' : 'Contrast: NORMAL'}</span>
               </button>
           </div>

           <p className="text-xs text-amber-200/50 mt-4 text-center">
             Designed for readability
           </p>
        </div>
      )}
    </div>
  );
};

export default LargeTextMode;
