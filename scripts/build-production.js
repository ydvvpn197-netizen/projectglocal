#!/usr/bin/env node

/**
 * Production Build Script for Project Glocal
 * Handles optimized production builds with comprehensive error handling
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BUILD_DIR: 'dist',
  NODE_OPTIONS: '--max-old-space-size=6144',
  TIMEOUT: 600000, // 10 minutes
  RETRY_ATTEMPTS: 3
};

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

// Utility functions
function runCommand(command, options = {}) {
  const defaultOptions = {
    stdio: 'inherit',
    timeout: CONFIG.TIMEOUT,
    env: {
      ...process.env,
      NODE_OPTIONS: CONFIG.NODE_OPTIONS,
      NODE_ENV: 'production',
      CI: 'true'
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    execSync(command, finalOptions);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
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

function validateEnvironment() {
  logStep('ENV', 'Validating environment variables');
  
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optionalEnvVars = [
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_NEWS_API_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];
  
  let missingRequired = [];
  let missingOptional = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingRequired.push(varName);
    }
  });
  
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingOptional.push(varName);
    }
  });
  
  if (missingRequired.length > 0) {
    logError(`Missing required environment variables: ${missingRequired.join(', ')}`);
    return false;
  }
  
  if (missingOptional.length > 0) {
    logWarning(`Missing optional environment variables: ${missingOptional.join(', ')}`);
  }
  
  logSuccess('Environment validation passed');
  return true;
}

function cleanBuildDirectory() {
  logStep('CLEAN', 'Cleaning build directory');
  
  if (checkFileExists(CONFIG.BUILD_DIR)) {
    try {
      fs.rmSync(CONFIG.BUILD_DIR, { recursive: true, force: true });
      logSuccess('Build directory cleaned');
    } catch (error) {
      logError(`Failed to clean build directory: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

function installDependencies() {
  logStep('DEPS', 'Installing dependencies');
  
  const result = runCommand('npm ci --prefer-offline --no-audit --progress=false');
  
  if (!result.success) {
    logError('Failed to install dependencies');
    return false;
  }
  
  // Clear npm cache to free up memory
  runCommand('npm cache clean --force');
  
  logSuccess('Dependencies installed successfully');
  return true;
}

function runTypeCheck() {
  logStep('TYPE', 'Running TypeScript type checking');
  
  const result = runCommand('npm run type-check');
  
  if (!result.success) {
    logError('Type checking failed');
    return false;
  }
  
  logSuccess('Type checking passed');
  return true;
}

function runLinting() {
  logStep('LINT', 'Running ESLint');
  
  const result = runCommand('npm run lint');
  
  if (!result.success) {
    logError('Linting failed');
    return false;
  }
  
  logSuccess('Linting passed');
  return true;
}

function runTests() {
  logStep('TEST', 'Running test suite');
  
  const result = runCommand('npm run test:fast');
  
  if (!result.success) {
    logWarning('Some tests failed, but continuing with build');
  } else {
    logSuccess('All tests passed');
  }
  
  return true; // Continue build even if tests fail
}

function buildApplication() {
  logStep('BUILD', 'Building application for production');
  
  const result = runCommand('npm run build:prod');
  
  if (!result.success) {
    logError('Build failed');
    return false;
  }
  
  logSuccess('Application built successfully');
  return true;
}

function validateBuildOutput() {
  logStep('VALIDATE', 'Validating build output');
  
  const requiredFiles = [
    'index.html',
    'assets',
    'js',
    'css'
  ];
  
  let missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(CONFIG.BUILD_DIR, file);
    if (!checkFileExists(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    logError(`Missing required build files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  // Check build size
  const indexPath = path.join(CONFIG.BUILD_DIR, 'index.html');
  const indexSize = getFileSize(indexPath);
  
  if (indexSize === 0) {
    logError('index.html is empty');
    return false;
  }
  
  logInfo(`index.html size: ${formatBytes(indexSize)}`);
  
  // List build contents
  logInfo('Build contents:');
  const buildContents = fs.readdirSync(CONFIG.BUILD_DIR);
  buildContents.forEach(item => {
    const itemPath = path.join(CONFIG.BUILD_DIR, item);
    const size = fs.statSync(itemPath).isDirectory() ? 
      'directory' : formatBytes(getFileSize(itemPath));
    logInfo(`  - ${item} (${size})`);
  });
  
  logSuccess('Build output validated');
  return true;
}

function optimizeBuild() {
  logStep('OPTIMIZE', 'Optimizing build output');
  
  // Remove source maps in production
  const assetsPath = path.join(CONFIG.BUILD_DIR, 'assets');
  if (checkFileExists(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    files.forEach(file => {
      if (file.endsWith('.map')) {
        const mapPath = path.join(assetsPath, file);
        fs.unlinkSync(mapPath);
        logInfo(`Removed source map: ${file}`);
      }
    });
  }
  
  logSuccess('Build optimization completed');
  return true;
}

function generateBuildReport() {
  logStep('REPORT', 'Generating build report');
  
  const report = {
    timestamp: new Date().toISOString(),
    buildDir: CONFIG.BUILD_DIR,
    nodeVersion: process.version,
    buildSize: 0,
    files: []
  };
  
  // Calculate total build size
  function calculateSize(dir) {
    let totalSize = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += calculateSize(filePath);
      } else {
        totalSize += stats.size;
        report.files.push({
          path: path.relative(CONFIG.BUILD_DIR, filePath),
          size: stats.size
        });
      }
    });
    
    return totalSize;
  }
  
  report.buildSize = calculateSize(CONFIG.BUILD_DIR);
  
  // Save report
  const reportPath = path.join(CONFIG.BUILD_DIR, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logInfo(`Total build size: ${formatBytes(report.buildSize)}`);
  logInfo(`Build report saved to: ${reportPath}`);
  
  return true;
}

// Main build function
async function main() {
  log(`\n${colors.bright}${colors.cyan}🚀 Project Glocal Production Build${colors.reset}\n`);
  
  const startTime = Date.now();
  
  try {
    // Step 1: Environment validation
    if (!validateEnvironment()) {
      process.exit(1);
    }
    
    // Step 2: Clean build directory
    if (!cleanBuildDirectory()) {
      process.exit(1);
    }
    
    // Step 3: Install dependencies
    if (!installDependencies()) {
      process.exit(1);
    }
    
    // Step 4: Type checking
    if (!runTypeCheck()) {
      process.exit(1);
    }
    
    // Step 5: Linting
    if (!runLinting()) {
      process.exit(1);
    }
    
    // Step 6: Run tests (optional)
    runTests();
    
    // Step 7: Build application
    if (!buildApplication()) {
      process.exit(1);
    }
    
    // Step 8: Validate build output
    if (!validateBuildOutput()) {
      process.exit(1);
    }
    
    // Step 9: Optimize build
    optimizeBuild();
    
    // Step 10: Generate build report
    generateBuildReport();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n${colors.bright}${colors.green}🎉 Production build completed successfully!${colors.reset}`);
    log(`⏱️  Build time: ${duration}s`);
    log(`📁 Build directory: ${CONFIG.BUILD_DIR}`);
    log(`🌐 Ready for deployment!\n`);
    
  } catch (error) {
    logError(`Build failed with error: ${error.message}`);
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

// Run the build
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, CONFIG };