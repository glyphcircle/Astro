
import React, { useState, useCallback, useRef, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { getFaceReading } from '../services/geminiService';
import { calculateFaceReading, FaceAnalysis } from '../services/faceReadingEngine';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';
import Card from './shared/Card';

const FaceReading: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reading, setReading] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<FaceAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user } = useAuth();
  const { db } = useDb();

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  // Dynamic Price & Image
  const serviceConfig = db.services?.find((s: any) => s.id === 'face-reading');
  const servicePrice = serviceConfig?.price || 49;
  const reportImage = db.image_assets?.find((a: any) => a.id === 'report_bg_face')?.path || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800";

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const handleStartCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Please check permissions or upload a file.");
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "face_capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
            setImagePreview(URL.createObjectURL(blob));
            handleStopCamera();
            setReading('');
            setAnalysisData(null);
            setError('');
            setIsPaid(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setReading('');
      setAnalysisData(null);
      setError('');
      setIsPaid(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = {
          en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
          bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French',
          ar: 'Arabic', pt: 'Portuguese'
      };
      return map[code] || 'English';
  };

  const handleGetReading = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image of your face first.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setReading('');
    setAnalysisData(null);
    setError('');

    const timer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + (Math.random() * 8);
        });
    }, 600);

    try {
      const result = await getFaceReading(imageFile, getLanguageName(language));
      clearInterval(timer);
      setProgress(100);
      if (result.rawMetrics) {
          const analysis = calculateFaceReading(result.rawMetrics);
          setAnalysisData(analysis);
      }
      setReading(result.textReading);
    } catch (err: any) {
      clearInterval(timer);
      setError(`Failed to get reading: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, language]);
  
  const handleReadMore = () => {
    openPayment(() => {
        setIsPaid(true);
    }, 'Face Reading', servicePrice);
  };

  const renderVedicDashboard = () => {
      if (!analysisData) return null;
      const { zones, planetary, charts } = analysisData;

      return (
          <div className="space-y-6 mt-6 animate-fade-in-up">
              <div className="bg-black/30 p-4 rounded border border-amber-500/10">
                  <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Mukha Trikona (3 Zones)</h4>
                  <div className="space-y-3 mb-3">
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-amber-100">Upper (Forehead)</span>
                              <span className="text-amber-400 font-bold">{zones.upper}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full">
                              <div className="h-full bg-blue-500" style={{ width: `${zones.upper}%` }}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-amber-100">Middle (Eyes/Nose)</span>
                              <span className="text-amber-400 font-bold">{zones.middle}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full">
                              <div className="h-full bg-green-500" style={{ width: `${zones.middle}%` }}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-amber-100">Lower (Mouth/Chin)</span>
                              <span className="text-amber-400 font-bold">{zones.lower}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full">
                              <div className="h-full bg-red-500" style={{ width: `${zones.lower}%` }}></div>
                          </div>
                      </div>
                  </div>
                  <div className="text-center bg-gray-800/50 p-2 rounded text-xs text-amber-200">
                      Dominant: <strong className="text-white">{zones.dominance}</strong> ({analysisData.personality.primary})
                  </div>
              </div>

              <div className="bg-black/30 p-4 rounded border border-amber-500/10">
                  <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Planetary Influences</h4>
                  <div className="grid grid-cols-4 gap-2">
                      {Object.entries(planetary).map(([planet, score]) => (
                          <div key={planet} className="bg-gray-900 p-2 rounded text-center border border-gray-700">
                              <div className="text-[10px] uppercase text-gray-400 mb-1">{planet}</div>
                              <div className={`font-bold text-sm ${(score as number) > 80 ? 'text-green-400' : 'text-amber-100'}`}>{score as number}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col gap-12 items-center">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
          <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-amber-300 mb-2">{t('aiFaceReading')}</h2>
            <p className="text-amber-100/70">{t('uploadFacePrompt')}</p>
          </div>

          <div className="flex flex-col gap-8 items-center w-full">
              {/* INPUT SECTION */}
              <div className="w-full max-w-md">
                {isCameraOpen ? (
                    <div className="w-full relative bg-black rounded-lg overflow-hidden border-2 border-amber-500 shadow-xl">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover transform scale-x-[-1]" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                            <button onClick={handleStopCamera} className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <button onClick={handleCapture} className="bg-white/90 hover:bg-white text-black p-4 rounded-full shadow-lg backdrop-blur-sm border-4 border-amber-500/50 transform active:scale-95 transition-transform">
                                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <label htmlFor="face-upload" className="w-full">
                          <div className="w-full h-64 border-2 border-dashed border-amber-400 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-amber-900/20 transition-colors bg-gray-900/50">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Face preview" className="object-contain h-full w-full rounded-lg" />
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-amber-200">{t('uploadInstruction')}</span>
                              </>
                            )}
                          </div>
                        </label>
                        <input id="face-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <div className="mt-4">
                             <Button onClick={handleStartCamera} className="w-full bg-gray-800 hover:bg-gray-700 border-gray-600 text-sm py-2 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Take Selfie
                             </Button>
                        </div>
                    </div>
                )}
                {imageFile && !isCameraOpen && (
                  <Button onClick={handleGetReading} disabled={isLoading} className="mt-6 w-full">
                      {isLoading ? t('analyzing') : t('getYourReading')}
                  </Button>
                )}
              </div>

              {/* RESULTS SECTION - STACKED */}
              <div className="w-full max-w-5xl">
                {isLoading && <ProgressBar progress={progress} message="Mapping Facial Landmarks..." estimatedTime="Approx. 10 seconds" />}
                {error && <p className="text-red-400 text-center">{error}</p>}
                
                {analysisData && !isLoading && (
                   <div className="space-y-8 animate-fade-in-up">
                        {renderVedicDashboard()}
                        {!isPaid ? (
                            <Card className="p-6 border-l-4 border-amber-500 bg-gray-900/80">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-500/20">
                                    <span className="text-xl">🕉️</span>
                                    <h4 className="text-amber-300 font-cinzel font-bold text-sm">Vedic Insight Summary</h4>
                                </div>
                                <div className="space-y-2 mb-6 font-lora text-amber-100/90 text-sm italic">
                                   {reading.split('\n').slice(0, 4).map((line, i) => (
                                       <p key={i}>{line}</p>
                                   ))}
                                </div>
                                <div className="flex flex-col gap-2">
                                   <Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">{t('readMore')}</Button>
                                   {isAdmin && <button onClick={() => setIsPaid(true)} className="text-xs text-amber-500 hover:text-amber-300 underline font-mono text-center">👑 Admin Access: Skip Payment</button>}
                               </div>
                            </Card>
                        ) : (
                            <FullReport reading={reading} title={t('aiFaceReading')} imageUrl={cloudManager.resolveImage(reportImage)} />
                        )}
                   </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
};

export default FaceReading;
