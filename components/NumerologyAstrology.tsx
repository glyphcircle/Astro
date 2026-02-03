import React, { useState, useCallback, useEffect, useRef } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { getAstroNumeroReading, generateAdvancedAstroReport, translateText } from '../services/geminiService';
import { calculateNumerology } from '../services/numerologyEngine';
import { calculateAstrology } from '../services/astrologyEngine';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
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
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { db } = useDb();
  const { user, saveReading } = useAuth();

  const prevLangRef = useRef(language);

  const isAdmin = user && ['master@glyphcircle.com', 'admin@glyphcircle.com', 'admin@glyph.circle'].includes(user.email);

  const serviceConfig = db.services?.find((s: any) => s.id === mode);
  const servicePrice = serviceConfig?.price || (mode === 'astrology' ? 99 : 49);

  const assetId = mode === 'numerology' ? 'report_bg_numerology' : 'report_bg_astrology';
  const reportImage = db.image_assets?.find((a: any) => a.id === assetId)?.path 
      || db.services?.find((s:any) => s.id === mode)?.image 
      || "https://images.unsplash.com/photo-1509228627129-6690a87531bc?q=80&w=800";

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

  const validateForm = () => {
    if (!validationService.isValidName(formData.name)) return 'Please enter a valid name.';
    if (!validationService.isValidDate(formData.dob)) return 'Please enter a valid Date of Birth.';
    if (mode === 'astrology') {
      if (!validationService.isNotEmpty(formData.pob)) return 'Place of Birth is required for Astrology.';
      if (!validationService.isValidTime(formData.tob)) return 'Valid Time of Birth is required.';
    }
    return '';
  };

  const handleGetReading = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    localStorage.setItem('glyph_user_details', JSON.stringify(formData));

    setIsLoading(true);
    setProgress(0);
    setReading('');
    setAdvancedReport(null);
    setEngineData(null);
    setError('');
    setIsPaid(false);

    const timer = setInterval(() => { setProgress(prev => (prev >= 90 ? prev : prev + (Math.random() * 6))); }, 350);

    const maxRetries = 3;
    let attempts = 0;

    const performFetch = async () => {
      try {
        let calculatedStats = null;
        if (mode === 'numerology') {
          calculatedStats = calculateNumerology({ name: formData.name, dob: formData.dob });
        } else {
          calculatedStats = calculateAstrology({ name: formData.name, dob: formData.dob, tob: formData.tob, pob: formData.pob, lat: coords?.lat, lng: coords?.lng });
        }
        setEngineData(calculatedStats);

        // First simple reading
        const result = await getAstroNumeroReading({ mode, ...formData, language: getLanguageName(language) });
        
        if (!result.reading || result.reading.trim().length < 50) {
          throw new Error("Message too faint.");
        }

        clearInterval(timer);
        setProgress(100);
        setReading(result.reading);

        saveReading({
          type: mode,
          title: `${mode.toUpperCase()} reading for ${formData.name}`,
          content: result.reading,
          image_url: cloudManager.resolveImage(reportImage),
          meta_data: calculatedStats
        });

      } catch (err: any) {
        attempts++;
        if (attempts < maxRetries) {
          console.warn(`Attempt ${attempts} failed, retrying...`);
          await new Promise(r => setTimeout(r, 1200));
          await performFetch();
        } else {
          clearInterval(timer);
          setError(`The Oracle is currently busy. Please realign your frequencies and try again.`);
        }
      }
    };

    await performFetch();
    setIsLoading(false);
  }, [formData, mode, language, coords, saveReading, reportImage]);
  
  const handleReadMore = () => {
    if (!reading) return;
    const title = mode === 'astrology' ? 'Your Astrology Destiny' : 'Your Numerology Summary';
    
    openPayment(async () => {
      setIsPaid(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // If astrology, generate the rich JSON report now
      if (mode === 'astrology' && !advancedReport) {
        setIsLoading(true);
        try {
          const report = await generateAdvancedAstroReport({ ...formData, language: getLanguageName(language) }, engineData);
          setAdvancedReport(report);
        } catch (e) {
          console.error("Advanced report generation failed", e);
        } finally {
          setIsLoading(false);
        }
      }
    }, title, servicePrice);
  };

  const featureTitle = mode === 'astrology' ? t('astrologyReading') : t('numerologyReading');

  return (
    <div className="max-w-4xl mx-auto relative pb-24">
      <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-8 group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t('backToHome')}
      </Link>

      <Card className="mb-10 p-10 border-amber-500/20 shadow-2xl">
        <h2 className="text-4xl font-cinzel font-black text-center text-amber-300 mb-3 tracking-widest uppercase">{featureTitle}</h2>
        <p className="text-center text-amber-100/60 mb-12 font-lora italic text-lg">Consult the ancient wisdom to reveal your path.</p>

        <form onSubmit={handleGetReading} className="grid md:grid-cols-2 gap-10">
          <div className="md:col-span-2">
            <label className="block text-amber-200 mb-2 font-cinzel text-[10px] font-black uppercase tracking-[0.3em]">{t('fullName')}</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-black/40 border border-amber-500/20 rounded-2xl text-white placeholder-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-lg" placeholder="Seeker's Name" />
          </div>
          <div className={mode === 'numerology' ? "md:col-span-2" : ""}><SmartDatePicker value={formData.dob} onChange={handleSmartDateChange} /></div>
          {mode === 'astrology' && (<><div><SmartCitySearch value={formData.pob} onChange={handleSmartCityChange} /></div><div><SmartTimePicker value={formData.tob} date={formData.dob} onChange={handleSmartTimeChange} /></div></>)}
          <div className="md:col-span-2 text-center mt-8">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-20 py-5 bg-gradient-to-r from-amber-700 to-maroon-900 border-amber-500/50 shadow-[0_0_30px_rgba(139,92,5,0.3)] text-xl font-cinzel font-bold tracking-[0.2em] uppercase rounded-full">
              {isLoading ? 'Channeling...' : 'Unlock Destiny'}
            </Button>
          </div>
        </form>
        {error && <p className="text-red-400 text-center mt-10 bg-red-950/20 p-4 rounded-xl border border-red-500/30 animate-shake">{error}</p>}
      </Card>
      
      {(isLoading || reading || advancedReport) && (
        <div className="animate-fade-in-up">
          {!isPaid ? (
            <Card className="overflow-hidden border-amber-500/40 bg-gray-900/60 backdrop-blur-xl">
              <div className="p-10">
                <h3 className="text-3xl font-cinzel font-black text-amber-300 mb-10 text-center uppercase tracking-[0.3em]">Oracle's First Vision</h3>
                {isLoading ? (
                  <ProgressBar progress={progress} message={prevLangRef.current !== language ? "Re-aligning Script..." : "Observing the celestial dance..."} estimatedTime="~8 seconds" />
                ) : (
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="bg-black/60 p-12 rounded-[2rem] border-2 border-[#d4af37]/40 flex flex-col items-center justify-center min-h-[400px] shadow-inner relative group overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_80%)]"></div>
                      <div className="w-40 h-40 bg-[#0d0d0d] rounded-full border-[5px] border-[#d4af37] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(212,175,55,0.5)] relative z-10 transition-transform group-hover:scale-110 duration-700">
                        <span className="text-7xl drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]">❂</span>
                      </div>
                      <span className="text-[#d4af37] font-cinzel font-black text-3xl tracking-[0.5em] uppercase relative z-10 drop-shadow-sm">{mode}</span>
                    </div>
                    <div className="space-y-10">
                      <div className="relative">
                        <div className="whitespace-pre-wrap italic font-lora text-amber-100/90 leading-relaxed text-2xl line-clamp-6 drop-shadow-lg">
                          "{reading}"
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23]/80 to-transparent"></div>
                      </div>
                      <div className="pt-10 border-t border-amber-500/10 space-y-6">
                        <Button onClick={handleReadMore} className="w-full py-6 bg-gradient-to-r from-amber-600 to-maroon-800 border-amber-400 shadow-2xl font-cinzel font-black tracking-[0.2em] text-xl transform hover:scale-[1.03] active:scale-95">Reveal Complete Report</Button>
                        {isAdmin && <button onClick={() => setIsPaid(true)} className="w-full text-[11px] text-amber-500/60 hover:text-white underline font-mono tracking-widest uppercase transition-colors">Admin Direct Access</button>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            mode === 'astrology' && advancedReport ? (
              <VedicReportRenderer report={advancedReport} />
            ) : (
              <FullReport 
                reading={reading} 
                title={mode === 'astrology' ? 'Your Astrology Destiny' : 'Your Numerology Summary'} 
                imageUrl={reportImage} 
                chartData={{
                  ...engineData,
                  luckyNumbers: mode === 'numerology' ? [engineData?.coreNumbers?.mulank || 7, engineData?.coreNumbers?.bhagyank || 3, (engineData?.coreNumbers?.namank || 9)] : [7, 3, 9],
                  vedicMetrics: [
                    { label: 'Karmic Potential', value: 88 },
                    { label: 'Spiritual Sattva', value: 74 },
                    { label: 'Material Success', value: 92 }
                  ]
                }} 
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default NumerologyAstrology;