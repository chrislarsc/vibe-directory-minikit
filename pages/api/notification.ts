import type { NextApiRequest, NextApiResponse } from 'next'
import redis from '../../lib/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  
  try {
    // Check if Redis is configured
    if (!redis) {
      console.error('Redis client not initialized')
      return res.status(500).json({ 
        error: 'Redis not configured', 
        message: 'Please set REDIS_URL and REDIS_TOKEN in your environment'
      })
    }
    
    // Extract notification data from request body
    const { title, body, url, token } = req.body
    
    if (!title || !body || !url || !token) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Missing required fields (title, body, url, token)'
      })
    }
    
    // Store notification in Redis
    // Key format: notification:{token}:{timestamp}
    const key = `notification:${token}:${Date.now()}`
    await redis.set(key, JSON.stringify({ title, body, url, token }))
    
    // For demo purposes, store a counter of notifications
    await redis.incr('notification_count')
    const count = await redis.get('notification_count')
    
    console.log(`Notification stored with key: ${key}`)
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Notification stored successfully',
      count
    })
  } catch (error) {
    console.error('Error processing notification:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 