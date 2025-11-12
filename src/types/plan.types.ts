// src/types/plan.types.ts
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number; // hours
  timeBlock?: string; // e.g., "9:00 AM - 11:00 AM"
  resources?: string[];
  successCriteria?: string;
  completed: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: string; // ISO date
  title: string;
  focus: string;
  tasks: DailyTask[];
  totalHours: number;
  completed: boolean;
}

export interface WeekPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  title: string;
  objective: string;
  days: DayPlan[];
  totalHours: number;
  completedDays: number;
}

export interface MonthPlan {
  monthNumber: number;
  startDate: string;
  endDate: string;
  title: string;
  milestone: string;
  weeks: WeekPlan[];
  totalHours: number;
  completedWeeks: number;
}

export interface GoalPlanStructure {
  goalId: string;
  months: MonthPlan[];
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  generatedAt: string;
  version: number;
}
