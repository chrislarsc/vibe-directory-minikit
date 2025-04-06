"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import type { Address } from 'viem';
import { Identity } from "@coinbase/onchainkit/identity";
import { getFarcasterUserByFid } from "@/lib/neynarApi";

interface ProjectSubmitFormProps {
  userAddress: Address;
  userFid?: number;
  userName?: string;
  onSuccess?: () => void;
}

export default function ProjectSubmitForm({ 
  userAddress, 
  userFid, 
  userName, 
  onSuccess 
}: ProjectSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [farcasterProfile, setFarcasterProfile] = useState<{ username: string; displayName: string; pfpUrl: string } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch Farcaster profile when FID is provided
  useEffect(() => {
    async function fetchFarcasterProfile() {
      if (!userFid) return;
      
      setIsLoadingProfile(true);
      console.log(`===== FORM DEBUG: Fetching Farcaster profile for FID: ${userFid} =====`);
      
      try {
        const profileData = await getFarcasterUserByFid(userFid);
        if (profileData?.success) {
          setFarcasterProfile({
            username: profileData.username,
            displayName: profileData.displayName,
            pfpUrl: profileData.pfpUrl
          });
          console.log('===== FORM DEBUG: Farcaster profile loaded:', profileData, '=====');
          console.log(`===== FORM DEBUG: Will use "${profileData.displayName}" (${profileData.username}) as author =====`);
        }
      } catch (err) {
        console.error('===== FORM DEBUG: Error fetching Farcaster profile:', err, '=====');
      } finally {
        setIsLoadingProfile(false);
      }
    }
    
    fetchFarcasterProfile();
  }, [userFid]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const link = formData.get('link') as string;
    const prompt = formData.get('prompt') as string || undefined;
    const image = formData.get('image') as string || undefined;
    
    // Validate form input
    if (!title || !description || !link || !userAddress) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Determine the best author name to use (string)
      const authorName = farcasterProfile?.displayName || 
                         farcasterProfile?.username || 
                         userName || 
                         String(userAddress);
      
      // For debugging, log the project data before submission
      console.log('===== SUBMIT DEBUG: Form data being submitted:', {
        title, description, link, prompt, image,
        author: authorName,
        authorFid: userFid || 0,
        authorAddress: userAddress,
      }, '=====');
      
      console.log(`===== SUBMIT DEBUG: USING AUTHOR: "${authorName}" =====`);
      console.log(`===== SUBMIT DEBUG: USING FARCASTER FID: ${userFid || 0} =====`);
      
      // Prepare the project data
      const projectData = {
        title,
        description,
        link,
        prompt,
        image,
        author: authorName,
        authorFid: userFid || 0,
        authorAddress: userAddress,
        displayed: false, // Projects require admin approval
        createdAt: new Date().toISOString(),
      };
      
      // Submit to API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: projectData,
          authorAddress: userAddress,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`===== SUBMIT DEBUG: Server error (${response.status}): ${errorText} =====`);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit project');
      }
      
      console.log(`===== SUBMIT DEBUG: Project successfully submitted with author "${projectData.author}" =====`);
      
      // Show success state
      setSuccess(true);
      
      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('===== SUBMIT DEBUG: Project submission error:', err, '=====');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Submitting as: {farcasterProfile ? (
            <span className="font-medium text-blue-600">{farcasterProfile.displayName} (@{farcasterProfile.username})</span>
          ) : userName ? (
            <span className="font-medium text-blue-600">{userName}</span>
          ) : (
            <Identity address={userAddress} className="inline-flex">
              <span className="font-medium">{userAddress}</span>
            </Identity>
          )}
          {userFid ? (
            isLoadingProfile ? (
              <span className="ml-1 text-xs text-blue-500">(Loading Farcaster profile...)</span>
            ) : null
          ) : null}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your submission will be reviewed before being displayed publicly.
        </p>
      </div>
      
      {success ? (
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-green-700">
            Your project has been submitted successfully! It will be reviewed by an admin before being displayed.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
          >
            Submit Another Project
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's your project called?"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Briefly describe what your project does"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="link" className="block text-gray-700 font-medium mb-1">
              Project URL <span className="text-red-500">*</span>
            </label>
            <input
              id="link"
              name="link"
              type="url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-project-url.com"
            />
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-gray-700 font-medium mb-1">
              Initial Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your initial prompt to help others learn how to vibe code, too"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="image" className="block text-gray-700 font-medium mb-1">
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-image-url.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              A representative image for your project (featured projects will display this image)
            </p>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 