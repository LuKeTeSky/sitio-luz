import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const isLocal = /localhost|127\.0\.0\.1/.test(baseURL);

export default defineConfig({
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: isLocal
    ? {
        command: 'npm start',
        port: 3000,
        timeout: 120_000,
        reuseExistingServer: true
      }
    : undefined
});

