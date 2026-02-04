
import React from 'react';

interface BirthChartSVGProps {
  houses: any[];
  planets: any[];
  lagnaSign: number;
}

const BirthChartSVG: React.FC<BirthChartSVGProps> = ({ houses, planets, lagnaSign }) => {
  const planetSymbols: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋'
  };

  const getPlanetsInHouse = (houseNum: number) => {
    return planets.filter(p => p.house === houseNum).map(p => planetSymbols[p.name] || p.name[0]);
  };

  const getSignForHouse = (houseNum: number) => {
    let sign = (lagnaSign + houseNum - 1);
    if (sign > 12) sign -= 12;
    return sign;
  };

  // Dimensions
  const size = 400;
  const half = size / 2;

  // House Label Positions (North Indian Style)
  const houseLabels = [
    { h: 1, x: half, y: half / 2 },
    { h: 2, x: half / 2, y: half / 4 },
    { h: 3, x: half / 4, y: half / 2 },
    { h: 4, x: half, y: half }, // This is 4? Wait North Indian is 1 at top middle diamond
  ];

  // North Indian Diamond Layout points
  // 1: (half, 0) (size, half) (half, half) (0, half) -> No, standard is:
  // House 1: (0,0) (half, half) (size, 0) ? No.
  
  // Real North Indian Structure:
  // A big square. 
  // Two diagonals (0,0 to size,size) and (size,0 to 0,size)
  // A diamond inside (half,0), (size,half), (half,size), (0,half)

  return (
    <div className="flex justify-center p-4 bg-white/5 rounded-3xl border border-amber-500/20 shadow-inner">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto drop-shadow-2xl">
        {/* Background */}
        <rect width={size} height={size} fill="#fffcf0" stroke="#d4af37" strokeWidth="4" />
        
        {/* Diagonals */}
        <line x1="0" y1="0" x2={size} y2={size} stroke="#d4af37" strokeWidth="2" />
        <line x1={size} y1="0" x2="0" y2={size} stroke="#d4af37" strokeWidth="2" />
        
        {/* Diamond */}
        <path d={`M ${half} 0 L ${size} ${half} L ${half} ${size} L 0 ${half} Z`} fill="none" stroke="#d4af37" strokeWidth="2" />

        {/* House Sign Numbers & Planets */}
        {[
          { id: 1, x: half, y: half / 2.5 },
          { id: 2, x: half / 2, y: half / 4 },
          { id: 3, x: half / 4, y: half / 2 },
          { id: 4, x: half / 2.5, y: half },
          { id: 5, x: half / 4, y: size - half / 2 },
          { id: 6, x: half / 2, y: size - half / 4 },
          { id: 7, x: half, y: size - half / 2.5 },
          { id: 8, x: size - half / 2, y: size - half / 4 },
          { id: 9, x: size - half / 4, y: size - half / 2 },
          { id: 10, x: size - half / 2.5, y: half },
          { id: 11, x: size - half / 4, y: half / 2 },
          { id: 12, x: size - half / 2, y: half / 4 },
        ].map((pos) => {
            const sign = getSignForHouse(pos.id);
            const ps = getPlanetsInHouse(pos.id);
            return (
                <g key={pos.id}>
                    {/* Sign Number */}
                    <text x={pos.x} y={pos.y} textAnchor="middle" fontSize="14" fontWeight="900" fill="#8b4513" dy="-10">
                        {sign}
                    </text>
                    {/* Planets */}
                    <text x={pos.x} y={pos.y} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2d0a18" dy="10">
                        {ps.join(' ')}
                    </text>
                </g>
            );
        })}
      </svg>
    </div>
  );
};

export default BirthChartSVG;
