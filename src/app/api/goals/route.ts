// src/app/api/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { GoalType } from '@/types/goal.types';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session cookie - checkRevoked: false for development
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ goals });
  } catch (error: any) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session cookie - checkRevoked: false for development
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, goalType, startDate, targetDate, hoursPerDay } = body;

    // Validation
    if (!title || !goalType || !startDate || !targetDate || !hoursPerDay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total duration
    const start = new Date(startDate);
    const end = new Date(targetDate);
    const totalDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDuration <= 0) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        goalType: goalType as GoalType,
        status: 'ACTIVE',
        startDate: start,
        targetDate: end,
        totalDuration,
        hoursPerDay: Number(hoursPerDay),
        currentProgress: 0,
      },
    });

    console.log('✅ Goal created:', goal.id, '-', goal.title);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create goal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
