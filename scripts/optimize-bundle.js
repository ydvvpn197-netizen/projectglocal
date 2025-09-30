#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Bundle optimization script
console.log('🚀 Starting bundle optimization...');

// 1. Create optimized Vite config
const optimizedConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Content-Security-Policy': 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://theglocal.in https://*.theglocal.in https://ydvvpn197-netizen.github.io http://localhost:* http://127.0.0.1:*; " +
        "frame-ancestors 'none';"
    }
  },
  plugins: [
    react(),
    process.env.ANALYZE && visualizer({
      filename: 'bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: '',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      maxParallelFileOps: 2,
      cache: true,
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      external: [],
      onwarn(warning, warn) {
        if (mode === 'production' && warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        if (mode === 'production' && warning.code === 'UNUSED_EXTERNAL_IMPORT') {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          // Core React
          if (id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/react-dom/')) return 'react-dom';
          
          // Router and state management
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('@tanstack/react-query')) return 'query';
          
          // Supabase
          if (id.includes('@supabase/supabase-js')) return 'supabase';
          
          // Consolidated Dashboard Components
          if (id.includes('src/pages/ConsolidatedDashboard') || 
              id.includes('src/pages/ConsolidatedFeed') || 
              id.includes('src/pages/ConsolidatedIndex')) {
            return 'consolidated-pages';
          }
          
          // Layout Components
          if (id.includes('src/components/MainLayout') || 
              id.includes('src/components/ResponsiveLayout') ||
              id.includes('src/components/layout/')) {
            return 'layout-components';
          }
          
          // UI Components
          if (id.includes('@radix-ui')) {
            if (id.includes('dialog') || id.includes('dropdown-menu') || id.includes('popover')) {
              return 'radix-core';
            }
            return 'radix-ui';
          }
          
          // UI Utilities
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'ui-utils';
          }
          
          // Forms and validation
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'forms';
          }
          
          // Animation (lazy load)
          if (id.includes('framer-motion')) return 'animation';
          
          // Stripe payments (lazy load)
          if (id.includes('@stripe')) return 'payments';
          
          // Icons (lazy load)
          if (id.includes('lucide-react')) return 'icons';
          
          // Large vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return \`js/\${facadeModuleId}-[hash].js\`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\\.(css)$/.test(assetInfo.name)) {
            return \`css/[name]-[hash].\${ext}\`;
          }
          if (/\\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name)) {
            return \`images/[name]-[hash].\${ext}\`;
          }
          if (/\\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
            return \`fonts/[name]-[hash].\${ext}\`;
          }
          return \`assets/[name]-[hash].\${ext}\`;
        },
        format: 'es',
        exports: 'named',
      },
    },
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      keepNames: false,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      legalComments: 'none',
      treeShaking: true,
    },
    sourcemap: mode === 'development',
    reportCompressedSize: true,
    copyPublicDir: true,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'next-themes',
      'react-hook-form',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@supabase/supabase-js',
      'date-fns',
      'lucide-react',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
    ],
    force: true,
    esbuildOptions: {
      jsx: 'automatic',
    }
  },
  logLevel: mode === 'production' ? 'error' : 'info',
}));`;

// Write optimized config
fs.writeFileSync('vite.config.optimized.ts', optimizedConfig);
console.log('✅ Created optimized Vite configuration');

// 2. Create lazy loading components
const lazyComponents = `
// Lazy loading components for better performance
import { lazy } from 'react';

// Lazy load heavy components
export const LazyDashboard = lazy(() => import('@/pages/ConsolidatedDashboard'));
export const LazyFeed = lazy(() => import('@/pages/ConsolidatedFeed'));
export const LazyIndex = lazy(() => import('@/pages/ConsolidatedIndex'));

// Lazy load UI components
export const LazyDialog = lazy(() => import('@/components/ui/dialog'));
export const LazyDropdownMenu = lazy(() => import('@/components/ui/dropdown-menu'));
export const LazyPopover = lazy(() => import('@/components/ui/popover'));

// Lazy load forms
export const LazyForm = lazy(() => import('@/components/ui/form'));
export const LazyInput = lazy(() => import('@/components/ui/input'));
export const LazyTextarea = lazy(() => import('@/components/ui/textarea'));

// Lazy load animations
export const LazyMotion = lazy(() => import('framer-motion'));

// Lazy load payments
export const LazyStripe = lazy(() => import('@stripe/stripe-js'));
`;

fs.writeFileSync('src/components/LazyComponents.ts', lazyComponents);
console.log('✅ Created lazy loading components');

// 3. Create bundle analysis script
const bundleAnalysisScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📊 Running bundle analysis...');

try {
  // Run build with analysis
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  
  // Check if analysis file was created
  if (fs.existsSync('bundle-analysis.html')) {
    console.log('✅ Bundle analysis completed');
    console.log('📁 Analysis file: bundle-analysis.html');
    console.log('🌐 Open the file in your browser to view the analysis');
  } else {
    console.log('⚠️  Bundle analysis file not found');
  }
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}`;

fs.writeFileSync('scripts/analyze-bundle.js', bundleAnalysisScript);
fs.chmodSync('scripts/analyze-bundle.js', '755');
console.log('✅ Created bundle analysis script');

// 4. Create performance monitoring
const performanceMonitoring = `// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(\`\${componentName} render time: \${end - start}ms\`);
  },

  // Measure API call time
  measureApiCall: async (apiName: string, apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      console.log(\`\${apiName} API call time: \${end - start}ms\`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(\`\${apiName} API call failed after \${end - start}ms:\`, error);
      throw error;
    }
  },

  // Measure bundle size
  measureBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Bundle load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
    }
  }
};`;

fs.writeFileSync('src/utils/performanceMonitor.ts', performanceMonitoring);
console.log('✅ Created performance monitoring utilities');

console.log('\n🎉 Bundle optimization completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run build to test the optimized configuration');
console.log('2. Run: node scripts/analyze-bundle.js to analyze bundle size');
console.log('3. Check bundle-analysis.html for detailed analysis');
console.log('4. Use lazy loading components in your app for better performance');