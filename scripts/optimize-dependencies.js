#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analyzing dependencies for optimization...\n');

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Dependencies to potentially remove (based on bundle analysis)
const potentiallyUnusedDeps = [
  'autoprefixer', // Should be in devDependencies
  'postcss', // Should be in devDependencies
  'dotenv', // Only needed in build scripts
];

// Dependencies that are likely unused based on common patterns
const likelyUnusedDeps = [
  'input-otp', // If not using OTP functionality
  'vaul', // If not using drawer components
  'embla-carousel-react', // If not using carousels
  'react-resizable-panels', // If not using resizable panels
  'cmdk', // If not using command palette
  'sonner', // If not using toast notifications
  'next-themes', // If not using theme switching
];

// Check if dependencies are actually used
function checkDependencyUsage(depName) {
  try {
    const result = execSync(`grep -r "from ['\"]${depName}['\"]" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Check for import patterns
function checkImportPatterns(depName) {
  try {
    const patterns = [
      `import.*${depName}`,
      `require.*${depName}`,
      `from.*${depName}`,
      `@${depName}`,
    ];
    
    for (const pattern of patterns) {
      try {
        const result = execSync(`grep -r "${pattern}" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        if (result.trim().length > 0) {
          return true;
        }
      } catch (error) {
        // Pattern not found, continue
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Analyze dependencies
const analysis = {
  totalDependencies: Object.keys(packageJson.dependencies || {}).length,
  totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length,
  unusedDependencies: [],
  moveToDevDependencies: [],
  recommendations: [],
};

console.log('📊 Current dependency analysis:');
console.log(`- Production dependencies: ${analysis.totalDependencies}`);
console.log(`- Development dependencies: ${analysis.totalDevDependencies}\n`);

// Check each dependency
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

for (const [depName, version] of Object.entries(allDeps)) {
  const isUsed = checkDependencyUsage(depName) || checkImportPatterns(depName);
  
  if (!isUsed) {
    if (packageJson.dependencies && packageJson.dependencies[depName]) {
      analysis.unusedDependencies.push(depName);
    }
  }
  
  // Check if production deps should be dev deps
  if (packageJson.dependencies && packageJson.dependencies[depName]) {
    if (potentiallyUnusedDeps.includes(depName)) {
      analysis.moveToDevDependencies.push(depName);
    }
  }
}

// Generate recommendations
if (analysis.unusedDependencies.length > 0) {
  analysis.recommendations.push('Remove unused dependencies:');
  analysis.unusedDependencies.forEach(dep => {
    analysis.recommendations.push(`  - ${dep}`);
  });
}

if (analysis.moveToDevDependencies.length > 0) {
  analysis.recommendations.push('\nMove to devDependencies:');
  analysis.moveToDevDependencies.forEach(dep => {
    analysis.recommendations.push(`  - ${dep}`);
  });
}

// Bundle size optimization recommendations
analysis.recommendations.push('\nBundle optimization recommendations:');
analysis.recommendations.push('1. Use dynamic imports for heavy components');
analysis.recommendations.push('2. Implement code splitting for routes');
analysis.recommendations.push('3. Lazy load non-critical components');
analysis.recommendations.push('4. Use tree shaking for unused code');
analysis.recommendations.push('5. Optimize images and assets');

// Output results
console.log('🎯 Optimization recommendations:\n');
analysis.recommendations.forEach(rec => console.log(rec));

// Generate optimization script
const optimizationScript = `
# Dependency Optimization Script
# Run this to apply optimizations

echo "🧹 Removing unused dependencies..."

# Remove unused dependencies
${analysis.unusedDependencies.map(dep => `npm uninstall ${dep}`).join('\n')}

# Move to devDependencies
${analysis.moveToDevDependencies.map(dep => `npm uninstall ${dep} && npm install --save-dev ${dep}`).join('\n')}

echo "✅ Dependencies optimized!"
echo "📦 Run 'npm run analyze:bundle' to check bundle size"
`;

fs.writeFileSync('scripts/apply-dependency-optimizations.sh', optimizationScript);
fs.chmodSync('scripts/apply-dependency-optimizations.sh', '755');

console.log('\n📝 Generated optimization script: scripts/apply-dependency-optimizations.sh');
console.log('🚀 Run the script to apply optimizations automatically');

// Generate package.json optimizations
const optimizedPackageJson = { ...packageJson };

// Remove unused dependencies
if (analysis.unusedDependencies.length > 0) {
  analysis.unusedDependencies.forEach(dep => {
    if (optimizedPackageJson.dependencies) {
      delete optimizedPackageJson.dependencies[dep];
    }
  });
}

// Move to devDependencies
if (analysis.moveToDevDependencies.length > 0) {
  if (!optimizedPackageJson.devDependencies) {
    optimizedPackageJson.devDependencies = {};
  }
  
  analysis.moveToDevDependencies.forEach(dep => {
    if (optimizedPackageJson.dependencies && optimizedPackageJson.dependencies[dep]) {
      optimizedPackageJson.devDependencies[dep] = optimizedPackageJson.dependencies[dep];
      delete optimizedPackageJson.dependencies[dep];
    }
  });
}

// Write optimized package.json
fs.writeFileSync('package.optimized.json', JSON.stringify(optimizedPackageJson, null, 2));

console.log('\n📄 Generated optimized package.json: package.optimized.json');
console.log('💡 Review the changes before applying them');

console.log('\n🎉 Dependency analysis complete!');
console.log('📊 Summary:');
console.log(`- Unused dependencies found: ${analysis.unusedDependencies.length}`);
console.log(`- Dependencies to move to dev: ${analysis.moveToDevDependencies.length}`);
console.log(`- Potential bundle size reduction: ~${(analysis.unusedDependencies.length + analysis.moveToDevDependencies.length) * 50}KB`);
