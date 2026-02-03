import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from './shared/Card';

const ThemeCustomizer: React.FC = () => {
  const { theme, setColorVariant, setHoverOpacity, setCardOpacity, toggleMode } = useTheme();

  return (
    <Card className="p-8 bg-skin-surface/40 border-skin-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-skin-accent/5 rounded-full blur-3xl"></div>
      <h3 className="text-xl font-cinzel font-black text-skin-accent uppercase tracking-widest flex items-center gap-3 mb-8">
        <span>🎨</span> Custom Theme Engine
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Mode Toggle */}
        <div className="space-y-3">
          <label className="block text-[10px] text-skin-text/40 uppercase font-black tracking-widest">Display Protocol</label>
          <button 
            onClick={toggleMode}
            className="w-full py-4 bg-skin-base border border-skin-border rounded-xl flex items-center justify-center gap-3 hover:bg-skin-hover transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
                {theme.mode === 'dark' ? '🌙' : '☀️'}
            </span>
            <span className="font-bold text-xs uppercase tracking-widest">
                Switch to {theme.mode === 'dark' ? 'Celestial Light' : 'Mystic Night'}
            </span>
          </button>
        </div>

        {/* Color Variant */}
        <div className="space-y-3">
          <label className="block text-[10px] text-skin-text/40 uppercase font-black tracking-widest">Accent Resonance</label>
          <select 
            value={theme.colorVariant} 
            onChange={(e) => setColorVariant(e.target.value as any)}
            className="w-full bg-skin-base border border-skin-border rounded-xl p-4 text-xs font-bold text-skin-text outline-none focus:border-skin-accent transition-all uppercase tracking-widest"
          >
            <option value="default">Imperial Gold (Default)</option>
            <option value="blue">Deep Space Blue</option>
            <option value="purple">Royal Amethyst</option>
            <option value="green">Veridian Healing</option>
            <option value="orange">Solar Flare</option>
            <option value="red">Sacred Vermillion</option>
            <option value="teal">Teal Harmony</option>
          </select>
        </div>

        {/* Hover Opacity */}
        <div className="space-y-5">
            <div className="flex justify-between items-end">
                <div>
                   <h4 className="text-[11px] font-black text-skin-text/60 uppercase tracking-widest">Interactive Opacity</h4>
                   <p className="text-[9px] text-skin-text/20 mt-1 uppercase italic">Protocol: Hover Transparency</p>
                </div>
                <span className="text-2xl font-mono font-black text-skin-accent">{Math.round(theme.hoverOpacity * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.4" 
              max="1" 
              step="0.05"
              value={theme.hoverOpacity}
              onChange={(e) => setHoverOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-skin-accent"
            />
        </div>

        {/* Card Opacity */}
        <div className="space-y-5">
            <div className="flex justify-between items-end">
                <div>
                   <h4 className="text-[11px] font-black text-skin-text/60 uppercase tracking-widest">Structural Density</h4>
                   <p className="text-[9px] text-skin-text/20 mt-1 uppercase italic">Protocol: Background alpha</p>
                </div>
                <span className="text-2xl font-mono font-black text-skin-accent">{Math.round(theme.cardOpacity * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.7" 
              max="1" 
              step="0.05"
              value={theme.cardOpacity}
              onChange={(e) => setCardOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-skin-accent"
            />
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-skin-border/20 text-center">
          <p className="text-[9px] text-skin-text/40 uppercase tracking-[0.4em] font-bold">
            ✅ Registry Sync Active • Preferences Auto-Saved
          </p>
      </div>
    </Card>
  );
};

export default ThemeCustomizer;