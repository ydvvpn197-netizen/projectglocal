#!/usr/bin/env node

/**
 * GitHub Secrets Setup Helper
 * This script helps you set up the required GitHub secrets for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 GitHub Secrets Setup Helper\n');

// Read environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
}

console.log('📋 Required GitHub Secrets:\n');

console.log('1. VITE_SUPABASE_URL');
console.log(`   Value: ${supabaseUrl || 'NOT FOUND IN .env'}\n`);

console.log('2. VITE_SUPABASE_ANON_KEY');
console.log(`   Value: ${supabaseKey || 'NOT FOUND IN .env'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Error: Could not find Supabase credentials in .env file');
  console.log('Please ensure your .env file contains:');
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

console.log('📝 How to add these secrets to GitHub:\n');
console.log('1. Go to: https://github.com/ydvvpn197-netizen/projectglocal/settings/secrets/actions');
console.log('2. Click "New repository secret"');
console.log('3. Add each secret with the exact name and value above\n');

console.log('🚀 After adding secrets:');
console.log('1. Push any change to main branch to trigger deployment');
console.log('2. Check GitHub Actions tab for deployment progress');
console.log('3. Visit https://theglocal.in to test sign-in\n');

console.log('✅ Current .env configuration looks good!');
console.log('The issue is that GitHub Actions needs these values as repository secrets.');
