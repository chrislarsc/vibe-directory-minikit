/**
 * Neynar API utilities for Farcaster integration
 */

/**
 * Fetch a user's Farcaster profile by FID
 */
export async function getFarcasterUserByFid(fid: number): Promise<{
  username: string;
  displayName: string;
  pfpUrl: string;
  success: boolean;
} | null> {
  if (!fid) {
    console.log('No FID provided to getFarcasterUserByFid');
    return null;
  }
  
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not found in environment variables');
      return null;
    }
    
    console.log(`Fetching Farcaster user data for FID: ${fid}`);
    
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Neynar API error (${response.status}): ${errorText}`);
      // Return a default response instead of failing
      return {
        username: `fid:${fid}`,
        displayName: `Farcaster User ${fid}`,
        pfpUrl: '',
        success: false
      };
    }
    
    const data = await response.json();
    
    if (!data.users || data.users.length === 0) {
      console.log(`No Farcaster user found for FID: ${fid}`);
      // Return a default response instead of failing
      return {
        username: `fid:${fid}`,
        displayName: `Farcaster User ${fid}`,
        pfpUrl: '',
        success: false
      };
    }
    
    const user = data.users[0];
    console.log(`Found Farcaster user: ${user.username}`);
    
    return {
      username: user.username,
      displayName: user.display_name || user.username,
      pfpUrl: user.pfp_url,
      success: true
    };
  } catch (error) {
    console.error('Error fetching Farcaster user data:', error);
    // Return a default response instead of failing
    return {
      username: `fid:${fid}`,
      displayName: `Farcaster User ${fid}`,
      pfpUrl: '',
      success: false
    };
  }
}

/**
 * Fetch a user's Farcaster profile by wallet address
 */
export async function getFarcasterUserByAddress(address: string): Promise<{
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  success: boolean;
} | null> {
  if (!address) {
    console.log('No address provided to getFarcasterUserByAddress');
    return null;
  }
  
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not found in environment variables');
      return null;
    }
    
    console.log(`===== NEYNAR DEBUG: Fetching Farcaster user data for address: ${address} =====`);
    
    // Use the bulk-by-address endpoint which works for both ETH and SOL addresses
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`;
    console.log(`===== NEYNAR DEBUG: Calling URL: ${url} =====`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`===== NEYNAR DEBUG: API error (${response.status}): ${errorText} =====`);
      return null;
    }
    
    const data = await response.json();
    console.log(`===== NEYNAR DEBUG: Raw API response:`, data, `=====`);
    
    // The response structure is:
    // { 
    //   "0x123...": [{ user1 }, { user2 }]
    // }
    
    // Get the normalized address (lowercase) and check if there's data for it
    const normalizedAddress = address.toLowerCase();
    const usersForAddress = data[normalizedAddress];
    
    if (!usersForAddress || usersForAddress.length === 0) {
      console.log(`===== NEYNAR DEBUG: No Farcaster user found for address: ${address} =====`);
      return null;
    }
    
    // Get the first user (there could be multiple accounts with the same verified address)
    const user = usersForAddress[0];
    console.log(`===== NEYNAR DEBUG: Found Farcaster user by address: ${user.username} (FID: ${user.fid}) =====`);
    
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name || user.username,
      pfpUrl: user.pfp_url,
      success: true
    };
  } catch (error) {
    console.error('===== NEYNAR DEBUG: Error fetching Farcaster user data by address:', error, '=====');
    return null;
  }
} 