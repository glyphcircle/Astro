export interface PersonalGuidance {
    guidanceSummary: string;
    detailedAnalysis: string;
    rootCauseAnalysis: string;
    spiritualPerspective: string;
    vedicRemedies: string[];
    crystalRemedies: string[];
    lifestyleRemedies: string[];
    astrologicalRemedies: string[];
    practicalActions: string[];
    timelineForecast: string;
    dosAndDonts: {
        dos: string[];
        donts: string[];
    };
    luckyElements: {
        colors: string[];
        numbers: number[];
        directions: string[];
        days: string[];
    };
}

export function generatePersonalGuidance(
    concernType: string,
    concernDescription: string,
    currentChallenges: string,
    goals: string,
    urgencyLevel: string,
    birthDate?: Date
): PersonalGuidance {

    return {
        guidanceSummary: generateGuidanceSummary(concernType, urgencyLevel),
        detailedAnalysis: generateDetailedAnalysis(concernType, concernDescription, currentChallenges),
        rootCauseAnalysis: generateRootCauseAnalysis(concernType, currentChallenges),
        spiritualPerspective: generateSpiritualPerspective(concernType),
        vedicRemedies: getVedicRemedies(concernType),
        crystalRemedies: getCrystalRemedies(concernType),
        lifestyleRemedies: getLifestyleRemedies(concernType),
        astrologicalRemedies: getAstrologicalRemedies(concernType),
        practicalActions: getPracticalActions(concernType, goals),
        timelineForecast: generateTimelineForecast(urgencyLevel),
        dosAndDonts: getDosAndDonts(concernType),
        luckyElements: getLuckyElements(concernType, birthDate)
    };
}

function generateGuidanceSummary(concernType: string, urgency: string): string {
    const urgencyText = urgency === 'urgent' ? 'immediate attention and swift action' :
        urgency === 'high' ? 'focused effort and consistent practice' :
            urgency === 'medium' ? 'steady progress and patience' :
                'gentle guidance and natural unfolding';

    return `Your ${concernType} concern requires ${urgencyText}. Through a combination of spiritual practices, practical actions, and cosmic alignment, transformation is not only possible but destined. The universe is ready to support your journey toward resolution and growth.`;
}

function generateDetailedAnalysis(type: string, description: string, challenges: string): string {
    return `
## Deep Analysis of Your Situation

Your ${type} challenges stem from a complex interplay of karmic patterns, current life circumstances, and cosmic energies. 

**Current State:**
${description}

**Underlying Challenges:**
${challenges}

**Energetic Assessment:**
The energies surrounding your situation indicate that you are at a crucial turning point. Your soul has attracted this challenge as an opportunity for profound growth and transformation. The obstacles you face are not punishments but rather stepping stones toward your higher purpose.

**Karmic Perspective:**
Past life patterns may be influencing your current situation. By addressing these patterns through spiritual remedies and conscious action, you can break free from repetitive cycles and create lasting positive change.
`;
}

function generateRootCauseAnalysis(type: string, challenges: string): string {
    const rootCauses: Record<string, string> = {
        health: 'Physical manifestations often stem from unresolved emotional patterns, stress accumulation, or energetic imbalances in your chakra system.',
        wealth: 'Financial challenges frequently originate from limiting beliefs about abundance, karmic debts, or misalignment with your dharma (life purpose).',
        relationships: 'Relationship difficulties typically arise from unhealed wounds, communication barriers, or karmic connections requiring resolution.',
        career: 'Professional stagnation often results from being out of alignment with your true calling, Saturn\'s influence, or fear-based decision making.',
        spiritual: 'Spiritual blocks commonly stem from ego resistance, past trauma, or disconnection from your higher self and divine guidance.'
    };

    return `
## Root Cause Identification

${rootCauses[type] || 'Your challenges stem from a combination of internal and external factors requiring holistic attention.'}

### Contributing Factors:

1. **Energetic Blocks:** Stagnant energy in your auric field preventing natural flow
2. **Mental Patterns:** Repetitive thought patterns creating self-fulfilling prophecies
3. **Emotional Residue:** Unprocessed emotions from past experiences
4. **Karmic Influence:** Lessons from past lives seeking resolution
5. **Planetary Transits:** Current astrological influences affecting your life areas

${challenges}
`;
}

function generateSpiritualPerspective(type: string): string {
    return `
## Spiritual Wisdom for Your Journey

From a higher perspective, your ${type} challenge is a sacred invitation to evolve. The universe never presents obstacles without also providing the keys to overcome them. Your current situation is preparing you for a greater purpose that will unfold as you align with divine will.

**Soul Lessons:**
- Developing inner strength and resilience
- Learning to trust the divine timing
- Cultivating patience and perseverance  
- Releasing control and surrendering to higher wisdom
- Awakening to your true spiritual power

**Divine Support:**
Your guides and angels are actively working to support you. Through the recommended remedies and practices, you will strengthen your connection to divine guidance and accelerate your path to resolution.
`;
}

function getVedicRemedies(type: string): string[] {
    const remedies: Record<string, string[]> = {
        health: [
            'Recite Mahamrityunjaya Mantra 108 times daily for healing',
            'Offer water to Sun God every morning at sunrise',
            'Fast on Mondays and consume only fruits and milk',
            'Donate green vegetables on Wednesdays',
            'Visit Hanuman temple on Tuesdays and Saturdays'
        ],
        wealth: [
            'Chant Lakshmi Mantra 108 times daily',
            'Keep a Sri Yantra in your cash box or wallet',
            'Light a ghee lamp in the northeast corner every evening',
            'Donate yellow items (turmeric, yellow clothes) on Thursdays',
            'Perform Lakshmi puja on Fridays'
        ],
        relationships: [
            'Recite Shiva-Parvati mantras for harmony',
            'Offer red flowers to goddess Durga on Fridays',
            'Fast on Fridays and donate sweets',
            'Keep fresh roses in the southwest corner of your home',
            'Perform Tulsi puja daily for relationship blessings'
        ],
        career: [
            'Chant Ganesh Mantra before important work',
            'Donate black items (black cloth, sesame) on Saturdays',
            'Light a mustard oil lamp under Peepal tree on Saturdays',
            'Offer water to Lord Shiva every Monday',
            'Recite Hanuman Chalisa for removing obstacles'
        ],
        spiritual: [
            'Practice Gayatri Mantra meditation at sunrise',
            'Perform daily pranayama for 15 minutes',
            'Visit temple every Tuesday and offer water to deities',
            'Read Bhagavad Gita one chapter weekly',
            'Meditate during Brahma Muhurta (before sunrise)'
        ]
    };

    return remedies[type] || [
        'Daily meditation for 20 minutes',
        'Chant Om 108 times daily',
        'Practice gratitude journaling',
        'Offer prayers at sunrise and sunset',
        'Donate to those in need weekly'
    ];
}

function getCrystalRemedies(type: string): string[] {
    const crystals: Record<string, string[]> = {
        health: [
            'Clear Quartz - Master healer for overall health',
            'Amethyst - Stress relief and immune system support',
            'Green Aventurine - Physical healing and vitality',
            'Bloodstone - Blood purification and strength',
            'Carnelian - Energy boost and vitality'
        ],
        wealth: [
            'Citrine - Abundance and prosperity magnet',
            'Pyrite - Money manifestation and confidence',
            'Green Jade - Wealth attraction and luck',
            'Tiger Eye - Financial stability and grounding',
            'Clear Quartz - Amplifies abundance intentions'
        ],
        relationships: [
            'Rose Quartz - Unconditional love and harmony',
            'Rhodonite - Emotional healing in relationships',
            'Moonstone - Emotional balance and intuition',
            'Pink Tourmaline - Love attraction and compassion',
            'Emerald - Heart chakra opening and loyalty'
        ],
        career: [
            'Tiger Eye - Confidence and decision making',
            'Carnelian - Motivation and courage',
            'Citrine - Success and abundance',
            'Black Tourmaline - Protection from negativity',
            'Fluorite - Mental clarity and focus'
        ],
        spiritual: [
            'Amethyst - Spiritual awareness and intuition',
            'Selenite - Divine connection and clarity',
            'Labradorite - Psychic abilities and transformation',
            'Clear Quartz - Spiritual amplification',
            'Lapis Lazuli - Third eye activation'
        ]
    };

    return crystals[type] || [
        'Clear Quartz - Universal healing',
        'Amethyst - Spiritual protection',
        'Rose Quartz - Emotional healing'
    ];
}

function getLifestyleRemedies(type: string): string[] {
    return [
        'Wake up before sunrise (5:00-6:00 AM) for optimal energy',
        'Practice 15 minutes of yoga or stretching daily',
        'Avoid negative news and media for 21 days',
        'Spend 20 minutes in nature daily',
        'Practice mindful eating without distractions',
        'Create a dedicated meditation space in your home',
        'Maintain a gratitude journal - write 3 things daily',
        'Digital detox - no screens 1 hour before bed',
        'Practice positive affirmations morning and evening',
        'Engage in acts of service or charity weekly'
    ];
}

function getAstrologicalRemedies(type: string): string[] {
    return [
        'Wear gemstone specific to your beneficial planet (consult astrologer)',
        'Perform planetary mantras during favorable muhurat',
        'Respect and serve parents/elders for Jupiter blessings',
        'Feed birds and animals for karmic cleansing',
        'Light sesame oil lamp on Saturdays for Saturn\'s grace',
        'Offer red flowers to Sun on Sundays for vitality',
        'Chant planetary mantras 108 times during transit',
        'Perform Navagraha puja for planetary harmony'
    ];
}

function getPracticalActions(type: string, goals: string): string[] {
    const actions: Record<string, string[]> = {
        health: [
            'Schedule comprehensive health check-up within 7 days',
            'Create meal plan focusing on whole, nutritious foods',
            'Set sleep schedule - aim for 7-8 hours nightly',
            'Join exercise class or find workout buddy for accountability',
            'Track symptoms/progress in health journal daily'
        ],
        wealth: [
            'Create detailed budget and track expenses for 30 days',
            'Identify one additional income stream to develop',
            'Invest 10% of income in learning/skill development',
            'Network with 2-3 successful people in your field monthly',
            'Review and optimize all subscriptions and expenses'
        ],
        relationships: [
            'Schedule weekly quality time with important relationships',
            'Practice active listening - no phone during conversations',
            'Express appreciation to loved ones daily',
            'Set healthy boundaries and communicate needs clearly',
            'Seek professional counseling if patterns persist'
        ],
        career: [
            'Update resume and LinkedIn profile this week',
            'Identify 3 target companies/roles and research thoroughly',
            'Develop one new professional skill monthly',
            'Attend industry networking event or webinar weekly',
            'Create 90-day career action plan with measurable goals'
        ],
        spiritual: [
            'Establish non-negotiable daily spiritual practice time',
            'Find spiritual community or teacher for guidance',
            'Read sacred texts 15 minutes daily',
            'Practice selfless service 2-4 hours weekly',
            'Attend spiritual retreat or workshop quarterly'
        ]
    };

    const baseActions = actions[type] || [
        'Set clear, measurable goals for next 90 days',
        'Create daily routine supporting your objectives',
        'Find accountability partner or mentor',
        'Track progress weekly in journal',
        'Celebrate small wins to maintain momentum'
    ];

    return [
        ...baseActions,
        `Specific to your goal: ${goals} - Break this into 3 actionable steps and begin today`
    ];
}

function generateTimelineForecast(urgency: string): string {
    if (urgency === 'urgent') {
        return `
## Timeline & Forecast

**Immediate (1-2 weeks):** Focus on emergency remedies and stabilization. Begin all recommended practices immediately.

**Short-term (1-3 months):** Expect initial shifts and breakthrough moments. Maintain consistency with remedies.

**Medium-term (3-6 months):** Significant transformation visible. New patterns firmly established.

**Long-term (6-12 months):** Complete resolution and new level of mastery achieved.
`;
    }

    return `
## Timeline & Forecast

**Foundation Phase (Weeks 1-4):** Establish daily practices and begin implementation of remedies.

**Growth Phase (Months 2-3):** Notice subtle shifts and increasing clarity. Momentum builds.

**Transformation Phase (Months 4-6):** Major breakthroughs and visible progress manifest.

**Mastery Phase (Months 7-12):** Full integration and sustained positive change. New normal established.
`;
}

function getDosAndDonts(type: string): { dos: string[]; donts: string[] } {
    return {
        dos: [
            'Maintain regular spiritual practice',
            'Stay positive and practice affirmations',
            'Trust divine timing and surrender outcomes',
            'Take inspired action consistently',
            'Seek support when needed',
            'Celebrate progress, however small',
            'Practice self-care and compassion'
        ],
        donts: [
            'Don\'t skip recommended remedies',
            'Avoid negative self-talk and limiting beliefs',
            'Don\'t compare your journey to others',
            'Avoid rushing the process or forcing outcomes',
            'Don\'t ignore intuitive guidance',
            'Avoid toxic people and situations',
            'Don\'t give up before breakthrough happens'
        ]
    };
}

function getLuckyElements(type: string, birthDate?: Date): {
    colors: string[];
    numbers: number[];
    directions: string[];
    days: string[];
} {
    // Could be enhanced with actual birth date calculation
    const elements: Record<string, any> = {
        health: {
            colors: ['Green', 'White', 'Light Blue'],
            numbers: [3, 6, 9],
            directions: ['East', 'Northeast'],
            days: ['Monday', 'Wednesday']
        },
        wealth: {
            colors: ['Yellow', 'Gold', 'Purple'],
            numbers: [5, 8, 6],
            directions: ['North', 'Southeast'],
            days: ['Thursday', 'Friday']
        },
        relationships: {
            colors: ['Pink', 'Red', 'White'],
            numbers: [2, 6, 9],
            directions: ['Southwest', 'West'],
            days: ['Friday', 'Monday']
        },
        career: {
            colors: ['Blue', 'Black', 'Grey'],
            numbers: [1, 8, 10],
            directions: ['North', 'West'],
            days: ['Saturday', 'Tuesday']
        },
        spiritual: {
            colors: ['Purple', 'White', 'Indigo'],
            numbers: [7, 11, 12],
            directions: ['Northeast', 'North'],
            days: ['Sunday', 'Thursday']
        }
    };

    return elements[type] || {
        colors: ['White', 'Gold', 'Purple'],
        numbers: [1, 3, 7],
        directions: ['East', 'North'],
        days: ['Sunday', 'Monday']
    };
}
