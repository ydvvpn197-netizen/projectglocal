#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Robust GitHub Pages Deployment');
console.log('==================================');

const DEPLOY_CONFIG = {
  tempDir: 'deploy-temp',
  maxRetries: 3,
  retryDelay: 2000,
  buildTimeout: 60000,
  deployTimeout: 120000
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const execWithTimeout = (command, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const child = execSync(command, { 
      stdio: 'inherit',
      timeout,
      shell: true,
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: path.join(__dirname, '../.gitconfig-deploy')
      }
    });
    resolve(child);
  });
};

const cleanup = () => {
  console.log('🧹 Cleaning up temporary files...');
  
  // Remove temp directory
  if (fs.existsSync(DEPLOY_CONFIG.tempDir)) {
    try {
      fs.rmSync(DEPLOY_CONFIG.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('⚠️  Could not remove temp directory:', error.message);
    }
  }
  
  // Remove git config
  const gitConfigPath = path.join(__dirname, '../.gitconfig-deploy');
  if (fs.existsSync(gitConfigPath)) {
    try {
      fs.unlinkSync(gitConfigPath);
    } catch (error) {
      console.warn('⚠️  Could not remove git config:', error.message);
    }
  }
};

const setupGitConfig = () => {
  console.log('⚙️  Setting up deployment git config...');
  
  const gitConfig = `
[core]
  longpaths = true
  precomposeunicode = true
  autocrlf = false
  filemode = false
  quotepath = false
  
[user]
  name = "GitHub Actions Deploy"
  email = "actions@github.com"
  
[push]
  default = simple
  
[init]
  defaultBranch = main
`;

  fs.writeFileSync(path.join(__dirname, '../.gitconfig-deploy'), gitConfig);
};

const buildProject = async () => {
  console.log('🔨 Building project...');
  
  try {
    await execWithTimeout('npm run build', DEPLOY_CONFIG.buildTimeout);
    console.log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
};

const prepareDeployment = async () => {
  console.log('📦 Preparing deployment files...');
  
  try {
    // Clean up any existing temp directory
    if (fs.existsSync(DEPLOY_CONFIG.tempDir)) {
      fs.rmSync(DEPLOY_CONFIG.tempDir, { recursive: true, force: true });
    }
    
    // Create temp directory
    fs.mkdirSync(DEPLOY_CONFIG.tempDir);
    
    // Copy dist contents with proper error handling
    console.log('📋 Copying build files...');
    
    // Use Node.js fs for cross-platform compatibility
    const copyDir = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyDir('dist', DEPLOY_CONFIG.tempDir);
    
    console.log('✅ Files prepared successfully');
    return true;
  } catch (error) {
    console.error('❌ File preparation failed:', error.message);
    return false;
  }
};

const deployToGitHub = async () => {
  console.log('🚀 Deploying to GitHub Pages...');
  
  for (let attempt = 1; attempt <= DEPLOY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`📤 Deployment attempt ${attempt}/${DEPLOY_CONFIG.maxRetries}`);
      
      await execWithTimeout(
        `npx gh-pages -d ${DEPLOY_CONFIG.tempDir} --dotfiles --silent`,
        DEPLOY_CONFIG.deployTimeout
      );
      
      console.log('✅ Deployment successful!');
      return true;
      
    } catch (error) {
      console.error(`❌ Deployment attempt ${attempt} failed:`, error.message);
      
      if (attempt < DEPLOY_CONFIG.maxRetries) {
        console.log(`⏳ Waiting ${DEPLOY_CONFIG.retryDelay}ms before retry...`);
        await sleep(DEPLOY_CONFIG.retryDelay);
      }
    }
  }
  
  return false;
};

const verifyDeployment = async () => {
  console.log('🔍 Verifying deployment...');
  
  try {
    // Wait a moment for GitHub Pages to update
    await sleep(5000);
    
    // Check if the main site is accessible
    const response = await fetch('https://theglocal.in');
    if (response.ok) {
      console.log('✅ Deployment verification successful');
      return true;
    } else {
      console.warn('⚠️  Site verification failed, but deployment may still be processing');
      return false;
    }
  } catch (error) {
    console.warn('⚠️  Could not verify deployment:', error.message);
    return false;
  }
};

// Main deployment process
const main = async () => {
  let success = false;
  
  try {
    // Setup
    setupGitConfig();
    
    // Build
    if (!(await buildProject())) {
      throw new Error('Build failed');
    }
    
    // Prepare
    if (!(await prepareDeployment())) {
      throw new Error('File preparation failed');
    }
    
    // Deploy
    if (!(await deployToGitHub())) {
      throw new Error('Deployment failed');
    }
    
    // Verify
    await verifyDeployment();
    
    success = true;
    console.log('\n🎉 Deployment completed successfully!');
    console.log('🌐 Your site should be available at: https://theglocal.in');
    
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    cleanup();
    process.exit(success ? 0 : 1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Deployment interrupted by user');
  cleanup();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deployment terminated');
  cleanup();
  process.exit(1);
});

// Run deployment
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  cleanup();
  process.exit(1);
});
