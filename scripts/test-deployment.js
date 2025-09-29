#!/usr/bin/env node

/**
 * Test Deployment Script for Project Glocal
 * Tests deployment readiness without actually deploying
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function getFileSize(filePath) {
  if (!checkFileExists(filePath)) return 0;
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateBuildOutput() {
  logStep('BUILD', 'Validating build output');
  
  const buildDir = 'dist';
  const requiredFiles = [
    'index.html',
    'assets'
  ];
  
  if (!checkFileExists(buildDir)) {
    logError(`Build directory '${buildDir}' not found`);
    return false;
  }
  
  let missingFiles = [];
  requiredFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (!checkFileExists(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    logError(`Missing required build files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  // Check build size
  const indexPath = path.join(buildDir, 'index.html');
  const indexSize = getFileSize(indexPath);
  
  if (indexSize === 0) {
    logError('index.html is empty');
    return false;
  }
  
  logInfo(`index.html size: ${formatBytes(indexSize)}`);
  
  // List build contents
  logInfo('Build contents:');
  const buildContents = fs.readdirSync(buildDir);
  buildContents.forEach(item => {
    const itemPath = path.join(buildDir, item);
    const stats = fs.statSync(itemPath);
    const size = stats.isDirectory() ? 'directory' : formatBytes(getFileSize(itemPath));
    logInfo(`  - ${item} (${size})`);
  });
  
  logSuccess('Build output validated');
  return true;
}

function validateEnvironment() {
  logStep('ENV', 'Validating environment');
  
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  let missingVars = [];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    logWarning(`Missing environment variables: ${missingVars.join(', ')}`);
    logInfo('These are required for production deployment');
  } else {
    logSuccess('Environment variables validated');
  }
  
  return true;
}

function validateGitConfig() {
  logStep('GIT', 'Validating Git configuration');
  
  // Check if we're in a Git repository
  if (!checkFileExists('.git')) {
    logWarning('Not in a Git repository');
    return false;
  }
  
  // Check if package.json has correct repository info
  if (checkFileExists('package.json')) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.homepage) {
        logInfo(`Homepage configured: ${packageJson.homepage}`);
      } else {
        logWarning('No homepage configured in package.json');
      }
    } catch (error) {
      logWarning('Could not read package.json');
    }
  }
  
  logSuccess('Git configuration validated');
  return true;
}

function validateGitHubActions() {
  logStep('GITHUB', 'Validating GitHub Actions workflow');
  
  const workflowPath = '.github/workflows/ci-cd.yml';
  if (!checkFileExists(workflowPath)) {
    logWarning('GitHub Actions workflow not found');
    return false;
  }
  
  logInfo('GitHub Actions workflow found');
  
  // Check for required workflow files
  const requiredWorkflows = [
    '.github/workflows/ci-cd.yml',
    '.github/workflows/deploy.yml',
    '.github/workflows/deploy-complete.yml'
  ];
  
  requiredWorkflows.forEach(workflow => {
    if (checkFileExists(workflow)) {
      logInfo(`✓ ${workflow}`);
    } else {
      logWarning(`✗ ${workflow} not found`);
    }
  });
  
  logSuccess('GitHub Actions validation completed');
  return true;
}

function generateDeploymentReport() {
  logStep('REPORT', 'Generating deployment readiness report');
  
  const report = {
    timestamp: new Date().toISOString(),
    buildDir: 'dist',
    nodeVersion: process.version,
    buildExists: checkFileExists('dist'),
    buildSize: 0,
    environment: {
      supabaseUrl: !!process.env.VITE_SUPABASE_URL,
      supabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      mapsKey: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
      newsKey: !!process.env.VITE_NEWS_API_KEY,
      openaiKey: !!process.env.VITE_OPENAI_API_KEY,
      stripeKey: !!process.env.VITE_STRIPE_PUBLISHABLE_KEY
    },
    git: {
      repository: checkFileExists('.git'),
      workflows: {
        'ci-cd.yml': checkFileExists('.github/workflows/ci-cd.yml'),
        'deploy.yml': checkFileExists('.github/workflows/deploy.yml'),
        'deploy-complete.yml': checkFileExists('.github/workflows/deploy-complete.yml')
      }
    }
  };
  
  // Calculate build size
  if (report.buildExists) {
    function calculateSize(dir) {
      let totalSize = 0;
      if (!fs.existsSync(dir)) return 0;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += calculateSize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
      
      return totalSize;
    }
    
    report.buildSize = calculateSize('dist');
  }
  
  // Save report
  const reportPath = 'deployment-readiness-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logInfo(`Deployment readiness report saved to: ${reportPath}`);
  
  // Display summary
  logInfo('\n📊 Deployment Readiness Summary:');
  logInfo(`  - Build exists: ${report.buildExists ? '✅' : '❌'}`);
  logInfo(`  - Build size: ${formatBytes(report.buildSize)}`);
  logInfo(`  - Environment vars: ${Object.values(report.environment).filter(Boolean).length}/6 configured`);
  logInfo(`  - Git repository: ${report.git.repository ? '✅' : '❌'}`);
  logInfo(`  - GitHub workflows: ${Object.values(report.git.workflows).filter(Boolean).length}/3 present`);
  
  return true;
}

// Main function
async function main() {
  log(`\n${colors.bright}${colors.cyan}🧪 Project Glocal Deployment Test${colors.reset}\n`);
  
  const startTime = Date.now();
  
  try {
    // Step 1: Validate build output
    const buildValid = validateBuildOutput();
    
    // Step 2: Validate environment
    validateEnvironment();
    
    // Step 3: Validate Git configuration
    validateGitConfig();
    
    // Step 4: Validate GitHub Actions
    validateGitHubActions();
    
    // Step 5: Generate deployment report
    generateDeploymentReport();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n${colors.bright}${colors.cyan}📊 Deployment Test Summary${colors.reset}`);
    log(`⏱️  Test duration: ${duration}s`);
    
    if (buildValid) {
      log(`\n${colors.bright}${colors.green}🎉 Deployment test completed successfully!${colors.reset}`);
      log(`🌐 Ready for deployment to: https://theglocal.in/`);
    } else {
      log(`\n${colors.bright}${colors.yellow}⚠️ Deployment test completed with warnings${colors.reset}`);
      log(`🔧 Please fix the issues above before deploying`);
    }
    
    log(`\n${colors.bright}${colors.blue}📝 Next steps:${colors.reset}`);
    log(`   1. Ensure environment variables are configured`);
    log(`   2. Push changes to GitHub`);
    log(`   3. Monitor GitHub Actions workflow`);
    log(`   4. Verify deployment at https://theglocal.in/\n`);
    
  } catch (error) {
    logError(`Deployment test failed with error: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
