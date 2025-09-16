#!/usr/bin/env node

/**
 * Project Glocal Environment Setup Script
 * This script helps you set up the environment variables for your project
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
  console.log('🚀 Project Glocal Environment Setup');
  console.log('=====================================\n');

  // Check if .env already exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('📝 Let\'s set up your environment variables:\n');

  // Collect environment variables
  const envVars = {};

  // Supabase Configuration
  console.log('🔧 Supabase Configuration:');
  envVars.VITE_SUPABASE_URL = await question('Enter your Supabase URL: ');
  envVars.VITE_SUPABASE_ANON_KEY = await question('Enter your Supabase Anon Key: ');

  // Stripe Configuration
  console.log('\n💳 Stripe Configuration (optional but recommended):');
  const useStripe = await question('Do you want to set up Stripe payments? (y/N): ');
  if (useStripe.toLowerCase() === 'y' || useStripe.toLowerCase() === 'yes') {
    envVars.VITE_STRIPE_PUBLISHABLE_KEY = await question('Enter your Stripe Publishable Key: ');
    envVars.STRIPE_SECRET_KEY = await question('Enter your Stripe Secret Key: ');
    envVars.STRIPE_WEBHOOK_SECRET = await question('Enter your Stripe Webhook Secret: ');
  }

  // News API Configuration
  console.log('\n📰 News API Configuration (optional):');
  const useNews = await question('Do you want to set up news aggregation? (y/N): ');
  if (useNews.toLowerCase() === 'y' || useNews.toLowerCase() === 'yes') {
    envVars.NEWS_API_KEY = await question('Enter your News API Key: ');
  }

  // Google OAuth Configuration
  console.log('\n🔐 Google OAuth Configuration (optional):');
  const useGoogle = await question('Do you want to set up Google OAuth? (y/N): ');
  if (useGoogle.toLowerCase() === 'y' || useGoogle.toLowerCase() === 'yes') {
    envVars.GOOGLE_CLIENT_ID = await question('Enter your Google Client ID: ');
    envVars.GOOGLE_CLIENT_SECRET = await question('Enter your Google Client Secret: ');
  }

  // OpenAI Configuration
  console.log('\n🤖 OpenAI Configuration (optional):');
  const useOpenAI = await question('Do you want to set up AI features? (y/N): ');
  if (useOpenAI.toLowerCase() === 'y' || useOpenAI.toLowerCase() === 'yes') {
    envVars.OPENAI_API_KEY = await question('Enter your OpenAI API Key: ');
  }

  // App Configuration
  console.log('\n⚙️  App Configuration:');
  envVars.VITE_APP_NAME = await question('Enter your app name (default: Project Glocal): ') || 'Project Glocal';
  envVars.VITE_APP_URL = await question('Enter your app URL (default: http://localhost:5173): ') || 'http://localhost:5173';
  envVars.VITE_APP_ENVIRONMENT = await question('Enter environment (development/production): ') || 'development';

  // Create .env file
  const envContent = `# Project Glocal Environment Configuration
# Generated on ${new Date().toISOString()}

# Supabase Configuration
VITE_SUPABASE_URL=${envVars.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${envVars.VITE_SUPABASE_ANON_KEY}

# Stripe Configuration
${envVars.VITE_STRIPE_PUBLISHABLE_KEY ? `VITE_STRIPE_PUBLISHABLE_KEY=${envVars.VITE_STRIPE_PUBLISHABLE_KEY}` : '# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key'}
${envVars.STRIPE_SECRET_KEY ? `STRIPE_SECRET_KEY=${envVars.STRIPE_SECRET_KEY}` : '# STRIPE_SECRET_KEY=your_stripe_secret_key'}
${envVars.STRIPE_WEBHOOK_SECRET ? `STRIPE_WEBHOOK_SECRET=${envVars.STRIPE_WEBHOOK_SECRET}` : '# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret'}

# News API Configuration
${envVars.NEWS_API_KEY ? `NEWS_API_KEY=${envVars.NEWS_API_KEY}` : '# NEWS_API_KEY=your_news_api_key'}

# Google OAuth Configuration
${envVars.GOOGLE_CLIENT_ID ? `GOOGLE_CLIENT_ID=${envVars.GOOGLE_CLIENT_ID}` : '# GOOGLE_CLIENT_ID=your_google_client_id'}
${envVars.GOOGLE_CLIENT_SECRET ? `GOOGLE_CLIENT_SECRET=${envVars.GOOGLE_CLIENT_SECRET}` : '# GOOGLE_CLIENT_SECRET=your_google_client_secret'}

# OpenAI Configuration
${envVars.OPENAI_API_KEY ? `OPENAI_API_KEY=${envVars.OPENAI_API_KEY}` : '# OPENAI_API_KEY=your_openai_api_key'}

# App Configuration
VITE_APP_NAME=${envVars.VITE_APP_NAME}
VITE_APP_URL=${envVars.VITE_APP_URL}
VITE_APP_ENVIRONMENT=${envVars.VITE_APP_ENVIRONMENT}

# Optional Configuration
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# VITE_FACEBOOK_APP_ID=your_facebook_app_id
# VITE_TWITTER_API_KEY=your_twitter_api_key
# VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
# VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
# VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=${envVars.VITE_APP_ENVIRONMENT === 'development'}
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_ERROR_TRACKING=true

# API Configuration
VITE_API_BASE_URL=
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000

# Cache Configuration
VITE_CACHE_DEFAULT_TTL=300000
VITE_CACHE_MAX_SIZE=100
VITE_ENABLE_PERSISTENT_CACHE=true

# Security Configuration
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_ENABLE_XSS_PROTECTION=true
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_SESSION_TIMEOUT=3600000

# Performance Configuration
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_CODE_SPLITTING=true
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_PRELOADING=true

# Monitoring Configuration
VITE_ENABLE_LOGGING=true
VITE_ENABLE_METRICS=true
VITE_ENABLE_TRACING=true
VITE_LOG_LEVEL=info
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    
    // Create .env.local for local overrides
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envLocalPath)) {
      fs.writeFileSync(envLocalPath, '# Local environment overrides\n# This file is ignored by git\n');
      console.log(`📁 Created .env.local for local overrides: ${envLocalPath}`);
    }

    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Review your .env file');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:5173');
    console.log('4. Check configuration at: http://localhost:5173/config-status');

  } catch (error) {
    console.error('❌ Error creating environment file:', error.message);
  }

  rl.close();
}

// Run the setup
setupEnvironment().catch(console.error);