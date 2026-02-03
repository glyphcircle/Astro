import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAstroNumeroReading, generateAdvancedAstroReport, translateText } from '../services/geminiService';
import { calculateNumerology } from '../services/numerologyEngine';
import { calculateAstrology } from '../services/astrologyEngine';
import Button from './shared/Button';
import Card from './shared/Card';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import VedicReportRenderer from './VedicReportRenderer';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import { SmartDatePicker, SmartTimePicker, SmartCitySearch } from './SmartAstroInputs';
import { validationService } from '../services/validationService';
import { cloudManager } from '../services/cloudManager';
import { useTheme } from '../context/ThemeContext';
import ReportLoader from './ReportLoader';
import ServiceResult from './ServiceResult';
import EnhancedNumerologyReport from './EnhancedNumerologyReport';
import TemplatedReportWrapper from './TemplatedReportWrapper';
import { dbService } from '../services/db';

interface NumerologyAstrologyProps {
  mode: 'numerology' | 'astrology';
}

const NumerologyAstrology: React.FC<NumerologyAstrologyProps> = ({ mode }) => {
  const [formData, setFormData] = useState({ name: '', dob: '', pob: '', tob: '' });
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [reading, setReading] = useState<string>('');
  const [advancedReport, setAdvancedReport] = useState<any>(null);
  const [engineData, setEngineData] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { db } = useDb();
  const { user, saveReading } = useAuth();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const prevLangRef = useRef(language);
  const isAdmin = user && ['master@glyphcircle.com', 'admin@glyphcircle.com', 'admin@glyph.circle'].includes(user.email);

  useEffect(() => {
    const loadTemplate = async () => {
        const template = await dbService.getRandomTemplate(mode);
        setSelectedTemplate(template);
    };
    loadTemplate();
  }, [mode]);

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French', ar: 'Arabic', pt: 'Portuguese' };
    return map[code] || 'English';
  };

  // --- AUTOMATIC TRANSLATION ON LANG CHANGE ---
  useEffect(() => {
    if (reading && !isLoading && prevLangRef.current !== language) {
        const handleLangShift = async () => {
            setIsLoading(true);
            try {
                const translated = await translateText(reading, getLanguageName(language));
                setReading(translated);
            } catch (e) {
                console.error("Translation error", e);
            } finally {
                setIsLoading(false);
            }
        };
        handleLangShift();
    }
    prevLangRef.current = language;
  }, [language, reading, isLoading]);

  useEffect(() => {
    const cached = localStorage.getItem('glyph_user_details');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFormData(prev => ({ ...prev, name: parsed.name || '', dob: parsed.dob || '', tob: parsed.tob || '', pob: parsed.pob || '' }));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setReading('');
    setAdvancedReport(null);
    setEngineData(null);
    setIsPaid(false);
    setError('');
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSmartDateChange = (date: string) => { setFormData(prev => ({ ...prev, dob: date })); setError(''); };
  const handleSmartTimeChange = (time: string) => { setFormData(prev => ({ ...prev, tob: time })); setError(''); };
  const handleSmartCityChange = (city: string, coordinates?: {lat: number, lng: number}) => {
    setFormData(prev => ({ ...prev, pob: city }));
    if (coordinates) setCoords(coordinates);
    setError('');
  };

  const handleGetReading = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validationService.isValidName(formData.name)) { setError('Please enter a valid name.'); return; }
    if (!validationService.isValidDate(formData.dob)) { setError('Please enter a valid Date of Birth.'); return; }

    localStorage.setItem('glyph_user_details', JSON.stringify(formData));
    setIsLoading(true);
    setError('');

    try {
        let calculatedStats = null;
        if (mode === 'numerology') {
          calculatedStats = calculateNumerology({ name: formData.name, dob: formData.dob });
        } else {
          calculatedStats = calculateAstrology({ name: formData.name, dob: formData.dob, tob: formData.tob, pob: formData.pob, lat: coords?.lat, lng: coords?.lng });
        }
        setEngineData(calculatedStats);

        const result = await getAstroNumeroReading({ mode, ...formData, language: getLanguageName(language) });
        setReading(result.reading);
        saveReading({
          type: mode,
          title: `${mode.toUpperCase()} reading for ${formData.name}`,
          content: result.reading,
          meta_data: calculatedStats
        });
    } catch (err: any) {
        setError(`The Oracle is busy. Realignment needed.`);
    } finally {
        setIsLoading(false);
    }
  }, [formData, mode, language, coords, saveReading]);
  
  const handleReadMore = () => {
    if (!reading) return;
    const title = mode === 'astrology' ? 'Your Astrology Destiny' : 'Your Numerology Summary';
    
    openPayment(async () => {
      setIsPaid(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (mode === 'astrology' && !advancedReport) {
        setIsLoading(true);
        try {
          const report = await generateAdvancedAstroReport({ ...formData, language: getLanguageName(language) }, engineData);
          setAdvancedReport(report);
        } finally {
          setIsLoading(false);
        }
      }
    }, title, mode === 'astrology' ? 99 : 49);
  };

  // Mock Data Construction for Enhanced Report
  const enhancedData = engineData ? {
    userName: formData.name,
    birthDate: formData.dob,
    lifePathNumber: engineData.coreNumbers?.bhagyank || 7,
    destinyNumber: engineData.coreNumbers?.namank || 5,
    birthNumber: engineData.coreNumbers?.mulank || 9,
    soulUrgeNumber: 4,
    currentYear: new Date().getFullYear(),
    predictions: [
      { month: 'Jan', summary: 'New beginnings in career.', energyLevel: 5, type: 'positive' },
      { month: 'Feb', summary: 'Focus on health required.', energyLevel: 3, type: 'neutral' },
      { month: 'Mar', summary: 'Travel brings clarity.', energyLevel: 4, type: 'positive' },
      { month: 'Apr', summary: 'Auspicious connections.', energyLevel: 5, type: 'positive' },
      { month: 'May', summary: 'Financial growth manifests.', energyLevel: 4, type: 'positive' },
      { month: 'Jun', summary: 'Refinement of purpose.', energyLevel: 3, type: 'neutral' },
      { month: 'Jul', summary: 'Spirituality deepens.', energyLevel: 5, type: 'positive' },
      { month: 'Aug', summary: 'Power dynamics shift.', energyLevel: 2, type: 'negative' },
      { month: 'Sep', summary: 'Success through grit.', energyLevel: 4, type: 'positive' },
      { month: 'Oct', summary: 'Harmony returns.', energyLevel: 5, type: 'positive' },
      { month: 'Nov', summary: 'Vision takes form.', energyLevel: 4, type: 'positive' },
      { month: 'Dec', summary: 'Cycles complete.', energyLevel: 3, type: 'neutral' }
    ],
    strengths: ['Analytical Depth', 'Karmic Resilience', 'Social Charm'],
    challenges: ['Impatience', 'Over-analysis', 'Boundary Setting'],
    remedies: [
      { title: 'Morning Surya Mantra', icon: '🕉️', description: 'Recite 108 times at dawn to align with solar energy.', frequency: 'Daily' },
      { title: 'Yellow Sapphire Seal', icon: '💎', description: 'Wear a yellow stone on the index finger for wisdom.', frequency: 'Continuous' },
      { title: 'Silent Meditation', icon: '🧘', description: '20 minutes of sunya meditation before sleep.', frequency: 'Nightly' }
    ],
    planetaryInfluences: [
      { planet: 'Jupiter', symbol: '♃', percentage: 85, color: '#D97706', description: 'Brings immense expansion and spiritual growth.' },
      { planet: 'Mars', symbol: '♂', percentage: 65, color: '#EF4444', description: 'Drives action and ambitious execution.' },
      { planet: 'Sun', symbol: '☉', percentage: 92, color: '#F59E0B', description: 'The core soul power and authoritative spark.' },
      { planet: 'Mercury', symbol: '☿', percentage: 74, color: '#10B981', description: 'Intellectual clarity and sharp communication.' },
      { planet: 'Saturn', symbol: '♄', percentage: 55, color: '#374151', description: 'Lessons through discipline and patience.' }
    ],
    energyDimensions: [
      { dimension: 'Physical', score: 8 },
      { dimension: 'Emotional', score: 7 },
      { dimension: 'Mental', score: 9 },
      { dimension: 'Spiritual', score: 6 },
      { dimension: 'Social', score: 7 },
      { dimension: 'Material', score: 8 }
    ]
  } : null;

  return (
    <div className={`max-w-4xl mx-auto relative pb-24 transition-colors duration-500 ${isLight ? 'text-amber-950' : 'text-amber-50'}`}>
      <Link to="/home" className={`inline-flex items-center transition-colors mb-8 group ${isLight ? 'text-amber-800 hover:text-amber-950' : 'text-amber-200 hover:text-amber-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t('backToHome')}
      </Link>

      {!isPaid && (
      <Card className={`mb-10 p-10 border-2 shadow-2xl transition-all duration-500 ${isLight ? 'bg-white/80 border-amber-200 shadow-amber-200/40' : 'border-amber-500/20'}`}>
        <h2 className={`text-4xl font-cinzel font-black text-center mb-3 tracking-widest uppercase ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>{mode === 'astrology' ? t('astrologyReading') : t('numerologyReading')}</h2>
        <p className={`text-center mb-12 font-lora italic text-lg ${isLight ? 'text-amber-800/70' : 'text-amber-100/60'}`}>Consult ancient wisdom to reveal your path.</p>

        <form onSubmit={handleGetReading} className="grid md:grid-cols-2 gap-8 lg:gap-10">
          <div className="md:col-span-2">
            <label className={`block mb-2 font-cinzel text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>{t('fullName')}</label>
            <input name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50'}`} placeholder="Seeker's Name" />
          </div>
          <div className={mode === 'numerology' ? "md:col-span-2" : ""}>
            <SmartDatePicker value={formData.dob} onChange={handleSmartDateChange} />
          </div>
          {mode === 'astrology' && (
            <>
              <div><SmartCitySearch value={formData.pob} onChange={handleSmartCityChange} /></div>
              <div><SmartTimePicker value={formData.tob} date={formData.dob} onChange={handleSmartTimeChange} /></div>
            </>
          )}
          <div className="md:col-span-2 text-center mt-8">
            <Button type="submit" disabled={isLoading} className={`w-full md:w-auto px-20 py-5 text-xl font-cinzel font-bold tracking-[0.2em] uppercase rounded-full shadow-xl ${isLight ? 'bg-gradient-to-r from-amber-700 to-orange-800 border-none' : 'bg-gradient-to-r from-amber-700 to-maroon-900 border-amber-500/50'}`}>{isLoading ? 'Channeling...' : 'Unlock Destiny'}</Button>
          </div>
        </form>
        {error && <p className="text-red-600 font-bold text-center mt-10 bg-red-50 p-4 rounded-xl border border-red-200 animate-shake">{error}</p>}
      </Card>
      )}
      
      {(isLoading || reading || advancedReport) && (
        <div className="animate-fade-in-up">
          {isLoading ? (
            <ReportLoader />
          ) : !isPaid ? (
            <ServiceResult 
              serviceName={mode}
              serviceIcon={mode === 'astrology' ? '🌟' : '🔢'}
              previewText={reading}
              onRevealReport={handleReadMore}
              isAdmin={isAdmin}
              onAdminBypass={() => setIsPaid(true)}
            />
          ) : (
            <TemplatedReportWrapper template={selectedTemplate}>
              {mode === 'astrology' && advancedReport ? (
                <VedicReportRenderer report={advancedReport} />
              ) : (
                enhancedData && <EnhancedNumerologyReport data={enhancedData} />
              )}
            </TemplatedReportWrapper>
          )}
        </div>
      )}
    </div>
  );
};

export default NumerologyAstrology;