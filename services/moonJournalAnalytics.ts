export interface MoonJournalAnalytics {
    moodPatterns: {
        mostCommonMood: string;
        moodDistribution: { mood: string; count: number; percentage: number }[];
        moodTrends: string;
    };
    moonCorrelations: {
        bestPhases: { phase: string; avgMood: number; avgEnergy: number }[];
        worstPhases: { phase: string; avgMood: number; avgEnergy: number }[];
        insights: string;
    };
    energyAnalysis: {
        averageEnergy: number;
        energyTrend: string;
        peakDays: string[];
        lowDays: string[];
    };
    emotionalInsights: string;
    predictiveAnalysis: string;
    recommendations: string[];
    chartData: {
        moodOverTime: any[];
        moonPhaseImpact: any[];
        energyPattern: any[];
    };
}

export function analyzeMoodEntries(entries: any[]): MoonJournalAnalytics {
    if (!entries || entries.length === 0) {
        return getDefaultAnalytics();
    }

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) =>
        new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );

    // 1. MOOD PATTERNS
    const moodCounts: Record<string, number> = {};
    entries.forEach(e => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    const moodDistribution = Object.entries(moodCounts)
        .map(([mood, count]) => ({
            mood,
            count,
            percentage: Math.round((count / entries.length) * 100)
        }))
        .sort((a, b) => b.count - a.count);

    const mostCommonMood = moodDistribution[0]?.mood || 'balanced';

    // Mood trend analysis
    const recentMoods = sortedEntries.slice(-7).map(e => e.mood_intensity);
    const avgRecent = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    const olderMoods = sortedEntries.slice(0, 7).map(e => e.mood_intensity);
    const avgOlder = olderMoods.length > 0 ? olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length : avgRecent;

    const moodTrends = avgRecent > avgOlder + 1 ? 'improving' :
        avgRecent < avgOlder - 1 ? 'declining' : 'stable';

    // 2. MOON PHASE CORRELATIONS
    const phaseData: Record<string, { moods: number[]; energies: number[] }> = {};

    entries.forEach(e => {
        if (e.moon_phase) {
            if (!phaseData[e.moon_phase]) {
                phaseData[e.moon_phase] = { moods: [], energies: [] };
            }
            phaseData[e.moon_phase].moods.push(e.mood_intensity);
            phaseData[e.moon_phase].energies.push(e.energy_level);
        }
    });

    const phaseAverages = Object.entries(phaseData).map(([phase, data]) => ({
        phase,
        avgMood: data.moods.reduce((a, b) => a + b, 0) / data.moods.length,
        avgEnergy: data.energies.reduce((a, b) => a + b, 0) / data.energies.length,
        count: data.moods.length
    })).filter(p => p.count >= 2); // At least 2 entries per phase

    const bestPhases = phaseAverages
        .sort((a, b) => (b.avgMood + b.avgEnergy) - (a.avgMood + a.avgEnergy))
        .slice(0, 3);

    const worstPhases = phaseAverages
        .sort((a, b) => (a.avgMood + a.avgEnergy) - (b.avgMood + b.avgEnergy))
        .slice(0, 3);

    // 3. ENERGY ANALYSIS
    // Find this section around line 100-110 and replace it:

    // 3. ENERGY ANALYSIS
    const energyLevels = entries.map(e => e.energy_level);
    const averageEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;

    const recentEnergy = sortedEntries.slice(-7).map(e => e.energy_level);
    const avgRecentEnergy = recentEnergy.reduce((a, b) => a + b, 0) / recentEnergy.length;
    const energyTrend = avgRecentEnergy > averageEnergy + 0.5 ? 'increasing' :
        avgRecentEnergy < averageEnergy - 0.5 ? 'decreasing' : 'stable';

    // ✅ FIX: Get unique peak and low energy days
    const sortedByEnergy = [...sortedEntries].sort((a, b) => b.energy_level - a.energy_level);

    // Get unique days for peak energy
    const peakDaysSet = new Set<string>();
    sortedByEnergy.slice(0, Math.min(10, sortedByEnergy.length)).forEach(e => {
        const dayName = new Date(e.entry_date).toLocaleDateString('en-US', { weekday: 'long' });
        peakDaysSet.add(dayName);
    });
    const peakDays = Array.from(peakDaysSet).slice(0, 3);

    // Get unique days for low energy
    const lowDaysSet = new Set<string>();
    sortedByEnergy.slice(-Math.min(10, sortedByEnergy.length)).forEach(e => {
        const dayName = new Date(e.entry_date).toLocaleDateString('en-US', { weekday: 'long' });
        lowDaysSet.add(dayName);
    });
    const lowDays = Array.from(lowDaysSet).slice(0, 3);

    // 4. EMOTIONAL INSIGHTS
    const emotionalInsights = generateEmotionalInsights(
        mostCommonMood,
        moodTrends,
        averageEnergy,
        bestPhases[0]?.phase
    );

    // 5. PREDICTIVE ANALYSIS
    const predictiveAnalysis = generatePredictiveAnalysis(
        moodTrends,
        energyTrend,
        bestPhases,
        worstPhases
    );

    // 6. RECOMMENDATIONS
    const recommendations = generateRecommendations(
        mostCommonMood,
        averageEnergy,
        bestPhases,
        worstPhases
    );

    // 7. CHART DATA
    const chartData = {
        moodOverTime: sortedEntries.map(e => ({
            date: new Date(e.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            mood: e.mood_intensity,
            energy: e.energy_level,
            phase: e.moon_phase
        })),
        moonPhaseImpact: phaseAverages.map(p => ({
            phase: p.phase,
            mood: Math.round(p.avgMood * 10) / 10,
            energy: Math.round(p.avgEnergy * 10) / 10
        })),
        energyPattern: sortedEntries.map(e => ({
            date: new Date(e.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            energy: e.energy_level,
            moon: e.moon_phase_percentage || 0
        }))
    };

    return {
        moodPatterns: {
            mostCommonMood,
            moodDistribution,
            moodTrends
        },
        moonCorrelations: {
            bestPhases,
            worstPhases,
            insights: `Your mood shows ${phaseAverages.length > 0 ? 'clear correlation' : 'emerging patterns'} with lunar cycles.`
        },
        energyAnalysis: {
            averageEnergy: Math.round(averageEnergy * 10) / 10,
            energyTrend,
            peakDays,
            lowDays
        },
        emotionalInsights,
        predictiveAnalysis,
        recommendations,
        chartData
    };
}

function generateEmotionalInsights(
    commonMood: string,
    trend: string,
    avgEnergy: number,
    bestPhase?: string
): string {
    return `
## Your Emotional Landscape

Based on your journal entries, your predominant emotional state is **${commonMood}**, which reflects your current life journey. Your mood patterns are **${trend}**, indicating ${trend === 'improving' ? 'positive momentum in your emotional well-being' :
            trend === 'declining' ? 'a period of emotional challenge that requires attention' :
                'emotional stability and balance'
        }.

Your average energy level of **${avgEnergy.toFixed(1)}/10** suggests ${avgEnergy >= 7 ? 'robust vitality and strong life force energy' :
            avgEnergy >= 5 ? 'moderate energy reserves that could benefit from intentional restoration' :
                'depleted energy requiring immediate self-care and rest'
        }.

${bestPhase ? `You experience peak emotional states during the **${bestPhase}** phase, suggesting this is your natural power time for important decisions and manifestations.` : ''}

### Emotional Pattern Recognition

Your journal reveals cyclical patterns in your emotional experience. These patterns are not random but are deeply connected to:

- **Lunar rhythms** affecting your subconscious mind
- **Personal biorhythms** influencing your energy levels
- **Karmic cycles** presenting opportunities for growth
- **Seasonal energies** impacting your vitality

Understanding these patterns empowers you to work with your natural rhythms rather than against them.
`;
}

function generatePredictiveAnalysis(
    moodTrend: string,
    energyTrend: string,
    bestPhases: any[],
    worstPhases: any[]
): string {
    const nextBestPhase = bestPhases[0]?.phase || 'Full Moon';
    const nextChallengingPhase = worstPhases[0]?.phase || 'New Moon';

    return `
## Predictive Insights & Future Outlook

### Short-Term Forecast (Next 30 Days)

Based on your emotional patterns and current trajectory:

**Mood Trajectory:** Your emotional state is currently on a **${moodTrend}** trend. ${moodTrend === 'improving' ? 'Continue your current practices to maintain this positive momentum. This is an excellent time for new beginnings and setting intentions.' :
            moodTrend === 'declining' ? 'Prioritize self-care and emotional support. This challenging period is temporary and offers deep opportunities for growth.' :
                'Your emotional stability provides a solid foundation for pursuing your goals with confidence.'
        }

**Energy Forecast:** Your energy levels are **${energyTrend}**. ${energyTrend === 'increasing' ? 'Harness this growing vitality for important projects and physical activities.' :
            energyTrend === 'decreasing' ? 'Honor your need for rest and restoration. Avoid overcommitting during this regenerative phase.' :
                'Maintain your current energy management practices for continued balance.'
        }

### Lunar Cycle Optimization

**Power Phases:** Mark your calendar for ${nextBestPhase} periods - these are your optimal times for:
- Making important decisions
- Starting new projects
- Deep manifestation work
- Social engagement
- Physical activity

**Rest Phases:** During ${nextChallengingPhase} periods, focus on:
- Introspection and reflection
- Gentle self-care practices
- Processing emotions
- Rest and recuperation
- Completion of existing projects

### 90-Day Outlook

If you maintain current patterns and implement recommended practices, expect:
- Gradual improvement in emotional resilience
- Better alignment with natural rhythms
- Increased self-awareness
- Enhanced ability to navigate challenging emotions
- Deeper connection to intuitive guidance
`;
}

function generateRecommendations(
    commonMood: string,
    avgEnergy: number,
    bestPhases: any[],
    worstPhases: any[]
): string[] {
    const recommendations: string[] = [];

    // Mood-based recommendations
    if (commonMood === 'anxious' || commonMood === 'sad') {
        recommendations.push('Practice daily grounding meditation to calm your nervous system');
        recommendations.push('Engage in gentle physical movement like yoga or walking in nature');
        recommendations.push('Consider speaking with a mental health professional for additional support');
    } else if (commonMood === 'happy' || commonMood === 'inspired') {
        recommendations.push('Channel this positive energy into creative projects and goal-setting');
        recommendations.push('Share your joy with others through acts of service or connection');
    }

    // Energy-based recommendations
    if (avgEnergy < 5) {
        recommendations.push('Prioritize 7-9 hours of quality sleep each night');
        recommendations.push('Evaluate your diet and ensure adequate nutrition and hydration');
        recommendations.push('Set healthy boundaries to preserve your energy reserves');
    } else if (avgEnergy >= 8) {
        recommendations.push('Use your high energy for ambitious projects and physical challenges');
        recommendations.push('Balance activity with rest to maintain sustainable vitality');
    }

    // Moon phase recommendations
    if (bestPhases.length > 0) {
        recommendations.push(`Schedule important activities during ${bestPhases[0].phase} for optimal outcomes`);
    }

    if (worstPhases.length > 0) {
        recommendations.push(`Use ${worstPhases[0].phase} for rest, reflection, and gentle self-care`);
    }

    // Universal recommendations
    recommendations.push('Continue journaling daily to deepen self-awareness');
    recommendations.push('Work with crystals aligned to your moon phase for energetic support');
    recommendations.push('Practice gratitude rituals during Full Moon for amplified manifestation');
    recommendations.push('Set intentions during New Moon for new beginnings and fresh starts');

    return recommendations;
}

function getDefaultAnalytics(): MoonJournalAnalytics {
    return {
        moodPatterns: {
            mostCommonMood: 'balanced',
            moodDistribution: [],
            moodTrends: 'stable'
        },
        moonCorrelations: {
            bestPhases: [],
            worstPhases: [],
            insights: 'Continue journaling to discover your patterns'
        },
        energyAnalysis: {
            averageEnergy: 5,
            energyTrend: 'stable',
            peakDays: [],
            lowDays: []
        },
        emotionalInsights: 'Start your journaling journey to unlock insights',
        predictiveAnalysis: 'More entries needed for predictions',
        recommendations: ['Journal daily for best results'],
        chartData: {
            moodOverTime: [],
            moonPhaseImpact: [],
            energyPattern: []
        }
    };
}
