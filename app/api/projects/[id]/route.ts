import { NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/projectService';
import { ADMIN_ADDRESSES } from '@/lib/constants';
// Project type is used implicitly in the request body
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Project } from '@/lib/projects';

/**
 * GET handler to retrieve a single project by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if requesting user is an admin
    const { searchParams } = new URL(request.url);
    const adminAddress = searchParams.get('adminAddress');
    const isAdmin = !!adminAddress && ADMIN_ADDRESSES.some(
      addr => addr.toLowerCase() === adminAddress.toLowerCase()
    );
    
    // Pass isAdmin flag to determine if we should include non-displayed projects
    const project = await getProjectById(id, isAdmin);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error(`Error fetching project with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update a project
 * Only admins can update projects
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Attempting to update project with ID: ${id}`);
    
    const { adminAddress, project: updatedFields } = await request.json();
    
    // Verify admin user is authorized
    const isAdmin = !!adminAddress && ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase()
    );
    
    if (!isAdmin) {
      console.log(`Unauthorized update attempt from address: ${adminAddress}`);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`Checking if project ${id} exists (admin: ${adminAddress})`);
    // Pass true for isAdmin to ensure we can find non-displayed projects
    const existingProject = await getProjectById(id, true);
    
    if (!existingProject) {
      console.error(`Project not found with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    console.log(`Project found: ${existingProject.title}. Updating fields:`, updatedFields);
    
    // Update the project
    const updated = await updateProject(id, updatedFields, adminAddress);
    
    if (!updated) {
      console.error(`Failed to update project with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Failed to update project' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully updated project: ${updated.title}`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(`Error updating project with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a project
 * Only admins can delete projects
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Attempting to delete project with ID: ${id}`);
    
    const { searchParams } = new URL(request.url);
    const adminAddress = searchParams.get('adminAddress');
    
    // Verify admin user is authorized
    const isAdmin = !!adminAddress && ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase()
    );
    
    if (!isAdmin) {
      console.log(`Unauthorized delete attempt from address: ${adminAddress}`);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`Checking if project ${id} exists (admin: ${adminAddress})`);
    // Pass true for isAdmin to ensure we can find non-displayed projects
    const existingProject = await getProjectById(id, true);
    
    if (!existingProject) {
      console.error(`Project not found with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    console.log(`Project found: ${existingProject.title}. Proceeding with deletion.`);
    
    // Delete the project
    const deleted = await deleteProject(id, adminAddress);
    
    if (!deleted) {
      console.error(`Failed to delete project with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Failed to delete project' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted project: ${existingProject.title}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting project with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 