import { NextResponse } from 'next/server';
import { createAttestationForProjectView } from '@/lib/attestations';
import type { Address } from 'viem';

export async function POST(request: Request) {
  try {
    const { userAddress, projectId } = await request.json();
    
    if (!userAddress || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Create attestation
    const result = await createAttestationForProjectView(userAddress as Address, projectId);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error creating attestation:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 