import { NextResponse } from 'next/server';
import { 
  trackProjectView,
  trackMultipleViews,
  getUserViewedProjects, 
  getUserViewCount, 
  getProjectViewCount
} from '@/lib/viewTracker';

/**
 * GET handler to retrieve viewing stats for a user or project
 * ?userId=<userId> - Get projects viewed by user and count
 * ?projectId=<projectId> - Get view count for a project
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const projectId = searchParams.get('projectId');
  
  if (!userId && !projectId) {
    return NextResponse.json(
      { success: false, error: 'Missing userId or projectId parameter' },
      { status: 400 }
    );
  }
  
  try {
    if (userId) {
      // Get stats for a user
      const [viewedProjects, viewCount] = await Promise.all([
        getUserViewedProjects(userId),
        getUserViewCount(userId)
      ]);
      
      // Add cache headers (1 minute for user data)
      const response = NextResponse.json({
        success: true,
        data: {
          userId,
          viewedProjects,
          viewCount
        }
      });
      
      response.headers.set('Cache-Control', 'private, max-age=60');
      return response;
    } else if (projectId) {
      // Get view count for a project
      const viewCount = await getProjectViewCount(projectId);
      
      // Add cache headers (5 minutes for project data)
      const response = NextResponse.json({
        success: true,
        data: {
          projectId,
          viewCount
        }
      });
      
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }
  } catch (error) {
    console.error('Error getting view stats:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to track project views
 * Single view: { userId: string, projectId: string }
 * Multiple views: { userId: string, projectIds: string[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, projectId, projectIds } = body;
    
    // Handle batch operation if projectIds array is provided
    if (userId && projectIds && Array.isArray(projectIds)) {
      if (projectIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Empty projectIds array' },
          { status: 400 }
        );
      }
      
      const success = await trackMultipleViews(userId, projectIds);
      
      if (success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to track multiple project views' },
          { status: 500 }
        );
      }
    }
    
    // Handle single project view
    if (!userId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or projectId' },
        { status: 400 }
      );
    }
    
    const success = await trackProjectView(userId, projectId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to track project view' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error tracking project view:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 