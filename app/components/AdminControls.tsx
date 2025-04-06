"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";
import type { Address } from 'viem';

interface AdminControlsProps {
  project: Project;
  onUpdate: (updatedProject: Partial<Project>) => Promise<void>;
  onDelete: () => Promise<void>;
  adminAddress?: Address;
}

export default function AdminControls({ 
  project, 
  onUpdate, 
  onDelete,
  adminAddress
}: AdminControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleToggleDisplayed = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await onUpdate({ displayed: !project.displayed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleToggleFeatured = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await onUpdate({ featured: !project.featured });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the project "${project.title}"? This cannot be undone.`)) {
      try {
        setIsDeleting(true);
        setError(null);
        await onDelete();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete project');
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="text-xs uppercase font-semibold text-gray-500 mb-2">Admin Controls</div>
      
      {error && (
        <div className="mb-2 text-xs text-red-600 bg-red-50 p-1 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleToggleDisplayed}
          disabled={isUpdating}
          className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            project.displayed 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <span className={`block w-2 h-2 rounded-full ${project.displayed ? 'bg-green-500' : 'bg-gray-500'}`}></span>
          {project.displayed ? 'Displayed' : 'Hidden'}
        </button>
        
        <button
          onClick={handleToggleFeatured}
          disabled={isUpdating}
          className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            project.featured 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <span className={`block w-2 h-2 rounded-full ${project.featured ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
          {project.featured ? 'Featured' : 'Regular'}
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`px-2 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 ${
            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
} 