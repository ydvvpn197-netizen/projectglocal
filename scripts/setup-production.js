#!/usr/bin/env node

/**
 * Production Setup Script
 * Sets up all production configurations and validates environment
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function setupProduction() {
  log('🚀 Setting up TheGlocal.in for Production', 'bright');
  log('==========================================', 'bright');
  
  try {
    // 1. Check environment variables
    log('\n1. 🔍 Checking environment variables...', 'blue');
    const envPath = path.join(__dirname, '..', '.env');
    
    if (!fs.existsSync(envPath)) {
      log('❌ .env file not found', 'red');
      log('Please create .env file with required variables', 'yellow');
      process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => 
      !envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)
    );
    
    if (missingVars.length > 0) {
      log(`❌ Missing or invalid environment variables: ${missingVars.join(', ')}`, 'red');
      log('Please update .env file with actual values', 'yellow');
      process.exit(1);
    }
    
    log('✅ Environment variables configured', 'green');
    
    // 2. Verify GitHub Actions workflow
    log('\n2. 📋 Checking GitHub Actions workflow...', 'blue');
    const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml');
    
    if (fs.existsSync(workflowPath)) {
      log('✅ GitHub Actions workflow exists', 'green');
    } else {
      log('⚠️  GitHub Actions workflow not found', 'yellow');
      log('Creating GitHub Actions workflow...', 'cyan');
      
      // Create .github/workflows directory if it doesn't exist
      const workflowsDir = path.dirname(workflowPath);
      if (!fs.existsSync(workflowsDir)) {
        fs.mkdirSync(workflowsDir, { recursive: true });
      }
      
      // Copy the workflow file
      const deployWorkflow = `name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:fast
    
    - name: Build for production
      run: npm run build:prod
      env:
        VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_GOOGLE_MAPS_API_KEY: \${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
        VITE_NEWS_API_KEY: \${{ secrets.VITE_NEWS_API_KEY }}
        VITE_OPENAI_API_KEY: \${{ secrets.VITE_OPENAI_API_KEY }}
        VITE_APP_VERSION: \${{ secrets.VITE_APP_VERSION }}
        VITE_API_TIMEOUT: \${{ secrets.VITE_API_TIMEOUT }}
        VITE_ENABLE_DEBUG_MODE: \${{ secrets.VITE_ENABLE_DEBUG_MODE }}
        VITE_ENABLE_ERROR_TRACKING: \${{ secrets.VITE_ENABLE_ERROR_TRACKING }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist`;
      
      fs.writeFileSync(workflowPath, deployWorkflow);
      log('✅ GitHub Actions workflow created', 'green');
    }
    
    // 3. Check production configuration
    log('\n3. ⚙️  Checking production configuration...', 'blue');
    const productionConfigPath = path.join(__dirname, '..', 'src', 'config', 'production.ts');
    
    if (fs.existsSync(productionConfigPath)) {
      log('✅ Production configuration exists', 'green');
    } else {
      log('⚠️  Production configuration not found', 'yellow');
      log('Creating production configuration...', 'cyan');
      
      const productionConfig = `// Production environment configuration
export const productionConfig = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // API Configuration
  api: {
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
  },
  
  // Feature Flags
  features: {
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    errorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    performanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  
  // Security Configuration
  security: {
    maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
    enableCSP: import.meta.env.VITE_ENABLE_CSP === 'true',
    enableHSTS: import.meta.env.VITE_ENABLE_HSTS === 'true',
  }
};

// Validate required environment variables
export const validateProductionEnvironment = () => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(\`Missing required environment variables: \${missing.join(', ')}\`);
  }
  
  return true;
};`;
      
      fs.writeFileSync(productionConfigPath, productionConfig);
      log('✅ Production configuration created', 'green');
    }
    
    // 4. Check secret manager
    log('\n4. 🔐 Checking secret manager...', 'blue');
    const secretManagerPath = path.join(__dirname, '..', 'src', 'utils', 'secretManager.ts');
    
    if (fs.existsSync(secretManagerPath)) {
      log('✅ Secret manager exists', 'green');
    } else {
      log('⚠️  Secret manager not found', 'yellow');
      log('Creating secret manager...', 'cyan');
      
      const secretManager = `// Secret management utility for production
export class SecretManager {
  private static secrets: Record<string, string> = {};
  
  static setSecret(key: string, value: string): void {
    this.secrets[key] = value;
  }
  
  static getSecret(key: string): string | undefined {
    return this.secrets[key] || import.meta.env[key];
  }
  
  static hasSecret(key: string): boolean {
    return !!(this.secrets[key] || import.meta.env[key]);
  }
  
  static validateSecrets(required: string[]): boolean {
    const missing = required.filter(key => !this.hasSecret(key));
    
    if (missing.length > 0) {
      console.error(\`Missing required secrets: \${missing.join(', ')}\`);
      return false;
    }
    
    return true;
  }
  
  static maskSecret(secret: string): string {
    if (secret.length <= 8) return '*'.repeat(secret.length);
    return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
  }
}

// Initialize secrets in production
if (import.meta.env.PROD) {
  const requiredSecrets = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  SecretManager.validateSecrets(requiredSecrets);
}`;
      
      fs.writeFileSync(secretManagerPath, secretManager);
      log('✅ Secret manager created', 'green');
    }
    
    // 5. Summary
    log('\n🎉 Production setup completed successfully!', 'green');
    log('\n📋 Next steps:', 'blue');
    log('1. Add secrets to GitHub repository settings', 'cyan');
    log('2. Test the build: npm run build:production', 'cyan');
    log('3. Deploy to production: npm run deploy:production', 'cyan');
    log('4. Monitor deployment at https://theglocal.in', 'cyan');
    
  } catch (error) {
    log(`\n❌ Production setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the setup
setupProduction();
