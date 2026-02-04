
import React from 'react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import BirthChartSVG from './charts/BirthChartSVG';
import GemstoneRecommendation from './report-sections/GemstoneRecommendation';
import RemedySection from './report-sections/RemedySection';
import ConsultationBooking from './report-sections/ConsultationBooking';
import SmartBackButton from './shared/SmartBackButton';

interface EnhancedAstrologyReportProps {
  data: any;
}

const EnhancedAstrologyReport: React.FC<EnhancedAstrologyReportProps> = ({ data }) => {
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  // Derived data
  const shadbalaData = data.planets.map((p: any) => ({
    planet: p.name,
    score: p.shadbala,
    fullMark: 100
  }));

  const yearlyEnergyData = [
    { month: 'Jan', energy: 4 }, { month: 'Feb', energy: 3 }, { month: 'Mar', energy: 5 },
    { month: 'Apr', energy: 4 }, { month: 'May', energy: 2 }, { month: 'Jun', energy: 3 },
    { month: 'Jul', energy: 5 }, { month: 'Aug', energy: 4 }, { month: 'Sep', energy: 5 },
    { month: 'Oct', energy: 4 }, { month: 'Nov', energy: 5 }, { month: 'Dec', energy: 3 },
  ];

  return (
    <div className="enhanced-report-stack flex flex-col items-center gap-16 py-12 px-4 no-scrollbar">
      {/* 1. COVER PAGE */}
      <section className="report-page">
        <div className="page-content flex flex-col items-center justify-center text-center">
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

      {/* 2. BIRTH DECREE */}
      <section className="report-page">
        <div className="page-content">
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

      {/* 3. BIRTH CHART VISUALIZATION */}
      <section className="report-page">
        <div className="page-content">
           <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Rasi Chakra (Birth Chart)</h3>
           <BirthChartSVG houses={data.houses} planets={data.planets} lagnaSign={data.lagna.sign} />
           <div className="mt-12 p-8 bg-amber-600/5 rounded-[2rem] border border-amber-600/10 text-center font-lora italic text-sm">
             "Your North Indian Lagna Kundli. The first house (top diamond) represents your physical manifestation and core identity."
           </div>
        </div>
      </section>

      {/* 4. PLANETARY ARRAY */}
      <section className="report-page">
        <div className="page-content">
           <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Graha Sthiti (Planetary Array)</h3>
           <div className="overflow-hidden rounded-[2rem] border border-amber-500/20 shadow-xl bg-white/80">
              <table className="w-full text-left">
                 <thead className="bg-amber-600/10 text-[10px] font-black uppercase tracking-widest text-amber-900">
                    <tr>
                       <th className="p-5">Planet</th>
                       <th className="p-5">Rashi</th>
                       <th className="p-5">Degree</th>
                       <th className="p-5">House</th>
                       <th className="p-5">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-amber-500/10 text-sm">
                    {data.planets.map((p: any, i: number) => (
                       <tr key={i} className="hover:bg-amber-50 transition-colors font-medium">
                          <td className="p-5 text-amber-900 font-bold">{p.name} {p.isRetrograde ? '℞' : ''}</td>
                          <td className="p-5">{p.signName}</td>
                          <td className="p-5 font-mono">{p.normDegree.toFixed(2)}°</td>
                          <td className="p-5">{p.house}</td>
                          <td className="p-5">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${p.shadbala > 85 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {p.shadbala > 85 ? 'STRONG' : 'STABLE'}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* 5. PLANETARY STRENGTHS */}
      <section className="report-page">
         <div className="page-content">
            <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">Shadbala Resonance</h3>
            <div className="h-[500px] w-full bg-white/40 rounded-[3rem] p-8 border border-amber-600/10 backdrop-blur-md shadow-inner">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={shadbalaData}>
                     <PolarGrid stroke="#D97706" opacity={0.2} />
                     <PolarAngleAxis dataKey="planet" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#8b4513' }} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                     <Radar 
                        name="Strength" 
                        dataKey="score" 
                        stroke="#EA580C" 
                        strokeWidth={3}
                        fill="#F59E0B" 
                        fillOpacity={0.5} 
                     />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </section>

      {/* 6. GEMSTONE PRESCRIPTION */}
      <section className="report-page h-auto min-h-0">
        <div className="page-content">
           <GemstoneRecommendation gemstones={data.recommendations.gemstones} userName={data.userName} />
        </div>
      </section>

      {/* 7. VEDIC REMEDIES */}
      <section className="report-page h-auto min-h-0">
        <div className="page-content">
           <RemedySection remedies={data.recommendations.remedies} userName={data.userName} />
        </div>
      </section>

      {/* 8. YEARLY PREDICTIONS */}
      <section className="report-page">
         <div className="page-content">
            <h3 className="text-3xl font-cinzel font-black uppercase tracking-widest text-amber-900 mb-12 text-center">{new Date().getFullYear()} Cycle Energy</h3>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyEnergyData}>
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: 'none', color: '#fff' }}
                        cursor={{ fill: 'rgba(217, 119, 6, 0.1)' }}
                     />
                     <Bar dataKey="energy" radius={[10, 10, 0, 0]}>
                        {yearlyEnergyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.energy >= 4 ? '#10B981' : entry.energy >= 3 ? '#F59E0B' : '#EF4444'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12">
               <div className="p-6 bg-green-50 border border-green-200 rounded-3xl">
                  <h4 className="text-xs font-black uppercase text-green-800 mb-2">Expansion Phase</h4>
                  <p className="text-sm font-lora italic text-green-900">"Focus on career growth and creative projects during peak energy months."</p>
               </div>
               <div className="p-6 bg-red-50 border border-red-200 rounded-3xl">
                  <h4 className="text-xs font-black uppercase text-red-800 mb-2">Restoration Phase</h4>
                  <p className="text-sm font-lora italic text-red-900">"Prioritize health and inner reflection during lower resonance periods."</p>
               </div>
            </div>
         </div>
      </section>

      {/* 9. CONSULTATION BOOKING */}
      <section className="report-page h-auto min-h-0">
        <div className="page-content">
           <ConsultationBooking />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-4xl flex flex-col items-center gap-8 py-20 no-print">
         <div className="flex gap-4">
            <button className="px-10 py-4 bg-amber-900 text-white font-cinzel font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs">Download Complete Decree (PDF)</button>
            <SmartBackButton label="Return to Sanctuary" className="px-10 py-4 bg-white text-amber-900 border-2 border-amber-900 font-cinzel font-black rounded-full shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs" />
         </div>
         <p className="text-[10px] font-mono uppercase tracking-[0.6em] opacity-40">End of Imperial Record • Secure Node Synchronized</p>
      </footer>
    </div>
  );
};

export default EnhancedAstrologyReport;
