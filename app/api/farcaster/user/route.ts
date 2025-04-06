import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  // Check if API key is configured
  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY environment variable is not set');
    return NextResponse.json(
      { success: false, error: 'Farcaster API is not configured properly' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Use a more comprehensive approach to find users by address
    const matchingUsers = await fetchUsersByVerifiedAddress(address);
    
    if (!matchingUsers || matchingUsers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No Farcaster user found for this address' 
      });
    }

    // Return the first matching user
    const user = matchingUsers[0];
    
    // For logging/debugging
    console.log("Found Farcaster user:", {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
    });
    
    return NextResponse.json({
      success: true,
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      profileImage: user.pfp_url
    });
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error fetching Farcaster user' 
      },
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
        'x-api-key': NEYNAR_API_KEY!
      }
    });
    
    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error in fetchUsersByVerifiedAddress:', error);
    throw error;
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
      'x-api-key': NEYNAR_API_KEY!
    }
  });
  
  if (!response.ok) {
    throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.users || [];
} 