#!/usr/bin/env node

/**
 * Environment Setup Script for TheGlocal Project
 * 
 * This script helps set up the development environment by:
 * 1. Creating a .env file from env.example
 * 2. Validating required environment variables
 * 3. Testing Supabase connection
 * 4. Providing setup instructions
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 Setting up TheGlocal development environment...\n');

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('✅ Keeping existing .env file');
      rl.close();
      return;
    }
  }

  // Read env.example
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ env.example file not found!');
    rl.close();
    return;
  }

  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  let envContent = envExample;

  console.log('📝 Please provide the following environment variables:\n');

  // Required variables
  const requiredVars = [
    {
      key: 'VITE_SUPABASE_URL',
      description: 'Supabase Project URL (e.g., https://your-project.supabase.co)',
      example: 'https://your-project.supabase.co'
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      description: 'Supabase Anonymous Key (from Project Settings > API)',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  ];

  // Optional variables
  const optionalVars = [
    {
      key: 'VITE_STRIPE_PUBLISHABLE_KEY',
      description: 'Stripe Publishable Key (for payments)',
      example: 'pk_test_...'
    },
    {
      key: 'VITE_GOOGLE_MAPS_API_KEY',
      description: 'Google Maps API Key (for location services)',
      example: 'AIzaSy...'
    },
    {
      key: 'VITE_NEWS_API_KEY',
      description: 'News API Key (for news feed)',
      example: 'your-news-api-key'
    }
  ];

  // Collect required variables
  for (const variable of requiredVars) {
    const value = await question(`🔑 ${variable.key}: ${variable.description}\n   Example: ${variable.example}\n   Enter value: `);
    if (value.trim()) {
      envContent = envContent.replace(new RegExp(`${variable.key}=.*`), `${variable.key}=${value.trim()}`);
    } else {
      console.log(`⚠️  Skipping ${variable.key} - you can add it later`);
    }
    console.log('');
  }

  // Ask about optional variables
  const includeOptional = await question('🔧 Do you want to configure optional services now? (y/N): ');
  if (includeOptional.toLowerCase() === 'y') {
    for (const variable of optionalVars) {
      const value = await question(`🔧 ${variable.key}: ${variable.description}\n   Example: ${variable.example}\n   Enter value (or press Enter to skip): `);
      if (value.trim()) {
        envContent = envContent.replace(new RegExp(`${variable.key}=.*`), `${variable.key}=${value.trim()}`);
      }
      console.log('');
    }
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!\n');

  // Test Supabase connection
  console.log('🔍 Testing Supabase connection...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Extract values from .env content
    const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
    const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder') && !supabaseKey.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('⚠️  Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection successful!');
      }
    } else {
      console.log('⚠️  Supabase credentials not configured or using placeholders');
    }
  } catch (error) {
    console.log('⚠️  Could not test Supabase connection:', error.message);
  }

  console.log('\n🎉 Environment setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Run `npm install` to install dependencies');
  console.log('2. Run `npm run dev` to start the development server');
  console.log('3. Visit http://localhost:8080 to see your app');
  console.log('4. Check /config-status for configuration details');
  
  console.log('\n🔗 Useful links:');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard');
  console.log('- Stripe Dashboard: https://dashboard.stripe.com');
  console.log('- Google Cloud Console: https://console.cloud.google.com');

  rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});

// Run setup
setupEnvironment().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
