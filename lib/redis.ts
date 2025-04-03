import { Redis } from '@upstash/redis'

// Check if Redis credentials are provided
if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
  console.warn(
    "Redis configuration missing: REDIS_URL or REDIS_TOKEN is not defined. " +
    "Notifications and webhooks functionality will be disabled."
  )
}

// Initialize Redis client with environment variables and type handling
let redis: Redis | null = null

// Only create Redis client if environment variables are present
try {
  if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    })
    console.log("Redis client initialized successfully")
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
  redis = null
}

export default redis
