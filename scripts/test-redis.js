// Load environment variables
require('dotenv').config();

const { Redis } = require('@upstash/redis');

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  console.log(`REDIS_URL: ${maskSecret(process.env.REDIS_URL)}`);
  console.log(`REDIS_TOKEN: ${maskSecret(process.env.REDIS_TOKEN)}`);
  
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    console.error('❌ Missing Redis credentials in .env file');
    console.error('Please make sure you have REDIS_URL and REDIS_TOKEN set');
    return;
  }

  try {
    // Initialize Redis client
    console.log('Initializing Redis client...');
    const redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
    
    // Test connection with a simple set/get operation
    console.log('Attempting to set test key...');
    const testKey = `test-key-${Date.now()}`;
    const testValue = 'connection successful';
    
    await redis.set(testKey, testValue);
    console.log('✅ Successfully set test key');
    
    const value = await redis.get(testKey);
    console.log(`✅ Successfully retrieved test key: ${value}`);
    
    if (value === testValue) {
      console.log('✅ Redis is configured correctly and working!');
    } else {
      console.log(`⚠️ Retrieved value doesn't match: expected "${testValue}", got "${value}"`);
    }
    
    // Clean up
    await redis.del(testKey);
    console.log('✅ Test key deleted');
  } catch (error) {
    console.error('❌ Redis connection failed:');
    console.error(error);
    
    // Provide troubleshooting suggestions
    console.log('\nTroubleshooting suggestions:');
    console.log('1. Check that your REDIS_URL starts with "https://"');
    console.log('2. Verify your REDIS_TOKEN is correct');
    console.log('3. Make sure your IP is allowed in Upstash dashboard');
    console.log('4. Check your network connection');
  }
}

// Helper function to mask secrets for logging
function maskSecret(secret) {
  if (!secret) return 'undefined';
  if (secret.length < 8) return '******';
  
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
}

testRedisConnection(); 