import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    __DEV__: true, // Set to true for tests to enable jsxDEV
    'process.env.NODE_ENV': '"test"',
    'import.meta.env.VITEST': 'true',
    'import.meta.env.DEV': 'true',
    'import.meta.env.MODE': '"test"',
  },
  // Ensure JSX runtime is available
  esbuild: {
    jsx: 'classic', // Use classic JSX transform
    jsxImportSource: 'react',
    jsxDev: false, // Disable jsxDev in tests
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/minimal-setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true
      }
    },
    css: true,
    pool: 'forks', // Use forks pool to avoid cloning issues
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to prevent memory issues
      }
    },
    testTimeout: 10000, // Reduced timeout for faster test execution
    hookTimeout: 5000,
    teardownTimeout: 5000,
    isolate: false, // Disable isolation for faster tests
    // Force garbage collection after each test
    sequence: {
      hooks: 'parallel'
    },
    // Limit concurrent tests to prevent memory issues
    maxConcurrency: 1, // Reduce concurrency to prevent race conditions
    // Exclude problematic test files
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/*.jest.test.*',
      '**/*.jest.spec.*'
    ],
    // Updated reporter configuration to fix deprecated 'basic' reporter
    reporters: [
      [
        "default",
        {
          "summary": false
        }
      ]
    ],
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
    dedupe: ['react', 'react-dom'],
  },
  // Ensure proper JSX handling in tests
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      jsxDev: true, // Enable jsxDev in tests
    }
  },
});
