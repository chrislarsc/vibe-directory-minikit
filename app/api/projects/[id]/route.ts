import { NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/projectService';
import { ADMIN_ADDRESSES } from '@/lib/constants';
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
    const project = await getProjectById(id);
    
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
    const { adminAddress, project: updatedFields } = await request.json();
    
    // Verify admin user is authorized
    if (!adminAddress || !ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase())
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const existingProject = await getProjectById(id);
    
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Update the project
    const updated = await updateProject(id, updatedFields, adminAddress);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update project' },
        { status: 500 }
      );
    }
    
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
    const { searchParams } = new URL(request.url);
    const adminAddress = searchParams.get('adminAddress');
    
    // Verify admin user is authorized
    if (!adminAddress || !ADMIN_ADDRESSES.some(addr => 
      addr.toLowerCase() === adminAddress.toLowerCase())
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const existingProject = await getProjectById(id);
    
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Delete the project
    const deleted = await deleteProject(id, adminAddress);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete project' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting project with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 