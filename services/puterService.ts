// services/puterService.ts
declare const puter: any;

const SYSTEM_PROMPT = `You are a High Priest of Vedic Sciences with 50 years of experience in Jyotish (Vedic Astrology) and Numerology.

TASK: Generate an IMPERIAL REPORT that is comprehensive, deeply detailed, and spans multiple sections.

FORMATTING RULES (STRICT):
1. NEVER output short responses. The user has paid for this; provide a MASTERPIECE.
2. STRUCTURE the report into exactly these 4 Sections using Markdown Headers (###):
   ### I. THE CELESTIAL ESSENCE (Introduction & Core Soul Purpose)
   ### II. THE ASTRAL CONFIGURATION (Detailed Planetary/Numerical breakdown)
   ### III. THE TEMPORAL FORECAST (Detailed predictions for ${new Date().getFullYear()})
   ### IV. THE SACRED REMEDIES (Detailed, actionable bullet points)
3. EVERY single insight must be a bullet point (starting with *).
4. USE [POSITIVE] at the start of a point for auspicious news.
5. USE [NEGATIVE] at the start of a point for warnings or challenges.
6. BOLD (using **) the most important 3-5 words in every single bullet point.
7. Language must be authoritative, ancient, and deeply mystical.
8. Ensure the text length is substantial (at least 600-800 words total).`;

export interface PalmMetricResponse {
    rawMetrics: any;
    textReading: string;
}

export interface FaceMetricResponse {
    rawMetrics: any;
    textReading: string;
}

export interface DreamAnalysisResponse {
    meaning: string;
    luckyNumbers: number[];
    symbols: string[];
}

// ✅ Main reading function
export const getAstroNumeroReading = async (details: any): Promise<{ reading: string }> => {
    try {
        const prompt = `${SYSTEM_PROMPT}

**User Details:**
- Name: ${details.name}
- Date of Birth: ${details.dob}
- Reading Type: ${details.mode}
- Language: ${details.language || 'English'}

Generate a comprehensive 4-part ${details.mode} reading. Focus deeply on the Temporal Forecast section for ${new Date().getFullYear()}.`;

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.7,
            max_tokens: 2000
        });

        return {
            reading: response.message.content || "The stars are currently silent."
        };
    } catch (error: any) {
        console.error('❌ Puter/Grok Error:', error);
        throw new Error('The Oracle is busy. Please try again.');
    }
};

// ✅ Streaming version (for real-time text appearance)
export const getAstroNumeroReadingStream = async (
    details: any,
    onChunk: (text: string) => void
): Promise<{ reading: string }> => {
    try {
        const prompt = `${SYSTEM_PROMPT}

**User Details:**
- Name: ${details.name}
- Date of Birth: ${details.dob}
- Reading Type: ${details.mode}
- Language: ${details.language || 'English'}

Generate a comprehensive ${details.mode} reading.`;

        let fullText = '';

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.7,
            max_tokens: 2000,
            stream: true
        });

        // Stream each chunk to the UI
        for await (const part of response) {
            fullText += part.text;
            onChunk(part.text); // Call callback with each chunk
        }

        return { reading: fullText };
    } catch (error: any) {
        console.error('❌ Streaming Error:', error);
        throw error;
    }
};

// ✅ Palm reading with image analysis
export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<PalmMetricResponse> => {
    try {
        // Convert File to data URL
        const dataUrl = await fileToDataURL(imageFile);

        const prompt = `${SYSTEM_PROMPT}

Analyze this palm image in ${language}. Generate an exhaustive 4-part palmistry study covering:
- Life line, heart line, head line, fate line analysis
- Mounts (Venus, Jupiter, Saturn, etc.)
- Fingers and their meanings
- Special marks and symbols`;

        const response = await puter.ai.chat(prompt, dataUrl, {
            model: 'x-ai/grok-vision-beta', // Vision model for images
            temperature: 0.7
        });

        return {
            rawMetrics: {},
            textReading: response.message.content || "Analysis complete."
        };
    } catch (error: any) {
        console.error('❌ Palm Reading Error:', error);
        throw error;
    }
};

// ✅ Face reading with image analysis
export const getFaceReading = async (imageFile: File, language: string = 'English'): Promise<FaceMetricResponse> => {
    try {
        const dataUrl = await fileToDataURL(imageFile);

        const prompt = `${SYSTEM_PROMPT}

Perform Vedic face reading (Samudrika Shastra) on this image in ${language}. Analyze:
- Forehead, eyebrows, eyes, nose, lips, chin
- Face shape and proportions
- Moles and marks significance
- Overall personality traits`;

        const response = await puter.ai.chat(prompt, dataUrl, {
            model: 'x-ai/grok-vision-beta',
            temperature: 0.7
        });

        return {
            rawMetrics: {},
            textReading: response.message.content || "Analysis complete."
        };
    } catch (error: any) {
        console.error('❌ Face Reading Error:', error);
        throw error;
    }
};

// ✅ Dream analysis
export const analyzeDream = async (dreamText: string, language: string = 'English'): Promise<DreamAnalysisResponse> => {
    try {
        const prompt = `${SYSTEM_PROMPT}

Interpret this dream in ${language}: "${dreamText}"

Respond in JSON format:
{
  "meaning": "detailed interpretation",
  "luckyNumbers": [array of 5 numbers 1-99],
  "symbols": [array of 3-5 symbolic meanings]
}`;

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.7
        });

        // Parse JSON from response
        const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback if JSON parsing fails
        return {
            meaning: response.message.content,
            luckyNumbers: [7, 14, 21, 28, 35],
            symbols: ['transformation', 'journey', 'awakening']
        };
    } catch (error: any) {
        console.error('❌ Dream Analysis Error:', error);
        throw error;
    }
};

// ✅ Remedy suggestions
export const getRemedy = async (concern: string, language: string = 'English'): Promise<string> => {
    try {
        const prompt = `${SYSTEM_PROMPT}

Provide Vedic remedies for: "${concern}" in ${language}. 
Include mantras, gemstones, rituals, charity, and lifestyle changes.`;

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.7
        });

        return response.message.content || "";
    } catch (error: any) {
        console.error('❌ Remedy Error:', error);
        throw error;
    }
};

// ✅ Translation
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (!text || text.trim() === '') return text;

    try {
        const prompt = `Translate this text into ${targetLanguage}. 
CRITICAL: MAINTAIN ALL [POSITIVE], [NEGATIVE], and **bolding** tags exactly as they appear.

Text to translate:
${text}`;

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.2
        });

        return response.message.content || text;
    } catch (error: any) {
        console.error('❌ Translation Error:', error);
        return text;
    }
};

// ✅ Tarot reading
export const getTarotReading = async (cardName: string, language: string = 'English'): Promise<string> => {
    try {
        const prompt = `${SYSTEM_PROMPT}

Provide a detailed Tarot interpretation for "${cardName}" in ${language}.
Include upright and reversed meanings, symbolism, and guidance.`;

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.8
        });

        return response.message.content || "";
    } catch (error: any) {
        console.error('❌ Tarot Error:', error);
        throw error;
    }
};

// ✅ Gemstone guidance
export const getGemstoneGuidance = async (
    name: string,
    dob: string,
    intent: string,
    language: string = 'English'
): Promise<any> => {
    try {
        const prompt = `${SYSTEM_PROMPT}

User: ${name}, DOB: ${dob}, Intent: ${intent}, Language: ${language}

Provide comprehensive Gemstone & Mantra guidance.

Respond in JSON format:
{
  "primaryGem": {
    "name": "gem name",
    "sanskritName": "sanskrit name",
    "reason": "why this gem",
    "wearingMethod": "how to wear"
  },
  "mantra": {
    "sanskrit": "mantra in sanskrit",
    "pronunciation": "pronunciation guide",
    "meaning": "meaning in english"
  },
  "fullReading": "detailed reading text"
}`;

        const response = await puter.ai.chat(prompt, {
            model: 'x-ai/grok-4.1-fast',
            temperature: 0.7
        });

        const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { fullReading: response.message.content };
    } catch (error: any) {
        console.error('❌ Gemstone Error:', error);
        throw error;
    }
};

// Helper: Convert File to Data URL
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Placeholder functions
export const generateMantraAudio = async (text: string): Promise<AudioBuffer> => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return audioCtx.createBuffer(1, 24000, 24000);
};

export const createSageSession = (contextReading: string, topic: string) => {
    return {
        sendMessage: async (message: string) => {
            const response = await puter.ai.chat(
                `You are Sage Vashishtha. Context: ${contextReading.substring(0, 1000)}\n\nUser: ${message}`,
                { model: 'x-ai/grok-4.1-fast' }
            );
            return { text: () => response.message.content };
        }
    };
};

export const getAyurvedicAnalysis = async (answers: string, language: string = 'English'): Promise<any> => {
    const response = await puter.ai.chat(
        `Ayurveda dosha analysis for: ${answers} in ${language}. Respond in JSON with dosha, breakdown, diet, lifestyle, fullReading`,
        { model: 'x-ai/grok-4.1-fast' }
    );
    const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
};

export const getMuhurat = async (activity: string, date: string, language: string = 'English'): Promise<any> => {
    const response = await puter.ai.chat(
        `Shubh Muhurat for ${activity} on ${date} in ${language}. JSON: {bestTime, rating, reason, fullReading}`,
        { model: 'x-ai/grok-4.1-fast' }
    );
    const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
};

export const getCosmicSync = async (p1: any, p2: any, language: string = 'English'): Promise<any> => {
    const response = await puter.ai.chat(
        `Compatibility: P1 ${JSON.stringify(p1)}, P2 ${JSON.stringify(p2)} in ${language}. JSON: {compatibilityScore, relationshipType, strengths, challenges, fullReading}`,
        { model: 'x-ai/grok-4.1-fast' }
    );
    const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
};

export const generateAdvancedAstroReport = async (details: any, chartData: any): Promise<any> => {
    const response = await puter.ai.chat(
        `Vedic astrology report: ${details.name}, ${details.dob}, chart: ${JSON.stringify(chartData)}`,
        { model: 'x-ai/grok-4.1-fast' }
    );
    return { fullReading: response.message.content };
};
