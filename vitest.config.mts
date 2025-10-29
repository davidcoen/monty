import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
      'packages/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
    ],
    exclude: [
      'tests/e2e/**',
      '**/*.spec.{ts,tsx,js,mjs,cjs,mts,cts}', // keep Playwright specs out
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
    ],
    environment: 'node',
  },
});
