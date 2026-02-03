
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useDb } from '../hooks/useDb';

const ReportDesigner: React.FC = () => {
  const { t } = useTranslation();
  const { db, createEntry } = useDb();
  
  const [reportTitle, setReportTitle] = useState('IMPERIAL DECREE');
  const [reportSubtext, setReportSubtext] = useState('AUTHENTICATED BY THE SOVEREIGN REGISTRY');
  const [reportContent, setReportContent] = useState('The weave of your prana is aligning with the celestial mandate. As the shadows recede before the coming dawn of your manifestation, a throne of destiny awaits your claim. This record is sealed with the eternal resonance of the stars.');
  const [isSaving, setIsSaving] = useState(false);
  const [reportId, setReportId] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  const LOTUS_LOGO = 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO';

  useEffect(() => {
    setReportId(`NODE_SYNC_${Math.random().toString(36).substring(2, 12).toUpperCase()}`);
  }, []);

  const handleArchive = async () => {
      setIsSaving(true);
      try {
          await createEntry('report_formats', {
              id: `fmt_${Date.now()}`,
              name: `Sacred - ${reportTitle}`,
              url: 'https://www.transparenttextures.com/patterns/handmade-paper.png',
              status: 'active'
          });
          alert("Manifestation committed to the Cloud Vault.");
      } catch (e) {
          alert("Synchronization Error: Check registry permissions.");
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[#0F0F23] font-lora text-amber-50">
      <div className="max-w-7xl mx-auto">
        
        {/* DESIGNER HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-amber-500/20 pb-8 no-print gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-cinzel font-black tracking-widest text-white uppercase">
                Report <span className="text-amber-500">Designer</span>
            </h1>
            <p className="text-amber-200/50 text-[10px] uppercase tracking-[0.4em] font-bold mt-2">Drafting the Sacred Decrees</p>
          </div>
          
          <div className="flex gap-4">
             <Link to="/admin/dashboard">
                <button className="px-6 py-3 bg-gray-900 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-900/20 transition-all">
                  Dashboard
                </button>
             </Link>
             <Button onClick={handleArchive} disabled={isSaving} className="bg-amber-600 hover:bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] px-8 rounded-xl shadow-xl transition-all">
               {isSaving ? 'Saving...' : 'Save Template'}
             </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* EDITOR PANEL */}
          <div className="lg:col-span-4 space-y-6 no-print">
            <Card className="p-8 bg-black/40 border-amber-500/10 backdrop-blur-xl shadow-2xl rounded-3xl">
              <h3 className="text-amber-400 font-black uppercase text-[10px] tracking-[0.4em] mb-8 border-b border-white/5 pb-4">Manuscript Controls</h3>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[9px] uppercase text-gray-500 font-black mb-1.5 ml-1 tracking-[0.2em]">Imperial Title</label>
                    <input value={reportTitle} onChange={e => setReportTitle(e.target.value.toUpperCase())} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none font-cinzel" />
                 </div>
                 <div>
                    <label className="block text-[9px] uppercase text-gray-500 font-black mb-1.5 ml-1 tracking-[0.2em]">Validation Seal Text</label>
                    <input value={reportSubtext} onChange={e => setReportSubtext(e.target.value.toUpperCase())} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-[9px] uppercase text-gray-500 font-black mb-1.5 ml-1 tracking-[0.2em]">Decree Content</label>
                    <textarea value={reportContent} onChange={e => setReportContent(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm text-white focus:border-amber-500 outline-none h-48 resize-none font-lora leading-relaxed" />
                 </div>
              </div>
            </Card>
          </div>

          {/* THE SACRED PREVIEW */}
          <div className="lg:col-span-8 flex justify-center p-6 bg-black/20 rounded-[3rem] border border-white/5 shadow-inner">
             <div 
                ref={canvasRef} 
                className="relative bg-[#fffcf0] shadow-[0_50px_150px_rgba(0,0,0,0.8)] flex flex-col p-12 md:p-24 report-canvas rounded-sm w-full max-w-[210mm] min-h-[297mm] transition-all"
             >
                {/* 🛡️ THE SACRED BOUNDARY (Double Gilded Etched Line) */}
                <div className="absolute inset-0 z-40 pointer-events-none p-4 md:p-8">
                    <div className="w-full h-full border-[12px] border-double border-[#d4af37]/80 relative">
                        {/* Inner accent line */}
                        <div className="absolute inset-4 border border-[#d4af37]/30"></div>
                    </div>
                    
                    {/* Corner Symbols */}
                    <div className="absolute top-6 left-6 text-[#d4af37] text-2xl">❂</div>
                    <div className="absolute top-6 right-6 text-[#d4af37] text-2xl">❂</div>
                    <div className="absolute bottom-6 left-6 text-[#d4af37] text-2xl">❂</div>
                    <div className="absolute bottom-6 right-6 text-[#d4af37] text-2xl">❂</div>
                </div>

                {/* 🌟 ENHANCED REPORT HEADER */}
                <div className="relative z-30 w-full flex flex-col items-center pt-4 mb-16">
                    <div className="w-32 h-32 mb-8 flex items-center justify-center p-4 bg-black rounded-full border-4 border-[#d4af37] shadow-xl">
                        <img src={LOTUS_LOGO} alt="Sacred Seal" className="w-full h-full object-contain brightness-110" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-3xl font-cinzel font-black text-[#2d0a18] tracking-[0.3em] uppercase mb-1">
                            GLYPH CIRCLE
                        </h3>
                        <div className="flex items-center justify-center gap-4 mb-8">
                           <div className="h-px w-10 bg-[#d4af37]"></div>
                           <p className="text-[#8b4513] text-[9px] font-black uppercase tracking-[0.5em] font-cinzel italic">
                             Ancient Wisdom Redefined
                           </p>
                           <div className="h-px w-10 bg-[#d4af37]"></div>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-cinzel font-black gold-gradient-text tracking-[0.1em] uppercase mb-4 leading-tight drop-shadow-md">
                            {reportTitle}
                        </h2>
                        <p className="text-[#4a0404] text-[10px] font-black uppercase tracking-[0.4em] font-cinzel opacity-80">
                            {reportSubtext}
                        </p>
                    </div>
                </div>

                {/* 📜 CONTENT AREA */}
                <div className="relative z-10 px-6 md:px-12 flex-grow">
                    <div className="text-[#1a1a1a] text-lg md:text-xl font-medium leading-[1.8] text-justify font-lora">
                        <p className="first-letter:text-8xl first-letter:font-cinzel first-letter:text-[#4a0404] first-letter:mr-4 first-letter:float-left first-letter:leading-none first-letter:font-black">
                          {reportContent}
                        </p>
                    </div>

                    {/* Authenticated Stamp */}
                    <div className="mt-32 pt-12 border-t border-[#d4af37]/30 text-center opacity-70">
                        <span className="text-[#4a0404] text-[10px] font-cinzel font-black tracking-[0.4em] uppercase block mb-4">Digitally Sealed by the Sovereign Registry</span>
                        <div className="inline-flex items-center gap-4 bg-[#0F0F23] text-[#d4af37] px-6 py-2 rounded-full text-[10px] font-mono tracking-widest uppercase border border-[#d4af37]/40 shadow-lg">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            {reportId}
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDesigner;
