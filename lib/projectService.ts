import { v4 as uuidv4 } from 'uuid';
import { Project, projects as initialProjects } from './projects';
import redis from './redis';

// Redis key for projects
const PROJECTS_KEY = 'vibe-directory:projects';

// Initialize the Redis store with initial projects if it doesn't exist yet
export async function initializeProjectsStore(): Promise<void> {
  if (!redis) {
    console.warn('Redis not available, projects will be stored in memory only');
    return;
  }

  try {
    // Clear any corrupted data
    await redis.del(PROJECTS_KEY);
    
    // Stringify the projects array properly
    const projectsJsonString = JSON.stringify(initialProjects);
    console.log(`Initializing projects in Redis with ${initialProjects.length} projects`);
    
    // Store the stringified data
    const success = await redis.set(PROJECTS_KEY, projectsJsonString);
    if (success === 'OK') {
      console.log('Projects initialized in Redis successfully');
    } else {
      console.error('Failed to initialize projects in Redis');
    }
  } catch (error) {
    console.error('Error initializing projects in Redis:', error);
  }
}

// Initialize immediately on server start
if (typeof window === 'undefined') {
  initializeProjectsStore().catch(error => {
    console.error('Failed to initialize projects store:', error);
  });
}

/**
 * Get all projects
 */
export async function getAllProjects(): Promise<Project[]> {
  if (!redis) {
    console.warn('Redis not available, returning initial projects');
    return [...initialProjects];
  }

  try {
    const projectsJson = await redis.get<string>(PROJECTS_KEY);
    
    if (!projectsJson) {
      console.log('No projects found in Redis, initializing...');
      await initializeProjectsStore();
      return [...initialProjects];
    }
    
    try {
      // Try to parse the JSON
      return JSON.parse(projectsJson) as Project[];
    } catch (parseError) {
      console.error('Error parsing projects from Redis:', parseError);
      // If we can't parse the JSON, reinitialize and return defaults
      await initializeProjectsStore();
      return [...initialProjects];
    }
  } catch (error) {
    console.error('Error fetching projects from Redis:', error);
    return [...initialProjects]; // Fallback to initial projects on error
  }
}

/**
 * Get a project by ID
 */
export async function getProjectById(id: string): Promise<Project | undefined> {
  const projects = await getAllProjects();
  return projects.find(project => project.id === id);
}

/**
 * Add a new project
 */
export async function addProject(projectData: Omit<Project, 'id'>): Promise<Project> {
  const newProject: Project = {
    id: uuidv4(),
    ...projectData,
  };
  
  if (!redis) {
    console.warn('Redis not available, project will not be persisted');
    return newProject;
  }

  try {
    // Get current projects
    const projects = await getAllProjects();
    
    // Add new project at the beginning of the array
    const updatedProjects = [newProject, ...projects];
    
    // Save back to Redis - ensure proper serialization
    const projectsJson = JSON.stringify(updatedProjects);
    const success = await redis.set(PROJECTS_KEY, projectsJson);
    
    if (success !== 'OK') {
      throw new Error('Redis SET operation failed');
    }
    
    return newProject;
  } catch (error) {
    console.error('Error adding project to Redis:', error);
    throw new Error('Failed to add project to database');
  }
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
  if (!redis) {
    console.warn('Redis not available, project will not be updated');
    return null;
  }

  try {
    const projects = await getAllProjects();
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedProject = {
      ...projects[index],
      ...projectData,
    };
    
    projects[index] = updatedProject;
    
    // Save back to Redis - ensure proper serialization
    const projectsJson = JSON.stringify(projects);
    const success = await redis.set(PROJECTS_KEY, projectsJson);
    
    if (success !== 'OK') {
      throw new Error('Redis SET operation failed');
    }
    
    return updatedProject;
  } catch (error) {
    console.error('Error updating project in Redis:', error);
    throw new Error('Failed to update project in database');
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  if (!redis) {
    console.warn('Redis not available, project will not be deleted');
    return false;
  }

  try {
    const projects = await getAllProjects();
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return false; // No project was deleted
    }
    
    // Save back to Redis - ensure proper serialization
    const projectsJson = JSON.stringify(filteredProjects);
    const success = await redis.set(PROJECTS_KEY, projectsJson);
    
    if (success !== 'OK') {
      throw new Error('Redis SET operation failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project from Redis:', error);
    throw new Error('Failed to delete project from database');
  }
} 