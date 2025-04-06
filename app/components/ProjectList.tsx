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
}

export default function ProjectList({ projects, userAddress, onProjectsChanged }: ProjectListProps) {
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    setDisplayedProjects(projects);
  }, [projects]);
  
  // Separate featured and regular projects
  const featuredProjects = displayedProjects.filter(p => p.featured);
  const regularProjects = displayedProjects.filter(p => !p.featured);
  
  const handleProjectUpdated = () => {
    console.log("Project updated, triggering refresh...");
    // Notify parent component to refresh projects
    if (onProjectsChanged) {
      onProjectsChanged();
    }
  };
  
  const handleProjectDeleted = () => {
    console.log("Project deleted, triggering refresh...");
    // Notify parent component to refresh projects
    if (onProjectsChanged) {
      onProjectsChanged();
    }
  };
  
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-4">Vibe Coding Projects</h1>
      
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
    </div>
  );
} 