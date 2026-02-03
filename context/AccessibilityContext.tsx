
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Persist preferences
  useEffect(() => {
    const savedHC = localStorage.getItem('glyph_high_contrast') === 'true';
    const savedLT = localStorage.getItem('glyph_large_text') === 'true';
    setHighContrast(savedHC);
    setLargeText(savedLT);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => {
      const newVal = !prev;
      localStorage.setItem('glyph_high_contrast', String(newVal));
      return newVal;
    });
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  const toggleLargeText = useCallback(() => {
    setLargeText(prev => {
      const newVal = !prev;
      localStorage.setItem('glyph_large_text', String(newVal));
      return newVal;
    });
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  // Screen Reader Announcer
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after reading to allow re-announcement of same text
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Apply Styles Globally
  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.style.fontSize = '125%';
    } else {
      root.style.fontSize = '100%';
    }

    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [largeText, highContrast]);

  return (
    <AccessibilityContext.Provider value={{ highContrast, largeText, toggleHighContrast, toggleLargeText, announce }}>
      {/* Dynamic CSS injection for High Contrast overrides */}
      {highContrast && (
        <style>{`
          .high-contrast-mode { background-color: #000 !important; color: #FFD700 !important; }
          .high-contrast-mode * { 
             background-color: #000 !important; 
             color: #FFD700 !important; 
             border-color: #FFD700 !important;
             box-shadow: none !important;
             text-shadow: none !important;
             background-image: none !important;
          }
          .high-contrast-mode img { filter: grayscale(100%) contrast(150%); }
          .high-contrast-mode button { border: 2px solid #FFD700 !important; }
        `}</style>
      )}
      
      {children}
      
      {/* Hidden Live Region for Screen Readers */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only" 
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};
