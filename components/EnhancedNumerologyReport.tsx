
import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDb } from '../hooks/useDb';
import { Link, useLocation } from 'react-router-dom';
import GemstoneRecommendation from './report-sections/GemstoneRecommendation';
import RemedySection from './report-sections/RemedySection';
import ConsultationBooking from './report-sections/ConsultationBooking';

interface EnhancedNumerologyReportProps {
  reading: string;
  engineData: any;
  userName: string;
  birthDate: string;
}

const EnhancedNumerologyReport: React.FC<EnhancedNumerologyReportProps> = ({
  reading,
  engineData,
  userName,
  birthDate
}) => {
  const { theme } = useTheme();
  const { db } = useDb();
  const isLight = theme.mode === 'light';

  // Mock recommendations based on numerology for now
  const recommendations = {
    gemstones: {
      primary: { name: 'Yellow Sapphire', p: 'Jupiter', m: 'Gold', f: 'Index', d: 'Thursday', mantra: 'Om Gram Greem Graum Sah Gurave Namah' },
      avoid: ['Blue Sapphire']
    },
    remedies: {
      mantras: [{ planet: 'Universal', text: 'Om Shanti Shanti Shanti', count: 108 }],
      yantras: [{ name: 'Shree Yantra', desc: 'Place in prayer room' }],
      rudraksha: [{ mukhi: '5 Mukhi', benefits: 'Peace' }],
      charity: [{ item: 'Yellow Lentils', day: 'Thursday' }],
      lifestyle: { color: 'Yellow', direction: 'North' }
    }
  };

  const template = db.report_formats?.find((t: any) => 
    t.category === 'numerology' && t.is_active
  );

  const contentConfig = template?.content_area_config || {
    marginTop: 120,
    marginBottom: 80,
    marginLeft: 80,
    marginRight: 80,
    textColor: '#3B1810',
    backgroundColor: 'rgba(255, 248, 240, 0.92)'
  };

  const parseReading = (text: string) => {
    const sections: { title: string; points: Array<{ text: string; type: string }> }[] = [];
    const sectionParts = text.split(/###\s+/).filter(s => s.trim());
    
    sectionParts.forEach((part) => {
      const lines = part.split('\n').filter(l => l.trim());
      if (lines.length === 0) return;
      const title = lines[0].trim().replace(/^[IVX]+\.\s*/, '');
      const points: Array<{ text: string; type: string }> = [];
      lines.slice(1).forEach(line => {
        const cleaned = line.replace(/^[✨⚠️🔮🕉️*\-•]+\s*/, '').trim();
        if (cleaned.length < 30) return;
        points.push({
          text: cleaned,
          type: /positive|gift|strength/i.test(cleaned) ? 'positive' : /negative|challenge/i.test(cleaned) ? 'negative' : 'neutral'
        });
      });
      if (points.length > 0) sections.push({ title, points });
    });
    return sections;
  };

  const sections = parseReading(reading);

  return (
    <div 
      className="report-container relative w-full flex flex-col items-center gap-16"
      style={{
        backgroundImage: `url(${template?.template_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <div 
        className="content-wrapper w-full max-w-[210mm]"
        style={{
          paddingTop: `${contentConfig.marginTop}px`,
          paddingBottom: `${contentConfig.marginBottom}px`,
          paddingLeft: `${contentConfig.marginLeft}px`,
          paddingRight: `${contentConfig.marginRight}px`,
          color: contentConfig.textColor
        }}
      >
        <div className="page cover-page min-h-screen flex flex-col items-center justify-center text-center mb-20">
          <div className="backdrop-blur-sm rounded-3xl p-12 w-full max-w-4xl mx-auto" style={{ backgroundColor: contentConfig.backgroundColor }}>
            <h1 className="text-6xl font-serif mb-6">IMPERIAL NUMEROLOGY REPORT</h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-amber-600 to-orange-600 mb-8" />
            <p className="text-2xl font-serif mb-4">{userName}</p>
            <p className="text-lg opacity-70">Born: {birthDate}</p>
          </div>
        </div>

        <div className="page mb-16">
          <div className="backdrop-blur-sm rounded-2xl p-8 mb-8" style={{ backgroundColor: contentConfig.backgroundColor }}>
            <h2 className="text-4xl font-serif text-center mb-8">PERSONAL RESONANCE</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg"><span className="text-4xl font-bold text-white">{engineData?.coreNumbers?.mulank || '9'}</span></div>
                <p className="text-sm font-semibold opacity-80">Life Path</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-3 shadow-lg"><span className="text-4xl font-bold text-white">{engineData?.coreNumbers?.bhagyank || '5'}</span></div>
                <p className="text-sm font-semibold opacity-80">Destiny</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-3 shadow-lg"><span className="text-4xl font-bold text-white">7</span></div>
                <p className="text-sm font-semibold opacity-80">Soul Urge</p>
              </div>
            </div>
          </div>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="page mb-16">
            <div className="backdrop-blur-sm rounded-2xl p-8" style={{ backgroundColor: contentConfig.backgroundColor }}>
              <h2 className="text-3xl font-serif mb-6 pb-3 border-b-2 border-amber-600 uppercase">{section.title}</h2>
              <div className="space-y-4">
                {section.points.map((point, pIdx) => (
                  <div key={pIdx} className={`flex items-start gap-4 p-4 rounded-xl transition-all ${point.type === 'positive' ? 'bg-green-50 border-l-4 border-green-500' : point.type === 'negative' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-amber-50 border-l-4 border-amber-500'}`}>
                    <span className="text-3xl flex-shrink-0">{point.type === 'positive' ? '✨' : point.type === 'negative' ? '⚠️' : '🔮'}</span>
                    <p className="text-base leading-relaxed">{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="space-y-16">
           <GemstoneRecommendation gemstones={recommendations.gemstones} userName={userName} />
           <RemedySection remedies={recommendations.remedies} userName={userName} />
           <ConsultationBooking />
        </div>
      </div>
    </div>
  );
};

export default EnhancedNumerologyReport;
