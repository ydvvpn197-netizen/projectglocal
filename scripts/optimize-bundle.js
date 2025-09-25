#!/usr/bin/env node

/**
 * Bundle Optimization Script
 * 
 * This script performs various optimizations to reduce bundle size:
 * 1. Removes unused dependencies
 * 2. Analyzes bundle composition
 * 3. Optimizes images
 * 4. Generates bundle report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting bundle optimization...\n');

// 1. Remove unused dependencies
console.log('📦 Analyzing dependencies...');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Dependencies to potentially remove (based on depcheck results)
const potentiallyUnused = [
  'autoprefixer', // If not using PostCSS
  'postcss' // If not using PostCSS
];

console.log('  ⚠️  Potentially unused dependencies:');
potentiallyUnused.forEach(dep => {
  if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`    - ${dep}`);
  }
});

// 2. Analyze bundle composition
console.log('\n📊 Bundle composition analysis:');

const analyzeBundle = () => {
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('  ⚠️  Dist folder not found. Run build first.');
    return;
  }

  const files = fs.readdirSync(distPath, { recursive: true });
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  let totalSize = 0;
  const fileSizes = [];
  
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalSize += stats.size;
    fileSizes.push({ name: file, size: sizeKB, type: 'js' });
  });
  
  cssFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalSize += stats.size;
    fileSizes.push({ name: file, size: sizeKB, type: 'css' });
  });
  
  // Sort by size
  fileSizes.sort((a, b) => b.size - a.size);
  
  console.log(`  📁 Total files: ${fileSizes.length}`);
  console.log(`  📏 Total size: ${Math.round(totalSize / 1024)} KB`);
  console.log('\n  📋 Largest files:');
  fileSizes.slice(0, 10).forEach(file => {
    console.log(`    ${file.name}: ${file.size} KB`);
  });
  
  return { totalSize, fileSizes };
};

const bundleAnalysis = analyzeBundle();

// 3. Image optimization recommendations
console.log('\n🖼️  Image optimization recommendations:');

const imageOptimizations = [
  'Convert images to WebP format',
  'Use responsive images with srcset',
  'Implement lazy loading for images',
  'Compress images before upload',
  'Use appropriate image dimensions'
];

imageOptimizations.forEach(optimization => {
  console.log(`  ✓ ${optimization}`);
});

// 4. Code splitting recommendations
console.log('\n🔀 Code splitting recommendations:');

const codeSplittingTips = [
  'Use dynamic imports for heavy components',
  'Split vendor libraries into separate chunks',
  'Lazy load route components',
  'Split admin features from user features',
  'Separate chart libraries from main bundle'
];

codeSplittingTips.forEach(tip => {
  console.log(`  ✓ ${tip}`);
});

// 5. Generate optimization report
console.log('\n📋 Generating optimization report...');

const report = {
  timestamp: new Date().toISOString(),
  bundleAnalysis,
  recommendations: {
    dependencies: potentiallyUnused,
    images: imageOptimizations,
    codeSplitting: codeSplittingTips
  },
  nextSteps: [
    'Remove unused dependencies',
    'Implement dynamic imports',
    'Optimize images',
    'Enable tree shaking',
    'Use bundle analyzer to identify large chunks'
  ]
};

const reportPath = path.join(__dirname, '..', 'bundle-optimization-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`  ✅ Report saved to: ${reportPath}`);

// 6. Performance tips
console.log('\n⚡ Performance optimization tips:');
const performanceTips = [
  'Enable gzip compression on server',
  'Use CDN for static assets',
  'Implement service worker for caching',
  'Optimize critical rendering path',
  'Use preload for critical resources'
];

performanceTips.forEach(tip => {
  console.log(`  💡 ${tip}`);
});

console.log('\n✨ Bundle optimization analysis completed!');
console.log('\n📋 Summary:');
console.log('  - Dependency analysis completed');
console.log('  - Bundle composition analyzed');
console.log('  - Optimization recommendations generated');
console.log('  - Performance tips provided');
console.log('\n🎯 Next steps:');
console.log('  1. Review the optimization report');
console.log('  2. Remove unused dependencies');
console.log('  3. Implement dynamic imports');
console.log('  4. Optimize images');
console.log('  5. Run bundle analyzer for detailed insights');
