import { test, expect } from '@playwright/test';
import { apiLogin } from './utils/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('Admin - Portada (cover)', () => {
  test('Marcar portada persiste', async ({ page }) => {
    if (!ADMIN_PASSWORD) {
      test.skip(true, 'ADMIN_PASSWORD no configurado en CI/entorno');
    }
    test.slow();
    // Login por API para evitar flakiness de UI
    await apiLogin(page, ADMIN_PASSWORD);
    await page.goto('/admin');
    await expect(page).toHaveURL(/admin/);

    // Marcar primera imagen como portada
    const firstCard = page.locator('#gallery .gallery-item').first();
    await firstCard.hover();
    await firstCard.locator('.gallery-action-btn.cover-btn').click();
    // Esperar notificación breve para confirmar acción
    await page.waitForTimeout(200);

    // Ir a sección portada y verificar que haya al menos 1 elemento
    // Validar por API que haya al menos una portada antes de chequear el DOM
    await expect.poll(async () => {
      const r = await page.request.get('/api/cover');
      const j = await r.json();
      return (Array.isArray(j.coverImages) ? j.coverImages.length : 0);
    }, { timeout: 20000, intervals: [500,1000] }).toBeGreaterThan(0);

    await page.getByRole('link', { name: /portada/i }).click();
    const coverItems = page.locator('.cover-item img');
    await expect(coverItems.first()).toBeVisible({ timeout: 10000 });

    // Refrescar y verificar que persiste
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect.poll(async () => await page.locator('#gallery .gallery-item').count(), { timeout: 15000 }).toBeGreaterThan(0);
    await expect.poll(async () => {
      const r = await page.request.get('/api/cover');
      const j = await r.json();
      return (Array.isArray(j.coverImages) ? j.coverImages.length : 0);
    }, { timeout: 20000, intervals: [500,1000] }).toBeGreaterThan(0);
    await page.getByRole('link', { name: /portada/i }).click();
    await expect(coverItems.first()).toBeVisible({ timeout: 10000 });
  });
});


