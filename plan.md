# MiniKit-Test Documentation

## Overview

MiniKit-Test is a modern web application built on Next.js that demonstrates a Snake game integrated with blockchain functionality using Coinbase's OnchainKit and MiniKit. The project showcases the ability to create interactive web applications with web3 features, including wallet connections, high scores stored on the blockchain, and notifications.

## Architecture

### Tech Stack

- **Frontend Framework**: Next.js (App Router)
- **Styling**: TailwindCSS
- **Blockchain Integration**: 
  - `@coinbase/onchainkit` for Frame and MiniKit capabilities
  - `wagmi` and `viem` for wallet connections and blockchain interactions
- **State Management**: React hooks and Context API
- **Backend Services**: Upstash Redis for notification storage
- **Deployment Platform**: Vercel

### Directory Structure

```
minikit-test/
├── app/                  # Next.js app directory (App Router)
│   ├── components/       # React components
│   ├── svg/              # SVG assets
│   ├── .well-known/      # Well-known directory for protocols
│   ├── api/              # API routes
│   ├── globals.css       # Global CSS
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main application page
│   ├── providers.tsx     # React context providers
│   └── theme.css         # Theme-specific styling
├── lib/                  # Utility functions and services
│   ├── redis.ts          # Redis client setup
│   ├── notification.ts   # Notification handling
│   └── notification-client.ts # Client-side notification utilities
├── public/               # Static assets
├── scripts/              # Utility scripts
├── .env                  # Environment variables (not committed)
└── .env.example          # Example environment variables
```

## Core Features

### 1. Snake Game

The application features a classic Snake game with modern enhancements:

- Multiple difficulty levels with different maze configurations
- Score tracking and high score leaderboard
- Konami code easter egg for slow-motion gameplay
- Responsive controls for both keyboard and touch devices

### 2. Blockchain Integration

- **Wallet Connection**: Users can connect their crypto wallets via Coinbase's OnchainKit
- **On-Chain High Scores**: High scores are stored as attestations on the blockchain
- **Identity Display**: Connected users can see their wallet identity with Name and Avatar components

### 3. MiniKit Integration

- **Frame Support**: The app can be saved as a Frame within the MiniKit ecosystem
- **Notifications**: Users can receive notifications about game events
- **Transaction Support**: The app can initiate and track blockchain transactions

### 4. Data Persistence

- **Redis Storage**: User preferences and notification settings are stored in Redis
- **Blockchain Storage**: High scores are permanently stored on the Base blockchain via attestations

## How It Works

### Game Mechanics

The Snake game is built using a canvas-based implementation with several game states:
- INTRO: Initial game screen
- RUNNING: Active gameplay
- PAUSED: Game paused
- DEAD: Game over state
- WON: Level completed
- AWAITINGNEXTLEVEL: Transition between levels

Players control a snake that grows when it collects targets. The game becomes more difficult with each level, introducing additional maze walls that the player must navigate.

### Blockchain Interaction

1. **High Score Recording**: When a player achieves a high score, it's recorded as an attestation on the Base blockchain
2. **Score Retrieval**: The app queries the blockchain using GraphQL to fetch and display the latest high scores
3. **Identity Verification**: Players with high scores receive a special badge displayed next to their name

### Frame Integration

The app uses Coinbase's OnchainKit to implement Frame capabilities:
1. Users can save the app as a Frame using the "SAVE FRAME" button
2. The app can be easily shared and accessed within Frame-compatible environments
3. Real-time notifications can be sent to users about high score changes

## Customization and Extension

### Environment Variables

Key environment variables (see `.env.example`):
- `REDIS_URL` and `REDIS_TOKEN`: For Redis connection
- `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME`: Project identifier
- Blockchain network configuration parameters

### Potential Modifications

1. **New Game Modes**:
   - Time-limited challenge modes
   - Multiplayer capabilities using WebSockets
   - Additional power-ups or special obstacles

2. **Enhanced Blockchain Integration**:
   - NFT rewards for high scorers
   - Token-gated special levels
   - Integration with other EVM-compatible chains

3. **Social Features**:
   - Friend challenges
   - Tournament functionality
   - Social sharing with screenshots

4. **Educational Components**:
   - Tutorial on blockchain interactions
   - Visualization of transactions
   - Interactive blockchain explorer integration

## Development and Deployment

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update with your credentials
4. Run the development server: `npm run dev`
5. Access the application at http://localhost:3000

### Deployment

The application is configured for easy deployment on Vercel:
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy the application

## Conclusion

MiniKit-Test demonstrates the powerful combination of modern web development with blockchain technology. It serves as an excellent starting point for developers looking to build interactive applications with web3 capabilities, particularly those wanting to leverage Coinbase's OnchainKit and MiniKit frameworks to create engaging user experiences that bridge traditional web applications with blockchain functionality.
