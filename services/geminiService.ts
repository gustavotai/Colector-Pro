import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Edits an image using Gemini 2.5 Flash Image based on a text prompt.
 * @param base64Image The source image in base64 format.
 * @param prompt The user's instruction for editing (e.g., "Add a retro filter").
 * @returns The edited image as a base64 string.
 */
export const editCarImage = async (base64Image: string, prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Ensure we strip the data URI prefix if present for the API call
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  
  // Detect mime type roughly from the header or default to jpeg
  let mimeType = 'image/jpeg';
  if (base64Image.startsWith('data:image/png')) mimeType = 'image/png';
  else if (base64Image.startsWith('data:image/webp')) mimeType = 'image/webp';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Edit this image: ${prompt}. Return ONLY the edited image.`,
          },
        ],
      },
      // Note: responseMimeType is not supported for nano banana models
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from Gemini.");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};