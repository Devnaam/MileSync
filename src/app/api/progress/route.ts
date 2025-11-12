// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/services/progress.service';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      goalId,
      date,
      tasksCompleted,
      totalTasks,
      hoursLogged,
      notes,
      blockers,
    } = body;

    if (!goalId || !date || tasksCompleted === undefined || !totalTasks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const log = await ProgressService.logProgress({
      goalId,
      userId: user.id,
      date: new Date(date),
      tasksCompleted,
      totalTasks,
      hoursLogged: hoursLogged || 0,
      notes,
      blockers,
    });

    console.log('✅ Progress logged:', log.id);

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Progress logging error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
