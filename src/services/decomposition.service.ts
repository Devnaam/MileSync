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
  /**
   * Main decomposition function - breaks goal into complete plan
   */
  static async decomposeGoal(input: DecompositionInput): Promise<GoalPlanStructure> {
    console.log('🎯 Starting goal decomposition for:', input.goalTitle);

    // Calculate timeline structure
    const timeline = this.calculateTimeline(
      input.startDate,
      input.targetDate,
      input.totalDuration
    );

    // Build context from clarification
    const context = this.buildContext(input);

    // Generate plan using AI
    const plan = await this.generatePlanWithAI(input, timeline, context);

    console.log('✅ Decomposition complete:', {
      months: plan.totalMonths,
      weeks: plan.totalWeeks,
      days: plan.totalDays,
      hours: plan.totalHours,
    });

    return plan;
  }

  /**
   * Calculate timeline structure (how many months, weeks, days)
   */
  private static calculateTimeline(startDate: Date, targetDate: Date, totalDays: number) {
    const totalWeeks = Math.ceil(totalDays / 7);
    const totalMonths = Math.ceil(totalDays / 30);

    return {
      totalDays,
      totalWeeks,
      totalMonths,
      startDate: startDate.toISOString().split('T')[0],
      endDate: targetDate.toISOString().split('T')[0],
    };
  }

  /**
   * Build context string from clarification responses
   */
  private static buildContext(input: DecompositionInput): string {
    if (!input.clarificationResponses || input.clarificationResponses.length === 0) {
      return 'No additional context provided.';
    }

    return input.clarificationResponses
      .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');
  }

  /**
   * Generate complete plan using AI
   */
  private static async generatePlanWithAI(
    input: DecompositionInput,
    timeline: any,
    context: string
  ): Promise<GoalPlanStructure> {
    const prompt = `You are an expert learning path designer. Create a detailed, realistic study plan that breaks down a goal into months, weeks, and daily tasks.

**Goal Information:**
- Title: ${input.goalTitle}
- Description: ${input.goalDescription || 'Not provided'}
- Type: ${input.goalType}
- Duration: ${input.totalDuration} days (${timeline.totalMonths} months)
- Daily commitment: ${input.hoursPerDay} hours/day
- Total hours: ${input.totalDuration * input.hoursPerDay} hours
- Start date: ${timeline.startDate}
- End date: ${timeline.endDate}

**User Context:**
${context}

**Instructions:**
1. Break the goal into ${timeline.totalMonths} monthly milestones
2. Each month has ~4 weeks with specific objectives
3. Each week has 7 days (account for some lighter days)
4. Each day has 2-4 specific tasks totaling ${input.hoursPerDay} hours
5. Make tasks concrete and actionable
6. Progress from fundamentals to advanced
7. Include practice/project time
8. Be realistic about what can be learned per day

**Output Format:**
Return ONLY valid JSON (no markdown, no explanation) in this exact structure:

\`\`\`json
{
  "months": [
    {
      "monthNumber": 1,
      "title": "Foundations & Setup",
      "milestone": "Complete basic understanding",
      "weeks": [
        {
          "weekNumber": 1,
          "title": "Getting Started",
          "objective": "Set up environment and learn basics",
          "days": [
            {
              "dayNumber": 1,
              "title": "Environment Setup",
              "focus": "Development environment",
              "tasks": [
                {
                  "id": "m1w1d1t1",
                  "title": "Install tools",
                  "description": "Install Node.js, VS Code, extensions",
                  "duration": 0.5,
                  "resources": ["Official docs"],
                  "successCriteria": "Environment working",
                  "completed": false
                },
                {
                  "id": "m1w1d1t2",
                  "title": "First project",
                  "description": "Create hello world app",
                  "duration": 1.5,
                  "resources": ["Tutorial"],
                  "successCriteria": "App runs successfully",
                  "completed": false
                }
              ],
              "totalHours": ${input.hoursPerDay},
              "completed": false
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

Generate the COMPLETE plan with all ${timeline.totalMonths} months, all weeks, and all days. Be specific and practical.`;

    try {
      const response = await generateJSON<{ months: MonthPlan[] }>(prompt);

      // Build complete plan structure
      const plan: GoalPlanStructure = {
        goalId: input.goalId,
        months: this.enrichPlanWithDates(response.months, input.startDate),
        totalMonths: timeline.totalMonths,
        totalWeeks: timeline.totalWeeks,
        totalDays: input.totalDuration,
        totalHours: input.totalDuration * input.hoursPerDay,
        generatedAt: new Date().toISOString(),
        version: 1,
      };

      return plan;
    } catch (error: any) {
      console.error('❌ AI plan generation failed:', error);
      
      // Fallback: Generate simple plan
      return this.generateFallbackPlan(input, timeline);
    }
  }

  /**
   * Add actual dates to the plan structure
   */
  private static enrichPlanWithDates(months: MonthPlan[], startDate: Date): MonthPlan[] {
    const currentDate = new Date(startDate);

    return months.map((month, monthIdx) => {
      const monthStart = new Date(currentDate);
      
      const enrichedWeeks = month.weeks.map((week, weekIdx) => {
        const weekStart = new Date(currentDate);
        
        const enrichedDays = week.days.map((day, dayIdx) => {
          const dayDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);

          return {
            ...day,
            date: dayDate.toISOString().split('T')[0],
          };
        });

        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() - 1);

        return {
          ...week,
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
          days: enrichedDays,
          totalHours: enrichedDays.reduce((sum, d) => sum + d.totalHours, 0),
          completedDays: 0,
        };
      });

      const monthEnd = new Date(currentDate);
      monthEnd.setDate(monthEnd.getDate() - 1);

      return {
        ...month,
        monthNumber: monthIdx + 1,
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0],
        weeks: enrichedWeeks,
        totalHours: enrichedWeeks.reduce((sum, w) => sum + w.totalHours, 0),
        completedWeeks: 0,
      };
    });
  }

  /**
   * Fallback plan if AI fails
   */
  private static generateFallbackPlan(
    input: DecompositionInput,
    timeline: any
  ): GoalPlanStructure {
    console.log('⚠️ Using fallback plan generation');

    const months: MonthPlan[] = [];
    const currentDate = new Date(input.startDate);
    let dayCounter = 1;

    for (let m = 0; m < timeline.totalMonths; m++) {
      const weeks: WeekPlan[] = [];
      
      for (let w = 0; w < 4; w++) {
        const days: DayPlan[] = [];
        
        for (let d = 0; d < 7; d++) {
          if (dayCounter > input.totalDuration) break;

          const tasks: DailyTask[] = [
            {
              id: `m${m + 1}w${w + 1}d${d + 1}t1`,
              title: `Main learning task`,
              description: `Work on ${input.goalTitle} - Phase ${m + 1}`,
              duration: input.hoursPerDay * 0.7,
              completed: false,
            },
            {
              id: `m${m + 1}w${w + 1}d${d + 1}t2`,
              title: `Practice & Review`,
              description: `Practice what you learned`,
              duration: input.hoursPerDay * 0.3,
              completed: false,
            },
          ];

          days.push({
            dayNumber: dayCounter,
            date: new Date(currentDate).toISOString().split('T')[0],
            title: `Day ${dayCounter}`,
            focus: `Continue learning ${input.goalTitle}`,
            tasks,
            totalHours: input.hoursPerDay,
            completed: false,
          });

          currentDate.setDate(currentDate.getDate() + 1);
          dayCounter++;
        }

        weeks.push({
          weekNumber: w + 1,
          startDate: days[0]?.date || '',
          endDate: days[days.length - 1]?.date || '',
          title: `Week ${w + 1}`,
          objective: `Progress in ${input.goalTitle}`,
          days,
          totalHours: days.reduce((sum, d) => sum + d.totalHours, 0),
          completedDays: 0,
        });
      }

      months.push({
        monthNumber: m + 1,
        startDate: weeks[0]?.startDate || '',
        endDate: weeks[weeks.length - 1]?.endDate || '',
        title: `Month ${m + 1}`,
        milestone: `Complete phase ${m + 1} of ${input.goalTitle}`,
        weeks,
        totalHours: weeks.reduce((sum, w) => sum + w.totalHours, 0),
        completedWeeks: 0,
      });
    }

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
