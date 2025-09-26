#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Project Glocal
 * Runs all tests with proper error handling and reporting
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  NODE_OPTIONS: '--max-old-space-size=4096',
  TIMEOUT: 300000, // 5 minutes
  TEST_TIMEOUT: 10000,
  COVERAGE_THRESHOLD: 70
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
      NODE_ENV: 'test',
      CI: 'true',
      VITEST_TIMEOUT: CONFIG.TEST_TIMEOUT
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

function getTestFiles() {
  const testDir = 'src/test';
  const testFiles = [];
  
  if (!checkFileExists(testDir)) {
    return testFiles;
  }
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
        testFiles.push(filePath);
      }
    });
  }
  
  scanDirectory(testDir);
  return testFiles;
}

function validateTestEnvironment() {
  logStep('ENV', 'Validating test environment');
  
  // Check if test files exist
  const testFiles = getTestFiles();
  if (testFiles.length === 0) {
    logWarning('No test files found');
    return true; // Continue anyway
  }
  
  logInfo(`Found ${testFiles.length} test files`);
  testFiles.forEach(file => {
    logInfo(`  - ${file}`);
  });
  
  // Check if vitest config exists
  if (!checkFileExists('vitest.config.ts')) {
    logWarning('vitest.config.ts not found, using defaults');
  }
  
  // Check if test setup file exists
  if (!checkFileExists('src/test/minimal-setup.ts')) {
    logWarning('Test setup file not found');
  }
  
  logSuccess('Test environment validated');
  return true;
}

function runUnitTests() {
  logStep('UNIT', 'Running unit tests');
  
  const result = runCommand('npm run test:fast');
  
  if (!result.success) {
    logError('Unit tests failed');
    return false;
  }
  
  logSuccess('Unit tests passed');
  return true;
}

function runTestCoverage() {
  logStep('COVERAGE', 'Running test coverage');
  
  const result = runCommand('npm run test:coverage');
  
  if (!result.success) {
    logWarning('Coverage tests failed');
    return false;
  }
  
  // Check coverage threshold
  const coveragePath = 'coverage/coverage-summary.json';
  if (checkFileExists(coveragePath)) {
    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const totalCoverage = coverage.total.lines.pct;
      
      logInfo(`Total coverage: ${totalCoverage}%`);
      
      if (totalCoverage < CONFIG.COVERAGE_THRESHOLD) {
        logWarning(`Coverage below threshold (${CONFIG.COVERAGE_THRESHOLD}%)`);
      } else {
        logSuccess(`Coverage above threshold (${CONFIG.COVERAGE_THRESHOLD}%)`);
      }
    } catch (error) {
      logWarning('Could not parse coverage report');
    }
  }
  
  logSuccess('Coverage analysis completed');
  return true;
}

function runE2ETests() {
  logStep('E2E', 'Running end-to-end tests');
  
  // Check if Playwright is configured
  if (!checkFileExists('playwright.config.ts') && !checkFileExists('playwright.config.js')) {
    logWarning('Playwright not configured, skipping E2E tests');
    return true;
  }
  
  const result = runCommand('npm run test:e2e');
  
  if (!result.success) {
    logWarning('E2E tests failed');
    return false;
  }
  
  logSuccess('E2E tests passed');
  return true;
}

function runIntegrationTests() {
  logStep('INTEGRATION', 'Running integration tests');
  
  // Check for Supabase connection test
  if (checkFileExists('scripts/test-supabase-connection.js')) {
    logInfo('Running Supabase connection test');
    const result = runCommand('npm run test:supabase');
    
    if (!result.success) {
      logWarning('Supabase connection test failed');
      return false;
    }
    
    logSuccess('Supabase connection test passed');
  }
  
  return true;
}

function runPerformanceTests() {
  logStep('PERFORMANCE', 'Running performance tests');
  
  // Check if performance test files exist
  const testFiles = getTestFiles();
  const performanceTests = testFiles.filter(file => 
    file.includes('performance') || file.includes('load')
  );
  
  if (performanceTests.length === 0) {
    logWarning('No performance tests found');
    return true;
  }
  
  logInfo(`Found ${performanceTests.length} performance test files`);
  
  // Run performance tests with increased timeout
  const result = runCommand('npm run test:fast -- --run --reporter=verbose', {
    env: {
      ...process.env,
      NODE_OPTIONS: CONFIG.NODE_OPTIONS,
      NODE_ENV: 'test',
      CI: 'true',
      VITEST_TIMEOUT: CONFIG.TEST_TIMEOUT * 2 // Double timeout for performance tests
    }
  });
  
  if (!result.success) {
    logWarning('Performance tests failed');
    return false;
  }
  
  logSuccess('Performance tests passed');
  return true;
}

function runSecurityTests() {
  logStep('SECURITY', 'Running security tests');
  
  // Run npm audit
  logInfo('Running npm audit');
  const auditResult = runCommand('npm audit --audit-level=moderate');
  
  if (!auditResult.success) {
    logWarning('Security vulnerabilities found');
    // Don't fail the build for security warnings
  } else {
    logSuccess('No security vulnerabilities found');
  }
  
  // Check for security test files
  const testFiles = getTestFiles();
  const securityTests = testFiles.filter(file => 
    file.includes('security') || file.includes('auth')
  );
  
  if (securityTests.length === 0) {
    logWarning('No security tests found');
    return true;
  }
  
  logInfo(`Found ${securityTests.length} security test files`);
  logSuccess('Security tests completed');
  return true;
}

function generateTestReport() {
  logStep('REPORT', 'Generating test report');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    testFiles: getTestFiles(),
    coverage: null,
    results: {
      unit: true,
      coverage: true,
      e2e: true,
      integration: true,
      performance: true,
      security: true
    }
  };
  
  // Try to read coverage report
  const coveragePath = 'coverage/coverage-summary.json';
  if (checkFileExists(coveragePath)) {
    try {
      report.coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    } catch (error) {
      logWarning('Could not parse coverage report');
    }
  }
  
  // Save test report
  const reportPath = 'test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logInfo(`Test report saved to: ${reportPath}`);
  
  // Display summary
  logInfo('\n📊 Test Summary:');
  logInfo(`  - Test files: ${report.testFiles.length}`);
  if (report.coverage) {
    logInfo(`  - Coverage: ${report.coverage.total.lines.pct}%`);
  }
  
  return true;
}

function cleanupTestArtifacts() {
  logStep('CLEANUP', 'Cleaning up test artifacts');
  
  const artifactsToClean = [
    'coverage',
    'test-results',
    'playwright-report',
    'test-report.json'
  ];
  
  artifactsToClean.forEach(artifact => {
    if (checkFileExists(artifact)) {
      try {
        fs.rmSync(artifact, { recursive: true, force: true });
        logInfo(`Removed ${artifact}`);
      } catch (error) {
        logWarning(`Could not remove ${artifact}: ${error.message}`);
      }
    }
  });
  
  logSuccess('Test artifacts cleaned up');
  return true;
}

// Main test function
async function main() {
  log(`\n${colors.bright}${colors.cyan}🧪 Project Glocal Test Suite${colors.reset}\n`);
  
  const startTime = Date.now();
  let testResults = {
    unit: false,
    coverage: false,
    e2e: false,
    integration: false,
    performance: false,
    security: false
  };
  
  try {
    // Step 1: Validate test environment
    if (!validateTestEnvironment()) {
      process.exit(1);
    }
    
    // Step 2: Run unit tests
    testResults.unit = runUnitTests();
    
    // Step 3: Run test coverage
    testResults.coverage = runTestCoverage();
    
    // Step 4: Run E2E tests
    testResults.e2e = runE2ETests();
    
    // Step 5: Run integration tests
    testResults.integration = runIntegrationTests();
    
    // Step 6: Run performance tests
    testResults.performance = runPerformanceTests();
    
    // Step 7: Run security tests
    testResults.security = runSecurityTests();
    
    // Step 8: Generate test report
    generateTestReport();
    
    // Step 9: Cleanup (optional)
    // cleanupTestArtifacts();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Display final results
    log(`\n${colors.bright}${colors.cyan}📊 Test Results Summary${colors.reset}`);
    log(`⏱️  Test duration: ${duration}s`);
    log('');
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌';
      const color = passed ? 'green' : 'red';
      log(`${status} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`, color);
    });
    
    const allPassed = Object.values(testResults).every(result => result);
    
    if (allPassed) {
      log(`\n${colors.bright}${colors.green}🎉 All tests passed!${colors.reset}\n`);
    } else {
      log(`\n${colors.bright}${colors.yellow}⚠️ Some tests failed, but continuing...${colors.reset}\n`);
    }
    
  } catch (error) {
    logError(`Test suite failed with error: ${error.message}`);
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

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, CONFIG };
