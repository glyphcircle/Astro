import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

// Initialize AI Client strictly according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  emotions?: string[];
  archetypes?: string[];
  guidance?: string;
}

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
   ### III. THE TEMPORAL FORECAST (Detailed predictions for the current year ${new Date().getFullYear()})
   ### IV. THE SACRED REMEDIES (Detailed, actionable bullet points for improvement)       
3. EVERY single insight must be a bullet point (starting with *).
4. USE [POSITIVE] at the start of a point for auspicious news.
5. USE [NEGATIVE] at the start of a point for warnings or challenges.
6. BOLD (using **) the most important 3-5 words in every single bullet point.
7. Language must be authoritative, ancient, and deeply mystical.
8. Ensure the text length is substantial (at least 600-800 words total).
`;

// ============================================
// 📖 CORE AI METHODS
// ============================================

export const getAstroNumeroReading = async (details: any): Promise<{ reading: string }> => {
  const seed = generateDeterministicSeed(details.name + details.dob + (details.mode || 'general'));      
  const prompt = `Provide a comprehensive 4-part ${details.mode} reading for ${details.name}, DOB ${details.dob}. Language: ${details.language || 'English'}.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      seed, 
      temperature: 0.2 
    }
  });
  return { reading: response.text || "The stars are currently silent." };
};

export const getTarotReading = async (cardName: string, language: string = 'English'): Promise<string> => {
  const seed = generateDeterministicSeed(cardName + language);
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a detailed Tarot reading for the card "${cardName}" in ${language}.`,
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      seed,
      temperature: 0.2
    }
  });
  return response.text || "";
};

export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<PalmMetricResponse> => {
  const reader = new FileReader();
  const base64Data = await new Promise<string>((resolve) => {
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(imageFile);
  });
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: imageFile.type, data: base64Data } },
        { text: `Analyze the palm lines in ${language}. Provide a detailed 4-part summary.` }
      ]
    },
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          textReading: { type: Type.STRING },
          metrics: { 
            type: Type.OBJECT, 
            properties: { 
              heartLine: { type: Type.NUMBER }, 
              lifeLine: { type: Type.NUMBER } 
            } 
          }
        }
      }
    }
  });
  const json = JSON.parse(response.text || "{}");
  return { rawMetrics: json.metrics || {}, textReading: json.textReading || "Analysis complete." };
};

export const getFaceReading = async (imageFile: File, language: string = 'English', dob?: string): Promise<FaceMetricResponse> => {
  const reader = new FileReader();
  const base64Data = await new Promise<string>((resolve) => {
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(imageFile);
  });
  const ageContext = dob ? `User birth date: ${dob}. ` : '';

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: imageFile.type, data: base64Data } },
        { text: `${ageContext}Perform Vedic face reading in ${language}. Provide a 4-part summary.` }
      ]
    },
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          textReading: { type: Type.STRING },
          metrics: { type: Type.OBJECT, properties: { symmetry: { type: Type.NUMBER } } }
        }
      }
    }
  });
  const json = JSON.parse(response.text || "{}");
  return { rawMetrics: json.metrics || {}, textReading: json.textReading || "Analysis complete." };
};

export const analyzeDream = async (dreamText: string, language: string = 'English'): Promise<DreamAnalysisResponse> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Interpret dream in ${language}: "${dreamText}". Provide meaning, lucky numbers (array), symbols (array), emotions (array), and archetypes (array).`,
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meaning: { type: Type.STRING },
          luckyNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
          symbols: { type: Type.ARRAY, items: { type: Type.STRING } },
          emotions: { type: Type.ARRAY, items: { type: Type.STRING } },
          archetypes: { type: Type.ARRAY, items: { type: Type.STRING } },
          guidance: { type: Type.STRING }
        },
        required: ["meaning", "luckyNumbers", "symbols"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getGemstoneGuidance = async (name: string, dob: string, intent: string, language: string = 'English'): Promise<any> => {
  const seed = generateDeterministicSeed(name + dob);
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `User: ${name}, DOB: ${dob}. Intent: ${intent}. Language: ${language}. TASK: Provide a comprehensive Gemstone & Mantra Decree.`,
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      seed,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryGem: { 
            type: Type.OBJECT, 
            properties: { 
              name: { type: Type.STRING }, 
              sanskritName: { type: Type.STRING }, 
              reason: { type: Type.STRING }, 
              wearingMethod: { type: Type.STRING } 
            }
          },
          mantra: { 
            type: Type.OBJECT, 
            properties: { 
              sanskrit: { type: Type.STRING }, 
              pronunciation: { type: Type.STRING }, 
              meaning: { type: Type.STRING } 
            }
          },
          fullReading: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRemedy = async (concern: string, language: string = 'English'): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Vedic remedies for: "${concern}" in ${language}.`,
    config: { 
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      temperature: 0.2 
    }
  });
  return response.text || "";
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || text.trim() === '') return text;
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate this text into ${targetLanguage}. Maintain formatting and bolding. Text: ${text}`,
    config: {
      temperature: 0.1
    }
  });
  return response.text || text;
};

export const createSageSession = (contextReading: string, topic: string) => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Sage Vashishtha. Answer briefly using this context: ${contextReading.substring(0, 5000)}`
    }
  });
};

export const generateAdvancedAstroReport = async (details: any, engineData: any): Promise<any> => {
  const prompt = `Generate a 3000-word Vedic astrology report for ${details.name} (DOB: ${details.dob}). Context: ${JSON.stringify(engineData)}.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return { fullReportText: response.text };
};

export const processConsultationBooking = async (bookingData: any): Promise<any> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Process this booking: ${JSON.stringify(bookingData, null, 2)}`,
    config: {
      systemInstruction: "You are a Vedic Master booking assistant.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confirmationId: { type: Type.STRING },
          emailBody: { type: Type.STRING },
          preliminaryInsights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, observation: { type: Type.STRING }, recommendation: { type: Type.STRING } } } },
          nextSteps: { type: Type.OBJECT, properties: { timeline: { type: Type.STRING }, contactMethod: { type: Type.STRING }, preparation: { type: Type.STRING } } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getAyurvedicAnalysis = async (answers: string, language: string = 'English'): Promise<any> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Ayurveda analysis for: ${answers} in ${language}.`,
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
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
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Shubh Muhurat for ${activity} on ${date} in ${language}.`,
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          bestTime: { type: Type.STRING }, 
          rating: { type: Type.STRING }, 
          reason: { type: Type.STRING }, 
          fullReading: { type: Type.STRING } 
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getCosmicSync = async (p1: any, p2: any, language: string = 'English'): Promise<any> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compatibility Sync: P1 ${JSON.stringify(p1)}, P2 ${JSON.stringify(p2)} in ${language}.`,
    config: {
      systemInstruction: DETAIL_SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          compatibilityScore: { type: Type.NUMBER }, 
          relationshipType: { type: Type.STRING }, 
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          challenges: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          fullReading: { type: Type.STRING } 
        } 
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateMantraAudio = async (text: string): Promise<AudioBuffer> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: `Recite this mantra with ancient resonance: ${text}`,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio returned from the celestial realms.");

  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
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
  };

  return await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
};