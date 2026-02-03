
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../context/LanguageContext';

// Regional Language Mapping
const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-md border border-amber-500/30 rounded-full px-3 py-1.5 transition-all shadow-lg min-w-[100px] justify-between"
      >
        <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{currentLang?.flag}</span>
            <span className="text-xs font-bold text-amber-100 uppercase hidden sm:block">{currentLang?.code}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div 
            className={`
                absolute top-12 w-48 bg-gray-900 border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar
                ${isRTL ? 'left-0' : 'right-0'}
            `}
          >
            <div className="p-2 grid grid-cols-1 gap-1">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => {
                            setLanguage(lang.code);
                            setIsOpen(false);
                        }}
                        className={`
                            flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors
                            ${language === lang.code 
                                ? 'bg-amber-900/50 text-amber-300 border border-amber-500/20' 
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }
                        `}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className={`font-medium ${['hi','ta','te','bn','mr','ar','ja','zh'].includes(lang.code) ? 'font-sans' : 'font-cinzel'}`}>
                            {lang.label}
                        </span>
                        {language === lang.code && (
                            <span className="ml-auto text-amber-500">✓</span>
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

export default LanguageSwitcher;
