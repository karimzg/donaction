import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project - runs first to authenticate and capture token
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Main tests - depend on setup
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../',
      url: 'http://localhost:4300',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
