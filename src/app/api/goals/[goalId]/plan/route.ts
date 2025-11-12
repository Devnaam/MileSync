// src/app/api/goals/[goalId]/plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { DecompositionService } from '@/services/decomposition.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  try {
    const params = await context.params; // Await params in Next.js 15
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

    // Get goal with context
    const goal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
        userId: user.id,
      },
      include: {
        context: true,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    console.log('📋 Generating plan for goal:', goal.title);

    // Extract clarification responses
    const clarificationResponses = goal.context?.clarificationData
      ? (goal.context.clarificationData as any[]).map((r: any) => ({
          question: r.question,
          answer: r.answer,
        }))
      : [];

    // Generate plan
    const planStructure = await DecompositionService.decomposeGoal({
      goalId: goal.id,
      goalTitle: goal.title,
      goalDescription: goal.description,
      goalType: goal.goalType,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      totalDuration: goal.totalDuration,
      hoursPerDay: goal.hoursPerDay,
      clarificationResponses,
    });

    // Store plan in database
    await prisma.goalPlan.upsert({
      where: { goalId: goal.id },
      update: {
        planStructure,
        lastModified: new Date(),
        version: {
          increment: 1,
        },
      },
      create: {
        goalId: goal.id,
        planStructure,
        version: 1,
      },
    });

    console.log('✅ Plan saved to database');

    return NextResponse.json({ plan: planStructure }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Plan generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  try {
    const params = await context.params; // Await params
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

    const plan = await prisma.goalPlan.findUnique({
      where: { goalId: params.goalId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan: plan.planStructure });
  } catch (error: any) {
    console.error('Get plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
