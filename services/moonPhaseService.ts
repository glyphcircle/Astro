// Moon Phase Calculation Service
export interface MoonPhaseData {
    phaseName: string;
    phaseEmoji: string;
    percentage: number;
    angle: number;
    zodiacSign: string;
    nakshatra: string;
    personalityType: string;
    traits: string[];
    strengths: string[];
    challenges: string[];
    lifePurpose: string;
    spiritualPath: string;
    karmicLesson: string;
    soulMission: string;
    emotionalNature: string;
    intuitiveGifts: string[];
    relationshipStyle: string;
    careerGuidance: string;
    luckyElements: {
        colors: string[];
        numbers: number[];
        gemstones: string[];
        days: string[];
    };
    manifestationPower: {
        wealth: number;
        love: number;
        career: number;
        health: number;
        spiritual: number;
    };
}

const MOON_PHASES = [
    { name: 'New Moon', emoji: '🌑', start: 0, end: 3.125 },
    { name: 'Waxing Crescent', emoji: '🌒', start: 3.125, end: 21.875 },
    { name: 'First Quarter', emoji: '🌓', start: 21.875, end: 28.125 },
    { name: 'Waxing Gibbous', emoji: '🌔', start: 28.125, end: 46.875 },
    { name: 'Full Moon', emoji: '🌕', start: 46.875, end: 53.125 },
    { name: 'Waning Gibbous', emoji: '🌖', start: 53.125, end: 71.875 },
    { name: 'Last Quarter', emoji: '🌗', start: 71.875, end: 78.125 },
    { name: 'Waning Crescent', emoji: '🌘', start: 78.125, end: 96.875 },
];

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export function calculateMoonPhase(birthDate: Date): MoonPhaseData {
    // Calculate moon phase percentage (0-100)
    const knownNewMoon = new Date('2000-01-06'); // Known new moon date
    const synodicMonth = 29.53058867; // Days in lunar cycle

    const daysSinceNew = (birthDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cyclePosition = daysSinceNew % synodicMonth;
    const percentage = (cyclePosition / synodicMonth) * 100;
    const angle = (percentage / 100) * 360;

    // Determine phase
    const phase = MOON_PHASES.find(p => percentage >= p.start && percentage < p.end) || MOON_PHASES[0];

    // Calculate zodiac sign (simplified - based on day of year)
    const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const zodiacIndex = Math.floor((dayOfYear / 365) * 12) % 12;
    const zodiacSign = ZODIAC_SIGNS[zodiacIndex];

    // Calculate Nakshatra (simplified)
    const nakshatraIndex = Math.floor((dayOfYear / 365) * 27) % 27;
    const nakshatra = NAKSHATRAS[nakshatraIndex];

    // Get personality based on phase
    const personality = getPersonalityByPhase(phase.name, percentage);

    return {
        phaseName: phase.name,
        phaseEmoji: phase.emoji,
        percentage: Math.round(percentage * 100) / 100,
        angle: Math.round(angle * 100) / 100,
        zodiacSign,
        nakshatra,
        ...personality
    };
}

function getPersonalityByPhase(phaseName: string, percentage: number): Omit<MoonPhaseData, 'phaseName' | 'phaseEmoji' | 'percentage' | 'angle' | 'zodiacSign' | 'nakshatra'> {
    const personalities: Record<string, any> = {
        'New Moon': {
            personalityType: 'The Visionary Pioneer',
            traits: ['Intuitive', 'Spontaneous', 'Innocent', 'Impulsive', 'Courageous'],
            strengths: ['Natural initiator', 'Fresh perspective', 'Childlike wonder', 'Fearless exploration'],
            challenges: ['Impatience', 'Naivety', 'Difficulty with completion', 'Over-enthusiasm'],
            lifePurpose: 'To plant seeds of new consciousness and inspire fresh beginnings in the world',
            spiritualPath: 'Embrace the void and trust in new cycles of creation',
            karmicLesson: 'Learning to trust intuition over logic and embrace the unknown',
            soulMission: 'To bring forth new ideas and inspire transformation in others',
            emotionalNature: 'Fresh, optimistic, and full of potential energy',
            intuitiveGifts: ['Prophecy', 'Vision work', 'Seed planting intentions', 'Pure channeling'],
            relationshipStyle: 'Seeks partners who support new beginnings and growth',
            careerGuidance: 'Entrepreneur, innovator, spiritual teacher, artist, pioneer in any field',
            luckyElements: {
                colors: ['White', 'Silver', 'Black'],
                numbers: [1, 10, 19, 28],
                gemstones: ['Moonstone', 'Pearl', 'Selenite'],
                days: ['Monday', 'New Moon days']
            },
            manifestationPower: { wealth: 85, love: 75, career: 90, health: 70, spiritual: 95 }
        },
        'Waxing Crescent': {
            personalityType: 'The Ambitious Builder',
            traits: ['Determined', 'Growth-oriented', 'Optimistic', 'Action-focused', 'Persistent'],
            strengths: ['Building momentum', 'Taking action', 'Overcoming obstacles', 'Strategic thinking'],
            challenges: ['Impatience with results', 'Burnout', 'Over-ambition', 'Ignoring rest needs'],
            lifePurpose: 'To turn visions into reality through persistent action and growth',
            spiritualPath: 'Trust the process of gradual expansion and celebrate small wins',
            karmicLesson: 'Balancing ambition with patience and sustainable growth',
            soulMission: 'To demonstrate that dreams require consistent action to manifest',
            emotionalNature: 'Hopeful, energetic, and forward-moving',
            intuitiveGifts: ['Momentum sensing', 'Opportunity recognition', 'Growth manifestation', 'Strategic foresight'],
            relationshipStyle: 'Values partners who share ambitions and support mutual growth',
            careerGuidance: 'Project manager, startup founder, coach, builder, developer',
            luckyElements: {
                colors: ['Light Blue', 'Green', 'Silver'],
                numbers: [2, 11, 20, 29],
                gemstones: ['Aquamarine', 'Green Aventurine', 'Clear Quartz'],
                days: ['Monday', 'Thursday']
            },
            manifestationPower: { wealth: 80, love: 80, career: 88, health: 75, spiritual: 82 }
        },
        'First Quarter': {
            personalityType: 'The Determined Warrior',
            traits: ['Strong-willed', 'Decisive', 'Crisis-capable', 'Independent', 'Resilient'],
            strengths: ['Problem-solving', 'Overcoming challenges', 'Leadership under pressure', 'Determination'],
            challenges: ['Stubbornness', 'Internal conflict', 'Difficulty asking for help', 'Tendency to struggle alone'],
            lifePurpose: 'To overcome obstacles and teach others resilience through example',
            spiritualPath: 'Embrace challenges as opportunities for growth and transformation',
            karmicLesson: 'Finding balance between independence and collaboration',
            soulMission: 'To be a warrior of light who transforms challenges into victories',
            emotionalNature: 'Intense, focused, and driven by purpose',
            intuitiveGifts: ['Crisis management', 'Strategic warfare', 'Obstacle removal', 'Protective energy'],
            relationshipStyle: 'Needs partners who respect independence yet offer steady support',
            careerGuidance: 'Crisis manager, strategist, attorney, military, emergency responder',
            luckyElements: {
                colors: ['Red', 'Orange', 'Steel Gray'],
                numbers: [3, 12, 21, 30],
                gemstones: ['Red Jasper', 'Carnelian', 'Hematite'],
                days: ['Tuesday', 'Saturday']
            },
            manifestationPower: { wealth: 78, love: 72, career: 92, health: 85, spiritual: 75 }
        },
        'Waxing Gibbous': {
            personalityType: 'The Perfectionist Refiner',
            traits: ['Analytical', 'Detail-oriented', 'Perfectionist', 'Methodical', 'Improvement-focused'],
            strengths: ['Refinement', 'Analysis', 'Preparation', 'Attention to detail', 'Excellence pursuit'],
            challenges: ['Over-analysis', 'Never feeling "ready"', 'Self-criticism', 'Postponing action'],
            lifePurpose: 'To refine and perfect systems, ideas, and processes for maximum effectiveness',
            spiritualPath: 'Learn that perfection is a journey, not a destination',
            karmicLesson: 'Balancing excellence with acceptance of imperfection',
            soulMission: 'To raise standards and inspire quality in all endeavors',
            emotionalNature: 'Thoughtful, careful, and precision-focused',
            intuitiveGifts: ['Pattern recognition', 'Flaw detection', 'Optimization insight', 'Quality sensing'],
            relationshipStyle: 'Seeks depth, loyalty, and partners committed to mutual improvement',
            careerGuidance: 'Editor, quality analyst, researcher, craftsperson, consultant',
            luckyElements: {
                colors: ['Yellow', 'Gold', 'Earth tones'],
                numbers: [4, 13, 22, 31],
                gemstones: ['Citrine', 'Tiger\'s Eye', 'Amber'],
                days: ['Wednesday', 'Sunday']
            },
            manifestationPower: { wealth: 83, love: 77, career: 87, health: 80, spiritual: 85 }
        },
        'Full Moon': {
            personalityType: 'The Illuminated Visionary',
            traits: ['Charismatic', 'Emotional', 'Insightful', 'Expressive', 'Magnetic'],
            strengths: ['High emotional intelligence', 'Natural leadership', 'Manifestation power', 'Inspiration'],
            challenges: ['Emotional overwhelm', 'Intensity', 'Difficulty with boundaries', 'Energy depletion'],
            lifePurpose: 'To illuminate truth and inspire others through emotional authenticity',
            spiritualPath: 'Master emotional energy and become a beacon of light for others',
            karmicLesson: 'Managing intensity and learning healthy emotional boundaries',
            soulMission: 'To shine brightly and help others find their own light',
            emotionalNature: 'Intense, radiant, and deeply feeling',
            intuitiveGifts: ['Psychic sensitivity', 'Energy healing', 'Emotional reading', 'Divine channeling'],
            relationshipStyle: 'All-in, passionate, needs deep soul connections',
            careerGuidance: 'Healer, performer, motivational speaker, therapist, artist',
            luckyElements: {
                colors: ['White', 'Silver', 'Purple', 'Gold'],
                numbers: [5, 14, 23],
                gemstones: ['Moonstone', 'Labradorite', 'Amethyst'],
                days: ['Monday', 'Full Moon nights']
            },
            manifestationPower: { wealth: 90, love: 95, career: 88, health: 78, spiritual: 100 }
        },
        'Waning Gibbous': {
            personalityType: 'The Wise Teacher',
            traits: ['Generous', 'Wise', 'Grateful', 'Sharing', 'Reflective'],
            strengths: ['Teaching ability', 'Gratitude practice', 'Sharing wisdom', 'Mentorship'],
            challenges: ['Over-giving', 'Difficulty receiving', 'Living through others', 'Burnout from service'],
            lifePurpose: 'To share accumulated wisdom and help others on their journey',
            spiritualPath: 'Embrace the role of teacher while remaining a humble student',
            karmicLesson: 'Learning to receive as graciously as you give',
            soulMission: 'To be a bridge between knowledge and those seeking enlightenment',
            emotionalNature: 'Grateful, generous, and sharing',
            intuitiveGifts: ['Teaching channeling', 'Wisdom transmission', 'Gratitude manifestation', 'Energy sharing'],
            relationshipStyle: 'Nurturing, supportive, seeks to uplift partners',
            careerGuidance: 'Teacher, mentor, counselor, guide, author, philosopher',
            luckyElements: {
                colors: ['Blue', 'Indigo', 'Silver'],
                numbers: [6, 15, 24],
                gemstones: ['Sapphire', 'Lapis Lazuli', 'Sodalite'],
                days: ['Thursday', 'Friday']
            },
            manifestationPower: { wealth: 75, love: 88, career: 82, health: 85, spiritual: 92 }
        },
        'Last Quarter': {
            personalityType: 'The Sacred Transformer',
            traits: ['Introspective', 'Transformative', 'Releasing', 'Deep', 'Mystical'],
            strengths: ['Letting go', 'Transformation', 'Deep healing', 'Closure mastery'],
            challenges: ['Holding onto past', 'Fear of endings', 'Depression tendencies', 'Isolation'],
            lifePurpose: 'To master the art of release and teach others about sacred endings',
            spiritualPath: 'Embrace death and rebirth cycles as natural and necessary',
            karmicLesson: 'Understanding that endings create space for new beginnings',
            soulMission: 'To guide souls through transitions and transformations',
            emotionalNature: 'Deep, introspective, and transformative',
            intuitiveGifts: ['Shadow work', 'Death doula energy', 'Transformation alchemy', 'Release rituals'],
            relationshipStyle: 'Intense, transformative connections; helps partners evolve',
            careerGuidance: 'Therapist, hospice worker, transformation coach, shaman, grief counselor',
            luckyElements: {
                colors: ['Black', 'Deep Purple', 'Burgundy'],
                numbers: [7, 16, 25],
                gemstones: ['Black Obsidian', 'Smoky Quartz', 'Black Tourmaline'],
                days: ['Saturday', 'Dark Moon days']
            },
            manifestationPower: { wealth: 70, love: 75, career: 78, health: 82, spiritual: 95 }
        },
        'Waning Crescent': {
            personalityType: 'The Mystic Sage',
            traits: ['Wise', 'Spiritual', 'Intuitive', 'Contemplative', 'Peaceful'],
            strengths: ['Spiritual wisdom', 'Inner peace', 'Surrender mastery', 'Psychic abilities'],
            challenges: ['Worldly detachment', 'Loneliness', 'Difficulty with materialism', 'Escapism'],
            lifePurpose: 'To embody spiritual wisdom and prepare the world for new cycles',
            spiritualPath: 'Master the art of surrender and trust in divine timing',
            karmicLesson: 'Balancing spiritual devotion with earthly responsibilities',
            soulMission: 'To be a spiritual guide bridging worlds and dimensions',
            emotionalNature: 'Serene, mystical, and deeply connected to source',
            intuitiveGifts: ['Prophecy', 'Astral travel', 'Spirit communication', 'Divine downloads'],
            relationshipStyle: 'Seeks soul-level connections; values spiritual partnership',
            careerGuidance: 'Spiritual teacher, mystic, oracle, meditation guide, energy worker',
            luckyElements: {
                colors: ['White', 'Violet', 'Translucent'],
                numbers: [8, 17, 26],
                gemstones: ['Selenite', 'Clear Quartz', 'Angelite'],
                days: ['Monday', 'Sunrise/Sunset hours']
            },
            manifestationPower: { wealth: 68, love: 80, career: 72, health: 75, spiritual: 98 }
        }
    };

    return personalities[phaseName] || personalities['New Moon'];
}
