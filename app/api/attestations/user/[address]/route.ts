import { NextResponse } from 'next/server';
import { 
  getUserAttestations, 
  getUserAttestationCount, 
  getUniqueProjectsViewedByUser 
} from '@/lib/attestations';
import type { Address } from 'viem';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const userAddress = params.address as Address;
    
    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing user address' },
        { status: 400 }
      );
    }
    
    // Get user attestation data
    const attestations = await getUserAttestations(userAddress);
    const attestationCount = await getUserAttestationCount(userAddress);
    const uniqueProjectsViewed = await getUniqueProjectsViewedByUser(userAddress);
    
    return NextResponse.json({
      success: true,
      data: {
        attestations,
        attestationCount,
        uniqueProjectsCount: uniqueProjectsViewed.length,
        uniqueProjectIds: uniqueProjectsViewed,
      }
    });
  } catch (error) {
    console.error('Error retrieving user attestations:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 