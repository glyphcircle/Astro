import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDb } from '../hooks/useDb';

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

  // Get random template
  const template = db.report_formats?.find((t: any) => 
    t.category === 'numerology' && t.is_active
  );

  const contentConfig = template?.content_area_config || {
    marginTop: 200,
    marginBottom: 150,
    marginLeft: 120,
    marginRight: 120,
    textColor: '#3B1810',
    backgroundColor: 'rgba(255, 248, 240, 0.92)'
  };

  // Parse reading into sections
  const parseReading = (text: string) => {
    const sections: { title: string; points: Array<{ text: string; type: string }> }[] = [];
    
    // Split by section markers
    const sectionRegex = /([A-Z\s]+)\s*\([^)]+\)\s*\*/g;
    const parts = text.split(sectionRegex);
    
    let currentSection = { title: 'Introduction', points: [] as any[] };
    
    parts.forEach((part, idx) => {
      if (idx === 0) {
        // Introduction paragraphs
        const sentences = part.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
        sentences.forEach(s => {
          currentSection.points.push({ text: s.trim(), type: 'neutral' });
        });
        if (currentSection.points.length > 0) sections.push({ ...currentSection });
      } else if (idx % 2 === 1) {
        // Section title
        if (currentSection.points.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { title: part.trim(), points: [] };
      } else {
        // Section content
        const bullets = part.split(/\*\s*\[/).filter(p => p.trim());
        bullets.forEach(bullet => {
          const isPositive = bullet.includes('POSITIVE');
          const isNegative = bullet.includes('NEGATIVE');
          const text = bullet.replace(/\[?POSITIVE\]?|\[?NEGATIVE\]?/g, '').replace(/^\s*\*/g, '').trim();
          
          if (text.length > 20) {
            currentSection.points.push({
              text,
              type: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
            });
          }
        });
      }
    });
    
    if (currentSection.points.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const sections = parseReading(reading);

  // Chart data from engineData
  const energyData = [
    { dimension: 'Physical', score: 8, color: '#D97706' },
    { dimension: 'Emotional', score: 7, color: '#EA580C' },
    { dimension: 'Mental', score: 9, color: '#F59E0B' },
    { dimension: 'Spiritual', score: 6, color: '#DC2626' },
    { dimension: 'Social', score: 7, color: '#10B981' },
    { dimension: 'Material', score: 8, color: '#8B5CF6' }
  ];

  const renderRadarChart = () => (
    <div className="relative w-full h-80 flex items-center justify-center">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Grid circles */}
        {[1, 2, 3, 4, 5].map(i => (
          <circle
            key={i}
            cx="150"
            cy="150"
            r={i * 25}
            fill="none"
            stroke={isLight ? '#D97706' : '#F59E0B'}
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        
        {/* Axes */}
        {energyData.map((_, idx) => {
          const angle = (idx * 60 - 90) * (Math.PI / 180);
          const x = 150 + Math.cos(angle) * 125;
          const y = 150 + Math.sin(angle) * 125;
          return (
            <line
              key={idx}
              x1="150"
              y1="150"
              x2={x}
              y2={y}
              stroke={isLight ? '#D97706' : '#F59E0B'}
              strokeWidth="0.5"
              opacity="0.5"
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={energyData.map((d, idx) => {
            const angle = (idx * 60 - 90) * (Math.PI / 180);
            const r = (d.score / 10) * 125;
            const x = 150 + Math.cos(angle) * r;
            const y = 150 + Math.sin(angle) * r;
            return `${x},${y}`;
          }).join(' ')}
          fill="#F59E0B"
          fillOpacity="0.3"
          stroke="#D97706"
          strokeWidth="2"
        />
        
        {/* Labels */}
        {energyData.map((d, idx) => {
          const angle = (idx * 60 - 90) * (Math.PI / 180);
          const x = 150 + Math.cos(angle) * 140;
          const y = 150 + Math.sin(angle) * 140;
          return (
            <text
              key={idx}
              x={x}
              y={y}
              textAnchor="middle"
              className="text-xs font-semibold"
              fill={isLight ? '#92400E' : '#FCD34D'}
            >
              {d.dimension}
            </text>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div 
      className="report-container relative"
      style={{
        backgroundImage: `url(${template?.template_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      {/* Content Area with Proper Margins */}
      <div 
        className="content-wrapper"
        style={{
          paddingTop: `${contentConfig.marginTop}px`,
          paddingBottom: `${contentConfig.marginBottom}px`,
          paddingLeft: `${contentConfig.marginLeft}px`,
          paddingRight: `${contentConfig.marginRight}px`,
          color: contentConfig.textColor
        }}
      >
        
        {/* Page 1: Cover Page */}
        <div className="page cover-page min-h-screen flex flex-col items-center justify-center text-center mb-20">
          <div 
            className="backdrop-blur-sm rounded-3xl p-12 max-w-3xl"
            style={{ backgroundColor: contentConfig.backgroundColor }}
          >
            <h1 className="text-6xl font-serif mb-6" style={{ color: contentConfig.textColor }}>
              IMPERIAL NUMEROLOGY REPORT
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-amber-600 to-orange-600 mb-8" />
            <p className="text-2xl font-serif mb-4">{userName}</p>
            <p className="text-lg opacity-70">Born: {birthDate}</p>
            <p className="text-sm opacity-60 mt-8">Generated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        {/* Page 2: Personal Resonance */}
        <div className="page mb-16">
          <div 
            className="backdrop-blur-sm rounded-2xl p-8 mb-8"
            style={{ backgroundColor: contentConfig.backgroundColor }}
          >
            <h2 className="text-4xl font-serif text-center mb-8" style={{ color: contentConfig.textColor }}>
              PERSONAL RESONANCE
            </h2>
            
            {/* Number Circles */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-4xl font-bold text-white">{engineData?.lifePathNumber || '9'}</span>
                </div>
                <p className="text-sm font-semibold opacity-80">Life Path</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-4xl font-bold text-white">{engineData?.destinyNumber || '5'}</span>
                </div>
                <p className="text-sm font-semibold opacity-80">Destiny</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-4xl font-bold text-white">{engineData?.soulUrgeNumber || '7'}</span>
                </div>
                <p className="text-sm font-semibold opacity-80">Soul Urge</p>
              </div>
            </div>

            {/* Radar Chart */}
            {renderRadarChart()}
          </div>
        </div>

        {/* Dynamic Sections */}
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="page mb-16">
            <div 
              className="backdrop-blur-sm rounded-2xl p-8"
              style={{ backgroundColor: contentConfig.backgroundColor }}
            >
              <h2 className="text-3xl font-serif mb-6 pb-3 border-b-2 border-amber-600" style={{ color: contentConfig.textColor }}>
                {section.title.toUpperCase()}
              </h2>
              
              <div className="space-y-4">
                {section.points.map((point, pointIdx) => (
                  <div
                    key={pointIdx}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                      point.type === 'positive' 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : point.type === 'negative'
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : 'bg-amber-50 border-l-4 border-amber-500'
                    }`}
                  >
                    <span className={`text-3xl flex-shrink-0 ${
                      point.type === 'positive' ? 'text-green-600' :
                      point.type === 'negative' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {point.type === 'positive' ? '✨' : 
                       point.type === 'negative' ? '⚠️' : '🔮'}
                    </span>
                    <p className={`text-base leading-relaxed ${
                      point.type === 'positive' ? 'text-green-900' :
                      point.type === 'negative' ? 'text-red-900' :
                      'text-gray-800'
                    }`}>
                      {point.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Final Page: Closing Blessing + Contact */}
        <div className="page min-h-screen flex flex-col justify-between">
          <div 
            className="backdrop-blur-sm rounded-2xl p-10 mb-8"
            style={{ backgroundColor: contentConfig.backgroundColor }}
          >
            <h2 className="text-4xl font-serif text-center mb-8" style={{ color: contentConfig.textColor }}>
              CELESTIAL BLESSING
            </h2>
            
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-2xl">
                <span className="text-6xl">🕉️</span>
              </div>
            </div>
            
            <p className="text-lg text-center leading-relaxed italic mb-6" style={{ color: contentConfig.textColor }}>
              "May the divine frequencies of your birth alignment guide you toward absolute fulfillment. 
              The path is clear, and the mandate is your own to manifest. Walk with the light of awareness 
              in every step of your sacred journey."
            </p>
            
            <div className="text-center mt-12">
              <p className="text-xl font-serif font-bold mb-2" style={{ color: contentConfig.textColor }}>
                MASTER OF THE CIRCLE
              </p>
              <p className="text-sm uppercase tracking-widest opacity-70">
                High Priest of Vedic Sciences
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div 
            className="backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-500"
            style={{ backgroundColor: contentConfig.backgroundColor }}
          >
            <h3 className="text-2xl font-serif text-center mb-6" style={{ color: contentConfig.textColor }}>
              🌟 SEEK DEEPER GUIDANCE 🌟
            </h3>
            
            <p className="text-center mb-6 leading-relaxed" style={{ color: contentConfig.textColor }}>
              For personalized remedies, one-on-one consultations, or advanced spiritual guidance, 
              our master practitioners are here to illuminate your path.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                <span className="text-3xl block mb-2">📧</span>
                <p className="font-semibold text-amber-900">Email Consultation</p>
                <p className="text-sm text-amber-800 mt-2">support@glyphcircle.com</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-100 to-red-100">
                <span className="text-3xl block mb-2">🌐</span>
                <p className="font-semibold text-orange-900">Visit Portal</p>
                <p className="text-sm text-orange-800 mt-2">www.glyphcircle.com</p>
              </div>
            </div>
            
            <p className="text-center text-xs mt-6 opacity-60">
              THE Q2 IMPERIAL RECORD • ASTRAL CODE SYNCHRONIZED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNumerologyReport;
