import { GoogleGenAI, Type } from "@google/genai";
import type { Prediction, OddsFormat } from '../types';

// FIX: Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Define the JSON schema for the prediction response to ensure structured output from the model.
const predictionSchema = {
  type: Type.OBJECT,
  properties: {
    winner: { 
      type: Type.STRING,
      description: "The predicted winning team."
    },
    loser: {
      type: Type.STRING,
      description: "The predicted losing team."
    },
    confidence: {
      type: Type.STRING,
      description: "Confidence level of the prediction (High, Medium, or Low).",
      enum: ["High", "Medium", "Low"]
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "A numerical confidence score between 0 and 1 (e.g., 0.85 for 85%)."
    },
    analysis: {
      type: Type.STRING,
      description: "A brief analysis (2-3 sentences) of the matchup, explaining the reasoning for the prediction."
    },
    odds: {
      type: Type.OBJECT,
      properties: {
        winner: {
          type: Type.STRING,
          description: "The predicted odds for the winning team as a string (e.g., '+150' for American, '2.50' for Decimal)."
        },
        loser: {
          type: Type.STRING,
          description: "The predicted odds for the losing team as a string (e.g., '-180' for American, '1.65' for Decimal)."
        }
      },
      required: ["winner", "loser"]
    }
  },
  required: ["winner", "loser", "confidence", "confidenceScore", "analysis", "odds"]
};

// FIX: Implement the getPrediction function to call the Gemini API.
export const getPrediction = async (
  sport: string,
  teamA: string,
  teamB: string,
  oddsFormat: OddsFormat
): Promise<Prediction> => {

  const prompt = `
    Analyze the upcoming ${sport} match between "${teamA}" and "${teamB}". 
    Provide a prediction for the winner.
    Your analysis should be based on factors like recent performance, player stats, injuries, and historical head-to-head matchups.
    Determine a confidence level for your prediction (High, Medium, or Low) and a corresponding numerical score between 0.0 and 1.0 (e.g., High might be 0.8-1.0).
    Provide a concise analysis (2-3 sentences) explaining your prediction.
    Finally, calculate the betting odds in ${oddsFormat} format and return them as strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: predictionSchema,
        temperature: 0.3,
      },
    });

    const text = response.text.trim();
    const predictionResult: Prediction = JSON.parse(text);

    return predictionResult;

  } catch (error) {
    console.error("Error fetching prediction from Gemini API:", error);
    throw new Error("Failed to get prediction from the AI assistant.");
  }
};
