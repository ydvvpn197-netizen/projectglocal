#!/usr/bin/env node

/**
 * Test script to verify GitHub Actions workflow configuration
 * This script checks if the workflow files are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function testWorkflowConfig() {
  log('🔍 Testing GitHub Actions workflow configuration...', 'info');
  
  const workflowDir = path.join(__dirname, '..', '.github', 'workflows');
  const requiredFiles = ['ci-cd.yml', 'deploy-complete.yml'];
  
  let allTestsPassed = true;
  
  // Check if workflow files exist
  for (const file of requiredFiles) {
    const filePath = path.join(workflowDir, file);
    if (fs.existsSync(filePath)) {
      log(`✅ Found ${file}`, 'success');
    } else {
      log(`❌ Missing ${file}`, 'error');
      allTestsPassed = false;
    }
  }
  
  // Check package files
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  
  if (fs.existsSync(packageJsonPath)) {
    log('✅ Found package.json', 'success');
  } else {
    log('❌ Missing package.json', 'error');
    allTestsPassed = false;
  }
  
  if (fs.existsSync(packageLockPath)) {
    log('✅ Found package-lock.json', 'success');
  } else {
    log('⚠️ Missing package-lock.json (will use npm install)', 'warning');
  }
  
  // Check workflow content for cache configuration
  const ciCdPath = path.join(workflowDir, 'ci-cd.yml');
  if (fs.existsSync(ciCdPath)) {
    const content = fs.readFileSync(ciCdPath, 'utf8');
    
    if (content.includes('cache: \'npm\'')) {
      log('✅ npm cache configuration found', 'success');
    } else {
      log('❌ npm cache configuration missing', 'error');
      allTestsPassed = false;
    }
    
    if (content.includes('npm ci') && content.includes('npm install')) {
      log('✅ Fallback installation strategy found', 'success');
    } else {
      log('⚠️ Fallback installation strategy not found', 'warning');
    }
    
    if (!content.includes('cache-dependency-path')) {
      log('✅ Removed problematic cache-dependency-path', 'success');
    } else {
      log('❌ Still contains cache-dependency-path', 'error');
      allTestsPassed = false;
    }
  }
  
  // Summary
  if (allTestsPassed) {
    log('\n🎉 All workflow configuration tests passed!', 'success');
    log('The GitHub Actions build should now work correctly.', 'success');
  } else {
    log('\n❌ Some workflow configuration tests failed.', 'error');
    log('Please review the issues above.', 'error');
  }
  
  return allTestsPassed;
}

// Run the test
const success = testWorkflowConfig();
process.exit(success ? 0 : 1);
