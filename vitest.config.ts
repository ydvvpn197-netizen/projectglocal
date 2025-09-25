import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/minimal-setup.ts'],
    css: true,
    pool: 'forks', // Changed from threads to forks to prevent memory leaks
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to prevent memory issues
      }
    },
    testTimeout: 30000, // Increased timeout for async operations
    hookTimeout: 30000,
    teardownTimeout: 10000,
    isolate: false, // Disable isolation for faster tests
    // Force garbage collection after each test
    sequence: {
      hooks: 'parallel'
    },
    // Limit concurrent tests to prevent memory issues
    maxConcurrency: 1, // Reduce concurrency to prevent race conditions
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        'scripts/',
        'supabase/',
        'docs/',
        '*.md'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
