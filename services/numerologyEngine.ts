
// NUMEROLOGY ENGINE - Deterministic Calculation System
// Supports Chaldean (Default) and Pythagorean systems

// 1. MAPPING TABLES
export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8 // No number 9 in Chaldean mapping (9 is sacred/unassigned to letters)
};

export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

// 2. DATA TABLES (Charts)

const COMPATIBILITY_MATRIX: Record<number, { friends: number[], neutral: number[], enemies: number[] }> = {
  1: { friends: [1, 2, 3, 5, 9], neutral: [4, 7], enemies: [6, 8] },
  2: { friends: [1, 3, 5], neutral: [2, 7, 8, 9], enemies: [4, 6] },
  3: { friends: [1, 2, 3, 5, 9], neutral: [7, 8], enemies: [4, 6] },
  4: { friends: [5, 6, 7], neutral: [1, 8], enemies: [2, 3, 4, 9] }, // 4 is tricky, often opposes 4/8
  5: { friends: [1, 4, 5, 6], neutral: [3, 7, 8, 9], enemies: [2] },
  6: { friends: [5, 6, 8, 9], neutral: [2, 4, 7], enemies: [1, 3] },
  7: { friends: [4, 6], neutral: [1, 2, 3, 5, 7, 9], enemies: [8] },
  8: { friends: [5, 6], neutral: [3, 7], enemies: [1, 2, 4, 8, 9] }, // Saturn (8) often struggles with Sun/Moon
  9: { friends: [1, 3, 5, 6, 9], neutral: [2, 7], enemies: [4, 8] }
};

const COLOR_CHART: Record<number, string> = {
  1: "Gold, Orange, Yellow",
  2: "White, Silver, Cream",
  3: "Yellow, Saffron, Purple",
  4: "Electric Blue, Grey",
  5: "Green, White, Light Brown",
  6: "White, Light Blue, Pink",
  7: "Smoky Grey, Pastel Green",
  8: "Black, Dark Blue, Violet",
  9: "Red, Maroon, Rose"
};

const LUCKY_DAYS: Record<number, string> = {
  1: "Sunday, Monday",
  2: "Monday, Sunday",
  3: "Thursday, Tuesday",
  4: "Saturday, Sunday",
  5: "Wednesday, Friday",
  6: "Friday, Wednesday",
  7: "Monday, Wednesday",
  8: "Saturday, Friday",
  9: "Tuesday, Thursday"
};

const PEAK_YEARS: Record<number, string> = {
  1: "22, 28, 37, 46, 55",
  2: "20, 24, 29, 38, 47",
  3: "21, 30, 39, 48, 57",
  4: "22, 31, 40, 49, 58",
  5: "23, 32, 41, 50, 59",
  6: "24, 33, 42, 51, 60",
  7: "25, 34, 43, 52, 61",
  8: "26, 35, 44, 53, 62",
  9: "27, 36, 45, 54, 63"
};

const PLANET_MAP: Record<number, string> = {
    1: "Sun (Surya)", 2: "Moon (Chandra)", 3: "Jupiter (Guru)", 
    4: "Rahu (Uranus)", 5: "Mercury (Budh)", 6: "Venus (Shukra)", 
    7: "Ketu (Neptune)", 8: "Saturn (Shani)", 9: "Mars (Mangal)"
};

// 3. HELPER FUNCTIONS

// Recursive sum to single digit (except Master Numbers if toggle is on)
const digitalRoot = (num: number, useMaster: boolean = false): number => {
  if (num === 0) return 0;
  if (useMaster && (num === 11 || num === 22 || num === 33)) return num;
  if (num < 10) return num;
  
  // Sum digits
  const sum = String(num).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  return digitalRoot(sum, useMaster);
};

const getDailyNumber = (date: Date, mulank: number): number => {
    // Universal Day Number = Sum(Date)
    // Personal Day = Sum(Day + Month + CurrentYear) + (Optional: Mulank)
    // Vedic style often emphasizes the day's root vs your root
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const sum = day + month + year;
    return digitalRoot(sum);
};

// 4. MAIN CALCULATOR

export interface NumerologyInput {
  name: string;
  dob: string; // YYYY-MM-DD
  system?: 'chaldean' | 'pythagorean';
  useMasterNumbers?: boolean;
}

export const calculateNumerology = (input: NumerologyInput) => {
  const { name, dob, system = 'chaldean', useMasterNumbers = false } = input;
  
  const map = system === 'pythagorean' ? PYTHAGOREAN_MAP : CHALDEAN_MAP;
  
  // 1. Parse Date
  const dateObj = new Date(dob);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  // 2. Mulank (Psychic/Birth Number) - Sum of Day only
  const mulank = digitalRoot(day, useMasterNumbers);
  // Normalize for chart lookups (charts don't use 11/22/33 usually)
  const rootMulank = mulank > 9 ? digitalRoot(mulank) : mulank; 

  // 3. Bhagyank (Destiny/Life Path) - Sum of entire DOB
  // Method: Sum day, sum month, sum year, then add totals
  const dSum = digitalRoot(day);
  const mSum = digitalRoot(month);
  const ySum = digitalRoot(year);
  const bhagyank = digitalRoot(dSum + mSum + ySum, useMasterNumbers);
  const rootBhagyank = bhagyank > 9 ? digitalRoot(bhagyank) : bhagyank;

  // 4. Namank (Expression/Name Number)
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let nameSum = 0;
  for (let char of cleanName) {
    nameSum += map[char] || 0;
  }
  const namank = digitalRoot(nameSum, useMasterNumbers);
  
  // 5. Compatibility
  const compatData = COMPATIBILITY_MATRIX[rootMulank];
  
  // 6. Forecasts
  const next30Days = [];
  const today = new Date();
  for(let i=0; i<5; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dailyNum = getDailyNumber(d, rootMulank);
      const isFriendly = compatData.friends.includes(dailyNum);
      if(isFriendly) {
          next30Days.push(d.toLocaleDateString(undefined, {weekday: 'short', day: 'numeric'}));
      }
  }

  // 7. Interpretations (Short <25 words)
  const interpretations = {
      mulank: `${mulank} (${PLANET_MAP[rootMulank]}): Governs your inner nature. You are ${getTrait(rootMulank)}.`,
      bhagyank: `${bhagyank}: Your life's purpose. Path of ${getPath(rootBhagyank)}.`,
      namank: `${namank}: How the world sees you. Vibrates with ${getTrait(rootMulank > 9 ? digitalRoot(namank) : namank)}.`
  };

  return {
    coreNumbers: {
        mulank,
        bhagyank,
        namank,
        system: system.charAt(0).toUpperCase() + system.slice(1)
    },
    charts: {
        compatibility: compatData,
        colors: { primary: COLOR_CHART[rootMulank] },
        luckyDays: { primary: LUCKY_DAYS[rootBhagyank] },
        peakYears: { ranges: PEAK_YEARS[rootBhagyank] }
    },
    forecast: {
        luckyDaysUpcoming: next30Days.slice(0, 3) // Top 3
    },
    interpretations,
    disclaimer: "Traditional Vedic guidance only, not scientific prediction."
  };
};

// Helper for traits (Short words)
function getTrait(num: number): string {
    const traits = [
        "", "leadership and initiative", "cooperation and sensitivity", "creativity and expression",
        "stability and process", "freedom and versatility", "responsibility and care",
        "analysis and introspection", "power and ambition", "humanitarianism"
    ];
    return traits[num] || "mystery";
}

function getPath(num: number): string {
    const paths = [
        "", "achievement", "partnership", "expression", "building", "adventure",
        "service", "truth-seeking", "execution", "compassion"
    ];
    return paths[num] || "unknown";
}
