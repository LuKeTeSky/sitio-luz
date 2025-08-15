import { test, expect } from '@playwright/test';
import { apiLogin } from './utils/auth';

test.describe('Admin - Álbumes', () => {
  test('Crear y ver álbum', async ({ page }) => {
    if (!process.env.ADMIN_PASSWORD) test.skip(true, 'ADMIN_PASSWORD requerido');
    await apiLogin(page);
    await page.goto('/admin');

    // Abrir modal y crear
    await page.getByRole('button', { name: /nuevo álbum/i }).click();
    await page.getByLabel(/nombre del álbum/i).fill('QA Album');
    await page.getByRole('button', { name: /guardar/i }).click();

    // Ver en sidebar
    await expect(page.getByText('QA Album')).toBeVisible();
  });
});


