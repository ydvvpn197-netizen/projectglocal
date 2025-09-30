#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📊 Running bundle analysis...');

try {
  // Run build with analysis
  execSync('cross-env ANALYZE=true npm run build', { stdio: 'inherit' });
  
  // Check if analysis file was created
  if (fs.existsSync('bundle-analysis.html')) {
    console.log('✅ Bundle analysis completed');
    console.log('📁 Analysis file: bundle-analysis.html');
    console.log('🌐 Open the file in your browser to view the analysis');
  } else {
    console.log('⚠️  Bundle analysis file not found');
  }
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
