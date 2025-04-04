"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { Name, Identity } from "@coinbase/onchainkit/identity";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Check from "./svg/Check";
import ProjectList from "./components/ProjectList";
import WalletButton from "./components/WalletButton";
import AttestationTracker from "./components/AttestationTracker";
import { ADMIN_ADDRESSES } from "@/lib/constants";
import { getAllProjects } from "@/lib/projectService";
import type { Project } from "@/lib/projects";
import Link from "next/link";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const { address } = useAccount();

  // Load projects
  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

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
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame, setFrameAdded]);

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
          {address ? (
            <div className="flex items-center gap-2">
              <Identity
                address={address}
                className="!bg-inherit p-0 [&>div]:space-x-2"
              >
                <Name className="text-inherit" />
              </Identity>
              
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full"
                >
                  Admin
                </Link>
              )}
            </div>
          ) : (
            <div className="pl-2 pt-1 text-gray-500 text-sm font-semibold">
              NOT CONNECTED
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <WalletButton />
          <div className="pr-1 justify-end">{saveFrameButton}</div>
        </div>
      </header>

      <main className="px-4">
        {address && <AttestationTracker address={address} />}
        <ProjectList projects={projects} userAddress={address} />
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
