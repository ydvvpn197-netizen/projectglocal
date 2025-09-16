#!/usr/bin/env node

/**
 * GitHub Pages Deployment Script for Project Glocal
 * This script builds and deploys the project to GitHub Pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const exec = (command, options = {}) => {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    throw error;
  }
};

async function checkGitStatus() {
  log('🔍 Checking Git status...', 'blue');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('⚠️  You have uncommitted changes. Please commit them first.', 'yellow');
      log('Run: git add . && git commit -m "your message"', 'cyan');
      process.exit(1);
    }
    log('✅ Git status clean', 'green');
  } catch (error) {
    log('❌ Git status check failed', 'red');
    throw error;
  }
}

async function buildProject() {
  log('🔨 Building project...', 'blue');
  
  try {
    // Install dependencies
    log('📦 Installing dependencies...', 'cyan');
    exec('npm ci');

    // Type check
    log('🔍 Running type check...', 'cyan');
    exec('npm run type-check');

    // Lint check
    log('🔍 Running lint check...', 'cyan');
    exec('npm run lint');

    // Build for production
    log('🏗️  Building for production...', 'cyan');
    exec('npm run build');

    log('✅ Build completed successfully', 'green');
  } catch (error) {
    log('❌ Build failed. Please fix errors and try again.', 'red');
    process.exit(1);
  }
}

async function deployToGitHubPages() {
  log('🚀 Deploying to GitHub Pages...', 'blue');
  
  try {
    // Check if gh-pages is installed
    try {
      exec('npx gh-pages --version');
    } catch (error) {
      log('📦 Installing gh-pages...', 'cyan');
      exec('npm install -g gh-pages');
    }

    // Deploy to GitHub Pages
    log('📤 Publishing to GitHub Pages...', 'cyan');
    exec('npx gh-pages -d dist --dotfiles');

    log('✅ Deployed to GitHub Pages successfully', 'green');
    
    // Get repository info
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const repoName = remoteUrl.split('/').pop().replace('.git', '');
      const username = remoteUrl.split('/')[3];
      
      log('', 'reset');
      log('🎉 Deployment Complete!', 'green');
      log('====================', 'green');
      log(`Your app is now live at: https://${username}.github.io/${repoName}`, 'cyan');
      log('', 'reset');
      log('Next steps:', 'yellow');
      log('1. Visit your deployed app', 'cyan');
      log('2. Check /config-status for configuration', 'cyan');
      log('3. Test all user flows', 'cyan');
      log('4. Set up environment variables in GitHub Secrets', 'cyan');
      
    } catch (error) {
      log('✅ Deployed successfully, but could not determine URL', 'green');
    }

  } catch (error) {
    log('❌ GitHub Pages deployment failed', 'red');
    log('Make sure you have push access to the repository', 'yellow');
    throw error;
  }
}

async function createEnvironmentTemplate() {
  log('📝 Creating environment template...', 'blue');
  
  const envTemplate = `# Project Glocal Environment Variables
# Add these to your GitHub repository secrets for automatic deployment

# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional but recommended
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEWS_API_KEY=your_news_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id

# To add these to GitHub Secrets:
# 1. Go to your repository on GitHub
# 2. Click Settings > Secrets and variables > Actions
# 3. Add each variable as a repository secret
`;

  try {
    fs.writeFileSync('GITHUB_SECRETS_SETUP.md', envTemplate);
    log('✅ Created GITHUB_SECRETS_SETUP.md', 'green');
    log('📖 Follow the instructions in the file to set up GitHub Secrets', 'cyan');
  } catch (error) {
    log('⚠️  Could not create secrets template file', 'yellow');
  }
}

async function main() {
  log('🚀 Project Glocal - GitHub Pages Deployment', 'bright');
  log('==========================================', 'bright');
  log('');

  try {
    await checkGitStatus();
    await buildProject();
    await deployToGitHubPages();
    await createEnvironmentTemplate();

    log('');
    log('🎉 Deployment completed successfully!', 'green');
    log('');
    log('Important Notes:', 'yellow');
    log('• Your app is deployed but may need environment variables', 'cyan');
    log('• Set up GitHub Secrets for full functionality', 'cyan');
    log('• Check the GitHub Actions tab for deployment status', 'cyan');
    log('');

  } catch (error) {
    log('');
    log('❌ Deployment failed', 'red');
    log('Check the error messages above and try again', 'yellow');
    process.exit(1);
  }
}

// Run the deployment
main().catch(console.error);
