import { v4 as uuidv4 } from 'uuid';
import { Project, projects as initialProjects } from './projects';

// In a real app, this would be stored in a database
let projects = [...initialProjects];

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return [...projects];
}

/**
 * Get a project by ID
 */
export function getProjectById(id: string): Project | undefined {
  return projects.find(project => project.id === id);
}

/**
 * Add a new project
 */
export function addProject(projectData: Omit<Project, 'id'>): Project {
  const newProject: Project = {
    id: uuidv4(),
    ...projectData,
  };
  
  // In a real app, this would save to a database
  projects = [newProject, ...projects];
  
  return newProject;
}

/**
 * Update an existing project
 */
export function updateProject(id: string, projectData: Partial<Project>): Project | null {
  const index = projects.findIndex(project => project.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedProject = {
    ...projects[index],
    ...projectData,
  };
  
  projects[index] = updatedProject;
  
  return updatedProject;
}

/**
 * Delete a project
 */
export function deleteProject(id: string): boolean {
  const initialLength = projects.length;
  projects = projects.filter(project => project.id !== id);
  
  return initialLength > projects.length;
} 