/**
 * Ayurveda Component - Prakriti (Constitution) Analysis
 * Complete Ayurvedic dosha assessment with comprehensive premium report
 */

import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { getAyurvedicAnalysis } from '../services/aiService';
import { usePayment } from '../context/PaymentContext';
import AyurvedaFullReport from './AyurvedaFullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';
import { useTheme } from '../context/ThemeContext';
import SmartBackButton from './shared/SmartBackButton';

const Ayurveda: React.FC = () => {
    const { t, language } = useTranslation();
    const { openPayment } = usePayment();
    const { saveReading, user } = useAuth();
    const { db } = useDb();
    const { theme } = useTheme();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    // Theme-aware colors
    const isLight = theme.mode === 'light';

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
            
            const validatedAnalysis = {
                dosha: analysis?.dosha || 'Balanced',
                breakdown: {
                    vata: analysis?.breakdown?.vata ?? 33,
                    pitta: analysis?.breakdown?.pitta ?? 33,
                    kapha: analysis?.breakdown?.kapha ?? 34
                },
                diet: analysis?.diet || ['Stay hydrated', 'Eat seasonal foods', 'Practice mindful eating'],
                fullReading: analysis?.fullReading || 'Your Ayurvedic profile is balanced. Continue with healthy lifestyle practices.',
            };

            setResult(validatedAnalysis);

            saveReading({
                type: 'remedy',
                title: `Ayurvedic Profile: ${validatedAnalysis.dosha}`,
                content: validatedAnalysis.fullReading,
                subtitle: 'Dosha Analysis',
                image_url: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=800",
                meta_data: validatedAnalysis.breakdown
            });

        } catch (e) {
            console.error('Ayurvedic analysis error:', e);
            setResult({
                dosha: 'Balanced',
                breakdown: { vata: 33, pitta: 33, kapha: 34 },
                diet: ['Stay hydrated', 'Eat seasonal foods', 'Practice mindful eating', 'Regular exercise'],
                fullReading: 'Unable to generate full analysis. Please try again or consult an Ayurvedic practitioner.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const serviceConfig = db.services?.find((s: any) => s.id === 'ayurveda');
    const servicePrice = serviceConfig?.price || 59;

    const vataPercentage = result?.breakdown?.vata ?? 0;
    const pittaPercentage = result?.breakdown?.pitta ?? 0;
    const kaphaPercentage = result?.breakdown?.kapha ?? 0;

    return (
        <div className={`min-h-screen py-8 px-4 transition-colors duration-500 ${
            isLight ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50' : 'bg-gradient-to-br from-gray-900 via-green-950 to-black'
        }`}>
            <SmartBackButton className="mb-6" />

            <div className="max-w-4xl mx-auto">
                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className={`text-4xl font-cinzel font-bold mb-2 ${
                        isLight ? 'text-green-800' : 'text-green-300'
                    }`}>
                        Ayurvedic Wisdom
                    </h1>
                    <p className={`font-lora text-lg ${
                        isLight ? 'text-green-600' : 'text-emerald-300/70'
                    }`}>
                        Discover your Prakriti (Nature)
                    </p>
                </div>

                {/* QUESTIONNAIRE */}
                {!result && !isLoading && (
                    <Card className={`p-8 border-l-4 max-w-lg mx-auto ${
                        isLight 
                            ? 'bg-white border-green-500 shadow-xl' 
                            : 'bg-gray-900/80 border-green-500'
                    }`}>
                        <div className="mb-6">
                            <div className={`flex justify-between text-xs uppercase tracking-widest mb-2 ${
                                isLight ? 'text-green-700' : 'text-green-400'
                            }`}>
                                <span>Question {step + 1} of {QUESTIONS.length}</span>
                                <span>{(step / QUESTIONS.length * 100).toFixed(0)}%</span>
                            </div>
                            <div className={`w-full h-1 rounded-full ${
                                isLight ? 'bg-green-200' : 'bg-gray-700'
                            }`}>
                                <div className="h-full bg-green-500 transition-all" style={{ width: `${(step / QUESTIONS.length * 100)}%` }}></div>
                            </div>
                        </div>

                        <h3 className={`text-xl font-bold mb-6 text-center ${
                            isLight ? 'text-gray-900' : 'text-white'
                        }`}>
                            {QUESTIONS[step].q}
                        </h3>
                        
                        <div className="space-y-3">
                            {QUESTIONS[step].options.map((opt, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleOptionSelect(opt)} 
                                    className={`w-full p-4 rounded-lg transition-all text-left ${
                                        isLight
                                            ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100 hover:border-green-400 text-gray-800'
                                            : 'bg-black/40 border border-green-500/30 hover:bg-green-900/30 hover:border-green-400 text-amber-100'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </Card>
                )}

                {/* LOADING */}
                {isLoading && (
                    <div className="max-w-md mx-auto">
                        <ProgressBar progress={90} message="Analyzing Constitution..." />
                    </div>
                )}

                {/* RESULTS */}
                {result && !isLoading && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* DOSHA BREAKDOWN CARD */}
                            <Card className={`p-6 border-2 ${
                                isLight
                                    ? 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border-green-300'
                                    : 'bg-gradient-to-br from-green-900 to-black border-green-500/30'
                            }`}>
                                <h2 className={`text-3xl font-cinzel font-bold mb-1 ${
                                    isLight ? 'text-green-900' : 'text-white'
                                }`}>
                                    {result.dosha}
                                </h2>
                                <p className={`text-xs uppercase tracking-widest mb-6 ${
                                    isLight ? 'text-green-700' : 'text-green-300'
                                }`}>
                                    Dominant Constitution
                                </p>

                                <div className="space-y-4">
                                    {/* Vata */}
                                    <div>
                                        <div className={`flex justify-between text-xs mb-1 font-semibold ${
                                            isLight ? 'text-gray-800' : 'text-gray-200'
                                        }`}>
                                            <span>Vata (Air)</span>
                                            <span>{vataPercentage}%</span>
                                        </div>
                                        <div className={`h-2 rounded-full ${
                                            isLight ? 'bg-blue-200' : 'bg-gray-800'
                                        }`}>
                                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${vataPercentage}%` }}></div>
                                        </div>
                                    </div>
                                    
                                    {/* Pitta */}
                                    <div>
                                        <div className={`flex justify-between text-xs mb-1 font-semibold ${
                                            isLight ? 'text-gray-800' : 'text-gray-200'
                                        }`}>
                                            <span>Pitta (Fire)</span>
                                            <span>{pittaPercentage}%</span>
                                        </div>
                                        <div className={`h-2 rounded-full ${
                                            isLight ? 'bg-red-200' : 'bg-gray-800'
                                        }`}>
                                            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pittaPercentage}%` }}></div>
                                        </div>
                                    </div>
                                    
                                    {/* Kapha */}
                                    <div>
                                        <div className={`flex justify-between text-xs mb-1 font-semibold ${
                                            isLight ? 'text-gray-800' : 'text-gray-200'
                                        }`}>
                                            <span>Kapha (Earth)</span>
                                            <span>{kaphaPercentage}%</span>
                                        </div>
                                        <div className={`h-2 rounded-full ${
                                            isLight ? 'bg-yellow-200' : 'bg-gray-800'
                                        }`}>
                                            <div className="h-full bg-yellow-600 rounded-full transition-all" style={{ width: `${kaphaPercentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* DIETARY RECOMMENDATIONS CARD */}
                            <Card className={`p-6 border-2 ${
                                isLight
                                    ? 'bg-white border-green-200'
                                    : 'bg-black/60 border-green-500/20'
                            }`}>
                                <h3 className={`font-bold mb-4 text-lg ${
                                    isLight ? 'text-green-800' : 'text-green-300'
                                }`}>
                                    Dietary Recommendations
                                </h3>
                                <ul className={`space-y-2 text-sm ${
                                    isLight ? 'text-gray-700' : 'text-gray-300'
                                }`}>
                                    {(result.diet || []).slice(0, 4).map((item: string, i: number) => (
                                        <li key={i} className="flex items-start">
                                            <span className={`mr-2 ${isLight ? 'text-green-600' : 'text-green-400'}`}>•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                {!isPaid && (
                                    <div className={`mt-4 p-3 text-center text-xs rounded-lg ${
                                        isLight
                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                            : 'bg-green-900/20 text-green-400 border border-green-500/30'
                                    }`}>
                                        🔒 Unlock full report for recipes & lifestyle plan
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* UNLOCK BUTTON OR FULL REPORT */}
                        {!isPaid ? (
                            <div className="text-center">
                                <Button 
                                    onClick={() => openPayment(() => setIsPaid(true), 'Ayurveda Report', servicePrice)} 
                                    className={`px-8 py-4 font-bold text-lg shadow-xl transition-all hover:scale-105 ${
                                        isLight
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-green-700 hover:bg-green-600 text-white'
                                    }`}
                                >
                                    🔓 Unlock Full Health Report
                                </Button>
                            </div>
                        ) : (
                            <AyurvedaFullReport
                                dosha={result.dosha}
                                breakdown={result.breakdown}
                                diet={result.diet}
                                fullReading={result.fullReading}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ayurveda;
