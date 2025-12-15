import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Movie, Interaction, Recommendation } from "../types";

// Initialize Gemini
// CRITICAL: The API key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const movieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    year: { type: Type.INTEGER },
    genre: { type: Type.STRING },
    director: { type: Type.STRING },
    plot: { type: Type.STRING },
    visualVibe: { type: Type.STRING, description: "A 3-word visual description of the movie tone for an image generator (e.g. 'dark rainy city')" },
  },
  required: ["title", "year", "genre", "director", "plot", "visualVibe"],
};

export const getCalibrationMovies = async (): Promise<Movie[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Vygeneruj seznam 8 velmi odlišných filmů (mix žánrů: sci-fi, drama, komedie, horor, indie, klasika), které použiji k otestování vkusu uživatele. Filmy by měly být známé, ale ne jen Marvelovky. Odpověz česky.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: movieSchema,
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((m: any, index: number) => ({ ...m, id: `init-${index}` }));
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Error fetching calibration movies:", error);
    throw error;
  }
};

export const getRecommendation = async (history: Interaction[]): Promise<Recommendation> => {
  try {
    const liked = history.filter(h => h.type === 'liked' || h.type === 'seen_liked').map(h => h.movieTitle);
    const disliked = history.filter(h => h.type === 'disliked').map(h => h.movieTitle);

    const prompt = `
      Jsi filmový expert. Na základě interakcí uživatele doporuč JEDEN perfektní film, který by měl vidět dnes večer.
      
      Líbily se (nebo chce vidět): ${liked.join(", ")}
      Nelíbily se: ${disliked.join(", ")}
      
      Vyber film, který NENÍ v seznamu výše. Může to být skrytý klenot nebo moderní klasika.
      Vysvětli, proč jsi ho vybral ("reason") a odhadni shodu v procentech ("matchScore").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.INTEGER },
            genre: { type: Type.STRING },
            director: { type: Type.STRING },
            plot: { type: Type.STRING },
            reason: { type: Type.STRING, description: "Personalizovaný důvod v češtině, proč se to bude uživateli líbit." },
            matchScore: { type: Type.INTEGER },
            similarTo: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualVibe: { type: Type.STRING },
          },
          required: ["title", "year", "genre", "director", "plot", "reason", "matchScore", "similarTo"],
        },
        thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for better matching
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return { ...data, id: 'rec-1' };
    }
    throw new Error("No recommendation returned");
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;
  }
};
