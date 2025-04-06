# Vibe Directory - MiniKit Application

A directory of vibe coding projects with notifications when new projects are added, built with MiniKit.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## Environment Setup

Copy `.env.example` to `.env.local` and update with your credentials:

```bash
cp .env.example .env.local
```

You'll need:
1. **Redis credentials** from Upstash for storing notification tokens
2. **MiniKit configuration** values including your app URL
3. **Frame Manifest values** for enabling notifications (see below)

## Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setting Up Notifications

Notifications require proper setup of the Frame Manifest. Follow these steps:

### 1. Deploy Your App

Deploy your app to Vercel or another hosting service to get a live URL.

### 2. Generate Frame Manifest

Run the following command and connect your Farcaster custody wallet:

```bash
npx create-onchain@alpha --generate
```

When prompted, enter your deployed app URL. The tool will:
1. Open a browser window for you to connect your wallet
2. Generate the manifest values
3. Update your local `.env.local` file

### 3. Update Vercel Environment Variables

Add these values from your `.env.local` to your Vercel project settings:
- `FARCASTER_HEADER`
- `FARCASTER_PAYLOAD` 
- `FARCASTER_SIGNATURE`
- `REDIS_URL`
- `REDIS_TOKEN`
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME`

### 4. Testing Notifications

1. Open your app in Warpcast developer tools
2. Click "Save Frame" to add the mini app to your account
3. Send a test notification using the "Test Notification" button
4. Add a new project from the Admin panel to broadcast to all users

## Features

- Browse vibe coding projects with title, description, and links
- Save the frame to receive notifications
- Admin panel for managing projects and sending notifications
- MiniKit integration with Base
- Onchain attestations for project views

## Learn More

To learn more about MiniKit, see the [Base documentation](https://docs.base.org/builderkits/minikit/quickstart).

To learn more about Next.js, see the [Next.js documentation](https://nextjs.org/docs).

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Redis connection details (required)
REDIS_URL=your-redis-url

# Neynar API key for Farcaster integration (required)
NEYNAR_API_KEY=your-neynar-api-key
```

## Farcaster Integration

The app integrates with Farcaster to:

1. Fetch usernames and FIDs of connected wallets
2. Display Farcaster usernames on project submissions
3. Store Farcaster FID with project data for future integration

## API Endpoints

- `GET /api/projects` - Get all projects (with optional admin filtering)
- `POST /api/projects` - Submit a new project
- `GET /api/projects/[id]` - Get a specific project
- `PATCH /api/projects/[id]` - Update a project (admin only)
- `DELETE /api/projects/[id]` - Delete a project (admin only)
- `GET /api/farcaster/user` - Get Farcaster user details for a wallet address
