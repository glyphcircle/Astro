
import { getAstroNumeroReading, generateAdvancedAstroReport, translateText } from '../services/geminiService';
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Removed duplicate import from puterService to fix identifier collision
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
  // ✅ REFS FOR AUTO-SCROLL
  const reportPreviewRef = useRef<HTMLDivElement>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
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
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const isAdmin = user && ['master@gylphcircle.com', 'admin@gylphcircle.com', 'admin@glyph.circle'].includes(user.email);

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
      bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French',
      ar: 'Arabic', pt: 'Portuguese'
    };
    return map[code] || 'English';
  };

  /**
   * Registry check for existing reports
   */
  const checkRegistryForExistingReport = useCallback(async () => {
    if (!user?.id || !formData.name || !formData.dob) return false;

    try {
      setIsCheckingRegistry(true);
      console.log('🔍 [DB] Checking registry for', mode, '...');

      const result = await dbService.checkAlreadyPaid(mode, formData);

      if (result.exists) {
        console.log('✅ [DB] SACRED MATCH IDENTIFIED! Order:', result.transaction.order_id);
        setAlreadyPaid({ transaction: result.transaction, reading: result.reading });
        setShowCachedReport(true);
        setIsPaid(false);
        setPaymentSuccess(false);
        return true;
      }

      console.log('📭 [DB] No matching past transaction for', mode);
      setAlreadyPaid(null);
      setShowCachedReport(false);
      return false;

    } catch (err: any) {
      console.error('❌ [DB] Registry search error:', err);
      return false;
    } finally {
      setIsCheckingRegistry(false);
    }
  }, [user?.id, formData, mode]);

  const handleDownloadPDF = async () => {
    const reportElementId = mode === 'astrology'
      ? 'astrology-report-content'
      : 'numerology-report-content';

    console.log('📄 [PDF] Download initiated for:', reportElementId);

    if (showCachedReport && !isPaid) {
      setIsPaid(true);
      setShowCachedReport(false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      const safeName = formData.name?.trim().length > 0
        ? formData.name.trim().replace(/\s+/g, '-')
        : 'user';

      const filename = `${mode}-report-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`;

      await generatePDF(reportElementId, {
        filename,
        quality: 0.9,
        marginSide: 10,
      });

      console.log('✅ [PDF] Download completed');
    } catch (error) {
      console.error('❌ [PDF] Download failed:', error);
      alert('PDF generation failed. Please ensure the report is fully loaded and try again.');
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
    if (alreadyPaid && showCachedReport) {
      const metadata = alreadyPaid.transaction.metadata;
      const isAstro = mode === 'astrology';
      const hasChanged = (
        formData.name !== metadata.name ||
        formData.dob !== metadata.dob ||
        (isAstro && formData.tob !== metadata.tob) ||
        (isAstro && formData.pob !== metadata.pob)
      );

      if (hasChanged) {
        setShowCachedReport(false);
        setAlreadyPaid(null);
        setIsPaid(false);
      }
    }
  }, [formData, alreadyPaid, showCachedReport, mode]);

  useEffect(() => {
    const savedReport = sessionStorage.getItem('viewReport');
    if (savedReport) {
      try {
        const { reading: savedReading, isPaid: savedIsPaid, timestamp } = JSON.parse(savedReport);
        if (Date.now() - timestamp < 300000 && savedReading.type === mode) {
          setReading(savedReading.content);
          setEngineData(savedReading.meta_data);
          setFormData({
            name: savedReading.meta_data?.userName || '',
            dob: savedReading.meta_data?.birthDate || '',
            tob: savedReading.meta_data?.tob || '',
            pob: savedReading.meta_data?.pob || ''
          });
          setIsPaid(savedIsPaid);
          setIsRestoredSession(true);
          sessionStorage.removeItem('viewReport');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } catch (e) {
        sessionStorage.removeItem('viewReport');
      }
    }

    const savedState = reportStateManager.loadReportState(mode);
    if (savedState && (savedState.isPaid || savedState.reading)) {
      setFormData(savedState.formData);
      setReading(savedState.reading);
      setEngineData(savedState.engineData);
      setAdvancedReport(savedState.advancedReport || null);
      setIsPaid(savedState.isPaid);
      setIsRestoredSession(true);

      if (savedState.isPaid) {
        setTimeout(() => {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }, 300);
      }
    }
  }, [mode]);

  useEffect(() => {
    const flag = sessionStorage.getItem('autoDownloadPDF');
    if (flag && isPaid && reading) {
      sessionStorage.removeItem('autoDownloadPDF');
      setTimeout(() => handleDownloadPDF(), 1500);
    }
  }, [isPaid, reading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ MODIFIED: Added auto-scroll after generating reading
  const handleGetReading = useCallback(async (e?: React.FormEvent) => {
  if (e) e.preventDefault();

  // Validation
  if (!validationService.isValidName(formData.name)) {
    setError('Please enter a valid name.');
    return;
  }
  if (!validationService.isValidDate(formData.dob)) {
    setError('Please enter a valid Date of Birth.');
    return;
  }

  // Reset state
  localStorage.setItem('glyph_user_details', JSON.stringify(formData));
  setIsLoading(true);
  setError('');
  setReading('');
  setAdvancedReport(null);
  setEngineData(null);
  setIsPaid(false);
  setPaymentSuccess(false);
  setAlreadyPaid(null);
  setShowCachedReport(false);

  try {
    // Calculate stats
    let calculatedStats = null;
    if (mode === 'numerology') {
      calculatedStats = calculateNumerology({ name: formData.name, dob: formData.dob });
    } else {
      calculatedStats = calculateAstrology({
        name: formData.name,
        dob: formData.dob,
        tob: formData.tob,
        pob: formData.pob,
        lat: coords?.lat,
        lng: coords?.lng
      });
    }

    // Generate reading
    setEngineData(calculatedStats);
    const result = await getAstroNumeroReading({
      mode,
      ...formData,
      language: getLanguageName(language)
    });
    
    // Update state
    setReading(result.reading);
    setIsLoading(false);

    // Save state
    reportStateManager.saveReportState(mode, {
      formData,
      reading: result.reading,
      engineData: calculatedStats,
      isPaid: false
    });

    // ✅ SCROLL TO PREVIEW - Multi-method approach
    console.log('📜 Preparing to scroll...');
    
    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const scrollToPreview = () => {
      const element = reportPreviewRef.current;
      
      if (element) {
        console.log('✅ Scrolling to report preview');
        
        // Primary method
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      } else {
        console.warn('⚠️ Preview ref not found, using fallback scroll');
        
        // Fallback: Scroll down by viewport height
        window.scrollTo({ 
          top: window.innerHeight * 0.8, 
          behavior: 'smooth' 
        });
      }
    };

    // Execute scroll after render
    requestAnimationFrame(() => {
      setTimeout(scrollToPreview, 300);
    });

  } catch (err: any) {
    console.error('❌ Reading generation error:', err);
    setError(`The Oracle is busy. Realignment needed.`);
    setIsLoading(false);
  }
}, [formData, mode, language, coords, reportPreviewRef]);

// Update proceedToPayment:
const proceedToPayment = useCallback(() => {
  // ✅ LOCK: Prevent duplicate payment processing
  if (paymentProcessingRef.current) {
    console.warn('⚠️ Payment already in progress, ignoring duplicate call');
    return;
  }

  if (isCheckingRegistry) return;

  if (alreadyPaid && showCachedReport) {
    setIsPaid(true);
    setShowCachedReport(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const title = mode === 'astrology' ? 'Your Astrology Destiny' : 'Your Numerology Summary';
  const price = mode === 'astrology' ? 99 : 49;

  // ✅ SET LOCK
  paymentProcessingRef.current = true;
  console.log('🔒 Payment processing locked');

  openPayment(async (paymentDetails?: any) => {
    try {
      setPaymentSuccess(true);
      setIsPaid(true);

      // Generate unique IDs
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const orderId = `ORD-${user?.id?.substr(0, 8)}-${mode}-${timestamp}-${randomId}`;
      const transactionId = `TXN-${timestamp}-${randomId}`;

      console.log('💳 Processing payment:', orderId);

      const savedReading = await dbService.saveReading({
        user_id: user?.id,
        type: mode,
        title: `${mode.toUpperCase()} Reading for ${formData.name}`,
        subtitle: formData.dob,
        content: reading,
        meta_data: engineData,
        is_paid: true,
      });

      const readingId = savedReading?.data?.id;
      
      if (readingId) {
        await dbService.recordTransaction({
          user_id: user?.id,
          service_type: mode,
          service_title: title,
          amount: price,
          currency: 'INR',
          payment_method: paymentDetails?.method || 'test',
          payment_provider: paymentDetails?.provider || 'manual',
          order_id: orderId,
          transaction_id: transactionId,
          reading_id: readingId,
          status: 'success',
          metadata: { ...formData, paymentTimestamp: new Date().toISOString() },
        });
      }

      reportStateManager.saveReportState(mode, {
        formData,
        reading,
        advancedReport: null,
        engineData,
        isPaid: true
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (mode === 'astrology' && !advancedReport) {
        setIsLoading(true);
        try {
          const report = await generateAdvancedAstroReport({
            ...formData,
            language: getLanguageName(language)
          }, engineData);
          setAdvancedReport(report);
          reportStateManager.saveReportState(mode, {
            formData,
            reading,
            advancedReport: report,
            engineData,
            isPaid: true
          });
        } catch (e) {
          console.error("Advanced report failed", e);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (dbErr) {
      console.error("❌ Database sync error:", dbErr);
    } finally {
      // ✅ UNLOCK after 2 seconds
      setTimeout(() => {
        paymentProcessingRef.current = false;
        console.log('🔓 Payment processing unlocked');
      }, 2000);
    }
  }, title, price);
}, [mode, formData, reading, engineData, user, openPayment, language, advancedReport, isCheckingRegistry, alreadyPaid, showCachedReport]);

  // ✅ MODIFIED: Added scroll to payment section when no saved report found
  const handleReadMore = async () => {
    if (!reading) return;

    if (alreadyPaid && showCachedReport) {
      setIsPaid(true);
      setShowCachedReport(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isCheckingRegistry) {
      alert('Registry check in progress. Please wait a moment and try again.');
      return;
    }

    const matchFound = await checkRegistryForExistingReport();

    if (!matchFound) {
      // ✅ NO SAVED REPORT - TRIGGER PAYMENT AND SCROLL TO PAYMENT SECTION
      proceedToPayment();
      
      // Note: Payment modal will open, so we don't scroll yet
      // The scroll happens after payment is complete in proceedToPayment
    } else {
      // ✅ SAVED REPORT FOUND - SCROLL TO TOP
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative pb-24 transition-colors duration-500" style={{ color: isLight ? '#78350f' : '#fef3c7' }}>
      <SmartBackButton
        label={t('backToHome')}
        fallbackRoute="/home"
        className={`inline-flex items-center transition-colors mb-8 group ${isLight ? 'text-amber-800 hover:text-amber-950' : 'text-amber-200 hover:text-amber-400'}`}
      />

      {/* Already Paid Banner */}
      {showCachedReport && alreadyPaid && (
        <div className={`rounded-2xl p-6 mb-8 shadow-xl border-2 animate-fade-in-up ${isLight ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300' : 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/40'}`}>
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">✨</span>
                <div>
                  <h3 className={`font-cinzel font-black text-2xl uppercase tracking-widest mb-1 ${isLight ? 'text-emerald-800' : 'text-green-400'}`}>
                    Already Purchased Today!
                  </h3>
                  <p className={`text-sm italic font-lora ${isLight ? 'text-emerald-700' : 'text-green-300/70'}`}>
                    Retrieved from your sacred registry - No additional charge.
                  </p>
                </div>
              </div>

              <div className={`rounded-xl p-5 mb-6 border ${isLight ? 'bg-white/60 border-emerald-200' : 'bg-black/30 border-green-500/10'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div><span className={`uppercase font-semibold ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Order ID:</span> <span className={`ml-2 font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{alreadyPaid.transaction.order_id}</span></div>
                  <div><span className={`uppercase font-semibold ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Amount:</span> <span className={`ml-2 font-bold ${isLight ? 'text-emerald-700' : 'text-green-400'}`}>₹{alreadyPaid.transaction.amount}</span></div>
                  <div><span className={`uppercase font-semibold ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Time:</span> <span className={`ml-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>{new Date(alreadyPaid.transaction.created_at).toLocaleTimeString()}</span></div>
                  <div><span className={`uppercase font-semibold ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Status:</span> <span className={`ml-2 uppercase font-bold ${isLight ? 'text-emerald-700' : 'text-green-400'}`}>AUTHENTICATED</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  setIsPaid(true);
                  setShowCachedReport(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-6 py-3 font-bold rounded-full text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}
              >
                📄 View Full Report
              </button>

              <button
                onClick={handleResetForNewReading}
                className={`px-6 py-3 font-cinzel font-black uppercase tracking-widest rounded-full text-[10px] transition-all shadow-lg active:scale-95 ${isLight ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-600 hover:bg-amber-500 text-black'}`}
              >
                🆕 Generate New Reading
              </button>

              <button
                onClick={handleDownloadPDF}
                className={`px-6 py-3 font-bold rounded-full text-[10px] uppercase tracking-widest transition-all ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-800 hover:bg-gray-700 text-amber-200'}`}
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentSuccess && !isLoading && (
        <div className={`mb-6 p-4 rounded-lg text-center transition-all duration-1000 ${isLight ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-green-900/30 text-green-300 border-2 border-green-700'} animate-fade-out`}>
          ✅ Payment successful! Your complete report is ready below.
        </div>
      )}

      {isRestoredSession && !isLoading && isPaid && !showCachedReport && (
        <div className={`mb-6 p-4 rounded-lg text-center animate-fade-in-up ${isLight ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-blue-900/30 text-blue-300 border-2 border-green-700'}`}>
          ℹ️ Your previous report has been restored. Generated {reportStateManager.getReportAge(mode)} minutes ago.
          <button onClick={handleResetForNewReading} className="ml-4 underline font-bold uppercase text-[10px] tracking-widest">Start Fresh</button>
        </div>
      )}

      {!isPaid && (
        <Card className={`mb-10 p-10 border-2 shadow-2xl transition-all duration-500 ${isLight ? 'bg-white/80 border-amber-200 shadow-amber-200/40' : 'border-amber-500/20'}`}>
          <h2 className={`text-4xl font-cinzel font-black text-center mb-3 tracking-widest uppercase ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
            {mode === 'astrology' ? t('astrologyReading') : t('numerologyReading')}
          </h2>
          <p className={`text-center mb-12 font-lora italic text-lg ${isLight ? 'text-amber-800/70' : 'text-amber-100/60'}`}>
            Consult ancient wisdom to reveal your path.
          </p>

          <form onSubmit={handleGetReading} className="grid md:grid-cols-2 gap-8 lg:gap-10">
            <div className="md:col-span-2">
              <label className={`block mb-2 font-cinzel text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                {t('fullName')}
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50'}`}
                placeholder="Seeker's Name"
                required
              />
            </div>

            <div className={mode === 'numerology' ? 'md:col-span-2' : ''}>
              <SmartDatePicker
                value={formData.dob}
                onChange={(d) => setFormData(p => ({ ...p, dob: d }))}
              />
            </div>

            {mode === 'astrology' && (
              <>
                <div><SmartCitySearch value={formData.pob} onChange={(c) => setFormData(p => ({ ...p, pob: c }))} /></div>
                <div><SmartTimePicker value={formData.tob} date={formData.dob} onChange={(t) => setFormData(p => ({ ...p, tob: t }))} /></div>
              </>
            )}

            <div className="md:col-span-2 text-center mt-8">
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full md:w-auto px-20 py-5 text-xl font-cinzel font-bold tracking-[0.2em] uppercase rounded-full shadow-xl ${isLight ? 'bg-gradient-to-r from-amber-700 to-orange-800 border-none' : 'bg-gradient-to-r from-amber-700 to-maroon-900 border-amber-500/50'}`}
              >
                {isLoading ? 'Channeling...' : 'Unlock Destiny'}
              </Button>
            </div>
          </form>

          {error && <p className="text-red-600 font-bold text-center mt-10 bg-red-50 p-4 rounded-xl border border-red-200 animate-shake">{error}</p>}
        </Card>
      )}

      {/* ✅ REPORT PREVIEW SECTION WITH REF */}
      {(isLoading || reading || advancedReport) && (
        <div 
          ref={reportPreviewRef}
          className="animate-fade-in-up"
          style={{ scrollMarginTop: '100px' }}
        >
          {isLoading && !isPaid ? (
            <ReportLoader />
          ) : !isPaid && reading ? (
            <ServiceResult
              serviceName={mode.toUpperCase()}
              serviceIcon={mode === 'astrology' ? '⭐' : '🔢'}
              previewText={reading}
              onRevealReport={handleReadMore}
              isAdmin={isAdmin}
              onAdminBypass={() => setIsPaid(true)}
            />
          ) : isPaid && !isLoading ? (
            <>
              {mode === 'astrology' && engineData ? (
                <EnhancedAstrologyReport
                  data={{ ...engineData, userName: formData.name, birthDate: formData.dob }}
                  onDownload={handleDownloadPDF}
                />
              ) : mode === 'numerology' && engineData ? (
                <EnhancedNumerologyReport
                  reading={reading}
                  engineData={engineData}
                  userName={formData.name}
                  birthDate={formData.dob}
                  onDownload={handleDownloadPDF}
                />
              ) : null}
            </>
          ) : isPaid && isLoading ? (
            <ReportLoader />
          ) : null}
        </div>
      )}

      {/* Checking Registry Modal */}
      {isCheckingRegistry && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250]">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl border border-amber-500/30 max-w-md text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-3 border-4 border-amber-500/10 rounded-full"></div>
                <div className="absolute inset-3 border-4 border-b-amber-400 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-reverse" style={{ animationDuration: '1.5s' }}></div>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">Checking Registry</h3>
            <p className="text-gray-300 mb-2 text-lg">Verifying your purchase history</p>
            <p className="text-gray-500 text-sm mb-6">Consulting the historical archives for your existing decree...</p>

            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumerologyAstrology;
