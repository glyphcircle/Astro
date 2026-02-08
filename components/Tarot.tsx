import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTarotReading, translateText } from '../services/aiService';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import TarotCard, { TarotCardData } from './TarotCard';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { ACTION_POINTS } from '../services/gamificationConfig';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';
import { SkeletonReport } from './shared/SkeletonLoader';
import ErrorBoundary from './shared/ErrorBoundary';
import SmartBackButton from './shared/SmartBackButton';
import { dbService } from '../services/db';
import ServiceResult from './ServiceResult';
import { useTheme } from '../context/ThemeContext';

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'] as const;
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const MAJOR_NAMES = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];

const GENERATE_DECK = (): TarotCardData[] => {
    const deck: TarotCardData[] = [];
    MAJOR_NAMES.forEach((name, i) => { deck.push({ id: `major-${i}`, number: i, name, type: 'Major' }); });
    SUITS.forEach(suit => { RANKS.forEach((rank, i) => { deck.push({ id: `minor-${suit}-${i}`, number: i + 1, name: `${rank} of ${suit}`, type: 'Minor', suit, rank }); }); });
    return deck;
};

const FULL_DECK = GENERATE_DECK();

const Tarot: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
  const [reading, setReading] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [animatingCard, setAnimatingCard] = useState<{ card: TarotCardData; startRect: DOMRect } | null>(null);
  
  const [isCheckingRegistry, setIsCheckingRegistry] = useState(false);
  const [retrievedTx, setRetrievedTx] = useState<any>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const fullReportRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef('');
  const navigate = useNavigate();

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user, awardKarma } = useAuth();
  const { db } = useDb();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = { en: 'English', hi: 'Hindi', fr: 'French', es: 'Spanish' };
      return map[code] || 'English';
  };

  const isAdmin = user && ['master@gylphcircle.com', 'admin@gylphcircle.com', 'admin@glyph.circle'].includes(user.email);

  useEffect(() => {
    const savedReport = sessionStorage.getItem('viewReport');
    if (savedReport) {
      try {
        const { reading: savedReading, timestamp } = JSON.parse(savedReport);
        if (Date.now() - timestamp < 300000 && savedReading.type === 'tarot') {
            setReading(savedReading.content);
            setSelectedCard(savedReading.meta_data?.card || { name: savedReading.title });
            setIsPaid(true);
            sessionStorage.removeItem('viewReport');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
      } catch (e) {
        sessionStorage.removeItem('viewReport');
      }
    }
  }, []);

  useEffect(() => {
    const flag = sessionStorage.getItem('autoDownloadPDF');
    if (flag && isPaid && reading) {
      sessionStorage.removeItem('autoDownloadPDF');
      setTimeout(() => {
        const btn = document.querySelector('[data-report-download="true"]') as HTMLButtonElement | null;
        btn?.click();
      }, 1500);
    }
  }, [isPaid, reading]);

  useEffect(() => {
    if (reading && !isLoading && prevLangRef.current && prevLangRef.current !== language) {
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
      if (isPaid && reading && fullReportRef.current) {
          setTimeout(() => {
              fullReportRef.current?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
              });
          }, 200);
      }
  }, [isPaid, reading]);

  const shuffledDeck = useMemo(() => {
      const deck = [...FULL_DECK];
      for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
  }, []);

  const generateReading = useCallback(async (card: TarotCardData) => {
    setIsLoading(true); 
    setProgress(0); 
    setReading(''); 
    setError(''); 
    setIsPaid(false);
    const timer = setInterval(() => setProgress(prev => (prev >= 90 ? prev : prev + 15)), 300);
    try {
      const result = await getTarotReading(card.name, getLanguageName(language));
      clearInterval(timer); 
      setProgress(100);
      setReading(result);
      awardKarma(ACTION_POINTS.READING_COMPLETE);
    } catch (err: any) { 
        clearInterval(timer); 
        setError(`${err.message || 'The cosmic connection was interrupted.'}`); 
    } finally { 
        setIsLoading(false); 
    }
  }, [language, awardKarma]);

  const handleCardSelect = useCallback((card: TarotCardData, e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaid || animatingCard || selectedCard) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAnimatingCard({ card, startRect: rect });
    generateReading(card);
  }, [isPaid, animatingCard, selectedCard, generateReading]);
  
  useEffect(() => {
      if (animatingCard) {
          const landingTimer = setTimeout(() => { 
            setSelectedCard(animatingCard.card); 
            setAnimatingCard(null); 
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); 
          }, 1100);
          return () => { 
              clearTimeout(landingTimer); 
          };
      }
  }, [animatingCard]);

  const tarotService = db.services?.find((s: any) => s.id === 'tarot');
  const servicePrice = tarotService?.price || 49;
  const reportImage = cloudManager.resolveImage(tarotService?.image) || "https://images.unsplash.com/photo-1505537528343-4dc9b89823f6?q=80&w=800";

  const proceedToPayment = useCallback(() => {
    openPayment(async (paymentDetails?: any) => {
      setIsPaid(true);
      try {
        const savedReading = await dbService.saveReading({
          user_id: user?.id, 
          type: 'tarot', 
          title: selectedCard?.name || 'Tarot Reading',
          subtitle: `${selectedCard?.type} Arcana`, 
          content: reading,
          image_url: "https://images.unsplash.com/photo-1505537528343-4dc9b89823f6?q=80&w=800", 
          is_paid: true,
          meta_data: { card: selectedCard }
        });
        const readingId = savedReading?.data?.id;
        if (readingId) {
          await dbService.recordTransaction({
            user_id: user?.id, 
            service_type: 'tarot', 
            service_title: `Tarot: ${selectedCard?.name}`, 
            amount: servicePrice,
            currency: 'INR', 
            payment_method: paymentDetails?.method || 'test', 
            payment_provider: paymentDetails?.provider || 'manual',
            order_id: paymentDetails?.orderId || `ORD-${Date.now()}`, 
            transaction_id: paymentDetails?.transactionId || `TXN-${Date.now()}`,
            reading_id: readingId, 
            status: 'success', 
            metadata: { 
                name: user?.name, 
                card_name: selectedCard?.name, 
                paymentTimestamp: new Date().toISOString() 
            },
          });
        }
      } catch (err) { 
          console.error("❌ Tarot save error:", err); 
      }
    }, 'Tarot Reading', servicePrice);
  }, [selectedCard, reading, user, openPayment, servicePrice]);

  const handleReadMore = async () => {
    if (!reading || !selectedCard) return;
    
    setIsCheckingRegistry(true);
    try {
        const existing = await dbService.checkAlreadyPaid('tarot', { name: user?.name, card_name: selectedCard.name });
        if (existing.exists) {
            setRetrievedTx(existing.transaction);
            setReading(existing.reading?.content || reading);
            setIsPaid(false); 
            setIsCheckingRegistry(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
    } catch (err) {
        console.error("❌ Tarot registry check failed:", err);
    } finally {
        setIsCheckingRegistry(false);
    }

    proceedToPayment();
  };

  const resetReading = () => { 
      setSelectedCard(null); 
      setReading(''); 
      setError(''); 
      setIsPaid(false); 
      setRetrievedTx(null); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="flex flex-col gap-12 items-center">
      <div className="w-full max-w-7xl mx-auto px-4 relative min-h-screen pb-12">
          <SmartBackButton label={t('backToHome')} className="relative z-10 mb-4" />
        
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
                  <p className={`text-sm italic ${isLight ? 'text-emerald-700' : 'text-green-300/70'}`}>Sacred card draw retrieved from history.</p>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setIsPaid(true);
                        setTimeout(() => {
                            fullReportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 200);
                    }} 
                    className="bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  >
                    📄 View Full
                  </button>
                  <button 
                    onClick={resetReading} 
                    className="bg-amber-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  >
                    🆕 New Draw
                  </button>
               </div>
            </div>
          </div>
        )}

        {!selectedCard && (
            <div className="relative z-10 mb-8 text-center animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 mb-4 font-cinzel drop-shadow-lg">
                    {t('tarotReading')}
                </h2>
                <p className="text-amber-100/80 font-lora italic text-lg max-w-2xl mx-auto">
                    The deck contains 78 mysteries. Let your intuition guide your hand.
                </p>
            </div>
        )}

        {!selectedCard && !animatingCard && (
            <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 justify-items-center pb-20 animate-fade-in-up">
                {shuffledDeck.map((card) => ( 
                    <TarotCard 
                        key={card.id} 
                        card={card} 
                        isSelected={false} 
                        onClick={(e) => handleCardSelect(card, e)} 
                    /> 
                ))}
            </div>
        )}

        {(isLoading || selectedCard) && !animatingCard && (
            <div ref={resultsRef} className="w-full max-w-5xl mx-auto animate-fade-in-up">
                <div className="flex flex-col items-center gap-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-amber-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-glow"></div>
                        <div className="relative w-64 aspect-[2/3] transform transition-transform duration-500 hover:scale-105"> 
                            <TarotCard card={selectedCard!} isSelected={true} onClick={() => {}} /> 
                        </div>
                    </div>
                    <div className="w-full">
                        {isLoading && ( 
                            <div className="max-w-md mx-auto"> 
                                <ProgressBar progress={progress} message="Interpreting the Arcana..." /> 
                                <SkeletonReport /> 
                            </div> 
                        )}
                        {reading && !isLoading && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h3 className="text-3xl md:text-4xl font-bold text-amber-300 mb-2 font-cinzel">
                                        {selectedCard!.name}
                                    </h3>
                                    <div className="text-amber-500 text-sm font-bold tracking-[0.3em] uppercase">
                                        {selectedCard!.type} Arcana
                                    </div>
                                </div>
                                {!isPaid && !retrievedTx ? (
                                    <ServiceResult 
                                        serviceName="TAROT" 
                                        serviceIcon="🃏" 
                                        previewText={reading} 
                                        onRevealReport={handleReadMore} 
                                        isAdmin={isAdmin} 
                                        onAdminBypass={() => setIsPaid(true)} 
                                    />
                                ) : isPaid ? (
                                    <div ref={fullReportRef} className="w-full">
                                        <ErrorBoundary> 
                                          <FullReport 
                                            reading={reading} 
                                            category="tarot" 
                                            title={selectedCard!.name} 
                                            subtitle={`${selectedCard!.type} Arcana • Vedic Insight`} 
                                            imageUrl={reportImage} 
                                          /> 
                                        </ErrorBoundary>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
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
            <p className="text-gray-500 text-sm mb-6">Scanning the celestial archives...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tarot;
