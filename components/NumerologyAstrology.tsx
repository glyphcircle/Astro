import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAstroNumeroReading, generateAdvancedAstroReport } from '../services/geminiService';
import { calculateNumerology } from '../services/numerologyEngine';
import { calculateAstrology } from '../services/astrologyEngine';
import Button from './shared/Button';
import Card from './shared/Card';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';
import { SmartDatePicker, SmartTimePicker, SmartCitySearch } from './SmartAstroInputs';
import { validationService } from '../services/validationService';
import { useTheme } from '../context/ThemeContext';
import ReportLoader from './ReportLoader';
import ServiceResult from './ServiceResult';
import EnhancedNumerologyReport from './EnhancedNumerologyReport';
import EnhancedAstrologyReport from './EnhancedAstrologyReport';
import SmartBackButton from './shared/SmartBackButton';
import { reportStateManager } from '../services/reportStateManager';
import { dbService } from '../services/db';
import { generatePDF } from '../utils/pdfGenerator';

interface NumerologyAstrologyProps {
  mode: 'numerology' | 'astrology';
}

const NumerologyAstrology: React.FC<NumerologyAstrologyProps> = ({ mode }) => {
  const reportPreviewRef = useRef<HTMLDivElement>(null);
  const paymentProcessingRef = useRef(false);
  
  const [formData, setFormData] = useState({ name: '', dob: '', pob: '', tob: '' });
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [reading, setReading] = useState('');
  const [advancedReport, setAdvancedReport] = useState<any>(null);
  const [engineData, setEngineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isRestoredSession, setIsRestoredSession] = useState(false);

  // Registry states
  const [alreadyPaid, setAlreadyPaid] = useState<any>(null);
  const [showCachedReport, setShowCachedReport] = useState(false);
  const [isCheckingRegistry, setIsCheckingRegistry] = useState(false);

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const isAdmin = user && ['master@gylphcircle.com', 'admin@gylphcircle.com'].includes(user.email);

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
      bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French',
      ar: 'Arabic', pt: 'Portuguese'
    };
    return map[code] || 'English';
  };

  const checkRegistryForExistingReport = useCallback(async () => {
    if (!user?.id || !formData.name || !formData.dob) return false;

    try {
      setIsCheckingRegistry(true);
      const timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error('Registry check timeout')), 5000)
      );
      const checkPromise = dbService.checkAlreadyPaid(mode, formData);
      const result = await Promise.race([checkPromise, timeoutPromise]);

      if (result.exists) {
        setAlreadyPaid({ transaction: result.transaction, reading: result.reading });
        setShowCachedReport(true);
        setIsPaid(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('⚠️ Registry search bypassed:', err.message);
      return false;
    } finally {
      setIsCheckingRegistry(false);
    }
  }, [user?.id, formData, mode]);

  const handleDownloadPDF = async () => {
    const reportElementId = mode === 'astrology' ? 'astrology-report-content' : 'numerology-report-content';
    if (showCachedReport && !isPaid) {
      setIsPaid(true);
      setShowCachedReport(false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      const safeName = formData.name?.trim().replace(/\s+/g, '-') || 'seeker';
      const filename = `${mode}-report-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`;
      await generatePDF(reportElementId, { filename, quality: 0.9, marginSide: 10 });
    } catch (error) {
      alert('PDF generation failed. Please try again.');
    }
  };

  const handleResetForNewReading = () => {
    setShowCachedReport(false);
    setAlreadyPaid(null);
    setIsPaid(false);
    setPaymentSuccess(false);
    setReading('');
    setAdvancedReport(null);
    setEngineData(null);
    setIsRestoredSession(false);
    reportStateManager.clearReportState(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const savedState = reportStateManager.loadReportState(mode);
    if (savedState && (savedState.isPaid || savedState.reading)) {
      setFormData(savedState.formData);
      setReading(savedState.reading);
      setEngineData(savedState.engineData);
      setAdvancedReport(savedState.advancedReport || null);
      setIsPaid(savedState.isPaid);
      setIsRestoredSession(true);
    }
  }, [mode]);

  const handleGetReading = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validationService.isValidName(formData.name)) {
      setError('Please enter a valid name.');
      return;
    }
    if (!validationService.isValidDate(formData.dob)) {
      setError('Please enter a valid Date of Birth.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReading('');
    setAdvancedReport(null);
    setEngineData(null);
    setIsPaid(false);

    try {
      const calculatedStats = mode === 'numerology' 
        ? calculateNumerology({ name: formData.name, dob: formData.dob })
        : calculateAstrology({ ...formData, lat: coords?.lat, lng: coords?.lng });

      setEngineData(calculatedStats);
      const result = await getAstroNumeroReading({ mode, ...formData, language: getLanguageName(language) });
      
      setReading(result.reading);
      setIsLoading(false);

      reportStateManager.saveReportState(mode, {
        formData, reading: result.reading, engineData: calculatedStats, isPaid: false
      });

      setTimeout(() => {
        reportPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err: any) {
      setError(`The Oracle is currently disconnected. Please try again.`);
      setIsLoading(false);
    }
  }, [formData, mode, language, coords]);

  const proceedToPayment = useCallback(() => {
    if (paymentProcessingRef.current || isCheckingRegistry) return;

    if (alreadyPaid && showCachedReport) {
      setIsPaid(true);
      setShowCachedReport(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const title = mode === 'astrology' ? 'Your Astrology Destiny' : 'Your Numerology Summary';
    const price = mode === 'astrology' ? 99 : 49;

    paymentProcessingRef.current = true;

    openPayment(async (paymentDetails?: any) => {
      try {
        setPaymentSuccess(true);
        setIsPaid(true);

        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const savedReading = await dbService.saveReading({
          user_id: user?.id,
          type: mode,
          title: `${mode.toUpperCase()} Reading for ${formData.name}`,
          subtitle: formData.dob,
          content: reading,
          meta_data: engineData,
          is_paid: true,
        });

        if (savedReading?.data?.id) {
          await dbService.recordTransaction({
            user_id: user?.id,
            service_type: mode,
            service_title: title,
            amount: price,
            currency: 'INR',
            payment_method: paymentDetails?.method || 'test',
            payment_provider: paymentDetails?.provider || 'manual',
            order_id: orderId,
            reading_id: savedReading.data.id,
            status: 'success',
            metadata: { ...formData, paymentTimestamp: new Date().toISOString() },
          });
        }

        reportStateManager.saveReportState(mode, {
          formData, reading, advancedReport: null, engineData, isPaid: true
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (mode === 'astrology') {
          setIsLoading(true);
          const report = await generateAdvancedAstroReport({ ...formData, language: getLanguageName(language) }, engineData);
          setAdvancedReport(report);
          reportStateManager.saveReportState(mode, {
            formData, reading, advancedReport: report, engineData, isPaid: true
          });
          setIsLoading(false);
        }
      } catch (dbErr) {
        console.error("❌ Sync error:", dbErr);
      } finally {
        setTimeout(() => { paymentProcessingRef.current = false; }, 2000);
      }
    }, title, price);
  }, [mode, formData, reading, engineData, user, openPayment, language, alreadyPaid, showCachedReport]);

  const handleReadMore = async () => {
    if (!reading) return;
    const matchFound = await checkRegistryForExistingReport();
    if (!matchFound) proceedToPayment();
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto relative pb-24 transition-colors duration-500" style={{ color: isLight ? '#78350f' : '#fef3c7' }}>
      <SmartBackButton label={t('backToHome')} fallbackRoute="/home" className="mb-8" />

      {showCachedReport && alreadyPaid && (
        <div className={`rounded-2xl p-6 mb-8 shadow-xl border-2 animate-fade-in-up ${isLight ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300' : 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/40'}`}>
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className={`font-cinzel font-black text-2xl uppercase tracking-widest mb-1 ${isLight ? 'text-emerald-800' : 'text-green-400'}`}>Already Purchased Today!</h3>
              <p className={`text-sm italic font-lora ${isLight ? 'text-emerald-700' : 'text-green-300/70'}`}>Retrieved from your sacred registry.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setIsPaid(true); setShowCachedReport(false); }} className="bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase">View Report</button>
              <button onClick={handleResetForNewReading} className="bg-amber-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase">New Reading</button>
            </div>
          </div>
        </div>
      )}

      {!isPaid && (
        <Card className="mb-10 p-10 border-2 shadow-2xl transition-all duration-500">
          <h2 className="text-4xl font-cinzel font-black text-center mb-12 tracking-widest uppercase">{mode === 'astrology' ? t('astrologyReading') : t('numerologyReading')}</h2>
          <form onSubmit={handleGetReading} className="grid md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block mb-2 font-cinzel text-[10px] font-black uppercase tracking-[0.3em]">{t('fullName')}</label>
              <input name="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="w-full p-4 border-2 rounded-2xl bg-black/10 outline-none" required />
            </div>
            <div className={mode === 'numerology' ? 'md:col-span-2' : ''}>
              <SmartDatePicker value={formData.dob} onChange={(d) => setFormData(p => ({ ...p, dob: d }))} />
            </div>
            {mode === 'astrology' && (
              <>
                <SmartCitySearch value={formData.pob} onChange={(c, coords) => { setFormData(p => ({ ...p, pob: c })); if (coords) setCoords(coords); }} />
                <SmartTimePicker value={formData.tob} date={formData.dob} onChange={(t) => setFormData(p => ({ ...p, tob: t }))} />
              </>
            )}
            <div className="md:col-span-2 text-center mt-8">
              <Button type="submit" disabled={isLoading} className="px-20 py-5 text-xl font-cinzel font-bold tracking-[0.2em] rounded-full uppercase">{isLoading ? 'Channeling...' : 'Unlock Destiny'}</Button>
            </div>
          </form>
          {error && <p className="text-red-600 font-bold text-center mt-6">{error}</p>}
        </Card>
      )}

      <div ref={reportPreviewRef}>
        {isLoading && !isPaid ? <ReportLoader /> : !isPaid && reading ? (
          <ServiceResult serviceName={mode.toUpperCase()} serviceIcon={mode === 'astrology' ? '⭐' : '🔢'} previewText={reading} onRevealReport={handleReadMore} isAdmin={isAdmin} onAdminBypass={() => setIsPaid(true)} />
        ) : isPaid && engineData ? (
          mode === 'astrology' 
            ? <EnhancedAstrologyReport data={{ ...engineData, userName: formData.name, birthDate: formData.dob }} onDownload={handleDownloadPDF} />
            : <EnhancedNumerologyReport reading={reading} engineData={engineData} userName={formData.name} birthDate={formData.dob} onDownload={handleDownloadPDF} />
        ) : null}
      </div>

      {isCheckingRegistry && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Checking Registry</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumerologyAstrology;