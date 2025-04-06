"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import WalletButton from "../components/WalletButton";
import ProjectSubmitForm from "../components/ProjectSubmitForm";

export default function SubmitPage() {
  const { address } = useAccount();
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [userName, setUserName] = useState<string | null>(null);
  const [userFid, setUserFid] = useState<number | undefined>(undefined);
  const [farcasterStatus, setFarcasterStatus] = useState<string>('Not checked');
  
  // Set frame ready when component loads
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);
  
  // Try to get the user's Farcaster FID and username
  useEffect(() => {
    if (address) {
      setFarcasterStatus('Checking Farcaster...');
      console.log(`===== FARCASTER DEBUG: Fetching info for wallet address: ${address} =====`);
      
      const fetchUserInfo = async () => {
        try {
          // Call our Farcaster user API endpoint
          const apiUrl = `/api/farcaster/user?address=${address}`;
          console.log(`===== FARCASTER DEBUG: Calling API endpoint: ${apiUrl} =====`);
          
          const response = await fetch(apiUrl);
          console.log(`===== FARCASTER DEBUG: API response status: ${response.status} =====`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`===== FARCASTER DEBUG: API error (${response.status}): ${errorText} =====`);
            setFarcasterStatus(`API error: ${response.status}`);
            setUserName(null);
            setUserFid(undefined);
            return;
          }
          
          const data = await response.json();
          
          console.log('===== FARCASTER DEBUG: API response:', data, '=====');
          
          if (data.success) {
            setUserFid(data.fid);
            // Prioritize username, then displayName
            const farcasterName = data.username || data.displayName || null;
            setUserName(farcasterName);
            setFarcasterStatus(`Found: ${farcasterName} (FID: ${data.fid})`);
            console.log(`===== FARCASTER DEBUG: Username found! "${farcasterName}" (FID: ${data.fid}) =====`);
            // Log so we can verify in server logs what username will be used
            console.log(`===== FARCASTER USERNAME FOR AUTHOR FIELD: "${farcasterName}" =====`);
          } else {
            console.log('===== FARCASTER DEBUG: No Farcaster account found for this address =====');
            setUserName(null);
            setUserFid(undefined);
            setFarcasterStatus('No Farcaster account found');
          }
        } catch (error) {
          console.error("===== FARCASTER DEBUG: Error fetching user info:", error, "=====");
          setUserName(null);
          setUserFid(undefined);
          setFarcasterStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      
      fetchUserInfo();
    } else {
      setFarcasterStatus('Wallet not connected');
    }
  }, [address]);
  
  return (
    <div className="w-full max-w-[720px] mx-auto pb-8">
      <header className="mr-2 mt-1 flex justify-between items-center py-2">
        <div className="justify-start pl-1">
          <Link 
            href="/" 
            className="text-xl font-bold flex items-center hover:opacity-80 transition-opacity"
          >
            <span className="mr-1">←</span> Vibe Directory
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <WalletButton />
        </div>
      </header>

      <main className="px-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Submit Your Project</h1>
        
        {!address ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto text-center">
            <p className="mb-4">Please connect your wallet to submit a project</p>
            <div className="inline-block">
              <WalletButton />
            </div>
          </div>
        ) : (
          <>
            <ProjectSubmitForm 
              userAddress={address}
              userName={userName || undefined}
              userFid={userFid}
              onSuccess={() => {
                // Optionally redirect the user after successful submission
                // router.push('/');
              }}
            />
          </>
        )}
      </main>
    </div>
  );
} 