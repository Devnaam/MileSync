import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { ChatService } from '@/services/chat.service';

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
    const { goalId, message } = body;

    if (!goalId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    console.log('💬 Chat message received for goal:', goal.title);

    // Get or create conversation
    const conversation = await ChatService.getOrCreateConversation(goalId, user.id);

    // Save user message
    await ChatService.addUserMessage(conversation.id, message);

    // Get conversation history for context
    const history = await ChatService.getMessages(conversation.id);
    const conversationHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build goal context
    const goalContext = await ChatService.buildGoalContext(goalId);

    // Generate AI response with full context
    const aiResponse = await ChatService.generateAIResponse(
      message,
      goalContext,
      conversationHistory
    );

    // Save AI message
    await ChatService.addAssistantMessage(conversation.id, aiResponse);

    console.log('✅ AI response generated');

    return NextResponse.json({
      conversationId: conversation.id,
      response: aiResponse,
    });
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}