import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : 'html',
  timeout: 20_000,
  expect: {
    // Increase timeout in CI (slower runners)
    timeout: process.env.CI ? 10_000 : 5_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npm run dev:e2e',
    url: process.env.E2E_BASE_URL || 'http://localhost:3101',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
