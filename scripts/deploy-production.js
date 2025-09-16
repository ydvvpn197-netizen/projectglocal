#!/usr/bin/env node

/**
 * Production Deployment Script for Project Glocal
 * This script handles the complete deployment process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const exec = (command, options = {}) => {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    throw error;
  }
};

async function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');
  
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    log('❌ .env file not found. Please run setup first.', 'red');
    log('Run: npm run setup', 'yellow');
    process.exit(1);
  }

  // Check if build directory exists
  if (fs.existsSync('dist')) {
    log('⚠️  dist directory already exists. Cleaning...', 'yellow');
    exec('rm -rf dist');
  }

  log('✅ Prerequisites check passed', 'green');
}

async function buildApplication() {
  log('🔨 Building application...', 'blue');
  
  try {
    // Install dependencies
    log('📦 Installing dependencies...', 'cyan');
    exec('npm ci --production=false');

    // Type check
    log('🔍 Running type check...', 'cyan');
    exec('npm run type-check');

    // Lint check
    log('🔍 Running lint check...', 'cyan');
    exec('npm run lint');

    // Build application
    log('🏗️  Building for production...', 'cyan');
    exec('npm run build:prod');

    log('✅ Build completed successfully', 'green');
  } catch (error) {
    log('❌ Build failed. Please fix errors and try again.', 'red');
    process.exit(1);
  }
}

async function validateBuild() {
  log('🔍 Validating build...', 'blue');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    log('❌ Build directory not found', 'red');
    process.exit(1);
  }

  // Check for essential files
  const essentialFiles = [
    'index.html',
    'assets'
  ];

  for (const file of essentialFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      log(`❌ Essential file missing: ${file}`, 'red');
      process.exit(1);
    }
  }

  log('✅ Build validation passed', 'green');
}

async function deployToVercel() {
  log('🚀 Deploying to Vercel...', 'blue');
  
  try {
    // Check if Vercel CLI is installed
    exec('vercel --version');
    
    // Deploy to production
    exec('vercel --prod --yes');
    
    log('✅ Deployed to Vercel successfully', 'green');
  } catch (error) {
    log('❌ Vercel deployment failed', 'red');
    log('Make sure Vercel CLI is installed: npm install -g vercel', 'yellow');
    throw error;
  }
}

async function deployToNetlify() {
  log('🚀 Deploying to Netlify...', 'blue');
  
  try {
    // Check if Netlify CLI is installed
    exec('netlify --version');
    
    // Deploy to production
    exec('netlify deploy --prod --dir=dist');
    
    log('✅ Deployed to Netlify successfully', 'green');
  } catch (error) {
    log('❌ Netlify deployment failed', 'red');
    log('Make sure Netlify CLI is installed: npm install -g netlify-cli', 'yellow');
    throw error;
  }
}

async function deployToGitHubPages() {
  log('🚀 Deploying to GitHub Pages...', 'blue');
  
  try {
    // Build and deploy
    exec('npm run deploy:github');
    
    log('✅ Deployed to GitHub Pages successfully', 'green');
  } catch (error) {
    log('❌ GitHub Pages deployment failed', 'red');
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'vercel';

  log('🚀 Project Glocal Production Deployment', 'bright');
  log('=====================================', 'bright');
  log(`Platform: ${platform}`, 'cyan');
  log('');

  try {
    await checkPrerequisites();
    await buildApplication();
    await validateBuild();

    switch (platform) {
      case 'vercel':
        await deployToVercel();
        break;
      case 'netlify':
        await deployToNetlify();
        break;
      case 'github':
        await deployToGitHubPages();
        break;
      default:
        log(`❌ Unknown platform: ${platform}`, 'red');
        log('Supported platforms: vercel, netlify, github', 'yellow');
        process.exit(1);
    }

    log('');
    log('🎉 Deployment completed successfully!', 'green');
    log('');
    log('Next steps:', 'cyan');
    log('1. Verify your deployment is working', 'yellow');
    log('2. Check configuration at /config-status', 'yellow');
    log('3. Test all user flows', 'yellow');
    log('4. Set up monitoring and analytics', 'yellow');
    log('');

  } catch (error) {
    log('');
    log('❌ Deployment failed', 'red');
    log('Check the error messages above and try again', 'yellow');
    process.exit(1);
  }
}

// Run the deployment
main().catch(console.error);
