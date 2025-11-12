// src/services/ai.service.ts
import { generateJSON } from '@/lib/gemini';
import { GoalType } from '@/types/goal.types';

export interface ClarificationQuestion {
  id: string;
  question: string;
  context: string;
  expectedAnswerType: 'text' | 'choice' | 'number';
  choices?: string[];
}

export interface ClarificationResponse {
  questions: ClarificationQuestion[];
}

export class AIService {
  /**
   * Generate clarification questions for a goal
   */
  // src/services/ai.service.ts - Update only the generateClarificationQuestions function
static async generateClarificationQuestions(
  goalTitle: string,
  goalDescription: string | null,
  goalType: GoalType,
  duration: number,
  hoursPerDay: number
): Promise<ClarificationQuestion[]> {
  const prompt = `You are an AI mentor helping someone achieve their goal. Generate 3 specific, actionable clarification questions to better understand their goal and create a personalized plan.

Goal Details:
- Title: "${goalTitle}"
- Description: ${goalDescription || 'Not provided'}
- Type: ${goalType}
- Duration: ${duration} days
- Daily commitment: ${hoursPerDay} hours/day

Generate exactly 3 questions that will help you:
1. Understand their current level/experience
2. Identify specific outcomes or projects they want
3. Discover constraints, preferences, or focus areas

Rules:
- Questions must be specific to THIS goal
- Avoid generic questions
- Each question should help create a better personalized plan
- Keep questions concise and clear

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "id": "q1",
      "question": "Your question here?",
      "context": "Why this question helps",
      "expectedAnswerType": "text"
    }
  ]
}`;

  try {
    console.log('🤖 Calling Gemini API for clarification questions...');
    const response = await generateJSON<ClarificationResponse>(prompt);
    console.log('✅ Gemini API successful');
    return response.questions;
  } catch (error: any) {
    console.error('❌ Gemini API failed:', error.message);
    console.log('📋 Using fallback questions for', goalType);
    // Fallback questions based on goal type
    return this.getFallbackQuestions(goalType);
  }
}


  /**
   * Fallback questions if AI fails
   */
  private static getFallbackQuestions(goalType: GoalType): ClarificationQuestion[] {
    const fallbacks: Record<GoalType, ClarificationQuestion[]> = {
      [GoalType.ACADEMIC]: [
        {
          id: 'q1',
          question: 'What is your current level of understanding in this subject?',
          context: 'Helps tailor content difficulty',
          expectedAnswerType: 'text',
        },
        {
          id: 'q2',
          question: 'Do you have specific topics or chapters you need to focus on?',
          context: 'Prioritizes content',
          expectedAnswerType: 'text',
        },
        {
          id: 'q3',
          question: 'What resources do you currently have (textbooks, courses, etc.)?',
          context: 'Plans around available materials',
          expectedAnswerType: 'text',
        },
      ],
      [GoalType.SKILL]: [
        {
          id: 'q1',
          question: 'What is your current experience level with this skill?',
          context: 'Determines starting point',
          expectedAnswerType: 'text',
        },
        {
          id: 'q2',
          question: 'Do you have a specific project or outcome in mind?',
          context: 'Sets concrete goals',
          expectedAnswerType: 'text',
        },
        {
          id: 'q3',
          question: 'What tools or technologies do you want to focus on?',
          context: 'Narrows scope',
          expectedAnswerType: 'text',
        },
      ],
      [GoalType.FITNESS]: [
        {
          id: 'q1',
          question: 'What is your current fitness level?',
          context: 'Sets appropriate difficulty',
          expectedAnswerType: 'text',
        },
        {
          id: 'q2',
          question: 'Do you have any physical limitations or injuries?',
          context: 'Ensures safety',
          expectedAnswerType: 'text',
        },
        {
          id: 'q3',
          question: 'What equipment or facilities do you have access to?',
          context: 'Plans realistic exercises',
          expectedAnswerType: 'text',
        },
      ],
      [GoalType.CAREER]: [
        {
          id: 'q1',
          question: 'What is your current role and experience?',
          context: 'Understands baseline',
          expectedAnswerType: 'text',
        },
        {
          id: 'q2',
          question: 'What specific career outcome are you targeting?',
          context: 'Defines success criteria',
          expectedAnswerType: 'text',
        },
        {
          id: 'q3',
          question: 'What skills or certifications do you need?',
          context: 'Identifies gaps',
          expectedAnswerType: 'text',
        },
      ],
      [GoalType.CREATIVE]: [
        {
          id: 'q1',
          question: 'What is your experience with this creative skill?',
          context: 'Sets starting difficulty',
          expectedAnswerType: 'text',
        },
        {
          id: 'q2',
          question: 'What type of projects do you want to create?',
          context: 'Focuses learning',
          expectedAnswerType: 'text',
        },
        {
          id: 'q3',
          question: 'What tools or software will you use?',
          context: 'Plans around tools',
          expectedAnswerType: 'text',
        },
      ],
      [GoalType.CUSTOM]: [
        {
          id: 'q1',
          question: 'What is your current progress or starting point?',
          context: 'Establishes baseline',
          expectedAnswerType: 'text',
        },
        {
          id: 'q2',
          question: 'What specific outcomes do you want to achieve?',
          context: 'Defines success',
          expectedAnswerType: 'text',
        },
        {
          id: 'q3',
          question: 'What resources or support do you have available?',
          context: 'Plans realistically',
          expectedAnswerType: 'text',
        },
      ],
    };

    return fallbacks[goalType] || fallbacks[GoalType.CUSTOM];
  }
}
