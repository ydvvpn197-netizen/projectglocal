#!/usr/bin/env node

/**
 * Git Deployment Script for Project Glocal
 * Handles deployment to GitHub Pages with comprehensive error handling
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BUILD_DIR: 'dist',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  REPO_URL: process.env.GITHUB_REPOSITORY || 'ydvvpn197-netizen/projectglocal',
  BRANCH: 'gh-pages',
  COMMIT_MESSAGE: `Deploy: ${new Date().toISOString()}`,
  TIMEOUT: 300000 // 5 minutes
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Utility functions
function runCommand(command, options = {}) {
  const defaultOptions = {
    stdio: 'inherit',
    timeout: CONFIG.TIMEOUT,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0'
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    execSync(command, finalOptions);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function validateEnvironment() {
  logStep('ENV', 'Validating deployment environment');
  
  // Check if build directory exists
  if (!checkFileExists(CONFIG.BUILD_DIR)) {
    logError(`Build directory '${CONFIG.BUILD_DIR}' not found`);
    return false;
  }
  
  // Check if index.html exists
  const indexPath = path.join(CONFIG.BUILD_DIR, 'index.html');
  if (!checkFileExists(indexPath)) {
    logError(`index.html not found in ${CONFIG.BUILD_DIR}`);
    return false;
  }
  
  // Check Git configuration
  const gitConfig = runCommand('git config --list', { stdio: 'pipe' });
  if (!gitConfig.success) {
    logError('Git not configured properly');
    return false;
  }
  
  // Check if we're in a Git repository
  const gitStatus = runCommand('git status --porcelain', { stdio: 'pipe' });
  if (!gitStatus.success) {
    logError('Not in a Git repository');
    return false;
  }
  
  logSuccess('Environment validation passed');
  return true;
}

function setupGitConfig() {
  logStep('GIT', 'Setting up Git configuration');
  
  // Configure Git user (required for commits)
  const userConfig = [
    'git config user.name "GitHub Actions"',
    'git config user.email "actions@github.com"'
  ];
  
  userConfig.forEach(command => {
    const result = runCommand(command);
    if (!result.success) {
      logWarning(`Failed to run: ${command}`);
    }
  });
  
  // Set up remote if not exists
  const remoteCheck = runCommand('git remote get-url origin', { stdio: 'pipe' });
  if (!remoteCheck.success) {
    logInfo('Adding origin remote');
    const addRemote = runCommand(`git remote add origin https://github.com/${CONFIG.REPO_URL}.git`);
    if (!addRemote.success) {
      logError('Failed to add origin remote');
      return false;
    }
  }
  
  logSuccess('Git configuration completed');
  return true;
}

function prepareBuild() {
  logStep('BUILD', 'Preparing build for deployment');
  
  // Create a .nojekyll file for GitHub Pages
  const nojekyllPath = path.join(CONFIG.BUILD_DIR, '.nojekyll');
  if (!checkFileExists(nojekyllPath)) {
    fs.writeFileSync(nojekyllPath, '');
    logInfo('Created .nojekyll file');
  }
  
  // Create a CNAME file if custom domain is configured
  const customDomain = process.env.CUSTOM_DOMAIN || 'theglocal.in';
  if (customDomain && customDomain !== 'theglocal.in') {
    const cnamePath = path.join(CONFIG.BUILD_DIR, 'CNAME');
    fs.writeFileSync(cnamePath, customDomain);
    logInfo(`Created CNAME file for ${customDomain}`);
  }
  
  // Add build timestamp
  const buildInfoPath = path.join(CONFIG.BUILD_DIR, 'build-info.json');
  const buildInfo = {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF_NAME || 'main',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'local'
  };
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  
  logSuccess('Build preparation completed');
  return true;
}

function deployToGitHubPages() {
  logStep('DEPLOY', 'Deploying to GitHub Pages');
  
  // Method 1: Using gh-pages package (recommended)
  if (checkFileExists('node_modules/gh-pages')) {
    logInfo('Using gh-pages package for deployment');
    
    const ghPagesCommand = `npx gh-pages -d ${CONFIG.BUILD_DIR} -m "${CONFIG.COMMIT_MESSAGE}"`;
    const result = runCommand(ghPagesCommand);
    
    if (!result.success) {
      logError('gh-pages deployment failed');
      return false;
    }
    
    logSuccess('Deployed using gh-pages package');
    return true;
  }
  
  // Method 2: Manual Git deployment
  logInfo('Using manual Git deployment');
  
  // Initialize gh-pages branch if it doesn't exist
  const branchCheck = runCommand(`git ls-remote --heads origin ${CONFIG.BRANCH}`, { stdio: 'pipe' });
  if (!branchCheck.success) {
    logInfo(`Creating ${CONFIG.BRANCH} branch`);
    
    // Create orphan branch
    runCommand(`git checkout --orphan ${CONFIG.BRANCH}`);
    runCommand('git rm -rf .');
    runCommand(`cp -r ${CONFIG.BUILD_DIR}/* .`);
    runCommand('git add .');
    runCommand(`git commit -m "Initial ${CONFIG.BRANCH} commit"`);
    runCommand(`git push -u origin ${CONFIG.BRANCH}`);
  } else {
    logInfo(`Updating ${CONFIG.BRANCH} branch`);
    
    // Switch to gh-pages branch
    runCommand(`git checkout ${CONFIG.BRANCH}`);
    
    // Remove all files except .git
    runCommand('git rm -rf .');
    runCommand('git clean -fd');
    
    // Copy build files
    runCommand(`cp -r ${CONFIG.BUILD_DIR}/* .`);
    
    // Add and commit
    runCommand('git add .');
    runCommand(`git commit -m "${CONFIG.COMMIT_MESSAGE}"`);
    runCommand(`git push origin ${CONFIG.BRANCH}`);
  }
  
  // Switch back to main branch
  runCommand('git checkout main');
  
  logSuccess('Manual Git deployment completed');
  return true;
}

async function verifyDeployment() {
  logStep('VERIFY', 'Verifying deployment');
  
  const siteUrl = 'https://theglocal.in/';
  
  // Wait a moment for deployment to propagate
  logInfo('Waiting for deployment to propagate...');
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
  
  // Check if site is accessible
  const curlCommand = `curl -s -o /dev/null -w "%{http_code}" "${siteUrl}"`;
  const result = runCommand(curlCommand, { stdio: 'pipe' });
  
  if (result.success) {
    const httpStatus = result.output?.toString().trim();
    if (httpStatus === '200') {
      logSuccess(`Site is accessible at ${siteUrl}`);
      return true;
    } else {
      logWarning(`Site returned HTTP ${httpStatus}`);
    }
  }
  
  logWarning('Could not verify deployment (DNS propagation may take time)');
  return true; // Don't fail deployment for verification issues
}

function generateDeploymentReport() {
  logStep('REPORT', 'Generating deployment report');
  
  const report = {
    timestamp: new Date().toISOString(),
    siteUrl: 'https://theglocal.in/',
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF_NAME || 'main',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
    deploymentMethod: 'GitHub Pages',
    buildSize: 0
  };
  
  // Calculate build size
  function calculateSize(dir) {
    let totalSize = 0;
    if (!fs.existsSync(dir)) return 0;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += calculateSize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }
  
  report.buildSize = calculateSize(CONFIG.BUILD_DIR);
  
  // Save deployment report
  const reportPath = 'deployment-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logInfo(`Deployment report saved to: ${reportPath}`);
  
  return true;
}

// Main deployment function
async function main() {
  log(`\n${colors.bright}${colors.cyan}🚀 Project Glocal Git Deployment${colors.reset}\n`);
  
  const startTime = Date.now();
  
  try {
    // Step 1: Validate environment
    if (!validateEnvironment()) {
      process.exit(1);
    }
    
    // Step 2: Setup Git configuration
    if (!setupGitConfig()) {
      process.exit(1);
    }
    
    // Step 3: Prepare build
    if (!prepareBuild()) {
      process.exit(1);
    }
    
    // Step 4: Deploy to GitHub Pages
    if (!deployToGitHubPages()) {
      process.exit(1);
    }
    
    // Step 5: Verify deployment
    await verifyDeployment();
    
    // Step 6: Generate deployment report
    generateDeploymentReport();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n${colors.bright}${colors.green}🎉 Deployment completed successfully!${colors.reset}`);
    log(`⏱️  Deployment time: ${duration}s`);
    log(`🌐 Site URL: https://theglocal.in/`);
    log(`📁 Build directory: ${CONFIG.BUILD_DIR}`);
    log(`🔗 Repository: https://github.com/${CONFIG.REPO_URL}\n`);
    
  } catch (error) {
    logError(`Deployment failed with error: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, CONFIG };
