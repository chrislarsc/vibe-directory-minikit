const fs = require('fs');
const path = require('path');
const { Redis } = require('@upstash/redis');

// Load env variables from .env file
require('dotenv').config();

async function main() {
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    console.error('Redis configuration missing in environment variables');
    process.exit(1);
  }

  // Create Redis client
  let redis = null;
  try {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
    console.log("Redis client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    process.exit(1);
  }

  // Redis key for projects
  const PROJECTS_KEY = 'vibe-directory:projects';

  try {
    // Read prompt content
    const promptFilePath = path.join(process.cwd(), 'prompt-1.md');
    const promptContent = fs.readFileSync(promptFilePath, 'utf8');
    
    console.log('Read prompt content successfully');

    // Get current projects from Redis
    let projectsData = await redis.get(PROJECTS_KEY);
    
    if (!projectsData) {
      console.error('No projects found in Redis');
      process.exit(1);
    }
    
    console.log('Retrieved Redis data type:', typeof projectsData);
    
    // Parse projects if needed
    let projects;
    if (typeof projectsData === 'string') {
      try {
        projects = JSON.parse(projectsData);
      } catch (parseError) {
        console.error('Error parsing projects from Redis:', parseError);
        process.exit(1);
      }
    } else if (typeof projectsData === 'object') {
      projects = projectsData;
    } else {
      console.error('Unexpected Redis data format:', typeof projectsData);
      process.exit(1);
    }
    
    console.log('Projects format:', Array.isArray(projects) ? 'array' : typeof projects);
    
    // Find project with id:1
    const projectIndex = projects.findIndex(p => p.id === "1");
    
    if (projectIndex === -1) {
      console.error('Project with id:1 not found');
      process.exit(1);
    }
    
    // Update project with prompt
    projects[projectIndex] = {
      ...projects[projectIndex],
      prompt: promptContent,
    };
    
    console.log('Updated project:', projects[projectIndex].title);
    
    // Save back to Redis as an object directly, not as JSON string
    const success = await redis.set(PROJECTS_KEY, projects);
    
    if (success === 'OK') {
      console.log('Successfully updated project with prompt data');
    } else {
      console.error('Failed to update Redis');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error); 