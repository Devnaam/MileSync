// src/services/decomposition.service.ts
import { generateJSON } from '@/lib/gemini';
import { GoalType } from '@/types/goal.types';
import { GoalPlanStructure, MonthPlan, WeekPlan, DayPlan, DailyTask } from '@/types/plan.types';

interface DecompositionInput {
  goalId: string;
  goalTitle: string;
  goalDescription: string | null;
  goalType: GoalType;
  startDate: Date;
  targetDate: Date;
  totalDuration: number;
  hoursPerDay: number;
  clarificationResponses?: Array<{ question: string; answer: string }>;
}

export class DecompositionService {
  static async decomposeGoal(input: DecompositionInput): Promise<GoalPlanStructure> {
    console.log('🎯 Starting goal decomposition for:', input.goalTitle);

    const timeline = this.calculateTimeline(
      input.startDate,
      input.targetDate,
      input.totalDuration
    );

    const context = this.buildContext(input);

    // Generate complete plan structure
    const plan = await this.generateCompletePlan(input, timeline, context);

    console.log('✅ Decomposition complete:', {
      months: plan.totalMonths,
      weeks: plan.totalWeeks,
      days: plan.totalDays,
      hours: plan.totalHours,
    });

    return plan;
  }

  private static calculateTimeline(startDate: Date, targetDate: Date, totalDays: number) {
    const totalWeeks = Math.ceil(totalDays / 7);
    const totalMonths = Math.ceil(totalDays / 30);

    return {
      totalDays,
      totalWeeks,
      totalMonths,
      startDate: startDate.toISOString().split('T'),
      endDate: targetDate.toISOString().split('T'),
    };
  }

  private static buildContext(input: DecompositionInput): string {
    if (!input.clarificationResponses || input.clarificationResponses.length === 0) {
      return 'No additional context provided.';
    }

    return input.clarificationResponses
      .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');
  }

  /**
   * Generate complete plan - AI for structure, programmatic for tasks
   */
  private static async generateCompletePlan(
    input: DecompositionInput,
    timeline: any,
    context: string
  ): Promise<GoalPlanStructure> {
    try {
      console.log('🤖 Generating learning path structure...');

      // Ask AI for high-level structure only (lightweight)
      const structure = await this.generateLearningStructure(input, timeline, context);

      console.log('✅ Structure generated, building detailed plan...');

      // Build detailed plan programmatically
      const months = this.buildDetailedPlan(
        structure,
        input.startDate,
        input.totalDuration,
        input.hoursPerDay
      );

      return {
        goalId: input.goalId,
        months,
        totalMonths: timeline.totalMonths,
        totalWeeks: timeline.totalWeeks,
        totalDays: input.totalDuration,
        totalHours: input.totalDuration * input.hoursPerDay,
        generatedAt: new Date().toISOString(),
        version: 1,
      };
    } catch (error: any) {
      console.error('❌ AI generation failed, using smart fallback:', error.message);
      return this.generateIntelligentFallback(input, timeline);
    }
  }

  /**
   * Ask AI for learning structure only (small JSON)
   */
  private static async generateLearningStructure(
    input: DecompositionInput,
    timeline: any,
    context: string
  ) {
    const prompt = `Create a learning path structure for: "${input.goalTitle}"

Type: ${input.goalType}
Duration: ${input.totalDuration} days (${timeline.totalMonths} months)
Context: ${context.substring(0, 300)}

Generate ONLY the high-level structure with ${timeline.totalMonths} months and topics.

Return ONLY this JSON (no markdown):
{
  "months": [
    {
      "title": "Month 1 Phase Name",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
    }
  ]
}

Be concise. Each month should have 4-6 topics that progress logically.`;

    return await generateJSON<{
      months: Array<{ title: string; topics: string[] }>;
    }>(prompt);
  }

  /**
   * Build detailed plan from AI structure
   */
  private static buildDetailedPlan(
    structure: { months: Array<{ title: string; topics: string[] }> },
    startDate: Date,
    totalDays: number,
    hoursPerDay: number
  ): MonthPlan[] {
    const months: MonthPlan[] = [];
    const currentDate = new Date(startDate);
    let dayCounter = 1;

    const daysPerMonth = Math.ceil(totalDays / structure.months.length);

    structure.months.forEach((monthData, monthIdx) => {
      const monthNumber = monthIdx + 1;
      const monthStart = new Date(currentDate);
      const daysInThisMonth = Math.min(daysPerMonth, totalDays - (dayCounter - 1));
      const weeksInMonth = Math.ceil(daysInThisMonth / 7);

      // Distribute topics across weeks
      const topicsPerWeek = Math.ceil(monthData.topics.length / weeksInMonth);
      const weeks: WeekPlan[] = [];

      for (let w = 0; w < weeksInMonth; w++) {
        const weekTopics = monthData.topics.slice(
          w * topicsPerWeek,
          (w + 1) * topicsPerWeek
        );
        const weekStart = new Date(currentDate);
        const daysInWeek = Math.min(7, daysInThisMonth - (w * 7));
        const days: DayPlan[] = [];

        for (let d = 0; d < daysInWeek; d++) {
          const topic = weekTopics[d % weekTopics.length] || weekTopics;
          const dayDate = new Date(currentDate);

          const tasks: DailyTask[] = [
            {
              id: `m${monthNumber}w${w + 1}d${d + 1}t1`,
              title: `Learn: ${topic}`,
              description: `Study and understand ${topic} concepts`,
              duration: hoursPerDay * 0.6,
              completed: false,
            },
            {
              id: `m${monthNumber}w${w + 1}d${d + 1}t2`,
              title: `Practice: ${topic}`,
              description: `Apply ${topic} through exercises and examples`,
              duration: hoursPerDay * 0.4,
              completed: false,
            },
          ];

          days.push({
            dayNumber: dayCounter,
            date: dayDate.toISOString().split('T'),
            title: `Day ${dayCounter}: ${topic}`,
            focus: topic,
            tasks,
            totalHours: hoursPerDay,
            completed: false,
          });

          currentDate.setDate(currentDate.getDate() + 1);
          dayCounter++;
        }

        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() - 1);

        weeks.push({
          weekNumber: w + 1,
          startDate: weekStart.toISOString().split('T'),
          endDate: weekEnd.toISOString().split('T'),
          title: weekTopics.join(' & ') || `Week ${w + 1}`,
          objective: `Master ${weekTopics[0] || 'core concepts'}`,
          days,
          totalHours: days.reduce((sum, d) => sum + d.totalHours, 0),
          completedDays: 0,
        });
      }

      const monthEnd = new Date(currentDate);
      monthEnd.setDate(monthEnd.getDate() - 1);

      months.push({
        monthNumber,
        startDate: monthStart.toISOString().split('T'),
        endDate: monthEnd.toISOString().split('T'),
        title: monthData.title,
        milestone: `Complete ${monthData.title}`,
        weeks,
        totalHours: weeks.reduce((sum, w) => sum + w.totalHours, 0),
        completedWeeks: 0,
      });
    });

    return months;
  }

  /**
   * Intelligent fallback based on goal type
   */
  private static generateIntelligentFallback(
    input: DecompositionInput,
    timeline: any
  ): GoalPlanStructure {
    console.log('⚠️ Using intelligent fallback generation');

    // Smart topic generation based on goal type
    const topicsByType: Record<GoalType, string[][]> = {
      SKILL: [
        ['Fundamentals', 'Basic Concepts', 'Core Principles', 'First Projects'],
        ['Intermediate Topics', 'Advanced Concepts', 'Real Projects', 'Best Practices'],
      ],
      ACADEMIC: [
        ['Introduction', 'Basic Theory', 'Core Concepts', 'Practice Problems'],
        ['Advanced Topics', 'Complex Problems', 'Review', 'Final Preparation'],
      ],
      FITNESS: [
        ['Foundation', 'Form & Technique', 'Building Strength', 'Consistency'],
        ['Progression', 'Advanced Training', 'Peak Performance', 'Maintenance'],
      ],
      CAREER: [
        ['Skills Assessment', 'Core Skills', 'Resume Building', 'Networking'],
        ['Advanced Skills', 'Projects', 'Interviews', 'Job Search'],
      ],
      CREATIVE: [
        ['Inspiration', 'Basics', 'Technique', 'First Drafts'],
        ['Refinement', 'Advanced Work', 'Completion', 'Publishing'],
      ],
      CUSTOM: [
        ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
        ['Phase 5', 'Phase 6', 'Completion', 'Review'],
      ],
    };

    const topics = topicsByType[input.goalType] || topicsByType.CUSTOM;
    const structure = {
      months: topics.slice(0, timeline.totalMonths).map((monthTopics, idx) => ({
        title: `Month ${idx + 1}`,
        topics: monthTopics,
      })),
    };

    const months = this.buildDetailedPlan(
      structure,
      input.startDate,
      input.totalDuration,
      input.hoursPerDay
    );

    return {
      goalId: input.goalId,
      months,
      totalMonths: timeline.totalMonths,
      totalWeeks: timeline.totalWeeks,
      totalDays: input.totalDuration,
      totalHours: input.totalDuration * input.hoursPerDay,
      generatedAt: new Date().toISOString(),
      version: 1,
    };
  }
}