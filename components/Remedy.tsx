import React, { useState, useCallback } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { getRemedy } from '../services/aiService';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';

const Remedy: React.FC = () => {
  const [concern, setConcern] = useState('');
  const [reading, setReading] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user } = useAuth();
  const { db } = useDb();

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  // Dynamic Price
  const serviceConfig = db.services?.find((s: any) => s.id === 'remedy');
  const servicePrice = serviceConfig?.price || 49;

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = { en: 'English', hi: 'Hindi', fr: 'French' };
      return map[code] || 'English';
  };

  const handleGetGuidance = useCallback(async () => {
    if (!concern.trim()) { setError('Please describe your concern.'); return; }

    setIsLoading(true);
    setProgress(0);
    setReading('');
    setChartData(null);
    setError('');
    setIsPaid(false);

    const timer = setInterval(() => setProgress(prev => (prev >= 90 ? prev : prev + 10)), 500);

    try {
      const result = await getRemedy(concern, getLanguageName(language));
      clearInterval(timer);
      setProgress(100);
      setReading(result);

      setChartData({
          doshaState: [
              { label: 'Vata', sub: 'Air/Space', value: Math.floor(Math.random() * 50 + 50) },
              { label: 'Pitta', sub: 'Fire', value: Math.floor(Math.random() * 40 + 20) },
              { label: 'Kapha', sub: 'Earth/Water', value: Math.floor(Math.random() * 30 + 10) },
          ]
      });

    } catch (err: any) {
      clearInterval(timer);
      setError(`Failed to get guidance: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [concern, language]);

  const handleReadMore = () => openPayment(() => setIsPaid(true), 'Personal Remedy', servicePrice);

  return (
    <>
      <div>
          <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t('backToHome')}
          </Link>
          <div className="max-w-4xl mx-auto p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-2xl border border-amber-500/20">
            <h2 className="text-3xl font-bold text-center text-amber-300 mb-6">{t('aiGuidance')}</h2>
            <p className="text-center text-amber-100 mb-8">{t('guidancePrompt')}</p>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center w-full">
                <textarea value={concern} onChange={(e) => setConcern(e.target.value)} placeholder={t('describeConcern')} className="w-full h-48 p-4 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder-gray-600 mb-4" />
                <Button onClick={handleGetGuidance} disabled={isLoading} className="w-full">{isLoading ? t('analyzing') : t('getGuidance')}</Button>
              </div>

              <div className="min-h-[16rem] bg-black bg-opacity-30 p-6 rounded-lg border border-amber-500/20 w-full">
                <h3 className="text-2xl font-semibold text-amber-300 mb-4">{t('yourReading')}</h3>
                {isLoading && <ProgressBar progress={progress} message="Channeling Guidance..." estimatedTime="Approx. 8 seconds" />}
                {error && <p className="text-red-400">{error}</p>}
                
                {reading && !isLoading && (
                   <div className="space-y-4 text-amber-100 w-full">
                        {!isPaid ? (
                            <>
                                <div className="relative text-amber-100 leading-relaxed font-lora text-lg italic bg-black/40 p-6 rounded-lg border border-amber-500/20 shadow-inner">
                                    <span className="absolute top-2 left-2 text-4xl text-amber-500/20 font-serif">“</span>
                                    {reading.replace(/#/g, '').replace(/\*\*/g, '').substring(0, 100)}...
                                    <span className="absolute bottom-[-10px] right-4 text-4xl text-amber-500/20 font-serif">”</span>
                                </div>
                                <div className="pt-4 border-t border-amber-500/20 flex flex-col gap-2">
                                   <Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">{t('readMore')}</Button>
                                   {isAdmin && <button onClick={() => setIsPaid(true)} className="text-xs text-amber-500 hover:text-amber-300 underline font-mono">👑 Admin Skip</button>}
                               </div>
                            </>
                        ) : (
                            <FullReport reading={reading} category="remedy" title={t('aiGuidance')} imageUrl="https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800" chartData={chartData} />
                        )}
                   </div>
                )}
                {!isLoading && !reading && !error && <p className="text-amber-200 opacity-60">{t('guidancePlaceholder')}</p>}
              </div>
            </div>
          </div>
      </div>
    </>
  );
};

export default Remedy;