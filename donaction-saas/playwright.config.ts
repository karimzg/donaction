import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : 'html',
  timeout: process.env.CI ? 30_000 : 20_000,
  expect: {
    // Increase timeout in CI (slower runners)
    timeout: process.env.CI ? 10_000 : 5_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Increase navigation timeout in CI (slower runners)
    navigationTimeout: process.env.CI ? 30_000 : 15_000,
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
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
