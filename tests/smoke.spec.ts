import { test, expect } from '@playwright/test';

test.describe('Sitio LUZ - smoke', () => {
  test('Home carga y muestra navbar', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Álbumes', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Galería', exact: true })).toBeVisible();
  });

  test('Galería pública renderiza imágenes', async ({ page, request }) => {
    await page.goto('/gallery');
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    const grid = page.locator('.gallery-grid');
    await expect(grid).toHaveCount(1);
    const api = await request.get('/api/images');
    const images = api.ok() ? await api.json() : [];
    if (Array.isArray(images) && images.length > 0) {
      const items = page.locator('.gallery-grid .gallery-item img');
      await expect(items.first()).toBeVisible({ timeout: 20000 });
    } else {
      await expect(page.locator('.gallery-grid .gallery-item')).toHaveCount(0);
    }
  });

  test('Admin login rechaza credenciales vacías', async ({ page }) => {
    await page.goto('/login');
    // Si no hay label, asegurar por tipo
    await expect(page.locator('form')).toBeVisible();
    await page.locator('form button[type="submit"]').first().click({ timeout: 15000 });
    await expect(page).toHaveURL(/login/);
  });
});


