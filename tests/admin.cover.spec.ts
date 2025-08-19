import { test, expect } from '@playwright/test';
import { apiLogin } from './utils/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('Admin - Portada (cover)', () => {
  test('Marcar portada persiste', async ({ page }) => {
    if (!ADMIN_PASSWORD) {
      test.skip(true, 'ADMIN_PASSWORD no configurado en CI/entorno');
    }
    test.slow();
    await apiLogin(page, ADMIN_PASSWORD);
    await page.goto('/admin');
    await expect(page).toHaveURL(/admin/);

    // Evitar depender del render de la galería: elegir una imagen por API y marcar portada por API
    const imgsRes = await page.request.get('/api/images');
    const imgs = await imgsRes.json();
    const picked = Array.isArray(imgs) && imgs[0] && imgs[0].filename;
    expect(Boolean(picked)).toBeTruthy();
    const setRes = await page.request.post('/api/cover', { data: { coverImages: [picked] } });
    expect(setRes.ok()).toBeTruthy();
    await page.waitForTimeout(300);

    await expect.poll(async () => {
      const r = await page.request.get('/api/cover');
      const j = await r.json();
      return (Array.isArray(j.coverImages) ? j.coverImages.length : 0);
    }, { timeout: 20000, intervals: [500,1000] }).toBeGreaterThan(0);

    await page.getByRole('link', { name: /portada/i }).click();
    // Empujar varias actualizaciones del DOM de portada
    await page.evaluate(async () => {
      const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));
      for (let i=0;i<5;i++) {
        if (window['updateCoverSection']) await window['updateCoverSection']();
        await wait(300);
      }
    });

    const coverItems = page.locator('.cover-item img');
    const emptyState = page.locator('#cover-empty');
    // Esperar a que aparezcan items o desaparezca el vacío
    await expect.poll(async () => {
      const count = await coverItems.count();
      const emptyVisible = await emptyState.isVisible().catch(()=>false);
      return (count > 0 || emptyVisible === false) ? 1 : 0;
    }, { timeout: 25000, intervals: [500,1000] }).toBeGreaterThan(0);
    if ((await coverItems.count()) > 0) {
      await expect(coverItems.first()).toBeVisible({ timeout: 10000 });
    }

    // Persistencia tras refresh (solo verificar vía API + UI portada)
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect.poll(async () => {
      const r = await page.request.get('/api/cover');
      const j = await r.json();
      return (Array.isArray(j.coverImages) ? j.coverImages.length : 0);
    }, { timeout: 20000, intervals: [500,1000] }).toBeGreaterThan(0);
    await page.getByRole('link', { name: /portada/i }).click();
    await page.evaluate(async () => {
      const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));
      for (let i=0;i<5;i++) {
        if (window['updateCoverSection']) await window['updateCoverSection']();
        await wait(300);
      }
    });
    await expect.poll(async () => await coverItems.count(), { timeout: 25000, intervals: [500,1000] }).toBeGreaterThan(0);
    await expect(coverItems.first()).toBeVisible({ timeout: 10000 });
  });
});


