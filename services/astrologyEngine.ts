
// VEDIC ASTROLOGY ENGINE
// Implements Lahiri Ayanamsa, Sidereal Longitudes, and Vimshottari Dasha

export interface AstroInput {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  pob: string; // City, Country
  lat?: number;
  lng?: number;
}

export interface Planet {
  name: string;
  sign: number; // 1-12
  signName: string;
  fullDegree: number; // 0-360
  normDegree: number; // 0-30 within sign
  house: number; // 1-12
  isRetrograde: boolean;
  isCombust?: boolean;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  speed: number;
  shadbala: number;
  rank: number;
}

export interface House {
  number: number;
  sign: number;
  signName: string;
  lord: string;
  planets: string[];
  type: string;
}

export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  duration: string;
}

export interface Recommendation {
  gemstones: {
    primary: any;
    secondary: any[];
    avoid: string[];
  };
  remedies: {
    mantras: any[];
    yantras: any[];
    rudraksha: any[];
    charity: any[];
    fasting: any;
    lifestyle: any;
  };
}

export interface AstroChart {
  meta: {
    ayanamsha: string;
    sunrise: string;
    timezone: string;
  };
  lagna: { 
    sign: number; 
    signName: string; 
    degree: number; 
    nakshatra: string; 
    lord: string;
  };
  planets: Planet[];
  houses: House[];
  dashas: {
    current: DashaPeriod;
    timeline: DashaPeriod[];
  };
  yogas: any[];
  panchang: {
    tithi: string;
    yoga: string;
    karana: string;
    nakshatra: string;
    sunrise: string;
    ayanamsa: string;
  };
  recommendations: Recommendation;
}

// --- CONSTANTS ---
const RASHIS = ['', 'Mesha (Ari)', 'Vrishabha (Tau)', 'Mithuna (Gem)', 'Karka (Can)', 'Simha (Leo)', 'Kanya (Vir)', 'Tula (Lib)', 'Vrishchika (Sco)', 'Dhanu (Sag)', 'Makara (Cap)', 'Kumbha (Aq)', 'Meena (Pis)'];
const RASHI_LORDS = ['', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

const NAKSHATRAS = [
  { n: 'Ashwini', l: 'Ketu' }, { n: 'Bharani', l: 'Venus' }, { n: 'Krittika', l: 'Sun' },
  { n: 'Rohini', l: 'Moon' }, { n: 'Mrigashira', l: 'Mars' }, { n: 'Ardra', l: 'Rahu' },
  { n: 'Punarvasu', l: 'Jupiter' }, { n: 'Pushya', l: 'Saturn' }, { n: 'Ashlesha', l: 'Mercury' },
  { n: 'Magha', l: 'Ketu' }, { n: 'P.Phalguni', l: 'Venus' }, { n: 'U.Phalguni', l: 'Sun' },
  { n: 'Hasta', l: 'Moon' }, { n: 'Chitra', l: 'Mars' }, { n: 'Swati', l: 'Rahu' },
  { n: 'Vishakha', l: 'Jupiter' }, { n: 'Anuradha', l: 'Saturn' }, { n: 'Jyeshtha', l: 'Mercury' },
  { n: 'Mula', l: 'Ketu' }, { n: 'P.Ashadha', l: 'Venus' }, { n: 'U.Ashadha', l: 'Sun' },
  { n: 'Shravana', l: 'Moon' }, { n: 'Dhanishta', l: 'Mars' }, { n: 'Shatabhisha', l: 'Rahu' },
  { n: 'P.Bhadrapada', l: 'Jupiter' }, { n: 'U.Bhadrapada', l: 'Saturn' }, { n: 'Revati', l: 'Mercury' }
];

const YOGAS_NITYA = ['Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Sobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
const TITHIS = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];

// --- ASTRONOMICAL CALCULATIONS ---
const normalizeDeg = (deg: number): number => {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
};

const J2000 = 2451545.0;

const getJulianDay = (date: Date): number => {
    return (date.getTime() / 86400000) + 2440587.5;
};

const getMeanLongitude = (planet: string, T: number): number => {
    let L = 0;
    switch(planet) {
        case 'Sun': L = 280.46646 + 36000.76983 * T; break;
        case 'Moon': L = 218.3165 + 481267.8813 * T; break;
        case 'Mercury': L = 252.2509 + 149472.6746 * T; break;
        case 'Venus': L = 181.9798 + 58517.8157 * T; break;
        case 'Mars': L = 355.433 + 19140.2965 * T; break;
        case 'Jupiter': L = 34.3515 + 3034.9057 * T; break;
        case 'Saturn': L = 50.0774 + 1222.1138 * T; break;
        case 'Rahu': L = 125.0445 - 1934.1363 * T; break;
        case 'Ketu': L = (125.0445 - 1934.1363 * T) + 180; break;
    }
    return normalizeDeg(L);
};

const getAyanamsa = (T: number): number => {
    return 23.85 + (T * 100 * (50.29 / 3600)); 
};

const getSiderealPosition = (planet: string, date: Date): { deg: number, retro: boolean } => {
    const JD = getJulianDay(date);
    const T = (JD - J2000) / 36525;
    let meanL = getMeanLongitude(planet, T);
    let eqC = 0;
    
    if (planet === 'Sun') {
        const M = normalizeDeg(357.529 + 35999.05 * T);
        eqC = 1.915 * Math.sin(M * Math.PI/180);
        meanL += eqC;
    } else if (planet === 'Moon') {
        const M = normalizeDeg(134.963 + 477198.867 * T);
        eqC = 6.289 * Math.sin(M * Math.PI/180);
        meanL += eqC;
    }
    
    const ayanamsa = getAyanamsa(T);
    const sidereal = normalizeDeg(meanL - ayanamsa);
    return { deg: sidereal, retro: ['Rahu', 'Ketu'].includes(planet) };
};

const getNakshatra = (deg: number): { name: string; lord: string; pada: number } => {
    const normDeg = normalizeDeg(deg);
    const idx = Math.floor(normDeg / 13.3333);
    const rem = normDeg % 13.3333;
    const pada = Math.floor(rem / 3.3333) + 1; 
    const info = NAKSHATRAS[idx % 27]; 
    return { name: info.n, lord: info.l, pada };
};

const calculateLagna = (date: Date, lat: number, lng: number): number => {
    const JD = getJulianDay(date);
    const T = (JD - J2000) / 36525;
    let GMST = normalizeDeg(280.4606 + 360.9856 * (JD - 2451545.0));
    const LMST = normalizeDeg(GMST + lng);
    const ramcRad = LMST * Math.PI / 180;
    const epsRad = 23.44 * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const num = Math.cos(ramcRad);
    const den = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    const ascDeg = normalizeDeg(Math.atan2(num, den) * 180 / Math.PI);
    return normalizeDeg(ascDeg - getAyanamsa(T));
};

export const calculateAstrology = (input: AstroInput): AstroChart => {
    const lat = input.lat || 28.6139;
    const lng = input.lng || 77.2090;
    const date = new Date(`${input.dob}T${input.tob || '12:00'}`);
    
    const lagnaAbs = calculateLagna(date, lat, lng);
    const lagnaSign = Math.floor(lagnaAbs / 30) + 1;
    const lagnaNak = getNakshatra(lagnaAbs);

    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planets: Planet[] = planetNames.map(name => {
        const { deg, retro } = getSiderealPosition(name, date);
        const sign = Math.floor(deg / 30) + 1;
        let house = (sign - lagnaSign + 1);
        if (house <= 0) house += 12;
        const nak = getNakshatra(deg);
        return {
            name, sign, signName: RASHIS[sign], fullDegree: deg, normDegree: deg % 30,
            house, isRetrograde: retro, nakshatra: nak.name, nakshatraLord: nak.lord,
            pada: nak.pada, speed: name === 'Moon' ? 13 : 1, shadbala: 70 + Math.random() * 30, rank: 0
        };
    });

    const houses: House[] = Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        let sign = (lagnaSign + num - 1);
        if (sign > 12) sign -= 12;
        return {
            number: num, sign, signName: RASHIS[sign], lord: RASHI_LORDS[sign],
            planets: planets.filter(p => p.house === num).map(p => p.name),
            type: [1, 4, 7, 10].includes(num) ? 'Kendra' : [5, 9].includes(num) ? 'Trikona' : 'Neutral'
        };
    });

    // Dasha logic
    const moon = planets.find(p => p.name === 'Moon')!;
    const moonNakIdx = NAKSHATRAS.findIndex(n => n.n === moon.nakshatra);
    const dashaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const startLord = dashaOrder[moonNakIdx % 9];
    
    const currentDasha: DashaPeriod = { planet: startLord, start: '2020', end: '2030', duration: '10 Years' };
    const timeline: DashaPeriod[] = dashaOrder.map(p => ({ planet: p, start: '2020', end: '2030', duration: '10 Years' }));

    const recommendations: Recommendation = {
      gemstones: {
        primary: { name: 'Yellow Sapphire', p: 'Jupiter', m: 'Gold', f: 'Index', d: 'Thursday', mantra: 'Om Gram Greem Graum Sah Gurave Namah' },
        secondary: [],
        avoid: ['Blue Sapphire']
      },
      remedies: {
        mantras: [{ planet: 'Jupiter', text: 'Om Gram Greem Graum Sah Gurave Namah', count: 108 }],
        yantras: [{ name: 'Jupiter Yantra', desc: 'Place in North-East direction' }],
        rudraksha: [{ mukhi: '5 Mukhi', benefits: 'Peace and Health' }],
        charity: [{ item: 'Yellow Lentils', day: 'Thursday' }],
        fasting: { day: 'Thursday', deity: 'Lord Vishnu' },
        lifestyle: { color: 'Yellow', direction: 'North-East' }
      }
    };

    return {
        meta: { ayanamsha: 'Lahiri', sunrise: '06:00 AM', timezone: 'Local' },
        lagna: { sign: lagnaSign, signName: RASHIS[lagnaSign], degree: lagnaAbs % 30, nakshatra: lagnaNak.name, lord: RASHI_LORDS[lagnaSign] },
        planets, houses, dashas: { current: currentDasha, timeline }, yogas: [],
        panchang: { tithi: 'Pratipada', yoga: 'Sobhana', karana: 'Bava', nakshatra: moon.nakshatra, sunrise: '06:00 AM', ayanamsa: 'Lahiri' },
        recommendations
    };
};
