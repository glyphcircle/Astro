import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { getAyurvedicAnalysis } from '../services/aiService';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';

const Ayurveda: React.FC = () => {
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { saveReading, user } = useAuth();
  const { db } = useDb();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const QUESTIONS = [
    { q: "Body Frame", options: ["Thin/Lean (Vata)", "Medium/Muscular (Pitta)", "Heavy/Broad (Kapha)"] },
    { q: "Skin Texture", options: ["Dry/Rough", "Warm/Oily", "Thick/Cool"] },
    { q: "Energy Level", options: ["Variable/Bursts", "Moderate/Focused", "Steady/Slow"] },
    { q: "Sleep Pattern", options: ["Light/Interrupted", "Sound/Short", "Deep/Heavy"] },
    { q: "Digestion", options: ["Irregular/Gassy", "Strong/Intense", "Slow/Heavy"] },
  ];

  const handleOptionSelect = (option: string) => {
      setAnswers(prev => [...prev, `${QUESTIONS[step].q}: ${option}`]);
      if (step < QUESTIONS.length - 1) {
          setStep(step + 1);
      } else {
          analyzeDosha([...answers, `${QUESTIONS[step].q}: ${option}`]);
      }
  };

  const analyzeDosha = async (finalAnswers: string[]) => {
      setIsLoading(true);
      try {
          const analysis = await getAyurvedicAnalysis(finalAnswers.join(', '), language === 'hi' ? 'Hindi' : 'English');
          setResult(analysis);
          
          saveReading({
              type: 'remedy',
              title: `Ayurvedic Profile: ${analysis.dosha}`,
              content: analysis.fullReading,
              subtitle: 'Dosha Analysis',
              image_url: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=800",
              meta_data: analysis.breakdown
          });

      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const serviceConfig = db.services?.find((s: any) => s.id === 'ayurveda');
  const servicePrice = serviceConfig?.price || 59;

  return (
    <div className="min-h-screen py-8 px-4">
        <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('backToHome')}
        </Link>

        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-cinzel font-bold text-green-300 mb-2">Ayurvedic Wisdom</h1>
                <p className="text-amber-100/60 font-lora">Discover your Prakriti (Nature)</p>
            </div>

            {!result && !isLoading && (
                <Card className="p-8 border-l-4 border-green-500 bg-gray-900/80 max-w-lg mx-auto">
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-green-400 uppercase tracking-widest mb-2">
                            <span>Question {step + 1} of {QUESTIONS.length}</span>
                            <span>{(step / QUESTIONS.length * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-700 rounded-full"><div className="h-full bg-green-500 transition-all" style={{ width: `${(step / QUESTIONS.length * 100)}%` }}></div></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-6 text-center">{QUESTIONS[step].q}</h3>
                    <div className="space-y-3">
                        {QUESTIONS[step].options.map((opt, i) => (
                            <button key={i} onClick={() => handleOptionSelect(opt)} className="w-full p-4 bg-black/40 border border-green-500/30 rounded-lg hover:bg-green-900/30 hover:border-green-400 transition-all text-left text-amber-100">
                                {opt}
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {isLoading && <div className="max-w-md mx-auto"><ProgressBar progress={90} message="Analyzing Constitution..." /></div>}

            {result && !isLoading && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-green-900 to-black p-6 border border-green-500/30">
                            <h2 className="text-3xl font-cinzel font-bold text-white mb-1">{result.dosha}</h2>
                            <p className="text-green-300 text-xs uppercase tracking-widest mb-6">Dominant Constitution</p>
                            
                            <div className="space-y-4">
                                <div><div className="flex justify-between text-xs mb-1"><span>Vata (Air)</span><span>{result.breakdown.vata}%</span></div><div className="h-2 bg-gray-800 rounded"><div className="h-full bg-blue-400" style={{ width: `${result.breakdown.vata}%` }}></div></div></div>
                                <div><div className="flex justify-between text-xs mb-1"><span>Pitta (Fire)</span><span>{result.breakdown.pitta}%</span></div><div className="h-2 bg-gray-800 rounded"><div className="h-full bg-red-400" style={{ width: `${result.breakdown.pitta}%` }}></div></div></div>
                                <div><div className="flex justify-between text-xs mb-1"><span>Kapha (Earth)</span><span>{result.breakdown.kapha}%</span></div><div className="h-2 bg-gray-800 rounded"><div className="h-full bg-yellow-600" style={{ width: `${result.breakdown.kapha}%` }}></div></div></div>
                            </div>
                        </Card>
                        
                        <Card className="p-6 bg-black/60 border border-green-500/20">
                            <h3 className="font-bold text-green-300 mb-4">Dietary Recommendations</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                {result.diet.slice(0, 4).map((item: string, i: number) => <li key={i}>• {item}</li>)}
                            </ul>
                            {!isPaid && <div className="mt-4 p-2 bg-green-900/20 text-center text-xs text-green-400">Unlock full report for recipes & lifestyle plan.</div>}
                        </Card>
                    </div>

                    {!isPaid ? (
                        <div className="text-center">
                            <Button onClick={() => openPayment(() => setIsPaid(true), 'Ayurveda Report', servicePrice)} className="bg-green-700 hover:bg-green-600 px-8 py-3">Unlock Full Health Report</Button>
                        </div>
                    ) : (
                        <FullReport 
                            reading={result.fullReading} 
                            category="ayurveda"
                            title={`Ayurvedic Analysis: ${result.dosha}`} 
                            imageUrl={cloudManager.resolveImage("https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=800")} 
                        />
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default Ayurveda;