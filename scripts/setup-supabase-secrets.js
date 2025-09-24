#!/usr/bin/env node

/**
 * Supabase Secrets Setup Script
 * 
 * This script helps you set up Supabase environment variables for both
 * local development and GitHub Actions deployment.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Validate Supabase URL
const validateSupabaseUrl = (url) => {
  if (!url) return false;
  const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
  return urlPattern.test(url);
};

// Validate Supabase Anon Key
const validateSupabaseKey = (key) => {
  if (!key) return false;
  // JWT tokens start with 'eyJ' and are base64 encoded
  return key.startsWith('eyJ') && key.length > 100;
};

// Create .env file
const createEnvFile = (supabaseUrl, supabaseKey) => {
  const envContent = `# Supabase Configuration (Required)
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}

# Google Maps API (Optional - for location services)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Configuration (Required for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# News API (Optional - for news feed)
VITE_GNEWS_API_KEY=your_gnews_api_key
VITE_OPENAI_API_KEY=your_openai_api_key

# Social Media APIs (Optional - for sharing features)
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Application Configuration (Optional)
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=your_api_base_url
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
VITE_ENABLE_ERROR_TRACKING=false

# Copy this file to .env and fill in your actual values
# Never commit .env files to version control
`;

  try {
    fs.writeFileSync('.env', envContent);
    return true;
  } catch (error) {
    log.error(`Failed to create .env file: ${error.message}`);
    return false;
  }
};

// Check if .env file exists
const checkEnvFile = () => {
  return fs.existsSync('.env');
};

// Read existing .env file
const readEnvFile = () => {
  try {
    const content = fs.readFileSync('.env', 'utf8');
    const lines = content.split('\n');
    const envVars = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    return {};
  }
};

// Main setup function
const main = async () => {
  log.header('🔐 Supabase Secrets Setup');
  
  log.info('This script will help you set up Supabase environment variables for your project.');
  log.info('You can find your Supabase credentials at: https://supabase.com/dashboard');
  
  // Check if .env file already exists
  if (checkEnvFile()) {
    log.warning('.env file already exists!');
    const overwrite = await askQuestion('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      log.info('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Get Supabase URL
  log.info('\n📋 Enter your Supabase Project URL:');
  log.info('   Example: https://your-project-id.supabase.co');
  let supabaseUrl = await askQuestion('Supabase URL: ');
  
  while (!validateSupabaseUrl(supabaseUrl)) {
    log.error('Invalid Supabase URL format. Please try again.');
    log.info('   Format should be: https://your-project-id.supabase.co');
    supabaseUrl = await askQuestion('Supabase URL: ');
  }
  
  // Get Supabase Anon Key
  log.info('\n🔑 Enter your Supabase Anonymous Key:');
  log.info('   This is the "anon public" key from your Supabase dashboard');
  log.info('   It should start with "eyJ" and be a long JWT token');
  let supabaseKey = await askQuestion('Supabase Anon Key: ');
  
  while (!validateSupabaseKey(supabaseKey)) {
    log.error('Invalid Supabase Anon Key format. Please try again.');
    log.info('   The key should start with "eyJ" and be a long JWT token');
    supabaseKey = await askQuestion('Supabase Anon Key: ');
  }
  
  // Create .env file
  log.info('\n📝 Creating .env file...');
  if (createEnvFile(supabaseUrl, supabaseKey)) {
    log.success('.env file created successfully!');
  } else {
    log.error('Failed to create .env file.');
    rl.close();
    return;
  }
  
  // GitHub Secrets instructions
  log.header('🚀 GitHub Secrets Setup');
  log.info('To complete the setup for deployment, you need to add these secrets to your GitHub repository:');
  log.info('');
  log.info('1. Go to your GitHub repository');
  log.info('2. Click "Settings" tab');
  log.info('3. Click "Secrets and variables" → "Actions"');
  log.info('4. Click "New repository secret"');
  log.info('');
  log.info('Add these two secrets:');
  log.info('');
  log.info(`   Name: VITE_SUPABASE_URL`);
  log.info(`   Value: ${supabaseUrl}`);
  log.info('');
  log.info(`   Name: VITE_SUPABASE_ANON_KEY`);
  log.info(`   Value: ${supabaseKey.substring(0, 20)}...`);
  log.info('');
  
  // Test connection
  log.header('🧪 Testing Connection');
  log.info('You can test your Supabase connection by running:');
  log.info('');
  log.info('   npm run dev');
  log.info('');
  log.info('Look for "✅ Supabase client initialized successfully" in the console.');
  
  log.success('Setup completed successfully!');
  log.info('Your project is now configured to connect to Supabase.');
  
  rl.close();
};

// Handle errors
process.on('uncaughtException', (error) => {
  log.error(`Unexpected error: ${error.message}`);
  rl.close();
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log.error(`Unexpected error: ${error.message}`);
  rl.close();
  process.exit(1);
});

// Run the script
main().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});
