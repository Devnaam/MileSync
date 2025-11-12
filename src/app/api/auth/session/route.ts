// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { AuthService } from '@/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    console.log('Session API: Received request');

    if (!idToken) {
      console.error('Session API: No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    console.log('Session API: Verifying token...');

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    console.log('Session API: Token verified for user:', email);

    if (!email) {
      console.error('Session API: Email not found in token');
      return NextResponse.json({ error: 'Email not found in token' }, { status: 400 });
    }

    console.log('Session API: Syncing user to database...');

    // Sync user to database
    const user = await AuthService.syncUser(uid, email, name);

    console.log('Session API: User synced:', user.id);

    // Create session cookie (expires in 7 days)
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    console.log('Session API: Session cookie created');

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        firebaseUid: user.firebaseUid,
      },
    });

    // Set session cookie
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    console.log('Session API: Success, returning response');

    return response;
  } catch (error: any) {
    console.error('Session API: Error:', error);
    console.error('Session API: Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify session cookie - checkRevoked: false to allow cached sessions
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    const user = await AuthService.getUserByFirebaseUid(decodedClaims.uid);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error: any) {
    console.error('Session verification error:', error);
    
    // Clear invalid cookie
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.delete('session');
    
    return response;
  }
}


export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
