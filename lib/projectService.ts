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
    // Check if projects already exist in Redis
    const existingProjects = await redis.get(PROJECTS_KEY);
    
    // Only initialize if no projects exist
    if (!existingProjects) {
      console.log(`No existing projects found. Initializing Redis with ${initialProjects.length} projects`);
      
      // Store the data directly as an object
      const success = await redis.set(PROJECTS_KEY, initialProjects);
      if (success === 'OK') {
        console.log('Projects initialized in Redis successfully');
      } else {
        console.error('Failed to initialize projects in Redis');
      }
    } else {
      console.log('Projects already exist in Redis, skipping initialization');
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
 * @param showAll If true, returns all projects including those not yet approved for display (admin only)
 */
export async function getAllProjects(showAll: boolean = false): Promise<Project[]> {
  if (!redis) {
    console.warn('Redis not available, returning initial projects');
    return showAll 
      ? [...initialProjects]
      : [...initialProjects].filter(p => p.displayed !== false);
  }

  try {
    const projectsData = await redis.get<string | Project[]>(PROJECTS_KEY);
    
    if (!projectsData) {
      console.log('No projects found in Redis, initializing...');
      await initializeProjectsStore();
      return showAll 
        ? [...initialProjects]
        : [...initialProjects].filter(p => p.displayed !== false);
    }
    
    // Handle different types of responses from Redis
    let projects: Project[];
    
    if (typeof projectsData === 'string') {
      try {
        // Try to parse the JSON string
        projects = JSON.parse(projectsData) as Project[];
      } catch (parseError) {
        console.error('Error parsing projects from Redis:', parseError);
        // If we can't parse the JSON, reinitialize and return defaults
        await initializeProjectsStore();
        return showAll 
          ? [...initialProjects]
          : [...initialProjects].filter(p => p.displayed !== false);
      }
    } else if (typeof projectsData === 'object' && Array.isArray(projectsData)) {
      // If Redis returned the data already as an array
      projects = projectsData;
    } else {
      console.error('Unexpected Redis data format:', typeof projectsData);
      await initializeProjectsStore();
      return showAll 
        ? [...initialProjects]
        : [...initialProjects].filter(p => p.displayed !== false);
    }
    
    // Debug: Check if any projects have a prompt field
    const hasPromptsCount = projects.filter(p => p.prompt).length;
    console.log(`Returning ${projects.length} projects, ${hasPromptsCount} with prompts`);
    
    // Filter out non-displayed projects unless showAll is true
    return showAll ? projects : projects.filter(p => p.displayed !== false);
  } catch (error) {
    console.error('Error fetching projects from Redis:', error);
    return showAll 
      ? [...initialProjects]
      : [...initialProjects].filter(p => p.displayed !== false);
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
    
    // Save back to Redis as objects directly
    const success = await redis.set(PROJECTS_KEY, updatedProjects);
    
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
export async function updateProject(id: string, projectData: Partial<Project>, adminAddress?: string): Promise<Project | null> {
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
    
    // Save back to Redis as objects directly
    const success = await redis.set(PROJECTS_KEY, projects);
    
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
export async function deleteProject(id: string, adminAddress?: string): Promise<boolean> {
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
    
    // Save back to Redis as objects directly
    const success = await redis.set(PROJECTS_KEY, filteredProjects);
    
    if (success !== 'OK') {
      throw new Error('Redis SET operation failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project from Redis:', error);
    throw new Error('Failed to delete project from database');
  }
} 