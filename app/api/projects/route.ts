import { NextResponse } from 'next/server';
import { getAllProjects, addProject } from '@/lib/projectService';
import { ADMIN_ADDRESSES } from '@/lib/constants';
import type { Project } from '@/lib/projects';

/**
 * GET handler to retrieve all projects
 */
export async function GET() {
  try {
    const projects = await getAllProjects();
    
    // Add cache control headers (5 minutes cache TTL for projects)
    const response = NextResponse.json({ success: true, data: projects });
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to add a new project
 * Only authorized admin users can add projects
 */
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { project, adminAddress } = requestBody;
    
    // Verify admin user is authorized
    if (!adminAddress || !ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase())
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate project data
    if (!project || !project.title || !project.description || !project.link || !project.author) {
      return NextResponse.json(
        { success: false, error: 'Missing required project fields' },
        { status: 400 }
      );
    }
    
    // Add creation timestamp if not provided
    if (!project.createdAt) {
      project.createdAt = new Date().toISOString();
    }
    
    // Add the project to the database
    const newProject = await addProject(project as Omit<Project, 'id'>);
    
    // Return success without cache (since this is a mutation)
    const response = NextResponse.json({ 
      success: true, 
      data: newProject
    });
    
    // No caching for POST responses
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 