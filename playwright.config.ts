import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'https://sitio-luz.vercel.app';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	reporter: [
		['html', { open: 'never', outputFolder: 'playwright-report' }],
		['github']
	],
	use: {
		baseURL: BASE_URL,
		headless: true,
		actionTimeout: 15_000,
		navigationTimeout: 20_000,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
		// Habilitar si se desea
		// , { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
		// , { name: 'webkit', use: { ...devices['Desktop Safari'] } }
	]
});


