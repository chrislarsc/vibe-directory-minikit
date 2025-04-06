import { NextResponse } from 'next/server';
import { getFarcasterUserByAddress } from '@/lib/neynarApi';

/**
 * Debug endpoint to directly call Neynar API and check responses
 */
export async function GET(request: Request) {
  // Get NEYNAR_API_KEY from environment
  const apiKey = process.env.NEYNAR_API_KEY;
  
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address parameter is required' 
      }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Neynar API key is not configured' 
      }, { status: 500 });
    }
    
    // Store all results to compare
    const results: {
      bulkByAddress: any;
      searchByVerification: any;
      utilityFunction: any;
    } = {
      bulkByAddress: null,
      searchByVerification: null,
      utilityFunction: null
    };
    
    // 1. Direct call to bulk-by-address endpoint
    try {
      const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`;
      console.log(`DEBUG: Calling bulk-by-address: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api_key': apiKey
        }
      });
      
      if (response.ok) {
        results.bulkByAddress = {
          status: response.status,
          data: await response.json()
        };
      } else {
        results.bulkByAddress = {
          status: response.status,
          error: await response.text()
        };
      }
    } catch (error) {
      results.bulkByAddress = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // 2. Call to search-by-verification endpoint
    try {
      const url = `https://api.neynar.com/v2/farcaster/user/search-by-verification?address=${address}`;
      console.log(`DEBUG: Calling search-by-verification: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api_key': apiKey
        }
      });
      
      if (response.ok) {
        results.searchByVerification = {
          status: response.status,
          data: await response.json()
        };
      } else {
        results.searchByVerification = {
          status: response.status,
          error: await response.text()
        };
      }
    } catch (error) {
      results.searchByVerification = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // 3. Call through our utility function
    try {
      const userData = await getFarcasterUserByAddress(address);
      results.utilityFunction = {
        data: userData
      };
    } catch (error) {
      results.utilityFunction = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Return all results for comparison
    return NextResponse.json({
      success: true,
      address,
      results
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 