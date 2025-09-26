import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Optimized Vite configuration for production
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
    react({
      jsxImportSource: 'react',
      jsxRuntime: 'automatic',
    }),
  ],
  
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
    
    // Enhanced terser options for better compression
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.warn'] : [],
        passes: 3, // Increased passes for better compression
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
      },
      mangle: {
        safari10: true,
      },
    },
    
    rollupOptions: {
      maxParallelFileOps: 2,
      cache: true,
      
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      
      external: [],
      
      onwarn(warning, warn) {
        // Suppress specific warnings in production
        if (mode === 'production') {
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        }
        warn(warning);
      },
      
      output: {
        // Optimized chunk splitting strategy
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/react-dom/')) return 'react-dom';
          
          // Router and state management
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('@tanstack/react-query')) return 'query';
          
          // Supabase (critical for app functionality)
          if (id.includes('@supabase/supabase-js')) return 'supabase';
          
          // UI Components - split by usage frequency
          if (id.includes('@radix-ui')) {
            // Core UI components used on every page
            if (id.includes('dialog') || id.includes('dropdown-menu') || id.includes('popover') || id.includes('button')) {
              return 'radix-core';
            }
            // Less frequently used components
            return 'radix-ui';
          }
          
          // UI Utilities (small but frequently used)
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'ui-utils';
          }
          
          // Forms and validation (lazy load)
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform/resolvers')) {
            return 'forms';
          }
          
          // Animation libraries (lazy load)
          if (id.includes('framer-motion')) return 'animation';
          
          // Payment processing (lazy load)
          if (id.includes('@stripe') || id.includes('stripe')) return 'payments';
          
          // Icons (lazy load)
          if (id.includes('lucide-react')) return 'icons';
          
          // Charts and visualization (lazy load)
          if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) {
            return 'charts';
          }
          
          // Testing libraries (exclude from production)
          if (id.includes('@testing-library') || id.includes('vitest') || id.includes('@vitest')) {
            return null; // Don't include in production bundle
          }
          
          // Large vendor libraries
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
        
        format: 'es',
        exports: 'named',
      },
    },
    
    chunkSizeWarningLimit: 1000, // Reduced from 1500
    minify: 'esbuild',
    
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      keepNames: false,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      legalComments: 'none',
      treeShaking: true,
      target: 'es2015',
    },
    
    sourcemap: mode === 'development',
    reportCompressedSize: true,
    copyPublicDir: true,
    assetsInlineLimit: 2048, // Reduced from 4096 for better caching
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
}));
