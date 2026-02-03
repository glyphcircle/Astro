import React from 'react';
import Card from './shared/Card';

interface VedicReportRendererProps {
  report: any;
}

const VedicReportRenderer: React.FC<VedicReportRendererProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up pb-20">
      {/* 🌟 Header Section */}
      <div className="text-center py-10 border-b border-amber-500/20">
        <h2 className="text-5xl font-cinzel font-black gold-gradient-text uppercase tracking-tighter mb-4">Imperial Birth Decree</h2>
        <p className="text-amber-200/50 uppercase tracking-[0.4em] font-bold text-xs">Synchronized with Akasha Nodes</p>
      </div>

      {/* 📊 Basic Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ascendant', value: report.basicInfo.ascendant, icon: '🌅' },
          { label: 'Moon Sign', value: report.basicInfo.moonSign, icon: '🌙' },
          { label: 'Sun Sign', value: report.basicInfo.sunSign, icon: '☀️' },
          { label: 'Nakshatra', value: `${report.basicInfo.nakshatra} (P${report.basicInfo.nakshatraPada})`, icon: '⭐' },
        ].map((item, i) => (
          <Card key={i} className="p-4 bg-black/40 border-amber-500/20 text-center">
            <span className="text-2xl block mb-2">{item.icon}</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{item.label}</span>
            <p className="text-amber-100 font-cinzel font-bold mt-1 truncate">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* 🪐 Planetary Positions Table */}
      <Card className="bg-black/60 border-amber-500/20 overflow-hidden">
        <div className="p-6 border-b border-amber-500/10 bg-amber-500/5">
          <h3 className="font-cinzel font-black text-amber-300 uppercase tracking-widest text-lg">Graha Sthiti (Planetary Array)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-black border-b border-white/5">
              <tr>
                <th className="p-4">Graha</th>
                <th className="p-4">Rashi</th>
                <th className="p-4">Degree</th>
                <th className="p-4">House</th>
                <th className="p-4">Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {report.planetaryPositions.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-amber-500/5 transition-colors">
                  <td className="p-4 text-amber-100 font-bold">{p.planet}</td>
                  <td className="p-4 text-gray-400">{p.sign}</td>
                  <td className="p-4 font-mono text-xs">{p.degree}</td>
                  <td className="p-4 text-amber-500/80">{p.house}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      p.strength.toLowerCase().includes('excellent') ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
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
      <div className="space-y-6">
        <h3 className="text-3xl font-cinzel font-black text-amber-300 uppercase tracking-widest text-center">Bhava Phala (House Analysis)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.houseAnalysis.map((h: any, i: number) => (
            <Card key={i} className="p-8 bg-gray-900/40 border-l-4 border-amber-500/40 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-4xl opacity-10 font-cinzel font-black">{h.house}</span>
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">{h.significance}</span>
              </div>
              <p className="text-amber-100 font-lora italic leading-relaxed">{h.interpretation}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 🌀 Yogas */}
      <div className="space-y-6">
        <h3 className="text-3xl font-cinzel font-black text-amber-300 uppercase tracking-widest text-center">Divine Combinations (Yogas)</h3>
        <div className="grid grid-cols-1 gap-4">
          {report.yogasPresent.map((y: any, i: number) => (
            <Card key={i} className="p-6 bg-gradient-to-r from-amber-900/10 to-transparent border-amber-500/20 group hover:border-amber-500/40 transition-all">
              <h4 className="text-xl font-cinzel font-black text-amber-200 group-hover:text-amber-400 transition-colors uppercase">{y.yogaName}</h4>
              <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">{y.description}</p>
              <p className="text-amber-100/90 mt-4 leading-relaxed italic border-t border-white/5 pt-4">"{y.effects}"</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 🧘 Life Areas */}
      <div className="space-y-6">
        <h3 className="text-3xl font-cinzel font-black text-amber-300 uppercase tracking-widest text-center">Spheres of Influence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {Object.entries(report.lifeAreas).map(([key, data]: [string, any], i: number) => (
             <Card key={i} className="p-10 bg-black/60 border-amber-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
                <h4 className="text-2xl font-cinzel font-black text-amber-300 uppercase mb-4 border-b border-amber-500/20 pb-2">{key}</h4>
                <p className="text-amber-100 font-lora leading-relaxed italic">{data.detailed || data.summary}</p>
                {data.advice && (
                  <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest block mb-2">The Sage Advises:</span>
                    <p className="text-xs text-amber-100/80">{data.advice}</p>
                  </div>
                )}
             </Card>
           ))}
        </div>
      </div>

      {/* 🕉️ Remedies & Summary */}
      <Card className="p-12 bg-gradient-to-b from-[#0F0F23] to-black border-amber-500/30 text-center relative sacred-boundary">
        <div className="mb-12">
          <h3 className="text-4xl font-cinzel font-black gold-gradient-text uppercase mb-6">Sacred Remedies (Upayas)</h3>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <h5 className="text-amber-400 font-black uppercase text-xs tracking-widest">Ritual Mantras</h5>
              {report.remedies.mantras.map((m: any, i: number) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-lg font-cinzel text-amber-100">{m.mantra}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{m.purpose}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h5 className="text-amber-400 font-black uppercase text-xs tracking-widest">Gemstone Alignment</h5>
              {report.remedies.gemstones.map((g: any, i: number) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-lg font-cinzel text-amber-100">{g.stone}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{g.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-amber-500/20">
          <h3 className="text-2xl font-cinzel font-black text-amber-300 uppercase mb-4">Master's Final Decree</h3>
          <p className="text-xl text-amber-100/90 italic font-lora leading-relaxed max-w-3xl mx-auto">
            {report.summary.lifeAdvice}
          </p>
          <div className="mt-12 inline-block px-10 py-4 bg-amber-600 text-black font-black uppercase tracking-[0.4em] rounded-full shadow-2xl">
            Locked & Sealed
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VedicReportRenderer;