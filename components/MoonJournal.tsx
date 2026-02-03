
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';

const MOON_PHASES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

const MoonJournal: React.FC = () => {
  const { user } = useAuth();
  const { db, createEntry, refresh } = useDb();
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [phase, setPhase] = useState('');

  useEffect(() => {
      // Simple phase calculation
      const now = new Date();
      const cycle = 29.53;
      const knownNewMoon = new Date('2023-01-21').getTime();
      const diff = now.getTime() - knownNewMoon;
      const days = diff / (1000 * 60 * 60 * 24);
      const currentCycle = days % cycle;
      const index = Math.floor(currentCycle / (cycle / 8));
      setPhase(MOON_PHASES[index % 8]);
  }, []);

  const handleSave = async () => {
      if (!mood || !user) return;
      await createEntry('mood_entries', {
          user_id: user.id,
          mood,
          moon_phase: phase,
          notes,
          created_at: new Date().toISOString()
      });
      alert("Journal entry saved!");
      setMood('');
      setNotes('');
      refresh();
  };

  const history = (db.mood_entries || []).filter((e: any) => e.user_id === user?.id).reverse();

  return (
    <div className="min-h-screen py-8 px-4">
        <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6">
            &larr; Back to Sanctuary
        </Link>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div>
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-4 flex items-center justify-center text-4xl bg-gradient-to-tr from-gray-900 via-gray-400 to-white text-black">
                        ☾
                    </div>
                    <h2 className="text-3xl font-cinzel font-bold text-white">{phase}</h2>
                    <p className="text-gray-400 text-sm">Current Phase</p>
                </div>

                <Card className="p-6 bg-gray-900/80 border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">How do you feel?</h3>
                    <div className="flex justify-between mb-6">
                        {['😡', '😟', '😐', '🙂', '🤩'].map(m => (
                            <button key={m} onClick={() => setMood(m)} className={`text-3xl p-2 rounded-full transition-transform hover:scale-125 ${mood === m ? 'bg-white/20 scale-125' : ''}`}>{m}</button>
                        ))}
                    </div>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reflect on your emotions..."
                        className="w-full bg-black/40 border border-gray-600 rounded p-3 text-white h-32 mb-4 focus:border-amber-500 outline-none"
                    />
                    <Button onClick={handleSave} className="w-full bg-blue-900 hover:bg-blue-800">Log Entry</Button>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-amber-200 mb-2">Your Lunar Cycle</h3>
                {history.length === 0 ? <p className="text-gray-500 italic">No entries yet.</p> : (
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
                        {history.map((entry: any) => (
                            <div key={entry.id} className="bg-black/40 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">{new Date(entry.created_at).toLocaleDateString()}</div>
                                    <div className="text-white text-sm mt-1">{entry.notes}</div>
                                    <div className="text-xs text-blue-400 mt-1">{entry.moon_phase}</div>
                                </div>
                                <div className="text-2xl">{entry.mood}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MoonJournal;
