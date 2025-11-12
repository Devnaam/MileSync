// src/lib/templates.ts
import { GoalType, GoalTemplate } from '@/types/goal.types';

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'academic-exam',
    type: GoalType.ACADEMIC,
    name: 'Academic Exam Preparation',
    description: 'Structured study plan for exams, certifications, or academic courses',
    icon: '📚',
    defaultDuration: 90, // 3 months
    defaultHoursPerDay: 3,
    suggestedQuestions: [
      'What subjects or topics need to be covered?',
      'Do you have any upcoming deadlines or exam dates?',
      'What is your current level of understanding in this subject?',
    ],
    example: 'Prepare for JEE Mains in 90 days, Data Structures & Algorithms for interviews',
  },
  {
    id: 'skill-development',
    type: GoalType.SKILL,
    name: 'Skill Development',
    description: 'Learn a new professional skill from scratch or advance existing expertise',
    icon: '💻',
    defaultDuration: 60, // 2 months
    defaultHoursPerDay: 2,
    suggestedQuestions: [
      'What is your current skill level (beginner/intermediate/advanced)?',
      'Do you have a specific project or outcome in mind?',
      'Are there any specific tools or technologies you want to focus on?',
    ],
    example: 'Learn Full-Stack Development, Master React & Next.js, Learn Python for Data Science',
  },
  // We'll add more later (Fitness, Career, Creative)
];

export function getTemplateById(id: string): GoalTemplate | undefined {
  return goalTemplates.find((template) => template.id === id);
}

export function getTemplatesByType(type: GoalType): GoalTemplate[] {
  return goalTemplates.filter((template) => template.type === type);
}
