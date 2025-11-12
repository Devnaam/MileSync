// src/services/progress.service.ts
import { prisma } from '@/lib/prisma';

export class ProgressService {
  /**
   * Log daily progress for a goal
   */
  static async logProgress(data: {
    goalId: string;
    userId: string;
    date: Date;
    tasksCompleted: number;
    totalTasks: number;
    hoursLogged: number;
    notes?: string;
    blockers?: string;
  }) {
    const completionRate = (data.tasksCompleted / data.totalTasks) * 100;

    const log = await prisma.progressLog.upsert({
      where: {
        goalId_logDate: {
          goalId: data.goalId,
          logDate: data.date,
        },
      },
      update: {
        tasksCompleted: data.tasksCompleted,
        totalTasks: data.totalTasks,
        hoursLogged: data.hoursLogged,
        completionRate,
        notes: data.notes,
        blockers: data.blockers,
      },
      create: {
        goalId: data.goalId,
        logDate: data.date,
        tasksCompleted: data.tasksCompleted,
        totalTasks: data.totalTasks,
        hoursLogged: data.hoursLogged,
        completionRate,
        notes: data.notes,
        blockers: data.blockers,
      },
    });

    // Update goal progress
    await this.updateGoalProgress(data.goalId);

    return log;
  }

  /**
   * Update overall goal progress based on logs
   */
  static async updateGoalProgress(goalId: string) {
    const logs = await prisma.progressLog.findMany({
      where: { goalId },
      orderBy: { logDate: 'desc' },
    });

    if (logs.length === 0) return;

    const avgCompletion =
      logs.reduce((sum, log) => sum + log.completionRate, 0) / logs.length;

    await prisma.goal.update({
      where: { id: goalId },
      data: { currentProgress: avgCompletion },
    });
  }

  /**
   * Get today's tasks from plan
   */
  static async getTodaysTasks(goalId: string) {
    const plan = await prisma.goalPlan.findUnique({
      where: { goalId },
    });

    if (!plan) return null;

    const today = new Date().toISOString().split('T')[0];
    const planStructure = plan.planStructure as any;

    // Find today's tasks in the plan
    for (const month of planStructure.months || []) {
      for (const week of month.weeks || []) {
        for (const day of week.days || []) {
          if (day.date === today) {
            return {
              dayNumber: day.dayNumber,
              title: day.title,
              focus: day.focus,
              tasks: day.tasks,
              totalHours: day.totalHours,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Get progress logs for a date range
   */
  static async getProgressLogs(goalId: string, startDate: Date, endDate: Date) {
    return await prisma.progressLog.findMany({
      where: {
        goalId,
        logDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { logDate: 'desc' },
    });
  }
}
