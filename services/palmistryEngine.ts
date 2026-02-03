
// VEDIC PALMISTRY ENGINE (Hasta Rekha Shastra)

export interface LineMetrics {
  length: number; // 0-10
  depth: number; // 0-10
  clarity: number; // 0-10
  breaks: number; // 0-5 count
  islands: number; // 0-5 count
  forks: number; // 0-3 count
}

export interface MountMetrics {
  height: number; // 0-10
  firmness: number; // 0-10 (Estimated visually as 'Fullness')
}

export interface PalmInput {
  handType: 'Elementary' | 'Square' | 'Conic' | 'Pointed' | 'Mixed';
  lines: {
    life: LineMetrics;
    head: LineMetrics;
    heart: LineMetrics;
    fate: LineMetrics;
    sun: LineMetrics;
  };
  mounts: {
    jupiter: MountMetrics;
    saturn: MountMetrics;
    apollo: MountMetrics;
    mercury: MountMetrics;
    venus: MountMetrics;
    moon: MountMetrics;
    mars: MountMetrics;
  };
  fingers: {
    thumbIndexRatio: 'Long' | 'Short' | 'Equal';
  };
  marks: string[]; // ['Triangle', 'Star', 'Square', 'Island', 'Cross', 'Trishul']
}

export interface PalmAnalysis {
  handType: string;
  lineScores: Record<string, number>;
  mountScores: Record<string, number>;
  eventTimeline: { age: number; event: string; line: string }[];
  charts: {
    lineQuality: any[];
    mountActivation: any[];
    fateTiming: any[];
  };
  vedicInterpretation: {
    vitality: string;
    mindset: string;
    relationships: string;
    career: string;
  };
  specialMarks: string[];
}

// --- 1. VEDIC LINE SCORING FORMULAS ---

function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

// LIFE LINE (Ayushya Rekha)
function lifeLineScore(m: LineMetrics) {
  // Base weights: Length high, Depth/Clarity med, Breaks/Islands negative
  const raw = (m.length * 4) + (m.depth * 3) + (m.clarity * 3) - (m.breaks * 5) - (m.islands * 4);
  // Max possible raw ~ 100. Adjust constants to fit 0-100 scale roughly.
  // Assuming inputs 0-10. Max positive = 40+30+30=100. 
  return normalizeScore(raw);
}

// HEAD LINE (Medhya Rekha)
function headLineScore(m: LineMetrics) {
  const raw = (m.length * 3.5) + (m.depth * 3) + (m.clarity * 3) + (m.forks * 2);
  return normalizeScore(raw);
}

// HEART LINE (Hridaya Rekha)
function heartLineScore(m: LineMetrics) {
  const raw = (m.length * 3.5) + (m.depth * 2.5) + (m.clarity * 3) - (m.islands * 5) - (m.breaks * 3);
  return normalizeScore(raw);
}

// FATE LINE (Karma Rekha)
function fateLineScore(m: LineMetrics) {
  const raw = (m.length * 4) + (m.depth * 3) + (m.clarity * 3) - (m.breaks * 6);
  return normalizeScore(raw);
}

// SUN LINE (Surya Rekha)
function sunLineScore(m: LineMetrics) {
  const raw = (m.length * 4) + (m.clarity * 4) + (m.depth * 2) + (m.forks * 3);
  return normalizeScore(raw);
}

// --- 2. MOUNT ANALYSIS (Giri Parvata) ---

function calculateMountScore(m: MountMetrics): number {
  // Height is dominant, Firmness (Fullness) secondary
  const raw = (m.height * 6) + (m.firmness * 4);
  return normalizeScore(raw);
}

// --- 3. EVENT TIMING ---

function calculateLifeEvents(m: LineMetrics): { age: number; event: string; line: string }[] {
  const events = [];
  // Simulate events based on structural features
  if (m.breaks > 0) {
    events.push({ age: 45, event: "Health/Vitality Shift", line: "Life Line Break" });
  }
  if (m.islands > 0) {
    events.push({ age: 30, event: "Period of Low Energy", line: "Life Line Island" });
  }
  if (m.forks > 0) {
    events.push({ age: 60, event: "Travel/Change of Residence", line: "Life Line Fork" });
  }
  return events;
}

function calculateFateEvents(m: LineMetrics): { age: number; event: string; line: string }[] {
  const events = [];
  // Fate line timing: Bottom to Top. 
  // Base to Head Line (~35), Head to Heart (~35-50), Heart to Base of fingers (50+)
  if (m.breaks > 0) {
    events.push({ age: 35, event: "Career Pivot/Change", line: "Fate Line Break" });
  }
  if (m.length > 8) {
    events.push({ age: 28, event: "Career Rise", line: "Deep Fate Line" });
  }
  return events;
}

// --- MAIN ENGINE ---

export const calculatePalmistry = (input: PalmInput): PalmAnalysis => {
  
  // 1. Calculate Scores
  const scores = {
    life: lifeLineScore(input.lines.life),
    head: headLineScore(input.lines.head),
    heart: heartLineScore(input.lines.heart),
    fate: fateLineScore(input.lines.fate),
    sun: sunLineScore(input.lines.sun)
  };

  const mounts = {
    jupiter: calculateMountScore(input.mounts.jupiter),
    saturn: calculateMountScore(input.mounts.saturn),
    apollo: calculateMountScore(input.mounts.apollo),
    mercury: calculateMountScore(input.mounts.mercury),
    venus: calculateMountScore(input.mounts.venus),
    moon: calculateMountScore(input.mounts.moon),
    mars: calculateMountScore(input.mounts.mars)
  };

  // 2. Timeline
  const timeline = [
    ...calculateLifeEvents(input.lines.life),
    ...calculateFateEvents(input.lines.fate)
  ].sort((a, b) => a.age - b.age);

  // 3. Interpretations
  let vitalityText = scores.life > 75 ? "Excellent vitality (Dirgha Ayu). Strong constitution." : scores.life > 50 ? "Average vitality. Focus on regular health maintenance." : "Delicate constitution. Yoga and balance recommended.";
  
  // Specific interpretation for breaks and islands
  const lifeLineBreaks = input.lines.life.breaks || 0;
  const lifeLineIslands = input.lines.life.islands || 0;

  if (lifeLineBreaks > 0) {
    vitalityText += ` Note: ${lifeLineBreaks} break(s) detected. In Vedic palmistry, a break in the Life Line signifies a transformative change in lifestyle or environment, often interrupting the flow of prana.`;
  }
  
  if (lifeLineIslands > 0) {
    vitalityText += ` Note: ${lifeLineIslands} island(s) detected. Islands represent periods where vitality is dispersed or weakened, suggesting times of stress or recovery.`;
  }

  const interpretation = {
    vitality: vitalityText,
    mindset: scores.head > 70 ? "Sharp, analytical mind (Tikshna Budhi)." : "Creative, intuitive thinking process.",
    relationships: scores.heart > 75 ? "Deep, stable emotions & relations." : "Emotional fluctuations possible.",
    career: scores.fate > 70 ? "Strong destiny & career stability (Prabhal Karma)." : "Self-made success through hard work."
  };

  // 4. Charts Data
  const charts = {
    lineQuality: [
      { name: 'Life', score: scores.life, grade: getGrade(scores.life) },
      { name: 'Head', score: scores.head, grade: getGrade(scores.head) },
      { name: 'Heart', score: scores.heart, grade: getGrade(scores.heart) },
      { name: 'Fate', score: scores.fate, grade: getGrade(scores.fate) }
    ],
    mountActivation: [
      { name: 'Jupiter', score: mounts.jupiter, meaning: 'Leadership' },
      { name: 'Saturn', score: mounts.saturn, meaning: 'Discipline' },
      { name: 'Apollo', score: mounts.apollo, meaning: 'Creativity' },
      { name: 'Venus', score: mounts.venus, meaning: 'Passion' }
    ],
    fateTiming: [
      { range: '0-20 yrs', position: '0-15%' },
      { range: '21-40 yrs', position: '15-35%' },
      { range: '41-60 yrs', position: '35-60%' },
      { range: '61-80 yrs', position: '60-85%' }
    ]
  };

  return {
    handType: input.handType,
    lineScores: scores,
    mountScores: mounts,
    eventTimeline: timeline,
    charts,
    vedicInterpretation: interpretation,
    specialMarks: input.marks
  };
};

function getGrade(score: number): string {
  if (score >= 86) return 'Excellent';
  if (score >= 61) return 'Good';
  if (score >= 31) return 'Average';
  return 'Weak';
}
