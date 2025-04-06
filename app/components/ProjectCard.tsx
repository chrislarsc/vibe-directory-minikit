"use client";

import { useState } from "react";
import { useOpenUrl, useViewProfile } from "@coinbase/onchainkit/minikit";
import type { Project } from "@/lib/projects";
import type { Address } from 'viem';
import { useViews } from "./ViewContext";
import PromptModal from "./PromptModal";
import AdminControls from "./AdminControls";
import { ADMIN_ADDRESSES } from "@/lib/constants";

interface ProjectCardProps {
  project: Project;
  userAddress?: Address;
  onProjectUpdated?: () => void;
  onProjectDeleted?: () => void;
}

export default function ProjectCard({ 
  project, 
  userAddress, 
  onProjectUpdated,
  onProjectDeleted
}: ProjectCardProps) {
  const openUrl = useOpenUrl();
  const viewProfile = useViewProfile();
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { hasViewedProject, trackProjectView } = useViews();
  const hasViewed = hasViewedProject(project.id);
  
  // Check if user is admin to control admin features visibility
  const isAdmin = userAddress ? ADMIN_ADDRESSES.some(
    admin => admin.toLowerCase() === userAddress.toLowerCase()
  ) : false;
  
  // Whether project is pending approval
  const isPendingApproval = project.displayed === false;
  
  const handleProjectClick = async () => {
    if (!project.link) return;
    
    setIsProcessing(true);
    
    try {
      // Track the view using our context
      await trackProjectView(project.id);
      // Then open URL
      openUrl(project.link);
    } catch (error) {
      console.error("Error processing project click:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleUpdateProject = async (updatedFields: Partial<Project>) => {
    if (!isAdmin || !userAddress) return;
    
    try {
      console.log(`Updating project with ID: ${project.id}`, updatedFields);
      
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
      
      console.log(`Successfully updated project ${project.id}`);
      
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
        throw new Error(data.error || 'Failed to delete project');
      }
      
      if (onProjectDeleted) {
        onProjectDeleted();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };
  
  const handleViewAuthorProfile = () => {
    if (project.authorFid && project.authorFid > 0) {
      viewProfile(project.authorFid);
    }
  };

  return (
    <div className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${isPendingApproval ? 'border-yellow-400' : ''}`}>
      {isPendingApproval && (
        <div className="mb-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block">
          Pending Approval
        </div>
      )}
      
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
      
      <div className="flex items-center justify-between">
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