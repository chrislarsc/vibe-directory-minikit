import { NextResponse } from 'next/server';
import { setUserNotificationDetails } from '@/lib/notification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, token, url } = body;
    
    if (!userId || !token || !url) {
      return NextResponse.json(
        { success: false, error: 'Missing userId, token, or url' },
        { status: 400 }
      );
    }
    
    // Store in Redis using the existing setUserNotificationDetails function
    // Convert userId (wallet address) to a numerical FID if needed
    // For simplicity, we're using the userId directly for demo purposes
    const fid = parseInt(userId, 10) || 0;
    
    await setUserNotificationDetails(fid, {
      token,
      url
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing notification token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 