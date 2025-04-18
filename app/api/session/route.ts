import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// API route สำหรับตรวจสอบ session
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว โดยใช้ getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('[API] Session check: No valid session found');
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'No valid session found',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`[API] Session check: Valid session for user ${userId}`);

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        message: 'Error checking session',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 