import { GoogleGenAI, Type, Modality } from "@google/genai";

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

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
ACT AS: A High Priest of Vedic Sciences.
TASK: Generate an IMPERIAL REPORT that is comprehensive, deeply detailed, and spans multiple sections.
FORMATTING RULES (STRICT):
1. NEVER output short responses. The user has paid for this; provide a MASTERPIECE.       
2. STRUCTURE the report into exactly these 4 Sections using Markdown Headers (###):       
   ### I. THE CELESTIAL ESSENCE (Introduction & Core Soul Purpose)
   ### II. THE ASTRAL CONFIGURATION (Detailed Planetary/Numerical breakdown)
   ### III. THE TEMPORAL FORECAST (Detailed predictions for the current year ${new Date().getFullYear()})
   ### IV. THE SACRED REMEDIES (Detailed, actionable bullet points for improvement)       
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

export const processConsultationBooking = async (bookingData: any): Promise<any> => {
  const ai = getAi();
  const systemInstruction = `You are a Master Vedic Astrologer AI assistant for DAKSHINA - an ancient wisdom consultation platform. 
  Your role is to handle consultation requests, provide preliminary guidance, and manage the booking workflow.
  
  TASK:
  1. Confirm payment receipt.
  2. Acknowledge user's consultation type and report context.
  3. Provide 2-3 specific preliminary insights based on their service type (astrology, numerology, etc.).
  4. Suggest at least 3 actionable remedies (mantra, gemstone, etc.) connected to their context.
  5. Set a clear agenda for their consultation or delivery.
  
  Tone: Mystical yet Professional, Empathetic, Reassuring. Use Sanskrit terms like Rahu, Ketu, Nakshatra.
  
  Mental Invocation: "Om Gam Ganapataye Namah" - guide me to serve this soul's highest good.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Process this booking request and generate the confirmation response:
    ${JSON.stringify(bookingData, null, 2)}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confirmationId: { type: Type.STRING },
          emailSubject: { type: Type.STRING },
          emailBody: { type: Type.STRING },
          smsNotification: { type: Type.STRING },
          preliminaryInsights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                observation: { type: Type.STRING },
                recommendation: { type: Type.STRING }
              }
            }
          },
          suggestedRemedies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                item: { type: Type.STRING },
                timing: { type: Type.STRING },
                duration: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          consultationAgenda: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextSteps: {
            type: Type.OBJECT,
            properties: {
              timeline: { type: Type.STRING },
              contactMethod: { type: Type.STRING },
              preparation: { type: Type.STRING }
            }
          },
          internalNotes: { type: Type.STRING }
        },
        required: ["confirmationId", "emailSubject", "emailBody", "preliminaryInsights", "nextSteps"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getGemstoneGuidance = async (name: string, dob: string, intent: string, language: string = 'English'): Promise<any> => {
  const ai = getAi();
  const seed = generateDeterministicSeed(name + dob);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\n
    User: ${name}, DOB: ${dob}. Intent: ${intent}. Language: ${language}.
    TASK: Provide a comprehensive Gemstone & Mantra Decree. Include a deeply detailed wearing ritual and lifetime impact analysis.`,
    config: {
      seed,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryGem: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sanskritName: { type: Type.STRING }, reason: { type: Type.STRING }, wearingMethod: { type: Type.STRING } } },
          mantra: { type: Type.OBJECT, properties: { sanskrit: { type: Type.STRING }, pronunciation: { type: Type.STRING }, meaning: { type: Type.STRING } } },
          fullReading: { type: Type.STRING }
        },
        required: ["primaryGem", "mantra", "fullReading"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateMantraAudio = async (text: string, voiceName: 'Charon' | 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' = 'Charon'): Promise<AudioBuffer> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Recite this mantra with ancient resonance and perfect clarity: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
    },
  });

  let base64Audio: string | undefined;
  if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
              base64Audio = part.inlineData.data;
              break;
          }
      }
  }

  if (!base64Audio) {
      throw new Error("No audio returned from the celestial realms.");
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const rawBytes = decodeBase64ToUint8(base64Audio);
  return await decodePcmToAudioBuffer(rawBytes, audioCtx, 24000, 1);
};

export const getAstroNumeroReading = async (details: any): Promise<{ reading: string }> => {
  const ai = getAi();
  const seed = generateDeterministicSeed(details.name + details.dob + details.mode);      
  let prompt = `${DETAIL_SYSTEM_PROMPT}\nProvide a comprehensive 4-part ${details.mode} reading for ${details.name}, DOB ${details.dob}. Language: ${details.language}. Spend significant time on the 'Temporal Forecast' section for ${new Date().getFullYear()}.`;

  const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { seed, temperature: 0.2 }
  });
  return { reading: response.text || "The stars are currently silent." };
};

export const generateAdvancedAstroReport = async (details: any, engineData: any): Promise<any> => {
  console.log('🚀 [Gemini] Generating Advanced 3000-word Report for:', details.name);
  const ai = getAi();
  
  const prompt = `Generate a comprehensive Vedic astrology report for ${details.name} born on ${details.dob}.

Birth Details:
- Ascendant: ${engineData.lagna?.signName}
- Moon Sign: ${engineData.panchang?.nakshatra} (Rashi)
- Sun Sign: ${engineData.planets?.find((p: any) => p.name === 'Sun')?.signName}
- Nakshatra: ${engineData.lagna?.nakshatra}
- Planetary Positions: ${JSON.stringify(engineData.planets)}

Create a detailed report with these sections:

1. BIRTH CHART OVERVIEW (300 words)
2. PLANETARY POSITIONS & STRENGTH (500 words)
3. HOUSE ANALYSIS - All 12 Houses (800 words)
4. DASHA PERIODS & TIMELINE (300 words)
5. CAREER & PROFESSION (400 words)
6. RELATIONSHIPS & MARRIAGE (400 words)
7. HEALTH & VITALITY (300 words)
8. FINANCIAL PROSPECTS (300 words)
9. SPIRITUAL PATH (200 words)
10. FAVORABLE PERIODS (200 words)
11. CHALLENGES & REMEDIES (300 words)
12. YOGAS & COMBINATIONS (200 words)

Use markdown formatting. Be detailed and specific. Use user's name ${details.name} throughout. Language: ${details.language}. Total: minimum 3000 words.`;

  // Timeout logic - 25 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    clearTimeout(timeoutId);
    return { fullReportText: response.text };
  } catch (error: any) {
    console.error('❌ [Gemini] Advanced Report failed:', error);
    if (error.name === 'AbortError') {
      throw new Error('Celestial timeout: The stars took too long to align. Please retry.');
    }
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || text.trim() === '') return text;
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate this exhaustive Vedic Imperial Decree into ${targetLanguage}. 
    CRITICAL RULES:
    1. MAINTAIN ALL [POSITIVE], [NEGATIVE], and **bolding** tags exactly as they appear.
    2. KEEP the Section Headers (### I, ### II, etc.) exactly in English structure but translate the content.
    3. Ensure the tone remains authoritative and mystical.
    4. Text to translate: ${text}`
  });
  return response.text || text;
};

export const createSageSession = (contextReading: string, topic: string) => {
  const ai = getAi();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Sage Vashishtha. Answer briefly using the provided reading as context: ${contextReading.substring(0, 5000)}`
    }
  });
};

export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<PalmMetricResponse> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType: imageFile.type, data: await fileToBase64(imageFile) } }, { text: `${DETAIL_SYSTEM_PROMPT}\nAnalyze palm lines in ${language}. Generate an exhaustive 4-part study.` }] },
    config: { temperature: 0.2, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { textReading: { type: Type.STRING } } } }
  });
  const json = JSON.parse(response.text || "{}");
  return { rawMetrics: json, textReading: json.textReading || "Analysis complete." };     
};

export const getFaceReading = async (imageFile: File, language: string = 'English'): Promise<FaceMetricResponse> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType: imageFile.type, data: await fileToBase64(imageFile) } }, { text: `${DETAIL_SYSTEM_PROMPT}\nVedic Face reading in ${language}. Provide a massive 4-part physiological profile.` }] },
    config: { temperature: 0.2, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { textReading: { type: Type.STRING } } } }
  });
  const json = JSON.parse(response.text || "{}");
  return { rawMetrics: json, textReading: json.textReading || "Analysis complete." };     
};

export const analyzeDream = async (dreamText: string, language: string = 'English'): Promise<DreamAnalysisResponse> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\nInterpret dream in ${language}: "${dreamText}". Provide an exhaustive 4-part subconscious map.`,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { meaning: { type: Type.STRING }, luckyNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }, symbols: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["meaning", "luckyNumbers", "symbols"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRemedy = async (concern: string, language: string = 'English'): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\nVedic remedies for: "${concern}" in ${language}. Provide a comprehensive 4-part spiritual survival guide.`,
    config: { temperature: 0.2 }
  });
  return response.text || "";
};

export const getAyurvedicAnalysis = async (answers: string, language: string = 'English'): Promise<any> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\nAyurveda analysis for: ${answers} in ${language}. Generate an exhaustive 4-part lifestyle constitution plan.`,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dosha: { type: Type.STRING },
          breakdown: { type: Type.OBJECT, properties: { vata: { type: Type.NUMBER }, pitta: { type: Type.NUMBER }, kapha: { type: Type.NUMBER } } },
          diet: { type: Type.ARRAY, items: { type: Type.STRING } },
          lifestyle: { type: Type.ARRAY, items: { type: Type.STRING } },
          fullReading: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getMuhurat = async (activity: string, date: string, language: string = 'English'): Promise<any> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\nShubh Muhurat for ${activity} on ${date} in ${language}. Exhaustive 4-part temporal study required.`,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { bestTime: { type: Type.STRING }, rating: { type: Type.STRING }, reason: { type: Type.STRING }, fullReading: { type: Type.STRING } }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getCosmicSync = async (p1: any, p2: any, language: string = 'English'): Promise<any> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\nCompatibility Sync: P1 ${JSON.stringify(p1)}, P2 ${JSON.stringify(p2)} in ${language}. Generate a massive 4-part union analysis.`,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { compatibilityScore: { type: Type.NUMBER }, relationshipType: { type: Type.STRING }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, challenges: { type: Type.ARRAY, items: { type: Type.STRING } }, fullReading: { type: Type.STRING } } 
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getTarotReading = async (cardName: string, language: string = 'English'): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${DETAIL_SYSTEM_PROMPT}\nTarot interpretation for "${cardName}" in ${language}. Deliver an exhaustive 4-part archaeological soul study.`,
    config: { temperature: 0.4 }
  });
  return response.text || "";
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};