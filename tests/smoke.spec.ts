import { test, expect } from '@playwright/test';

test.describe('Sitio LUZ - smoke', () => {
  test('Home carga y muestra navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Álbumes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Galería' })).toBeVisible();
  });

  test('Galería pública renderiza imágenes', async ({ page }) => {
    await page.goto('/gallery');
    const items = page.locator('.gallery-item img');
    await expect(items.first()).toBeVisible({ timeout: 15000 });
  });

  test('Admin login rechaza credenciales vacías', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /ingresar|login|acceder/i }).click();
    // Debe seguir en /login o devolver 401 JSON si fuera XHR
    await expect(page).toHaveURL(/login/);
  });
});


