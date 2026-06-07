import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Config única para o Vite (dev/build) e para o Vitest (testes unitários do front-end).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/services/**/*.ts', 'src/utils/**/*.ts', 'src/pages/Login.tsx'],
    },
  },
});
