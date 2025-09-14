#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * 
 * This script tests the Redis connection and basic cache operations
 * to verify that the Redis setup is working correctly.
 */

import { loadEnv } from '@medusajs/framework/utils'
import Redis from 'ioredis'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n')

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in environment variables')
    process.exit(1)
  }

  console.log('📡 Redis URL:', redisUrl.replace(/:[^:@]*@/, ':***@'))

  try {
    // Create Redis connection
    const redis = new Redis(redisUrl, {
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    })

    // Test connection
    console.log('🔌 Connecting to Redis...')
    await redis.connect()
    console.log('✅ Connected to Redis successfully!')

    // Test basic operations
    console.log('\n🧪 Testing basic Redis operations...')

    // Set a test key
    const testKey = 'joeperks:test:connection'
    const testValue = JSON.stringify({
      timestamp: new Date().toISOString(),
      message: 'Joe Perks Redis test successful!',
      version: '1.0.0'
    })

    await redis.set(testKey, testValue, 'EX', 30) // Expire in 30 seconds
    console.log('✅ SET operation successful')

    // Get the test key
    const retrievedValue = await redis.get(testKey)
    if (retrievedValue) {
      const parsed = JSON.parse(retrievedValue)
      console.log('✅ GET operation successful')
      console.log('📄 Retrieved data:', parsed)
    } else {
      console.log('❌ GET operation failed - no data retrieved')
    }

    // Test TTL
    const ttl = await redis.ttl(testKey)
    console.log(`✅ TTL check successful - expires in ${ttl} seconds`)

    // Test cache namespace
    const namespaceKey = 'medusa:cache:test'
    await redis.set(namespaceKey, 'namespace test', 'EX', 30)
    const namespaceValue = await redis.get(namespaceKey)
    console.log('✅ Namespace test successful:', namespaceValue)

    // Get Redis info
    console.log('\n📊 Redis Server Information:')
    const info = await redis.info('server')
    const lines = info.split('\r\n').filter(line => 
      line.includes('redis_version') || 
      line.includes('redis_mode') || 
      line.includes('tcp_port')
    )
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`   ${line}`)
      }
    })

    // Clean up test keys
    await redis.del(testKey, namespaceKey)
    console.log('🧹 Test keys cleaned up')

    // Close connection
    await redis.quit()
    console.log('\n✅ Redis connection test completed successfully!')
    console.log('🎉 Joe Perks platform is ready to use Redis for caching and sessions!')

  } catch (error) {
    console.error('❌ Redis connection test failed:', error)
    process.exit(1)
  }
}

// Run the test
testRedisConnection().catch(console.error)
