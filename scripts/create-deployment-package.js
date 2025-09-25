#!/usr/bin/env node

/**
 * Create Deployment Package Script
 * Creates a deployment package for the application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Creating deployment package...');

// Check if dist directory exists
const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create deployment package directory
const deployPath = path.join(projectRoot, 'deploy');
if (fs.existsSync(deployPath)) {
  fs.rmSync(deployPath, { recursive: true });
}
fs.mkdirSync(deployPath, { recursive: true });

// Copy dist files to deployment package
console.log('📦 Copying build files...');
fs.cpSync(distPath, path.join(deployPath, 'dist'), { recursive: true });

// Copy package.json
fs.copyFileSync(
  path.join(projectRoot, 'package.json'),
  path.join(deployPath, 'package.json')
);

// Copy environment files if they exist
const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(envFile => {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, path.join(deployPath, envFile));
    console.log(`📄 Copied ${envFile}`);
  }
});

// Create deployment info file
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  version: JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')).version,
  build: 'production',
  platform: process.platform,
  node: process.version
};

fs.writeFileSync(
  path.join(deployPath, 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

// Create deployment script
const deployScript = `#!/bin/bash
echo "🚀 Deploying Project Glocal..."
echo "📦 Deployment package created at: $(date)"
echo "✅ Ready for deployment!"
`;

fs.writeFileSync(path.join(deployPath, 'deploy.sh'), deployScript);
fs.chmodSync(path.join(deployPath, 'deploy.sh'), '755');

console.log('✅ Deployment package created successfully!');
console.log(`📁 Location: ${deployPath}`);
console.log('🎉 Ready for deployment!');
