"use client";

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

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