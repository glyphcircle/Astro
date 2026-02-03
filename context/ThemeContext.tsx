import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { loadUserTheme, saveUserTheme, applyTheme, ThemeConfig, DEFAULT_THEME, saveThemeToLocalStorage } from '../services/themeService';
import { THEMES, ThemeId } from '../services/themeConfig';

interface ThemeContextType {
  theme: ThemeConfig;
  toggleMode: () => void;
  setColorVariant: (variant: ThemeConfig['colorVariant']) => void;
  setHoverOpacity: (opacity: number) => void;
  setCardOpacity: (opacity: number) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  isLoading: boolean;
  currentTheme: typeof THEMES[ThemeId];
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme on mount
  useEffect(() => {
    const initTheme = async () => {
      const loadedTheme = await loadUserTheme();
      setThemeState(loadedTheme);
      applyTheme(loadedTheme);
      
      const savedId = localStorage.getItem('glyph_festival_theme_id') as ThemeId;
      if (savedId && THEMES[savedId]) {
          setCurrentThemeId(savedId);
      }
      
      setIsLoading(false);
    };
    initTheme();
  }, []);

  // Monitor theme state and mirror to localStorage + DOM immediately
  useEffect(() => {
    if (!isLoading) {
      saveThemeToLocalStorage(theme);
      applyTheme(theme);
      // Background sync to Supabase
      saveUserTheme(theme);
    }
  }, [theme, isLoading]);

  const persist = useCallback(async (newTheme: ThemeConfig) => {
      setThemeState(newTheme);
  }, []);

  const toggleMode = useCallback(() => {
    setThemeState(prev => {
      const nextMode: 'dark' | 'light' = prev.mode === 'dark' ? 'light' : 'dark';
      return { ...prev, mode: nextMode };
    });
  }, []);

  const setColorVariant = useCallback((variant: ThemeConfig['colorVariant']) => {
    setThemeState(prev => ({ ...prev, colorVariant: variant }));
  }, []);

  const setHoverOpacity = useCallback((opacity: number) => {
    setThemeState(prev => ({ ...prev, hoverOpacity: opacity }));
  }, []);

  const setCardOpacity = useCallback((opacity: number) => {
    setThemeState(prev => ({ ...prev, cardOpacity: opacity }));
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...updates }));
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
      const festival = THEMES[id];
      if (!festival) return;

      setCurrentThemeId(id);
      localStorage.setItem('glyph_festival_theme_id', id);

      setThemeState(prev => {
          let nextColor: ThemeConfig['colorVariant'] = 'default';
          const nextMode: ThemeConfig['mode'] = festival.cssClass === 'theme-light' ? 'light' : 'dark';

          if (id === 'holi') nextColor = 'red';
          else if (id === 'diwali') nextColor = 'orange';
          else if (id === 'divine') nextColor = 'blue';
          else if (id === 'navratri') nextColor = 'purple';

          return { ...prev, mode: nextMode, colorVariant: nextColor };
      });
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleMode,
      setColorVariant,
      setHoverOpacity,
      setCardOpacity,
      updateTheme,
      isLoading,
      currentTheme: THEMES[currentThemeId],
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
