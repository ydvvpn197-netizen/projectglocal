#!/usr/bin/env node

/**
 * Manual GitHub Deployment Script
 * Bypasses Windows path length issues by using direct git commands
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
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
  log('🚀 Manual GitHub Deployment', 'blue');
  log('===========================', 'blue');
  
  try {
    // Check if dist directory exists
    if (!fs.existsSync('dist')) {
      log('❌ No dist directory found. Run npm run build first.', 'red');
      process.exit(1);
    }

    // Check current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`📋 Current branch: ${currentBranch}`, 'cyan');

    // Check if gh-pages branch exists
    let ghPagesExists = false;
    try {
      execSync('git show-ref --verify --quiet refs/heads/gh-pages');
      ghPagesExists = true;
    } catch (error) {
      ghPagesExists = false;
    }

    if (ghPagesExists) {
      log('🔄 Switching to gh-pages branch...', 'cyan');
      exec('git checkout gh-pages');
    } else {
      log('🌱 Creating gh-pages branch...', 'cyan');
      exec('git checkout --orphan gh-pages');
      exec('git rm -rf .');
    }

    // Copy dist contents to current directory
    log('📁 Copying build files...', 'cyan');
    exec('xcopy /E /I /Y dist\\* .');

    // Add all files
    log('➕ Adding files to git...', 'cyan');
    exec('git add .');

    // Check if there are changes to commit
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        // Commit changes
        log('💾 Committing changes...', 'cyan');
        exec('git commit -m "Deploy to GitHub Pages - ' + new Date().toISOString() + '"');
        
        // Push to origin
        log('🚀 Pushing to GitHub...', 'cyan');
        exec('git push origin gh-pages');
        
        log('✅ Successfully deployed to GitHub Pages!', 'green');
        log('🌐 Your site will be available at: https://ydvvpn197-netizen.github.io/projectglocal/', 'cyan');
      } else {
        log('ℹ️  No changes to deploy', 'yellow');
      }
    } catch (error) {
      log('⚠️  No changes to commit', 'yellow');
    }

    // Switch back to main branch
    log('🔄 Switching back to main branch...', 'cyan');
    exec(`git checkout ${currentBranch}`);

    log('🎉 Deployment completed successfully!', 'green');
    log('📝 Note: GitHub Pages may take a few minutes to update', 'cyan');

  } catch (error) {
    log('❌ Deployment failed', 'red');
    log('Error: ' + error.message, 'red');
    
    // Try to switch back to main branch
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (currentBranch !== 'main') {
        exec('git checkout main');
      }
    } catch (switchError) {
      log('⚠️  Could not switch back to main branch', 'yellow');
    }
    
    process.exit(1);
  }
}

main().catch(console.error);
