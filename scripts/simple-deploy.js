#!/usr/bin/env node

/**
 * Simple deployment script for theglocal.in
 * Builds the project and prepares it for deployment to GitHub Pages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment process...');

// Helper function to run commands
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Check environment
console.log('\n🔍 Checking environment...');
if (!fileExists('.env')) {
  console.warn('⚠️  Warning: .env file not found. Using environment variables or defaults.');
} else {
  console.log('✅ Environment file found');
}

// Clean previous builds
console.log('\n🧹 Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Previous build cleaned');
}

// Install dependencies (skip if already installed)
if (!fs.existsSync('node_modules')) {
  runCommand('npm install', 'Installing dependencies');
} else {
  console.log('\n📦 Dependencies already installed - skipping installation');
}

// Type check
runCommand('npm run type-check', 'Running type check');

// Lint check
runCommand('npm run lint', 'Running lint check');

// Build the project
runCommand('npm run build', 'Building project');

// Verify build output
console.log('\n🔍 Verifying build output...');
const requiredFiles = [
  'dist/index.html',
  'dist/js',
  'dist/css'
];

let buildValid = true;
requiredFiles.forEach(file => {
  const exists = fileExists(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) buildValid = false;
});

if (!buildValid) {
  console.error('❌ Build validation failed!');
  process.exit(1);
}

// Create CNAME file for custom domain
console.log('\n🌐 Setting up domain...');
const cnameContent = 'theglocal.in';
fs.writeFileSync(path.join('dist', 'CNAME'), cnameContent);
console.log(`✅ CNAME file created: ${cnameContent}`);

// Copy additional files
console.log('\n📋 Copying additional files...');
const filesToCopy = [
  { src: 'public/_redirects', dest: 'dist/_redirects' },
  { src: 'public/robots.txt', dest: 'dist/robots.txt' },
  { src: 'public/favicon.ico', dest: 'dist/favicon.ico' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fileExists(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${src} to ${dest}`);
  } else {
    console.log(`⚠️  Skipped ${src} (not found)`);
  }
});

// Check if git is available and get deployment info
let gitInfo = '';
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  gitInfo = `Branch: ${branch}, Commit: ${commit}`;
  console.log(`\n📝 Git info: ${gitInfo}`);
} catch (error) {
  console.log('\n⚠️  Git info not available');
}

// Display summary
console.log('\n🎉 Deployment preparation completed!');
console.log('\n📊 Summary:');
console.log('- ✅ Dependencies installed');
console.log('- ✅ Type checking passed');
console.log('- ✅ Linting passed');
console.log('- ✅ Build completed');
console.log('- ✅ Build output verified');
console.log('- ✅ Domain configured');
console.log('- ✅ Additional files copied');

console.log('\n📁 Build output:');
try {
  const distFiles = fs.readdirSync('dist');
  distFiles.forEach(file => {
    const stat = fs.statSync(path.join('dist', file));
    const type = stat.isDirectory() ? '📁' : '📄';
    console.log(`  ${type} ${file}`);
  });
} catch (error) {
  console.log('  Could not read dist directory');
}

console.log('\n🚀 Ready for deployment!');
console.log('\nNext steps:');
console.log('1. Push changes to main branch to trigger GitHub Actions');
console.log('2. Or manually deploy the dist/ folder to your hosting provider');
console.log('3. The site will be available at: https://theglocal.in');

if (gitInfo) {
  console.log(`\n${gitInfo}`);
}
