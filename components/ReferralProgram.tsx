
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './shared/Card';
import Button from './shared/Button';
import ShareButton from './ShareButton';
// @ts-ignore
import { Link } from 'react-router-dom';

const ReferralProgram: React.FC = () => {
  const { user } = useAuth();
  
  const referralCode = user?.name 
    ? `${user.name.split(' ')[0].toUpperCase()}${user.id.substring(0,3)}` 
    : 'MYSTIC123';

  // Fixed base URL logic for blob origin environments
  const baseUrl = window.location.href.split('#')[0];
  const referralLink = `${baseUrl}#/register?ref=${referralCode}`;
  const shareText = `🌟 Uncover your destiny with Glyph Circle! Use my code ${referralCode} to get ₹10 free credits for your first reading.`;

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
             <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Sanctuary
            </Link>

            <Card className="bg-gradient-to-b from-gray-900 to-black border-amber-500/30 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <span className="text-4xl">🎁</span>
                    </div>

                    <h2 className="text-3xl font-cinzel font-bold text-amber-100 mb-2">Invite Friends, Get Rewards</h2>
                    <p className="text-amber-200/70 font-lora mb-8">
                        Share the mystic path. When a friend joins, you <strong className="text-amber-400">both get ₹10</strong> in credits for readings.
                    </p>

                    {/* Code Box */}
                    <div className="bg-gray-800/50 border border-amber-500/30 rounded-xl p-6 mb-8 relative group">
                        <p className="text-xs text-amber-200/50 uppercase tracking-widest mb-2">Your Unique Code</p>
                        <div className="text-3xl font-mono font-bold text-amber-400 tracking-wider select-all cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText(referralCode);
                            alert("Code copied!");
                        }}>
                            {referralCode}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-amber-500 pointer-events-none">
                            Click to Copy
                        </div>
                    </div>

                    <ShareButton 
                        title="Join Glyph Circle" 
                        text={shareText} 
                        url={referralLink} 
                        className="w-full"
                    />
                </div>
                
                <div className="bg-gray-900/80 p-6 border-t border-amber-500/20">
                    <h3 className="text-amber-200 font-bold mb-4 text-sm uppercase tracking-widest">How it works</h3>
                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-500/30">1</div>
                            <p className="text-sm text-gray-400">Share your unique code with friends via WhatsApp or Social Media.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-500/30">2</div>
                            <p className="text-sm text-gray-400">Friends sign up using your code.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-500/30">3</div>
                            <p className="text-sm text-gray-400">You both receive credits instantly upon their first login.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default ReferralProgram;
