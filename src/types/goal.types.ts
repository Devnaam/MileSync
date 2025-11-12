// src/types/goal.types.ts
export enum GoalType {
  ACADEMIC = 'ACADEMIC',
  SKILL = 'SKILL',
  FITNESS = 'FITNESS',
  CAREER = 'CAREER',
  CREATIVE = 'CREATIVE',
  CUSTOM = 'CUSTOM',
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface GoalTemplate {
  id: string;
  type: GoalType;
  name: string;
  description: string;
  icon: string;
  defaultDuration: number; // days
  defaultHoursPerDay: number;
  suggestedQuestions: string[];
  example: string;
}

export interface GoalFormData {
  title: string;
  description: string;
  goalType: GoalType;
  startDate: Date;
  targetDate: Date;
  hoursPerDay: number;
  currentProgress?: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  goalType: GoalType;
  status: GoalStatus;
  startDate: Date;
  targetDate: Date;
  totalDuration: number;
  hoursPerDay: number;
  currentProgress: number;
  createdAt: Date;
  updatedAt: Date;
}
