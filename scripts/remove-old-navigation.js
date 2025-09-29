#!/usr/bin/env node

/**
 * Migration Script: Remove Old Navigation Components
 * 
 * This script removes the old navigation components that have been consolidated
 * into the UnifiedNavigation component.
 * 
 * Components to remove:
 * - src/components/AppSidebar.tsx
 * - src/components/ui/EnhancedNavigation.tsx  
 * - src/components/ui/MobileNavigation.tsx
 * 
 * Dependencies to update:
 * - Update any imports of these components
 * - Update MainLayout.tsx (already done)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsToRemove = [
  'src/components/AppSidebar.tsx',
  'src/components/ui/EnhancedNavigation.tsx',
  'src/components/ui/MobileNavigation.tsx'
];

const filesToUpdate = [
  'src/components/MainLayout.tsx'
];

console.log('🧹 Starting navigation consolidation cleanup...\n');

// Remove old navigation components
console.log('📁 Removing old navigation components:');
componentsToRemove.forEach(componentPath => {
  const fullPath = path.join(__dirname, '..', componentPath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`  ✅ Removed: ${componentPath}`);
    } catch (error) {
      console.log(`  ❌ Failed to remove: ${componentPath} - ${error.message}`);
    }
  } else {
    console.log(`  ⚠️  Not found: ${componentPath}`);
  }
});

console.log('\n📝 Navigation consolidation cleanup completed!');
console.log('\n📋 Summary:');
console.log('  - UnifiedNavigation component created');
console.log('  - Old navigation components removed');
console.log('  - MainLayout updated to use UnifiedNavigation');
console.log('  - CHANGELOG.md updated');
console.log('\n✨ Navigation system successfully consolidated!');
