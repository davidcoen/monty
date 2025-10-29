// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: ['**/*.spec.ts'],     // only .spec.ts
  testIgnore: [
    '**/__tests__/**',             // ignore Vitest folders
    '**/*.test.ts',                // ignore *.test.ts (Vitest)
    'packages/**/__tests__/**',    // monorepo safety
  ],
  reporter: 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: true },
});