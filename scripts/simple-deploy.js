#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Deploy to GitHub Pages
  console.log('📤 Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist', { stdio: 'inherit' });

  console.log('✅ Deployment completed successfully!');
  console.log('🌐 Your site should be available at: https://theglocal.in');
  console.log('⏳ It may take a few minutes for changes to propagate.');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
