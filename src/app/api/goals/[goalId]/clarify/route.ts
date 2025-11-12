// src/app/api/goals/[goalId]/clarify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { AIService } from '@/services/ai.service';

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

    // Get goal
    const goal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    console.log('🤔 Generating clarification questions for:', goal.title);

    // Generate questions using AI
    const questions = await AIService.generateClarificationQuestions(
      goal.title,
      goal.description,
      goal.goalType,
      goal.totalDuration,
      goal.hoursPerDay
    );

    console.log('✅ Generated', questions.length, 'questions');

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('❌ Clarification generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
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

    // Get goal
    const goal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await request.json();
    const { responses } = body;

    console.log('💾 Saving clarification responses for:', goal.title);

    // Store in goal_context table
    await prisma.goalContext.upsert({
      where: { goalId: goal.id },
      update: {
        clarificationData: responses,
        updatedAt: new Date(),
      },
      create: {
        goalId: goal.id,
        clarificationData: responses,
      },
    });

    console.log('✅ Clarification responses saved');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Save clarification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
