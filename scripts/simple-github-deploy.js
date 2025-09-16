#!/usr/bin/env node

/**
 * Simple GitHub Pages Deployment Script
 * This script deploys the project to GitHub Pages using gh-pages
 */

import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function main() {
  log('🚀 Simple GitHub Pages Deployment', 'bright');
  log('=================================', 'bright');
  log('');

  try {
    // Check if dist directory exists
    log('🔍 Checking for build directory...', 'blue');
    try {
      execSync('dir dist', { stdio: 'pipe' });
      log('✅ Build directory found', 'green');
    } catch (error) {
      log('❌ Build directory not found. Please run npm run build first', 'red');
      log('Run: npm run build', 'cyan');
      process.exit(1);
    }

    // Install gh-pages if not available
    log('📦 Checking gh-pages...', 'blue');
    try {
      execSync('npx gh-pages --version', { stdio: 'pipe' });
      log('✅ gh-pages is available', 'green');
    } catch (error) {
      log('📦 Installing gh-pages...', 'cyan');
      exec('npm install -g gh-pages');
    }

    // Deploy to GitHub Pages
    log('🚀 Deploying to GitHub Pages...', 'blue');
    exec('npx gh-pages -d dist --dotfiles');

    log('✅ Deployed to GitHub Pages successfully!', 'green');
    
    // Get repository info
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const repoName = remoteUrl.split('/').pop().replace('.git', '');
      const username = remoteUrl.split('/')[3];
      
      log('');
      log('🎉 Deployment Complete!', 'green');
      log('====================', 'green');
      log(`Your app is now live at: https://${username}.github.io/${repoName}`, 'cyan');
      log('');
      log('Next steps:', 'yellow');
      log('1. Visit your deployed app', 'cyan');
      log('2. Check /config-status for configuration', 'cyan');
      log('3. Test all user flows', 'cyan');
      log('4. Set up environment variables in GitHub Secrets', 'cyan');
      
    } catch (error) {
      log('✅ Deployed successfully, but could not determine URL', 'green');
    }

  } catch (error) {
    log('');
    log('❌ Deployment failed', 'red');
    log('Check the error messages above and try again', 'yellow');
    process.exit(1);
  }
}

// Run the deployment
main().catch(console.error);
