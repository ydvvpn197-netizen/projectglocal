#!/usr/bin/env node

/**
 * GitHub Deployment Setup Script
 * 
 * This script helps set up the GitHub repository for successful deployment
 * by providing instructions and checking the current configuration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 GitHub Deployment Setup for TheGlocal Project\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Found .env file');
  
  // Read and parse environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  console.log('\n📋 Required Environment Variables for GitHub Secrets:');
  console.log('=' .repeat(60));
  
  const requiredSecrets = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optionalSecrets = [
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_GNEWS_API_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_NEWS_API_KEY'
  ];
  
  console.log('\n🔑 REQUIRED SECRETS (Must be added to GitHub):');
  requiredSecrets.forEach(secret => {
    const value = envVars[secret];
    if (value) {
      console.log(`✅ ${secret}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${secret}: NOT FOUND`);
    }
  });
  
  console.log('\n🔧 OPTIONAL SECRETS (Add for full functionality):');
  optionalSecrets.forEach(secret => {
    const value = envVars[secret];
    if (value) {
      console.log(`✅ ${secret}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`⚪ ${secret}: Not configured`);
    }
  });
  
} else {
  console.log('❌ .env file not found');
  console.log('Please create a .env file with your environment variables');
}

console.log('\n📖 GitHub Repository Setup Instructions:');
console.log('=' .repeat(60));

console.log('\n1. 🌐 Enable GitHub Pages:');
console.log('   • Go to: https://github.com/ydvvpn197-netizen/projectglocal/settings/pages');
console.log('   • Under "Source", select "GitHub Actions"');
console.log('   • Click "Save"');

console.log('\n2. 🔐 Add Repository Secrets:');
console.log('   • Go to: https://github.com/ydvvpn197-netizen/projectglocal/settings/secrets/actions');
console.log('   • Click "New repository secret"');
console.log('   • Add each required secret from the list above');

console.log('\n3. 🚀 Trigger Deployment:');
console.log('   • Go to: https://github.com/ydvvpn197-netizen/projectglocal/actions');
console.log('   • Click on "Deploy to GitHub Pages" workflow');
console.log('   • Click "Run workflow" button');
console.log('   • Select "main" branch and click "Run workflow"');

console.log('\n4. 📊 Monitor Deployment:');
console.log('   • Watch the workflow progress in the Actions tab');
console.log('   • Check for any errors or warnings');
console.log('   • Once complete, your site will be available at:');
console.log('     https://ydvvpn197-netizen.github.io/projectglocal/');

console.log('\n5. 🔍 Troubleshooting:');
console.log('   • If deployment fails, check the Actions logs');
console.log('   • Verify all required secrets are set');
console.log('   • Ensure Supabase project is properly configured');
console.log('   • Check for any build errors in the logs');

console.log('\n📋 Quick Setup Checklist:');
console.log('=' .repeat(60));
console.log('□ GitHub Pages enabled (Source: GitHub Actions)');
console.log('□ VITE_SUPABASE_URL secret added');
console.log('□ VITE_SUPABASE_ANON_KEY secret added');
console.log('□ Optional secrets added (if needed)');
console.log('□ Deployment workflow triggered');
console.log('□ Deployment completed successfully');

console.log('\n🎉 After setup, your project will be live at:');
console.log('   https://ydvvpn197-netizen.github.io/projectglocal/');

console.log('\n📞 Need Help?');
console.log('   • Check the deployment guide: GITHUB_DEPLOYMENT_GUIDE.md');
console.log('   • Review the troubleshooting section');
console.log('   • Check GitHub Actions logs for specific errors');

console.log('\n✨ Setup complete! Follow the instructions above to deploy your project.');
