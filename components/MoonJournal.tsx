import React, { useState, useEffect, useRef } from 'react';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import { calculateMoonPhase } from '../services/moonPhaseService';
import Button from './shared/Button';
import SmartBackButton from './shared/SmartBackButton';
import FullReport from './FullReport';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import { supabase } from '../services/supabaseClient';
import { cloudManager } from '../services/cloudManager';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy', color: 'bg-yellow-500' },
  { emoji: '😌', label: 'Calm', value: 'calm', color: 'bg-blue-500' },
  { emoji: '😔', label: 'Sad', value: 'sad', color: 'bg-indigo-500' },
  { emoji: '😰', label: 'Anxious', value: 'anxious', color: 'bg-orange-500' },
  { emoji: '😤', label: 'Angry', value: 'angry', color: 'bg-red-500' },
  { emoji: '🥰', label: 'Loved', value: 'loved', color: 'bg-pink-500' },
  { emoji: '😴', label: 'Tired', value: 'tired', color: 'bg-gray-500' },
  { emoji: '✨', label: 'Inspired', value: 'inspired', color: 'bg-purple-500' },
];

const MoonJournal: React.FC = () => {
  // Form state
  const [mood, setMood] = useState('');
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [intentions, setIntentions] = useState('');

  // System state
  const [moonData, setMoonData] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [servicePrice, setServicePrice] = useState(49);
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const { db } = useDb();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { openPayment } = usePayment();

  const reportImage = db.image_assets?.find((a: any) => a.id === 'report_bg_moon')?.path || 
    "https://images.unsplash.com/photo-1509803874385-db7c23652552?q=80&w=800";

  // Fetch service price
  useEffect(() => {
    fetchServicePrice();
  }, []);

  const fetchServicePrice = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('price')
        .eq('name', 'Moon Journal Analytics')
        .eq('status', 'active')
        .single();

      if (!error && data) {
        setServicePrice(data.price);
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    }
  };

  // Calculate moon phase
  useEffect(() => {
    const today = new Date();
    const data = calculateMoonPhase(today);
    setMoonData(data);
  }, []);

  // Auto-scroll when paid
  useEffect(() => {
    if (isPaid && reportRef.current) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
    }
  }, [isPaid]);

  const validateForm = () => {
    if (!mood) {
      alert('❌ Please select your mood');
      return false;
    }
    if (!content.trim()) {
      alert('❌ Please write your journal entry');
      return false;
    }
    if (!gratitude.trim()) {
      alert('❌ Please share what you\'re grateful for');
      return false;
    }
    if (!intentions.trim()) {
      alert('❌ Please set your intentions');
      return false;
    }
    return true;
  };

  const generateReport = () => {
    const moodEmoji = MOODS.find(m => m.value === mood)?.emoji || '😐';
    const moodLabel = MOODS.find(m => m.value === mood)?.label || mood;

    return `
# Moon Journal Insights 🌙

## Your Current State

**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

**Moon Phase:** ${moonData?.phaseName || 'Unknown'} ${moonData?.phaseEmoji || '🌙'}

**Zodiac Position:** ${moonData?.zodiacSign || 'Unknown'}

**Lunar Illumination:** ${moonData?.percentage?.toFixed(1) || 0}%

---

## Emotional Snapshot

### Your Mood: ${moodEmoji} ${moodLabel}

**Intensity Level:** ${moodIntensity}/10 ${moodIntensity >= 8 ? '(Very Strong)' : moodIntensity >= 5 ? '(Moderate)' : '(Mild)'}

**Energy Level:** ${energyLevel}/10 ${energyLevel >= 7 ? '⚡ High Energy' : energyLevel >= 4 ? '⚖️ Balanced' : '😴 Low Energy'}

Your emotional state of **${moodLabel}** at an intensity of ${moodIntensity}/10 reflects your current alignment with the cosmic energies. ${
  moodIntensity >= 7 ? 'This strong emotional presence indicates deep processing and transformation.' :
  moodIntensity >= 4 ? 'This moderate level suggests emotional balance and awareness.' :
  'This gentle emotional state allows for inner reflection and subtle shifts.'
}

---

## Lunar Influence Analysis

### Current Moon Phase: ${moonData?.phaseName}

${generatePhaseInsight(moonData?.phaseName, mood, energyLevel)}

### Your Energy Pattern

With an energy level of ${energyLevel}/10 during the ${moonData?.phaseName} phase, you are ${
  energyLevel >= 7 ? 'experiencing heightened vitality and life force. This is an excellent time for action, manifestation, and pursuing your goals with confidence.' :
  energyLevel >= 4 ? 'in a balanced state. Use this equilibrium wisely by focusing on both inner work and outer activities.' :
  'in a phase of conservation and restoration. Honor your need for rest, reflection, and gentle self-care.'
}

### Emotional-Lunar Correlation

Your ${moodLabel} mood during the ${moonData?.phaseName} phase suggests:

${generateMoodPhaseCorrelation(mood, moonData?.phaseName)}

---

## Your Sacred Reflections

### 🙏 Gratitude

${gratitude}

**Insight:** Gratitude is a powerful manifestation tool. By acknowledging these blessings during the ${moonData?.phaseName} phase, you amplify their energy and attract more abundance.

### 🎯 Intentions

${intentions}

**Guidance:** These intentions align with the ${moonData?.phaseName} energy. ${
  moonData?.phaseName?.includes('New') ? 'This is the perfect time for setting new intentions and planting seeds for future growth.' :
  moonData?.phaseName?.includes('Full') ? 'Use the Full Moon\'s illuminating power to clarify and energize these intentions.' :
  moonData?.phaseName?.includes('Waxing') ? 'The growing moon supports building momentum toward these goals.' :
  'The waning moon helps release obstacles standing in the way of these intentions.'
}

---

## Personalized Recommendations

### For Your Current Mood (${moodLabel})

${generateMoodRecommendations(mood)}

### For This Moon Phase (${moonData?.phaseName})

${generatePhaseRecommendations(moonData?.phaseName)}

### Energy Management

${generateEnergyRecommendations(energyLevel)}

---

## Astrological Guidance

### Moon in ${moonData?.zodiacSign}

${generateZodiacGuidance(moonData?.zodiacSign, mood)}

### Best Practices for Today

1. **Morning Ritual:** ${getMorningRitual(moonData?.phaseName)}
2. **Emotional Processing:** ${getEmotionalPractice(mood)}
3. **Energy Work:** ${getEnergyPractice(energyLevel)}
4. **Evening Reflection:** ${getEveningPractice(moonData?.phaseName)}

---

## Your Lunar Forecast

### Next 7 Days

${generateWeeklyForecast(moonData?.phaseName)}

### Power Times

${getPowerTimes(moonData?.phaseName, moonData?.zodiacSign)}

---

## Sacred Practices

### Crystals for You

Based on your ${moodLabel} mood and the ${moonData?.phaseName} phase:

${getCrystalRecommendations(mood, moonData?.phaseName)}

### Affirmations

${getAffirmations(mood, moonData?.phaseName)}

### Journal Prompts for Deeper Reflection

${getJournalPrompts(mood, moonData?.phaseName)}

---

## Conclusion

Your journey through the ${moonData?.phaseName} phase with a ${moodLabel} emotional state is uniquely yours. Honor this experience, embrace the cosmic support available to you, and remember that every phase of the moon—and every emotion—serves your highest growth.

Continue journaling to track patterns and deepen your connection with lunar wisdom.

*This personalized report is generated based on your current emotional state and the moon's position at ${new Date().toLocaleString()}.*
`;
  };

  const saveToDatabase = async (report: string) => {
    try {
      const today = new Date();

      // 1. Save journal entry
      const { data: entryData, error: entryError } = await supabase
        .from('mood_entries')
        .insert([{
          user_id: user?.id,
          entry_date: today.toISOString().split('T')[0],
          entry_time: today.toTimeString().split(' ')[0],
          mood,
          mood_intensity: moodIntensity,
          energy_level: energyLevel,
          moon_phase: moonData?.phaseName,
          moon_phase_percentage: moonData?.percentage,
          zodiac_sign: moonData?.zodiacSign,
          content,
          gratitude,
          intentions,
          is_private: true
        }])
        .select()
        .single();

      if (entryError) throw entryError;

      // 2. Create reading record
      const { data: readingRecord, error: readingError } = await supabase
        .from('readings')
        .insert([{
          user_id: user?.id,
          type: 'moon-journal-analytics',
          title: 'Moon Journal Insights',
          subtitle: `${moonData?.phaseName} • ${new Date().toLocaleDateString()}`,
          content: report,
          is_paid: true,
          meta_data: {
            moon_phase: moonData?.phaseName,
            mood: mood,
            mood_intensity: moodIntensity,
            energy_level: energyLevel
          }
        }])
        .select()
        .single();

      if (readingError) throw readingError;

      // 3. Save payment transaction
      const { error: txnError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user?.id,
          service_type: 'moon-journal-analytics',
          service_title: 'Moon Journal Insights',
          amount: servicePrice,
          currency: 'INR',
          status: 'success',
          payment_method: 'upi',
          payment_provider: 'manual',
          reading_id: readingRecord.id,
          order_id: `JOURNAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            moon_phase: moonData?.phaseName,
            analysis_date: new Date().toISOString()
          }
        }]);

      if (txnError) throw txnError;

      return readingRecord.id;

    } catch (error) {
      console.error('❌ Database save error:', error);
      throw error;
    }
  };

  const handleUnlockInsights = () => {
    if (!validateForm()) return;

    const report = generateReport();
    setReportData(report);

    openPayment(
      async () => {
        console.log('✅ Payment success! Saving data...');
        setIsSaving(true);

        try {
          await saveToDatabase(report);
          setIsPaid(true);
          console.log('✅ All data saved successfully!');

          setTimeout(() => {
            if (reportRef.current) {
              reportRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 500);

        } catch (error) {
          console.error('❌ Error during save:', error);
          alert('Failed to save data. Please contact support.');
        } finally {
          setIsSaving(false);
        }
      },
      'Moon Journal Insights',
      servicePrice
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <SmartBackButton label={t('backToHome')} className="mb-6" />

      {isSaving && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250]">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-900 p-10 rounded-3xl shadow-2xl border border-purple-500/30 max-w-md text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">Generating Your Insights</h3>
            <p className="text-purple-300 mb-2 text-lg">Analyzing lunar energies...</p>
            <p className="text-purple-500 text-sm">This may take a moment 🌙</p>
          </div>
        </div>
      )}

      {/* JOURNAL FORM */}
      <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black/60 rounded-xl shadow-2xl border border-purple-500/30 backdrop-blur-md p-6 md:p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-cinzel font-bold text-purple-300 mb-2">
            🌙 Moon Journal
          </h2>
          <p className="text-purple-100/70 font-lora italic">
            Discover your lunar insights and cosmic guidance
          </p>
          
          {moonData && (
            <div className="mt-4 inline-block bg-purple-900/30 px-6 py-3 rounded-full border border-purple-500/30">
              <span className="text-2xl mr-2">{moonData.phaseEmoji}</span>
              <span className="text-purple-200 font-semibold">{moonData.phaseName}</span>
              <span className="text-purple-300/70 text-sm ml-2">• {moonData.zodiacSign}</span>
            </div>
          )}
        </div>

        {/* Mood Selection */}
        <div className="mb-6">
          <label className="block text-purple-300 font-semibold mb-3 text-sm uppercase tracking-wider">
            How are you feeling? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                  ${mood === m.value 
                    ? `${m.color} border-white shadow-lg scale-105` 
                    : 'bg-gray-900/50 border-purple-500/20 hover:border-purple-500/50'
                  }
                `}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className={`text-xs ${mood === m.value ? 'text-white font-bold' : 'text-purple-300'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-purple-300 font-semibold mb-2 text-sm">
              Mood Intensity: <span className="text-purple-400 text-lg">{moodIntensity}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodIntensity}
              onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
              className="w-full h-3 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-300 font-semibold mb-2 text-sm">
              Energy Level: <span className="text-purple-400 text-lg">{energyLevel}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full h-3 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Journal Content */}
        <div className="mb-6">
          <label className="block text-purple-300 font-semibold mb-2 text-sm">
            Journal Entry <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your day, thoughts, feelings..."
            rows={6}
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-purple-400/30 font-lora leading-relaxed"
          />
        </div>

        {/* Gratitude */}
        <div className="mb-6">
          <label className="block text-purple-300 font-semibold mb-2 text-sm">
            🙏 Gratitude <span className="text-red-400">*</span>
          </label>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="What are you grateful for today?"
            rows={3}
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-purple-400/30 font-lora"
          />
        </div>

        {/* Intentions */}
        <div className="mb-8">
          <label className="block text-purple-300 font-semibold mb-2 text-sm">
            🎯 Intentions <span className="text-red-400">*</span>
          </label>
          <textarea
            value={intentions}
            onChange={(e) => setIntentions(e.target.value)}
            placeholder="What are your intentions?"
            rows={3}
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-purple-400/30 font-lora"
          />
        </div>

        {/* Unlock Button */}
        <Button
          onClick={handleUnlockInsights}
          disabled={!mood || !content.trim() || !gratitude.trim() || !intentions.trim()}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-pink-400/50 shadow-lg py-4 text-lg font-cinzel tracking-wider"
        >
          🔓 Unlock Moon Insights - ₹{servicePrice}
        </Button>

        <p className="text-center text-purple-400/70 text-xs mt-3">
          <span className="text-red-400">*</span> All fields are required
        </p>
      </div>

      {/* REPORT */}
      {reportData && isPaid && (
        <div ref={reportRef} className="mt-8 scroll-mt-24">
          <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black/60 rounded-xl shadow-2xl border border-purple-500/30 backdrop-blur-md p-8">
            <FullReport
              reading={reportData}
              category="moon-journal-analytics"
              title="Moon Journal Insights"
              subtitle={`${moonData?.phaseName} • ${new Date().toLocaleDateString()}`}
              imageUrl={cloudManager.resolveImage(reportImage)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for report generation
function generatePhaseInsight(phase: string, mood: string, energy: number): string {
  // Implementation details...
  return `The ${phase} phase influences your ${mood} mood...`;
}

function generateMoodPhaseCorrelation(mood: string, phase: string): string {
  return `Your ${mood} state during ${phase} indicates...`;
}

function generateMoodRecommendations(mood: string): string {
  const recommendations: Record<string, string> = {
    happy: '- Harness this positive energy for creative projects\n- Share your joy with others\n- Practice gratitude meditation',
    sad: '- Allow yourself to feel and process emotions\n- Gentle self-care and rest\n- Connect with supportive loved ones',
    anxious: '- Grounding meditation and breathwork\n- Physical movement to release tension\n- Limit stimulants like caffeine',
    // Add more...
  };
  return recommendations[mood] || '- Practice mindfulness\n- Stay hydrated\n- Get adequate rest';
}

function generatePhaseRecommendations(phase: string): string {
  if (phase?.includes('New')) return '- Set intentions\n- Plant seeds for new beginnings\n- Vision board creation';
  if (phase?.includes('Full')) return '- Release what no longer serves\n- Gratitude rituals\n- Manifestation work';
  return '- Observe and reflect\n- Gentle progress\n- Trust the process';
}

function generateEnergyRecommendations(energy: number): string {
  if (energy >= 7) return '- Channel energy into productivity\n- Physical exercise\n- Tackle challenging tasks';
  if (energy >= 4) return '- Balanced activities\n- Moderate exercise\n- Self-paced work';
  return '- Prioritize rest\n- Gentle movement\n- Early bedtime';
}

function generateZodiacGuidance(sign: string, mood: string): string {
  return `The Moon in ${sign} amplifies ${mood} emotions, encouraging you to...`;
}

function getMorningRitual(phase: string): string {
  return phase?.includes('New') ? 'Set intentions for the day' : 'Gratitude meditation';
}

function getEmotionalPractice(mood: string): string {
  return `Journaling about ${mood} feelings`;
}

function getEnergyPractice(energy: number): string {
  return energy >= 7 ? 'Dynamic movement' : 'Restorative yoga';
}

function getEveningPractice(phase: string): string {
  return 'Reflection and moon gazing';
}

function generateWeeklyForecast(phase: string): string {
  return `The coming week will bring shifts in lunar energy...`;
}

function getPowerTimes(phase: string, sign: string): string {
  return `Best times for manifestation during ${phase} in ${sign}...`;
}

function getCrystalRecommendations(mood: string, phase: string): string {
  return `- Moonstone for lunar connection\n- Clear Quartz for clarity\n- Amethyst for peace`;
}

function getAffirmations(mood: string, phase: string): string {
  return `- I am aligned with lunar wisdom\n- I honor my emotions\n- I trust divine timing`;
}

function getJournalPrompts(mood: string, phase: string): string {
  return `1. What is the moon teaching me today?\n2. How can I honor my ${mood} feelings?\n3. What am I ready to release?`;
}

export default MoonJournal;
