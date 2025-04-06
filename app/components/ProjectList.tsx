"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/lib/projects";
import type { Address } from 'viem';
import ProjectCard from "./ProjectCard";
import FeaturedProjectCard from "./FeaturedProjectCard";

interface ProjectListProps {
  projects: Project[];
  userAddress?: Address;
  onProjectsChanged?: () => void;
  isLoading?: boolean;
}

export default function ProjectList({ projects, userAddress, onProjectsChanged, isLoading = false }: ProjectListProps) {
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    setDisplayedProjects(projects);
  }, [projects]);
  
  // Separate featured and regular projects
  const featuredProjects = displayedProjects.filter(p => p.featured);
  const regularProjects = displayedProjects.filter(p => !p.featured);
  
  const handleProjectUpdated = () => {
    // Notify parent component to refresh projects
    if (onProjectsChanged) {
      onProjectsChanged();
    }
  };
  
  const handleProjectDeleted = () => {
    // Notify parent component to refresh projects
    if (onProjectsChanged) {
      onProjectsChanged();
    }
  };

  // Loading state UI
  if (isLoading) {
    return (
      <div className="mt-4">
        <h1 className="text-2xl font-bold mb-4">Vibe Coding Projects</h1>
        <div className="p-8 bg-gray-50 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
          </div>
          <div className="mt-4 text-center text-gray-500">
            Loading projects...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-4">Vibe Coding Projects</h1>
      
      {displayedProjects.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            There are currently no projects to display. This may be due to a connection issue.
          </p>
          <button 
            onClick={() => onProjectsChanged && onProjectsChanged()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Projects
          </button>
        </div>
      ) : (
        <>
          {/* Featured projects section */}
          {featuredProjects.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-4">
                {featuredProjects.map(project => (
                  <FeaturedProjectCard
                    key={project.id}
                    project={project}
                    userAddress={userAddress}
                    onProjectUpdated={handleProjectUpdated}
                    onProjectDeleted={handleProjectDeleted}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Regular projects list */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            {regularProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                userAddress={userAddress}
                onProjectUpdated={handleProjectUpdated}
                onProjectDeleted={handleProjectDeleted}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 