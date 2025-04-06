const { Redis } = require('@upstash/redis');
require('dotenv').config();

// The CORRECT Redis key used in the application
const CORRECT_KEY = 'vibe-directory:projects';

async function main() {
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    console.error('Redis configuration missing in environment variables');
    process.exit(1);
  }

  // Create Redis client
  let redis = null;
  try {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
    console.log("Redis client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    process.exit(1);
  }

  // Project data with prompt
  const projects = [
    {
      id: "1",
      title: 'Hot or Not NFTs on Base',
      description: 'Rate the NFTs of your favorite Farcasters like @0xdesigner @jessepollak @afrochicks @j4ck.eth and more, or of *any* wallet address',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://v0-hot-or-not-nft-app.vercel.app/',
      createdAt: '2025-04-02T00:00:00Z',
      featured: true,
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
      createdAt: '2025-04-01T00:00:00Z'
    },
    {
      id: "3",
      title: 'Blog entry for first-time Cursor usage',
      description: 'Today I learned how to use Cursor + MCPs. I made a simple blog entry showcasing the details of what I learned.',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://blog-bsxhf0jk6-chris-sykycoms-projects.vercel.app/',
      createdAt: '2025-03-31T00:00:00Z'
    },
    {
      id: "4",
      title: 'Quality builders on Icebreaker',
      description: 'A directory of everyone with the qBuilder attestation on Icebreaker.',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://v0-icebreaker-directory.vercel.app/',
      createdAt: '2025-03-30T00:00:00Z'
    },
    {
      id: "5",
      title: 'WHAT 2 WEAR',
      description: 'What should I wear today based on the weather in my current location?',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://77kuyhttwmmgi.mocha.app/',
      createdAt: '2025-03-29T00:00:00Z'
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
      image: 'https://img.freepik.com/free-vector/colorful-vector-vibes-peachy-background-sticker_53876-176240.jpg'
    },
    {
      id: "7",
      title: 'Mycaster v2',
      description: 'I connected the Neynar API so that the Recent Casts section is showing real data.',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://v0-myspace-profile-interface.vercel.app/',
      createdAt: '2025-03-27T00:00:00Z'
    },
    {
      id: "8",
      title: 'Mycaster',
      description: 'A MySpace-inspired Farcaster client proof of concept with HTML & CSS customization.',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://v0-myspace-profile-interface.vercel.app/',
      createdAt: '2025-03-26T00:00:00Z'
    },
    {
      id: "9",
      title: 'Daylight developer portal',
      description: 'A starting point for a developer documentation site with placeholder content to mimic what Daylight\'s portal might look like.',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://k2mdajewofezm.srcbook.app/docs/getting-started',
      createdAt: '2025-03-25T00:00:00Z'
    },
    {
      id: "10",
      title: 'Vibed Minesweeper',
      description: 'Microsoft first bundled Minesweeper with Windows in 1992. In this generative series, either 40, 60, or 80 mines are randomly placed on a 16x16 grid and the final solution is presented.',
      author: "chrislarsc.eth",
      authorFid: 192300,
      link: 'https://highlight.xyz/mint/base:0x8362558eF4730F4A1EE418EF9EeC1B039643657A',
      createdAt: '2025-03-24T00:00:00Z'
    }
  ];

  try {
    // First, list all Redis keys to see what's there
    const allKeys = await redis.keys('*');
    console.log('Found Redis keys:', allKeys);

    // Check if our correct key exists
    const existingData = await redis.get(CORRECT_KEY);
    console.log(`Key ${CORRECT_KEY} exists:`, !!existingData);
    
    // Directly set the correct Redis key with all project data
    console.log(`Setting ${CORRECT_KEY} with ${projects.length} projects...`);
    
    // Save to Redis (directly as objects)
    const success = await redis.set(CORRECT_KEY, projects);
    
    if (success === 'OK') {
      console.log('Successfully set projects data with prompt');
      
      // Verify the update
      const verifyData = await redis.get(CORRECT_KEY);
      const hasPrompt = verifyData?.[0]?.prompt ? true : false;
      console.log('First project has prompt:', hasPrompt);
    } else {
      console.error('Failed to update Redis');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error); 