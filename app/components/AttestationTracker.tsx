"use client";

import { useState, useEffect } from "react";
import type { Address } from 'viem';
import { getUserAttestationData } from "@/lib/attestationClient";

interface AttestationTrackerProps {
  address: Address;
}

export default function AttestationTracker({ address }: AttestationTrackerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    attestationCount: 0,
    uniqueProjectsCount: 0
  });
  
  useEffect(() => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    getUserAttestationData(address)
      .then(data => {
        setStats({
          attestationCount: data.attestationCount,
          uniqueProjectsCount: data.uniqueProjectsCount
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching attestation stats:', err);
        setError('Failed to load attestation data');
        setIsLoading(false);
      });
  }, [address]);
  
  if (isLoading) {
    return (
      <div className="bg-blue-50 p-3 rounded-lg shadow-sm mb-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-3 rounded-lg shadow-sm mb-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 p-3 rounded-lg shadow-sm mb-4">
      <h2 className="text-lg font-semibold mb-2">Your Engagement Stats</h2>
      <div className="flex gap-4">
        <div>
          <p className="text-sm text-gray-600">Projects Viewed</p>
          <p className="text-xl font-bold">{stats.uniqueProjectsCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Attestations</p>
          <p className="text-xl font-bold">{stats.attestationCount}</p>
        </div>
      </div>
      
      {stats.uniqueProjectsCount === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Start exploring projects to earn attestations!
        </p>
      )}
    </div>
  );
} 