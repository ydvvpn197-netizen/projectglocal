#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function deployProduction() {
  console.log('🌐 Deploying to production domain...');
  
  try {
    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.VITE_MODE = 'production';
    
    // Security checks
    console.log('🛡️  Running security checks...');
    execSync('npm run security:audit', { stdio: 'inherit' });
    
    // Run production tests
    console.log('🧪 Running production tests...');
    execSync('npm run test:fast', { stdio: 'inherit' });
    
    // Build for production
    console.log('🔨 Building for production...');
    execSync('npm run build:prod', { stdio: 'inherit' });
    
    // Deploy to production domain
    console.log('🚀 Deploying to theglocal.in...');
    execSync('npm run deploy:domain', { stdio: 'inherit' });
    
    // Verify deployment
    console.log('✅ Verifying deployment...');
    execSync('npm run verify:deployment', { stdio: 'inherit' });
    
    console.log('🎉 Production deployment completed successfully!');
    console.log('🌐 TheGlocal.in is now live at https://theglocal.in');
    
  } catch (error) {
    console.error('❌ Production deployment failed:', error.message);
    process.exit(1);
  }
}

deployProduction();