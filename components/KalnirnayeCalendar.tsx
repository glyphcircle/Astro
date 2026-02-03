import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Card from './shared/Card';
import { CALENDAR_TRANSLATIONS, CALENDAR_FESTIVALS } from '../services/calendarData';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'hi', name: 'Hindi (हिंदी)' }
];

/**
 * Deterministic Panchang Simulator
 * Uses a reference date to calculate lunar cycles.
 */
const getPanchangForDate = (date: Date) => {
  // Reference New Moon: Jan 11, 2024
  const refNewMoon = new Date('2024-01-11').getTime();
  const lunarCycle = 29.53059; // Avg days
  const msInDay = 86400000;

  const diffDays = (date.getTime() - refNewMoon) / msInDay;
  const cycleProgress = (diffDays % lunarCycle + lunarCycle) % lunarCycle;
  
  // Tithi: 30 Tithis in 29.53 days
  const tithiValue = Math.floor((cycleProgress / lunarCycle) * 30);
  const isShukla = tithiValue < 15;
  const tithiIndex = tithiValue % 15;

  // Nakshatra: Moon travels 360 deg in 27.3 days
  const nakshatraCycle = 27.32166;
  const nakProgress = (diffDays % nakshatraCycle + nakshatraCycle) % nakshatraCycle;
  const nakIndex = Math.floor((nakProgress / nakshatraCycle) * 27);

  // Month Calculation (Approximate simplification for demo)
  const monthOffset = 3; // Approx Chaitra starts in April
  const monthIndex = (Math.floor(diffDays / lunarCycle) + monthOffset) % 12;

  return {
    tithi: tithiIndex,
    isShukla,
    nakshatra: nakIndex,
    month: monthIndex
  };
};

const KalnirnayeCalendar: React.FC = () => {
  const { t } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date());
  const [calLang, setCalLang] = useState('en');

  const dict = CALENDAR_TRANSLATIONS[calLang] || CALENDAR_TRANSLATIONS['en'];

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = [];
    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const panchang = getPanchangForDate(date);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      grid.push({
        day: d,
        date: date,
        isToday: date.toDateString() === new Date().toDateString(),
        panchang,
        festival: CALENDAR_FESTIVALS[dateStr]
      });
    }
    return grid;
  }, [viewDate]);

  const changeMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const changeYear = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1));
  };

  const currentGregorianMonth = viewDate.toLocaleString('default', { month: 'long' });
  const currentPanchangMonth = dict.months[getPanchangForDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)).month];

  return (
    <div className="min-h-screen py-8 px-4 bg-[#0a0a12] font-lora">
      <div className="max-w-7xl mx-auto">
        {/* ENHANCED HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6 border-b border-amber-500/10 pb-8">
          <div className="flex items-center gap-6">
            <Link to="/home" className="p-3 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all group">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
            </Link>
            <div>
              <h1 className="text-4xl font-cinzel font-black text-amber-100 tracking-widest drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">KALNIRNAYE</h1>
              <p className="text-amber-500/60 text-[10px] uppercase tracking-[0.4em] font-bold mt-1">Sacred Vedic Almanac</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-black/40 p-1 rounded-xl border border-amber-500/20 flex gap-1">
              {LANGUAGES.map(l => (
                <button 
                  key={l.code}
                  onClick={() => setCalLang(l.code)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${calLang === l.code ? 'bg-amber-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setViewDate(new Date())}
              className="px-5 py-1.5 bg-gradient-to-r from-amber-700 to-maroon-800 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all border border-amber-500/30"
            >
              Today
            </button>
          </div>
        </header>

        {/* CALENDAR CONTROLS & MAIN GRID */}
        <div className="flex flex-col gap-8">
          <Card className="bg-[#fffcf0] border-[#d4af37]/30 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden report-canvas sacred-boundary">
            {/* INLINE CALENDAR HEADER */}
            <div className="bg-[#d4af37] p-8 text-center border-b-2 border-amber-900/10 relative">
               {/* Aesthetic Background Ornaments */}
               <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
                  <div className="text-[12rem] leading-none absolute -left-10 -top-10">ॐ</div>
                  <div className="text-[12rem] leading-none absolute -right-10 -bottom-10">ॐ</div>
               </div>

               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Year Controls */}
                  <div className="flex items-center gap-4 order-2 md:order-1">
                     <button onClick={() => changeYear(-1)} className="p-2 bg-black/10 hover:bg-black/20 rounded transition-colors text-amber-950">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                     </button>
                     <span className="text-2xl font-cinzel font-black text-amber-950 min-w-[80px]">{viewDate.getFullYear()}</span>
                     <button onClick={() => changeYear(1)} className="p-2 bg-black/10 hover:bg-black/20 rounded transition-colors text-amber-950">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7m0 0l-7 7m7-7H6" /></svg>
                     </button>
                  </div>

                  {/* Main Month Label */}
                  <div className="order-1 md:order-2">
                     <h2 className="text-5xl font-cinzel font-black text-amber-950 uppercase tracking-[0.1em] drop-shadow-sm leading-none">
                       {currentPanchangMonth}
                     </h2>
                     <p className="text-maroon-900 font-bold uppercase tracking-[0.4em] text-[10px] mt-3 opacity-60">
                       {currentGregorianMonth} • Masa Cycle
                     </p>
                  </div>

                  {/* Month Controls */}
                  <div className="flex items-center gap-4 order-3">
                     <button onClick={() => changeMonth(-1)} className="p-2 bg-black/10 hover:bg-black/20 rounded transition-colors text-amber-950">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                     </button>
                     <span className="text-xl font-cinzel font-black text-amber-950 min-w-[120px] uppercase">{currentGregorianMonth.substring(0, 3)}</span>
                     <button onClick={() => changeMonth(1)} className="p-2 bg-black/10 hover:bg-black/20 rounded transition-colors text-amber-950">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                     </button>
                  </div>
               </div>
            </div>

            {/* DAY LABELS GRID */}
            <div className="grid grid-cols-7 bg-[#f2e6c4] border-b border-amber-900/10">
               {dict.weekdays.map((d: string, i: number) => (
                  <div key={d} className={`py-6 text-center text-[10px] font-black uppercase tracking-[0.25em] ${i === 0 ? 'text-red-700' : 'text-amber-900/60'}`}>
                    {d}
                  </div>
               ))}
            </div>

            {/* MAIN CALENDAR GRID */}
            <div className="grid grid-cols-7 min-w-[600px] lg:min-w-0">
               {calendarData.map((cell, i) => {
                 if (!cell) return (
                   <div key={`empty-${i}`} className="bg-[#fffef7]/40 h-28 md:h-36 border-r border-b border-amber-900/5"></div>
                 );
                 
                 const isSunday = i % 7 === 0;

                 return (
                    <div 
                      key={cell.day} 
                      className={`
                        relative h-28 md:h-36 p-3 border-r border-b border-amber-900/10 transition-all duration-500 group
                        ${cell.isToday ? 'bg-amber-100/60' : 'hover:bg-amber-50/70'}
                      `}
                    >
                       {/* Gregorian Date - Large & Elegant */}
                       <div className={`text-3xl md:text-4xl font-cinzel font-black mb-1 leading-none ${isSunday ? 'text-red-600' : 'text-[#2d0a18]'}`}>
                         {cell.day}
                       </div>

                       {/* Panchang Details - Stacked neatly */}
                       <div className="flex flex-col mt-2 gap-1">
                          <span className="text-[9px] md:text-[10px] font-black text-[#5c2a0d] uppercase tracking-tighter truncate leading-tight">
                            {dict.paksha[cell.panchang.isShukla ? 0 : 1]} {dict.tithis[cell.panchang.tithi]}
                          </span>
                          <span className="text-[8px] md:text-[9px] text-[#8b4513]/60 italic truncate font-bold">
                            {dict.nakshatras[cell.panchang.nakshatra]}
                          </span>
                       </div>

                       {/* Festival Indicator - Vermillion styling */}
                       {cell.festival && (
                          <div className="mt-3 bg-red-700/5 border border-red-700/10 px-1.5 py-1 rounded shadow-sm flex items-center gap-1">
                             <div className="w-1 h-1 rounded-full bg-red-700 animate-pulse"></div>
                             <span className="text-[8px] md:text-[9px] font-black text-red-800 uppercase tracking-tighter leading-none truncate">
                               {cell.festival}
                             </span>
                          </div>
                       )}

                       {/* Interactive Decoration */}
                       {cell.isToday && (
                         <div className="absolute bottom-3 right-3 w-2 h-2 bg-amber-600 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)] animate-pulse"></div>
                       )}
                       
                       <div className="absolute top-1 right-1 text-[8px] opacity-0 group-hover:opacity-20 font-cinzel text-amber-900 transition-opacity">
                         BHAGYA
                       </div>
                    </div>
                 );
               })}
            </div>

            {/* FOOTER LEGEND */}
            <div className="p-6 bg-[#f2e6c4]/50 border-t border-amber-900/5 flex justify-between items-center text-[9px] font-cinzel font-black uppercase tracking-[0.3em] text-amber-900/40">
                <span>Glyph Circle Almanac v4.0</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-700/20"></span> Sunday</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600"></span> Today</span>
                </div>
                <span>Est. {new Date().getFullYear()}</span>
            </div>
          </Card>
          
          <div className="flex flex-col md:flex-row gap-6">
              <Card className="flex-1 p-6 bg-amber-900/5 border border-amber-500/10">
                  <h3 className="text-xs font-cinzel font-bold text-amber-200 mb-3 uppercase tracking-widest">Temporal Wisdom</h3>
                  <p className="text-sm text-amber-100/70 italic leading-relaxed">
                    "The Hindu calendar is more than dates; it is a celestial map of vibrational shifts. Each Tithi and Nakshatra influences the Prana of the Earth, guiding our actions toward harmony with the eternal cycle (Rta)."
                  </p>
              </Card>
              <Card className="flex-1 p-6 bg-black/40 border border-amber-500/10 flex flex-col justify-center items-center text-center">
                  <span className="text-2xl mb-2">🧘</span>
                  <p className="text-xs text-amber-200/60 uppercase tracking-widest font-bold">Recommended Ritual</p>
                  <p className="text-sm text-amber-100 font-cinzel mt-2">Meditate on {dict.nakshatras[getPanchangForDate(new Date()).nakshatra]} energy for clarity.</p>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalnirnayeCalendar;