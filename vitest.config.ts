import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      '__tests__/**/*.test.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}',
      'src/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'node_modules/**',
      'tests/e2e/**',
      'e2e/**',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/workers/**', 'src/components/**', 'src/hooks/**', 'src/app/**'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts']
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
