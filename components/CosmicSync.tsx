import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { getCosmicSync } from '../services/aiService';
import { SmartDatePicker, SmartTimePicker, SmartCitySearch } from './SmartAstroInputs';
import FullReport from './FullReport';
import { usePayment } from '../context/PaymentContext';
import { useDb } from '../hooks/useDb';

const CosmicSync: React.FC = () => {
  const { openPayment } = usePayment();
  const { db } = useDb();
  
  const [p1, setP1] = useState({ name: '', dob: '', tob: '', pob: '' });
  const [p2, setP2] = useState({ name: '', dob: '', tob: '', pob: '' });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handleSync = async () => {
      setIsLoading(true);
      try {
          const res = await getCosmicSync(p1, p2);
          setResult(res);
      } finally {
          setIsLoading(false);
      }
  };

  const serviceConfig = db.services?.find((s: any) => s.id === 'cosmic-sync');
  const servicePrice = serviceConfig?.price || 69;

  return (
    <div className="min-h-screen py-8 px-4">
        <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6">
            &larr; Back
        </Link>

        <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-cinzel font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-8">Cosmic Sync</h1>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6 border-l-4 border-pink-500">
                    <h3 className="font-bold text-pink-300 mb-4">Person A</h3>
                    <div className="space-y-4">
                        <input value={p1.name} onChange={e => setP1({...p1, name: e.target.value})} placeholder="Name" className="w-full bg-black/50 border border-gray-600 p-2 rounded text-white" />
                        <SmartDatePicker value={p1.dob} onChange={d => setP1({...p1, dob: d})} />
                        <SmartTimePicker value={p1.tob} date={p1.dob} onChange={t => setP1({...p1, tob: t})} />
                        <SmartCitySearch value={p1.pob} onChange={c => setP1({...p1, pob: c})} />
                    </div>
                </Card>
                <Card className="p-6 border-r-4 border-purple-500">
                    <h3 className="font-bold text-purple-300 mb-4 text-right">Person B</h3>
                    <div className="space-y-4">
                        <input value={p2.name} onChange={e => setP2({...p2, name: e.target.value})} placeholder="Name" className="w-full bg-black/50 border border-gray-600 p-2 rounded text-white text-right" />
                        <SmartDatePicker value={p2.dob} onChange={d => setP2({...p2, dob: d})} />
                        <SmartTimePicker value={p2.tob} date={p2.dob} onChange={t => setP2({...p2, tob: t})} />
                        <SmartCitySearch value={p2.pob} onChange={c => setP2({...p2, pob: c})} />
                    </div>
                </Card>
            </div>

            <div className="text-center mb-12">
                <Button onClick={handleSync} disabled={isLoading} className="bg-gradient-to-r from-pink-600 to-purple-600 px-12 py-4 text-lg rounded-full">
                    {isLoading ? 'Aligning Stars...' : 'Analyze Synergy'}
                </Button>
            </div>

            {result && (
                <div className="animate-fade-in-up">
                    <Card className="p-8 text-center bg-black/80 border-amber-500/30">
                        <div className="text-6xl font-black text-white mb-2">{result.compatibilityScore}%</div>
                        <h3 className="text-2xl font-cinzel text-pink-300 mb-6">{result.relationshipType}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
                            <div className="bg-green-900/20 p-4 rounded border border-green-500/20">
                                <h4 className="text-green-400 font-bold mb-2">Strengths</h4>
                                <ul className="text-sm text-gray-300 list-disc pl-4">{result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                            </div>
                            <div className="bg-red-900/20 p-4 rounded border border-red-500/20">
                                <h4 className="text-red-400 font-bold mb-2">Challenges</h4>
                                <ul className="text-sm text-gray-300 list-disc pl-4">{result.challenges.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        </div>

                        {!isPaid ? (
                            <Button onClick={() => openPayment(() => setIsPaid(true), 'Synastry Report', servicePrice)} className="w-full bg-pink-700">Unlock Full Karmic Report</Button>
                        ) : (
                            <FullReport reading={result.fullReading} title="Cosmic Synergy Report" />
                        )}
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
};

export default CosmicSync;