#!/usr/bin/env node

/**
 * Production Monitoring Script for Project Glocal
 * This script helps monitor the health of your deployed application
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Load environment variables
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

// Check if URL is accessible
function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      resolve({
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

// Check Supabase connection
async function checkSupabase(env) {
  log('🔍 Checking Supabase connection...', 'blue');
  
  const url = env.VITE_SUPABASE_URL;
  if (!url || url.includes('your_supabase') || url.includes('placeholder')) {
    log('❌ Supabase URL not configured', 'red');
    return false;
  }

  try {
    const result = await checkUrl(url);
    if (result.success) {
      log('✅ Supabase connection successful', 'green');
      return true;
    } else {
      log(`❌ Supabase connection failed: ${result.error || result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Supabase connection error: ${error.message}`, 'red');
    return false;
  }
}

// Check application deployment
async function checkApplication(env) {
  log('🔍 Checking application deployment...', 'blue');
  
  const appUrl = env.VITE_APP_URL || 'http://localhost:5173';
  
  try {
    const result = await checkUrl(appUrl);
    if (result.success) {
      log('✅ Application is accessible', 'green');
      
      // Check config status endpoint
      const configUrl = `${appUrl}/config-status`;
      const configResult = await checkUrl(configUrl);
      if (configResult.success) {
        log('✅ Configuration status endpoint accessible', 'green');
      } else {
        log('⚠️  Configuration status endpoint not accessible', 'yellow');
      }
      
      return true;
    } else {
      log(`❌ Application not accessible: ${result.error || result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Application check error: ${error.message}`, 'red');
    return false;
  }
}

// Check Stripe configuration
function checkStripe(env) {
  log('🔍 Checking Stripe configuration...', 'blue');
  
  const publishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY;
  const secretKey = env.STRIPE_SECRET_KEY;
  
  if (!publishableKey || publishableKey.includes('your_stripe')) {
    log('⚠️  Stripe not configured (payments will be disabled)', 'yellow');
    return false;
  }
  
  if (!secretKey || secretKey.includes('your_stripe')) {
    log('⚠️  Stripe secret key not configured', 'yellow');
    return false;
  }
  
  log('✅ Stripe configuration found', 'green');
  return true;
}

// Check News API configuration
function checkNewsAPI(env) {
  log('🔍 Checking News API configuration...', 'blue');
  
  const newsKey = env.NEWS_API_KEY;
  
  if (!newsKey || newsKey.includes('your_news')) {
    log('⚠️  News API not configured (news features will be limited)', 'yellow');
    return false;
  }
  
  log('✅ News API configuration found', 'green');
  return true;
}

// Check OpenAI configuration
function checkOpenAI(env) {
  log('🔍 Checking OpenAI configuration...', 'blue');
  
  const openaiKey = env.OPENAI_API_KEY;
  
  if (!openaiKey || openaiKey.includes('your_openai')) {
    log('⚠️  OpenAI not configured (AI features will be disabled)', 'yellow');
    return false;
  }
  
  log('✅ OpenAI configuration found', 'green');
  return true;
}

// Generate health report
function generateHealthReport(results) {
  log('\n📊 Health Report', 'bright');
  log('================', 'bright');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const failed = total - passed;
  
  log(`Total checks: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  log('\nDetailed Results:', 'cyan');
  Object.entries(results).forEach(([check, result]) => {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${status} ${check}`, color);
  });
  
  if (failed === 0) {
    log('\n🎉 All systems are healthy!', 'green');
  } else {
    log('\n⚠️  Some issues detected. Please review the failed checks.', 'yellow');
  }
}

// Main monitoring function
async function main() {
  log('🔍 Project Glocal Production Monitoring', 'bright');
  log('=======================================', 'bright');
  log('');
  
  try {
    // Load environment variables
    const env = loadEnv();
    
    // Run all checks
    const results = {
      'Supabase Connection': await checkSupabase(env),
      'Application Deployment': await checkApplication(env),
      'Stripe Configuration': checkStripe(env),
      'News API Configuration': checkNewsAPI(env),
      'OpenAI Configuration': checkOpenAI(env)
    };
    
    // Generate health report
    generateHealthReport(results);
    
    // Exit with appropriate code
    const allPassed = Object.values(results).every(Boolean);
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    log(`❌ Monitoring failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run monitoring
main().catch(console.error);
