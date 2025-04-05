import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { sendFrameNotification } from '@/lib/notification-client';
import { ADMIN_ADDRESSES } from '@/lib/constants';

/**
 * Broadcasts a notification to all users who have saved the frame
 */
export async function POST(request: Request) {
  try {
    // Extract authorization header if using token-based auth
    // const { authorization } = Object.fromEntries(request.headers.entries());
    // Check authorization in a production environment
    
    const requestBody = await request.json();
    const { title, body: messageBody, adminAddress } = requestBody;
    
    // Verify admin user
    if (!adminAddress || !ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase())
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!title || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'Missing title or body' },
        { status: 400 }
      );
    }
    
    if (!redis) {
      return NextResponse.json(
        { success: false, error: 'Redis not configured' },
        { status: 500 }
      );
    }
    
    // Get keys for all users with stored notification details
    // The key pattern matches our prefix from notification.ts
    const projectName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "minikit";
    const keys = await redis.keys(`${projectName}:user:*`);
    
    console.log(`Found ${keys.length} users to notify`);
    
    // Extract FIDs from keys
    const fids = keys.map(key => {
      const fid = key.split(':').pop();
      return fid ? parseInt(fid, 10) : null;
    }).filter(Boolean);
    
    // Send notifications to all users
    const results = await Promise.allSettled(
      fids.map(async (fid) => {
        if (!fid) return null;
        
        return sendFrameNotification({
          fid,
          title,
          body: messageBody
        });
      })
    );
    
    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value?.state === 'success'
    ).length;
    
    const failed = results.filter(
      r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.state !== 'success')
    ).length;
    
    return NextResponse.json({ 
      success: true, 
      stats: {
        total: fids.length,
        successful,
        failed,
      }
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 