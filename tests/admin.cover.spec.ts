import { test, expect } from '@playwright/test';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

test.describe('Admin - Portada (cover)', () => {
  test('Marcar portada persiste', async ({ page }) => {
    test.slow();
    // Login
    await page.goto('/login');
    await page.getByLabel(/contraseña|password/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar|acceder|login/i }).click();
    await expect(page).toHaveURL(/admin/);

    // Marcar primera imagen como portada
    const firstCard = page.locator('#gallery .gallery-item').first();
    await firstCard.hover();
    await firstCard.locator('.gallery-action-btn.cover-btn').click();

    // Ir a sección portada y verificar que haya al menos 1 elemento
    await page.getByRole('link', { name: /portada/i }).click();
    const coverItems = page.locator('.cover-item img');
    await expect(coverItems.first()).toBeVisible();

    // Refrescar y verificar que persiste
    await page.reload();
    await page.getByRole('link', { name: /portada/i }).click();
    await expect(coverItems.first()).toBeVisible();
  });
});


