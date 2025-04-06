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
    // Extract project data from request body
    const body = await request.json();
    const { project, authorAddress } = body;

    console.log('===== API DEBUG: Received project submission:', {
      projectTitle: project.title,
      authorInPayload: project.author,
      authorFidInPayload: project.authorFid,
      authorAddressInPayload: project.authorAddress,
      clientAuthorAddress: authorAddress
    }, '=====');

    // Validate project data
    if (!project || !project.title || !project.description || !project.link) {
      console.error('===== API DEBUG: Invalid project data (missing required fields) =====');
      return NextResponse.json({ success: false, error: 'Invalid project data' }, { status: 400 });
    }

    // Validate author information
    if (!project.author || !project.authorAddress) {
      console.error('===== API DEBUG: Missing author information =====');
      return NextResponse.json({ success: false, error: 'Author information is required' }, { status: 400 });
    }

    // Verify the authorAddress matches the one from the client
    if (project.authorAddress !== authorAddress) {
      console.error('===== API DEBUG: Author address mismatch:', { 
        payloadAddress: project.authorAddress, 
        clientAddress: authorAddress 
      }, '=====');
      return NextResponse.json({ success: false, error: 'Invalid author' }, { status: 403 });
    }

    // Save project to database using the Redis-based service
    try {
      console.log('===== API DEBUG: Storing project with author:', project.author, '=====');
      console.log('===== API DEBUG: Storing project with authorFid:', project.authorFid, '=====');
      
      // Add project to Redis using the existing service function
      const newProject = await addProject(project);
      
      console.log('===== API DEBUG: Project saved successfully:', { 
        id: newProject.id,
        author: newProject.author,
        authorFid: newProject.authorFid
      }, '=====');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Project submitted successfully',
        projectId: newProject.id
      });
    } catch (dbError) {
      console.error('===== API DEBUG: Database error:', dbError, '=====');
      return NextResponse.json({ success: false, error: 'Failed to save project' }, { status: 500 });
    }
  } catch (error) {
    console.error('===== API DEBUG: Server error:', error, '=====');
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 