import React, { useRef, useState, useEffect, useMemo } from 'react';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SageChat from './SageChat';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { dbService, ReportTemplate } from '../services/db';
import { cloudManager } from '../services/cloudManager';

interface FullReportProps {
  reading: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  chartData?: any;
  category?: string;
}

const DEFAULT_BRAND_LOGO = 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO';

const FullReport: React.FC<FullReportProps> = ({ reading, title, subtitle, chartData, category = 'general' }) => {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const hiddenRenderRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [pages, setPages] = useState<string[][]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

  // --- FETCH DYNAMIC TEMPLATE ---
  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoadingTemplate(true);
      const res = await dbService.getRandomTemplate(category);
      setTemplate(res);
      setIsLoadingTemplate(false);
    };
    fetchTemplate();
  }, [category]);

  // --- CONTENT FORMATTING ---
  const segments = useMemo(() => {
    if (!reading) return [];
    let normalizedText = reading.replace(/\\n/g, '\n');
    return normalizedText.split(/\n+/).filter(s => s.trim().length > 0);
  }, [reading]);

  // --- PAGINATION LOGIC ---
  // Since real-time pagination in a dynamic viewport is complex, 
  // we render one long container and rely on browser print/PDF breaks,
  // or manually split into pages for a more "Imperial" multi-page experience.
  // For simplicity and visual fidelity, we'll implement a "Section-based" pagination 
  // where sections try to stay together on pages.
  useEffect(() => {
    if (!segments.length) return;
    
    // Group segments into logical chunks
    const chunks: string[][] = [[]];
    let currentChunk = 0;
    let charCount = 0;
    const MAX_CHARS_PER_PAGE = 2200; // Heuristic for A4 with margins

    segments.forEach(seg => {
      if (charCount + seg.length > MAX_CHARS_PER_PAGE && chunks[currentChunk].length > 0) {
        currentChunk++;
        chunks[currentChunk] = [];
        charCount = 0;
      }
      chunks[currentChunk].push(seg);
      charCount += seg.length;
    });

    setPages(chunks);
  }, [segments]);

  const renderSegment = (line: string, index: number, isFirstOnPage: boolean) => {
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
        return <strong key={j} className="font-black" style={{ color: template?.content_area_config.textColor || '#3a0000' }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    if (isHeader) {
      return (
        <div key={index} className="w-full mt-12 mb-6">
          <h4 className="text-2xl md:text-4xl font-cinzel font-black text-center uppercase tracking-tight" style={{ color: template?.content_area_config.textColor || '#4a0404' }}>
            {parsedContent}
          </h4>
          <div className="mx-auto w-24 h-0.5 bg-amber-500/20 mt-2"></div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`relative flex items-start mb-4 p-4 rounded-xl transition-all ${isPositive ? 'bg-green-600/5' : isNegative ? 'bg-red-600/5' : ''}`}
      >
        <div className="leading-relaxed text-lg" style={{ color: template?.content_area_config.textColor || '#1a1a1a' }}>
          {parsedContent}
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const pageContainers = reportRef.current?.querySelectorAll('.report-page');
      if (!pageContainers) return;

      for (let i = 0; i < pageContainers.length; i++) {
        if (i > 0) pdf.addPage();
        
        const canvas = await html2canvas(pageContainers[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#fffcf0'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }
      
      pdf.save(`Decree_${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const contentStyles = template ? {
    marginTop: `${template.content_area_config.marginTop}px`,
    marginBottom: `${template.content_area_config.marginBottom}px`,
    marginLeft: `${template.content_area_config.marginLeft}px`,
    marginRight: `${template.content_area_config.marginRight}px`,
    color: template.content_area_config.textColor,
    fontFamily: template.content_area_config.fontFamily || 'Lora, serif',
    backgroundColor: template.content_area_config.backgroundColor || 'transparent'
  } : {
    padding: '4rem'
  };

  const bgUrl = template ? cloudManager.resolveImage(template.template_image_url) : "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E";

  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full flex flex-col items-center min-h-screen pb-40">
      <SageChat context={reading} type={title} />

      <div className="fixed bottom-24 right-8 z-[100] no-print flex flex-col gap-3 bg-black/80 backdrop-blur-xl border border-amber-500/30 p-2 rounded-2xl shadow-2xl">
        <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-amber-500 font-bold text-2xl transition-all">+</button>
        <div className="text-[10px] font-mono text-center text-amber-200 uppercase font-black">{(zoom * 100).toFixed(0)}%</div>
        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-amber-500 font-bold text-2xl transition-all">−</button>
      </div>

      <div 
        ref={reportRef}
        className="flex flex-col items-center gap-8 origin-top transition-transform duration-500"
        style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 100}%` }}
      >
        {/* FIRST PAGE (Title Page) */}
        <div 
          className="report-page relative bg-[#fffcf0] shadow-2xl w-[210mm] min-h-[297mm] overflow-hidden"
          style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover' }}
        >
          <div style={contentStyles} className="relative z-10 flex flex-col items-center">
            {/* Logo/Seal */}
            <div className="w-32 h-32 mb-8 bg-black rounded-full border-4 border-amber-500 flex items-center justify-center shadow-xl overflow-hidden mt-12">
               <img src={DEFAULT_BRAND_LOGO} alt="Seal" className="w-[60%] h-[60%] object-contain" />
            </div>

            <div className="text-center px-10">
              <h2 className="text-5xl font-cinzel font-black uppercase tracking-tight leading-tight" style={{ color: template?.content_area_config.textColor || '#2d0a18' }}>
                {title}
              </h2>
              {subtitle && (
                <p className="text-xl font-bold uppercase tracking-widest mt-4 opacity-70">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Metrics if present */}
            {chartData && (
              <div className="w-full max-w-lg grid grid-cols-1 gap-6 mt-12 bg-black/5 p-8 rounded-3xl">
                  {(chartData.vedicMetrics || []).map((m: any, i: number) => (
                      <div key={i} className="w-full">
                          <div className="flex justify-between text-xs font-black mb-1 uppercase tracking-widest">
                              <span>{m.label}</span>
                              <span>{m.value}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-600" style={{ width: `${m.value}%` }}></div>
                          </div>
                      </div>
                  ))}
              </div>
            )}

            {/* Content Start */}
            <div className="mt-12 text-left w-full">
              {pages[0]?.map((line, i) => renderSegment(line, i, i === 0))}
            </div>
          </div>
        </div>

        {/* SUBSEQUENT PAGES */}
        {pages.slice(1).map((pageSegments, pageIdx) => (
          <div 
            key={pageIdx}
            className="report-page relative bg-[#fffcf0] shadow-2xl w-[210mm] min-h-[297mm] overflow-hidden"
            style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover' }}
          >
            <div style={contentStyles} className="relative z-10">
              {pageSegments.map((line, i) => renderSegment(line, i, i === 0))}
            </div>
            
            {/* Page Numbering */}
            <div className="absolute bottom-10 left-0 w-full text-center text-[10px] font-bold opacity-30 tracking-widest uppercase">
               Decree Manifestation • Page {pageIdx + 2}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-4xl mt-10 no-print px-6">
        <Button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 h-16 bg-[#2d0a18] hover:bg-[#4a0404] text-white rounded-2xl shadow-xl font-cinzel tracking-widest text-lg">
          {isDownloading ? "ENGRAVING..." : "📜 ARCHIVE DECREE (PDF)"}
        </Button>
        <Link to="/home" className="flex-1 h-16">
          <button className="w-full h-full bg-white text-[#2d0a18] border-2 border-[#2d0a18] font-cinzel font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all shadow-xl">
              RETURN HOME
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FullReport;