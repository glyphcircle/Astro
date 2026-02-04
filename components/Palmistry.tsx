import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPalmReading, translateText } from '../services/geminiService';
import { calculatePalmistry, PalmAnalysis } from '../services/palmistryEngine';
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

const Palmistry: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readingText, setReadingText] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<PalmAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const prevLangRef = useRef('');

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user, saveReading } = useAuth();
  const { db } = useDb();

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French', ar: 'Arabic', pt: 'Portuguese' };
    return map[code] || 'English';
  };

  const isAdmin = user?.role === 'admin';
  const serviceConfig = db.services?.find((s: any) => s.id === 'palmistry');
  const servicePrice = serviceConfig?.price || 49;
  const reportImage = db.image_assets?.find((a: any) => a.id === 'report_bg_palmistry')?.path || "https://images.unsplash.com/photo-1542553457-3f92a3449339?q=80&w=800";

  useEffect(() => {
    if (readingText && !isLoading && prevLangRef.current && prevLangRef.current !== language) {
        const handleLangShift = async () => {
            setIsLoading(true);
            try {
                const translated = await translateText(readingText, getLanguageName(language));
                setReadingText(translated);
            } catch (e) {
                console.error("Translation error", e);
            } finally {
                setIsLoading(false);
            }
        };
        handleLangShift();
    }
    prevLangRef.current = language;
  }, [language, readingText, isLoading]);

  useEffect(() => {
    return () => { if (cameraStream) cameraStream.getTracks().forEach(track => track.stop()); };
  }, [cameraStream]);

  useEffect(() => {
    if (isCameraOpen && cameraRef.current && cameraStream) { cameraRef.current.srcObject = cameraStream; }
  }, [isCameraOpen, cameraStream]);

  const handleStartCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream); setIsCameraOpen(true);
    } catch (err) { setError("Unable to access camera."); }
  };

  const handleStopCamera = () => { if (cameraStream) cameraStream.getTracks().forEach(track => track.stop()); setCameraStream(null); setIsCameraOpen(false); };

  const handleCapture = () => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas'); canvas.width = cameraRef.current.videoWidth; canvas.height = cameraRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(cameraRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "palm_capture.jpg", { type: "image/jpeg" });
            setImageFile(file); setImagePreview(URL.createObjectURL(blob)); handleStopCamera(); setReadingText(''); setAnalysisData(null); setError(''); setIsPaid(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file); setReadingText(''); setAnalysisData(null); setError(''); setIsPaid(false);
      const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file);
    }
  };

  const handleGetReading = useCallback(async () => {
    if (!imageFile) { setError('Please upload an image of your palm first.'); return; }
    setIsLoading(true); setProgress(0); setReadingText(''); setAnalysisData(null); setError('');
    const timer = setInterval(() => setProgress(prev => (prev >= 90 ? prev : prev + (Math.random() * 8))), 600);
    try {
      const result = await getPalmReading(imageFile, getLanguageName(language));
      clearInterval(timer); setProgress(100);
      if (result.rawMetrics) setAnalysisData(calculatePalmistry(result.rawMetrics));
      setReadingText(result.textReading);
      saveReading({ type: 'palmistry', title: 'Palmistry Analysis', content: result.textReading, image_url: imagePreview || undefined });
    } catch (err: any) { clearInterval(timer); setError(`${err.message || 'Failed to analyze palm'}`); } finally { setIsLoading(false); }
  }, [imageFile, language, saveReading, imagePreview]);

  const handleReadMore = () => openPayment(() => setIsPaid(true), 'Palmistry Reading', servicePrice);

  return (
    <div className="flex flex-col gap-12 items-center">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
          <SmartBackButton label={t('backToHome')} className="mb-6" />
          <div className="text-center mb-8"><h2 className="text-3xl font-bold text-amber-300 mb-2">{t('aiPalmReading')}</h2><p className="text-amber-100/70">{t('uploadPalmPrompt')}</p></div>
          <div className="flex flex-col gap-8 items-center w-full">
              <div className="w-full max-w-md">
                {isCameraOpen ? (
                    <div className="w-full relative bg-black rounded-lg overflow-hidden border-2 border-amber-500 shadow-xl">
                        <video ref={cameraRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10"><button onClick={handleStopCamera} className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm">✕</button><button onClick={handleCapture} className="bg-white/90 hover:bg-white text-black p-4 rounded-full shadow-lg backdrop-blur-sm border-4 border-amber-500/50 transform active:scale-95 transition-transform"><div className="w-4 h-4 bg-red-600 rounded-full"></div></button></div>
                    </div>
                ) : (
                    <div className="w-full">
                        <label htmlFor="palm-upload" className="w-full"><div className="w-full h-64 border-2 border-dashed border-amber-400 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-amber-900/20 transition-colors relative overflow-hidden bg-gray-900/50">{imagePreview ? <img src={imagePreview} alt="Palm preview" className="object-contain h-full w-full rounded-lg" /> : <><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg><span className="text-amber-200">{t('uploadInstruction')}</span></>}</div></label>
                        <input id="palm-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <div className="mt-4"><Button onClick={handleStartCamera} className="w-full bg-gray-800 hover:bg-gray-700 border-gray-600 text-sm py-2 flex items-center justify-center gap-2">📷 Take Photo</Button></div>
                    </div>
                )}
                {imageFile && !isCameraOpen && <Button onClick={handleGetReading} disabled={isLoading} className="mt-6 w-full">{isLoading ? t('analyzing') : t('getYourReading')}</Button>}
              </div>
              <div className="w-full max-w-5xl">
                {isLoading && <ProgressBar progress={progress} message={prevLangRef.current !== language ? "Re-aligning Script..." : "Scanning Lines & Mounts..."} estimatedTime="Approx. 10 seconds" />}
                {error && !isLoading && <InlineError message={error} onRetry={handleGetReading} />}
                {analysisData && !isLoading && (
                   <div className="space-y-8 animate-fade-in-up">
                       {!isPaid ? (
                           <Card className="p-6 border-l-4 border-amber-500 bg-gray-900/80">
                               <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-500/20"><span className="text-xl">🔮</span><h4 className="text-amber-300 font-cinzel font-bold text-sm">Vedic Insight Summary</h4></div>
                               <div className="space-y-2 mb-6 font-lora text-amber-100/90 text-sm italic">{readingText.split('\n').slice(0, 4).map((line, i) => <p key={i}>{line}</p>)}</div>
                               <div className="flex flex-col gap-2"><Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">{t('readMore')}</Button>{isAdmin && <button onClick={() => setIsPaid(true)} className="text-xs text-amber-500 hover:text-amber-300 underline font-mono text-center">👑 Admin Access</button>}</div>
                           </Card>
                       ) : <FullReport reading={readingText} category="palmistry" title={t('aiPalmReading')} imageUrl={cloudManager.resolveImage(reportImage)} />}
                   </div>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Palmistry;