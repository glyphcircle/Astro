import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPalmReading, translateText } from '../services/aiService';
import { calculatePalmistry, PalmAnalysis } from '../services/palmistryEngine';
import { dbService } from '../services/db';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';
import InlineError from './shared/InlineError';
import Card from './shared/Card';
import SmartBackButton from './shared/SmartBackButton';
import { reportStateManager } from '../services/reportStateManager';
import ServiceResult from './ServiceResult';
import ReportLoader from './ReportLoader';

const Palmistry: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readingText, setReadingText] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<PalmAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isRestored, setIsRestored] = useState(false);
  
  // Registry states
  const [isCheckingRegistry, setIsCheckingRegistry] = useState(false);
  const [retrievedTx, setRetrievedTx] = useState<any>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user } = useAuth();
  const { db } = useDb();
  const { theme } = (useDb() as any).theme || { theme: { mode: 'dark' } };
  const isLight = theme.mode === 'light';

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French', ar: 'Arabic', pt: 'Portuguese' };
    return map[code] || 'English';
  };

  useEffect(() => {
    const savedReport = sessionStorage.getItem('viewReport');
    if (savedReport) {
      try {
        const { reading: savedReading, timestamp } = JSON.parse(savedReport);
        if (Date.now() - timestamp < 300000 && savedReading.type === 'palmistry') {
            setReadingText(savedReading.content);
            setAnalysisData(savedReading.meta_data);
            setIsPaid(true);
            setImagePreview(savedReading.image_url);
            setIsRestored(true);
            sessionStorage.removeItem('viewReport');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
      } catch (e) {
        sessionStorage.removeItem('viewReport');
      }
    }

    const saved = reportStateManager.loadReportState('palmistry');
    if (saved) {
      setReadingText(saved.reading);
      setAnalysisData(saved.engineData);
      setIsPaid(saved.isPaid);
      setImagePreview(saved.formData?.preview || null);
      setIsRestored(true);
    }
  }, []);

  // 🔑 Auto-trigger PDF logic
  useEffect(() => {
    const flag = sessionStorage.getItem('autoDownloadPDF');
    if (flag && isPaid && readingText) {
      sessionStorage.removeItem('autoDownloadPDF');
      console.log('🚀 Auto-triggering PDF from standardized FullReport...');
      setTimeout(() => {
        const btn = document.querySelector('[data-report-download="true"]') as HTMLButtonElement | null;
        btn?.click();
      }, 1500);
    }
  }, [isPaid, readingText]);

  const isAdmin = user?.role === 'admin';
  const serviceConfig = db.services?.find((s: any) => s.id === 'palmistry');
  const servicePrice = serviceConfig?.price || 49;
  const reportImage = db.image_assets?.find((a: any) => a.id === 'report_bg_palmistry')?.path || "https://images.unsplash.com/photo-1542553457-3f92a3449339?q=80&w=800";

  const proceedToPayment = useCallback(() => {
    openPayment(async (paymentDetails?: any) => {
      setIsPaid(true);
      try {
        const savedReading = await dbService.saveReading({
          user_id: user?.id, type: 'palmistry', title: 'Palmistry Analysis', content: readingText,
          image_url: imagePreview || undefined, meta_data: analysisData, is_paid: true
        });
        const readingId = savedReading?.data?.id;
        if (readingId) {
          await dbService.recordTransaction({
            user_id: user?.id, service_type: 'palmistry', service_title: 'Palmistry Reading', amount: servicePrice,
            currency: 'INR', payment_method: paymentDetails?.method || 'test', payment_provider: paymentDetails?.provider || 'manual',
            order_id: paymentDetails?.orderId || `ORD-${Date.now()}`, transaction_id: paymentDetails?.transactionId || `TXN-${Date.now()}`,
            reading_id: readingId, status: 'success', metadata: { name: user?.name, preview: imagePreview, paymentTimestamp: new Date().toISOString() },
          });
        }
        const current = reportStateManager.loadReportState('palmistry');
        if (current) reportStateManager.saveReportState('palmistry', { ...current, isPaid: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) { console.error("❌ Palm save error:", err); }
    }, 'Palmistry Reading', servicePrice);
  }, [user, readingText, imagePreview, analysisData, openPayment, servicePrice]);

  const handleReadMore = async () => {
    if (!readingText) return;
    setIsCheckingRegistry(true);
    try {
        const existing = await dbService.checkAlreadyPaid('palmistry', { name: user?.name });
        if (existing.exists) {
            setRetrievedTx(existing.transaction);
            setReadingText(existing.reading?.content || readingText);
            setIsPaid(false);
            setIsCheckingRegistry(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
    } catch (err) {
        console.error("❌ Palm registry check failed:", err);
    } finally {
        setIsCheckingRegistry(false);
    }
    proceedToPayment();
  };

  return (
    <div className="flex flex-col gap-12 items-center">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
          <SmartBackButton label={t('backToHome')} className="mb-6" />
          
          {retrievedTx && !isPaid && (
            <div className={`
              rounded-2xl p-6 mb-8 shadow-xl border-2 animate-fade-in-up
              ${isLight 
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300' 
                : 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/40'
              }
            `}>
              <div className="flex items-center justify-between gap-6">
                 <div>
                    <h3 className={`font-cinzel font-black text-xl uppercase ${isLight ? 'text-emerald-800' : 'text-green-400'}`}>Already Purchased Today!</h3>
                    <p className={`text-sm italic ${isLight ? 'text-emerald-700' : 'text-green-300/70'}`}>Entry retrieved from history.</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setIsPaid(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">📄 View</button>
                    <button onClick={() => { reportStateManager.clearReportState('palmistry'); window.location.reload(); }} className="bg-amber-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">🆕 New Reading</button>
                 </div>
              </div>
            </div>
          )}

          {isRestored && isPaid && !retrievedTx && (
            <div className="mb-4 p-3 bg-blue-900/20 text-blue-300 text-xs rounded-lg text-center border border-blue-500/20">
               Restored previous palm reading from {reportStateManager.getReportAge('palmistry')}m ago.
            </div>
          )}

          <div className="text-center mb-8"><h2 className="text-3xl font-bold text-amber-300 mb-2">{t('aiPalmReading')}</h2><p className="text-amber-100/70">{t('uploadPalmPrompt')}</p></div>
          <div className="flex flex-col gap-8 items-center w-full">
              {!readingText && !isLoading && (
              <div className="w-full max-w-md">
                <div className="w-full">
                    <label htmlFor="palm-upload" className="w-full"><div className="w-full h-64 border-2 border-dashed border-amber-400 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-amber-900/20 transition-colors relative overflow-hidden bg-gray-900/50">{imagePreview ? <img src={imagePreview} alt="Palm preview" className="object-contain h-full w-full rounded-lg" /> : <><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg><span className="text-amber-200">{t('uploadInstruction')}</span></>}</div></label>
                    <input id="palm-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                </div>
                {imageFile && <Button onClick={() => { setReadingText(''); setIsLoading(true); setProgress(0); const timer = setInterval(() => setProgress(p => p >= 90 ? p : p + (Math.random() * 8)), 600); getPalmReading(imageFile, getLanguageName(language)).then(res => { clearInterval(timer); setProgress(100); setReadingText(res.textReading); setAnalysisData(calculatePalmistry(res.rawMetrics)); reportStateManager.saveReportState('palmistry', { formData: { preview: imagePreview }, reading: res.textReading, engineData: calculatePalmistry(res.rawMetrics), isPaid: false }); }).finally(() => setIsLoading(false)); }} disabled={isLoading} className="mt-6 w-full">{isLoading ? t('analyzing') : t('getYourReading')}</Button>}
              </div>
              )}

              <div className="w-full max-w-5xl">
                {isLoading && !readingText && ( <ProgressBar progress={progress} message="Scanning Lines & Mounts..." /> )}
                {readingText && !isPaid && (
                   <div className="animate-fade-in-up">
                      <ServiceResult serviceName="PALMISTRY" serviceIcon="🖐️" previewText={readingText} onRevealReport={handleReadMore} isAdmin={isAdmin} onAdminBypass={() => setIsPaid(true)} />
                   </div>
                )}
                {isPaid && readingText && (
                  <div className="animate-fade-in-up w-full">
                     <FullReport 
                        reading={readingText} 
                        category="palmistry" 
                        title="Palmistry Analysis" 
                        subtitle={user?.name || 'Seeker of Lines'}
                        imageUrl={cloudManager.resolveImage(reportImage)} 
                        chartData={analysisData}
                     />
                  </div>
                )}
              </div>
          </div>
      </div>

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
            <p className="text-gray-500 text-sm mb-6">Consulting the akashic records for your payment seal...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Palmistry;