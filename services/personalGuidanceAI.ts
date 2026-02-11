import { supabase } from './supabaseClient';

interface ProductRecommendation {
    name: string;
    reason: string;
}

interface GuidanceResponse {
    healing_approach: string;
    daily_practices: Array<{
        title: string;
        description: string;
        timing: string;
    }>;
    affirmations: string[];
    recommended_products: ProductRecommendation[];
}

/**
 * Generate personalized guidance using AI (Puter.ai with Gemini fallback)
 */
export async function generatePersonalizedGuidance(
    concernType: string,
    concernDescription: string,
    currentChallenges: string,
    goals: string
): Promise<GuidanceResponse> {

    console.log('🤖 Generating AI guidance for:', concernType);

    const prompt = `You are an expert Vedic astrologer and spiritual healer. A person needs guidance for ${concernType}.

**Their Situation:**
${concernDescription}

**Current Challenges:**
${currentChallenges}

**Their Goals:**
${goals}

Provide personalized guidance in JSON format with these sections:

1. **healing_approach** (200-300 words): Compassionate analysis of their situation and holistic healing approach
2. **daily_practices** (array of 3-4 practices): Specific daily spiritual practices with title, description, and timing
3. **affirmations** (array of 5 affirmations): Powerful positive affirmations tailored to their concern
4. **recommended_products** (array of 3-5 products): SPECIFIC product names from Vedic spiritual store with WHY they help

For recommended_products, suggest REAL products like:
- Crystals: Rose Quartz, Amethyst, Citrine, Tiger Eye, Green Aventurine, Clear Quartz, Black Tourmaline, Carnelian, Pyrite, Rhodonite, Moonstone, Labradorite, Selenite
- Malas: Rudraksha Mala, Tulsi Mala, Sandalwood Mala, Rose Quartz Mala, Amethyst Mala
- Yantras: Shree Yantra, Lakshmi Yantra, Ganesh Yantra, Protection Yantra, Success Yantra
- Spiritual Tools: Brass Diya Lamp, Camphor, Incense, Singing Bowl, Sacred Bell

Return ONLY valid JSON, no markdown or explanation:
{
  "healing_approach": "...",
  "daily_practices": [{"title": "...", "description": "...", "timing": "..."}],
  "affirmations": ["...", "..."],
  "recommended_products": [{"name": "Rose Quartz Crystal", "reason": "Opens heart chakra..."}]
}`;

    try {
        // Try Puter.ai first
        const puterResponse = await callPuterAI(prompt);
        if (puterResponse) {
            console.log('✅ Puter.ai response received');
            return puterResponse;
        }
    } catch (error) {
        console.warn('⚠️ Puter.ai failed, trying Gemini fallback:', error);
    }

    try {
        // Fallback to Google Gemini
        const geminiResponse = await callGeminiAI(prompt);
        if (geminiResponse) {
            console.log('✅ Gemini response received');
            return geminiResponse;
        }
    } catch (error) {
        console.error('❌ Both AI services failed:', error);
    }

    // Ultimate fallback: Return structured default response
    return getDefaultGuidance(concernType);
}

/**
 * Call Puter.ai API
 */
async function callPuterAI(prompt: string): Promise<GuidanceResponse | null> {
    try {
        const { data: config } = await supabase
            .from('ai_config')
            .select('api_key')
            .eq('provider', 'puter')
            .eq('is_active', true)
            .single();

        if (!config?.api_key) {
            console.warn('⚠️ Puter API key not found');
            return null;
        }

        const response = await fetch('https://api.puter.com/drivers/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.api_key}`
            },
            body: JSON.stringify({
                interface: 'puter-chat-completion',
                driver: 'openai',
                method: 'complete',
                args: {
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert Vedic astrologer and spiritual healer. Return ONLY valid JSON, no markdown.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: 'gpt-4o-mini',
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Puter API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.result?.message?.content || data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No content in Puter response');
        }

        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error('❌ Puter.ai error:', error);
        return null;
    }
}

/**
 * Call Google Gemini API (fallback)
 */
async function callGeminiAI(prompt: string): Promise<GuidanceResponse | null> {
    try {
        const { data: config } = await supabase
            .from('ai_config')
            .select('api_key')
            .eq('provider', 'google')
            .eq('is_active', true)
            .single();

        if (!config?.api_key) {
            console.warn('⚠️ Gemini API key not found');
            return null;
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.api_key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            throw new Error('No content in Gemini response');
        }

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error('❌ Gemini error:', error);
        return null;
    }
}

/**
 * Default guidance when AI fails
 */
function getDefaultGuidance(concernType: string): GuidanceResponse {
    const templates: Record<string, GuidanceResponse> = {
        health: {
            healing_approach: 'Your health journey requires a holistic approach that honors the sacred connection between body, mind, and spirit. In Vedic wisdom, we understand that physical ailments often have deeper emotional and spiritual roots. By addressing all three dimensions through the power of healing crystals, meditation, and conscious living practices, profound transformation becomes possible. The tools and practices recommended here are designed to support your natural healing abilities and restore balance to your entire being.',
            daily_practices: [
                { title: 'Crystal Healing Meditation', description: 'Hold Green Aventurine over your heart chakra. Visualize healing green light flowing through your entire body, dissolving all blockages and restoring vitality. Practice deep breathing for 15 minutes.', timing: 'Every morning after waking' },
                { title: 'Gratitude for Wellness', description: 'Write down 3 aspects of your body you are grateful for. Even small things like "my breath sustains me" or "my heart beats faithfully." Feel deep appreciation.', timing: 'Before sleeping' },
                { title: 'Healing Affirmations', description: 'Repeat "I am healthy, whole, and complete" 21 times while holding your healing crystal. Feel the truth of these words in every cell.', timing: 'Morning and evening' }
            ],
            affirmations: [
                'My body is healing and becoming stronger with each passing moment',
                'I am grateful for my vibrant health and boundless energy',
                'Every cell in my body radiates with perfect wellness',
                'I choose thoughts and actions that support my complete healing',
                'My body knows exactly how to heal itself naturally and perfectly'
            ],
            recommended_products: [
                { name: 'Green Aventurine Crystal', reason: 'Known as the stone of opportunity and vitality. Opens heart chakra, promotes physical healing, and brings emotional calm.' },
                { name: 'Clear Quartz', reason: 'Master healer crystal that amplifies healing energy and can be programmed for any health intention.' },
                { name: 'Amethyst Crystal', reason: 'Promotes restful sleep, reduces stress, and supports immune system through calming purple ray energy.' }
            ]
        },
        wealth: {
            healing_approach: 'Financial abundance is not just about money - it is a state of consciousness and energetic alignment with universal prosperity. In Vedic tradition, we understand that Lakshmi, the goddess of wealth, flows freely to those who prepare sacred space for her. This involves releasing limiting beliefs about scarcity, practicing genuine gratitude for current blessings, and using powerful spiritual tools to open the channels through which abundance naturally flows into your life.',
            daily_practices: [
                { title: 'Abundance Meditation', description: 'Sit with Citrine crystal in your receiving hand. Visualize golden light of abundance pouring down from the cosmos, filling your entire being and life with prosperity. Feel wealthy now.', timing: 'Every morning for 15 minutes' },
                { title: 'Money Gratitude Practice', description: 'Each time money comes to you - even ₹1 - touch it with reverence and say "Thank you." Feel genuine appreciation for this divine flow.', timing: 'Throughout the day' },
                { title: 'Lakshmi Mantra', description: 'Chant "Om Shreem Mahalakshmiyei Namaha" 108 times using your mala beads. This invokes the goddess of wealth and prosperity.', timing: 'Friday evenings (Lakshmi\'s sacred day)' }
            ],
            affirmations: [
                'Money flows to me easily and effortlessly from multiple sources',
                'I am a powerful magnet for abundance and unlimited prosperity',
                'My income exceeds my expenses comfortably and continuously',
                'I deserve to be wealthy, successful, and financially free',
                'Unlimited opportunities for abundance surround me always'
            ],
            recommended_products: [
                { name: 'Citrine Crystal', reason: 'The "Merchant\'s Stone" - attracts wealth, success, and prosperity. Place in cash box or wallet to multiply abundance.' },
                { name: 'Pyrite Stone', reason: 'Golden stone of luck and good fortune. Shields from negative energy while attracting wealth and success.' },
                { name: 'Lakshmi Yantra', reason: 'Sacred geometric pattern to invoke goddess Lakshmi. Place in wealth corner (southeast) of home or business.' }
            ]
        },
        relationships: {
            healing_approach: 'Relationship harmony begins with the sacred work of inner healing. When we heal our own emotional wounds, release past pain, and open our hearts to unconditional love through spiritual practice and crystal healing, our external relationships naturally transform to mirror this inner peace. The divine tools recommended here will help dissolve barriers to love, create deep understanding, heal communication, and restore the sacred bond between hearts.',
            daily_practices: [
                { title: 'Heart Chakra Healing', description: 'Place Rose Quartz crystal on your heart center. Lie down, breathe deeply, and send waves of love to yourself first, then to all your relationships. Forgive and release.', timing: 'Daily for 20 minutes' },
                { title: 'Forgiveness Fire Ritual', description: 'Write all grievances, hurts, and anger on paper. Read them once, then safely burn the paper while saying "I release this with love." Watch it transform to ash.', timing: 'Every Sunday evening' },
                { title: 'Love Affirmations', description: 'Look in mirror, hold Rose Quartz, and repeat "I am worthy of love. I am love itself." 21 times with feeling.', timing: 'Morning and night' }
            ],
            affirmations: [
                'I am surrounded by loving, understanding, and supportive people',
                'My relationships are filled with peace, harmony, and deep joy',
                'I attract only loving and respectful people into my sacred space',
                'I forgive easily and love unconditionally without conditions',
                'Communication flows naturally and lovingly in all my relationships'
            ],
            recommended_products: [
                { name: 'Rose Quartz Crystal', reason: 'The stone of unconditional love. Opens and heals the heart chakra, promotes forgiveness, and attracts loving relationships.' },
                { name: 'Rhodonite Stone', reason: 'Emotional healer that balances yin-yang energy. Helps heal wounds from past relationships and promotes mutual understanding.' },
                { name: 'Rudraksha Mala', reason: 'Sacred beads blessed by Lord Shiva. Use for relationship healing mantras. Promotes emotional stability and spiritual protection.' }
            ]
        },
        career: {
            healing_approach: 'Career success is achieved through the powerful combination of practical effort and spiritual alignment with your dharma (life purpose). By building unshakeable confidence through crystal work, removing obstacles with daily spiritual practices, and staying laser-focused on your highest professional goals with divine support, natural growth and recognition accelerate in ways that feel effortless and aligned with your soul\'s purpose.',
            daily_practices: [
                { title: 'Success Visualization', description: 'Hold Tiger Eye crystal at your solar plexus. Vividly visualize yourself achieving your biggest career goal - see it, feel it, live it as if it\'s happening now. Use all senses.', timing: 'Every morning for 10 minutes' },
                { title: 'Confidence Crystal Carry', description: 'Keep Carnelian stone in your pocket or wear as jewelry during important meetings, presentations, or any professional situations. Touch it for instant courage boost.', timing: 'Throughout your workday' },
                { title: 'Career Success Mantra', description: 'Repeat "I am confident, capable, and divinely successful in my chosen career" 21 times while holding your power crystal.', timing: 'Before starting work each day' }
            ],
            affirmations: [
                'I am confident and highly capable in every aspect of my professional life',
                'Success, recognition, and promotion come naturally and easily to me',
                'I am recognized, valued, and well-rewarded for my unique talents',
                'My ideal career path unfolds perfectly for my highest good',
                'I achieve all my professional goals with grace, ease, and divine timing'
            ],
            recommended_products: [
                { name: 'Tiger Eye Crystal', reason: 'Stone of courage, confidence, and willpower. Boosts focus and determination. Sacred to solar plexus chakra - your power center.' },
                { name: 'Carnelian Stone', reason: 'Motivates for success and stimulates creativity. Excellent for job interviews, presentations, and career advancement.' },
                { name: 'Ganesh Yantra', reason: 'Lord Ganesh removes all obstacles. Place on desk to clear blocks to career success and invite new opportunities.' }
            ]
        },
        spiritual: {
            healing_approach: 'Spiritual growth is your soul\'s most sacred journey - the awakening to your true divine nature beyond the illusions of the material world. Through dedicated meditation with high-vibration crystals, regular mantra chanting using sacred mala beads, and conscious daily spiritual practice, you can rapidly deepen your connection to universal consciousness and experience the profound inner transformation that your soul yearns for. This path leads to lasting peace, clarity, and divine guidance in all life areas.',
            daily_practices: [
                { title: 'Third Eye Meditation', description: 'Hold Amethyst crystal at your third eye point (between eyebrows). Meditate in silence for 20-30 minutes. Watch thoughts without judgment. Let divine wisdom flow.', timing: 'Early morning (4-6 AM ideal - Brahma Muhurta)' },
                { title: 'Sacred Text Study', description: 'Read spiritual scriptures like Bhagavad Gita, Upanishads, Yoga Sutras, or teachings of enlightened masters for 20 minutes with full attention and contemplation.', timing: 'Evening before sunset' },
                { title: 'Mala Mantra Meditation', description: 'Use Rudraksha mala to chant your chosen mantra (Om Namah Shivaya, Gayatri Mantra, or your guru mantra) 108 times with complete devotion and presence.', timing: 'Twice daily - dawn and dusk' }
            ],
            affirmations: [
                'I am deeply and permanently connected to infinite divine wisdom',
                'My spiritual path unfolds perfectly in alignment with divine timing',
                'I trust my intuition completely and follow it without hesitation',
                'I am awakening rapidly to my highest spiritual potential and purpose',
                'Divine light, love, and grace flow through me continuously'
            ],
            recommended_products: [
                { name: 'Amethyst Crystal', reason: 'Highest spiritual vibration crystal. Opens third eye and crown chakras. Enhances meditation, intuition, and divine connection.' },
                { name: 'Clear Quartz', reason: 'Master healer and consciousness amplifier. Programs with any spiritual intention. Connects all chakras to higher realms.' },
                { name: 'Rudraksha Mala', reason: 'Most sacred beads in Vedic tradition. Blessed by Lord Shiva. Essential tool for serious spiritual practitioners and meditation.' }
            ]
        }
    };

    return templates[concernType] || templates.health;
}
