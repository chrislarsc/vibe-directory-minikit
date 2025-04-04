# Vibe Coding Directory - Implementation Plan

## Overview

Transform the MiniKit-Test app from a Snake game into a curated directory of vibe coding projects with blockchain-based tracking of user engagement. The app will use OnchainKit and MiniKit capabilities to create attestations when users explore projects and send notifications when new projects are added.

## Core Features

1. **Project Directory**
   - Browsable list of coding projects with title, description, author, and external link
   - Filtering and sorting capabilities
   - Featured projects section

2. **Attestation System**
   - Create onchain attestations when users visit external projects
   - Track and display user engagement metrics
   - Leaderboard of most engaged users

3. **Wallet Integration**
   - Connect wallet to track user identity
   - Display user's attestation statistics
   - Badge system for engagement milestones

4. **Notification System**
   - Send notifications when new projects are added
   - Optional subscription to specific project categories
   - Weekly digest of popular projects

5. **Sharing Capabilities**
   - Global share option for the entire directory
   - Individual project sharing with attestation tracking
   - Social media integration

## Technical Implementation

### 1. Data Structure

Create a projects data structure in `lib/projects.ts`:

```typescript
export type Project = {
  id: string;                // Unique identifier for tracking attestations
  title: string;             // Required: Project title
  description: string;       // Required: Project description
  author: string;            // Required: Farcaster username
  authorFid: number;         // Required: Farcaster user ID (immutable unique identifier)
  authorAddress?: string;    // Optional: Author's wallet address (not used for uniqueness)
  link: string;              // Required: URL to the project
  categories?: string[];     // Optional: Categories (not implemented initially)
  createdAt: string;         // Required: Creation timestamp for chronological sorting
  featured?: boolean;        // Optional: Whether to display prominently
  image?: string;            // Optional: Image URL for featured projects
};

// Initially hardcoded, later could be stored in a database // note: this is not the correct data structure, but you can derive the data from this list. the author is chrislarsc.eth for all of these projects and their FID is 192300. 
export const projects: Project[] = [
  {
      title: 'Hot or Not NFTs on Base',
      description: 'Rate the NFTs of your favorite Farcasters like @0xdesigner @jessepollak @afrochicks @j4ck.eth and more, or of *any* wallet address',
      date: 'Apr 2, 2025',
      link: 'https://v0-hot-or-not-nft-app.vercel.app/'
    },
    {
      title: 'Buy the vibes',
      description: 'Experience pure positive energy that will brighten your day and enhance your mood. My first Stripe integration',
      date: 'Apr 1, 2025',
      link: 'https://buy-the-vibe.vercel.app/'
    },
    {
      title: 'Blog entry for first-time Cursor usage',
      description: 'Today I learned how to use Cursor + MCPs. I made a simple blog entry showcasing the details of what I learned.',
      date: 'Mar 31, 2025',
      link: 'https://blog-bsxhf0jk6-chris-sykycoms-projects.vercel.app/'
    },
    {
      title: 'Quality builders on Icebreaker',
      description: 'A directory of everyone with the qBuilder attestation on Icebreaker.',
      date: 'Mar 30, 2025',
      link: 'https://v0-icebreaker-directory.vercel.app/'
    },
    {
      title: 'WHAT 2 WEAR',
      description: 'What should I wear today based on the weather in my current location?',
      date: 'Mar 29, 2025',
      link: 'https://77kuyhttwmmgi.mocha.app/'
    },
    {
      title: 'Personal website v2',
      description: 'You\'re looking at it. My first time using Lovable.',
      date: 'Mar 28, 2025',
      link: ''
    },
    {
      title: 'Mycaster v2',
      description: 'I connected the Neynar API so that the Recent Casts section is showing real data.',
      date: 'Mar 27, 2025',
      link: 'https://v0-myspace-profile-interface.vercel.app/'
    },
    {
      title: 'Mycaster',
      description: 'A MySpace-inspired Farcaster client proof of concept with HTML & CSS customization.',
      date: 'Mar 26, 2025',
      link: 'https://v0-myspace-profile-interface.vercel.app/'
    },
    {
      title: 'Daylight developer portal',
      description: 'A starting point for a developer documentation site with placeholder content to mimic what Daylight\'s portal might look like.',
      date: 'Mar 25, 2025',
      link: 'https://k2mdajewofezm.srcbook.app/docs/getting-started'
    },
    {
      title: 'Vibed Minesweeper',
      description: 'Microsoft first bundled Minesweeper with Windows in 1992. In this generative series, either 40, 60, or 80 mines are randomly placed on a 16x16 grid and the final solution is presented.',
      date: 'Mar 24, 2025',
      link: 'https://highlight.xyz/mint/base:0x8362558eF4730F4A1EE418EF9EeC1B039643657A'
    },
    {
      title: 'Personal website',
      description: 'A low-design website where I can maintain a running list of all my vibe coding projects.',
      date: 'Mar 23, 2025',
      link: 'https://vab3lc5cwd3pm.mocha.app/'
    },
    {
      title: 'Rock, Paper, Scissors',
      description: 'Think you have what it takes to win? Step out onto the playground and try your best. Throw what you think will win. Don\'t cry if you lose.',
      date: 'Mar 22, 2025',
      link: 'https://j3yiceec25hfu.srcbook.app'
    },
    {
      title: 'Minesweeper',
      description: 'Master Minesweeper Online: Challenge yourself with dynamic difficulties and beat the clock on a classic puzzle game, now in your browser!',
      date: 'Mar 21, 2025',
      link: 'https://fjn22dcus2tuw.srcbook.app'
    },
    {
      title: 'Cost per use calculator',
      description: 'Is your purchase actually worth it? Vibed by @chrislarsc, inspired by @ted',
      date: 'Mar 20, 2025',
      link: 'https://vqgjaog45idym.srcbook.app'
    },
    {
      title: 'Vroom room!',
      description: 'Drive around, dodge obstacles, and collect all the coins as fast as you can. Share your best time!',
      date: 'Mar 19, 2025',
      link: 'https://ofp2lbyp6wdg6.srcbook.app'
    },
    {
      title: 'Hue-mazing!',
      description: 'Create stunning color palettes with Hue-mazing! Discover, preview, and copy hex codes for creative designs effortlessly.',
      date: 'Mar 18, 2025',
      link: 'https://wpzrghwgzwbze.srcbook.app'
    },
    {
      title: 'Coin flip game',
      description: 'Let\'s see how the law of big numbers holds by flipping this coin. All flips by all users are stored for a running total.',
      date: 'Mar 17, 2025',
      link: 'https://v0-coin-flip-game-beryl.vercel.app/'
    },
];
```

### 2. Attestation Schema

Define an attestation schema for tracking project views:

```typescript
// Constants defined in lib/constants.ts
export const VIEW_ATTESTATION_SCHEMA_UID = "0x..."; // Schema UID for project views
```

### 3. Components Structure

Replace Snake game components with directory components:

- `ProjectList.tsx`: Main directory component showing all projects
- `ProjectCard.tsx`: Individual project card with details
- `FeaturedProjectCard.tsx`: Special card for featured projects with image
- `ProjectFilters.tsx`: Filtering interface
- `AttestationTracker.tsx`: Shows user's attestation statistics
- `NotificationButton.tsx`: UI for notification management

### 4. Backend API Routes

#### a. Attestation Handling

Create API route in `app/api/attestations/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createAttestationForProjectView } from '@/lib/attestations';

export async function POST(request: Request) {
  const { userId, projectId } = await request.json();
  
  try {
    const result = await createAttestationForProjectView(userId, projectId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### b. Notification System

Create API route in `app/api/notification/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getUserNotificationDetails } from '@/lib/notification';

export async function POST(request: Request) {
  const { token, notificationData } = await request.json();
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Missing token' },
      { status: 400 }
    );
  }
  
  try {
    // Proxy the notification to appropriate service
    const response = await fetch('https://frame-notification-service.xyz/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NOTIFICATION_SERVICE_KEY}`
      },
      body: JSON.stringify({
        token,
        notification: notificationData
      })
    });
    
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 5. Utility Functions

Create the following utility files:

#### a. `lib/attestations.ts`
```typescript
import { encodeAbiParameters, type Address } from 'viem';
import { VIEW_ATTESTATION_SCHEMA_UID } from './constants';

export async function createAttestationForProjectView(userAddress: Address, projectId: string) {
  // Encode data for attestation
  const encodedData = encodeAbiParameters(
    [{ type: 'string' }],
    [`${userAddress} viewed project ${projectId}`]
  );
  
  // Implementation depends on the attestation service used
  // Return attestation details
}

export async function getUserAttestations(userAddress: Address) {
  // Query attestations by this user
  // Return array of attestation data
}

export async function getProjectAttestations(projectId: string) {
  // Query attestations for this project
  // Return count and attestation data
}
```

#### b. `lib/notification-client.ts` (Modify existing file)
Add project-specific notification functions:

```typescript
// Add to existing file
export async function sendNewProjectNotification(projectData) {
  const response = await fetch('/api/notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `New project added 🚀`,
      body: `Check out ${projectData.title} by ${projectData.author}`
    }),
  });
  
  return response.json();
}
```

### 6. UI Implementation

#### a. Main Page Transformation

Modify `app/page.tsx`:
```typescript
import { useMiniKit, useAddFrame, useOpenUrl, useNotification } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import ProjectList from "./components/ProjectList";
import AttestationTracker from "./components/AttestationTracker";
import { projects } from "@/lib/projects";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { address } = useAccount();
  const sendNotification = useNotification();
  
  // Existing frame handling logic...
  
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#E5E5E5] text-black items-center vibe-directory">
      <div className="w-screen max-w-[520px]">
        <header className="mr-2 mt-1 flex justify-between">
          {/* Header content with wallet connection */}
        </header>

        <main>
          {address && <AttestationTracker address={address} />}
          <ProjectList projects={projects} userAddress={address} />
        </main>

        <footer className="absolute bottom-4 flex items-center w-screen max-w-[520px] justify-center">
          {/* Footer content */}
        </footer>
      </div>
    </div>
  );
}
```

#### b. ProjectList Component

Create `app/components/ProjectList.tsx`:
```typescript
import { useState } from "react";
import type { Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import FeaturedProjectCard from "./FeaturedProjectCard";
import ProjectFilters from "./ProjectFilters";

export default function ProjectList({ projects, userAddress }) {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  
  // Separate featured and regular projects
  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);
  
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-4">Vibe Coding Projects</h1>
      <ProjectFilters 
        projects={projects} 
        setFilteredProjects={setFilteredProjects} 
      />
      
      {/* Featured projects section */}
      {featuredProjects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Featured Projects</h2>
          <div className="grid grid-cols-1 gap-4">
            {featuredProjects.map(project => (
              <FeaturedProjectCard
                key={project.id}
                project={project}
                userAddress={userAddress}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular projects list */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {regularProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            userAddress={userAddress} 
          />
        ))}
      </div>
    </div>
  );
}
```

#### c. ProjectCard Component

Create `app/components/ProjectCard.tsx`:
```typescript
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import type { Project } from "@/lib/projects";
import { createAttestationForProjectView } from "@/lib/attestations";

export default function ProjectCard({ project, userAddress }) {
  const openUrl = useOpenUrl();
  
  const handleProjectClick = async () => {
    if (userAddress) {
      try {
        // Create attestation first
        await createAttestationForProjectView(userAddress, project.id);
        // Then open URL
        openUrl(project.link);
      } catch (error) {
        console.error("Failed to create attestation:", error);
        // Open URL anyway if attestation fails
        openUrl(project.link);
      }
    } else {
      // Just open URL if wallet not connected
      openUrl(project.link);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold">{project.title}</h2>
      <p className="text-sm text-gray-600 mb-2">By {project.author}</p>
      <p className="mb-4">{project.description}</p>
      <button 
        onClick={handleProjectClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Check out project
      </button>
    </div>
  );
}
```

#### d. FeaturedProjectCard Component

Create `app/components/FeaturedProjectCard.tsx`:
```typescript
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import type { Project } from "@/lib/projects";
import { createAttestationForProjectView } from "@/lib/attestations";

export default function FeaturedProjectCard({ project, userAddress }) {
  const openUrl = useOpenUrl();
  
  const handleProjectClick = async () => {
    if (userAddress) {
      try {
        await createAttestationForProjectView(userAddress, project.id);
        openUrl(project.link);
      } catch (error) {
        console.error("Failed to create attestation:", error);
        openUrl(project.link);
      }
    } else {
      openUrl(project.link);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {project.image && (
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-auto rounded-lg object-cover"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        <div className={project.image ? "md:w-2/3" : "w-full"}>
          <h2 className="text-xl font-bold">{project.title}</h2>
          <p className="text-sm text-gray-600 mb-2">By {project.author}</p>
          <p className="mb-4">{project.description}</p>
          <button 
            onClick={handleProjectClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Check out project
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7. Admin Interface

Create an admin interface to add new projects and trigger notifications, with access control:

```typescript
// lib/constants.ts
export const ADMIN_ADDRESSES = [
  '0x1b9f436efe00db47fabec43394ed397baa68c28d',
  '0x6e6996997ba6da60dd3320b010c122577cd5fe28',
  '0xc7a4249b7bfcb70cc9eb3d2cec2be8b306f59dd1',
  '0x13f670991d138758c9fb8aecc9852d0bfe2dfaed'
];

// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { projects, type Project } from "@/lib/projects";
import { ADMIN_ADDRESSES } from "@/lib/constants";

export default function AdminPage() {
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [isAuthorized, setIsAuthorized] = useState(false);
  const sendNotification = useNotification();
  const { address } = useAccount();
  const router = useRouter();
  
  useEffect(() => {
    // Check if connected wallet is in admin list
    if (address) {
      const isAdmin = ADMIN_ADDRESSES.some(
        admin => admin.toLowerCase() === address.toLowerCase()
      );
      setIsAuthorized(isAdmin);
      
      // Redirect if not authorized
      if (!isAdmin) {
        router.push('/');
      }
    } else {
      setIsAuthorized(false);
      router.push('/');
    }
  }, [address, router]);
  
  const handleAddProject = async () => {
    // Add project to list
    // In a real app, would save to database
    
    // Send notification
    sendNotification({
      title: 'New project added 🚀',
      body: `Check out ${newProject.title} by ${newProject.author}`
    });
  };
  
  if (!isAuthorized) {
    return null; // Loading or redirecting
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <form className="space-y-4">
        <div>
          <label className="block mb-1">Title (required)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={newProject.title || ''}
            onChange={e => setNewProject({...newProject, title: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description (required)</label>
          <textarea 
            className="w-full p-2 border rounded"
            value={newProject.description || ''}
            onChange={e => setNewProject({...newProject, description: e.target.value})}
            required
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-1">Author Farcaster Username (required)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={newProject.author || ''}
            onChange={e => setNewProject({...newProject, author: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Author FID (required)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded"
            value={newProject.authorFid || ''}
            onChange={e => setNewProject({...newProject, authorFid: Number(e.target.value)})}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Author Wallet Address (optional)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={newProject.authorAddress || ''}
            onChange={e => setNewProject({...newProject, authorAddress: e.target.value})}
          />
        </div>
        <div>
          <label className="block mb-1">Project URL (required)</label>
          <input 
            type="url" 
            className="w-full p-2 border rounded"
            value={newProject.link || ''}
            onChange={e => setNewProject({...newProject, link: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Image URL (optional)</label>
          <input 
            type="url" 
            className="w-full p-2 border rounded"
            value={newProject.image || ''}
            onChange={e => setNewProject({...newProject, image: e.target.value})}
          />
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="featured"
            checked={newProject.featured || false}
            onChange={e => setNewProject({...newProject, featured: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="featured">Featured Project</label>
        </div>
        <button 
          type="button"
          onClick={handleAddProject}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Add Project & Send Notification
        </button>
      </form>
    </div>
  );
}
```

## Implementation Stages

### Stage 1: Basic Project Directory
**Goal:** Create a functional project listing without blockchain features
**Testable outcome:** Browse and view a list of vibe coding projects

1. Set up project data structure in `lib/projects.ts` with sample data
2. Implement `ProjectList` and `ProjectCard` components
3. Create basic page layout with header and footer
4. Add navigation to external project links (without attestations)

### Stage 2: Wallet Integration & Admin Panel
**Goal:** Enable wallet connection and admin functionality
**Testable outcome:** Connect wallet and access admin panel with authorized addresses

1. Implement wallet connection UI
2. Create admin panel with access control
3. Build project creation form in admin section
4. Set up local state management for adding projects

### Stage 3: Attestation System
**Goal:** Track project views with blockchain attestations
**Testable outcome:** Create and verify attestations when clicking project links

1. Set up attestation schema
2. Implement attestation utility functions
3. Create API endpoint for attestation handling
4. Update `ProjectCard` to create attestations on click
5. Develop `AttestationTracker` to display user statistics

### Stage 4: Notification System
**Goal:** Send notifications for new projects
**Testable outcome:** Receive notifications when new projects are added

1. Configure Redis for notification storage
2. Set up notification API endpoint
3. Update admin panel to trigger notifications
4. Implement notification permission UI
5. Test end-to-end notification flow

### Stage 5: Enhanced UI and Features
**Goal:** Improve user experience and add advanced features
**Testable outcome:** Use fully-featured application with improved UI

1. Add featured projects section with image support
2. Implement sorting and filtering
3. Create global share functionality
4. Add user engagement badges
5. Optimize for mobile devices

## Technical Requirements

1. **Environment Variables**
   - `REDIS_URL` and `REDIS_TOKEN`: For Redis connection
   - `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME`: Project identifier
   - `VIEW_ATTESTATION_SCHEMA_UID`: Schema UID for attestations
   - `NOTIFICATION_SERVICE_KEY`: API key for notification service

2. **Dependencies**
   - All existing dependencies, with emphasis on:
     - `@coinbase/onchainkit`
     - `wagmi` and `viem`
     - `@upstash/redis`

## Notification System Backend Setup

1. **Configure Redis for Notifications**
   - Ensure Redis instance is set up to store user notification preferences
   - Use existing Redis configuration in `lib/redis.ts`

2. **Set Up Notification API Endpoint**
   - Create `/api/notification/route.ts` to handle notification requests
   - Implement CORS handling for external requests
   - Add authentication to prevent unauthorized notifications

3. **Notification Service Registration**
   - Register with Frame notification service (if required)
   - Store service credentials in environment variables

4. **Testing Workflow**
   1. User connects wallet and adds frame
   2. System stores user's notification token in Redis
   3. When new project is added, notification is sent through API endpoint
   4. API forwards notification to Frame service
   5. User receives notification

## Data Security Considerations

1. **Wallet Address Protection**
   - Consider obfuscating wallet addresses in attestations
   - Implement privacy-focused attestation schema

2. **User Consent**
   - Add explicit consent for attestation creation
   - Allow users to opt out of attestations while still viewing projects

3. **Rate Limiting**
   - Implement rate limiting on attestation creation
   - Prevent spam or gaming of the system

## Future Enhancements

1. **Social Features**
   - Project recommendations based on user interests
   - Social sharing with attestation tracking
   - User comments on projects

2. **Advanced Analytics**
   - Dashboard of most viewed projects
   - User engagement metrics
   - Project creator analytics

3. **Gamification**
   - Badge system for exploring different project categories
   - Challenges to explore specific sets of projects
   - Token rewards for active participation 