import { test, expect } from '@playwright/test';
import { apiLogin } from './utils/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('Admin - Álbumes (edición básica)', () => {
  test('Crear y editar un álbum (nombre y slug) persiste', async ({ page }) => {
    if (!ADMIN_PASSWORD) test.skip(true, 'ADMIN_PASSWORD no configurado');
    test.slow();

    await apiLogin(page, ADMIN_PASSWORD);
    await page.goto('/admin');

    // Crear álbum
    await page.getByRole('button', { name: /nuevo álbum/i }).click();
    await page.getByLabel(/nombre del álbum/i).fill('RC Edit Test');
    await page.getByLabel(/descripción/i).fill('desc original');
    await page.getByRole('button', { name: /guardar/i }).click();
    await expect(page.locator('#albums-list .album-item')).toContainText('RC Edit Test');

    // Abrir modal de edición usando el botón de editar
    const created = page.locator('#albums-list .album-item').filter({ hasText: 'RC Edit Test' });
    await created.locator('.album-edit-btn').click();

    // Editar nombre y slug
    await page.getByLabel(/nombre del álbum/i).fill('RC Editado');
    const slug = page.getByLabel(/slug/i);
    await slug.fill('rc-editado');
    await page.getByRole('button', { name: /guardar/i }).click();

    // Verificar en UI
    await expect(page.locator('#albums-list .album-item')).toContainText('RC Editado');

    // Verificar por API que exista con slug actualizado
    const res = await page.request.get('/api/albums');
    const list = await res.json();
    const found = Array.isArray(list) && list.find((a: any) => a.name === 'RC Editado' && a.slug === 'rc-editado');
    expect(Boolean(found)).toBeTruthy();
  });
});


