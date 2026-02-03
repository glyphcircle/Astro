export type ThemeId = 'default' | 'light' | 'diwali' | 'holi' | 'navratri' | 'divine';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  backgrounds: string[]; // URLs for Home Slider
  cssClass: string; 
  accentColor: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Mystic Night',
    icon: '🌙',
    backgrounds: [
      'https://images.unsplash.com/photo-1531162232855-369463387517?q=80&w=1920',
      'https://images.unsplash.com/photo-1515524738708-327f6b0037a2?q=80&w=1920',
      'https://images.unsplash.com/photo-1605333116398-1c39a3f898e3?q=80&w=1920',
      'https://images.unsplash.com/photo-1590387120759-4f86a5578507?q=80&w=1920',
    ],
    cssClass: 'theme-dark',
    accentColor: 'text-amber-400'
  },
  light: {
    id: 'light',
    name: 'Celestial Light',
    icon: '☀️',
    backgrounds: [
      'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=1920',
      'https://images.unsplash.com/photo-1506784919141-14e4c93a3024?q=80&w=1920'
    ],
    cssClass: 'theme-light',
    accentColor: 'text-amber-700'
  },
  diwali: {
    id: 'diwali',
    name: 'Royal Maroon',
    icon: '🪔',
    backgrounds: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1920',
      'https://images.unsplash.com/photo-1543429268-b737898e7e46?q=80&w=1920',
    ],
    cssClass: 'theme-dark',
    accentColor: 'text-gold-500'
  },
  holi: {
    id: 'holi',
    name: 'Holi Colors',
    icon: '🎨',
    backgrounds: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920',
    ],
    cssClass: 'theme-dark',
    accentColor: 'text-pink-500'
  },
  navratri: {
    id: 'navratri',
    name: 'Rose Quartz',
    icon: '🔱',
    backgrounds: [
      'https://images.unsplash.com/photo-1567591414240-e13630603713?q=80&w=1920',
    ],
    cssClass: 'theme-dark',
    accentColor: 'text-amber-300'
  },
  divine: {
    id: 'divine',
    name: 'Divine Blue',
    icon: '🧘',
    backgrounds: [
        'https://images.unsplash.com/photo-1506318137071-a8bcbf90d114?q=80&w=1920',       
    ],
    cssClass: 'theme-dark',
    accentColor: 'text-yellow-400'
  }
};