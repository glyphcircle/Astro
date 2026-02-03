
// VEDIC FACE READING ENGINE (Mukha Samudrika Shastra)

export interface FaceMetrics {
  forehead: {
    height: number; // 0-10
    width: number; // 0-10
    wrinkles: number; // 0-10
    shape: 'High/Broad' | 'Low/Narrow' | 'Rounded' | 'Square';
  };
  eyes: {
    size: number; // 0-10
    spacing: 'Wide' | 'Close' | 'Normal';
    shape: 'Almond' | 'Round' | 'Deep-set' | 'Protruding';
  };
  nose: {
    length: number; // 0-10
    width: number; // 0-10
    shape: 'Straight' | 'Hooked' | 'Bulbous' | 'Snub';
  };
  cheeks: {
    prominence: number; // 0-10
  };
  mouth: {
    lipFullness: number; // 0-10
  };
  chin: {
    shape: 'Round' | 'Square' | 'Pointed' | 'Receding';
    prominence: number; // 0-10
  };
  jaw: {
    strength: number; // 0-10
    type: 'Square/Strong' | 'Round/Soft' | 'Pointed';
  };
  symmetry: number; // 0-100
  skin: {
    texture: number; // 0-10 (10 is smooth)
  };
}

export interface FaceAnalysis {
  zones: {
    upper: number;
    middle: number;
    lower: number;
    dominance: string;
  };
  planetary: {
    jupiter: number;
    mercury: number;
    mars: number;
    venus: number;
    saturn: number;
    moon: number;
    sun: number;
  };
  charts: {
    zoneBalance: any[];
    foreheadAnalysis: any;
    noseClassification: any;
    eyeCharacteristics: any;
    jawAnalysis: any;
    symmetryHealth: any;
  };
  personality: {
    primary: string;
    secondary: string;
  };
  lifeEmphasis: {
    youth: string; // 20-35
    midlife: string; // 35-50
    elder: string; // 50+
  };
}

// --- 1. VEDIC THREE-ZONE FORMULAS (Mukha Trikona) ---

function calculateUpperZone(forehead: FaceMetrics['forehead']): number {
  // Upper Zone (Jupiter/Mercury - Intellect/Spirituality)
  const score = (forehead.height * 2) + (forehead.width * 1.5) - (forehead.wrinkles * 1.2);
  // Normalize to approx 0-100 (Max raw approx 35, scale up)
  return Math.min(100, Math.max(0, Math.round(score * 3))); 
}

function calculateMiddleZone(eyes: FaceMetrics['eyes'], nose: FaceMetrics['nose'], cheekProminence: number): number {
  // Middle Zone (Moon/Sun/Mars/Venus - Emotions/Social)
  const score = (eyes.size * 1.8) + (nose.width * 1.5) + (cheekProminence * 1.2);
  return Math.min(100, Math.max(0, Math.round(score * 2.5)));
}

function calculateLowerZone(mouthFullness: number, chinProminence: number, jawStrength: number): number {
  // Lower Zone (Venus/Saturn - Material/Discipline)
  const score = (mouthFullness * 1.5) + (chinProminence * 1.8) + (jawStrength * 2);
  return Math.min(100, Math.max(0, Math.round(score * 2.2)));
}

// --- 2. PLANETARY FEATURE MAPPING ---

function calculatePlanetaryInfluence(m: FaceMetrics) {
  // Forehead -> Jupiter (wisdom) + Mercury (intellect)
  const jupiter = (m.forehead.height + m.forehead.width) * 5; 
  const mercury = (m.forehead.width * 0.6 + m.eyes.size * 0.4) * 10;

  // Eyes -> Venus (emotions) + Moon (mind)
  const moon = (m.eyes.size * 6) + (m.skin.texture * 4);
  
  // Eyebrows/Nose -> Mars (assertiveness/ambition)
  const mars = (m.nose.length * 5) + (m.nose.width * 3) + (m.jaw.strength * 2);

  // Cheekbones -> Sun (authority)
  const sun = m.cheeks.prominence * 10;

  // Lips -> Venus (relationships/wealth)
  const venus = (m.mouth.lipFullness * 5) + (m.eyes.size * 5);

  // Chin/Jaw -> Saturn (discipline)
  const saturn = (m.jaw.strength * 6) + (m.chin.prominence * 4);

  return {
    jupiter: Math.min(100, jupiter),
    mercury: Math.min(100, mercury),
    mars: Math.min(100, mars),
    sun: Math.min(100, sun),
    venus: Math.min(100, venus),
    moon: Math.min(100, moon),
    saturn: Math.min(100, saturn)
  };
}

// --- 3. CHART GENERATION LOGIC ---

function getZoneInterpretation(zones: { upper: number, middle: number, lower: number }) {
    const max = Math.max(zones.upper, zones.middle, zones.lower);
    if (max === zones.upper) return { trait: "Intellectual", desc: "Thinker / Planner" };
    if (max === zones.middle) return { trait: "Social", desc: "Charismatic / Emotional" };
    return { trait: "Material", desc: "Determined / Practical" };
}

function analyzeForehead(shape: string) {
    const map: Record<string, any> = {
        'High/Broad': { jupiter: 'Strong', mercury: 'Good', career: 'Teacher/Advisor' },
        'Low/Narrow': { jupiter: 'Weak', mercury: 'Sharp', career: 'Business/Execution' },
        'Rounded': { jupiter: 'Moderate', mercury: 'High', career: 'Arts/Music' },
        'Square': { jupiter: 'High', mercury: 'Moderate', career: 'Engineering/Tech' }
    };
    return map[shape] || map['High/Broad'];
}

function analyzeNose(shape: string) {
    const map: Record<string, any> = {
        'Straight': { mars: 85, venus: 80, wealth: 'Balanced Income' },
        'Hooked': { mars: 95, venus: 60, wealth: 'High Ambition' },
        'Bulbous': { mars: 70, venus: 90, wealth: 'Creative Wealth' },
        'Snub': { mars: 60, venus: 85, wealth: 'Service Oriented' }
    };
    return map[shape] || map['Straight'];
}

function analyzeEyes(shape: string, size: number) {
    let personality = "Balanced";
    if (size > 7) personality = "Trustworthy & Open";
    else if (size < 4) personality = "Analytical & Private";
    
    if (shape === 'Deep-set') personality += ", Intense";
    if (shape === 'Round') personality += ", Emotional";

    return { type: `${size > 7 ? 'Large' : 'Small'} / ${shape}`, venus: size > 7 ? 'High' : 'Medium', personality };
}

function analyzeJaw(type: string, strength: number) {
    const saturnScore = strength * 10;
    let approach = "Balanced";
    if (type.includes('Square')) approach = "Disciplined & Strong";
    if (type.includes('Round')) approach = "Harmonious & Adaptable";
    if (type.includes('Pointed')) approach = "Ambitious & Sharp";

    return { type, saturn: saturnScore, approach };
}

function analyzeSymmetry(score: number) {
    if (score >= 85) return { karmic: "Excellent", health: "Strong Vitality" };
    if (score >= 70) return { karmic: "Good", health: "Normal Health" };
    return { karmic: "Average", health: "Monitor Stress" };
}

// --- MAIN ENGINE FUNCTION ---

export const calculateFaceReading = (m: FaceMetrics): FaceAnalysis => {
  // 1. Zone Scores
  const zones = {
    upper: calculateUpperZone(m.forehead),
    middle: calculateMiddleZone(m.eyes, m.nose, m.cheeks.prominence),
    lower: calculateLowerZone(m.mouth.lipFullness, m.chin.prominence, m.jaw.strength)
  };
  
  const zoneDom = getZoneInterpretation(zones);

  // 2. Planetary Scores
  const planets = calculatePlanetaryInfluence(m);

  // 3. Life Emphasis (Age Stages)
  // Forehead governs youth (up to 30), Middle (30-50), Lower (50+)
  const lifeEmphasis = {
      youth: zones.upper > 70 ? "Intellectual Growth & Study" : "Practical Struggles",
      midlife: zones.middle > 70 ? "Wealth & Family Success" : "Career Building",
      elder: zones.lower > 70 ? "Authority & Comfort" : "Spiritual Retreat"
  };

  // 4. Construct Charts
  const charts = {
      zoneBalance: [
          { zone: "Intellectual (Upper)", score: zones.upper, interpretation: zones.upper > 60 ? "High" : "Avg" },
          { zone: "Social (Middle)", score: zones.middle, interpretation: zones.middle > 60 ? "High" : "Avg" },
          { zone: "Material (Lower)", score: zones.lower, interpretation: zones.lower > 60 ? "High" : "Avg" }
      ],
      foreheadAnalysis: analyzeForehead(m.forehead.shape),
      noseClassification: analyzeNose(m.nose.shape),
      eyeCharacteristics: analyzeEyes(m.eyes.shape, m.eyes.size),
      jawAnalysis: analyzeJaw(m.jaw.type, m.jaw.strength),
      symmetryHealth: analyzeSymmetry(m.symmetry)
  };

  return {
      zones: { ...zones, dominance: zoneDom.trait },
      planetary: planets,
      charts,
      personality: {
          primary: zoneDom.desc,
          secondary: planets.venus > 80 ? "Charming" : planets.mars > 80 ? "Driven" : "Steady"
      },
      lifeEmphasis
  };
};
