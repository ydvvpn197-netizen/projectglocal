#!/usr/bin/env node

/**
 * GitHub Deployment Script
 * 
 * This script prepares and deploys the project to GitHub Pages
 * with all necessary configurations and validations.
 */

import fs from 'fs';
import { execSync } from 'child_process';
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

// Check if we're in a git repository
const checkGitRepository = () => {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Get current branch
const getCurrentBranch = () => {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
};

// Check if there are uncommitted changes
const checkUncommittedChanges = () => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
};

// Validate environment variables
const validateEnvironment = () => {
  log.info('Validating environment variables...');
  
  if (!fs.existsSync('.env')) {
    log.error('.env file not found!');
    return false;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      log.error(`Missing or invalid ${varName} in .env file`);
      return false;
    }
  }
  
  log.success('Environment variables validated');
  return true;
};

// Run tests
const runTests = () => {
  log.info('Running tests...');
  
  try {
    execSync('npm run test:run', { stdio: 'inherit' });
    log.success('All tests passed');
    return true;
  } catch (error) {
    log.error('Tests failed');
    return false;
  }
};

// Run linting
const runLinting = () => {
  log.info('Running linting...');
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    log.success('Linting passed');
    return true;
  } catch (error) {
    log.error('Linting failed');
    return false;
  }
};

// Build the project
const buildProject = () => {
  log.info('Building project...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log.success('Build completed successfully');
    return true;
  } catch (error) {
    log.error('Build failed');
    return false;
  }
};

// Check if dist directory exists and has content
const validateBuild = () => {
  if (!fs.existsSync('dist')) {
    log.error('dist directory not found');
    return false;
  }
  
  const distFiles = fs.readdirSync('dist');
  if (distFiles.length === 0) {
    log.error('dist directory is empty');
    return false;
  }
  
  if (!distFiles.includes('index.html')) {
    log.error('index.html not found in dist directory');
    return false;
  }
  
  log.success('Build validation passed');
  return true;
};

// Commit and push changes
const commitAndPush = (message) => {
  log.info('Committing and pushing changes...');
  
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    log.success('Changes committed and pushed successfully');
    return true;
  } catch (error) {
    log.error('Failed to commit and push changes');
    return false;
  }
};

// Main deployment function
const main = async () => {
  log.header('🚀 GitHub Deployment Script');
  
  // Check git repository
  if (!checkGitRepository()) {
    log.error('Not in a git repository');
    process.exit(1);
  }
  
  // Check current branch
  const currentBranch = getCurrentBranch();
  if (currentBranch !== 'main') {
    log.warning(`Current branch is '${currentBranch}', expected 'main'`);
    log.info('Switching to main branch...');
    try {
      execSync('git checkout main', { stdio: 'inherit' });
    } catch (error) {
      log.error('Failed to switch to main branch');
      process.exit(1);
    }
  }
  
  // Check for uncommitted changes
  if (checkUncommittedChanges()) {
    log.warning('You have uncommitted changes');
    log.info('Please commit your changes before deploying');
    process.exit(1);
  }
  
  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Run tests
  if (!runTests()) {
    process.exit(1);
  }
  
  // Run linting
  if (!runLinting()) {
    process.exit(1);
  }
  
  // Build project
  if (!buildProject()) {
    process.exit(1);
  }
  
  // Validate build
  if (!validateBuild()) {
    process.exit(1);
  }
  
  // Commit and push
  const commitMessage = `Deploy: ${new Date().toISOString()} - Production build with all features`;
  if (!commitAndPush(commitMessage)) {
    process.exit(1);
  }
  
  // Success message
  log.header('🎉 Deployment Complete!');
  log.success('Your project has been deployed to GitHub Pages');
  log.info('');
  log.info('Next steps:');
  log.info('1. Go to your repository: https://github.com/ydvvpn197-netizen/projectglocal');
  log.info('2. Check the Actions tab for deployment status');
  log.info('3. Once complete, your site will be available at:');
  log.info('   https://ydvvpn197-netizen.github.io/projectglocal/');
  log.info('');
  log.info('Make sure you have set up GitHub Secrets:');
  log.info('- VITE_SUPABASE_URL');
  log.info('- VITE_SUPABASE_ANON_KEY');
  log.info('');
  log.info('And enabled GitHub Pages with GitHub Actions as source');
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

// Run the deployment
main().catch((error) => {
  log.error(`Deployment failed: ${error.message}`);
  process.exit(1);
});
