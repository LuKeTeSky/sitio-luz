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
      heroImage.alt = `${config.title} - Modelo de Moda`;
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