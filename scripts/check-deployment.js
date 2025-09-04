#!/usr/bin/env node

/**
 * Deployment Check Script
 * Verifies that all required configurations are in place for successful deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment configuration...\n');

// Check if required files exist
const requiredFiles = [
  '.github/workflows/deploy-pages.yml',
  '.github/workflows/deploy.yml',
  'vercel.json',
  'public/_redirects',
  'package.json'
];

console.log('📁 Checking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'type-check', 'lint', 'test:run'];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} - MISSING`);
    allFilesExist = false;
  }
});

// Check environment variables
console.log('\n🔐 Environment variables check:');
const envExample = fs.readFileSync('env.example', 'utf8');
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`✅ ${envVar} - Documented`);
  } else {
    console.log(`❌ ${envVar} - NOT DOCUMENTED`);
    allFilesExist = false;
  }
});

// Check GitHub Actions workflow
console.log('\n⚙️ GitHub Actions workflow check:');
const workflowContent = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

if (workflowContent.includes('permissions:')) {
  console.log('✅ Permissions configured');
} else {
  console.log('❌ Permissions not configured');
  allFilesExist = false;
}

if (workflowContent.includes('concurrency:')) {
  console.log('✅ Concurrency control configured');
} else {
  console.log('❌ Concurrency control not configured');
  allFilesExist = false;
}

// Summary
console.log('\n📊 Deployment Check Summary:');
if (allFilesExist) {
  console.log('✅ All checks passed! Your deployment should work.');
  console.log('\n🚀 Next steps:');
  console.log('1. Add required secrets to GitHub repository:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('2. Enable GitHub Pages in repository settings');
  console.log('3. Push to main branch to trigger deployment');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}

console.log('\n📚 For detailed instructions, see DEPLOYMENT_FIXES_FINAL.md');
