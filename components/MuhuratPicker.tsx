
import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { getMuhurat } from '../services/geminiService';
import { SmartDatePicker } from './SmartAstroInputs';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { usePayment } from '../context/PaymentContext';

const MuhuratPicker: React.FC = () => {
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { db } = useDb();
  
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handleCalculate = async () => {
      if (!activity || !date) return;
      setIsLoading(true);
      try {
          const res = await getMuhurat(activity, date, language);
          setResult(res);
      } finally {
          setIsLoading(false);
      }
  };

  const serviceConfig = db.services?.find((s: any) => s.id === 'muhurat');
  const servicePrice = serviceConfig?.price || 29;

  return (
    <div className="min-h-screen py-8 px-4">
        <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6">
            &larr; Back
        </Link>

        <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-gray-900/90 border-amber-500/30">
                <h1 className="text-3xl font-cinzel font-bold text-amber-300 text-center mb-6">Shubh Muhurat</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Activity</label>
                        <input value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white" placeholder="e.g. Buying Car, Starting Business" />
                    </div>
                    <div>
                        <SmartDatePicker value={date} onChange={setDate} />
                    </div>
                    <Button onClick={handleCalculate} disabled={isLoading} className="w-full bg-amber-700 hover:bg-amber-600">{isLoading ? 'Calculating...' : 'Find Best Time'}</Button>
                </div>
            </Card>

            {result && (
                <div className="mt-8 animate-fade-in-up">
                    <Card className="p-6 bg-black/60 border-green-500/30 text-center">
                        <h3 className="text-xl font-bold text-green-400 mb-2">{result.rating} Time Found</h3>
                        <div className="text-4xl font-bold text-white mb-4">{result.bestTime}</div>
                        <p className="text-gray-300 italic mb-6">"{result.reason}"</p>
                        
                        {!isPaid ? (
                            <Button onClick={() => openPayment(() => setIsPaid(true), 'Muhurat Report', servicePrice)} className="w-full bg-green-800">Unlock Detailed Analysis</Button>
                        ) : (
                            <FullReport reading={result.fullReading} title="Muhurat Analysis" />
                        )}
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
};

export default MuhuratPicker;
