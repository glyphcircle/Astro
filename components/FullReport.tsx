import React, { useRef, useState, useEffect } from 'react';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SageChat from './SageChat';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface FullReportProps {
  reading: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  chartData?: any;
}

const DEFAULT_BRAND_LOGO = 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO';

const FullReport: React.FC<FullReportProps> = ({ reading, title, subtitle, chartData }) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const reportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [displayContent, setDisplayContent] = useState(reading);

  useEffect(() => {
      if (reading) setDisplayContent(reading);
  }, [reading]);

  const renderFormattedText = (text: string) => {
    if (!text || text.trim() === '') return null;

    let normalizedText = text.replace(/\\n/g, '\n');
    const segments = normalizedText.split(/\n+/).filter(s => s.trim().length > 0);        

    return segments.map((line, i) => {
        let trimmed = line.trim();
        const isPositive = trimmed.includes('[POSITIVE]');
        const isNegative = trimmed.includes('[NEGATIVE]');

        const cleanLine = trimmed
            .replace(/\[POSITIVE\]/g, '')
            .replace(/\[\/POSITIVE\]/g, '')
            .replace(/\[NEGATIVE\]/g, '')
            .replace(/\[\/NEGATIVE\]/g, '');

        const isHeader = cleanLine.startsWith('###') || cleanLine.startsWith('#') || (cleanLine.startsWith('**') && cleanLine.endsWith('**') && cleanLine.length < 80);

        const rawContent = cleanLine.replace(/^[#*•-]+\s*/, '').replace(/\s*[#*]+$/, ''); 
        const parts = rawContent.split(/(\*\*.*?\*\*)/g);

        const parsedContent = parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-[#3a0000] font-black border-b-2 border-[#d4af37]/30">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
        });

        if (isHeader) {
            return (
                <div key={i} className="w-full mt-24 mb-12">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="flex-grow h-px bg-gradient-to-r from-transparent to-[#d4af37]/40"></div>
                        <span className="text-2xl opacity-40">❂</span>
                        <div className="flex-grow h-px bg-gradient-to-l from-transparent to-[#d4af37]/40"></div>
                    </div>
                    <h4 className="text-3xl md:text-5xl lg:text-6xl font-cinzel font-black text-[#4a0404] text-center uppercase tracking-[0.1em] leading-tight px-4">
                        {parsedContent}
                    </h4>
                </div>
            );
        }

        const showDropCap = i === 0 && !isHeader;

        return (
            <div
                key={i}
                className={`
                    relative group flex items-start mb-6 p-6 md:p-10 rounded-[2rem] transition-all duration-500 shadow-sm hover:shadow-xl
                    ${isPositive ? 'bg-green-600/5 border-2 border-green-600/20' :        
                      isNegative ? 'bg-red-600/5 border-2 border-red-600/20' :
                      'bg-white/40 border border-[#d4af37]/10'}
                `}
            >
                <div className={`
                    mr-6 mt-1 text-2xl md:text-4xl flex-shrink-0
                    ${isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-[#d4af37]'}
                `}>
                    {isPositive ? '✦' : isNegative ? '⚠️' : '❂'}
                </div>

                <div className={`
                    leading-relaxed text-xl md:text-2xl font-medium text-[#1a1a1a]        
                    ${showDropCap ? 'first-letter:text-7xl md:first-letter:text-9xl first-letter:font-cinzel first-letter:text-[#4a0404] first-letter:mr-4 first-letter:float-left first-letter:leading-none first-letter:font-black' : ''}
                `}>
                    {parsedContent}
                </div>
            </div>
        );
    });
  };

  const handleDownloadPDF = async () => {
      const content = reportRef.current;
      if (!content) return;
      setIsDownloading(true);
      try {
          const canvas = await html2canvas(content, { scale: 1.2, useCORS: true, backgroundColor: '#fffcf0' });
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });   
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Decree_${title.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
          console.error(err);
      } finally {
          setIsDownloading(false);
      }
  };

  return (
    <div className="animate-fade-in-up w-full flex flex-col items-center min-h-screen">   
        <SageChat context={displayContent} type={title} />

        <div className="fixed bottom-24 right-8 z-[100] no-print flex flex-col gap-3 bg-black/80 backdrop-blur-xl border border-amber-500/30 p-2 rounded-2xl shadow-2xl">
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-amber-500 font-bold text-2xl transition-all">+</button>
            <div className="text-[10px] font-mono text-center text-amber-200 uppercase font-black">{(zoom * 100).toFixed(0)}%</div>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-amber-500 font-bold text-2xl transition-all">−</button>
        </div>

        <div
          className="relative transition-all duration-500 shadow-[0_80px_200px_rgba(0,0,0,0.8)] origin-top rounded-3xl bg-[#fffcf0] overflow-visible w-full max-w-[95vw] lg:max-w-[1400px]"
          style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 150}%` }}   
        >
            <div
                ref={reportRef}
                className="relative bg-[#fffcf0] text-black flex flex-col p-6 md:p-20 lg:p-32 space-y-32"
            >
                <div className="absolute inset-0 z-40 pointer-events-none p-4 md:p-12">   
                    <div className="w-full h-full border-[20px] md:border-[60px] border-double border-[#d4af37]/80 relative shadow-[inset_0_0_200px_rgba(139,92,5,0.1)]">
                        <div className="absolute inset-[-10px] border-[4px] border-[#d4af37]/40 rounded-sm"></div>
                    </div>
                </div>

                <section className="relative z-30 min-h-screen flex flex-col items-center">
                    <div className="flex flex-col items-center pt-10 mb-32 w-full">       
                        <div className="relative w-40 h-40 md:w-64 md:h-64 mb-16 flex items-center justify-center">
                            <div className="absolute inset-0 border-[8px] border-dashed border-[#d4af37]/30 rounded-full animate-[spin_300s_linear_infinite]"></div>
                            <div className="w-32 h-32 md:w-52 md:h-52 bg-[#050505] rounded-full border-[10px] border-[#d4af37] shadow-[0_0_100px_rgba(212,175,55,0.4)] flex items-center justify-center overflow-hidden">
                                 <img src={DEFAULT_BRAND_LOGO} alt="Seal" crossOrigin="anonymous" className="w-[60%] h-[60%] object-contain brightness-150" />
                            </div>
                        </div>

                        <div className="text-center px-10 max-w-[90%]">
                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-cinzel font-black gold-gradient-text tracking-normal uppercase mb-6 drop-shadow-2xl leading-[1.1] text-center">
                              {title}
                            </h2>
                            {subtitle && (
                                <p className="text-[#4a0404] text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-[0.2em] font-cinzel italic mt-6 opacity-70 border-t-2 border-amber-900/10 pt-6 inline-block">
                                  {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {chartData && (
                        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 bg-black/[0.03] p-12 md:p-16 rounded-[4rem] border-4 border-amber-900/5 shadow-inner">
                            <div className="space-y-12">
                                <h5 className="text-2xl font-cinzel font-black uppercase tracking-[0.4em] text-[#4a0404] mb-8 border-b-2 border-amber-900/10 pb-4">Soul Core Alignment</h5>
                                {(chartData.vedicMetrics || []).map((m: any, i: number) => (
                                    <div key={i} className="w-full">
                                        <div className="flex justify-between text-lg uppercase font-black text-[#8b4513] mb-3 tracking-widest">
                                            <span>{m.label}</span>
                                            <span>{m.value}%</span>
                                        </div>
                                        <div className="w-full h-6 bg-[#8b4513]/10 rounded-full p-[4px] border border-[#8b4513]/20">
                                            <div className="h-full bg-gradient-to-r from-[#4a0404] via-[#8b4513] to-[#d4af37] rounded-full shadow-lg" style={{ width: `${m.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center justify-center border-t-4 lg:border-t-0 lg:border-l-4 border-amber-900/5 pt-12 lg:pt-0 lg:pl-16">
                                <div className="relative w-40 h-40 md:w-56 md:h-56 mb-10">
                                    <div className="absolute inset-0 border-8 border-dashed border-[#d4af37]/30 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-8xl md:text-9xl drop-shadow-2xl opacity-80">🕉️</div>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-[#4a0404] uppercase tracking-[0.4em] text-center">Synced: {new Date().getFullYear()}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-24 font-lora text-[#1a1a1a] w-full max-w-6xl px-4 md:px-12">
                        {renderFormattedText(displayContent.split('###')[0] || displayContent)}
                    </div>
                </section>

                {displayContent.includes('###') && (
                    <section className="relative z-30 pt-40 min-h-screen w-full max-w-6xl mx-auto px-4 md:px-12">
                        <div className="font-lora text-[#1a1a1a]">
                            {renderFormattedText(displayContent.split('###').slice(1).join('###'))}
                        </div>
                    </section>
                )}

                <section className="relative z-30 pt-40 flex flex-col items-center justify-center">
                    <div className="text-center w-full">
                        <div className="text-[10rem] md:text-[14rem] text-[#d4af37]/10 mb-12 tracking-[2em] pl-[2em] font-cinzel select-none">❂ ❂ ❂</div>
                        <h3 className="text-3xl md:text-4xl font-cinzel font-black text-[#4a0404] uppercase tracking-[0.3em] mb-12">Authorized Decree</h3>
                        <div className="bg-[#0a0a1a] p-12 md:p-16 rounded-[4rem] border-8 border-[#d4af37]/40 shadow-[0_0_80px_rgba(212,175,55,0.3)] inline-block">
                            <div className="w-24 h-24 bg-green-500 rounded-full animate-pulse shadow-[0_0_40px_#22c55e] mb-10 mx-auto"></div>
                            <p className="text-xl md:text-2xl font-mono text-[#d4af37] tracking-[0.4em] uppercase font-black">TEMPORAL_LOCKED</p>
                            <p className="text-[#d4af37]/60 text-sm mt-4 font-mono">NODE: {Math.random().toString(36).substring(2, 16).toUpperCase()}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-4xl mt-20 mb-40 no-print px-6">
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 h-24 bg-[#2d0a18] hover:bg-[#4a0404] text-white rounded-3xl shadow-2xl border-none font-cinzel tracking-[0.2em] transition-all active:scale-95 text-2xl font-black">
                  {isDownloading ? "SEALING..." : "📜 ARCHIVE DECREE"}
              </Button>
              <Button onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent("Sacred Decree: " + title)}`} className="flex-1 h-24 bg-white hover:bg-gray-100 text-[#2d0a18] rounded-3xl shadow-2xl border-2 border-[#2d0a18]/20 font-cinzel tracking-[0.2em] transition-all active:scale-95 text-2xl font-black">
                  ✉️ DISPATCH
              </Button>
        </div>

        <Link to="/home" className="mb-48 no-print group">
            <button className="text-[#d4af37] font-cinzel font-black text-2xl uppercase tracking-[1em] group-hover:text-white transition-all flex items-center gap-10">
                <span className="text-5xl group-hover:-translate-x-4 transition-transform">←</span> EXIT SANCTUARY
            </button>
        </Link>
    </div>
  );
};

export default FullReport;