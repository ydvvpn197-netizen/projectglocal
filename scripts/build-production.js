#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildProduction() {
  console.log('🏗️  Building for production...');
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.VITE_MODE = 'production';
  
  try {
    // Run TypeScript check
    console.log('📝 Running TypeScript check...');
    execSync('npm run type-check', { stdio: 'inherit' });
    
    // Run tests
    console.log('🧪 Running tests...');
    execSync('npm run test:fast', { stdio: 'inherit' });
    
    // Build for production
    console.log('🔨 Building application...');
    execSync('npm run build:prod', { stdio: 'inherit' });
    
    // Verify build
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error('Build failed - dist directory not found');
    }
    
    console.log('✅ Production build completed successfully');
    
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    process.exit(1);
  }
}

buildProduction();
