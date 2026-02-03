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
  // Convert Uint8 (Bytes) to Int16 (PCM)
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

  // 🔍 ROBUST EXTRACTION: Loop candidates and parts to find audio data
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

export const generateAdvancedAstroReport = async (details: any, chartData: any): Promise<any> => {
  const ai = getAi();
  const seed = generateDeterministicSeed(details.name + details.dob);
  
  const prompt = `You are a highly experienced Vedic astrologer with deep knowledge of traditional Jyotish principles. Generate a comprehensive, personalized Vedic astrology report in ${details.language}.
  
  **Birth Details:**
  - Name: ${details.name}
  - Date of Birth: ${details.dob}
  - Time of Birth: ${details.tob}
  - Place of Birth: ${details.pob}
  - Calculated Chart Data: ${JSON.stringify(chartData)}
  
  Use Lahiri Ayanamsa, Sidereal zodiac. Include predictions for ${new Date().getFullYear()} and next 5 years.
  Provide deep psychological and spiritual guidance.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      seed,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          basicInfo: {
            type: Type.OBJECT,
            properties: {
              sunSign: { type: Type.STRING },
              moonSign: { type: Type.STRING },
              ascendant: { type: Type.STRING },
              nakshatra: { type: Type.STRING },
              nakshatraPada: { type: Type.STRING },
              nakshatraLord: { type: Type.STRING },
              tithi: { type: Type.STRING },
              yoga: { type: Type.STRING },
              varna: { type: Type.STRING },
              yoni: { type: Type.STRING },
              gana: { type: Type.STRING }
            }
          },
          planetaryPositions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                planet: { type: Type.STRING },
                sign: { type: Type.STRING },
                degree: { type: Type.STRING },
                house: { type: Type.INTEGER },
                strength: { type: Type.STRING },
                dignity: { type: Type.STRING }
              }
            }
          },
          houseAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                house: { type: Type.INTEGER },
                significance: { type: Type.STRING },
                interpretation: { type: Type.STRING }
              }
            }
          },
          yogasPresent: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                yogaName: { type: Type.STRING },
                description: { type: Type.STRING },
                effects: { type: Type.STRING }
              }
            }
          },
          lifeAreas: {
            type: Type.OBJECT,
            properties: {
              personality: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, detailed: { type: Type.STRING } } },
              career: { type: Type.OBJECT, properties: { advice: { type: Type.STRING }, detailed: { type: Type.STRING } } },
              finance: { type: Type.OBJECT, properties: { advice: { type: Type.STRING }, detailed: { type: Type.STRING } } },
              relationships: { type: Type.OBJECT, properties: { familyLife: { type: Type.STRING }, detailed: { type: Type.STRING } } }
            }
          },
          remedies: {
            type: Type.OBJECT,
            properties: {
              gemstones: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { stone: { type: Type.STRING }, purpose: { type: Type.STRING } } } },
              mantras: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { mantra: { type: Type.STRING }, purpose: { type: Type.STRING } } } }
            }
          },
          summary: {
            type: Type.OBJECT,
            properties: {
              overallAssessment: { type: Type.STRING },
              lifeAdvice: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
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