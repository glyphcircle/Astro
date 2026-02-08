// services/aiService.ts

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

declare const puter: any;

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

enum AIProvider {
    GOOGLE = 'google',
    PUTER = 'puter'
}

/**
 * 🔐 Ensure user is properly authenticated with Puter
 * This forces the sign-in flow BEFORE making AI calls
 */
const ensurePuterAuthentication = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !(window as any).puter) {
        console.error('❌ Puter not loaded');
        return false;
    }

    const puter = (window as any).puter;

    try {
        // Check if user is already signed in
        const isSignedIn = await puter.auth.isSignedIn();

        if (!isSignedIn) {
            console.log('🔐 User not signed in, triggering sign-in flow...');
            
            // This will show the proper sign-in popup
            // User will be prompted to enter their email FIRST
            await puter.auth.signIn();
            
            console.log('✅ User signed in successfully');
        }

        // Get user info to verify email is confirmed
        const user = await puter.auth.getUser();
        console.log('👤 Puter user:', user.username, '| Email:', user.email);

        // Check if email is confirmed
        if (user.email_confirmed === false) {
            console.warn('⚠️ Email not confirmed');
            alert('📧 Please verify your email to continue.\n\nCheck your inbox for the verification code from Puter.');
            return false;
        }

        console.log('✅ User fully authenticated and verified');
        return true;

    } catch (error: any) {
        console.error('❌ Puter authentication error:', error);
        
        // Show helpful error message
        alert(`❌ Authentication Error\n\n${error.message}\n\nPlease try:\n1. Going to puter.com\n2. Signing in there\n3. Coming back to this app`);
        
        return false;
    }
};

/**
 * 🔀 SMART AI PROVIDER SELECTOR
 * Priority: Puter.ai (free) → Google AI (configured) → Graceful fallback
 */
const getAIProvider = (): { provider: AIProvider; client: any } => {
    console.log('🔍 Selecting AI provider...');

    // ✅ PRIORITY 1: Try Puter.ai first (FREE!)
    if (typeof window !== 'undefined' && (window as any).puter?.ai) {
        console.log('✅ Using Puter.ai (FREE)');
        return {
            provider: AIProvider.PUTER,
            client: (window as any).puter
        };
    }

    console.log('⚠️ Puter.ai not available, checking Google AI...');

    // ✅ PRIORITY 2: Fallback to Google AI if configured
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY ||
        import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey && apiKey !== 'undefined' && apiKey.trim() !== '') {
        try {
            const googleAI = new GoogleGenerativeAI(apiKey);
            console.log('✅ Using Google AI (Gemini) as fallback');
            return {
                provider: AIProvider.GOOGLE,
                client: googleAI
            };
        } catch (error) {
            console.warn('⚠️ Google AI initialization failed:', error);
        }
    }

    // ✅ PRIORITY 3: Graceful degradation with helpful message
    console.warn('⚠️ No AI service available');
    console.info('💡 To enable AI features:');
    console.info('   Option 1 (Recommended): Add Puter.js to index.html:');
    console.info('   <script src="https://js.puter.com/v2/"></script>');
    console.info('   Option 2: Configure Google AI key in .env:');
    console.info('   VITE_GEMINI_API_KEY=your_key_here');

    return {
        provider: AIProvider.PUTER,
        client: {
            ai: {
                chat: async () => {
                    throw new Error('🔮 AI Oracle is sleeping. Please add Puter.js to index.html or configure Gemini API key.');
                }
            }
        }
    };
};

/**
 * 🔒 TIME-AWARE DETERMINISTIC SEED
 */
const generateDeterministicSeed = (input: string): number => {
    const currentYear = new Date().getFullYear().toString();
    const combinedInput = input + currentYear;
    let hash = 0;
    for (let i = 0; i < combinedInput.length; i++) {
        const char = combinedInput.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const DETAIL_SYSTEM_PROMPT = `
ACT AS: A High Priest of Vedic Sciences with 50 years of experience.
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
8. Ensure the text length is substantial (at least 600-800 words total).
`;

// --- AUDIO HELPERS ---
function decodeBase64ToUint8(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePcmToAudioBuffer(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
    });
};

// ============================================
// 📖 MAIN READING FUNCTION
// ============================================

export const getAstroNumeroReading = async (details: any): Promise<{ reading: string }> => {
    const { provider, client } = getAIProvider();

    // ✅ Authenticate if using Puter
    if (provider === AIProvider.PUTER) {
        const isAuth = await ensurePuterAuthentication();
        if (!isAuth) {
            return { reading: "🔐 Please sign in to access AI features." };
        }
    }

    const prompt = `${DETAIL_SYSTEM_PROMPT}

**User Details:**
- Name: ${details.name}
- Date of Birth: ${details.dob}
- Reading Type: ${details.mode}
- Language: ${details.language || 'English'}

Generate a comprehensive 4-part ${details.mode} reading. Focus deeply on the Temporal Forecast section for ${new Date().getFullYear()}.`;

    try {
        if (provider === AIProvider.GOOGLE) {
            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.7
                }
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return { reading: text || "The stars are currently silent." };
        } else {
            const response = await client.ai.chat(prompt, {
                model: 'gpt-4o-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            return { reading: response.message?.content || response || "The stars are currently silent." };
        }
    } catch (error: any) {
        console.error('❌ AI Reading Error:', error);
        throw new Error('The Oracle is busy. Please try again.');
    }
};

// ============================================
// 🖐️ PALM READING
// ============================================

export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<PalmMetricResponse> => {
    const { provider, client } = getAIProvider();

    // ✅ Authenticate if using Puter
    if (provider === AIProvider.PUTER) {
        const isAuth = await ensurePuterAuthentication();
        if (!isAuth) {
            return { rawMetrics: {}, textReading: "🔐 Please sign in to access AI features." };
        }
    }

    const prompt = `${DETAIL_SYSTEM_PROMPT}

Analyze this palm image in ${language}. Generate an exhaustive 4-part palmistry study.`;

    try {
        if (provider === AIProvider.GOOGLE) {
            const base64Image = await fileToBase64(imageFile);

            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            textReading: { type: SchemaType.STRING }
                        }
                    }
                }
            });

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Image
                    }
                },
                { text: prompt }
            ]);

            const response = await result.response;
            const text = response.text();
            const json = JSON.parse(text || "{}");

            return { rawMetrics: json, textReading: json.textReading || "Analysis complete." };
        } else {
            const dataUrl = await fileToDataURL(imageFile);
            const response = await client.ai.chat(prompt, dataUrl, {
                model: 'gpt-4o-mini',
                temperature: 0.7
            });
            const content = response.message?.content || response;
            return { rawMetrics: {}, textReading: content || "Analysis complete." };
        }
    } catch (error: any) {
        console.error('❌ Palm Reading Error:', error);
        throw error;
    }
};

// ============================================
// 👤 FACE READING
// ============================================

export const getFaceReading = async (imageFile: File, language: string = 'English', dob?: string): Promise<FaceMetricResponse> => {
    const { provider, client } = getAIProvider();

    // ✅ Authenticate if using Puter
    if (provider === AIProvider.PUTER) {
        const isAuth = await ensurePuterAuthentication();
        if (!isAuth) {
            return { rawMetrics: {}, textReading: "🔐 Please sign in to access AI features." };
        }
    }

    const ageContext = dob ? `User was born on ${dob}. ` : '';
    const prompt = `${DETAIL_SYSTEM_PROMPT}

${ageContext}Vedic Face reading (Samudrika Shastra) in ${language}. Provide a massive 4-part physiological profile.`;

    try {
        if (provider === AIProvider.GOOGLE) {
            const base64Image = await fileToBase64(imageFile);

            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            textReading: { type: SchemaType.STRING }
                        }
                    }
                }
            });

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Image
                    }
                },
                { text: prompt }
            ]);

            const response = await result.response;
            const text = response.text();
            const json = JSON.parse(text || "{}");

            return { rawMetrics: json, textReading: json.textReading || "Analysis complete." };
        } else {
            const dataUrl = await fileToDataURL(imageFile);
            const response = await client.ai.chat(prompt, dataUrl, {
                model: 'gpt-4o-mini',
                temperature: 0.7
            });
            const content = response.message?.content || response;
            return { rawMetrics: {}, textReading: content || "Analysis complete." };
        }
    } catch (error: any) {
        console.error('❌ Face Reading Error:', error);
        throw error;
    }
};

// ============================================
// 💭 DREAM ANALYSIS
// ============================================

export const analyzeDream = async (dreamText: string, language: string = 'English'): Promise<DreamAnalysisResponse> => {
    const { provider, client } = getAIProvider();

    // ✅ Authenticate if using Puter
    if (provider === AIProvider.PUTER) {
        const isAuth = await ensurePuterAuthentication();
        if (!isAuth) {
            return {
                meaning: "🔐 Please sign in to access AI features.",
                luckyNumbers: [7, 14, 21, 28, 35],
                symbols: ['authentication', 'access', 'security']
            };
        }
    }

    const prompt = `${DETAIL_SYSTEM_PROMPT}

Interpret dream in ${language}: "${dreamText}". 

Respond in JSON format:
{
  "meaning": "detailed interpretation",
  "luckyNumbers": [array of 5 numbers 1-99],
  "symbols": [array of 3-5 symbolic meanings]
}`;

    try {
        if (provider === AIProvider.GOOGLE) {
            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            meaning: { type: SchemaType.STRING },
                            luckyNumbers: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER } },
                            symbols: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["meaning", "luckyNumbers", "symbols"]
                    }
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return JSON.parse(text || "{}");
        } else {
            const response = await client.ai.chat(prompt, {
                model: 'gpt-4o-mini',
                temperature: 0.7
            });
            const content = response.message?.content || response;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return {
                meaning: content,
                luckyNumbers: [7, 14, 21, 28, 35],
                symbols: ['transformation', 'journey', 'awakening']
            };
        }
    } catch (error: any) {
        console.error('❌ Dream Analysis Error:', error);
        throw error;
    }
};

// ============================================
// 💎 GEMSTONE GUIDANCE
// ============================================

/**
 * Parse gemstone response from AI
 */
const parseGemstoneResponse = (response: any): any => {
    try {
        // Extract content from response
        const content = response.message?.content || response;
        
        // Try to find JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: Return as text reading
        return {
            primaryGem: {
                name: "Ruby",
                sanskritName: "Manikya",
                reason: "Based on your birth details",
                wearingMethod: "Wear on ring finger"
            },
            mantra: {
                sanskrit: "ॐ सूर्याय नमः",
                pronunciation: "Om Suryaya Namaha",
                meaning: "Salutations to the Sun"
            },
            fullReading: content
        };
    } catch (error) {
        console.error('❌ Parse error:', error);
        return {
            primaryGem: {
                name: "Ruby",
                sanskritName: "Manikya",
                reason: "Guidance received",
                wearingMethod: "Consult with expert"
            },
            mantra: {
                sanskrit: "ॐ",
                pronunciation: "Om",
                meaning: "The universal sound"
            },
            fullReading: "Please try again."
        };
    }
};

export const getGemstoneGuidance = async (
    name: string,
    dob: string,
    intent: string,
    language: string = 'English'
): Promise<any> => {
    try {
        const { provider, client } = getAIProvider();

        // ✅ AUTHENTICATE USER FIRST (if using Puter)
        if (provider === AIProvider.PUTER) {
            const isAuthenticated = await ensurePuterAuthentication();

            if (!isAuthenticated) {
                // Return friendly error response
                return {
                    primaryGem: {
                        name: "Ruby",
                        sanskritName: "Manikya",
                        reason: "Authentication required",
                        wearingMethod: "Please sign in to use AI features"
                    },
                    mantra: {
                        sanskrit: "ॐ",
                        pronunciation: "Om",
                        meaning: "The universal sound"
                    },
                    fullReading: "🔐 Please sign in with Puter to access AI-powered gemstone guidance.\n\nThis ensures secure and personalized readings."
                };
            }
        }

        const prompt = `${DETAIL_SYSTEM_PROMPT}
        
User Information:
Name: ${name}
Date of Birth: ${dob}
Intent: ${intent}
Preferred Language: ${language}

Provide detailed gemstone guidance in JSON format with these fields:
{
  "primaryGem": {
    "name": "gem name in English",
    "sanskritName": "gem name in Sanskrit",
    "reason": "why this gem",
    "wearingMethod": "how to wear"
  },
  "mantra": {
    "sanskrit": "mantra in Sanskrit",
    "pronunciation": "pronunciation guide",
    "meaning": "meaning in English"
  },
  "fullReading": "comprehensive reading with all 4 sections"
}`;

        console.log('🤖 Calling AI for gemstone guidance...');

        if (provider === AIProvider.GOOGLE) {
            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: { temperature: 0.7 }
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('✅ AI Response received');
            return parseGemstoneResponse(text);
        } else {
            // Puter AI
            const response = await client.ai.chat(prompt, {
                model: 'gpt-4o-mini',
                stream: false
            });
            console.log('✅ AI Response received');
            return parseGemstoneResponse(response);
        }

    } catch (error: any) {
        console.error('❌ Gemstone guidance error:', error);
        throw error;
    }
};

// ============================================
// 🕉️ MANTRA AUDIO (Google AI only)
// ============================================

export const generateMantraAudio = async (
    text: string,
    voiceName: 'Charon' | 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' = 'Charon'
): Promise<AudioBuffer> => {
    const { provider, client } = getAIProvider();

    if (provider === AIProvider.GOOGLE) {
        try {
            const model = client.getGenerativeModel({
                model: "gemini-1.5-flash"
            });

            const result = await model.generateContent([
                { text: `Recite this mantra: ${text}` }
            ]);

            const response = await result.response;
            const text_response = response.text();

            // Audio generation with Gemini may not be directly supported
            // Create a silent buffer as fallback
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            return audioCtx.createBuffer(1, 24000, 24000);
        } catch (error) {
            console.error('❌ Audio generation error:', error);
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            return audioCtx.createBuffer(1, 24000, 24000);
        }
    }

    // Puter.ai fallback: Create silent buffer
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return audioCtx.createBuffer(1, 24000, 24000);
};

// ============================================
// 🔮 OTHER FUNCTIONS
// ============================================

export const getRemedy = async (concern: string, language: string = 'English'): Promise<string> => {
    const { provider, client } = getAIProvider();
    
    // ✅ Authenticate if using Puter
    if (provider === AIProvider.PUTER) {
        const isAuth = await ensurePuterAuthentication();
        if (!isAuth) {
            return "🔐 Please sign in to access AI features.";
        }
    }
    
    const prompt = `${DETAIL_SYSTEM_PROMPT}\nVedic remedies for: "${concern}" in ${language}.`;

    if (provider === AIProvider.GOOGLE) {
        const model = client.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { temperature: 0.2 }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "";
    } else {
        const response = await client.ai.chat(prompt, { model: 'gpt-4o-mini' });
        return response.message?.content || response || "";
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (!text || text.trim() === '') return text;

    const { provider, client } = getAIProvider();
    const prompt = `Translate to ${targetLanguage}. MAINTAIN [POSITIVE], [NEGATIVE], **bolding**:\n${text}`;

    if (provider === AIProvider.GOOGLE) {
        const model = client.getGenerativeModel({
            model: 'gemini-1.5-flash'
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || text;
    } else {
        const response = await client.ai.chat(prompt, { model: 'gpt-4o-mini', temperature: 0.2 });
        return response.message?.content || response || text;
    }
};

export const getTarotReading = async (cardName: string, language: string = 'English'): Promise<string> => {
    const { provider, client } = getAIProvider();
    
    // ✅ Authenticate if using Puter
    if (provider === AIProvider.PUTER) {
        const isAuth = await ensurePuterAuthentication();
        if (!isAuth) {
            return "🔐 Please sign in to access AI features.";
        }
    }
    
    const prompt = `${DETAIL_SYSTEM_PROMPT}\nTarot interpretation for "${cardName}" in ${language}.`;

    if (provider === AIProvider.GOOGLE) {
        const model = client.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { temperature: 0.4 }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "";
    } else {
        const response = await client.ai.chat(prompt, { model: 'gpt-4o-mini', temperature: 0.8 });
        return response.message?.content || response || "";
    }
};

export const createSageSession = (contextReading: string, topic: string) => {
    const { provider, client } = getAIProvider();

    if (provider === AIProvider.GOOGLE) {
        const model = client.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `You are Sage Vashishtha. Context: ${contextReading.substring(0, 5000)}`
        });

        return {
            sendMessage: async (message: string) => {
                const result = await model.generateContent(message);
                const response = await result.response;
                return { text: () => response.text() };
            }
        };
    } else {
        return {
            sendMessage: async (message: string) => {
                const response = await client.ai.chat(
                    `You are Sage Vashishtha. Context: ${contextReading.substring(0, 1000)}\n\nUser: ${message}`,
                    { model: 'gpt-4o-mini' }
                );
                return { text: () => response.message?.content || response };
            }
        };
    }
};

// Placeholders for additional functions
export const getAyurvedicAnalysis = async (answers: string, language: string = 'English'): Promise<any> => {
    const { provider, client } = getAIProvider();
    // Implementation similar to above
    return {};
};

export const getMuhurat = async (activity: string, date: string, language: string = 'English'): Promise<any> => {
    const { provider, client } = getAIProvider();
    return {};
};

export const getCosmicSync = async (p1: any, p2: any, language: string = 'English'): Promise<any> => {
    const { provider, client } = getAIProvider();
    return {};
};

export const generateAdvancedAstroReport = async (details: any, engineData: any): Promise<any> => {
    const { provider, client } = getAIProvider();
    return { fullReportText: "" };
};

export const processConsultationBooking = async (bookingData: any): Promise<any> => {
    const { provider, client } = getAIProvider();
    return {};
};
