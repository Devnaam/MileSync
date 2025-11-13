// src/lib/gemini.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is not defined in environment variables');
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Generate text from prompt using Gemini 2.0 Flash
 */
export async function generateText(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
    }

    const data: GeminiResponse = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No text in response');
    }

    return text;
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
    const text = await generateText(prompt);

    // Extract JSON from response (handles markdown code blocks)
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/``````/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Try to find JSON object/array
    const jsonMatch = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Gemini JSON parsing error:', error);
    throw new Error(`AI JSON generation failed: ${error.message}`);
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiAPI(): Promise<boolean> {
  try {
    const response = await generateText('Say "Hello, MileSync!" in exactly those words.');
    console.log('✅ Gemini API test successful:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }
}
