import React from 'react';
import { useTheme } from '../context/ThemeContext';
import BirthChartSVG from './charts/BirthChartSVG';
import GemstoneRecommendation from './report-sections/GemstoneRecommendation';
import RemedySection from './report-sections/RemedySection';
import SmartBackButton from './shared/SmartBackButton';
import { Link } from 'react-router-dom';
import Button from './shared/Button';
import ConsultationBooking from './report-sections/ConsultationBooking';

interface EnhancedAstrologyReportProps {
  data: any;
  onDownload?: () => void;
}

const EnhancedAstrologyReport: React.FC<EnhancedAstrologyReportProps> = ({ 
  data, 
  onDownload 
}) => {
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  // Helper to parse AI markdown into structured sections
  const parseAdvancedReport = (text: string) => {
    if (!text) return null;
    
    const sections: { title: string; content: string[] }[] = [];
    // Split by numbered sections like "1. BIRTH CHART" or "2. PLANETARY"
    const rawSections = text.split(/(?=\d+\.\s+[A-Z\s]+)/);
    
    rawSections.forEach(sec => {
      const lines = sec.split('\n').filter(l => l.trim());
      if (lines.length === 0) return;
      
      const title = lines[0].replace(/^\d+\.\s+/, '').trim();
      const content = lines.slice(1);
      
      if (title && content.length > 0) {
        sections.push({ title, content });
      }
    });

    return sections;
  };

  const advancedReportSections = parseAdvancedReport(data.advancedReport);

  return (
    <div 
      id="astrology-report-content"
      className="enhanced-report-stack min-h-screen w-full flex flex-col items-center justify-start pt-16 pb-24 px-4 sm:px-8 bg-[#050112]"
    >
      {/* 📜 PAGE 1: TITLE PAGE */}
      <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm mb-12">
        <div className="page-content flex flex-col items-center justify-start text-center p-20 pt-32 min-h-[297mm]">
          <div className="mb-12 w-48 h-48 rounded-full border-8 border-double border-amber-600/30 flex items-center justify-center bg-black/5 shadow-2xl">
             <span className="text-8xl font-cinzel font-black gold-gradient-text">🕉️</span>
          </div>
          <h1 className="text-6xl font-cinzel font-black tracking-widest text-[#2d0a18] uppercase mb-8 leading-tight">
            Imperial <br/> Astrology Report
          </h1>
          <div className="w-24 h-1 bg-amber-600/40 mb-8"></div>
          <h2 className="text-4xl font-cinzel font-bold text-amber-800 mb-2 uppercase tracking-widest">{data.userName}</h2>
          <p className="text-xl font-lora italic opacity-70">
            Birth: {new Date(data.birthDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
          {/* Explicit Lagna Highlight */}
          <div className="mt-8 px-6 py-3 bg-amber-900/5 border border-amber-900/10 rounded-full">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-800">Soul Origin: {data.lagna.signName} Ascendant</span>
          </div>
          <div className="mt-auto pt-20">
            <p className="text-[10px] font-cinzel font-black uppercase tracking-[0.5em] opacity-40 text-[#2d0a18]">
              Sealed by the Sovereign Registry • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </section>

      {/* 📜 PAGE 2: BIRTH DETAILS */}
      <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm mb-12">
        <div className="page-content p-20 pt-24 min-h-[297mm] flex flex-col justify-start">
          <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Imperial Birth Decree</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
             {[
               { l: 'Ascendant (Lagna)', v: `${data.lagna.signName} (${data.lagna.degree.toFixed(2)}°)`, i: '🌅' },
               { l: 'Moon Sign', v: data.panchang.nakshatra, i: '🌙' },
               { l: 'Sun Sign', v: data.planets.find((p:any)=>p.name==='Sun')?.signName, i: '☀️' },
               { l: 'Tithi', v: data.panchang.tithi, i: '🌊' },
               { l: 'Lagna Nakshatra', v: data.lagna.nakshatra, i: '⭐' },
               { l: 'Yoga', v: data.panchang.yoga, i: '✨' }
             ].map((item, idx) => (
                <div key={idx} className="p-8 bg-white/60 border border-amber-600/10 rounded-3xl text-center shadow-sm">
                   <div className="text-4xl mb-3">{item.i}</div>
                   <div className="text-[11px] font-black uppercase text-amber-600 mb-2 tracking-widest">{item.l}</div>
                   <div className="text-md font-cinzel font-bold text-amber-950 leading-tight">{item.v}</div>
                </div>
             ))}
          </div>

          <div className="mt-12">
             <h4 className="text-xl font-cinzel font-black uppercase text-[#4a0404] mb-8 border-b-2 border-amber-600/10 pb-4">Planetary positions</h4>
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-amber-900/10 text-amber-900/50 uppercase font-black text-[10px] tracking-widest">
                   <th className="py-4">Graha</th>
                   <th className="py-4">Sign</th>
                   <th className="py-4">Deg</th>
                   <th className="py-4">House</th>
                   <th className="py-4">Status</th>
                 </tr>
               </thead>
               <tbody className="text-[#2d0a18]">
                 {data.planets.map((p: any, i: number) => (
                   <tr key={i} className="border-b border-amber-900/5 font-medium">
                     <td className="py-4 font-black">{p.name} {p.isRetrograde ? '℞' : ''}</td>
                     <td className="py-4">{p.signName}</td>
                     <td className="py-4 font-mono">{p.normDegree.toFixed(2)}°</td>
                     <td className="py-4 text-center">{p.house}</td>
                     <td className="py-4 text-xs italic">{p.isCombust ? 'Combust' : 'Benefic'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </section>

      {/* 📜 PAGE 3: CHART SVG */}
      <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm mb-12">
        <div className="page-content p-20 pt-24 min-h-[297mm] flex flex-col justify-start">
           <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Rasi Chakra (Birth Chart)</h3>
           <div className="flex-grow flex items-center justify-center">
             <BirthChartSVG houses={data.houses} planets={data.planets} lagnaSign={data.lagna.sign} />
           </div>
           <div className="mt-12 p-8 bg-amber-600/5 rounded-3xl border border-amber-600/10 text-center">
             <p className="text-sm italic font-lora text-amber-900/70">
               "The chart above represents the cosmic distribution of energy at your first breath. Each house governs a vital department of your life, from your sense of self to your final liberation."
             </p>
           </div>
        </div>
      </section>

      {/* 📜 ADVANCED ANALYSIS PAGES (12 SECTIONS) */}
      {advancedReportSections && advancedReportSections.length > 0 ? (
        advancedReportSections.map((section, sIdx) => (
          <section key={sIdx} className="report-page bg-[#fffcf0] shadow-2xl rounded-sm mb-12">
            <div className="page-content p-16 md:p-24 min-h-[297mm] flex flex-col justify-start">
               <h3 className="text-2xl md:text-3xl font-cinzel font-black uppercase tracking-wider text-amber-900 mb-10 border-b-4 border-amber-600/20 pb-4">
                 {section.title}
               </h3>
               <div className="space-y-6 text-[#1a1a1a] text-lg leading-relaxed text-justify font-lora">
                 {section.content.map((line, lIdx) => {
                   const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-');
                   const processedLine = line.trim().replace(/^[*\-]\s+/, '');
                   
                   return (
                     <p key={lIdx} className={`${isBullet ? 'pl-6 relative' : ''}`}>
                       {isBullet && <span className="absolute left-0 text-amber-600">✦</span>}
                       {processedLine.split(/(\*\*.*?\*\*)/).map((part, pIdx) => {
                         if (part.startsWith('**') && part.endsWith('**')) {
                           return <strong key={pIdx} className="text-[#4a0404] font-black">{part.slice(2, -2)}</strong>;
                         }
                         return part;
                       })}
                     </p>
                   );
                 })}
               </div>
            </div>
          </section>
        ))
      ) : (
        /* Fallback if advanced report failed to manifest */
        <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm mb-12">
          <div className="page-content p-20 min-h-[297mm] flex flex-col justify-center text-center">
            <h3 className="text-2xl font-cinzel text-amber-900 uppercase">Analysis Seal Intact</h3>
            <p className="text-amber-800/60 mt-4 italic">The detailed interpretations are appearing in the ethereal registry. Scroll down for remedies or try refreshing.</p>
          </div>
        </section>
      )}

      {/* 📜 REMEDIES & STORE SECTIONS */}
      <div className="w-full flex flex-col items-center gap-16 mt-12">
        <section className="w-full max-w-4xl p-12 bg-[#fffcf0] shadow-xl rounded-[3rem] border-4 border-double border-amber-200">
           <GemstoneRecommendation gemstones={data.recommendations.gemstones} userName={data.userName} />
           <div className="mt-12 text-center pt-8 border-t border-amber-900/10">
             <Link 
               to="/store?category=Gemstones" 
               state={{ from: 'astrology-report', preserveReport: true, serviceType: 'astrology' }} 
               className="inline-flex items-center gap-2 text-amber-800 font-black uppercase text-xs tracking-[0.3em] hover:text-orange-700 transition-colors"
             >
               <span>Explore Consecrated Artifacts</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </Link>
           </div>
        </section>

        <section className="w-full max-w-4xl p-12 bg-[#fffcf0] shadow-xl rounded-[3rem] border-4 border-double border-amber-200">
           <RemedySection remedies={data.recommendations.remedies} userName={data.userName} />
        </section>

        <ConsultationBooking />
      </div>

      <footer className="w-full max-w-4xl flex flex-col items-center gap-10 py-24 no-print">
         <div className="flex gap-6 flex-wrap justify-center">
            {onDownload && (
              <button 
                onClick={onDownload} 
                className="px-12 py-5 bg-[#2d0a18] text-white font-cinzel font-black rounded-full shadow-2xl hover:scale-105 hover:bg-[#4a0404] transition-all uppercase tracking-widest text-sm border-2 border-amber-600/30"
              >
                Archive Complete Decree (PDF)
              </button>
            )}
            <SmartBackButton label="Return to Sanctuary" className="px-12 py-5 bg-white text-[#2d0a18] border-2 border-[#2d0a18] font-cinzel font-black rounded-full shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-sm" />
         </div>
         <p className="text-[#fffcf0]/20 text-[8px] font-mono uppercase tracking-[0.6em]">Node Sync ID: {Math.random().toString(36).substring(2,10).toUpperCase()}</p>
      </footer>

      <style>{`
        .report-page {
          width: 210mm;
          min-height: 297mm;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-color: #fffcf0;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(139, 69, 19, 0.1);
        }
        
        .enhanced-report-stack section {
          page-break-after: always;
        }

        .gold-gradient-text {
          background: linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media print {
          .enhanced-report-stack { background: white !important; padding: 0 !important; }
          .report-page { margin: 0 !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default EnhancedAstrologyReport;