// src/app/api/chat/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { ChatService } from '@/services/chat.service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const params = await context.params;
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

    const messages = await ChatService.getMessages(params.conversationId);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
