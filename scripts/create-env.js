#!/usr/bin/env node

/**
 * Script to create .env file with Supabase credentials
 * Run this script to automatically create your .env file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://tepvzhbgobckybyhryuj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4

# Google Maps API (Optional - for location services)
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Configuration (Optional - for payments)
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
# VITE_STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# News API (Optional - for news feed)
# VITE_NEWS_API_KEY=your_news_api_key

# Social Media APIs (Optional - for sharing features)
# VITE_FACEBOOK_APP_ID=your_facebook_app_id
# VITE_TWITTER_API_KEY=your_twitter_api_key
# VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
# VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
# VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Application Configuration (Optional)
VITE_APP_VERSION=1.0.0
# VITE_API_BASE_URL=your_api_base_url
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000

# Cache Configuration (Optional)
VITE_CACHE_DEFAULT_TTL=300000
VITE_CACHE_MAX_SIZE=100
VITE_ENABLE_PERSISTENT_CACHE=false

# Security Configuration (Optional)
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_ENABLE_XSS_PROTECTION=true
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_SESSION_TIMEOUT=3600000

# Performance Configuration (Optional)
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_CODE_SPLITTING=true
VITE_ENABLE_SERVICE_WORKER=false
VITE_ENABLE_PRELOADING=true

# Monitoring Configuration (Optional)
VITE_ENABLE_LOGGING=true
VITE_ENABLE_METRICS=false
VITE_ENABLE_TRACING=false
VITE_LOG_LEVEL=info

# Feature Flags (Optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_PERFORMANCE_MONITORING=false
VITE_ENABLE_ERROR_TRACKING=true

# Copy this file to .env and fill in your actual values
# Never commit .env files to version control
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Do you want to overwrite it? (y/N)');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (data) => {
      const input = data.trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        createEnvFile();
      } else {
        console.log('❌ .env file creation cancelled.');
        process.exit(0);
      }
    });
  } else {
    createEnvFile();
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

function createEnvFile() {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📍 Location:', envPath);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Visit /config-status to verify configuration');
    console.log('3. Your Supabase connection should now work!');
    console.log('');
    console.log('⚠️  Remember: Never commit .env files to version control');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
}
