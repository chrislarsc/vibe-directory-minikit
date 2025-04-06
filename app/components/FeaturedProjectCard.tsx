"use client";

import { useState } from "react";
import { useOpenUrl, useViewProfile } from "@coinbase/onchainkit/minikit";
import type { Project } from "@/lib/projects";
import type { Address } from 'viem';
import { useViews } from "./ViewContext";
import PromptModal from "./PromptModal";
import AdminControls from "./AdminControls";
import { ADMIN_ADDRESSES } from "@/lib/constants";

interface FeaturedProjectCardProps {
  project: Project;
  userAddress?: Address;
  onProjectUpdated?: () => void;
  onProjectDeleted?: () => void;
}

export default function FeaturedProjectCard({ 
  project, 
  userAddress,
  onProjectUpdated,
  onProjectDeleted
}: FeaturedProjectCardProps) {
  const openUrl = useOpenUrl();
  const viewProfile = useViewProfile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const { hasViewedProject, trackProjectView } = useViews();
  
  const hasViewed = hasViewedProject(project.id);
  
  // Check if user is admin
  const isAdmin = !!userAddress && ADMIN_ADDRESSES.some(
    addr => addr.toLowerCase() === userAddress.toLowerCase()
  );

  // Status indicator for pending projects (only shown to admins)
  const isPendingApproval = isAdmin && !project.displayed;
  
  const handleProjectClick = async () => {
    if (!project.link) return;
    
    // Only track view and make API call if:
    // 1. User has wallet connected
    // 2. User hasn't viewed this project before
    if (userAddress && !hasViewed) {
      setIsProcessing(true);
      try {
        await trackProjectView(project.id);
      } catch (error) {
        console.error("Failed to track project view:", error);
      } finally {
        setIsProcessing(false);
      }
    }
    
    // Always open the URL regardless of view tracking
    openUrl(project.link);
  };
  
  const handleUpdateProject = async (updatedFields: Partial<Project>) => {
    if (!isAdmin || !userAddress) return;
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminAddress: userAddress,
          project: updatedFields
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error(`Update failed for project ${project.id}:`, data.error);
        throw new Error(data.error || 'Failed to update project');
      }
      
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (error) {
      console.error(`Error updating project ${project.id}:`, error);
      throw error;
    }
  };
  
  const handleDeleteProject = async () => {
    if (!isAdmin || !userAddress) return;
    
    try {
      const response = await fetch(`/api/projects/${project.id}?adminAddress=${userAddress}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error(`Delete failed for project ${project.id}:`, data.error);
        throw new Error(data.error || 'Failed to delete project');
      }
      
      if (onProjectDeleted) {
        onProjectDeleted();
      }
    } catch (error) {
      console.error(`Error deleting project ${project.id}:`, error);
      throw error;
    }
  };
  
  const handleViewAuthorProfile = () => {
    if (project.authorFid && project.authorFid > 0) {
      viewProfile(project.authorFid);
    }
  };

  return (
    <div className={`p-4 border rounded-lg bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow ${isPendingApproval ? 'border-yellow-400' : ''}`}>
      {isPendingApproval && (
        <div className="mb-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block">
          Pending Approval
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        {project.image && (
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-auto rounded-lg object-cover"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        <div className={project.image ? "md:w-2/3" : "w-full"}>
          <h2 className="text-xl font-bold">{project.title}</h2>
          <p className="text-sm text-gray-600 mb-2">
            By{' '}
            {project.authorFid && project.authorFid > 0 ? (
              <button 
                onClick={handleViewAuthorProfile}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {project.author}
              </button>
            ) : (
              <span>{project.author}</span>
            )}
          </p>
          <p className="mb-4 text-gray-800">{project.description}</p>
          
          <div className="flex items-center">
            <div className="flex space-x-2">
              {project.link ? (
                <button 
                  onClick={handleProjectClick}
                  disabled={isProcessing}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Check out project'}
                </button>
              ) : (
                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg inline-block">
                  Coming soon
                </span>
              )}
              
              {project.prompt && (
                <button 
                  onClick={() => setIsPromptModalOpen(true)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  See prompt
                </button>
              )}
            </div>
            
            {userAddress && hasViewed && (
              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Viewed ✓
              </span>
            )}
          </div>
        </div>
      </div>
      
      {isAdmin && (
        <AdminControls 
          project={project}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          adminAddress={userAddress}
        />
      )}
      
      {project.prompt && (
        <PromptModal
          prompt={project.prompt}
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
        />
      )}
    </div>
  );
} 