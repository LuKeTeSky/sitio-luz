// Script para cargar dinámicamente la configuración del hero
document.addEventListener('DOMContentLoaded', () => {
  loadHeroConfiguration();
  // Refresco suave para evitar quedarse con una portada vieja
  setInterval(() => {
    loadHeroConfiguration();
  }, 30000);
});

// Función para cargar la configuración del hero
async function loadHeroConfiguration() {
  try {
    const response = await fetch('/api/hero');
    const config = await response.json();
    
    // Actualizar la imagen del hero (priorizar URL pública; evitar /uploads en Vercel)
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
      heroImage.alt = `${config.title || 'LUZ'} - Modelo de Moda`;
      let src = config.heroImageUrl || null;
      if (!src && config.heroImage) {
        // No tenemos URL pública, intentar obtenerla desde /api/cover
        try {
          const r = await fetch('/api/cover', { cache: 'no-store' });
          if (r.ok) {
            const j = await r.json();
            const match = Array.isArray(j.items) && j.items.find(it => it.filename === config.heroImage);
            if (match && match.url) src = match.url;
          }
        } catch (_) {}
      }
      // Si aún no hay, intentar usar la primera portada con URL pública
      if (!src) {
        try {
          const r = await fetch('/api/cover', { cache: 'no-store' });
          if (r.ok) {
            const j = await r.json();
            if (Array.isArray(j.items) && j.items[0] && j.items[0].url) {
              src = j.items[0].url;
            }
          }
        } catch (_) {}
      }
      if (src) {
        heroImage.src = src;
      }
      // Si todo falla, mantener sin src en lugar de usar /uploads/luz-hero.jpg (evita 404s)
      heroImage.onerror = null;
    }
    
    // Actualizar el título
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
      heroTitle.textContent = config.title;
    }
    
    // Actualizar el subtítulo
    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.textContent = config.subtitle;
    }
    
  } catch (error) {
    console.error('Error cargando configuración del hero:', error);
    // Mantener la configuración por defecto si hay error
  }
} 