import { GoogleGenAI, Type } from "@google/genai";
import { Language, HoroscopeTimeframe } from "../types";

const MODEL = "gemini-2.5-flash";

const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Mock Data Generators for Fallback ---

const getMockHoroscope = (sign: string) => {
  const colors = ["Gold", "Crimson", "Royal Blue", "Emerald", "Violet", "Silver", "Orange", "White", "Teal", "Lavender"];
  const moods = ["Optimistic", "Reflective", "Energetic", "Calm", "Ambitious", "Creative", "Cautious", "Joyful"];
  
  // Simple deterministic random based on date + sign length to vary it daily/per sign
  const seed = new Date().getDate() + sign.length;
  const randomColor = colors[seed % colors.length];
  const randomMood = moods[seed % moods.length];
  const randomNum = (seed % 9) + 1;

  return {
    prediction: `The cosmic alignment for ${sign} suggests a day of reflection and growth. While the stars are currently reorganizing their energy, focus on your inner strength. Good things are coming your way. (Offline Mode)`,
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
  const prompt = `Generate a ${timeframe.toLowerCase()} horoscope for ${sign} for date: ${dateStr} in ${language} language. 
  Ensure the response is unique for today.
  Include:
  1. A prediction (4-6 lines)
  2. A lucky number (1-99)
  3. A lucky color (specific, e.g., 'Deep Red')
  4. Current mood (one word).
  Ensure cultural relevance.`;
  
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
  const prompt = `Generate a detailed Vedic Kundli report for Name: ${details.name}, DOB: ${details.dob}, TOB: ${details.tob}, Place: ${details.pob}. Language: ${language}. Provide: 1) Core Personality, 2) Career Path, 3) Relationship Outlook, 4) Health, 5) Planetary Influences.`;

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