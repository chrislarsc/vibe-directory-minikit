"use client";

import { useState } from "react";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import type { Project } from "@/lib/projects";
import type { Address } from 'viem';
import { useViews } from "./ViewContext";
import PromptModal from "./PromptModal";

interface ProjectCardProps {
  project: Project;
  userAddress?: Address;
}

export default function ProjectCard({ project, userAddress }: ProjectCardProps) {
  const openUrl = useOpenUrl();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const { hasViewedProject, trackProjectView } = useViews();
  
  const hasViewed = hasViewedProject(project.id);
  
  const handleProjectClick = async () => {
    if (!project.link) return;
    
    if (userAddress && !hasViewed) {
      setIsProcessing(true);
      try {
        // Track the view using our context
        await trackProjectView(project.id);
        // Then open URL
        openUrl(project.link);
      } catch (error) {
        console.error("Failed to track project view:", error);
        // Open URL anyway if tracking fails
        openUrl(project.link);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Just open URL if wallet not connected or already viewed
      openUrl(project.link);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-bold">{project.title}</h2>
      <p className="text-sm text-gray-600 mb-2">By {project.author}</p>
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