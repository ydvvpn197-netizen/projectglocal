import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base URL for production deployment - Custom domain deployment
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
  ],
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'], // Prevent duplicate React instances
  },
  build: {
    // Ensure build is reliable
    target: 'es2015',
    outDir: 'dist',
    assetsDir: '', // Remove this to use default structure
    emptyOutDir: true,
    cssCodeSplit: true,
    // Memory optimization settings
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
        passes: 2,
      },
    },
    // Increase memory limit for build
    rollupOptions: {
      maxParallelFileOps: 2, // Reduce parallel operations
      cache: true, // Re-enable cache for better performance
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      onwarn(warning, warn) {
        // Suppress warnings about circular dependencies in production
        if (mode === 'production' && warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        // Suppress warnings about unused exports in production
        if (mode === 'production' && warning.code === 'UNUSED_EXTERNAL_IMPORT') {
          return;
        }
        warn(warning);
      },
      output: {
        // Optimized chunk splitting for better performance
        manualChunks: (id) => {
          // Core React
          if (id.includes('react') && (id.includes('node_modules'))) {
            if (id.includes('react-dom')) return 'react-dom';
            return 'react';
          }
          
          // Router and state management
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('@tanstack/react-query')) return 'query';
          
          // Supabase
          if (id.includes('@supabase/supabase-js')) return 'supabase';
          
          // UI Components - group by usage frequency
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
          
          // Animation (lazy load framer-motion)
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
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
        // Ensure proper module handling
        format: 'es',
        exports: 'named',
      },
    },
    chunkSizeWarningLimit: 1500, // Increased to prevent warnings during build
    minify: 'esbuild',
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // Memory-optimized settings
      keepNames: false,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      legalComments: 'none',
      // Reduce memory usage
      treeShaking: true,
    },
    sourcemap: mode === 'development',
    // Performance optimizations
    reportCompressedSize: true,
    copyPublicDir: true,
    // CDN optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
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
  // Add better error handling for build failures
  logLevel: mode === 'production' ? 'error' : 'info',
}));
