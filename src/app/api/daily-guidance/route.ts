// src/app/api/daily-guidance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/services/progress.service';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get active goals
    const activeGoals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        plan: true,
      },
    });

    if (activeGoals.length === 0) {
      return NextResponse.json({
        guidance: null,
        message: 'No active goals found. Create a goal to get started!',
      });
    }

    // Get today's tasks for each goal
    const todaysGuidance = await Promise.all(
      activeGoals.map(async (goal) => {
        const todaysTasks = await ProgressService.getTodaysTasks(goal.id);

        return {
          goalId: goal.id,
          goalTitle: goal.title,
          goalType: goal.goalType,
          todaysTasks,
        };
      })
    );

    // Filter out goals with no tasks today
    const guidanceWithTasks = todaysGuidance.filter((g) => g.todaysTasks !== null);

    return NextResponse.json({
      guidance: guidanceWithTasks,
      totalGoals: activeGoals.length,
      goalsWithTasksToday: guidanceWithTasks.length,
    });
  } catch (error: any) {
    console.error('Daily guidance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
