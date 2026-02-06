import React from 'react';
import { useTheme } from '../context/ThemeContext';
import BirthChartSVG from './charts/BirthChartSVG';
import GemstoneRecommendation from './report-sections/GemstoneRecommendation';
import RemedySection from './report-sections/RemedySection';
import SmartBackButton from './shared/SmartBackButton';
import { Link } from 'react-router-dom';
import Button from './shared/Button';

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

  return (
    <div 
      id="astrology-report-content"
      className="enhanced-report-stack min-h-screen w-full flex flex-col items-center justify-start pt-16 pb-24 px-4 sm:px-8 bg-[#050112]"
    >
      <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm">
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
          <div className="mt-auto pt-20">
            <p className="text-[10px] font-cinzel font-black uppercase tracking-[0.5em] opacity-40">
              Sealed by the Sovereign Registry • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </section>

      <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm">
        <div className="page-content p-20 pt-24 min-h-[297mm] flex flex-col justify-start">
          <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Imperial Birth Decree</h3>
          <div className="bg-white/40 p-10 rounded-[3rem] border border-amber-500/10 backdrop-blur-md mb-12">
            <p className="text-lg font-lora italic leading-relaxed text-amber-950 text-center">
              "By the alignment of the stars at the precise moment of your manifestation, the cosmic laws have inscribed a unique path for your soul. This decree serves as your celestial map to navigate the coming temporal cycles."
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {[
               { l: 'Ascendant', v: data.lagna.signName, i: '🌅' },
               { l: 'Moon Sign', v: data.panchang.nakshatra, i: '🌙' },
               { l: 'Sun Sign', v: data.planets.find((p:any)=>p.name==='Sun')?.signName, i: '☀️' },
               { l: 'Tithi', v: data.panchang.tithi, i: '🌊' },
               { l: 'Nakshatra', v: data.lagna.nakshatra, i: '⭐' },
               { l: 'Yoga', v: data.panchang.yoga, i: '✨' }
             ].map((item, idx) => (
                <div key={idx} className="p-6 bg-white/60 border border-amber-600/10 rounded-3xl text-center shadow-sm">
                   <div className="text-3xl mb-2">{item.i}</div>
                   <div className="text-[10px] font-black uppercase text-amber-600 mb-1">{item.l}</div>
                   <div className="text-sm font-cinzel font-bold text-amber-950">{item.v}</div>
                </div>
             ))}
          </div>
        </div>
      </section>

      <section className="report-page bg-[#fffcf0] shadow-2xl rounded-sm">
        <div className="page-content p-20 pt-24 min-h-[297mm] flex flex-col justify-start">
           <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Rasi Chakra (Birth Chart)</h3>
           <BirthChartSVG houses={data.houses} planets={data.planets} lagnaSign={data.lagna.sign} />
        </div>
      </section>

      <div className="w-full flex flex-col items-center gap-16">
        <section className="w-full max-w-4xl p-8 bg-[#fffcf0] shadow-xl rounded-2xl border border-amber-200">
           <GemstoneRecommendation gemstones={data.recommendations.gemstones} userName={data.userName} />
           <div className="mt-8 text-center">
             <Link 
               to="/store?category=Gemstones" 
               state={{ from: 'astrology-report', preserveReport: true, serviceType: 'astrology' }} 
               className="text-amber-800 font-bold underline uppercase text-xs tracking-widest"
             >
               Explore Spiritual Artifacts in Store
             </Link>
           </div>
        </section>

        <section className="w-full max-w-4xl p-8 bg-[#fffcf0] shadow-xl rounded-2xl border border-amber-200">
           <RemedySection remedies={data.recommendations.remedies} userName={data.userName} />
        </section>
      </div>

      <footer className="w-full max-w-4xl flex flex-col items-center gap-8 py-20 no-print">
         <div className="flex gap-4 flex-wrap justify-center">
            {onDownload && (
              <button 
                onClick={onDownload} 
                className="px-10 py-4 bg-amber-900 text-white font-cinzel font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs"
              >
                Download Complete Decree (PDF)
              </button>
            )}
            <SmartBackButton label="Return to Sanctuary" className="px-10 py-4 bg-white text-amber-900 border-2 border-amber-900 font-cinzel font-black rounded-full shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs" />
         </div>
      </footer>
    </div>
  );
};

export default EnhancedAstrologyReport;
