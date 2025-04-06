"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
  useNotification
} from "@coinbase/onchainkit/minikit";
import { Name, Identity } from "@coinbase/onchainkit/identity";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Check from "./svg/Check";
import ProjectList from "./components/ProjectList";
import WalletButton from "./components/WalletButton";
import ViewTracker from "./components/ViewTracker";
import { ViewProvider } from "./components/ViewContext";
import { ADMIN_ADDRESSES } from "@/lib/constants";
import type { Project } from "@/lib/projects";
import Link from "next/link";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const sendNotification = useNotification();
  const { address } = useAccount();

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Add a timestamp to bust the cache
        const timestamp = new Date().getTime();
        // If user is admin, include all projects (including non-displayed ones)
        const showAll = isAdmin ? 'true' : 'false';
        
        const response = await fetch(`/api/projects?t=${timestamp}&showAll=${showAll}&adminAddress=${address || ''}`, {
          cache: 'no-store', // Force fresh fetch every time
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
        } else {
          console.error('Failed to fetch projects:', data.error);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [address, isAdmin]);

  // Handler for when projects are updated by admin actions
  const handleProjectsChanged = () => {
    // Refetch projects
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const timestamp = new Date().getTime();
        const showAll = isAdmin ? 'true' : 'false';
        
        const response = await fetch(`/api/projects?t=${timestamp}&showAll=${showAll}&adminAddress=${address || ''}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
        } else {
          console.error('Failed to refresh projects:', data.error);
        }
      } catch (error) {
        console.error('Error refreshing projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  };

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Check if connected address is admin
  useEffect(() => {
    if (address) {
      const isUserAdmin = ADMIN_ADDRESSES.some(
        admin => admin.toLowerCase() === address.toLowerCase()
      );
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [address]);

  const handleAddFrame = useCallback(async () => {
    try {
      const result = await addFrame();
      
      if (result) {
        setFrameAdded(true);
        
        // Store the token in our backend for future notifications
        if (address) {
          await fetch('/api/store-notification-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: address,
              token: result.token,
              url: result.url
            }),
          });
          
          // Send a welcome notification
          await sendNotification({
            title: 'Welcome to Vibe Directory! 👋',
            body: 'You will now receive notifications when new vibe projects are added.'
          });
        }
      }
    } catch (error) {
      console.error('Failed to add frame:', error);
    }
  }, [addFrame, address, sendNotification]);

  // Auto-trigger "Add Frame" when user first opens the app
  useEffect(() => {
    // Only attempt to auto-add frame if:
    // 1. In a frame context
    // 2. Frame is not already added
    // 3. User hasn't already clicked the add button in this session
    if (context && !context.client.added && !frameAdded) {
      // Small delay to ensure UI is fully loaded
      const timer = setTimeout(() => {
        handleAddFrame();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [context, context?.client.added, frameAdded, handleAddFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          type="button"
          onClick={handleAddFrame}
          className="cursor-pointer bg-transparent font-semibold text-sm"
        >
          + SAVE FRAME
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-semibold animate-fade-out">
          <Check />
          <span>SAVED</span>
        </div>
      );
    }

    return null;
  }, [context, handleAddFrame, frameAdded]);

  return (
    <div className="w-full max-w-[520px] mx-auto pb-8">
      <header className="mr-2 mt-1 flex justify-between items-center py-2">
        <div className="justify-start pl-1">
          {address && (
            <Link
              href="/submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              + Submit Project
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <WalletButton />
          <div className="pr-1 justify-end flex items-center gap-2">
            {saveFrameButton}
          </div>
        </div>
      </header>

      <main className="px-4">
        <ViewProvider userAddress={address}>
          {address && <ViewTracker />}
          <ProjectList 
            projects={projects} 
            userAddress={address}
            onProjectsChanged={handleProjectsChanged}
            isLoading={isLoading}
          />
        </ViewProvider>
      </main>

      <footer className="flex items-center w-full justify-center mt-8">
        <button
          type="button"
          className="px-2 py-1 flex justify-start rounded-2xl font-semibold opacity-40 border border-black text-xs"
          onClick={() => openUrl("https://base.org/builders/minikit")}
        >
          BUILT ON BASE WITH MINIKIT
        </button>
      </footer>
    </div>
  );
}
