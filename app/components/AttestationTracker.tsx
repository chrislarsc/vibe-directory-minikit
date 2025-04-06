"use client";

import { useState, useEffect } from "react";
import type { Address } from 'viem';

interface EngagementStats {
  viewedProjects: string[];
  viewCount: number;
}

interface ViewTrackerProps {
  address: Address;
}

export default function ViewTracker({ address }: ViewTrackerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EngagementStats>({
    viewedProjects: [],
    viewCount: 0
  });
  
  useEffect(() => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    fetch(`/api/project-views?userId=${address}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch view data');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setStats({
            viewedProjects: data.data.viewedProjects || [],
            viewCount: data.data.viewCount || 0
          });
        } else {
          throw new Error(data.error || 'Failed to load view data');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user view stats:', err);
        setError('Failed to load view data');
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
          <p className="text-xl font-bold">{stats.viewedProjects.length}</p>
        </div>
      </div>
      
      {stats.viewedProjects.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Start exploring projects to track your views!
        </p>
      )}
    </div>
  );
} 