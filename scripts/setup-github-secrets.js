#!/usr/bin/env node

/**
 * GitHub Secrets Setup Script
 * 
 * This script helps you set up the required GitHub secrets
 * for successful deployment.
 */

import fs from 'fs';

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

// Read environment variables from .env file
const readEnvFile = () => {
  try {
    if (!fs.existsSync('.env')) {
      log.error('.env file not found!');
      return {};
    }
    
    const content = fs.readFileSync('.env', 'utf8');
    const lines = content.split('\n');
    const envVars = {};
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    log.error(`Failed to read .env file: ${error.message}`);
    return {};
  }
};

// Main function
const main = () => {
  log.header('🔐 GitHub Secrets Setup Guide');
  
  log.info('Reading your local environment variables...');
  const envVars = readEnvFile();
  
  if (Object.keys(envVars).length === 0) {
    log.error('No environment variables found in .env file');
    process.exit(1);
  }
  
  log.success('Environment variables loaded successfully');
  
  // Required secrets
  const requiredSecrets = [
    {
      name: 'VITE_SUPABASE_URL',
      value: envVars.VITE_SUPABASE_URL,
      description: 'Supabase project URL'
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      value: envVars.VITE_SUPABASE_ANON_KEY,
      description: 'Supabase anonymous key'
    }
  ];
  
  // Optional secrets
  const optionalSecrets = [
    {
      name: 'VITE_GOOGLE_MAPS_API_KEY',
      value: envVars.VITE_GOOGLE_MAPS_API_KEY,
      description: 'Google Maps API key for location services'
    },
    {
      name: 'VITE_NEWS_API_KEY',
      value: envVars.VITE_NEWS_API_KEY,
      description: 'News API key for news feed'
    },
    {
      name: 'VITE_OPENAI_API_KEY',
      value: envVars.VITE_OPENAI_API_KEY,
      description: 'OpenAI API key for AI features'
    },
    {
      name: 'VITE_STRIPE_PUBLISHABLE_KEY',
      value: envVars.VITE_STRIPE_PUBLISHABLE_KEY,
      description: 'Stripe publishable key for payments'
    }
  ];
  
  log.header('📋 Required GitHub Secrets');
  log.warning('You MUST add these secrets to your GitHub repository:');
  log.info('');
  
  requiredSecrets.forEach((secret, index) => {
    if (secret.value && !secret.value.includes('your_') && !secret.value.includes('placeholder')) {
      log.success(`${index + 1}. ${secret.name}`);
      log.info(`   Description: ${secret.description}`);
      log.info(`   Value: ${secret.value.substring(0, 50)}...`);
      log.info('');
    } else {
      log.error(`${index + 1}. ${secret.name} - MISSING OR INVALID`);
      log.info(`   Description: ${secret.description}`);
      log.info(`   Status: Not configured in .env file`);
      log.info('');
    }
  });
  
  log.header('🔧 How to Add GitHub Secrets');
  log.info('Follow these steps to add the secrets:');
  log.info('');
  log.info('1. Go to your GitHub repository:');
  log.info('   https://github.com/ydvvpn197-netizen/projectglocal');
  log.info('');
  log.info('2. Click on "Settings" tab');
  log.info('');
  log.info('3. In the left sidebar, click "Secrets and variables" → "Actions"');
  log.info('');
  log.info('4. Click "New repository secret"');
  log.info('');
  log.info('5. For each secret above:');
  log.info('   - Name: Enter the secret name (e.g., VITE_SUPABASE_URL)');
  log.info('   - Secret: Enter the secret value');
  log.info('   - Click "Add secret"');
  log.info('');
  
  log.header('📋 Optional GitHub Secrets');
  log.info('These secrets are optional but recommended for full functionality:');
  log.info('');
  
  optionalSecrets.forEach((secret, index) => {
    if (secret.value && !secret.value.includes('your_') && !secret.value.includes('placeholder')) {
      log.success(`${index + 1}. ${secret.name}`);
      log.info(`   Description: ${secret.description}`);
      log.info(`   Value: ${secret.value.substring(0, 30)}...`);
      log.info('');
    } else {
      log.info(`${index + 1}. ${secret.name} - Not configured`);
      log.info(`   Description: ${secret.description}`);
      log.info(`   Status: Optional - can be added later`);
      log.info('');
    }
  });
  
  log.header('⚙️ Enable GitHub Pages');
  log.info('After adding secrets, enable GitHub Pages:');
  log.info('');
  log.info('1. Go to "Settings" → "Pages"');
  log.info('2. Under "Source", select "GitHub Actions"');
  log.info('3. Save the settings');
  log.info('');
  
  log.header('🚀 Deploy Your Project');
  log.info('Once secrets are added and Pages is enabled:');
  log.info('');
  log.info('1. Go to "Actions" tab in your repository');
  log.info('2. Click "Re-run all jobs" on the failed workflow');
  log.info('3. Or push a new commit to trigger deployment');
  log.info('');
  
  log.header('✅ Verification');
  log.info('After deployment completes:');
  log.info('');
  log.info('Your site will be available at:');
  log.info('https://ydvvpn197-netizen.github.io/projectglocal/');
  log.info('');
  
  log.success('Setup complete! Follow the steps above to configure your repository.');
};

// Handle errors
process.on('uncaughtException', (error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

// Run the setup
main();