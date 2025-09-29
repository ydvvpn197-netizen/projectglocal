#!/usr/bin/env node

/**
 * Consolidated Build Script
 * Optimized build process for consolidated components
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting consolidated build process...');

// Set environment variables for build optimization
process.env.NODE_OPTIONS = '--max-old-space-size=6144';
process.env.VITE_BUILD_TARGET = 'production';

// Build steps
const steps = [
  {
    name: 'Clean previous builds',
    command: 'npm run clean',
    optional: true
  },
  {
    name: 'Type checking',
    command: 'npm run type-check'
  },
  {
    name: 'Linting',
    command: 'npm run lint'
  },
  {
    name: 'Running tests',
    command: 'npm run test:fast',
    optional: true
  },
  {
    name: 'Building application',
    command: 'npm run build:prod'
  },
  {
    name: 'Bundle analysis',
    command: 'npm run analyze:bundle',
    optional: true
  }
];

// Execute build steps
for (const step of steps) {
  try {
    console.log(`\n📦 ${step.name}...`);
    execSync(step.command, { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log(`✅ ${step.name} completed`);
  } catch (error) {
    if (step.optional) {
      console.log(`⚠️ ${step.name} failed (optional): ${error.message}`);
    } else {
      console.error(`❌ ${step.name} failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Verify build output
console.log('\n🔍 Verifying build output...');

const distPath = path.join(process.cwd(), 'dist');
const requiredFiles = [
  'index.html',
  'js',
  'css'
];

for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file/directory missing: ${file}`);
    process.exit(1);
  }
}

// Check for consolidated components in build
const jsPath = path.join(distPath, 'js');
if (fs.existsSync(jsPath)) {
  const jsFiles = fs.readdirSync(jsPath);
  const hasConsolidatedChunks = jsFiles.some(file => 
    file.includes('consolidated') || file.includes('layout-components')
  );
  
  if (hasConsolidatedChunks) {
    console.log('✅ Consolidated components detected in build');
  } else {
    console.log('⚠️ Consolidated components not detected in build chunks');
  }
}

// Generate build report
const buildReport = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  buildTarget: process.env.VITE_BUILD_TARGET,
  consolidatedComponents: [
    'ConsolidatedDashboard',
    'ConsolidatedFeed', 
    'ConsolidatedIndex',
    'MainLayout'
  ],
  buildSize: getDirectorySize(distPath),
  status: 'success'
};

fs.writeFileSync(
  path.join(distPath, 'build-report.json'), 
  JSON.stringify(buildReport, null, 2)
);

console.log('\n🎉 Consolidated build completed successfully!');
console.log(`📊 Build report saved to: ${path.join(distPath, 'build-report.json')}`);

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
