import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: 'What NBA team does Anthony Davis play for in the 2025-2026 season? Use Google Search if needed.',
    config: { tools: [{ googleSearch: {} }] }
  });
  console.log(response.text);
}

run();
