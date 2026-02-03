
import React from 'react';
import Card from './shared/Card';
import { Link } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  // Mock Data for "Fake" Social Proof
  const LEADERS = [
    { id: 1, name: 'Aarav M.', points: 1250, readings: 12, avatar: '🧙‍♂️' },
    { id: 2, name: 'Priya S.', points: 980, readings: 9, avatar: '🔮' },
    { id: 3, name: 'Rahul K.', points: 850, readings: 8, avatar: '✨' },
    { id: 4, name: 'MysticUser_99', points: 600, readings: 5, avatar: '🌙' },
    { id: 5, name: 'Sarah J.', points: 450, readings: 4, avatar: '⭐' },
  ];

  const getRankStyle = (rank: number) => {
      switch(rank) {
          case 1: return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
          case 2: return 'bg-gray-400/20 border-gray-400/50 text-gray-200';
          case 3: return 'bg-orange-700/20 border-orange-700/50 text-orange-200';
          default: return 'bg-gray-800/30 border-gray-700 text-gray-400';
      }
  };

  const getMedal = (rank: number) => {
      switch(rank) {
          case 1: return '🥇';
          case 2: return '🥈';
          case 3: return '🥉';
          default: return `#${rank}`;
      }
  };

  return (
    <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Link to="/home" className="text-amber-200 hover:text-white transition-colors">
                    &larr; Back
                </Link>
                <div className="text-right">
                    <h2 className="text-3xl font-cinzel font-bold text-amber-300">Top Seekers</h2>
                    <p className="text-xs text-amber-200/50">Weekly Leaderboard</p>
                </div>
            </div>

            <Card className="overflow-hidden bg-black/60 backdrop-blur-md border-amber-500/20">
                <div className="bg-gradient-to-r from-amber-900/40 to-purple-900/40 p-4 border-b border-amber-500/20 flex justify-between items-center">
                    <span className="text-amber-100 font-bold">This Week's Champions</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">Resets in 2d 4h</span>
                </div>
                
                <div className="p-4 space-y-3">
                    {LEADERS.map((leader, index) => (
                        <div 
                            key={leader.id}
                            className={`flex items-center p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankStyle(index + 1)}`}
                        >
                            <div className="w-8 text-xl font-bold text-center mr-4">
                                {getMedal(index + 1)}
                            </div>
                            <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-2xl border border-white/10 mr-4">
                                {leader.avatar}
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-lg">{leader.name}</div>
                                <div className="text-xs opacity-70">{leader.readings} readings this week</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-lg">{leader.points}</div>
                                <div className="text-[10px] uppercase tracking-wider opacity-60">Karma Pts</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-black/40 text-center border-t border-amber-500/10">
                    <p className="text-amber-200/60 text-sm mb-3">Want to climb the ranks?</p>
                    <Link to="/referrals">
                        <button className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full font-bold transition-colors">
                            Invite Friends (+100 Pts)
                        </button>
                    </Link>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default Leaderboard;
