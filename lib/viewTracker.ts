import redis from './redis';

// Redis key prefixes
const USER_VIEWS_KEY_PREFIX = 'vibe-directory:user-views:';
const PROJECT_VIEW_COUNT_PREFIX = 'vibe-directory:project-view-count:';

/**
 * Get the Redis key for a user's viewed projects
 */
function getUserViewsKey(userId: string): string {
  return `${USER_VIEWS_KEY_PREFIX}${userId}`;
}

/**
 * Get the Redis key for a project's view count
 */
function getProjectViewCountKey(projectId: string): string {
  return `${PROJECT_VIEW_COUNT_PREFIX}${projectId}`;
}

/**
 * Track that a user has viewed a project
 * Also increments the project's view counter
 */
export async function trackProjectView(userId: string, projectId: string): Promise<boolean> {
  if (!redis) {
    console.warn('Redis not available, cannot track project view');
    return false;
  }

  try {
    // Use a transaction to atomically add the project to the user's set
    // and increment the project's view counter
    const pipeline = redis.pipeline();
    
    // Check if user has already viewed this project
    const hasViewed = await redis.sismember(getUserViewsKey(userId), projectId);
    
    // Only increment view count if this is a new view
    if (!hasViewed) {
      pipeline.sadd(getUserViewsKey(userId), projectId);
      pipeline.incr(getProjectViewCountKey(projectId));
    }
    
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error('Error tracking project view:', error);
    return false;
  }
}

/**
 * Track multiple project views in batch
 */
export async function trackMultipleViews(userId: string, projectIds: string[]): Promise<boolean> {
  if (!redis || !projectIds.length) return false;
  
  try {
    const pipeline = redis.pipeline();
    
    // Get all already viewed projects to avoid double counting
    const viewedProjects = await getUserViewedProjects(userId);
    
    for (const projectId of projectIds) {
      // Only track new views
      if (!viewedProjects.includes(projectId)) {
        pipeline.sadd(getUserViewsKey(userId), projectId);
        pipeline.incr(getProjectViewCountKey(projectId));
      }
    }
    
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error('Error tracking multiple views:', error);
    return false;
  }
}

/**
 * Get all projects viewed by a user
 */
export async function getUserViewedProjects(userId: string): Promise<string[]> {
  if (!redis) {
    console.warn('Redis not available, cannot get viewed projects');
    return [];
  }

  try {
    // Get all project IDs from the user's set
    const projectIds = await redis.smembers(getUserViewsKey(userId));
    return projectIds || [];
  } catch (error) {
    console.error('Error getting viewed projects:', error);
    return [];
  }
}

/**
 * Check if a user has viewed a specific project
 */
export async function hasUserViewedProject(userId: string, projectId: string): Promise<boolean> {
  if (!redis) {
    console.warn('Redis not available, cannot check if project was viewed');
    return false;
  }

  try {
    // Check if the project ID is in the user's set
    const isViewed = await redis.sismember(getUserViewsKey(userId), projectId);
    return !!isViewed;
  } catch (error) {
    console.error('Error checking if project is viewed:', error);
    return false;
  }
}

/**
 * Get the number of projects viewed by a user
 */
export async function getUserViewCount(userId: string): Promise<number> {
  if (!redis) {
    console.warn('Redis not available, cannot count viewed projects');
    return 0;
  }

  try {
    // Count the number of projects in the user's set
    const count = await redis.scard(getUserViewsKey(userId));
    return count || 0;
  } catch (error) {
    console.error('Error counting viewed projects:', error);
    return 0;
  }
}

/**
 * Get the number of views for a project
 * Uses a counter instead of scanning all keys
 */
export async function getProjectViewCount(projectId: string): Promise<number> {
  if (!redis) {
    console.warn('Redis not available, cannot count project views');
    return 0;
  }

  try {
    // Get the count from the counter key directly
    const count = await redis.get(getProjectViewCountKey(projectId));
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error counting project views:', error);
    return 0;
  }
}

/**
 * Get view counts for multiple projects in a single operation
 */
export async function getMultipleProjectViewCounts(projectIds: string[]): Promise<Record<string, number>> {
  if (!redis || !projectIds.length) {
    return {};
  }

  try {
    const pipeline = redis.pipeline();
    
    // Add get commands for each project counter
    projectIds.forEach(id => {
      pipeline.get(getProjectViewCountKey(id));
    });
    
    // Execute all commands at once
    const results = await pipeline.exec();
    
    // Map results to project IDs
    const viewCounts: Record<string, number> = {};
    if (results) {
      results.forEach((result, index) => {
        const projectId = projectIds[index];
        if (result && Array.isArray(result) && result.length > 1) {
          const countValue = result[1];
          const count = typeof countValue === 'string' ? parseInt(countValue, 10) : 0;
          viewCounts[projectId] = count;
        } else {
          viewCounts[projectId] = 0;
        }
      });
    }
    
    return viewCounts;
  } catch (error) {
    console.error('Error getting multiple project view counts:', error);
    return {};
  }
} 