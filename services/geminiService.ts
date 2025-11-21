
import { GoogleGenAI, SchemaType } from "@google/genai";

// Initialize the client
// process.env.API_KEY is assumed to be available
const API_KEY = process.env.API_KEY || 'AIzaSyDummy_Key_For_Testing';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
];

/**
 * Polishes the text to be more poetic or concise.
 */
export const polishText = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following text to be more poetic, concise, and evocative. Keep it under 280 characters. Text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini polish error:", error);
    return text; 
  }
};

/**
 * Suggests hashtags based on the text.
 */
export const suggestTags = async (text: string): Promise<string[]> => {
    if (!text.trim()) return [];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this text: "${text}". Suggest 3 relevant, trending social media hashtags. Return ONLY the hashtags separated by spaces. Example output: #art #design #colors`,
      });
      
      const raw = response.text || "";
      const tags = raw.split(' ').filter(t => t.startsWith('#')).slice(0, 3);
      return tags;
    } catch (error) {
      console.error("Gemini tag error:", error);
      return [];
    }
};

/**
 * Analyzes the sentiment of the text to suggest a color and icon.
 */
export const analyzeMood = async (text: string): Promise<{ color: string; icon: string } | null> => {
    if (!text.trim() || text.length < 10) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the sentiment and theme of this text: "${text}". 
            Return a JSON object with two fields:
            1. "color": Choose one strictly from [white, yellow, blue, rose, emerald, violet, dark].
            2. "icon": Choose one strictly from [Star, Feather, Mic, Music, Plane, Camera, Palette, Code, Cpu, Newspaper, Flame, Zap, Globe, Smile, Moon, Sun].
            
            Example: {"color": "blue", "icon": "Plane"}`,
            config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(response.text || "{}");
        return {
            color: result.color || 'white',
            icon: result.icon || 'Star'
        };
    } catch (error) {
        console.error("Gemini mood error:", error);
        return null;
    }
};

/**
 * Generates a smart reply for a note.
 */
export const generateSmartReply = async (noteContent: string, mood: string = 'supportive'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, engaging, human-like comment (under 100 chars) for this post: "${noteContent}". Tone: ${mood}. No quotes.`,
        });
        return response.text?.trim() || "";
    } catch (error) {
        return "";
    }
};
