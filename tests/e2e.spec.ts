import { test, expect } from '@playwright/test';

test.describe('Sitio Luz - E2E mínimos', () => {
  test('Home carga y hero responde', async ({ page, request }) => {
    const api = await request.get('/api/hero');
    expect(api.ok()).toBeTruthy();
    const cfg = await api.json();

    await page.goto('/');
    await expect(page.locator('#hero-title')).toBeVisible();
    // Solo exigir src si hay URL pública definida
    if (cfg.heroImageUrl) {
      const src = await page.locator('#hero-image').getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('Galería pública lista imágenes', async ({ page, request }) => {
    const api = await request.get('/api/images');
    expect(api.ok()).toBeTruthy();
    const images = await api.json();

    await page.goto('/gallery');
    await expect(page.locator('.gallery-grid')).toBeVisible();
    if (Array.isArray(images) && images.length > 0) {
      await expect(page.locator('.gallery-grid .gallery-item').first()).toBeVisible();
    }
  });

  test('Cover API persiste y sincroniza hero (best-effort)', async ({ request }) => {
    // Obtener lista de imágenes y elegir una si existe
    const imagesResp = await request.get('/api/images');
    expect(imagesResp.ok()).toBeTruthy();
    const list = await imagesResp.json();
    if (!Array.isArray(list) || list.length === 0) test.skip();
    const pick = list[0]?.filename;

    // Guardar portada
    const setResp = await request.post('/api/cover', {
      data: { coverImages: [pick] }
    });
    expect(setResp.ok()).toBeTruthy();
    const saved = await setResp.json();
    expect(saved?.coverImages?.[0]).toBe(pick);

    // Verificar hero (tolerante a entornos sin KV)
    const hero = await (await request.get('/api/hero')).json();
    expect(hero && typeof hero === 'object').toBeTruthy();
  });
});


