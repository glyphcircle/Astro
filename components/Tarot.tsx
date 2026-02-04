import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getTarotReading, translateText } from '../services/geminiService';
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
import InlineError from './shared/InlineError';
import { SkeletonReport } from './shared/SkeletonLoader';
import ErrorBoundary from './shared/ErrorBoundary';
import SmartBackButton from './shared/SmartBackButton';

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
  const [isAnimationFlying, setIsAnimationFlying] = useState(false);
  const [isAnimationFlipping, setIsAnimationFlipping] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef('');

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user, awardKarma, saveReading } = useAuth();
  const { db } = useDb();

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = { en: 'English', hi: 'Hindi', fr: 'French', es: 'Spanish' };
      return map[code] || 'English';
  };

  const isAdmin = user && ['master@gylphcircle.com', 'admin@gylphcircle.com'].includes(user.email);

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

  const shuffledDeck = useMemo(() => {
      const deck = [...FULL_DECK];
      for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
  }, []);

  const generateReading = useCallback(async (card: TarotCardData) => {
    setIsLoading(true); setProgress(0); setReading(''); setError(''); setIsPaid(false);
    const timer = setInterval(() => setProgress(prev => (prev >= 90 ? prev : prev + 15)), 300);
    try {
      const result = await getTarotReading(card.name, getLanguageName(language));
      clearInterval(timer); setProgress(100); setReading(result);
      awardKarma(ACTION_POINTS.READING_COMPLETE);
      saveReading({ type: 'tarot', title: card.name, subtitle: `${card.type} Arcana`, content: result, image_url: "https://images.unsplash.com/photo-1505537528343-4dc9b89823f6?q=80&w=800" });
    } catch (err: any) { clearInterval(timer); setError(`${err.message || 'The cosmic connection was interrupted.'}`); } finally { setIsLoading(false); }
  }, [language, awardKarma, saveReading]);

  const handleCardSelect = useCallback((card: TarotCardData, e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaid || animatingCard || selectedCard) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAnimatingCard({ card, startRect: rect });
    generateReading(card);
  }, [isPaid, animatingCard, selectedCard, generateReading]);
  
  useEffect(() => {
      if (animatingCard) {
          requestAnimationFrame(() => setIsAnimationFlying(true));
          const flipTimer = setTimeout(() => setIsAnimationFlipping(true), 600);
          const landingTimer = setTimeout(() => { setSelectedCard(animatingCard.card); setAnimatingCard(null); setIsAnimationFlying(false); setIsAnimationFlipping(false); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }, 1100);
          return () => { clearTimeout(flipTimer); clearTimeout(landingTimer); };
      }
  }, [animatingCard]);

  const tarotService = db.services?.find((s: any) => s.id === 'tarot');
  const servicePrice = tarotService?.price || 49;
  const reportImage = cloudManager.resolveImage(tarotService?.image) || "https://images.unsplash.com/photo-1505537528343-4dc9b89823f6?q=80&w=800";

  const handleReadMore = () => openPayment(() => setIsPaid(true), 'Tarot Reading', servicePrice);
  const resetReading = () => { setSelectedCard(null); setReading(''); setError(''); setIsPaid(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="flex flex-col gap-12 items-center">
      <div className="w-full max-w-7xl mx-auto px-4 relative min-h-screen pb-12">
          <SmartBackButton label={t('backToHome')} className="relative z-10 mb-4" />
        {!selectedCard && (
            <div className="relative z-10 mb-8 text-center animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 mb-4 font-cinzel drop-shadow-lg">{t('tarotReading')}</h2>
                <p className="text-amber-100/80 font-lora italic text-lg max-w-2xl mx-auto">The deck contains 78 mysteries. Let your intuition guide your hand.</p>
            </div>
        )}
        {!selectedCard && !animatingCard && (
            <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 justify-items-center pb-20 animate-fade-in-up">
            {shuffledDeck.map((card) => ( <TarotCard key={card.id} card={card} isSelected={false} onClick={(e) => handleCardSelect(card, e)} /> ))}
            </div>
        )}
        {animatingCard && (
            <div className="fixed z-[100] transition-all duration-[1000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] perspective-1000" style={isAnimationFlying ? { top: '30%', left: '50%', width: '16rem', height: '24rem', transform: 'translate(-50%, -20%) rotateZ(360deg) scale(1.2)' } : { top: animatingCard.startRect.top, left: animatingCard.startRect.left, width: animatingCard.startRect.width, height: animatingCard.startRect.height, transform: 'translate(0, 0) rotateZ(0deg) scale(1)' }}>
                <div className={`absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl transition-opacity duration-500 ${isAnimationFlying ? 'opacity-100' : 'opacity-0'}`}></div>
                <TarotCard card={animatingCard.card} isSelected={isAnimationFlipping} onClick={() => {}} />
            </div>
        )}
        {(isLoading || selectedCard) && !animatingCard && (
            <div ref={resultsRef} className="w-full max-w-5xl mx-auto animate-fade-in-up">
                <div className="flex flex-col items-center gap-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-amber-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-glow"></div>
                        <div className="relative w-64 aspect-[2/3] transform transition-transform duration-500 hover:scale-105"> <TarotCard card={selectedCard!} isSelected={true} onClick={() => {}} /> </div>
                    </div>
                    <div className="w-full">
                        {isLoading && ( <div className="max-w-md mx-auto"> <ProgressBar progress={progress} message={prevLangRef.current !== language ? "Re-aligning Script..." : "Interpreting the Arcana..."} estimatedTime="Approx. 5 seconds" /> <SkeletonReport /> </div> )}
                        {error && !isLoading && <InlineError message={error} onRetry={() => generateReading(selectedCard!)} />}
                        {reading && !isLoading && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h3 className="text-3xl md:text-4xl font-bold text-amber-300 mb-2 font-cinzel">{selectedCard!.name}</h3>
                                    <div className="text-amber-500 text-sm font-bold tracking-[0.3em] uppercase">{selectedCard!.type} Arcana</div>
                                </div>
                                {!isPaid ? (
                                    <Card className="p-8 border-l-4 border-purple-500 bg-gray-900/80 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                                        <div className="relative text-amber-100 leading-relaxed font-lora italic text-lg mb-8"> {reading.replace(/#/g, '').replace(/\*\*/g, '').split('\n').slice(0, 3).map((line, i) => ( <p key={i} className="mb-2">{line}</p> ))} <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-900 to-transparent"></div> </div>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 border-t border-gray-700"> <Button onClick={handleReadMore} className="w-full sm:w-auto px-8 bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400">{t('readMore')}</Button> <button onClick={resetReading} className="text-sm text-gray-400 hover:text-white underline font-cinzel tracking-widest uppercase">Draw Another Card</button> </div>
                                    </Card>
                                ) : (
                                    <div className="w-full">
                                        <ErrorBoundary> <FullReport reading={reading} category="tarot" title={selectedCard!.name} subtitle={`${selectedCard!.type} Arcana • Vedic Insight`} imageUrl={reportImage} /> </ErrorBoundary>
                                        <div className="text-center mt-8"> <button onClick={resetReading} className="px-10 py-4 bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-amber-200 rounded-full border border-amber-500/30 font-bold transition-all transform hover:scale-105 shadow-xl uppercase font-cinzel tracking-[0.2em]">Draw Another Card</button> </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Tarot;