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
  displayed?: boolean;       // Optional: Whether to display at all (requires admin approval)
  image?: string;            // Optional: Image URL for featured projects
  prompt?: string;           // Optional: Project prompt
};

// Empty array to start with - projects will be stored in Redis
export const projects: Project[] = []; 