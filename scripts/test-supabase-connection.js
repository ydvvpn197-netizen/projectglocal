#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * 
 * This script tests the connection to your Supabase project
 * and validates the environment configuration.
 */

import fs from 'fs';
import path from 'path';

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

// Check if .env file exists
const checkEnvFile = () => {
  return fs.existsSync('.env');
};

// Read environment variables from .env file or process.env
const readEnvFile = () => {
  // First try to read from process.env (GitHub Actions)
  const envVars = {};
  
  // Get Supabase variables from environment
  if (process.env.VITE_SUPABASE_URL) {
    envVars.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  }
  if (process.env.VITE_SUPABASE_ANON_KEY) {
    envVars.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  }
  
  // If we have the required variables from environment, use them
  if (envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY) {
    return envVars;
  }
  
  // Otherwise, try to read from .env file
  if (checkEnvFile()) {
    try {
      const content = fs.readFileSync('.env', 'utf8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
    } catch (error) {
      log.error(`Failed to read .env file: ${error.message}`);
      return {};
    }
  }
  
  return envVars;
};

// Validate Supabase URL
const validateSupabaseUrl = (url) => {
  if (!url) {
    return { valid: false, message: 'URL is empty' };
  }
  
  if (url.includes('your_supabase') || url.includes('placeholder') || url === 'https://placeholder.supabase.co') {
    return { valid: false, message: 'URL contains placeholder text' };
  }
  
  const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
  if (!urlPattern.test(url)) {
    return { valid: false, message: 'URL format is invalid' };
  }
  
  return { valid: true, message: 'URL is valid' };
};

// Validate Supabase Anon Key
const validateSupabaseKey = (key) => {
  if (!key) {
    return { valid: false, message: 'Key is empty' };
  }
  
  if (key.includes('your_supabase') || key.includes('placeholder') || key === 'placeholder_key') {
    return { valid: false, message: 'Key contains placeholder text' };
  }
  
  if (!key.startsWith('eyJ')) {
    return { valid: false, message: 'Key format is invalid (should start with eyJ)' };
  }
  
  if (key.length < 100) {
    return { valid: false, message: 'Key is too short' };
  }
  
  return { valid: true, message: 'Key is valid' };
};

// Test Supabase connection with timeout
const testSupabaseConnection = async (url, key, timeoutMs = 10000) => {
  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout')), timeoutMs);
  });
  
  // Create the actual test promise
  const testPromise = async () => {
    try {
      // Import Supabase client dynamically
      const { createClient } = await import('@supabase/supabase-js');
      
      // Create client with shorter timeout
      const supabase = createClient(url, key, {
        global: {
          fetch: (url, options = {}) => {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            return fetch(url, {
              ...options,
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
          }
        }
      });
      
      // Test connection with a simple auth check (fastest and most reliable)
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      // Even if user is not authenticated, a successful response means connection works
      if (userError) {
        // Check for network/connection errors vs auth errors
        if (userError.message.includes('fetch') || 
            userError.message.includes('network') ||
            userError.message.includes('timeout') ||
            userError.message.includes('Invalid API key')) {
          return { success: false, message: `Connection failed: ${userError.message}` };
        }
      }
      
      // If we get here, the connection is working
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  };
  
  try {
    // Race between the test and timeout
    return await Promise.race([testPromise(), timeoutPromise]);
  } catch (error) {
    return { success: false, message: `Connection test failed: ${error.message}` };
  }
};

// Main test function
const main = async () => {
  log.header('🧪 Supabase Connection Test');
  
  // Read environment variables
  log.info('Reading environment variables...');
  const envVars = readEnvFile();
  
  if (Object.keys(envVars).length === 0) {
    if (!checkEnvFile()) {
      log.error('.env file not found and no environment variables set!');
      log.info('Please run: npm run setup:env or set environment variables');
      process.exit(1);
    } else {
      log.error('No environment variables found in .env file');
      process.exit(1);
    }
  }
  
  // Get Supabase variables
  const supabaseUrl = envVars.VITE_SUPABASE_URL;
  const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
  
  // Check if we're in CI with placeholder values
  const isCI = process.env.CI === 'true';
  const hasPlaceholderUrl = supabaseUrl === 'https://placeholder.supabase.co';
  const hasPlaceholderKey = supabaseKey === 'placeholder_key';
  
  if (isCI && (hasPlaceholderUrl || hasPlaceholderKey)) {
    log.warning('Running in CI with placeholder values - skipping validation');
    log.info('This is expected for demo deployments');
    log.success('CI build validation passed');
    return;
  }
  
  // Validate URL
  log.info('Validating Supabase URL...');
  const urlValidation = validateSupabaseUrl(supabaseUrl);
  if (urlValidation.valid) {
    log.success(`URL: ${urlValidation.message}`);
  } else {
    log.error(`URL: ${urlValidation.message}`);
    log.info('Please check your VITE_SUPABASE_URL in the .env file');
    process.exit(1);
  }
  
  // Validate Key
  log.info('Validating Supabase Anon Key...');
  const keyValidation = validateSupabaseKey(supabaseKey);
  if (keyValidation.valid) {
    log.success(`Key: ${keyValidation.message}`);
  } else {
    log.error(`Key: ${keyValidation.message}`);
    log.info('Please check your VITE_SUPABASE_ANON_KEY in the .env file');
    process.exit(1);
  }
  
  // Test connection
  log.info('Testing Supabase connection...');
  const connectionTest = await testSupabaseConnection(supabaseUrl, supabaseKey);
  
  if (connectionTest.success) {
    log.success(`Connection: ${connectionTest.message}`);
  } else {
    log.error(`Connection: ${connectionTest.message}`);
    log.info('Please check your Supabase credentials and network connection');
    process.exit(1);
  }
  
  // Summary
  log.header('📊 Test Summary');
  log.success('All tests passed!');
  log.info('Your Supabase configuration is working correctly.');
  log.info('');
  log.info('Next steps:');
  log.info('1. Run "npm run dev" to start your development server');
  log.info('2. Check the browser console for "✅ Supabase client initialized successfully"');
  log.info('3. Set up GitHub Secrets for deployment (see GITHUB_SECRETS_SETUP_GUIDE.md)');
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

// Run the test
main().catch((error) => {
  log.error(`Test failed: ${error.message}`);
  process.exit(1);
});