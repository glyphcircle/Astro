
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../shared/Card';

interface RemedySectionProps {
  remedies: any;
  userName: string;
}

const RemedySection: React.FC<RemedySectionProps> = ({ remedies, userName }) => {
  const [activeTab, setActiveTab] = useState('mantra');

  const tabs = [
    { id: 'mantra', label: 'Mantras', icon: '🕉️' },
    { id: 'yantra', label: 'Yantras', icon: '📐' },
    { id: 'charity', label: 'Charity', icon: '🤝' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🧘' }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900">Vedic Remedial Actions</h3>
        <p className="text-sm font-lora italic text-amber-800/60 mt-1">Realigning your karmic field</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === tab.id 
                ? 'bg-amber-900 text-white border-amber-900 shadow-lg' 
                : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'mantra' && (
          <div className="space-y-6">
            {remedies.mantras.map((m: any, i: number) => (
              <Card key={i} className="p-8 bg-white border-amber-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="text-4xl">📿</div>
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-lg font-cinzel font-black text-amber-950 uppercase">{m.planet} Mantra</h4>
                  <p className="text-2xl font-cinzel font-bold text-amber-900 mt-2 mb-4 leading-relaxed">"{m.text}"</p>
                  <p className="text-xs font-lora italic text-gray-500">Chant {m.count} times daily for 40 days at dawn.</p>
                </div>
                <button className="px-6 py-3 bg-amber-100 text-amber-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-200 transition-all shrink-0">Listen Audio</button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'yantra' && (
          <div className="grid md:grid-cols-2 gap-6">
            {remedies.yantras.map((y: any, i: number) => (
              <Card key={i} className="p-8 bg-white border-amber-100">
                <div className="text-4xl mb-4">📐</div>
                <h4 className="text-xl font-cinzel font-black text-amber-950 uppercase mb-2">{y.name}</h4>
                <p className="text-sm font-lora text-gray-600 mb-6 leading-relaxed">{y.desc}</p>
                <Link to={`/store?category=Yantras&product=${y.name.toLowerCase().replace(/\s+/g, '-')}`} state={{ from: 'astrology-report' }}>
                   <button className="w-full py-3 bg-amber-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Get Consecrated Yantra</button>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'charity' && (
           <div className="space-y-4">
             {remedies.charity.map((c: any, i: number) => (
                <div key={i} className="p-6 bg-white border border-amber-100 rounded-3xl flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-amber-950 uppercase text-xs mb-1">Donate {c.item}</h4>
                    <p className="text-sm text-gray-500 italic">Preferred day: {c.day}</p>
                  </div>
                  <span className="text-2xl">🍯</span>
                </div>
             ))}
           </div>
        )}

        {activeTab === 'lifestyle' && (
          <Card className="p-10 bg-white border-amber-100">
             <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-600 mb-4 tracking-widest">Resonant Colors</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-amber-200"></div>
                    <span className="font-cinzel font-bold text-amber-950">{remedies.lifestyle.color}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-600 mb-4 tracking-widest">Auspicious Direction</h4>
                  <p className="text-lg font-cinzel font-bold text-amber-950">{remedies.lifestyle.direction}</p>
                </div>
             </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RemedySection;
