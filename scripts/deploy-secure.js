#!/usr/bin/env node

/**
 * Secure Deployment Script
 * Deploys TheGlocal.in with proper secret management and security checks
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

function checkEnvironment() {
  log('\n🔍 Checking environment...', 'blue');
  
  // Check if .env exists and read content
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    log('✅ .env file found', 'green');
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    log('⚠️  .env file not found - using environment variables', 'yellow');
  }
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const envVar = process.env[varName];
    const envFileVar = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`);
    return !envVar && !envFileVar;
  });
  
  if (missingVars.length > 0) {
    log(`❌ Missing required environment variables: ${missingVars.join(', ')}`, 'red');
    log('Please set these variables in your deployment environment', 'yellow');
    process.exit(1);
  }
  
  log('✅ Required environment variables present', 'green');
}

function checkSecurity() {
  log('\n🛡️  Checking security...', 'blue');
  
  // Check if .env is in gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignoreContent.includes('.env')) {
      log('✅ .env is properly gitignored', 'green');
    } else {
      log('⚠️  .env should be added to .gitignore', 'yellow');
    }
  }
  
  // Check for exposed secrets in code
  const srcPath = path.join(__dirname, '..', 'src');
  const exposedSecrets = findExposedSecrets(srcPath);
  
  if (exposedSecrets.length > 0) {
    log('⚠️  Potential secret exposure found:', 'yellow');
    exposedSecrets.forEach(secret => {
      log(`  - ${secret}`, 'yellow');
    });
  } else {
    log('✅ No exposed secrets found in code', 'green');
  }
}

function findExposedSecrets(dir) {
  const exposedSecrets = [];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for hardcoded API keys
      const apiKeyPatterns = [
        /sk-[a-zA-Z0-9]{48}/, // OpenAI API key
        /AIza[0-9A-Za-z-_]{35}/, // Google API key
        /pk_test_[a-zA-Z0-9]{24}/, // Stripe test key
        /pk_live_[a-zA-Z0-9]{24}/, // Stripe live key
        /[a-zA-Z0-9]{32}/ // Generic 32-char key
      ];
      
      apiKeyPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          exposedSecrets.push(`${filePath}: Potential API key`);
        }
      });
    } catch (error) {
      // Ignore files that can't be read
    }
  }
  
  function scanDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
          scanFile(filePath);
        }
      });
    } catch (error) {
      // Ignore directories that can't be read
    }
  }
  
  scanDirectory(dir);
  return exposedSecrets;
}

function runTests() {
  log('\n🧪 Running tests...', 'blue');
  
  try {
    execSync('npm run test:fast', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log('✅ Tests passed', 'green');
  } catch (error) {
    log('❌ Tests failed', 'red');
    log('Please fix failing tests before deployment', 'yellow');
    process.exit(1);
  }
}

function buildProject() {
  log('\n🏗️  Building project...', 'blue');
  
  try {
    execSync('npm run build:prod', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log('✅ Build successful', 'green');
  } catch (error) {
    log('❌ Build failed', 'red');
    log('Please fix build errors before deployment', 'yellow');
    process.exit(1);
  }
}

function deployToGitHub() {
  log('\n🚀 Deploying to GitHub Pages...', 'blue');
  
  try {
    execSync('npm run deploy:github', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log('✅ Deployment successful', 'green');
  } catch (error) {
    log('❌ Deployment failed', 'red');
    log('Check your GitHub Pages configuration', 'yellow');
    process.exit(1);
  }
}

function deployToCustomDomain() {
  log('\n🌐 Deploying to custom domain...', 'blue');
  
  try {
    execSync('npm run deploy:domain', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log('✅ Custom domain deployment successful', 'green');
  } catch (error) {
    log('❌ Custom domain deployment failed', 'red');
    log('Check your domain configuration', 'yellow');
    process.exit(1);
  }
}

function verifyDeployment() {
  log('\n✅ Verifying deployment...', 'blue');
  
  // Check if dist folder exists
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    log('✅ Build artifacts found', 'green');
  } else {
    log('❌ Build artifacts not found', 'red');
    process.exit(1);
  }
  
  // Check for index.html
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    log('✅ Index file found', 'green');
  } else {
    log('❌ Index file not found', 'red');
    process.exit(1);
  }
  
  log('✅ Deployment verification complete', 'green');
}

function main() {
  log('🚀 TheGlocal.in Secure Deployment Script', 'bright');
  log('==========================================', 'bright');
  
  const args = process.argv.slice(2);
  const deployTarget = args[0] || 'github';
  
  try {
    checkEnvironment();
    checkSecurity();
    runTests();
    buildProject();
    
    if (deployTarget === 'github') {
      deployToGitHub();
    } else if (deployTarget === 'domain') {
      deployToCustomDomain();
    } else {
      log(`❌ Unknown deployment target: ${deployTarget}`, 'red');
      log('Available targets: github, domain', 'yellow');
      process.exit(1);
    }
    
    verifyDeployment();
    
    log('\n🎉 Deployment completed successfully!', 'green');
    log('TheGlocal.in is now live with enhanced security features:', 'blue');
    log('  • Anonymous handle system', 'cyan');
    log('  • Privacy-first design', 'cyan');
    log('  • Comprehensive RLS policies', 'cyan');
    log('  • Security audit logging', 'cyan');
    log('  • Unified creator marketplace', 'cyan');
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the deployment script
main();
