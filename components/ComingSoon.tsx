import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Card from './shared/Card';
import Modal from './shared/Modal';
import { useTranslation } from '../hooks/useTranslation';

const ComingSoon: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceId = searchParams.get('id') || 'Universal';
  
  // State
  const [view, setView] = useState<'entry' | 'observing'>('entry');
  const [formData, setFormData] = useState({ name: '', dob: '' });
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [nodeId, setNodeId] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const generateSoulId = (name: string, dob: string) => {
    const cleanName = name.toUpperCase().replace(/\s/g, '').substring(0, 8);
    const year = dob ? new Date(dob).getFullYear() : '2025';
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `DECREE-${cleanName}-${year}-${random}`;
  };

  const SCRIBE_LOGS = useMemo(() => [
    `Establishing connection to Akasha Node for ${formData.name || 'Seeker'}...`,
    "Retrieving temporal birth coordinates...",
    `Analyzing planetary aspects for the gateway...`,
    "Inscribing destiny patterns into the permanent registry...",
    "Applying gold-leaf seal to the digital decree...",
    "Verifying karmic balance for this cycle...",
    "Manifestation complete."
  ], [formData.name]);

  const startObservation = () => {
    if (!formData.name) return;
    setNodeId(generateSoulId(formData.name, formData.dob));
    setView('observing');
    const timer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(timer);
                setIsComplete(true);
                return 100;
            }
            return prev + (Math.random() * 4);
        });
    }, 450);
    return () => clearInterval(timer);
  };

  useEffect(() => {
    if (view === 'observing') {
        const logTimer = setInterval(() => {
            setCurrentLogIndex(prev => (prev < SCRIBE_LOGS.length - 1 ? prev + 1 : prev));
        }, 2800);
        return () => clearInterval(logTimer);
    }
  }, [view, SCRIBE_LOGS]);

  return (
    <div className="min-h-screen bg-[#050510] text-amber-50 font-lora relative flex flex-col overflow-hidden">

      {/* 🛡️ THE SACRED IMPERIAL BOUNDARY (Gold Double Frame at Edges) */}
      <div className="fixed inset-0 z-0 pointer-events-none p-4 sm:p-6 lg:p-10">
          <div className="w-full h-full border-[1.5px] border-amber-500/30 rounded-3xl relative shadow-[0_0_50px_rgba(245,158,11,0.05)]">
              <div className="absolute inset-[-4px] border border-amber-500/10 rounded-[28px]"></div>
          </div>
      </div>

      {/* 🌟 IMPERIAL BLACK HEADER */}
      <div className="relative z-20 w-full bg-black/90 border-b border-amber-500/20 py-10 px-6 shadow-2xl flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-7xl font-cinzel font-black tracking-[0.2em] text-white uppercase drop-shadow-2xl">
            Under <span className="gold-gradient-text">Observation</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
              <div className={`w-2.5 h-2.5 rounded-full ${isComplete ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-amber-500 animate-pulse shadow-[0_0_15px_#f59e0b]'}`}></div>  
              <span className={`font-cinzel font-black uppercase tracking-[0.4em] text-[10px] ${isComplete ? 'text-green-500' : 'text-amber-500/60'}`}>
                  {view === 'entry' ? 'Identity Verification Required' : isComplete ? 'Registry Entry Confirmed' : 'Synchronizing Soul Data'}
              </span>
          </div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col items-center pt-8 px-6 md:px-12">

          <div className="w-full max-w-2xl mb-8">
             <Link to="/home" className="inline-flex items-center text-amber-200/60 hover:text-amber-400 transition-all group">
                <span className="text-2xl mr-3 group-hover:-translate-x-2 transition-transform">←</span>
                <span className="font-cinzel font-black uppercase tracking-widest text-xs">Exit Sanctuary</span>
             </Link>
          </div>

          <div className="max-w-2xl w-full relative">
              {/* 📜 THE MANUSCRIPT CARD (Central Parchment Area) */}
              <div className="relative bg-[#fffcf0] rounded-[3rem] p-10 md:p-16 shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 report-canvas sacred-boundary">

                  {/* HELP BUTTON (Inside Parchment Area) */}
                  <button
                      onClick={() => setIsHelpOpen(true)}
                      className="absolute top-8 right-8 w-12 h-12 rounded-full border border-amber-900/10 flex items-center justify-center text-amber-900/20 hover:text-amber-600 hover:border-amber-600 transition-all z-20 bg-white/20"
                      title="Oracle Insights"
                  >
                      <span className="font-cinzel font-black text-xl animate-pulse">i</span>
                  </button>

                  {/* Watermark Decoration */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                      <span className="text-[25rem] font-cinzel">ॐ</span>
                  </div>

                  <div className="relative z-10">
                      {view === 'entry' ? (
                          /* 📝 IDENTITY ENTRY FORM */
                          <div className="space-y-12 animate-fade-in-up">
                              <p className="text-[#2d0a18] text-center font-lora italic text-2xl md:text-3xl leading-relaxed">
                                  "To observe the alignment of your stars, the Oracle requires your temporal coordinates."
                              </p>

                              <div className="space-y-8">
                                  <div>
                                      <label className="block text-[10px] text-[#8b4513]/60 uppercase font-black tracking-widest mb-2 ml-1">Manifested Name</label>
                                      <input
                                          value={formData.name}
                                          onChange={e => setFormData({...formData, name: e.target.value})}
                                          placeholder="YOUR NAME"
                                          className="w-full bg-white/40 border-b-2 border-amber-900/10 rounded-none p-5 text-[#2d0a18] font-cinzel font-black outline-none focus:border-amber-500 transition-all placeholder-[#8b4513]/10 text-2xl tracking-[0.1em]"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] text-[#8b4513]/60 uppercase font-black tracking-widest mb-2 ml-1">Arrival Date (Birth)</label>
                                      <input
                                          type="date"
                                          value={formData.dob}
                                          onChange={e => setFormData({...formData, dob: e.target.value})}
                                          className="w-full bg-white/40 border-b-2 border-amber-900/10 rounded-none p-5 text-[#2d0a18] font-mono outline-none focus:border-amber-500 transition-all text-2xl"
                                      />
                                  </div>
                              </div>

                              <button
                                  onClick={startObservation}
                                  disabled={!formData.name}
                                  className="w-full bg-[#2d0a18] hover:bg-[#4a0404] text-white font-cinzel font-black py-7 rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-20 uppercase text-sm tracking-[0.5em] transform hover:-translate-y-1"       
                              >
                                  Invoke the Oracle
                              </button>
                          </div>
                      ) : (
                          /* 🌀 ACTIVE OBSERVATION INTERFACE */
                          <div className="flex flex-col animate-fade-in-up">
                              <div className="mb-12">
                                  <p className="text-[#2d0a18] font-lora italic text-2xl md:text-3xl leading-relaxed text-center px-4">
                                      "The stars are aligning for the <span className="text-[#8b4513] font-black underline decoration-amber-500/40 underline-offset-8 font-cinzel tracking-widest">{nodeId}</span> gateway."
                                  </p>
                              </div>

                              <div className="bg-[#8b4513]/5 rounded-[2rem] p-10 border border-amber-900/5 font-mono text-[11px] space-y-4 mb-12 min-h-[250px] shadow-inner">       
                                  {SCRIBE_LOGS.map((log, i) => (
                                      <div key={i} className={`flex items-start gap-4 transition-all duration-1000 ${i <= currentLogIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                          <span className={`w-2 h-2 rounded-full mt-1.5 ${i === currentLogIndex && !isComplete ? 'bg-amber-600 animate-pulse' : 'bg-green-700/40'}`}></span>
                                          <span className={i === currentLogIndex ? 'text-[#4a0404] font-black' : 'text-[#8b4513]/40'}>{log}</span>
                                      </div>
                                  ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-amber-900/10">
                                  <div className="flex flex-col">
                                      <span className="text-[11px] font-black uppercase tracking-widest text-[#8b4513]/40 mb-3">Astral Alignment</span>
                                      <div className="flex items-center gap-6 w-full">    
                                          <div className="flex-grow h-4 bg-amber-900/10 rounded-full overflow-hidden p-1 border border-amber-900/5">
                                              <div className="h-full bg-gradient-to-r from-[#8b4513] to-[#c07c2a] rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(192,124,42,0.4)]" style={{ width: `${progress}%` }}></div>
                                          </div>
                                          <span className="text-2xl font-cinzel font-black text-[#8b4513] w-16 text-right">{Math.floor(progress)}%</span>
                                      </div>
                                  </div>
                                  <div className="flex flex-col md:items-end">
                                      <span className="text-[11px] font-black uppercase tracking-widest text-[#8b4513]/40 mb-3">Registry Stability</span>
                                      <span className={`text-2xl font-cinzel font-black uppercase tracking-widest ${isComplete ? 'text-green-700' : 'text-amber-700 animate-pulse'}`}>
                                          {isComplete ? 'LOCKED' : 'Adjusting...'}        
                                      </span>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* 🔘 NAVIGATION ACTIONS */}
              <div className="mt-16 w-full space-y-10 flex flex-col items-center">        
                  <button
                      onClick={() => navigate('/home')}
                      className={`w-full max-w-lg font-cinzel font-black py-7 rounded-3xl shadow-2xl tracking-[0.4em] transition-all transform active:scale-95 uppercase text-xs border border-white/10 ${
                          isComplete 
                          ? 'bg-gradient-to-r from-green-600 to-green-900 text-white'     
                          : 'bg-gradient-to-r from-amber-600 to-amber-900 text-black'     
                      }`}
                  >
                      {isComplete ? 'Registry Found • Return Home' : 'Back to Sanctuary'} 
                  </button>

                  <div className="flex justify-between w-full max-w-lg px-6 border-t border-white/5 pt-8 opacity-60">
                      <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">Node Path</span>
                          <span className="text-[11px] text-amber-500 font-mono font-bold truncate max-w-[180px]">
                              {view === 'observing' ? nodeId : 'AWAITING_INPUT'}
                          </span>
                      </div>
                      <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">Est. Arrival</span>
                          <span className="text-[11px] text-amber-500 font-bold block uppercase tracking-widest">Upcoming Cycle</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 🔮 ORACLE INSIGHTS MODAL */}
      <Modal isVisible={isHelpOpen} onClose={() => setIsHelpOpen(false)}>
        <div className="p-12 bg-[#fffcf0] text-amber-950 font-lora relative border-[6px] border-double border-amber-600/40 rounded-[3rem] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                <span className="text-[20rem] font-cinzel">i</span>
            </div>

            <h3 className="text-4xl font-cinzel font-black text-[#4a0404] mb-10 border-b-2 border-amber-600/10 pb-6 uppercase tracking-[0.25em] text-center">
                Oracle Insights
            </h3>

            <div className="space-y-10 relative z-10">
                <section>
                    <h4 className="font-cinzel font-black text-amber-800 text-sm uppercase tracking-widest mb-3">Why must I wait?</h4>
                    <p className="text-base leading-relaxed italic text-[#2d0a18]">       
                        The stars are never static. To manifest a truly accurate Imperial Decree, the Oracle must synchronize your temporal coordinates with the current planetary transits. This "Observation" ensures your path is illuminated by the present cosmic light. 
                    </p>
                </section>

                <section>
                    <h4 className="font-cinzel font-black text-amber-800 text-sm uppercase tracking-widest mb-3">What is the Node Path?</h4>
                    <p className="text-base leading-relaxed italic text-[#2d0a18]">       
                        Your <strong>Registry Node</strong> is a unique signature derived from your soul's arrival data. It ensures your reading is permanently etched into the Akasha, remaining unique to your journey.
                    </p>
                </section>

                <section>
                    <h4 className="font-cinzel font-black text-amber-800 text-sm uppercase tracking-widest mb-3">Registry Stability</h4>
                    <p className="text-base leading-relaxed italic text-[#2d0a18]">       
                        Once stability is <strong>LOCKED</strong>, your destiny patterns have been successfully scribed. At this stage, the gateway is prepared for your next evolution.
                    </p>
                </section>
            </div>

            <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full mt-14 py-6 bg-[#2d0a18] text-white font-cinzel font-black rounded-2xl uppercase text-[11px] tracking-[0.5em] shadow-xl hover:bg-[#4a0404] transition-all"
            >
                Continue Observation
            </button>
        </div>
      </Modal>

      {/* 🔒 SYSTEM DECORATION FOOTER */}
      <div className="p-12 text-center pointer-events-none opacity-20">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.8em]">  
            SYSTEM_INTEGRITY_CHECK_PASS • DHARMA_PROTOCOL_V4.0
          </p>
      </div>
    </div>
  );
};

export default ComingSoon;