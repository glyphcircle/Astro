import React, { useRef, useState } from 'react';
import Card from './shared/Card';
import Button from './shared/Button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
// Added missing Link import from react-router-dom to resolve the reported errors
import { Link } from 'react-router-dom';

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
      // 📐 Scale for high resolution
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* 📜 REPORT PREVIEW CONTAINER */}
      <div 
        ref={reportRef}
        className="max-w-5xl mx-auto space-y-12 animate-fade-in-up pb-20 p-8 md:p-16 bg-[#fffcf0] report-canvas rounded-sm shadow-2xl relative border-8 border-double border-[#d4af37]/40"
      >
        {/* 🔱 Sacred Boundary Symbols */}
        <div className="absolute top-4 left-4 text-[#d4af37] text-2xl opacity-40">❂</div>
        <div className="absolute top-4 right-4 text-[#d4af37] text-2xl opacity-40">❂</div>
        <div className="absolute bottom-4 left-4 text-[#d4af37] text-2xl opacity-40">❂</div>
        <div className="absolute bottom-4 right-4 text-[#d4af37] text-2xl opacity-40">❂</div>

        {/* 🌟 Header Section */}
        <div className="text-center py-10 border-b border-[#d4af37]/20">
          <div className="mb-6 inline-block p-4 bg-black rounded-full border-4 border-[#d4af37] shadow-xl">
             <span className="text-5xl">🕉️</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-cinzel font-black gold-gradient-text uppercase tracking-tighter mb-4">Imperial Birth Decree</h2>
          <p className="text-[#8b4513] uppercase tracking-[0.4em] font-bold text-xs font-cinzel">Authorized by the Sovereign Registry</p>
          <div className="mt-4 text-[#4a0404] font-lora italic text-lg">
            Calculated for: <span className="font-black not-italic text-2xl">{report.birthDetails?.name}</span>
          </div>
        </div>

        {/* 📊 Basic Info Grid */}
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
              <p className="text-[#4a0404] font-cinzel font-bold mt-1 truncate text-lg">{item.value}</p>
            </Card>
          ))}
        </div>

        {/* 🪐 Planetary Positions Table */}
        <Card className="bg-white/80 border-[#d4af37]/30 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#d4af37]/10 bg-[#d4af37]/10">
            <h3 className="font-cinzel font-black text-[#4a0404] uppercase tracking-widest text-xl text-center">Graha Sthiti (Planetary Array)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#4a0404]/5 text-[10px] text-[#8b4513] uppercase tracking-widest font-black border-b border-[#d4af37]/10">
                <tr>
                  <th className="p-4">Graha</th>
                  <th className="p-4">Rashi</th>
                  <th className="p-4">Degree</th>
                  <th className="p-4">House</th>
                  <th className="p-4">Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/10 text-[#1a1a1a]">
                {report.planetaryPositions?.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-[#d4af37]/5 transition-colors">
                    <td className="p-4 text-[#4a0404] font-black">{p.planet} {p.isRetrograde ? '℞' : ''}</td>
                    <td className="p-4 font-medium">{p.sign}</td>
                    <td className="p-4 font-mono text-xs">{p.degree}</td>
                    <td className="p-4 font-black">{p.house}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        p.strength?.toLowerCase().includes('excellent') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.strength}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 🏠 House Analysis */}
        <div className="space-y-8">
          <h3 className="text-4xl font-cinzel font-black text-[#4a0404] uppercase tracking-widest text-center">Bhava Phala (House Analysis)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {report.houseAnalysis?.map((h: any, i: number) => (
              <Card key={i} className="p-10 bg-white/40 border-l-[6px] border-[#d4af37] flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-6xl opacity-10 font-cinzel font-black text-[#4a0404]">{h.house}</span>
                  <span className="text-xs text-[#8b4513] font-black uppercase tracking-[0.2em] bg-[#d4af37]/10 px-3 py-1 rounded-full">{h.significance}</span>
                </div>
                <div className="text-[#8b4513] text-[10px] font-black uppercase tracking-widest mb-1">Sign: {h.sign} • Lord: {h.lord}</div>
                <p className="text-[#1a1a1a] font-lora italic leading-relaxed text-lg">"{h.interpretation}"</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 🌀 Yogas */}
        <div className="space-y-8">
          <h3 className="text-4xl font-cinzel font-black text-[#4a0404] uppercase tracking-widest text-center">Divine Yogas (Combinations)</h3>
          <div className="grid grid-cols-1 gap-6">
            {report.yogasPresent?.map((y: any, i: number) => (
              <Card key={i} className="p-8 bg-gradient-to-r from-[#d4af37]/10 to-transparent border-[#d4af37]/30 group hover:border-[#d4af37] transition-all">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="text-2xl font-cinzel font-black text-[#4a0404] group-hover:text-amber-800 transition-colors uppercase tracking-tight">{y.yogaName}</h4>
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">{y.type}</span>
                </div>
                <p className="text-xs text-[#8b4513] mt-1 uppercase tracking-widest font-black opacity-60">{y.description}</p>
                <div className="mt-6 p-6 bg-white/30 rounded-2xl border border-white/50 shadow-inner">
                    <p className="text-[#1a1a1a] leading-relaxed italic text-lg">"{y.effects}"</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 🧘 Life Areas */}
        <div className="space-y-8">
          <h3 className="text-4xl font-cinzel font-black text-[#4a0404] uppercase tracking-widest text-center">Spheres of Influence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {report.lifeAreas && Object.entries(report.lifeAreas).map(([key, data]: [string, any], i: number) => (
               <Card key={i} className="p-10 bg-white/60 border-[#d4af37]/20 relative overflow-hidden group shadow-md hover:shadow-2xl transition-all">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/20 transition-all"></div>
                  <h4 className="text-2xl font-cinzel font-black text-[#4a0404] uppercase mb-6 border-b-2 border-[#d4af37]/10 pb-3 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                  <p className="text-[#1a1a1a] font-lora leading-relaxed italic text-lg">{data.detailed || data.summary}</p>
                  {data.advice && (
                    <div className="mt-8 p-6 bg-[#4a0404]/5 border border-[#4a0404]/10 rounded-2xl">
                      <span className="text-[10px] uppercase font-black text-[#4a0404] tracking-[0.3em] block mb-3">The Sage Advises:</span>
                      <p className="text-sm text-[#4a0404]/80 font-medium italic">"{data.advice}"</p>
                    </div>
                  )}
               </Card>
             ))}
          </div>
        </div>

        {/* 🕉️ Remedies & Summary */}
        <Card className="p-16 bg-gradient-to-b from-[#4a0404] to-[#2d0a18] border-[#d4af37]/40 text-center relative shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="relative z-10">
            <div className="mb-16">
              <h3 className="text-5xl font-cinzel font-black gold-gradient-text uppercase mb-10 drop-shadow-lg">Sacred Remedies (Upayas)</h3>
              <div className="grid md:grid-cols-2 gap-12 text-left">
                <div className="space-y-6">
                  <h5 className="text-[#d4af37] font-black uppercase text-xs tracking-[0.4em] border-b border-[#d4af37]/20 pb-2">Ritual Mantras</h5>
                  {report.remedies?.mantras?.map((m: any, i: number) => (
                    <div key={i} className="p-6 bg-black/40 rounded-2xl border border-[#d4af37]/20 shadow-xl">
                      <p className="text-2xl font-cinzel text-white leading-relaxed">{m.mantra}</p>
                      <p className="text-[10px] text-[#d4af37] mt-3 uppercase font-black tracking-widest">Purpose: {m.purpose} • Count: {m.count}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <h5 className="text-[#d4af37] font-black uppercase text-xs tracking-[0.4em] border-b border-[#d4af37]/20 pb-2">Gemstone Alignment</h5>
                  {report.remedies?.gemstones?.map((g: any, i: number) => (
                    <div key={i} className="p-6 bg-black/40 rounded-2xl border border-[#d4af37]/20 shadow-xl">
                      <p className="text-2xl font-cinzel text-white leading-relaxed">{g.stone}</p>
                      <p className="text-[10px] text-[#d4af37] mt-3 uppercase font-black tracking-widest">Planet: {g.planet} • Wearing: {g.wearingInstructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-16 border-t border-[#d4af37]/20">
              <div className="text-[8rem] leading-none opacity-10 font-cinzel text-[#d4af37] absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none">❂</div>
              <h3 className="text-3xl font-cinzel font-black text-white uppercase mb-6 tracking-widest">Master's Final Decree</h3>
              <p className="text-2xl text-amber-100/90 italic font-lora leading-relaxed max-w-4xl mx-auto drop-shadow-sm">
                "{report.summary?.lifeAdvice || report.summary?.overallAssessment}"
              </p>
              <div className="mt-16 inline-block px-12 py-5 bg-[#d4af37] text-[#2d0a18] font-black uppercase tracking-[0.5em] rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] transform hover:scale-105 transition-all text-xs">
                Sealed & Validated
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 🔘 Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 mt-16 pb-40 no-print">
        <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading} 
            className="h-20 px-12 bg-[#2d0a18] hover:bg-[#4a0404] text-white border-none shadow-2xl font-cinzel tracking-widest text-xl transition-all active:scale-95"
        >
          {isDownloading ? "ENGRAVING PDF..." : "📜 ARCHIVE DECREE (PDF)"}
        </Button>
        <Link to="/home">
            <button className="h-20 px-12 bg-white text-[#2d0a18] border-2 border-[#2d0a18] font-cinzel font-black uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-all shadow-xl text-xl">
                Return to Home
            </button>
        </Link>
      </div>
    </div>
  );
};

export default VedicReportRenderer;