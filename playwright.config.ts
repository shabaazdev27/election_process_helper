import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /**
   * Retry once locally and twice on CI.
   * The single local retry catches transient hydration races without masking
   * real failures — a genuine bug will fail on both attempts.
   */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI for deterministic ordering. */
  workers: process.env.CI ? 1 : 4,

  /* Reporter */
  reporter: [['html'], ['list']],

  /* Shared settings for all projects */
  timeout: 60_000,
  use: {
    /* Base URL */
    baseURL: 'http://localhost:3000',

    /**
     * Action timeout: how long Playwright waits for a single action
     * (click, fill, etc.) before failing.  Default is 0 (no limit).
     * Setting to 15 s catches hung interactions early without being too tight.
     */
    actionTimeout: 15_000,

    /* Collect trace on the first retry to aid debugging. */
    trace: 'on-first-retry',

    /* Screenshots only on failure */
    screenshot: 'only-on-failure',

    /* Navigation timeout */
    navigationTimeout: 60_000,
  },

  /* Configure projects for major browsers */
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
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run the local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
