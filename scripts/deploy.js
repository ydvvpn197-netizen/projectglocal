#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting deployment for theglocal.in...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.VITE_APP_URL = 'https://theglocal.in';

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build for production
  console.log('🔨 Building for production...');
  execSync('npm run build:prod', { stdio: 'inherit' });

  // Copy .htaccess to dist folder
  console.log('📋 Copying .htaccess file...');
  if (fs.existsSync('public/.htaccess')) {
    fs.copyFileSync('public/.htaccess', 'dist/.htaccess');
  }

  // Create deployment package
  console.log('📦 Creating deployment package...');
  const archiver = require('archiver');
  const output = fs.createWriteStream('theglocal-deploy.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('🎉 Deployment package created: theglocal-deploy.zip');
    console.log('📁 Upload the contents of the "dist" folder to your web server');
    console.log('🌐 Your site should be available at: https://theglocal.in');
    
    console.log('');
    console.log('📊 Build Information:');
    console.log('   - Build directory: dist/');
    console.log('   - Main entry: dist/index.html');
    console.log('   - Assets: dist/js/, dist/css/, dist/assets/');
    console.log('   - Configuration: dist/.htaccess');
  });

  archive.pipe(output);
  archive.directory('dist/', false);
  archive.finalize();

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
