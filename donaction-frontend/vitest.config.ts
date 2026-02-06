import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    // Enable global test APIs (describe, it, expect) without imports
    globals: true,
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.config.{ts,js}',
      ],
      // TODO: Add thresholds when coverage is meaningful (target: 80%)
    },
  },
  resolve: {
    alias: {
      '@/components': resolve(__dirname, './src/layouts/components'),
      '@/partials': resolve(__dirname, './src/layouts/partials'),
      '@/helpers': resolve(__dirname, './src/layouts/helpers'),
      '@/shortcodes': resolve(__dirname, './src/layouts/shortcodes'),
      '@/shapes': resolve(__dirname, './src/shapes'),
      '@': resolve(__dirname, './src'),
    },
  },
});
