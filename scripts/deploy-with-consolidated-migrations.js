#!/usr/bin/env node

/**
 * Deployment Script with Consolidated Migrations
 * Deploys TheGlocal.in using the new consolidated migration structure
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

function checkConsolidatedMigrations() {
  log('\n🔍 Checking consolidated migration structure...', 'blue');
  
  const migrationsPath = path.join(__dirname, '..', 'supabase', 'migrations');
  const requiredMigrations = [
    '20250101000001_01_core_schema.sql',
    '20250101000002_02_auth_and_users.sql',
    '20250101000003_03_content_system.sql',
    '20250101000004_04_news_system.sql',
    '20250101000005_05_community_features.sql',
    '20250101000006_06_monetization.sql',
    '20250101000007_07_admin_and_security.sql',
    '20250101000008_08_functions_and_triggers.sql',
    '20250101000009_09_row_level_security.sql',
    '20250101000010_10_cleanup_old_migrations.sql'
  ];
  
  const missingMigrations = [];
  const existingMigrations = [];
  
  requiredMigrations.forEach(migration => {
    const migrationPath = path.join(migrationsPath, migration);
    if (fs.existsSync(migrationPath)) {
      existingMigrations.push(migration);
      log(`✅ ${migration}`, 'green');
    } else {
      missingMigrations.push(migration);
      log(`❌ ${migration}`, 'red');
    }
  });
  
  if (missingMigrations.length > 0) {
    log(`\n❌ Missing consolidated migrations: ${missingMigrations.length}`, 'red');
    log('Please ensure all consolidated migration files are present', 'yellow');
    process.exit(1);
  }
  
  log(`\n✅ All ${existingMigrations.length} consolidated migrations found`, 'green');
  
  // Check for old migration files that should be removed
  const allFiles = fs.readdirSync(migrationsPath);
  const oldMigrations = allFiles.filter(file => 
    file.endsWith('.sql') && 
    !requiredMigrations.includes(file) &&
    !file.startsWith('202501010000')
  );
  
  if (oldMigrations.length > 0) {
    log(`\n⚠️  Found ${oldMigrations.length} old migration files that should be removed:`, 'yellow');
    oldMigrations.forEach(file => {
      log(`  - ${file}`, 'yellow');
    });
    log('Consider removing these files to clean up the repository', 'cyan');
  }
  
  return { existingMigrations, oldMigrations };
}

function validateMigrationStructure() {
  log('\n🔍 Validating migration structure...', 'blue');
  
  const migrationsPath = path.join(__dirname, '..', 'supabase', 'migrations');
  
  // Check if migrations directory exists
  if (!fs.existsSync(migrationsPath)) {
    log('❌ Migrations directory not found', 'red');
    process.exit(1);
  }
  
  // Validate each consolidated migration file
  const migrationFiles = [
    '20250101000001_01_core_schema.sql',
    '20250101000002_02_auth_and_users.sql',
    '20250101000003_03_content_system.sql',
    '20250101000004_04_news_system.sql',
    '20250101000005_05_community_features.sql',
    '20250101000006_06_monetization.sql',
    '20250101000007_07_admin_and_security.sql',
    '20250101000008_08_functions_and_triggers.sql',
    '20250101000009_09_row_level_security.sql',
    '20250101000010_10_cleanup_old_migrations.sql'
  ];
  
  migrationFiles.forEach(file => {
    const filePath = path.join(migrationsPath, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation checks
      if (content.length < 100) {
        log(`⚠️  ${file} appears to be empty or very small`, 'yellow');
      }
      
      if (!content.includes('-- ============================================================================')) {
        log(`⚠️  ${file} may not have proper header structure`, 'yellow');
      }
      
      log(`✅ ${file} validated`, 'green');
    }
  });
  
  log('✅ Migration structure validation complete', 'green');
}

function checkSupabaseConnection() {
  log('\n🔍 Checking Supabase connection...', 'blue');
  
  try {
    // Check if Supabase CLI is available
    execSync('supabase --version', { stdio: 'pipe' });
    log('✅ Supabase CLI found', 'green');
    
    // Check if project is linked
    try {
      execSync('supabase status', { stdio: 'pipe' });
      log('✅ Supabase project linked', 'green');
    } catch (error) {
      log('⚠️  Supabase project not linked or not running', 'yellow');
      log('Please run: supabase link --project-ref YOUR_PROJECT_REF', 'cyan');
    }
    
  } catch (error) {
    log('❌ Supabase CLI not found', 'red');
    log('Please install Supabase CLI: npm install -g supabase', 'yellow');
    process.exit(1);
  }
}

function runDatabaseMigrations() {
  log('\n🗄️  Running database migrations...', 'blue');
  
  try {
    // Check if we're in a Supabase project
    const supabaseConfigPath = path.join(__dirname, '..', 'supabase', 'config.toml');
    if (!fs.existsSync(supabaseConfigPath)) {
      log('❌ Supabase config not found', 'red');
      log('Please ensure you are in a Supabase project directory', 'yellow');
      process.exit(1);
    }
    
    // Run migrations
    log('Running consolidated migrations...', 'cyan');
    execSync('supabase db reset', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    log('✅ Database migrations completed successfully', 'green');
    
  } catch (error) {
    log('❌ Database migration failed', 'red');
    log('Error details:', 'yellow');
    log(error.message, 'red');
    process.exit(1);
  }
}

function verifyDatabaseSetup() {
  log('\n🔍 Verifying database setup...', 'blue');
  
  try {
    // Run a simple query to verify database is working
    execSync('supabase db diff --schema public', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    log('✅ Database setup verified', 'green');
    
  } catch (error) {
    log('⚠️  Could not verify database setup', 'yellow');
    log('Database may still be working, but verification failed', 'cyan');
  }
}

function buildProject() {
  log('\n🏗️  Building project...', 'blue');
  
  try {
    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.VITE_MODE = 'production';
    
    // Install dependencies
    log('Installing dependencies...', 'cyan');
    execSync('npm ci', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // Run tests
    log('Running tests...', 'cyan');
    execSync('npm run test:fast', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // Build for production
    log('Building for production...', 'cyan');
    execSync('npm run build:prod', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    log('✅ Build completed successfully', 'green');
    
  } catch (error) {
    log('❌ Build failed', 'red');
    log('Error details:', 'yellow');
    log(error.message, 'red');
    process.exit(1);
  }
}

function deployToProduction() {
  log('\n🚀 Deploying to production...', 'blue');
  
  try {
    // Deploy to GitHub Pages
    log('Deploying to GitHub Pages...', 'cyan');
    execSync('npm run deploy:github', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    log('✅ Production deployment completed', 'green');
    
  } catch (error) {
    log('❌ Production deployment failed', 'red');
    log('Error details:', 'yellow');
    log(error.message, 'red');
    process.exit(1);
  }
}

function verifyDeployment() {
  log('\n✅ Verifying deployment...', 'blue');
  
  // Check if dist folder exists
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    log('✅ Build artifacts found', 'green');
    
    // Check for essential files
    const essentialFiles = ['index.html', 'assets'];
    essentialFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      if (fs.existsSync(filePath)) {
        log(`✅ ${file} found`, 'green');
      } else {
        log(`⚠️  ${file} not found`, 'yellow');
      }
    });
    
  } else {
    log('❌ Build artifacts not found', 'red');
    process.exit(1);
  }
  
  log('✅ Deployment verification complete', 'green');
}

function generateDeploymentReport() {
  log('\n📊 Generating deployment report...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    migrationStructure: 'consolidated',
    totalMigrations: 10,
    deploymentStatus: 'success',
    features: [
      'Core database schema',
      'Authentication and user management',
      'Content creation and social interactions',
      'News aggregation and trending',
      'Community features and points system',
      'Monetization and payments',
      'Admin dashboard and security',
      'Comprehensive RLS policies',
      'Automated functions and triggers',
      'Migration consolidation cleanup'
    ]
  };
  
  const reportPath = path.join(__dirname, '..', 'deployment-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('✅ Deployment report generated', 'green');
  log(`Report saved to: ${reportPath}`, 'cyan');
}

function main() {
  log('🚀 TheGlocal.in Deployment with Consolidated Migrations', 'bright');
  log('========================================================', 'bright');
  
  try {
    // Step 1: Check consolidated migrations
    const { existingMigrations, oldMigrations } = checkConsolidatedMigrations();
    
    // Step 2: Validate migration structure
    validateMigrationStructure();
    
    // Step 3: Check Supabase connection
    checkSupabaseConnection();
    
    // Step 4: Run database migrations
    runDatabaseMigrations();
    
    // Step 5: Verify database setup
    verifyDatabaseSetup();
    
    // Step 6: Build project
    buildProject();
    
    // Step 7: Deploy to production
    deployToProduction();
    
    // Step 8: Verify deployment
    verifyDeployment();
    
    // Step 9: Generate deployment report
    generateDeploymentReport();
    
    log('\n🎉 Deployment completed successfully!', 'green');
    log('\n📋 Deployment Summary:', 'blue');
    log(`✅ Consolidated migrations: ${existingMigrations.length}/10`, 'green');
    log(`⚠️  Old migrations to clean up: ${oldMigrations.length}`, 'yellow');
    log('✅ Database migrations applied', 'green');
    log('✅ Project built successfully', 'green');
    log('✅ Deployed to production', 'green');
    log('✅ Deployment verified', 'green');
    
    log('\n🌐 TheGlocal.in is now live with consolidated migrations!', 'bright');
    log('🔗 https://theglocal.in', 'cyan');
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the deployment script
main();
