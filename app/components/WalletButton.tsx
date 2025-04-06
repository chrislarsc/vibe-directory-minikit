"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const { context } = useMiniKit();

  // Auto-connect when component mounts if in frame context and wallet is available
  useEffect(() => {
    const autoConnect = async () => {
      // Only attempt auto-connect if:
      // 1. Not already connected
      // 2. Has connectors available
      // 3. Is in a Farcaster frame (has client info)
      if (!isConnected && connectors.length > 0 && context?.client) {
        try {
          setIsConnecting(true);
          const connector = connectors[0];
          if (connector) {
            await connect({ connector });
            console.log('Auto-connected wallet from Farcaster frame context');
          }
        } catch (error) {
          console.error('Failed to auto-connect wallet:', error);
        } finally {
          setIsConnecting(false);
        }
      }
    };

    autoConnect();
  }, [isConnected, connect, connectors, context?.client]);

  const handleConnectClick = async () => {
    setIsConnecting(true);
    try {
      // Use the first available connector (usually injected/MetaMask)
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectClick = () => {
    disconnect();
  };

  if (isConnected && address) {
    return (
      <button
        onClick={handleDisconnectClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
      >
        <span className="hidden sm:inline">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        <span className="sm:hidden">Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnectClick}
      disabled={isConnecting || connectors.length === 0}
      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
} 