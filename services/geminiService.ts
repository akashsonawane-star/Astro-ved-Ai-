import { GoogleGenAI, Type } from "@google/genai";
import { Language, HoroscopeTimeframe } from "../types";

const MODEL = "gemini-3-flash-preview";

const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Mock Data Generators for Fallback ---

const getMockHoroscope = (sign: string) => {
  const colors = [
    "Gold", "Crimson", "Royal Blue", "Emerald", "Violet", "Silver", "Orange", 
    "Pearl White", "Teal", "Lavender", "Amber", "Ruby Red", "Deep Sea Blue", 
    "Forest Green", "Sunset Orange", "Electric Purple", "Rose Pink"
  ];
  const moods = [
    "Optimistic", "Reflective", "Energetic", "Calm", "Ambitious", "Creative", 
    "Cautious", "Joyful", "Determined", "Peaceful", "Spiritual", "Productive"
  ];
  
  // Create a unique seed for this sign and today's date
  // signSeed: Sum of char codes of sign name
  const signSeed = sign.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const date = new Date();
  const dateSeed = date.getDate() + (date.getMonth() * 31);
  const finalSeed = signSeed + dateSeed;

  const randomColor = colors[finalSeed % colors.length];
  const randomMood = moods[finalSeed % moods.length];
  const randomNum = (finalSeed % 98) + 1; // Range 1-99

  return {
    prediction: `The stars align for ${sign}. Today brings a unique opportunity for growth and connection. Focus on your long-term goals while staying grounded in the present moment. This cosmic window suggests a time of transformation. (Offline Mode)`,
    luckyNumber: randomNum.toString(),
    luckyColor: randomColor,
    mood: randomMood
  };
};

const getMockKundli = (name: string) => ({
  personality: `${name}, you possess a strong will and a creative mind. This is a sample reading as the cosmic servers are busy.`,
  career: "You are destined for leadership roles. Persistence is your key to success.",
  relationships: "Harmony is essential for you. You value deep, meaningful connections.",
  health: "Focus on maintaining a balanced diet and regular meditation.",
  planetary: "Mars is exerting a strong influence, giving you energy and drive.",
  rashi: "Aries (Sample)",
  nakshatra: "Ashwini (Sample)"
});

const getMockCompatibility = () => ({
  score: 85,
  strengths: ["Strong emotional bond", "Shared values", "Excellent communication"],
  challenges: ["Occasional stubbornness", "Different spending habits"],
  advice: "Focus on your shared goals and communicate openly. This is a great match.",
  emotional: "High emotional resonance.",
  communication: "Very open and honest.",
  longTerm: "A promising future together.",
  luckyElements: "Blue, Friday"
});

// --- API Functions ---

export const getDailyHoroscope = async (sign: string, language: Language, timeframe: HoroscopeTimeframe = HoroscopeTimeframe.TODAY) => {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Prompt is now much more demanding regarding uniqueness
  const prompt = `Act as a master Vedic Astrologer. Generate a highly specific ${timeframe.toLowerCase()} horoscope for ${sign} for exactly ${dateStr} in ${language} language. 
  CRITICAL: The lucky number, lucky color, and mood MUST be uniquely calculated based on the planetary transits for ${sign} on this specific day. Do not return generic values.
  
  Include:
  1. A prediction (4-6 lines)
  2. A lucky number (1-99)
  3. A specific lucky color (e.g., 'Burnt Sienna', 'Emerald Green', 'Electric Blue')
  4. Current mood (one descriptive word).
  
  Ensure the tone is professional, mystical, and culturally relevant to Vedic traditions.`;
  
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            luckyNumber: { type: Type.STRING },
            luckyColor: { type: Type.STRING },
            mood: { type: Type.STRING },
          },
          required: ["prediction", "luckyNumber", "luckyColor", "mood"],
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Horoscope Error:", error);
    return getMockHoroscope(sign);
  }
};

export const getKundliInsight = async (
  details: { name: string; dob: string; tob: string; pob: string },
  language: Language
) => {
  const prompt = `Generate a detailed Vedic Kundli report for Name: ${details.name}, DOB: ${details.dob}, TOB: ${details.tob}, Place: ${details.pob}. Language: ${language}. Use model gemini-3-pro-preview for depth. Provide: 1) Core Personality, 2) Career Path, 3) Relationship Outlook, 4) Health, 5) Planetary Influences.`;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personality: { type: Type.STRING },
            career: { type: Type.STRING },
            relationships: { type: Type.STRING },
            health: { type: Type.STRING },
            planetary: { type: Type.STRING },
            rashi: { type: Type.STRING, description: "Moon Sign" },
            nakshatra: { type: Type.STRING },
          },
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Kundli Error:", error);
    return getMockKundli(details.name || "User");
  }
};

export const getCompatibility = async (
  p1: { name?: string; dob?: string; rashi: string; gender?: string },
  p2: { name?: string; dob?: string; rashi: string; gender?: string },
  type: string,
  language: Language
) => {
  const prompt = `Analyze astrological compatibility for ${type} between Person A (Rashi: ${p1.rashi}, Gender: ${p1.gender || 'Unknown'}) and Person B (Rashi: ${p2.rashi}, Gender: ${p2.gender || 'Unknown'}). Language: ${language}. Provide:
  1. Compatibility Score (0-100)
  2. List of strengths (3-5 points)
  3. List of challenges (3-5 points)
  4. Detailed advice
  5. Emotional Compatibility analysis
  6. Communication Compatibility analysis
  7. Long-term outlook
  8. Lucky elements (colors, days) for the couple.`;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING },
            emotional: { type: Type.STRING },
            communication: { type: Type.STRING },
            longTerm: { type: Type.STRING },
            luckyElements: { type: Type.STRING },
          },
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Compatibility Error:", error);
    return getMockCompatibility();
  }
};

export const getAstroChatResponse = async (
  history: { role: string; text: string }[],
  message: string,
  language: Language
) => {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: MODEL,
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: {
        systemInstruction: `You are Astro Ved AI, a wise and empathetic Vedic Astrologer. Answer strictly in ${language}. Keep answers mystical yet practical, positive, and culturally respectful. Use astrological terminology.`,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "The stars are currently aligning (API Limit Reached). Please try asking again in a few moments, or check your connection.";
  }
};