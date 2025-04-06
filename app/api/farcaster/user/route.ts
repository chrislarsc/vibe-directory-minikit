import { NextResponse } from 'next/server';
import { getFarcasterUserByFid, getFarcasterUserByAddress } from '@/lib/neynarApi';

// Get API key from environment variable
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

// Define Farcaster user type
interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  [key: string]: unknown;
}

/**
 * GET handler to retrieve Farcaster user data by FID or address
 */
export async function GET(request: Request) {
  try {
    // Check if API key is configured
    if (!NEYNAR_API_KEY) {
      console.error('NEYNAR_API_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Farcaster API is not configured properly' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');
    const address = searchParams.get('address');

    // Handle lookup by FID
    if (fidParam) {
      const fid = parseInt(fidParam, 10);
      
      if (isNaN(fid) || fid <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid FID parameter' },
          { status: 400 }
        );
      }
      
      const userData = await getFarcasterUserByFid(fid);
      
      if (!userData) {
        return NextResponse.json(
          { success: false, error: 'Farcaster user not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: userData
      });
    }
    
    // Handle lookup by address
    else if (address) {
      console.log(`===== API DEBUG: Looking up Farcaster user for address: ${address} =====`);
      
      const userData = await getFarcasterUserByAddress(address);
      
      if (!userData) {
        console.log(`===== API DEBUG: No Farcaster user data returned for address ${address} =====`);
        return NextResponse.json({ 
          success: false, 
          error: 'No Farcaster user found for this address' 
        });
      }
      
      // For logging/debugging
      console.log("===== API DEBUG: Found Farcaster user by address:", {
        fid: userData.fid,
        username: userData.username,
        displayName: userData.displayName,
      }, "=====");
      
      return NextResponse.json({
        success: true,
        fid: userData.fid,
        username: userData.username,
        displayName: userData.displayName,
        profileImage: userData.pfpUrl
      });
    } 
    
    // Neither FID nor address provided
    else {
      return NextResponse.json(
        { success: false, error: 'Either fid or address parameter is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function fetchUsersByVerifiedAddress(address: string): Promise<FarcasterUser[]> {
  try {
    // In production, we would use a more robust approach
    // For example, we could query Neynar for users with verified ETH addresses
    // The implementation would depend on what API methods are available
    
    // For now, we'll make a direct request to search for verified addresses
    const url = `https://api.neynar.com/v2/farcaster/user/search-by-verification?address=${address}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY!
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Neynar API error (${response.status}): ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error in fetchUsersByVerifiedAddress:', error);
    return [];
  }
}

// This function is kept for potential future use but not currently used
// Remove the eslint-disable comment when the function is used
/* eslint-disable @typescript-eslint/no-unused-vars */
async function fetchUsersByFid(fid: string): Promise<FarcasterUser[]> {
/* eslint-enable @typescript-eslint/no-unused-vars */
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'api_key': NEYNAR_API_KEY!
    }
  });
  
  if (!response.ok) {
    throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.users || [];
}