import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1,
        minForks: 1
      }
    },
    isolate: true,
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 5000, // Reduced to 5 seconds
    hookTimeout: 5000, // Reduced to 5 seconds
    teardownTimeout: 3000, // Reduced to 3 seconds
    maxConcurrency: 1, // Run tests sequentially
    sequence: {
      concurrent: false, // Disable concurrent execution
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.config.ts'
      ]
    },
    // Add optimizations to reduce file usage
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    // Reduce file watching
    watch: false,
    // Optimize for fewer file operations
    transformMode: {
      web: [/\.[jt]sx?$/]
    }
  },
  // Add Vite optimizations
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      external: []
    }
  }
})
