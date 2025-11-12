// src/lib/gemini.ts
import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize the client with API key from environment
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate text from prompt
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Generate structured JSON response
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    
    // Extract JSON from response (handles markdown code blocks)
    const jsonMatch = text.match(/``````/) || text.match(/``````/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Gemini JSON parsing error:', error);
    throw new Error(`AI JSON generation failed: ${error.message}`);
  }
}

/**
 * Generate content with streaming (for chat)
 */
export async function* generateStream(prompt: string): AsyncGenerator<string> {
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of response.stream) {
      yield chunk.text;
    }
  } catch (error: any) {
    console.error('Gemini streaming error:', error);
    throw new Error(`AI streaming failed: ${error.message}`);
  }
}

/**
 * Helper: Get model instance for advanced use
 */
export function getGeminiClient() {
  return ai;
}
