import React, { useRef, useState } from 'react';
import Card from './shared/Card';
import Button from './shared/Button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SmartBackButton from './shared/SmartBackButton';

interface VedicReportRendererProps {
  report: any;
}

const VedicReportRenderer: React.FC<VedicReportRendererProps> = ({ report }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!report) return null;

  const handleDownloadPDF = async () => {
    const content = reportRef.current;
    if (!content) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fffcf0'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Vedic_Birth_Decree_${report.birthDetails?.name || 'User'}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const safeRender = (val: any) => {
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (val && typeof val === 'object' && val.text) return val.text;
    return '';
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={reportRef}
        className="max-w-5xl mx-auto space-y-12 animate-fade-in-up pb-20 p-8 md:p-16 bg-[#fffcf0] report-canvas rounded-sm shadow-2xl relative border-8 border-double border-[#d4af37]/40"
      >
        <div className="absolute top-4 left-4 text-[#d4af37] text-2xl opacity-40">❂</div>
        <div className="absolute top-4 right-4 text-[#d4af37] text-2xl opacity-40">❂</div>
        <div className="absolute bottom-4 left-4 text-[#d4af37] text-2xl opacity-40">❂</div>
        <div className="absolute bottom-4 right-4 text-[#d4af37] text-2xl opacity-40">❂</div>

        <div className="text-center py-10 border-b border-[#d4af37]/20">
          <div className="mb-6 inline-block p-4 bg-black rounded-full border-4 border-[#d4af37] shadow-xl">
             <span className="text-5xl">🕉️</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-cinzel font-black gold-gradient-text uppercase tracking-tighter mb-4">Imperial Birth Decree</h2>
          <p className="text-[#8b4513] uppercase tracking-[0.4em] font-bold text-xs font-cinzel">Authorized by the Sovereign Registry</p>
          <div className="mt-4 text-[#4a0404] font-lora italic text-lg">
            Calculated for: <span className="font-black not-italic text-2xl">{safeRender(report.birthDetails?.name)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ascendant', value: report.basicInfo?.ascendant, icon: '🌅' },
            { label: 'Moon Sign', value: report.basicInfo?.moonSign, icon: '🌙' },
            { label: 'Sun Sign', value: report.basicInfo?.sunSign, icon: '☀️' },
            { label: 'Nakshatra', value: `${report.basicInfo?.nakshatra} (P${report.basicInfo?.nakshatraPada})`, icon: '⭐' },
          ].map((item, i) => (
            <Card key={i} className="p-6 bg-white/60 border-[#d4af37]/20 text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-3xl block mb-2">{item.icon}</span>
              <span className="text-[10px] text-[#8b4513] uppercase font-black tracking-widest">{item.label}</span>
              <p className="text-[#4a0404] font-cinzel font-bold mt-1 truncate text-lg">{safeRender(item.value)}</p>
            </Card>
          ))}
        </div>

        <Card className="bg-white/80 border-[#d4af37]/30 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#d4af37]/10 bg-[#d4af37]/10"><h3 className="font-cinzel font-black text-[#4a0404] uppercase tracking-widest text-xl text-center">Graha Sthiti (Planetary Array)</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#4a0404]/5 text-[10px] text-[#8b4513] uppercase tracking-widest font-black border-b border-[#d4af37]/10"><tr><th className="p-4">Graha</th><th className="p-4">Rashi</th><th className="p-4">Degree</th><th className="p-4">House</th><th className="p-4">Strength</th></tr></thead>
              <tbody className="divide-y divide-[#d4af37]/10 text-[#1a1a1a]">
                {report.planetaryPositions?.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-[#d4af37]/5 transition-colors">
                    <td className="p-4 text-[#4a0404] font-black">{safeRender(p.planet)} {p.isRetrograde ? '℞' : ''}</td>
                    <td className="p-4 font-medium">{safeRender(p.sign)}</td>
                    <td className="p-4 font-mono text-xs">{safeRender(p.degree)}</td>
                    <td className="p-4 font-black">{safeRender(p.house)}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.strength?.toLowerCase().includes('excellent') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{safeRender(p.strength)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-8">
          <h3 className="text-4xl font-cinzel font-black text-[#4a0404] uppercase tracking-widest text-center">Bhava Phala (House Analysis)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {report.houseAnalysis?.map((h: any, i: number) => (
              <Card key={i} className="p-10 bg-white/40 border-l-[6px] border-[#d4af37] flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start"><span className="text-6xl opacity-10 font-cinzel font-black text-[#4a0404]">{h.house}</span><span className="text-xs text-[#8b4513] font-black uppercase tracking-[0.2em] bg-[#d4af37]/10 px-3 py-1 rounded-full">{safeRender(h.significance)}</span></div>
                <div className="text-[#8b4513] text-[10px] font-black uppercase tracking-widest mb-1">Sign: {safeRender(h.sign)} • Lord: {safeRender(h.lord)}</div>
                <p className="text-[#1a1a1a] font-lora italic leading-relaxed text-lg">"{safeRender(h.interpretation)}"</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-16 bg-gradient-to-b from-[#4a0404] to-[#2d0a18] border-[#d4af37]/40 text-center relative shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="relative z-10">
            <h3 className="text-5xl font-cinzel font-black text-white uppercase mb-6 tracking-widest">Master's Final Decree</h3>
            <p className="text-2xl text-amber-100/90 italic font-lora leading-relaxed max-w-4xl mx-auto drop-shadow-sm">
              "{safeRender(report.summary?.lifeAdvice || report.summary?.overallAssessment)}"
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mt-16 pb-40 no-print">
        <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading} 
            className="h-20 px-12 bg-[#2d0a18] hover:bg-[#4a0404] text-white border-none shadow-2xl font-cinzel tracking-widest text-xl transition-all active:scale-95"
        >
          {isDownloading ? "ENGRAVING PDF..." : "📜 ARCHIVE DECREE (PDF)"}
        </Button>
        <SmartBackButton label="Back to Home" fallbackRoute="/home" className="h-20 px-12 bg-white text-[#2d0a18] border-2 border-[#2d0a18] font-cinzel font-black uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-all shadow-xl text-xl" />
      </div>
    </div>
  );
};

export default VedicReportRenderer;