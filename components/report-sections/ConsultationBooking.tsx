
import React from 'react';
import Card from '../shared/Card';

const ConsultationBooking: React.FC = () => {
  const options = [
    { 
      id: 'session', 
      icon: '👤', 
      title: 'One-on-One Session', 
      desc: 'Live 60-min session with Master Astrologer', 
      price: '₹2999', 
      btn: 'Book Session' 
    },
    { 
      id: 'kit', 
      icon: '📿', 
      title: 'Remedy Kit', 
      desc: 'Customized package with yantras & mantras', 
      price: '₹1499', 
      btn: 'Get Kit' 
    },
    { 
      id: 'email', 
      icon: '✉️', 
      title: 'Email Query', 
      desc: 'Ask specific questions with 48h response', 
      price: '₹499', 
      btn: 'Send Query' 
    }
  ];

  return (
    <Card className="p-12 bg-gradient-to-b from-[#2d0a18] to-black border-[#d4af37]/40 text-center relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      <div className="relative z-10">
        <h2 className="text-4xl font-cinzel font-black gold-gradient-text uppercase mb-2 tracking-tighter">Seek Deeper Guidance</h2>
        <p className="text-amber-100/60 uppercase tracking-[0.4em] font-bold text-[10px] mb-12">Pathways to Absolute Alignment</p>

        <div className="grid md:grid-cols-3 gap-8">
          {options.map(opt => (
            <div key={opt.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-all group">
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform">{opt.icon}</div>
              <h4 className="text-lg font-cinzel font-black text-white uppercase mb-2">{opt.title}</h4>
              <p className="text-xs text-amber-100/50 mb-6 leading-relaxed">{opt.desc}</p>
              <div className="text-2xl font-mono font-black text-amber-400 mb-6">{opt.price}</div>
              <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg">{opt.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ConsultationBooking;
