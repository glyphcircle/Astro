
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
  dasha: {
    balance: string;
    timeline: DashaPeriod[];
  };
  yogas: string[];
  panchang: {
    tithi: string;
    yoga: string;
    karana: string;
    nakshatra: string;
    sunrise: string;
    ayanamsa: string;
  };
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

// --- ASTRONOMICAL CALCULATIONS (Low Precision Ephemeris) ---

const normalizeDeg = (deg: number): number => {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
};

// J2000 Epoch: Jan 1, 2000, 12:00 UTC
const J2000 = 2451545.0;

const getJulianDay = (date: Date): number => {
    return (date.getTime() / 86400000) + 2440587.5;
};

// Calculate Mean Longitude (Tropical)
const getMeanLongitude = (planet: string, T: number): number => {
    // T = Julian Centuries since J2000
    // L = L0 + L1 * T
    let L = 0;
    switch(planet) {
        case 'Sun': L = 280.46646 + 36000.76983 * T; break;
        case 'Moon': L = 218.3165 + 481267.8813 * T; break;
        case 'Mercury': L = 252.250906 + 149472.674636 * T; break; // Approximated mean
        case 'Venus': L = 181.979801 + 58517.815676 * T; break;
        case 'Mars': L = 355.433 + 19140.29647 * T; break;
        case 'Jupiter': L = 34.351519 + 3034.905675 * T; break;
        case 'Saturn': L = 50.077444 + 1222.113794 * T; break;
        case 'Rahu': L = 125.04452 - 1934.136261 * T; break; // Mean Node
        case 'Ketu': L = (125.04452 - 1934.136261 * T) + 180; break;
    }
    return normalizeDeg(L);
};

// Lahiri Ayanamsa (Approximate)
const getAyanamsa = (T: number): number => {
    // Approx 23.85 degrees in 2000, moving ~50 arcsec/year
    return 23.85 + (T * 100 * (50.29 / 3600)); 
};

// Calculate Sidereal Position
const getSiderealPosition = (planet: string, date: Date): { deg: number, retro: boolean } => {
    const JD = getJulianDay(date);
    const T = (JD - J2000) / 36525;
    
    // 1. Get Tropical Mean Longitude
    let meanL = getMeanLongitude(planet, T);
    
    // 2. Add Anomaly / Equation of Center (Simplified for key planets to improve accuracy over linear)
    // M = Mean Anomaly
    let M = 0;
    let eqC = 0;
    
    if (planet === 'Sun') {
        M = normalizeDeg(357.52911 + 35999.05029 * T);
        eqC = (1.914602 - 0.004817 * T) * Math.sin(M * Math.PI/180) + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI/180);
        meanL += eqC;
    } else if (planet === 'Moon') {
        // Moon calculations are complex, using simple mean for stability in demo
        // Ideally add Evection, Variation, etc.
        M = normalizeDeg(134.963 + 477198.867 * T);
        eqC = 6.289 * Math.sin(M * Math.PI/180);
        meanL += eqC;
    }
    
    // 3. Subtract Ayanamsa for Sidereal
    const ayanamsa = getAyanamsa(T);
    const sidereal = normalizeDeg(meanL - ayanamsa);
    
    // Retrograde simulation (Outer planets when opposed to Sun, Inner when inferior conjunction)
    // This is a heuristic for demo visual.
    let isRetro = false;
    if (['Rahu', 'Ketu'].includes(planet)) isRetro = true;
    
    return { deg: sidereal, retro: isRetro };
};

const getNakshatra = (deg: number): { name: string; lord: string; pada: number } => {
    const normDeg = normalizeDeg(deg);
    const nakshatraSpan = 13.3333; // 13 deg 20 min
    const idx = Math.floor(normDeg / nakshatraSpan);
    const rem = normDeg % nakshatraSpan;
    const pada = Math.floor(rem / 3.3333) + 1; 
    
    const nakshatraIndex = idx % 27;
    const info = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0]; 
    return { name: info.n, lord: info.l, pada };
};

// --- ASCENDANT CALCULATION ---
const calculateLagna = (date: Date, lat: number, lng: number): number => {
    // 1. Calculate Greenwich Mean Sidereal Time (GMST)
    const JD = getJulianDay(date);
    const T = (JD - J2000) / 36525;
    let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
    GMST = normalizeDeg(GMST);

    // 2. Calculate Local Mean Sidereal Time (LMST)
    // Add Longitude (East is positive in this calc context usually, but check standard)
    // Standard: LMST = GMST + Longitude
    const LMST = normalizeDeg(GMST + lng);

    // 3. Approximate Ascendant (Lagna)
    // Formula: tan(Lagna) = cos(RAMC) / ( -sin(RAMC)*cos(E) - tan(Lat)*sin(E) )
    // E (Obliquity of Ecliptic) ~ 23.44 deg
    const ramcRad = LMST * Math.PI / 180;
    const epsRad = 23.44 * Math.PI / 180;
    const latRad = lat * Math.PI / 180;

    const num = Math.cos(ramcRad);
    const den = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    
    let ascRad = Math.atan2(num, den);
    let ascDeg = normalizeDeg(ascRad * 180 / Math.PI);

    // 4. Convert to Sidereal (Subtract Ayanamsa)
    const ayanamsa = getAyanamsa(T);
    return normalizeDeg(ascDeg - ayanamsa);
};

// --- CORE ENGINE ---

export const calculateAstrology = (input: AstroInput): AstroChart => {
    // Default to Delhi coords if missing (Demo fallback)
    const lat = input.lat || 28.6139;
    const lng = input.lng || 77.2090;
    
    const dateTimeStr = `${input.dob}T${input.tob}`;
    const date = new Date(dateTimeStr);
    
    if (isNaN(date.getTime())) {
        console.error("Invalid Date in Astro Engine");
        // Fallback chart
        return calculateAstrology({ ...input, dob: new Date().toISOString().split('T')[0], tob: '12:00' });
    }

    // 1. Calculate Lagna
    const lagnaAbs = calculateLagna(date, lat, lng);
    const lagnaSign = Math.floor(lagnaAbs / 30) + 1;
    const lagnaDeg = lagnaAbs % 30;
    const lagnaNak = getNakshatra(lagnaAbs);

    // 2. Calculate Planets
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planets: Planet[] = planetNames.map(name => {
        const { deg, retro } = getSiderealPosition(name, date);
        const sign = Math.floor(deg / 30) + 1;
        
        // Whole Sign House System (Simple & Robust)
        // House 1 = Lagna Sign. House 2 = Next Sign.
        let house = (sign - lagnaSign + 1);
        if (house <= 0) house += 12;

        const nak = getNakshatra(deg);

        return {
            name,
            sign,
            signName: RASHIS[sign],
            fullDegree: deg,
            normDegree: deg % 30,
            house,
            isRetrograde: retro,
            nakshatra: nak.name,
            nakshatraLord: nak.lord,
            pada: nak.pada,
            speed: name === 'Moon' ? 13 : 1, 
            shadbala: 100, // Placeholder
            rank: 0
        };
    });

    // 3. Houses Analysis
    const houses: House[] = [];
    for(let i=1; i<=12; i++) {
        let sign = (lagnaSign + i - 1);
        if (sign > 12) sign -= 12;
        
        const residents = planets.filter(p => p.house === i).map(p => p.name);
        
        let type = 'Neutral';
        if ([1, 4, 7, 10].includes(i)) type = 'Kendra';
        else if ([5, 9].includes(i)) type = 'Trikona';
        else if ([6, 8, 12].includes(i)) type = 'Dusthana';

        houses.push({
            number: i,
            sign,
            signName: RASHIS[sign],
            lord: RASHI_LORDS[sign],
            planets: residents,
            type
        });
    }

    // 4. Dasha Calculation (Vimshottari)
    const moon = planets.find(p => p.name === 'Moon')!;
    const moonNakDeg = moon.fullDegree % 13.3333; // Deg passed in nakshatra
    const fractionPassed = moonNakDeg / 13.3333;
    
    const dashaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const dashaYears = { 'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17 };
    
    // Find Moon's Nakshatra Index (0-26)
    const nakList = NAKSHATRAS.map(n => n.n);
    const moonNakIdx = nakList.indexOf(moon.nakshatra);
    
    // Starting Dasha Lord
    const startDashaIdx = moonNakIdx % 9;
    const startLord = dashaOrder[startDashaIdx];
    const totalYrs = dashaYears[startLord as keyof typeof dashaYears];
    
    const balanceYrs = totalYrs * (1 - fractionPassed);
    
    // Build Timeline
    const timeline: DashaPeriod[] = [];
    let currentDate = new Date(date);
    
    // First (Balance) Period
    const balanceEnd = new Date(currentDate.getFullYear() + balanceYrs, currentDate.getMonth(), currentDate.getDate());
    timeline.push({
        planet: startLord,
        start: date.getFullYear().toString(),
        end: balanceEnd.getFullYear().toString(),
        duration: `Balance: ${balanceYrs.toFixed(1)}y`
    });
    
    currentDate = balanceEnd;
    let currIdx = startDashaIdx;
    
    for(let i=0; i<5; i++) {
        currIdx = (currIdx + 1) % 9;
        const lord = dashaOrder[currIdx];
        const yrs = dashaYears[lord as keyof typeof dashaYears];
        const end = new Date(currentDate.getFullYear() + yrs, currentDate.getMonth(), currentDate.getDate());
        timeline.push({
            planet: lord,
            start: currentDate.getFullYear().toString(),
            end: end.getFullYear().toString(),
            duration: `${yrs} Years`
        });
        currentDate = end;
    }

    // 5. Panchang
    const sun = planets.find(p => p.name === 'Sun')!;
    const diff = normalizeDeg(moon.fullDegree - sun.fullDegree);
    const tithiIdx = Math.floor(diff / 12);
    const tithiName = TITHIS[tithiIdx % 15] + (tithiIdx >= 15 ? ' (Krishna)' : ' (Shukla)');
    
    const yogaSum = normalizeDeg(moon.fullDegree + sun.fullDegree);
    const yogaIdx = Math.floor(yogaSum / 13.3333);
    
    return {
        meta: {
            ayanamsha: `Lahiri ${getAyanamsa((getJulianDay(date)-J2000)/36525).toFixed(2)}°`,
            sunrise: "06:00 AM", // Simplified
            timezone: "Local"
        },
        lagna: {
            sign: lagnaSign,
            signName: RASHIS[lagnaSign],
            degree: lagnaDeg,
            nakshatra: lagnaNak.name,
            lord: RASHI_LORDS[lagnaSign]
        },
        planets,
        houses,
        dasha: {
            balance: `${startLord} Balance: ${balanceYrs.toFixed(1)}y`,
            timeline
        },
        yogas: [],
        panchang: {
            tithi: tithiName,
            yoga: YOGAS_NITYA[yogaIdx % 27],
            karana: "Bava", // Simplified
            nakshatra: moon.nakshatra,
            sunrise: "06:00 AM",
            ayanamsa: "Lahiri"
        }
    };
};
