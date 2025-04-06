import { v4 as uuidv4 } from 'uuid';
import { Project, projects as initialProjects } from './projects';
import redis from './redis';

// Redis key for projects
const PROJECTS_KEY = 'vibe-directory:projects';

// Initialize the Redis store if needed
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
      console.log('No existing projects found in Redis');
      
      // Initialize with empty array
      const success = await redis.set(PROJECTS_KEY, []);
      if (success === 'OK') {
        console.log('Redis initialized with empty projects array');
      } else {
        console.error('Failed to initialize Redis');
      }
    } else {
      console.log('Projects already exist in Redis, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing Redis:', error);
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
    console.warn('Redis not available, returning empty projects array');
    return [];
  }

  try {
    const projectsData = await redis.get<string | Project[]>(PROJECTS_KEY);
    
    if (!projectsData) {
      console.log('No projects found in Redis');
      return [];
    }
    
    // Handle different types of responses from Redis
    let projects: Project[];
    
    if (typeof projectsData === 'string') {
      try {
        // Try to parse the JSON string
        projects = JSON.parse(projectsData) as Project[];
        console.log('Successfully parsed projects from Redis string');
      } catch (parseError) {
        console.error('Error parsing projects from Redis:', parseError);
        return [];
      }
    } else if (typeof projectsData === 'object' && Array.isArray(projectsData)) {
      // If Redis returned the data already as an array
      projects = projectsData;
      console.log('Retrieved projects as array from Redis');
    } else {
      console.error('Unexpected Redis data format:', typeof projectsData);
      return [];
    }
    
    // Check if any projects exist in the array
    if (!projects || projects.length === 0) {
      console.log('No valid projects array found in Redis');
      return [];
    }
    
    // Debug: Check if any projects have a prompt field
    const hasPromptsCount = projects.filter(p => p.prompt).length;
    console.log(`Returning ${projects.length} projects, ${hasPromptsCount} with prompts`);
    
    // Filter out non-displayed projects unless showAll is true
    return showAll ? projects : projects.filter(p => p.displayed !== false);
  } catch (error) {
    console.error('Error fetching projects from Redis:', error);
    return [];
  }
}

/**
 * Get a project by ID
 * @param id Project ID to retrieve
 * @param isAdmin If true, includes non-displayed projects in the search
 */
export async function getProjectById(id: string, isAdmin: boolean = false): Promise<Project | undefined> {
  // Only get all projects (including non-displayed) if the caller is an admin
  const projects = await getAllProjects(isAdmin);
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
    const projects = await getAllProjects(true); // Get all projects, including non-displayed ones
    
    // Add new project at the beginning of the array
    const updatedProjects = [newProject, ...projects];
    
    // Log the operation for debugging
    console.log(`Adding new project "${newProject.title}" to Redis. Total projects: ${updatedProjects.length}`);
    
    // Save back to Redis with explicit JSON.stringify to ensure proper serialization
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
 * @param id Project ID to update
 * @param projectData Fields to update
 * @param adminAddress Address of the admin making the update (used for auth in API layer)
 */
export async function updateProject(id: string, projectData: Partial<Project>, adminAddress?: string): Promise<Project | null> {
  if (!redis) {
    console.warn('Redis not available, project will not be updated');
    return null;
  }

  try {
    const projects = await getAllProjects(true); // Get all projects, including non-displayed ones
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Check if display status is changing from false to true
    const isBeingDisplayed = projects[index].displayed === false && projectData.displayed === true;
    
    const updatedProject = {
      ...projects[index],
      ...projectData,
    };
    
    projects[index] = updatedProject;
    
    // Save back to Redis
    console.log(`Updating project "${updatedProject.title}" in Redis`);
    const success = await redis.set(PROJECTS_KEY, projects);
    
    if (success !== 'OK') {
      throw new Error('Redis SET operation failed');
    }
    
    // If the project is being displayed for the first time, send notification to users
    if (isBeingDisplayed) {
      try {
        await notifyProjectSubmitted(updatedProject);
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // We don't throw here as we don't want to fail the update
      }
    }
    
    return updatedProject;
  } catch (error) {
    console.error('Error updating project in Redis:', error);
    throw new Error('Failed to update project in database');
  }
}

/**
 * Notify users about a newly displayed project
 */
async function notifyProjectSubmitted(project: Project): Promise<void> {
  if (!redis) {
    console.warn('Redis not available, notifications will not be sent');
    return;
  }

  try {
    // Get project name and author for notification
    const projectName = project.title;
    const authorName = project.author;
    
    // Get keys for all users with stored notification details
    const projectAppName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "minikit";
    const keys = await redis.keys(`${projectAppName}:user:*`);
    
    console.log(`Found ${keys.length} users to notify about new project`);
    
    // Extract FIDs from keys
    const fids = keys.map(key => {
      const fid = key.split(':').pop();
      return fid ? parseInt(fid, 10) : null;
    }).filter(Boolean);
    
    if (fids.length === 0) {
      console.log('No users to notify');
      return;
    }
    
    // Import here to avoid circular dependency
    const { sendFrameNotification } = await import('./notification-client');
    
    // Send notifications to all users
    const results = await Promise.allSettled(
      fids.map(async (fid) => {
        if (!fid) return null;
        
        return sendFrameNotification({
          fid,
          title: 'New project submitted 🚀',
          body: `Check out ${projectName} by ${authorName}`
        });
      })
    );
    
    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value?.state === 'success'
    ).length;
    
    const failed = results.filter(
      r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.state !== 'success')
    ).length;
    
    console.log(`Project notification stats: Total: ${fids.length}, Success: ${successful}, Failed: ${failed}`);
  } catch (error) {
    console.error('Error sending project notifications:', error);
    throw error;
  }
}

/**
 * Delete a project
 * @param id Project ID to delete
 * @param adminAddress Address of the admin making the deletion (used for auth in API layer)
 */
export async function deleteProject(id: string, adminAddress?: string): Promise<boolean> {
  if (!redis) {
    console.warn('Redis not available, project will not be deleted');
    return false;
  }

  try {
    const projects = await getAllProjects(true); // Get all projects, including non-displayed ones
    const projectToDelete = projects.find(project => project.id === id);
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return false; // No project was deleted
    }
    
    // Save back to Redis
    console.log(`Deleting project "${projectToDelete?.title || id}" from Redis`);
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