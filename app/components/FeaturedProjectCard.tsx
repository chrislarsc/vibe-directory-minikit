"use client";

import { useState, useEffect } from "react";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import type { Project } from "@/lib/projects";
import { createAttestationForProjectView, hasUserViewedProject } from "@/lib/attestationClient";
import type { Address } from 'viem';

interface FeaturedProjectCardProps {
  project: Project;
  userAddress?: Address;
}

export default function FeaturedProjectCard({ project, userAddress }: FeaturedProjectCardProps) {
  const openUrl = useOpenUrl();
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  
  // Check if user has viewed this project when component mounts or address changes
  useEffect(() => {
    if (userAddress) {
      hasUserViewedProject(userAddress, project.id)
        .then(viewed => {
          setHasViewed(viewed);
        })
        .catch(err => console.error('Error checking project view status:', err));
    }
  }, [userAddress, project.id]);
  
  const handleProjectClick = async () => {
    if (!project.link) return;
    
    if (userAddress) {
      setIsCreatingAttestation(true);
      try {
        // Create attestation first
        await createAttestationForProjectView(userAddress, project.id);
        setHasViewed(true);
        // Then open URL
        openUrl(project.link);
      } catch (error) {
        console.error("Failed to create attestation:", error);
        // Open URL anyway if attestation fails
        openUrl(project.link);
      } finally {
        setIsCreatingAttestation(false);
      }
    } else {
      // Just open URL if wallet not connected
      openUrl(project.link);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
          <p className="text-sm text-gray-600 mb-2">By {project.author}</p>
          <p className="mb-4 text-gray-800">{project.description}</p>
          
          <div className="flex items-center">
            {project.link ? (
              <button 
                onClick={handleProjectClick}
                disabled={isCreatingAttestation}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isCreatingAttestation ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCreatingAttestation ? 'Processing...' : 'Check out project'}
              </button>
            ) : (
              <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg inline-block">
                Coming soon
              </span>
            )}
            
            {userAddress && hasViewed && (
              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Viewed ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 