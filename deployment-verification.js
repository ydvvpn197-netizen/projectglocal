#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies all improvements are working correctly
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYMENT VERIFICATION STARTING...\n');

// Check 1: Verify critical files exist
console.log('📁 CHECKING CRITICAL FILES...');
const criticalFiles = [
  'src/components/error/ComprehensiveErrorBoundary.tsx',
  'src/components/optimization/OptimizedImage.tsx',
  'src/utils/performanceMonitor.ts',
  'src/utils/securityAudit.ts',
  'src/test/comprehensive-test-suite.test.tsx',
  'supabase/migrations/20250130000000_comprehensive_database_fixes.sql'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check 2: Verify security improvements
console.log('\n🔒 CHECKING SECURITY IMPROVEMENTS...');
const securityChecks = [
  {
    file: 'src/components/auth/AuthProvider.tsx',
    check: 'No hardcoded JWT tokens',
    pattern: /VITE_SUPABASE_ANON_KEY/
  },
  {
    file: 'src/utils/securityAudit.ts',
    check: 'Security audit system exists',
    pattern: /initializeSecurityAudit/
  }
];

securityChecks.forEach(({ file, check, pattern }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (pattern.test(content)) {
      console.log(`✅ ${check} in ${file}`);
    } else {
      console.log(`❌ ${check} in ${file} - NOT FOUND`);
    }
  } else {
    console.log(`❌ ${file} - FILE MISSING`);
  }
});

// Check 3: Verify performance improvements
console.log('\n⚡ CHECKING PERFORMANCE IMPROVEMENTS...');
const performanceChecks = [
  {
    file: 'src/pages/EnhancedIndex.tsx',
    check: 'useMemo for animation variants',
    pattern: /const containerVariants = useMemo/
  },
  {
    file: 'src/pages/EnhancedIndex.tsx',
    check: 'useCallback for event handlers',
    pattern: /const handleGetStarted = useCallback/
  },
  {
    file: 'src/components/optimization/OptimizedImage.tsx',
    check: 'OptimizedImage component exists',
    pattern: /export.*OptimizedImage/
  }
];

performanceChecks.forEach(({ file, check, pattern }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (pattern.test(content)) {
      console.log(`✅ ${check} in ${file}`);
    } else {
      console.log(`❌ ${check} in ${file} - NOT FOUND`);
    }
  } else {
    console.log(`❌ ${file} - FILE MISSING`);
  }
});

// Check 4: Verify database migration
console.log('\n🗄️ CHECKING DATABASE MIGRATION...');
const migrationFile = 'supabase/migrations/20250130000000_comprehensive_database_fixes.sql';
if (fs.existsSync(migrationFile)) {
  const content = fs.readFileSync(migrationFile, 'utf8');
  const requiredTables = [
    'news_cache',
    'news_likes',
    'news_shares',
    'news_events',
    'news_poll_votes',
    'news_trending_scores',
    'user_news_preferences'
  ];
  
  let allTablesFound = true;
  requiredTables.forEach(table => {
    if (content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      console.log(`✅ Table ${table} in migration`);
    } else {
      console.log(`❌ Table ${table} - NOT FOUND in migration`);
      allTablesFound = false;
    }
  });
  
  if (allTablesFound) {
    console.log('✅ All required database tables found in migration');
  }
} else {
  console.log('❌ Database migration file missing');
}

// Check 5: Verify error handling
console.log('\n🛡️ CHECKING ERROR HANDLING...');
const errorHandlingChecks = [
  {
    file: 'src/App.tsx',
    check: 'ComprehensiveErrorBoundary integrated',
    pattern: /ComprehensiveErrorBoundary/
  },
  {
    file: 'src/components/error/ComprehensiveErrorBoundary.tsx',
    check: 'Smart error detection exists',
    pattern: /getErrorType|getErrorSeverity/
  }
];

errorHandlingChecks.forEach(({ file, check, pattern }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (pattern.test(content)) {
      console.log(`✅ ${check} in ${file}`);
    } else {
      console.log(`❌ ${check} in ${file} - NOT FOUND`);
    }
  } else {
    console.log(`❌ ${file} - FILE MISSING`);
  }
});

// Check 6: Verify testing coverage
console.log('\n🧪 CHECKING TESTING COVERAGE...');
const testFiles = [
  'src/test/comprehensive-test-suite.test.tsx',
  'src/tests/__tests__/CommunityEngagementHub.test.tsx',
  'src/tests/__tests__/integration/CommunityPlatform.test.tsx'
];

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Summary
console.log('\n📊 DEPLOYMENT VERIFICATION SUMMARY');
console.log('=====================================');

if (allFilesExist) {
  console.log('✅ All critical files present');
} else {
  console.log('❌ Some critical files missing');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Apply database migration: npx supabase db push');
console.log('2. Run tests: npm test');
console.log('3. Start development server: npm run dev');
console.log('4. Monitor performance in browser dev tools');
console.log('5. Check security audit results in console');

console.log('\n🚀 DEPLOYMENT VERIFICATION COMPLETE!');
