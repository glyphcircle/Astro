import React, { createContext, useState, useCallback, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';

// Import Locale Objects directly using relative paths
import en from '../locales/en';
import hi from '../locales/hi';

// --- TYPES ---
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'es' | 'fr' | 'ar' | 'pt' | 'de' | 'ru' | 'ja' | 'zh';
export type Currency = 'INR' | 'USD' | 'EUR' | 'SAR' | 'BRL' | 'RUB' | 'JPY' | 'CNY';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  isRTL: boolean;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getRegionalPrice: (baseINR: number) => { price: number; symbol: string; display: string; currency: Currency };
  isLoading: boolean;
}

// --- DICTIONARIES ---
const ta_dict = {
    welcomeToPath: "உங்கள் கண்டுபிடிப்பு பாதை",
    chooseService: "உங்கள் ஆன்மீக பயணத்தைத் தொடங்க ஒரு சேவையைத் தேர்வுசெய்க.",
    matchmaking: "திருமண பொருத்தம்",
    backToHome: "முகப்பு",
    login: "உள்நுழைய",
    logout: "வெளியேறு"
};

const te_dict = {
    welcomeToPath: "మీ ఆవిష్కరణ మార్గం",
    chooseService: "మీ ఆధ్యాత్మిక ప్రయాణాన్ని ప్రారంభించడానికి ఒక సేవను ఎంచుకోండి.",
    matchmaking: "వివాహ పొంతన",
    backToHome: "హోమ్",
    login: "లాగిన్",
    logout: "లాగౌట్"
};

const TRANSLATIONS: Record<string, any> = {
  en: en,
  hi: hi,
  ta: { ...en, ...ta_dict },
  te: { ...en, ...te_dict },
  es: en, fr: en, ar: en, pt: en, de: en, ru: en, ja: en, zh: en, bn: en, mr: en
};

const RTL_LANGUAGES = ['ar', 'he'];

// Approximate Exchange Rates (Base: INR) - Fallback if API fails
const FALLBACK_RATES: Record<string, number> = {
    'INR': 1,
    'USD': 0.012, // ~1/84
    'EUR': 0.011,
    'SAR': 0.045,
    'BRL': 0.060,
    'RUB': 1.10,
    'JPY': 1.80,
    'CNY': 0.085
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const detectLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return (TRANSLATIONS[browserLang] ? browserLang : 'en') as Language;
  };

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('glyph_language') as Language) || detectLanguage();
  });

  // Smart Currency Initialization: Priority = LocalStorage > Timezone > Language Default
  const [currency, setCurrencyState] = useState<Currency>(() => {
      const stored = localStorage.getItem('glyph_currency') as Currency;
      if (stored) return stored;
      
      try {
          // Detect via Timezone
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz === 'Asia/Kolkata' || tz === 'IST') return 'INR';
          if (tz.startsWith('Europe/')) return 'EUR';
          if (tz.startsWith('America/')) return 'USD'; 
          if (tz === 'Asia/Dubai') return 'SAR';
          if (tz === 'Asia/Tokyo') return 'JPY';
      } catch {}
      return 'INR'; // Default changed from USD to INR as requested
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(FALLBACK_RATES);

  const setCurrency = (c: Currency) => {
      setCurrencyState(c);
      localStorage.setItem('glyph_currency', c);
  };

  // --- LIVE EXCHANGE RATE FETCH ---
  useEffect(() => {
      const fetchRates = async () => {
          try {
              // Fetch rates relative to INR
              const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
              const data = await response.json();
              
              if (data && data.rates) {
                  setExchangeRates(prev => ({ ...prev, ...data.rates }));
              }
          } catch (error) {
              console.warn("Currency API offline, using fallback rates.");
          }
      };
      
      fetchRates();
  }, []);

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('glyph_language', lang);
    const dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string, replacements: Record<string, string> = {}): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    let translation = dict[key] || TRANSLATIONS['en'][key] || key;
    
    Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    return translation;
  }, [language]);

  const getRegionalPrice = useCallback((baseINR: number) => {
    const rate = exchangeRates[currency] || exchangeRates['USD'];
    let price = baseINR;
    
    if (currency !== 'INR') {
        // Convert and round nicely
        const converted = baseINR * rate;
        if (converted < 10) price = Number(converted.toFixed(2));
        else price = Math.round(converted); 
    }

    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    const display = formatCurrency(price, currency, locale);

    return {
        price,
        symbol: '', // Symbols handled by display string now
        currency,
        display
    };
  }, [currency, exchangeRates]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: setLanguageCallback, 
      t,
      isRTL: RTL_LANGUAGES.includes(language),
      currency,
      setCurrency,
      getRegionalPrice,
      isLoading: false
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
