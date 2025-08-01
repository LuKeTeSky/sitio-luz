document.addEventListener('DOMContentLoaded', () => {
  // Cargar imágenes existentes
  loadGalleryImages();
  
  // Configurar el formulario de subida
  setupUploadForm();
  
  // Configurar navegación suave
  setupSmoothScrolling();
  
  // Cargar configuración de portada
  loadCoverSettings();
});

// Variables globales para el lightbox
let currentImageIndex = 0;
let allImages = [];
let coverImages = [];

// Función para cargar imágenes de la galería
async function loadGalleryImages() {
  try {
    const response = await fetch('/api/images');
    const images = await response.json();
    
    allImages = images;
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    images.forEach((image, index) => {
      const galleryItem = createGalleryItem(image, index);
      galleryGrid.appendChild(galleryItem);
    });
    
    // Configurar lightbox para las nuevas imágenes
    setupLightbox();
    
  } catch (error) {
    console.error('Error cargando imágenes:', error);
    // Mostrar imágenes de ejemplo si no hay API
    loadSampleImages();
  }
}

// Función para crear un elemento de galería
function createGalleryItem(imageData, index) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.dataset.index = index;
  
  const img = document.createElement('img');
  img.src = `/uploads/${imageData.filename}`;
  img.alt = imageData.title || 'Foto de modelo';
  img.loading = 'lazy';
  
  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  
  const info = document.createElement('div');
  info.className = 'gallery-info';
  info.innerHTML = `
    <h3>${imageData.title || 'Foto de Moda'}</h3>
    <p>${imageData.description || 'Capturado con estilo'}</p>
  `;
  
  // Botones de acción
  const actions = document.createElement('div');
  actions.className = 'gallery-actions';
  
  const coverBtn = document.createElement('button');
  coverBtn.className = 'gallery-action-btn cover-btn';
  coverBtn.innerHTML = '<i class="fas fa-star"></i>';
  coverBtn.title = 'Establecer como portada';
  coverBtn.onclick = (e) => {
    e.stopPropagation();
    toggleCoverImage(imageData.filename, index);
  };
  
  const expandBtn = document.createElement('button');
  expandBtn.className = 'gallery-action-btn';
  expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
  expandBtn.title = 'Ver en pantalla completa';
  expandBtn.onclick = (e) => {
    e.stopPropagation();
    openLightbox(index);
  };
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'gallery-action-btn delete-btn';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = 'Eliminar foto';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteImage(imageData.filename, index);
  };
  
  actions.appendChild(coverBtn);
  actions.appendChild(expandBtn);
  actions.appendChild(deleteBtn);
  
  overlay.appendChild(info);
  item.appendChild(img);
  item.appendChild(overlay);
  item.appendChild(actions);
  
  // Hacer clic en la imagen para abrir lightbox
  item.addEventListener('click', () => {
    openLightbox(index);
  });
  
  return item;
}

// Función para cargar imágenes de ejemplo
function loadSampleImages() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  const sampleImages = [
    { filename: '20aca01bb41a3769bd429568fc2fe3b4', title: 'Elegante en Blanco', description: 'Estilo minimalista' },
    { filename: '2e3dc4d041585f34d5da23aefcf6992c', title: 'Retrato Clásico', description: 'Belleza atemporal' },
    { filename: '6d3ea2322235ef2d2a19fd5dddbc925c', title: 'Moda Urbana', description: 'Estilo contemporáneo' },
    { filename: '83d313c5d4c61313b1674fbb6c8139a7', title: 'Glamour', description: 'Elegancia y sofisticación' },
    { filename: 'a2b8e2d08e1a5f614ee1b88a5d050a6a', title: 'Natural Beauty', description: 'Belleza natural' }
  ];
  
  allImages = sampleImages;
  
  sampleImages.forEach((imageData, index) => {
    const galleryItem = createGalleryItem(imageData, index);
    galleryGrid.appendChild(galleryItem);
  });
  
  setupLightbox();
}

// Función para configurar el lightbox
function setupLightbox() {
  // El lightbox se configura dinámicamente al abrir
}

// Función para abrir el lightbox estilo Louis Vuitton
function openLightbox(index) {
  currentImageIndex = index;
  const imageData = allImages[index];
  
  const overlay = document.createElement('div');
  overlay.classList.add('lightbox-overlay');

  const container = document.createElement('div');
  container.className = 'lightbox-container';

  const fullImg = document.createElement('img');
  fullImg.src = `/uploads/${imageData.filename}`;
  fullImg.alt = imageData.title || 'Foto de modelo';
  fullImg.classList.add('lightbox-image');

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.classList.add('lightbox-close');

  // Botones de navegación
  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.className = 'lightbox-nav lightbox-prev';
  prevBtn.onclick = () => navigateLightbox(-1);

  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.className = 'lightbox-nav lightbox-next';
  nextBtn.onclick = () => navigateLightbox(1);

  // Información de la imagen
  const info = document.createElement('div');
  info.className = 'lightbox-info';
  info.innerHTML = `
    <div class="lightbox-title">${imageData.title || 'Foto de Moda'}</div>
    <div class="lightbox-description">${imageData.description || 'Capturado con estilo'}</div>
  `;

  // Contador
  const counter = document.createElement('div');
  counter.className = 'lightbox-counter';
  counter.textContent = `${index + 1} / ${allImages.length}`;

  container.appendChild(fullImg);
  container.appendChild(closeBtn);
  container.appendChild(prevBtn);
  container.appendChild(nextBtn);
  container.appendChild(info);
  container.appendChild(counter);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Cerrar con el botón
  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });

  // Cerrar haciendo clic fuera de la imagen
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Navegación con teclado
  const handleKeydown = (e) => {
    switch(e.key) {
      case 'Escape':
        overlay.remove();
        document.removeEventListener('keydown', handleKeydown);
        break;
      case 'ArrowLeft':
        navigateLightbox(-1);
        break;
      case 'ArrowRight':
        navigateLightbox(1);
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeydown);

  // Función para navegar en el lightbox
  function navigateLightbox(direction) {
    const newIndex = (currentImageIndex + direction + allImages.length) % allImages.length;
    currentImageIndex = newIndex;
    const newImageData = allImages[newIndex];
    
    // Actualizar imagen
    fullImg.src = `/uploads/${newImageData.filename}`;
    fullImg.alt = newImageData.title || 'Foto de modelo';
    
    // Actualizar información
    info.innerHTML = `
      <div class="lightbox-title">${newImageData.title || 'Foto de Moda'}</div>
      <div class="lightbox-description">${newImageData.description || 'Capturado con estilo'}</div>
    `;
    
    // Actualizar contador
    counter.textContent = `${newIndex + 1} / ${allImages.length}`;
  }
}

// Función para eliminar imagen
async function deleteImage(filename, index) {
  // Confirmar antes de eliminar
  if (!confirm('¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/images/${filename}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // Mostrar mensaje de éxito
      showNotification('Foto eliminada exitosamente', 'success');
      
      // Remover de portada si estaba seleccionada
      const coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
      const imageIndex = coverImages.indexOf(filename);
      if (imageIndex > -1) {
        coverImages.splice(imageIndex, 1);
        localStorage.setItem('coverImages', JSON.stringify(coverImages));
      }
      
      // Recargar galería
      setTimeout(() => {
        loadGalleryImages();
      }, 500);
      
    } else {
      throw new Error('Error al eliminar la imagen');
    }
    
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al eliminar la imagen', 'error');
  }
}

// Función para alternar imagen de portada
function toggleCoverImage(filename, index) {
  const coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
  const imageIndex = coverImages.indexOf(filename);
  
  if (imageIndex > -1) {
    // Remover de portada
    coverImages.splice(imageIndex, 1);
    showNotification('Imagen removida de la portada', 'info');
  } else {
    // Agregar a portada
    coverImages.push(filename);
    showNotification('Imagen agregada a la portada', 'success');
  }
  
  localStorage.setItem('coverImages', JSON.stringify(coverImages));
  updateCoverButtons();
  updateCoverSection();
}

// Función para actualizar botones de portada
function updateCoverButtons() {
  const coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
  const coverButtons = document.querySelectorAll('.cover-btn');
  
  coverButtons.forEach((btn, index) => {
    const imageData = allImages[index];
    if (coverImages.includes(imageData.filename)) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fas fa-star"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="far fa-star"></i>';
    }
  });
}

// Función para cargar configuración de portada
function loadCoverSettings() {
  setTimeout(() => {
    updateCoverButtons();
    updateCoverSection();
  }, 1000);
}

// Función para actualizar la sección de fotos de portada
function updateCoverSection() {
  const coverGrid = document.getElementById('cover-grid');
  const coverEmpty = document.getElementById('cover-empty');
  const coverSection = document.querySelector('.cover-section');
  
  if (!coverGrid || !coverEmpty) return;
  
  const coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
  
  if (coverImages.length === 0) {
    coverGrid.style.display = 'none';
    coverEmpty.style.display = 'block';
    coverSection.classList.remove('has-cover-image');
    return;
  }
  
  coverGrid.style.display = 'grid';
  coverEmpty.style.display = 'none';
  coverGrid.innerHTML = '';
  
  // Tomar la primera imagen como fondo principal
  const firstImageData = allImages.find(img => img.filename === coverImages[0]);
  if (firstImageData && coverSection) {
    coverSection.classList.add('has-cover-image');
    // Crear un fondo sutil con la primera imagen
    coverSection.style.backgroundImage = `linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(51, 51, 51, 0.8) 100%), url('/uploads/${firstImageData.filename}')`;
    coverSection.style.backgroundSize = 'cover';
    coverSection.style.backgroundPosition = 'center';
    coverSection.style.backgroundAttachment = 'fixed';
  }
  
  coverImages.forEach(filename => {
    const imageData = allImages.find(img => img.filename === filename);
    if (imageData) {
      const coverItem = createCoverItem(imageData);
      coverGrid.appendChild(coverItem);
    }
  });
}

// Función para crear un elemento de portada
function createCoverItem(imageData) {
  const item = document.createElement('div');
  item.className = 'cover-item';
  
  const img = document.createElement('img');
  img.src = `/uploads/${imageData.filename}`;
  img.alt = imageData.title || 'Foto de portada';
  
  const overlay = document.createElement('div');
  overlay.className = 'cover-overlay';
  
  const info = document.createElement('div');
  info.className = 'cover-info';
  info.innerHTML = `
    <h3>${imageData.title || 'Foto de Portada'}</h3>
    <p>${imageData.description || 'Destacada'}</p>
  `;
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'cover-remove';
  removeBtn.innerHTML = '<i class="fas fa-times"></i>';
  removeBtn.title = 'Remover de portada';
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    toggleCoverImage(imageData.filename);
  };
  
  overlay.appendChild(info);
  item.appendChild(img);
  item.appendChild(overlay);
  item.appendChild(removeBtn);
  
  // Hacer clic en la imagen para abrir lightbox
  item.addEventListener('click', () => {
    const index = allImages.findIndex(img => img.filename === imageData.filename);
    if (index !== -1) {
      openLightbox(index);
    }
  });
  
  return item;
}

// Función para configurar el formulario de subida
function setupUploadForm() {
  const form = document.querySelector('.upload-form');
  const fileInput = document.getElementById('photo');
  const fileLabel = document.querySelector('.file-label');
  
  if (!form || !fileInput || !fileLabel) return;
  
  // Actualizar label cuando se selecciona un archivo
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileLabel.innerHTML = `
        <i class="fas fa-check"></i>
        <span>${file.name}</span>
      `;
      fileLabel.style.borderColor = '#28a745';
      fileLabel.style.background = 'rgba(40, 167, 69, 0.1)';
    }
  });
  
  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.btn-upload');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Mostrar mensaje de éxito
        showNotification('¡Foto subida exitosamente!', 'success');
        
        // Recargar galería
        setTimeout(() => {
          loadGalleryImages();
        }, 1000);
        
        // Resetear formulario
        form.reset();
        fileLabel.innerHTML = `
          <i class="fas fa-image"></i>
          <span>Seleccionar imagen</span>
        `;
        fileLabel.style.borderColor = '#d4af37';
        fileLabel.style.background = 'rgba(212, 175, 55, 0.05)';
        
      } else {
        throw new Error('Error al subir la imagen');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al subir la imagen', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Agregar estilos si no existen
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }
      .notification-success { border-left: 4px solid #28a745; }
      .notification-error { border-left: 4px solid #dc3545; }
      .notification-info { border-left: 4px solid #17a2b8; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

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
