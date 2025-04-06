"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Address } from 'viem';

interface ViewContextType {
  viewedProjects: string[];
  viewCount: number;
  loading: boolean;
  error: string | null;
  trackProjectView: (projectId: string) => Promise<boolean>;
  hasViewedProject: (projectId: string) => boolean;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
  children: ReactNode;
  userAddress?: Address;
}

export function ViewProvider({ children, userAddress }: ViewProviderProps) {
  const [viewedProjects, setViewedProjects] = useState<string[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch view data when user address changes
  useEffect(() => {
    if (!userAddress) {
      setViewedProjects([]);
      setViewCount(0);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/project-views?userId=${userAddress}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch view data');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setViewedProjects(data.data.viewedProjects || []);
          setViewCount(data.data.viewCount || 0);
        } else {
          throw new Error(data.error || 'Failed to load view data');
        }
      })
      .catch(err => {
        console.error('Error fetching user view stats:', err);
        setError('Failed to load view data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userAddress]);
  
  // Track a project view
  const trackProjectView = async (projectId: string): Promise<boolean> => {
    if (!userAddress || viewedProjects.includes(projectId)) {
      return false;
    }
    
    try {
      const response = await fetch('/api/project-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userAddress,
          projectId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state to avoid extra API calls
        setViewedProjects(prev => [...prev, projectId]);
        setViewCount(prev => prev + 1);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error tracking project view:', error);
      return false;
    }
  };
  
  // Check if user has viewed a project
  const hasViewedProject = (projectId: string): boolean => {
    return viewedProjects.includes(projectId);
  };
  
  const value = {
    viewedProjects,
    viewCount,
    loading,
    error,
    trackProjectView,
    hasViewedProject
  };
  
  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  );
}

export function useViews() {
  const context = useContext(ViewContext);
  
  if (context === undefined) {
    throw new Error('useViews must be used within a ViewProvider');
  }
  
  return context;
} 