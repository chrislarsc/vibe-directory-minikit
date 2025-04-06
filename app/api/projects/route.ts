import { NextResponse } from 'next/server';
import { getAllProjects, addProject } from '@/lib/projectService';
import { ADMIN_ADDRESSES } from '@/lib/constants';
import type { Project } from '@/lib/projects';

/**
 * GET handler to retrieve all projects
 */
export async function GET(request: Request) {
  try {
    // Check if user wants to see all projects (including non-displayed ones)
    const { searchParams } = new URL(request.url);
    const adminAddress = searchParams.get('adminAddress');
    
    // Only show all projects if the user is an admin
    const isAdmin = !!adminAddress && ADMIN_ADDRESSES.some(
      addr => addr.toLowerCase() === adminAddress.toLowerCase()
    );
    
    // Only admins can see all projects
    const showAll = isAdmin && searchParams.get('showAll') === 'true';
    
    const projects = await getAllProjects(showAll);
    
    console.log("API: Returning projects:", projects.length);
    console.log("API: Projects with prompts:", projects.filter(p => p.prompt).length);
    
    if (projects.length > 0) {
      console.log("API: First project info:", {
        id: projects[0].id,
        title: projects[0].title,
        hasPrompt: !!projects[0].prompt
      });
    }
    
    // Disable cache completely to ensure fresh data
    const response = NextResponse.json({ success: true, data: projects });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    
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
 * Both authorized admins and regular users can submit projects
 * Admin submissions are displayed by default, user submissions require approval
 */
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { project, authorAddress, adminAddress } = requestBody;
    
    // Check if it's an admin submission or regular user submission
    const isAdmin = adminAddress && ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase()
    );
    
    // Validate project data
    if (!project || !project.title || !project.description || !project.link || !(authorAddress || project.author)) {
      return NextResponse.json(
        { success: false, error: 'Missing required project fields' },
        { status: 400 }
      );
    }
    
    // Verify the submitted author matches the connected wallet
    if (!authorAddress || authorAddress !== project.authorAddress) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized project submission' },
        { status: 401 }
      );
    }
    
    // Log project submission details with Farcaster information
    console.log(`Submitting new project: "${project.title}" by ${project.author}`, {
      farcasterFid: project.authorFid || 'Not available',
      walletAddress: project.authorAddress,
      isAdmin
    });
    
    // Add creation timestamp if not provided
    if (!project.createdAt) {
      project.createdAt = new Date().toISOString();
    }
    
    // For regular user submissions, ensure displayed is set to false to require moderation
    if (!isAdmin && project.displayed !== false) {
      project.displayed = false;
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