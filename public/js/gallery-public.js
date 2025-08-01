document.addEventListener('DOMContentLoaded', () => {
  // Cargar imágenes existentes
  loadGalleryImages();
  
  // Configurar navegación suave
  setupSmoothScrolling();
});

// Variables globales
let allImages = [];
let currentImageIndex = 0;

// Función para manejar el header transparente
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Función para cargar la imagen de hero
function loadHeroImage() {
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        // Intentar cargar una imagen de hero específica, si no existe usar la primera imagen de la galería
        heroImage.onerror = function() {
            // Si no existe luz-hero.jpg, usar la primera imagen de la galería
            if (allImages.length > 0) {
                heroImage.src = `/uploads/${allImages[0].filename}`;
            }
        };
    }
}

// Función para cargar imágenes de la galería
async function loadGalleryImages() {
    try {
        const response = await fetch('/api/images');
        if (response.ok) {
            allImages = await response.json();
            displayGalleryImages();
            loadHeroImage(); // Cargar imagen de hero después de obtener las imágenes
        } else {
            console.error('Error cargando imágenes:', response.statusText);
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}

// Función para mostrar imágenes en la galería
function displayGalleryImages() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    allImages.forEach((imageData, index) => {
        const galleryItem = createGalleryItem(imageData, index);
        galleryGrid.appendChild(galleryItem);
    });
}

// Función para crear un elemento de galería
function createGalleryItem(imageData, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="/uploads/${imageData.filename}" alt="${imageData.title || 'Foto de modelo'}" loading="lazy">
        <div class="gallery-overlay">
            <div class="gallery-info">
                <h3>${imageData.title || 'Foto de Moda'}</h3>
                <p>${imageData.description || 'Capturado con estilo'}</p>
            </div>
        </div>
    `;

    item.addEventListener('click', () => openLightbox(index));
    return item;
}

// Función para abrir lightbox
function openLightbox(index) {
    currentImageIndex = index;
    const imageData = allImages[index];

    const lightboxHTML = `
        <div class="lightbox-overlay">
            <div class="lightbox-container">
                <button class="lightbox-close" onclick="closeLightbox()">
                    <i class="fas fa-times"></i>
                </button>
                <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <img src="/uploads/${imageData.filename}" alt="${imageData.title || 'Foto de modelo'}" class="lightbox-image">
                <div class="lightbox-info">
                    <div class="lightbox-title">${imageData.title || 'Foto de Moda'}</div>
                    <div class="lightbox-description">${imageData.description || 'Capturado con estilo'}</div>
                </div>
                <div class="lightbox-counter">${index + 1} / ${allImages.length}</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    document.body.style.overflow = 'hidden';

    // Event listeners para navegación con teclado
    document.addEventListener('keydown', handleLightboxKeyboard);
}

// Función para cerrar lightbox
function closeLightbox() {
    const lightbox = document.querySelector('.lightbox-overlay');
    if (lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleLightboxKeyboard);
    }
}

// Función para navegar en el lightbox
function navigateLightbox(direction) {
    const newIndex = (currentImageIndex + direction + allImages.length) % allImages.length;
    currentImageIndex = newIndex;
    const newImageData = allImages[newIndex];

    // Actualizar imagen
    const fullImg = document.querySelector('.lightbox-image');
    fullImg.src = `/uploads/${newImageData.filename}`;
    fullImg.alt = newImageData.title || 'Foto de modelo';

    // Actualizar información
    const info = document.querySelector('.lightbox-info');
    info.innerHTML = `
        <div class="lightbox-title">${newImageData.title || 'Foto de Moda'}</div>
        <div class="lightbox-description">${newImageData.description || 'Capturado con estilo'}</div>
    `;

    // Actualizar contador
    const counter = document.querySelector('.lightbox-counter');
    counter.textContent = `${newIndex + 1} / ${allImages.length}`;
}

// Función para manejar navegación con teclado
function handleLightboxKeyboard(event) {
    switch(event.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            navigateLightbox(-1);
            break;
        case 'ArrowRight':
            navigateLightbox(1);
            break;
    }
}

// Función para scroll suave
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar imágenes
    loadGalleryImages();

    // Manejar scroll del header
    window.addEventListener('scroll', handleHeaderScroll);

    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            smoothScroll(this.getAttribute('href'));
        });
    });

    // Cerrar lightbox al hacer click fuera de la imagen
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('lightbox-overlay')) {
            closeLightbox();
        }
    });
});

// Función para configurar navegación suave
function setupSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Función para animar elementos cuando entran en el viewport
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observar elementos que necesitan animación
  const animatedElements = document.querySelectorAll('.gallery-item, .about-content, .contact-content');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Inicializar animaciones cuando se carga la página
window.addEventListener('load', () => {
  setupScrollAnimations();
}); 