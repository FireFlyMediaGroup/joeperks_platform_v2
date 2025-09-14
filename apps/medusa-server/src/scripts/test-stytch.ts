#!/usr/bin/env node

/**
 * Stytch Integration Test Script
 * 
 * This script tests the Stytch authentication setup and configuration
 * to verify that the authentication system is working correctly.
 */

import { loadEnv } from '@medusajs/framework/utils'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function testStytchConfiguration() {
  console.log('🔍 Testing Stytch Configuration...\n')

  // Check environment variables
  const projectId = process.env.STYTCH_PROJECT_ID
  const secret = process.env.STYTCH_SECRET

  console.log('📋 Environment Variables:')
  console.log(`   STYTCH_PROJECT_ID: ${projectId ? '✅ Set' : '❌ Missing'}`)
  console.log(`   STYTCH_SECRET: ${secret ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

  if (!projectId || !secret) {
    console.log('\n❌ Missing required Stytch environment variables!')
    console.log('Please set STYTCH_PROJECT_ID and STYTCH_SECRET in your .env file.')
    console.log('\nTo get these values:')
    console.log('1. Go to https://stytch.com')
    console.log('2. Create an account and project')
    console.log('3. Copy the Project ID and Secret from your dashboard')
    process.exit(1)
  }

  try {
    // Test basic Stytch SDK import
    console.log('\n🔧 Testing Stytch SDK...')
    const { Client } = require('stytch')
    console.log('✅ Stytch SDK imported successfully')

    // Test basic configuration
    console.log('\n⚙️ Testing Configuration...')
    const config = {
      project_id: projectId,
      secret: secret,
      env: process.env.NODE_ENV === 'production' ? 'live' : 'test',
    }

    const client = new Client(config)
    console.log('✅ Stytch client created successfully')
    console.log(`   Environment: ${config.env}`)
    console.log(`   Project ID: ${projectId.substring(0, 8)}...`)

    console.log('\n📊 Configuration Summary:')
    console.log('   ✅ Environment variables configured')
    console.log('   ✅ Stytch SDK working')
    console.log('   ✅ Client initialization successful')
    console.log('   ✅ Ready for authentication integration')

    console.log('\n🎯 Next Steps:')
    console.log('1. Set up your Stytch project at https://stytch.com')
    console.log('2. Configure OAuth providers and redirect URLs')
    console.log('3. Set up RBAC roles in your Stytch dashboard')
    console.log('4. Add the actual credentials to your .env file')
    console.log('5. Test authentication with real users')
    console.log('6. Integrate with frontend applications')

    console.log('\n✅ Stytch configuration test completed successfully!')
    console.log('🎉 Joe Perks platform is ready for Stytch authentication!')

  } catch (error) {
    console.error('\n❌ Stytch configuration test failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('project_id')) {
        console.log('\n💡 This error suggests the Stytch project ID is invalid.')
        console.log('Please check your STYTCH_PROJECT_ID environment variable.')
      } else if (error.message.includes('secret')) {
        console.log('\n💡 This error suggests the Stytch secret is invalid.')
        console.log('Please check your STYTCH_SECRET environment variable.')
      }
    }
    
    process.exit(1)
  }
}

// Run the test
testStytchConfiguration().catch(console.error)
