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

// Initially hardcoded, later could be stored in a database
export const projects: Project[] = [
  {
    id: "1",
    title: 'Hot or Not NFTs on Base',
    description: 'Rate the NFTs of your favorite Farcasters like @0xdesigner @jessepollak @afrochicks @j4ck.eth and more, or of *any* wallet address',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://v0-hot-or-not-nft-app.vercel.app/',
    createdAt: '2025-04-02T00:00:00Z',
    featured: true,
    displayed: true,
    image: 'https://v0-hot-or-not-nft-app.vercel.app/images/vibe-group.png',
    prompt: `create a simple web app called "hot or not nft" where you enter an ethereum wallet address, and it then displays one nft at a time from the wallet and the user can mark each nft as hot or not. there's then a view to see all the hot nfts in a gallery; from there, you can click on each nft to see a larger detail of it. store the selections in local storage. 

the app should use the alchemy api with the following details:
• Network URL: <COPY PASTE FROM ALCHEMY DASHBOARD>
• Request: <COPY PASTE FROM ALCHEMY DASHBOARD>
• example response attached <ATTACHED FILE OF WHAT RESPONSE LOOKS LIKE>

the app should use the ensdata api to display the wallet's ENS instead of the wallet address for results. to do so: 
• use this endpoint: api.ensdata.net/{wallet_address}
• example response: <INSERT RESPONSE HERE>

do not over engineer. focus on the simplest possible path to successful implementation.`
  },
  {
    id: "2",
    title: 'Buy the vibes',
    description: 'Experience pure positive energy that will brighten your day and enhance your mood. My first Stripe integration',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://buy-the-vibe.vercel.app/',
    createdAt: '2025-04-01T00:00:00Z',
    displayed: true
  },
  {
    id: "3",
    title: 'Blog entry for first-time Cursor usage',
    description: 'Today I learned how to use Cursor + MCPs. I made a simple blog entry showcasing the details of what I learned.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://blog-bsxhf0jk6-chris-sykycoms-projects.vercel.app/',
    createdAt: '2025-03-31T00:00:00Z',
    displayed: true
  },
  {
    id: "4",
    title: 'Quality builders on Icebreaker',
    description: 'A directory of everyone with the qBuilder attestation on Icebreaker.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://v0-icebreaker-directory.vercel.app/',
    createdAt: '2025-03-30T00:00:00Z',
    displayed: true
  },
  {
    id: "5",
    title: 'WHAT 2 WEAR',
    description: 'What should I wear today based on the weather in my current location?',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://77kuyhttwmmgi.mocha.app/',
    createdAt: '2025-03-29T00:00:00Z',
    displayed: true
  },
  {
    id: "6",
    title: 'Personal website v2',
    description: 'First time using Lovable, this is a project directory of my vibe code projects that I am trying to keep up to date.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://vibe-fusion-sandbox.lovable.app/',
    createdAt: '2025-03-28T00:00:00Z',
    featured: false,
    displayed: true,
    image: 'https://img.freepik.com/free-vector/colorful-vector-vibes-peachy-background-sticker_53876-176240.jpg'
  },
  {
    id: "7",
    title: 'Mycaster v2',
    description: 'I connected the Neynar API so that the Recent Casts section is showing real data.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://v0-myspace-profile-interface.vercel.app/',
    createdAt: '2025-03-27T00:00:00Z',
    displayed: true
  },
  {
    id: "8",
    title: 'Mycaster',
    description: 'A MySpace-inspired Farcaster client proof of concept with HTML & CSS customization.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://v0-myspace-profile-interface.vercel.app/',
    createdAt: '2025-03-26T00:00:00Z',
    displayed: true
  },
  {
    id: "9",
    title: 'Daylight developer portal',
    description: 'A starting point for a developer documentation site with placeholder content to mimic what Daylight\'s portal might look like.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://k2mdajewofezm.srcbook.app/docs/getting-started',
    createdAt: '2025-03-25T00:00:00Z',
    displayed: true
  },
  {
    id: "10",
    title: 'Vibed Minesweeper',
    description: 'Microsoft first bundled Minesweeper with Windows in 1992. In this generative series, either 40, 60, or 80 mines are randomly placed on a 16x16 grid and the final solution is presented.',
    author: "chrislarsc.eth",
    authorFid: 192300,
    link: 'https://highlight.xyz/mint/base:0x8362558eF4730F4A1EE418EF9EeC1B039643657A',
    createdAt: '2025-03-24T00:00:00Z',
    displayed: true
  }
]; 