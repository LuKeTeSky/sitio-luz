// Script para cargar dinámicamente la configuración del hero
document.addEventListener('DOMContentLoaded', () => {
  loadHeroConfiguration();
});

// Función para cargar la configuración del hero
async function loadHeroConfiguration() {
  try {
    const response = await fetch('/api/hero');
    const config = await response.json();
    
    // Actualizar la imagen del hero (usar URL pública si está disponible)
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
      const src = config.heroImageUrl || (config.heroImage ? `/uploads/${config.heroImage}` : '/uploads/luz-hero.jpg');
      heroImage.src = src;
      heroImage.alt = `${config.title || 'LUZ'} - Modelo de Moda`;
      // Si falla la carga, intentar usar primera portada como fallback visual
      heroImage.onerror = async () => {
        try {
          const r = await fetch('/api/cover');
          const j = r.ok ? await r.json() : { coverImages: [] };
          const first = Array.isArray(j.coverImages) && j.coverImages[0];
          if (first) heroImage.src = `/uploads/${first}`;
        } catch (_) {}
      };
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