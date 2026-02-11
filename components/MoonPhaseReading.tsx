
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { cloudManager } from '../services/cloudManager';
import SmartBackButton from './shared/SmartBackButton';
import { SmartDatePicker } from './SmartAstroInputs';
import { supabase } from '../services/supabaseClient';
import { calculateMoonPhase, MoonPhaseData } from '../services/moonPhaseService';

const MoonPhaseReading: React.FC = () => {
    const [birthDate, setBirthDate] = useState<string>('');
    const [moonData, setMoonData] = useState<MoonPhaseData | null>(null);
    const [fullReading, setFullReading] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [servicePrice, setServicePrice] = useState(49);
    const [readingId, setReadingId] = useState<string | null>(null);

    const reportRef = useRef<HTMLDivElement>(null);

    const { t, language } = useTranslation();
    const { openPayment } = usePayment();
    const { user } = useAuth();
    const { db } = useDb();

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
                .eq('name', 'Moon Phase Reading')
                .eq('status', 'active')
                .single();

            if (!error && data) {
                setServicePrice(data.price);
                console.log('✅ Moon Phase price loaded:', data.price);
            }
        } catch (err) {
            console.error('Error fetching price:', err);
        }
    };

    // Auto-scroll when paid
    useEffect(() => {
        if (isPaid && reportRef.current) {
            setTimeout(() => {
                reportRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }, [isPaid]);

    const generateReadingKey = (date: string): string => {
        const key = `moon_${user?.id || 'anon'}_${date}`;
        return key.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    // ✅ FIX: Corrected the mangled template literal and expression syntax
    const generateFullReading = (data: MoonPhaseData): string => {
        return `
# ${data.phaseName} ${data.phaseEmoji} - Your Lunar Blueprint

## Your Celestial Identity

Born under the **${data.phaseName}** at **${data.percentage.toFixed(1)}% illumination**, your soul carries the archetype of **${data.personalityType}**. The moon was positioned at **${data.angle.toFixed(1)}°** in the zodiac sign of **${data.zodiacSign}**, within the sacred lunar mansion of **${data.nakshatra}** Nakshatra.

## Personality Essence

${data.traits.map(t => `**${t}**`).join(' • ')}

Your lunar personality is characterized by a unique blend of energies that shape how you navigate the world. ${data.emotionalNature}

## Core Strengths

${data.strengths.map((s, i) => `${i + 1}. **${s}**`).join('\n')}

These innate gifts are your spiritual superpowers. Embrace them fully, for they are the tools through which your soul expresses its highest potential.

## Growth Challenges

${data.challenges.map((c, i) => `${i + 1}. *${c}*`).join('\n')}

These challenges are not obstacles but invitations for growth. Each one represents a doorway to deeper self-mastery and spiritual evolution.

## Your Life Purpose

**${data.lifePurpose}**

This is not merely a career path or goal—it is the essence of why your soul chose to incarnate at this particular moment in cosmic time.

## Spiritual Path & Soul Mission

**Spiritual Path:** ${data.spiritualPath}
**Karmic Lesson:** ${data.karmicLesson}
**Soul Mission:** ${data.soulMission}

## Emotional & Intuitive Nature

Your emotional landscape is: **${data.emotionalNature}**

### Intuitive Gifts
${data.intuitiveGifts.map(g => `• ${g}`).join('\n')}

## Relationships & Love

**${data.relationshipStyle}**

Your moon phase influences how you give and receive love, the types of partners you attract, and the lessons you're meant to learn through intimate connections.

## Career & Life Work

**${data.careerGuidance}**

Your lunar energy naturally aligns with certain vocations and life paths. Trust these inclinations—they are cosmic breadcrumbs leading you toward your dharma.

## Lucky Elements & Power Tools

### Colors
${data.luckyElements.colors.map(c => `• ${c}`).join('\n')}

### Numbers
${data.luckyElements.numbers.join(', ')}

### Gemstones
${data.luckyElements.gemstones.map(g => `• ${g}`).join('\n')}

### Power Days
${data.luckyElements.days.map(d => `• ${d}`).join('\n')}

## Manifestation Power Index

Your lunar birth phase grants you specific manifestation abilities across different life areas:

- **Wealth & Abundance:** ${data.manifestationPower.wealth}%
- **Love & Relationships:** ${data.manifestationPower.love}%
- **Career & Purpose:** ${data.manifestationPower.career}%
- **Health & Vitality:** ${data.manifestationPower.health}%
- **Spiritual Growth:** ${data.manifestationPower.spiritual}%

## Sacred Practices for Your Moon Phase

### Daily Rituals
1. **Morning:** Meditate during the hour after sunrise, visualizing yourself bathed in ${data.phaseName} moonlight.
2. **Evening:** Journal about your emotional experiences and intuitive insights.
3. **Weekly:** Perform a ritual on your power day (${data.luckyElements.days[0]}).

### Moon Phase Alignment
Work **with** your birth moon phase whenever it returns in the monthly lunar cycle. This is when your manifestation power is at its peak.

### Crystal Grid
Create a crystal grid using ${data.luckyElements.gemstones[0]}, ${data.luckyElements.gemstones[1]}, and ${data.luckyElements.gemstones[2]} to amplify your natural lunar energies.

## Closing Wisdom

Born under the ${data.phaseName}, you are a child of both light and shadow, carrying within you the wisdom of lunar cycles and the power of cosmic timing. Your journey is unique, your path sacred, and your purpose divinely ordained.

Remember: The moon's phases teach us that all of life is cyclical. Honor your own rhythms, trust your intuitive nature, and know that you are exactly where you need to be on your soul's evolutionary journey.

**Blessed be your path, Lunar Soul.** 🌙✨

---

*This reading is based on Vedic lunar astrology (Chandra Jyotish) and Western lunar phase personality research. May it serve as a guide on your journey of self-discovery and spiritual awakening.*
        `;
    };

    const saveToDatabase = async (data: MoonPhaseData, reading: string) => {
        try {
            if (!supabase) return null;

            const readingKey = generateReadingKey(birthDate);

            // 1. Create reading record
            const { data: readingRecord, error: readingError } = await supabase
                .from('readings')
                .insert([{
                    user_id: user?.id || null,
                    type: 'moon-phase',
                    title: `Moon Phase Reading - ${data.phaseName}`,
                    subtitle: data.personalityType,
                    content: reading,
                    is_paid: isPaid,
                    meta_data: {
                        reading_key: readingKey,
                        moon_phase: data.phaseName,
                        zodiac_sign: data.zodiacSign,
                        nakshatra: data.nakshatra
                    }
                }])
                .select()
                .single();

            if (readingError) {
                console.error('❌ Reading save error:', readingError);
                return null;
            }

            // 2. Save to moon_phase_cache
            const { data: cache, error: cacheError } = await supabase
                .from('moon_phase_cache')
                .upsert([{
                    reading_key: readingKey,
                    user_id: user?.id || null,
                    birth_date: birthDate,
                    moon_phase_name: data.phaseName,
                    moon_phase_percentage: data.percentage,
                    moon_phase_angle: data.angle,
                    zodiac_sign: data.zodiacSign,
                    nakshatra: data.nakshatra,
                    personality_type: data.personalityType,
                    traits: data.traits,
                    strengths: data.strengths,
                    challenges: data.challenges,
                    life_purpose: data.lifePurpose,
                    spiritual_path: data.spiritualPath,
                    karmic_lesson: data.karmicLesson,
                    soul_mission: data.soulMission,
                    manifestation_power: data.manifestationPower,
                    emotional_nature: data.emotionalNature,
                    intuitive_gifts: data.intuitiveGifts,
                    relationship_style: data.relationshipStyle,
                    career_guidance: data.careerGuidance,
                    full_reading: reading,
                    lucky_elements: data.luckyElements,
                    reading_id: readingRecord.id,
                    is_paid: isPaid,
                    language: language
                }], { onConflict: 'reading_key' })
                .select()
                .single();

            if (cacheError) {
                console.error('❌ Cache save error:', cacheError);
            } else {
                console.log('✅ Moon phase cache saved:', cache);
            }

            console.log('✅ Moon phase reading saved:', readingRecord.id);
            setReadingId(readingRecord.id);
            return readingRecord.id;

        } catch (error) {
            console.error('❌ Database save error:', error);
            return null;
        }
    };

    const savePaymentRecord = async (readId: string) => {
        try {
            const { data: txn, error: txnError } = await supabase
                .from('transactions')
                .insert([{
                    user_id: user?.id || null,
                    service_type: 'moon-phase',
                    service_title: `Moon Phase Reading - ${moonData?.phaseName}`,
                    amount: servicePrice,
                    currency: 'INR',
                    status: 'success',
                    payment_method: 'upi',
                    payment_provider: 'manual',
                    reading_id: readId,
                    order_id: `MOON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    metadata: {
                        birth_date: birthDate,
                        moon_phase: moonData?.phaseName,
                        personality_type: moonData?.personalityType
                    }
                }])
                .select()
                .single();

            if (txnError) {
                console.error('❌ Transaction save error:', txnError);
            } else {
                console.log('✅ Transaction saved:', txn);

                await supabase
                    .from('readings')
                    .update({ is_paid: true })
                    .eq('id', readId);
            }

        } catch (error) {
            console.error('❌ Payment save error:', error);
        }
    };

    const handleCalculate = async () => {
        if (!birthDate) {
            setError('Please provide your birth date.');
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setError('');
        setMoonData(null);
        setFullReading('');
        setReadingId(null);

        const timer = setInterval(() => {
            setProgress(prev => (prev >= 90 ? prev : prev + 8));
        }, 300);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const date = new Date(birthDate);
            const data = calculateMoonPhase(date);
            const reading = generateFullReading(data);

            setMoonData(data);
            setFullReading(reading);

            clearInterval(timer);
            setProgress(100);

            // Save to database
            await saveToDatabase(data, reading);

        } catch (err: any) {
            clearInterval(timer);
            setError(`Failed to calculate moon phase: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadMore = () => {
        console.log('💰 Opening payment for Moon Phase Reading - Price:', servicePrice);

        window.scrollTo({ top: 0, behavior: 'smooth' });

        openPayment(
            async () => {
                console.log('✅ Payment success callback triggered');

                const currentReadingId = readingId || await saveToDatabase(moonData!, fullReading);

                if (currentReadingId) {
                    await savePaymentRecord(currentReadingId);
                    setIsPaid(true);
                    console.log('✅ Payment completed and saved');

                    setTimeout(() => {
                        if (reportRef.current) {
                            reportRef.current.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 500);
                } else {
                    console.error('❌ No reading ID available for payment');
                }
            },
            'Moon Phase Reading',
            servicePrice
        );
    };

    const getLoadingMessage = (p: number) => {
        if (p < 20) return "Calculating lunar position...";
        if (p < 40) return "Identifying moon phase...";
        if (p < 60) return "Analyzing zodiac alignment...";
        if (p < 80) return "Determining nakshatra...";
        return "Generating your lunar blueprint...";
    };

    const renderMoonVisual = () => {
        if (!moonData) return null;

        return (
            <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl">
                    <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-300"
                        style={{
                            clipPath: moonData.percentage < 50 
                                ? `inset(0 ${100 - (moonData.percentage * 2)}% 0 0)`
                                : `inset(0 0 0 ${((moonData.percentage - 50) * 2)}%)`
                        }}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {moonData.phaseEmoji}
                </div>
            </div>
        );
    };

    const renderDashboard = () => {
        if (!moonData) return null;

        return (
            <div className="space-y-6 animate-fade-in-up">
                {renderMoonVisual()}

                <div className="text-center mb-6">
                    <h3 className="text-2xl font-cinzel font-bold text-white mb-2">
                        {moonData.phaseName} {moonData.phaseEmoji}
                    </h3>
                    <p className="text-purple-300 font-lora italic">{moonData.personalityType}</p>
                    <div className="mt-3 flex justify-center gap-4 text-sm">
                        <span className="text-purple-200">Illumination: <strong>{moonData.percentage.toFixed(1)}%</strong></span>
                        <span className="text-purple-200">Angle: <strong>{moonData.angle.toFixed(1)}°</strong></span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-900/30 p-4 rounded-xl border border-purple-500/30">
                        <h4 className="text-xs text-purple-300 uppercase tracking-widest mb-2">Zodiac Sign</h4>
                        <p className="text-xl font-bold text-white">{moonData.zodiacSign}</p>
                    </div>
                    <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-500/30">
                        <h4 className="text-xs text-indigo-300 uppercase tracking-widest mb-2">Nakshatra</h4>
                        <p className="text-xl font-bold text-white">{moonData.nakshatra}</p>
                    </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-purple-500/20">
                    <h4 className="text-xs text-purple-300 uppercase tracking-widest mb-3 font-bold">Core Traits</h4>
                    <div className="flex flex-wrap gap-2">
                        {moonData.traits.map((trait, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-900/40 rounded-full text-purple-200 border border-purple-500/30 text-sm">
                                {trait}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-purple-500/20">
                    <h4 className="text-xs text-purple-300 uppercase tracking-widest mb-3 font-bold">Manifestation Power</h4>
                    <div className="space-y-2">
                        {Object.entries(moonData.manifestationPower).map(([area, power]) => (
                            <div key={area}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-purple-200 capitalize">{area}</span>
                                    <span className="text-purple-400 font-bold">{power}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                                        style={{ width: `${power}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-purple-900/30 p-4 rounded-xl border border-purple-500/30 text-center">
                    <h4 className="text-xs text-purple-300 uppercase tracking-widest mb-3 font-bold">Lucky Numbers</h4>
                    <div className="flex justify-center gap-3">
                        {moonData.luckyElements.numbers.map((n, i) => (
                            <div key={i} className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-900 rounded-full text-white font-cinzel font-black text-lg border-2 border-purple-400 shadow-lg">
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-12 items-center">
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                <SmartBackButton label={t('backToHome')} className="mb-6" />

                <div className="text-center mb-8">
                    <h2 className="text-4xl font-cinzel font-bold text-purple-300 mb-2">Moon Phase Reading</h2>
                    <p className="text-purple-100/70 font-lora italic">Discover your lunar personality and spiritual blueprint</p>
                </div>

                <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black/60 rounded-xl shadow-2xl border border-purple-500/30 backdrop-blur-md">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <div className="bg-gray-900/40 p-6 rounded-2xl border border-purple-500/10 shadow-inner">
                                <SmartDatePicker value={birthDate} onChange={setBirthDate} />
                                <p className="text-xs text-purple-500/50 mt-2 font-lora italic text-center">
                                    Your birth date reveals your lunar personality archetype
                                </p>
                            </div>

                            <Button 
                                onClick={handleCalculate} 
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border-purple-400/50 shadow-lg"
                            >
                                {isLoading ? "Consulting the Moon..." : "Calculate Moon Phase"}
                            </Button>

                            {error && (
                                <p className="text-red-400 text-center text-sm bg-red-900/20 p-2 rounded border border-red-500/20">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="min-h-[20rem] bg-black/20 rounded-lg border border-purple-500/20 p-6 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>

                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                                    <ProgressBar progress={progress} message={getLoadingMessage(progress)} />
                                </div>
                            )}

                            {!moonData && !isLoading && (
                                <div className="flex-grow flex flex-col items-center justify-center text-purple-300/40 text-center">
                                    <span className="text-7xl mb-4 animate-float opacity-50">🌙</span>
                                    <p className="font-lora italic">Enter your birth date to reveal your lunar blueprint</p>
                                </div>
                            )}

                            {moonData && !isLoading && (
                                <div className="space-y-6 animate-fade-in-up">
                                    {renderDashboard()}

                                    {!isPaid ? (
                                        <div className="relative mt-4">
                                            <div className="bg-black/40 p-4 rounded-xl border border-purple-500/20 text-purple-100 font-lora italic leading-relaxed text-sm relative overflow-hidden min-h-[150px]">
                                                <span className="text-3xl text-purple-500/30 absolute top-0 left-2">"</span>
                                                {fullReading.substring(0, 200)}...
                                                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                                            </div>
                                            <div className="mt-4">
                                                <Button
                                                    onClick={handleReadMore}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-800 border-purple-500 shadow-xl py-4 font-cinzel tracking-widest hover:shadow-2xl transform hover:scale-105 transition-all"
                                                >
                                                    🔓 Unlock Full Reading - ₹{servicePrice}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                                            <p className="text-green-400 font-bold">✅ Full Report Unlocked!</p>
                                            <p className="text-xs text-green-300 mt-1">Scroll down to read</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {moonData && isPaid && (
                    <div ref={reportRef} className="mt-8 animate-fade-in-up scroll-mt-24">
                        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black/60 rounded-xl shadow-2xl border border-purple-500/30 backdrop-blur-md">
                            <div className="text-center mb-8">
                                <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-purple-500 shadow-2xl overflow-hidden">
                                    <img
                                        src={cloudManager.resolveImage(reportImage)}
                                        alt="Moon Phase"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h1 className="text-5xl font-cinzel font-black text-white mb-3 uppercase tracking-wider">
                                    {moonData.phaseName} {moonData.phaseEmoji}
                                </h1>
                                <p className="text-2xl text-purple-300 font-lora italic">
                                    {moonData.personalityType}
                                </p>
                            </div>

                            {renderDashboard()}

                            <div className="grid md:grid-cols-3 gap-6 my-8">
                                <div className="bg-purple-900/30 p-6 rounded-2xl border border-purple-500/30">
                                    <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-4 text-center">Lucky Colors</h4>
                                    <div className="space-y-2">
                                        {moonData.luckyElements.colors.map((color, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border-2 border-white/30" style={{ background: color.toLowerCase() }} />
                                                <span className="text-purple-100 text-sm">{color}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-indigo-900/30 p-6 rounded-2xl border border-indigo-500/30">
                                    <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 text-center">Gemstones</h4>
                                    <ul className="space-y-2">
                                        {moonData.luckyElements.gemstones.map((gem, i) => (
                                            <li key={i} className="text-indigo-100 text-sm">💎 {gem}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-pink-900/30 p-6 rounded-2xl border border-pink-500/30">
                                    <h4 className="text-sm font-bold text-pink-300 uppercase tracking-widest mb-4 text-center">Power Days</h4>
                                    <ul className="space-y-2">
                                        {moonData.luckyElements.days.map((day, i) => (
                                            <li key={i} className="text-pink-100 text-sm">📅 {day}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-2xl p-8 border border-purple-500/20">
                                <FullReport
                                    reading={fullReading}
                                    category="moon-phase"
                                    title={`${moonData.phaseName} Reading`}
                                    subtitle={moonData.personalityType}
                                    imageUrl={cloudManager.resolveImage(reportImage)}
                                    chartData={moonData}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoonPhaseReading;
