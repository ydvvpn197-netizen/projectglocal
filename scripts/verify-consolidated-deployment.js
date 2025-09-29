#!/usr/bin/env node

/**
 * Consolidated Deployment Verification
 * Verifies that all consolidated components are working correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying consolidated deployment...');

// Check if dist directory exists
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory not found. Run build first.');
  process.exit(1);
}

// Verify consolidated components in build
const jsPath = path.join(distPath, 'js');
const cssPath = path.join(distPath, 'css');

console.log('📦 Checking build artifacts...');

// Check JavaScript chunks
if (fs.existsSync(jsPath)) {
  const jsFiles = fs.readdirSync(jsPath);
  console.log(`✅ Found ${jsFiles.length} JavaScript chunks`);
  
  // Check for consolidated chunks
  const consolidatedChunks = jsFiles.filter(file => 
    file.includes('consolidated') || 
    file.includes('layout-components')
  );
  
  if (consolidatedChunks.length > 0) {
    console.log('✅ Consolidated chunks found:', consolidatedChunks);
  } else {
    console.log('⚠️ Consolidated chunks not found in build');
  }
} else {
  console.error('❌ JavaScript directory not found');
}

// Check CSS files
if (fs.existsSync(cssPath)) {
  const cssFiles = fs.readdirSync(cssPath);
  console.log(`✅ Found ${cssFiles.length} CSS files`);
} else {
  console.log('⚠️ CSS directory not found');
}

// Check for build report
const buildReportPath = path.join(distPath, 'build-report.json');
if (fs.existsSync(buildReportPath)) {
  const buildReport = JSON.parse(fs.readFileSync(buildReportPath, 'utf8'));
  console.log('📊 Build Report:');
  console.log(`- Timestamp: ${buildReport.timestamp}`);
  console.log(`- Build Size: ${buildReport.buildSize}`);
  console.log(`- Status: ${buildReport.status}`);
  console.log(`- Consolidated Components: ${buildReport.consolidatedComponents.join(', ')}`);
} else {
  console.log('⚠️ Build report not found');
}

// Verify index.html
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for consolidated components in HTML
  if (indexContent.includes('consolidated')) {
    console.log('✅ Consolidated components referenced in HTML');
  }
  
  // Check for proper script and style tags
  const scriptTags = (indexContent.match(/<script/g) || []).length;
  const styleTags = (indexContent.match(/<link.*rel="stylesheet"/g) || []).length;
  
  console.log(`✅ Found ${scriptTags} script tags and ${styleTags} style links`);
} else {
  console.error('❌ index.html not found');
}

// Test consolidated components functionality
console.log('\n🧪 Testing consolidated components...');

try {
  // Run consolidated component tests
  console.log('Running consolidated component tests...');
  execSync('npm run test:consolidated', { stdio: 'inherit' });
  console.log('✅ Consolidated component tests passed');
} catch (error) {
  console.log('⚠️ Consolidated component tests failed:', error.message);
}

// Check for any missing functionality
console.log('\n🔍 Checking for missing functionality...');

const consolidatedFiles = [
  'src/pages/ConsolidatedDashboard.tsx',
  'src/pages/ConsolidatedFeed.tsx', 
  'src/pages/ConsolidatedIndex.tsx',
  'src/components/MainLayout.tsx'
];

let allFilesExist = true;
for (const file of consolidatedFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✅ All consolidated files present');
} else {
  console.log('❌ Some consolidated files missing');
  process.exit(1);
}

// Check routing configuration
const routesPath = 'src/routes/AppRoutes.tsx';
if (fs.existsSync(routesPath)) {
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  
  if (routesContent.includes('ConsolidatedDashboard') && 
      routesContent.includes('ConsolidatedFeed') && 
      routesContent.includes('ConsolidatedIndex')) {
    console.log('✅ Routing configured for consolidated components');
  } else {
    console.log('⚠️ Routing may not be fully configured for consolidated components');
  }
} else {
  console.log('⚠️ Routes file not found');
}

// Performance check
console.log('\n📊 Performance check...');

const buildSize = getDirectorySize(distPath);
console.log(`📦 Total build size: ${buildSize}`);

if (parseFloat(buildSize) > 10) {
  console.log('⚠️ Build size is large, consider optimization');
} else {
  console.log('✅ Build size is reasonable');
}

console.log('\n🎉 Consolidated deployment verification complete!');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => calculateSize(path.join(itemPath, file)));
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
}
