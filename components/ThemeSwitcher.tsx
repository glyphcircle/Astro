
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEMES, ThemeId } from '../services/themeConfig';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-500/30 transition-all shadow-lg text-xl"
        title="Change Festival Theme"
      >
        {currentTheme.icon}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-12 right-0 w-48 bg-gray-900 border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Select Theme
              </div>
              {Object.values(THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${currentTheme.id === theme.id 
                        ? 'bg-amber-900/50 text-amber-300 border border-amber-500/20' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{theme.icon}</span>
                  <span className="font-cinzel">{theme.name}</span>
                  {currentTheme.id === theme.id && (
                    <span className="ml-auto text-amber-500 text-xs">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
