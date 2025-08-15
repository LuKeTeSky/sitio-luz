import { expect, Page } from '@playwright/test';

export async function apiLogin(page: Page, password?: string) {
  const pass = password || process.env.ADMIN_PASSWORD;
  if (!pass) throw new Error('ADMIN_PASSWORD no definido para apiLogin');
  const resp = await page.request.post('/login', { form: { password: pass } });
  expect(resp.ok()).toBeTruthy();
}


