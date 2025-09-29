import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: 'esbuild',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
          'supabase': ['@supabase/supabase-js'],
          'radix-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover'
          ],
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'animation': ['framer-motion'],
          'payments': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'icons': ['lucide-react'],
          'charts': ['chart.js', 'react-chartjs-2', 'recharts']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop();
          if (ext === 'css') return 'css/[name]-[hash].[ext]';
          if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext)) {
            return 'images/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      '@tanstack/react-query', '@supabase/supabase-js'
    ]
  }
}));