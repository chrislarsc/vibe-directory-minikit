"use client";

import { useViews } from './ViewContext';

export default function ViewTracker() {
  const { viewedProjects, viewCount, loading, error } = useViews();
  
  if (loading) {
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
          <p className="text-xl font-bold">{viewedProjects.length}</p>
        </div>
      </div>
      
      {viewedProjects.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Start exploring projects to track your views!
        </p>
      )}
    </div>
  );
} 