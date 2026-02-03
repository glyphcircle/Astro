import { supabase } from './supabaseClient';

export interface ThemeConfig {
  mode: 'dark' | 'light';
  colorVariant: 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'teal';
  hoverOpacity: number;
  cardOpacity: number;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  colorVariant: 'default',
  hoverOpacity: 0.85,
  cardOpacity: 0.95,
};

const THEME_KEY = 'glyph_theme';

// Load theme from localStorage FIRST, then sync from Supabase if possible
export async function loadUserTheme(): Promise<ThemeConfig> {
  try {
    // FIRST: Try localStorage (instant, works even before auth)
    const localTheme = loadThemeFromLocalStorage();
    
    // SECOND: Try to get user session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      return localTheme;
    }

    // THIRD: Try to load from Supabase for cross-device consistency
    const { data, error } = await supabase
      .from('user_theme_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return localTheme;
    }

    const supabaseTheme: ThemeConfig = {
      mode: (data.theme_mode as 'dark' | 'light') || localTheme.mode,
      colorVariant: (data.color_variant as any) || localTheme.colorVariant,
      hoverOpacity: data.hover_opacity ? parseFloat(data.hover_opacity) : localTheme.hoverOpacity,
      cardOpacity: data.card_opacity ? parseFloat(data.card_opacity) : localTheme.cardOpacity,
    };
    
    // Update localStorage to match Supabase
    saveThemeToLocalStorage(supabaseTheme);
    
    return supabaseTheme;
  } catch (err) {
    console.error('❌ [THEME] Error in loadUserTheme:', err);
    return loadThemeFromLocalStorage();
  }
}

// Save theme to BOTH Supabase and localStorage
export async function saveUserTheme(theme: ThemeConfig): Promise<void> {
  try {
    // 1. ALWAYS save to localStorage immediately for instant persistence
    saveThemeToLocalStorage(theme);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      return;
    }

    // 2. Save to Supabase for the authenticated user
    const { error } = await supabase
      .from('user_theme_preferences')
      .upsert({
        user_id: user.id,
        theme_mode: theme.mode,
        color_variant: theme.colorVariant,
        hover_opacity: theme.hoverOpacity,
        card_opacity: theme.cardOpacity,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      if (error.code !== '42P01') { // Ignore missing table error during dev
        throw error;
      }
    }
  } catch (err) {
    console.error('❌ [THEME] Error saving to Supabase:', err);
  }
}

export function loadThemeFromLocalStorage(): ThemeConfig {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('❌ [THEME] Error parsing localStorage:', err);
  }
  return DEFAULT_THEME;
}

export function saveThemeToLocalStorage(theme: ThemeConfig): void {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch (err) {
    console.error('❌ [THEME] Failed to save to localStorage:', err);
  }
}

// Apply theme to DOM using CSS variable structure
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  
  // Set theme mode and color attributes for CSS targeting
  root.setAttribute('data-theme', theme.mode);
  root.setAttribute('data-color', theme.colorVariant);
  
  // Set specific numeric variables for opacities
  root.style.setProperty('--hover-opacity', theme.hoverOpacity.toString());
  root.style.setProperty('--card-opacity', theme.cardOpacity.toString());
}