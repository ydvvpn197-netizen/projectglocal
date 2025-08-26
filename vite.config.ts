import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base URL for production deployment - use relative paths for GitHub Pages
  base: mode === 'production' ? './' : '/',
  
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
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://theglocal.in https://*.theglocal.in http://localhost:* http://127.0.0.1:*; " +
        "frame-ancestors 'none';"
    }
  },
  plugins: [
    react(),
  ],
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
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // CRITICAL FIX: Keep React and all React-related code in main bundle
          if (id.includes('node_modules')) {
            // ALWAYS keep React, React-DOM, React Router, and ANY React-dependent libraries in main bundle
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router-dom') ||
                id.includes('@tanstack/react-query') ||
                id.includes('next-themes') ||
                id.includes('react-hook-form') ||
                id.includes('@hookform/resolvers') ||
                id.includes('sonner') ||
                id.includes('@radix-ui') ||
                id.includes('lucide-react') ||
                id.includes('clsx') ||
                id.includes('class-variance-authority') ||
                id.includes('tailwind-merge') ||
                id.includes('date-fns') ||
                id.includes('react-day-picker') ||
                id.includes('recharts') ||
                id.includes('@floating-ui') ||
                id.includes('@tanstack/react-query') ||
                id.includes('@remix-run/router') ||
                id.includes('useLayoutEffect') ||
                id.includes('useEffect') ||
                id.includes('useState') ||
                id.includes('createContext') ||
                id.includes('createRoot')) {
              return undefined; // Keep in main bundle - CRITICAL for React initialization
            }
            
            // Supabase gets its own chunk
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            
            // All other node_modules go to a single vendor chunk
            return 'vendor';
          }
          
          // Route-based chunks (simplified)
          if (id.includes('src/pages/')) {
            return 'pages';
          }
          
          // Component chunks (simplified)
          if (id.includes('src/components/')) {
            return 'components';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        // Prevent variable hoisting issues that can cause React initialization problems
        hoist_funs: false,
        hoist_vars: false,
        hoist_props: false,
        // Prevent function inlining that might break React initialization
        inline: false,
      },
      mangle: {
        // Prevent mangling of React-related variables
        reserved: ['React', 'createRoot', 'render', 'createContext', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer', 'useContext', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue', 'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore', 'useInsertionEffect']
      }
    },
    sourcemap: mode === 'development',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'next-themes',
      'react-hook-form',
      '@hookform/resolvers',
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
    force: true, // Force re-optimization to ensure React is properly loaded
    esbuildOptions: {
      // Ensure React is properly handled
      jsx: 'automatic',
    }
  },
}));
