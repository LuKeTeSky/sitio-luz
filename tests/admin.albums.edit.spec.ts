import { test, expect } from '@playwright/test';
import { apiLogin } from './utils/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('Admin - Álbumes (edición básica)', () => {
  test('Crear y editar un álbum (nombre y slug) persiste', async ({ page }) => {
    if (!ADMIN_PASSWORD) test.skip(true, 'ADMIN_PASSWORD no configurado');
    test.slow();

    await apiLogin(page, ADMIN_PASSWORD);
    await page.goto('/admin');

    // Crear álbum con sufijo único para no dejar residuos
    const uniqueName = `RC Edit ${Date.now()}`;
    await page.getByRole('button', { name: /nuevo álbum/i }).click();
    await page.getByLabel(/nombre del álbum/i).fill(uniqueName);
    await page.getByLabel(/descripción/i).fill('desc original');
    await page.getByRole('button', { name: /guardar/i }).click();
    await expect(page.locator('#albums-list .album-item')).toContainText(uniqueName);

    // Abrir modal de edición usando el botón de editar
    const created = page.locator('#albums-list .album-item').filter({ hasText: uniqueName });
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

    // Limpieza: eliminar el álbum creado para no dejarlo en producción
    try {
      const delRes = await page.request.delete(`/api/albums/${found.id}`);
      expect(delRes.ok()).toBeTruthy();
    } catch (_) { /* ignorar en caso de permisos o fallos transitorios */ }
  });
});


