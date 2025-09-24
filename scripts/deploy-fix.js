#!/usr/bin/env node

/**
 * Deployment Fix Script
 * This script fixes common deployment issues for the TheGlocal project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting deployment fixes...');

// 1. Ensure _redirects file exists and is correct
const redirectsContent = '/*    /index.html   200\n';
const redirectsPath = path.join(__dirname, '..', 'public', '_redirects');

try {
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('✅ Fixed _redirects file');
} catch (error) {
  console.error('❌ Failed to fix _redirects file:', error.message);
}

// 2. Ensure dist directory has correct _redirects
const distRedirectsPath = path.join(__dirname, '..', 'dist', '_redirects');
try {
  if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
    fs.writeFileSync(distRedirectsPath, redirectsContent);
    console.log('✅ Fixed dist/_redirects file');
  }
} catch (error) {
  console.error('❌ Failed to fix dist/_redirects file:', error.message);
}

// 3. Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  .env file not found. Creating from .env.example...');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example');
    } catch (error) {
      console.error('❌ Failed to create .env file:', error.message);
    }
  }
}

// 4. Validate build output
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build output validation passed');
  } else {
    console.error('❌ index.html not found in dist directory');
  }
} else {
  console.warn('⚠️  dist directory not found. Run "npm run build" first.');
}

console.log('🎉 Deployment fixes completed!');
console.log('');
console.log('Next steps:');
console.log('1. Run "npm run build" to create production build');
console.log('2. Deploy the dist folder to your hosting platform');
console.log('3. Ensure your hosting platform is configured for SPA routing');
console.log('');
console.log('For Vercel: The vercel.json file is already configured');
console.log('For Netlify: The _redirects file is already configured');
console.log('For GitHub Pages: Use "npm run deploy:github"');
