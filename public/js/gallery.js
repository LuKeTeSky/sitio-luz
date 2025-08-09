document.addEventListener('DOMContentLoaded', () => {
  // Cargar imágenes existentes
  loadGalleryImages();
  
  // Configurar el formulario de subida
  setupUploadForm();
  
  // Configurar navegación suave
  setupSmoothScrolling();
  
  // Cargar configuración de portada
  loadCoverSettings();
  
  // Configurar drag & drop para la galería
  setupGalleryDragAndDrop();
});

// Variables globales para el lightbox
let currentImageIndex = 0;
let allImages = [];
let coverImages = [];

// Variables para drag & drop
let draggedElement = null;
let draggedIndex = -1;
let originalOrder = [];

// Función para configurar drag & drop en la galería
function setupGalleryDragAndDrop() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  // Guardar orden original
  originalOrder = [...allImages];
  
  // Agregar atributos de drag & drop a la grilla
  galleryGrid.setAttribute('draggable', 'false');
  galleryGrid.addEventListener('dragover', handleDragOver);
  galleryGrid.addEventListener('drop', handleDrop);
  galleryGrid.addEventListener('dragleave', handleDragLeave);
}

// Función para hacer elementos de galería arrastrables
function makeGalleryItemDraggable(item, index) {
  item.setAttribute('draggable', 'true');
  item.setAttribute('data-index', index);
  
  item.addEventListener('dragstart', (e) => handleDragStart(e, index));
  item.addEventListener('dragend', handleDragEnd);
  item.addEventListener('dragover', handleDragOver);
  item.addEventListener('drop', handleDrop);
  item.addEventListener('dragenter', handleDragEnter);
  item.addEventListener('dragleave', handleDragLeave);
  
  // Agregar indicador visual de que es arrastrable
  item.classList.add('draggable');
  
  // Agregar tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'drag-tooltip';
  tooltip.innerHTML = '<i class="fas fa-grip-vertical"></i>';
  tooltip.title = 'Arrastra para reordenar';
  item.appendChild(tooltip);
}

// Función para manejar inicio del drag
function handleDragStart(e, index) {
  draggedElement = e.target.closest('.gallery-item');
  draggedIndex = index;
  
  // Guardar orden original si es la primera vez
  if (originalOrder.length === 0) {
    originalOrder = [...allImages];
  }
  
  // Efecto visual durante el drag
  e.target.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.outerHTML);
  
  // Agregar clase de drag activo
  document.body.classList.add('dragging');
}

// Función para manejar fin del drag
function handleDragEnd(e) {
  e.target.style.opacity = '1';
  draggedElement = null;
  draggedIndex = -1;
  
  // Remover clase de drag activo
  document.body.classList.remove('dragging');
  
  // Remover clases de drop zones
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.classList.remove('drag-over', 'drop-zone');
  });
}

// Función para manejar drag over
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

// Función para manejar drag enter
function handleDragEnter(e) {
  e.preventDefault();
  const targetItem = e.target.closest('.gallery-item');
  if (targetItem && targetItem !== draggedElement) {
    targetItem.classList.add('drag-over');
  }
}

// Función para manejar drag leave
function handleDragLeave(e) {
  const targetItem = e.target.closest('.gallery-item');
  if (targetItem) {
    targetItem.classList.remove('drag-over');
  }
}

// Función para manejar drop
function handleDrop(e) {
  e.preventDefault();
  
  const targetItem = e.target.closest('.gallery-item');
  if (!targetItem || !draggedElement || draggedIndex === -1) return;
  
  const targetIndex = parseInt(targetItem.getAttribute('data-index'));
  if (targetIndex === draggedIndex) return;
  
  // Reordenar imágenes
  reorderImages(draggedIndex, targetIndex);
  
  // Limpiar clases
  targetItem.classList.remove('drag-over', 'drop-zone');
}

// Función para reordenar imágenes
function reorderImages(fromIndex, toIndex) {
  // Crear nueva lista ordenada
  const newOrder = [...allImages];
  const [movedImage] = newOrder.splice(fromIndex, 1);
  newOrder.splice(toIndex, 0, movedImage);
  
  // Actualizar array global
  allImages = newOrder;
  
  // Actualizar visualización
  updateGalleryOrder();
  
  // Guardar nuevo orden en el servidor
  saveGalleryOrder(newOrder);
  
  // Mostrar notificación
  showNotification('Orden de la galería actualizado', 'success');
}

// Función para actualizar el orden visual de la galería
function updateGalleryOrder() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  // Limpiar grilla
  galleryGrid.innerHTML = '';
  
  // Recrear elementos en el nuevo orden
  allImages.forEach((image, index) => {
    const galleryItem = createGalleryItem(image, index);
    galleryGrid.appendChild(galleryItem);
    
    // Hacer arrastrable el nuevo elemento
    makeGalleryItemDraggable(galleryItem, index);
  });
  
  // Reconfigurar lightbox
  setupLightbox();
}

// Función para guardar el nuevo orden en el servidor
async function saveGalleryOrder(newOrder) {
  try {
    const imageOrder = newOrder.map((image, index) => ({
      filename: image.filename,
      order: index
    }));
    
    const response = await fetch('/api/gallery/order', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageOrder })
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar el orden');
    }
    
    console.log('Orden de galería guardado exitosamente');
    
  } catch (error) {
    console.error('Error guardando orden de galería:', error);
    showNotification('Error al guardar el orden', 'error');
    
    // Revertir cambios en caso de error
    allImages = [...originalOrder];
    updateGalleryOrder();
  }
}

// Función para ordenar imágenes por prioridad
function sortImagesByPriority(images, albums, heroConfig) {
  // Crear un map para rápido acceso a información de álbumes
  const albumImageMap = new Map();
  
  albums.forEach((album, albumIndex) => {
    if (album.images && Array.isArray(album.images)) {
      album.images.forEach(imageFilename => {
        albumImageMap.set(imageFilename, {
          albumOrder: album.order || albumIndex,
          albumName: album.name
        });
      });
    }
  });
  
  // Obtener imagen de portada actual
  const coverImage = heroConfig && heroConfig.image ? heroConfig.image : null;
  
  // Clasificar imágenes
  const categorizedImages = {
    cover: [],
    albumImages: [],
    unassigned: []
  };
  
  images.forEach(image => {
    if (coverImage && image.filename === coverImage) {
      // Esta es la imagen de portada
      categorizedImages.cover.push({
        ...image,
        category: 'cover',
        priority: 0
      });
    } else if (albumImageMap.has(image.filename)) {
      // Esta imagen pertenece a un álbum
      const albumInfo = albumImageMap.get(image.filename);
      categorizedImages.albumImages.push({
        ...image,
        category: 'album',
        albumOrder: albumInfo.albumOrder,
        albumName: albumInfo.albumName,
        priority: 1 + albumInfo.albumOrder
      });
    } else {
      // Imagen sin asignar
      categorizedImages.unassigned.push({
        ...image,
        category: 'unassigned',
        priority: 1000 // Al final
      });
    }
  });
  
  // Ordenar imágenes de álbumes por orden de álbum
  categorizedImages.albumImages.sort((a, b) => a.albumOrder - b.albumOrder);
  
  // Combinar todas las categorías en orden
  return [
    ...categorizedImages.cover,
    ...categorizedImages.albumImages,
    ...categorizedImages.unassigned
  ];
}

// Función para cargar imágenes de la galería (admin)
async function loadGalleryImages() {
  try {
    const [imagesResponse, albumsResponse, heroResponse, orderResponse] = await Promise.all([
      fetch('/api/images'),
      fetch('/api/albums'),
      fetch('/api/hero'),
      fetch('/api/gallery/order').catch(() => null) // Intentar cargar orden, pero no fallar si no existe
    ]);
    
    const images = await imagesResponse.json();
    const albums = await albumsResponse.json();
    const heroConfig = await heroResponse.json();
    
    // Ordenar imágenes según prioridad: portada primero, luego por álbumes según su orden
    let orderedImages = sortImagesByPriority(images, albums, heroConfig);
    
    // Si hay un orden guardado, aplicarlo
    if (orderResponse && orderResponse.ok) {
      const orderData = await orderResponse.json();
      if (orderData.order && orderData.order.length > 0) {
        // Crear mapa de imágenes por filename
        const imageMap = new Map(orderedImages.map(img => [img.filename, img]));
        
        // Aplicar orden guardado
        const reorderedImages = [];
        orderData.order.forEach(orderItem => {
          if (imageMap.has(orderItem.filename)) {
            reorderedImages.push(imageMap.get(orderItem.filename));
            imageMap.delete(orderItem.filename);
          }
        });
        
        // Agregar imágenes que no están en el orden guardado
        imageMap.forEach(img => reorderedImages.push(img));
        
        orderedImages = reorderedImages;
        console.log('Orden de galería cargado desde configuración guardada');
      }
    }
    
    allImages = orderedImages;
    originalOrder = [...orderedImages]; // Guardar orden original para drag & drop
    
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    orderedImages.forEach((image, index) => {
      const galleryItem = createGalleryItem(image, index);
      galleryGrid.appendChild(galleryItem);
      
      // El elemento ya es arrastrable por createGalleryItem
    });
    
    // Configurar lightbox para las nuevas imágenes
    setupLightbox();
    
  } catch (error) {
    console.error('Error cargando imágenes:', error);
    // Mostrar imágenes de ejemplo si no hay API
    loadSampleImages();
  }
}

// Hacer función disponible globalmente para admin
window.loadAdminGallery = loadGalleryImages;

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
  
  const heroBtn = document.createElement('button');
  heroBtn.className = 'gallery-action-btn hero-btn';
  heroBtn.innerHTML = '<i class="fas fa-home"></i>';
  heroBtn.title = 'Establecer como imagen del hero';
  heroBtn.onclick = (e) => {
    e.stopPropagation();
    setHeroImage(imageData.filename);
  };
  
  // Botón de álbumes
  const albumBtn = document.createElement('button');
  albumBtn.className = 'gallery-action-btn album-btn';
  albumBtn.innerHTML = '<i class="fas fa-book-open"></i>';
  albumBtn.title = 'Agregar a álbum';
  albumBtn.onclick = (e) => {
    e.stopPropagation();
    showAlbumSelector(imageData.filename, albumBtn);
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
  actions.appendChild(heroBtn);
  actions.appendChild(expandBtn);
  actions.appendChild(albumBtn);
  actions.appendChild(deleteBtn);
  
  overlay.appendChild(info);
  item.appendChild(img);
  item.appendChild(overlay);
  item.appendChild(actions);
  
  // Hacer clic en la imagen para abrir lightbox
  item.addEventListener('click', () => {
    openLightbox(index);
  });
  
  // Hacer el elemento arrastrable
  makeGalleryItemDraggable(item, index);
  
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
function openLightbox(index, customImages = null) {
  // Usar imágenes personalizadas o todas las imágenes  
  const imagesToUse = customImages || allImages;
  currentImageIndex = index;
  const imageData = imagesToUse[index];
  
  const overlay = document.createElement('div');
  overlay.classList.add('lightbox-overlay');

  const container = document.createElement('div');
  container.className = 'lightbox-container';

  const fullImg = document.createElement('img');
  fullImg.src = `/uploads/${imageData.filename}`;
  fullImg.alt = imageData.title || 'Foto de modelo';
  fullImg.classList.add('lightbox-image');
  fullImg.classList.add('lightbox-fit-screen'); // Por defecto ajustado a pantalla

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

  // Botón para cambiar entre ajuste a pantalla y tamaño real
  const sizeToggleBtn = document.createElement('button');
  sizeToggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
  sizeToggleBtn.className = 'lightbox-nav lightbox-size-toggle';
  sizeToggleBtn.title = 'Cambiar a tamaño real';
  sizeToggleBtn.onclick = () => toggleImageSize(fullImg, sizeToggleBtn);

  // Botones de zoom
  const zoomInBtn = document.createElement('button');
  zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
  zoomInBtn.className = 'lightbox-nav lightbox-zoom-in';
  zoomInBtn.title = 'Acercar';
  zoomInBtn.onclick = () => zoomImage(fullImg, 1.2);

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
  zoomOutBtn.className = 'lightbox-nav lightbox-zoom-out';
  zoomOutBtn.title = 'Alejar';
  zoomOutBtn.onclick = () => zoomImage(fullImg, 0.8);

  // Botón de reset zoom
  const resetZoomBtn = document.createElement('button');
  resetZoomBtn.innerHTML = '<i class="fas fa-undo"></i>';
  resetZoomBtn.className = 'lightbox-nav lightbox-reset-zoom';
  resetZoomBtn.title = 'Restablecer zoom';
  resetZoomBtn.onclick = () => resetImageZoom(fullImg, sizeToggleBtn);

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

  // Botones de acción del lightbox
  const lightboxActions = document.createElement('div');
  lightboxActions.className = 'lightbox-actions';

  // Botón de portada
  const coverBtn = document.createElement('button');
  coverBtn.className = 'lightbox-action-btn cover-btn';
  coverBtn.innerHTML = '<i class="fas fa-star"></i>';
  coverBtn.title = 'Establecer como portada';
  coverBtn.onclick = (e) => {
    e.stopPropagation();
    toggleCoverImage(imageData.filename, index);
  };

  // Botón de hero
  const heroBtn = document.createElement('button');
  heroBtn.className = 'lightbox-action-btn hero-btn';
  heroBtn.innerHTML = '<i class="fas fa-home"></i>';
  heroBtn.title = 'Establecer como imagen del hero';
  heroBtn.onclick = (e) => {
    e.stopPropagation();
    setHeroImage(imageData.filename);
  };

  // Botón de álbumes
  const albumBtn = document.createElement('button');
  albumBtn.className = 'lightbox-action-btn album-btn';
  albumBtn.innerHTML = '<i class="fas fa-book-open"></i>';
  albumBtn.title = 'Agregar a álbum';
  albumBtn.onclick = (e) => {
    e.stopPropagation();
    showAlbumSelector(imageData.filename, albumBtn);
  };

  // Botón de eliminar
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'lightbox-action-btn delete-btn';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = 'Eliminar foto';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteImage(imageData.filename, index);
    overlay.remove();
  };

  lightboxActions.appendChild(coverBtn);
  lightboxActions.appendChild(heroBtn);
  lightboxActions.appendChild(albumBtn);
  lightboxActions.appendChild(deleteBtn);

  container.appendChild(fullImg);
  container.appendChild(closeBtn);
  container.appendChild(prevBtn);
  container.appendChild(nextBtn);
  container.appendChild(sizeToggleBtn);
  container.appendChild(zoomInBtn);
  container.appendChild(zoomOutBtn);
  container.appendChild(resetZoomBtn);
  container.appendChild(info);
  container.appendChild(counter);
  container.appendChild(lightboxActions);
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
    const newIndex = (currentImageIndex + direction + imagesToUse.length) % imagesToUse.length;
    currentImageIndex = newIndex;
    const newImageData = imagesToUse[newIndex];
    
    // Actualizar imagen
    fullImg.src = `/uploads/${newImageData.filename}`;
    fullImg.alt = newImageData.title || 'Foto de modelo';
    
    // Resetear zoom y tamaño al cambiar de imagen
    fullImg.classList.remove('lightbox-real-size', 'lightbox-zoomed');
    fullImg.classList.add('lightbox-fit-screen');
    fullImg.style.transform = 'scale(1)';
    
    // Actualizar botón de tamaño
    const sizeToggleBtn = document.querySelector('.lightbox-size-toggle');
    if (sizeToggleBtn) {
      sizeToggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
      sizeToggleBtn.title = 'Cambiar a tamaño real';
    }
    
    // Actualizar información
    info.innerHTML = `
      <div class="lightbox-title">${newImageData.title || 'Foto de Moda'}</div>
      <div class="lightbox-description">${newImageData.description || 'Capturado con estilo'}</div>
    `;
    
    // Actualizar contador
    counter.textContent = `${newIndex + 1} / ${allImages.length}`;
  }
}

// Función para cambiar entre ajuste a pantalla y tamaño real
function toggleImageSize(img, toggleBtn) {
  if (img.classList.contains('lightbox-fit-screen')) {
    // Cambiar a tamaño real
    img.classList.remove('lightbox-fit-screen');
    img.classList.add('lightbox-real-size');
    toggleBtn.innerHTML = '<i class="fas fa-compress"></i>';
    toggleBtn.title = 'Ajustar a pantalla';
  } else {
    // Cambiar a ajuste a pantalla
    img.classList.remove('lightbox-real-size');
    img.classList.add('lightbox-fit-screen');
    toggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
    toggleBtn.title = 'Cambiar a tamaño real';
  }
  
  // Resetear zoom al cambiar modo
  img.classList.remove('lightbox-zoomed');
  img.style.transform = 'scale(1)';
}

// Función para hacer zoom en la imagen
function zoomImage(img, factor) {
  const currentScale = parseFloat(img.style.transform.replace('scale(', '').replace(')', '') || 1);
  const newScale = Math.max(0.5, Math.min(3, currentScale * factor));
  
  img.style.transform = `scale(${newScale})`;
  img.classList.add('lightbox-zoomed');
  
  // Si está en modo real-size, cambiar a fit-screen para mejor zoom
  if (img.classList.contains('lightbox-real-size')) {
    img.classList.remove('lightbox-real-size');
    img.classList.add('lightbox-fit-screen');
    
    // Actualizar botón de tamaño
    const toggleBtn = document.querySelector('.lightbox-size-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
      toggleBtn.title = 'Cambiar a tamaño real';
    }
  }
}

// Función para resetear el zoom de la imagen
function resetImageZoom(img, toggleBtn) {
  img.style.transform = 'scale(1)';
  img.classList.remove('lightbox-zoomed');
  
  // Volver al modo ajuste a pantalla por defecto
  img.classList.remove('lightbox-real-size');
  img.classList.add('lightbox-fit-screen');
  
  // Actualizar botón de tamaño
  if (toggleBtn) {
    toggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
    toggleBtn.title = 'Cambiar a tamaño real';
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
      const result = await response.json();
      
      // Mostrar mensaje de éxito
      showNotification('Foto eliminada exitosamente', 'success');
      
      // Remover de portada si estaba seleccionada
      const coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
      const imageIndex = coverImages.indexOf(filename);
      if (imageIndex > -1) {
        coverImages.splice(imageIndex, 1);
        localStorage.setItem('coverImages', JSON.stringify(coverImages));
      }
      
      // Si se actualizaron álbumes, recargar los álbumes también
      if (result.albumsUpdated && window.albumsManager) {
        window.albumsManager.loadAlbums();
        
        // Si estamos mostrando un álbum específico, verificar si necesita actualización
        if (window.albumsManager.currentlyShowingAlbumId) {
          const currentAlbum = window.albumsManager.getAlbums().find(
            album => album.id === window.albumsManager.currentlyShowingAlbumId
          );
          if (currentAlbum) {
            setTimeout(() => {
              window.albumsManager.displayAlbumImages(currentAlbum);
            }, 300);
          }
        }
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
  const coverButtons = document.querySelectorAll('.cover-btn, .lightbox-action-btn.cover-btn');
  
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
async function updateCoverSection() {
  const coverGrid = document.getElementById('cover-grid');
  const coverEmpty = document.getElementById('cover-empty');
  const coverSection = document.querySelector('.cover-section');
  
  if (!coverGrid || !coverEmpty) return;
  
  // Obtener tanto las imágenes de cover como la imagen del hero actual
  const coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
  let currentHeroImage = null;
  
  try {
    const response = await fetch('/api/hero');
    if (response.ok) {
      const heroConfig = await response.json();
      currentHeroImage = heroConfig.image || heroConfig.heroImage;
    }
  } catch (error) {
    console.log('No se pudo obtener configuración del hero:', error);
  }
  
  // Crear lista unificada de imágenes de portada (hero + cover images, sin duplicados)
  const allCoverImages = [];
  
  // Agregar imagen del hero primero si existe y no está en coverImages
  if (currentHeroImage && !coverImages.includes(currentHeroImage)) {
    allCoverImages.push(currentHeroImage);
  }
  
  // Agregar las demás imágenes de cover
  allCoverImages.push(...coverImages);
  
  if (allCoverImages.length === 0) {
    coverGrid.style.display = 'none';
    coverEmpty.style.display = 'block';
    coverSection.classList.remove('has-cover-image');
    return;
  }
  
  coverGrid.style.display = 'grid';
  coverEmpty.style.display = 'none';
  coverGrid.innerHTML = '';
  
  // Tomar la primera imagen como fondo principal (prioridad al hero)
  const firstImageData = allImages.find(img => img.filename === allCoverImages[0]);
  if (firstImageData && coverSection) {
    coverSection.classList.add('has-cover-image');
    // Crear un fondo sutil con la primera imagen
    coverSection.style.backgroundImage = `linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(51, 51, 51, 0.8) 100%), url('/uploads/${firstImageData.filename}')`;
    coverSection.style.backgroundSize = 'cover';
    coverSection.style.backgroundPosition = 'center';
    coverSection.style.backgroundAttachment = 'fixed';
  }
  
  allCoverImages.forEach(filename => {
    const imageData = allImages.find(img => img.filename === filename);
    if (imageData) {
      const isHeroImage = filename === currentHeroImage;
      const coverItem = createCoverItem(imageData, isHeroImage);
      coverGrid.appendChild(coverItem);
    }
  });
}

// Función para crear un elemento de portada
function createCoverItem(imageData, isHeroImage = false) {
  const item = document.createElement('div');
  item.className = `cover-item ${isHeroImage ? 'hero-image' : ''}`;
  
  const img = document.createElement('img');
  img.src = `/uploads/${imageData.filename}`;
  img.alt = imageData.title || 'Foto de portada';
  
  const overlay = document.createElement('div');
  overlay.className = 'cover-overlay';
  
  const info = document.createElement('div');
  info.className = 'cover-info';
  
  // Si es la imagen del hero, mostrarlo con un badge especial
  const titleText = isHeroImage ? 
    `${imageData.title || 'Foto de Portada'} ✨` : 
    imageData.title || 'Foto de Portada';
  const descriptionText = isHeroImage ? 
    '🏠 Imagen Principal del Home' : 
    imageData.description || 'Destacada';
  
  info.innerHTML = `
    <h3>${titleText}</h3>
    <p>${descriptionText}</p>
  `;
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'cover-remove';
  removeBtn.innerHTML = '<i class="fas fa-times"></i>';
  
  if (isHeroImage) {
    removeBtn.title = 'Remover como imagen principal';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      // Para la imagen del hero, preguntamos si quiere removerla como hero
      if (confirm('¿Quieres remover esta imagen como imagen principal del home?')) {
        setHeroImage(''); // Remover hero image
      }
    };
  } else {
    removeBtn.title = 'Remover de portada';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      toggleCoverImage(imageData.filename);
    };
  }
  
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

// Función para validar archivos seleccionados
function validateFiles(files) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const maxFiles = 10;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
  
  const errors = [];
  const validFiles = [];
  let totalSize = 0;
  
  // Validar cantidad de archivos
  if (files.length > maxFiles) {
    errors.push(`❌ Demasiados archivos: ${files.length}/${maxFiles} (máximo 10)`);
  }
  
  // Validar cada archivo
  Array.from(files).forEach((file, index) => {
    const fileErrors = [];
    
    // Validar tipo de archivo
    const typeValid = allowedTypes.includes(file.type) && allowedExtensions.test(file.name);
    if (!typeValid) {
      fileErrors.push(`tipo no válido (${file.type || 'desconocido'})`);
    }
    
    // Validar tamaño
    if (file.size > maxSize) {
      fileErrors.push(`muy grande (${formatFileSize(file.size)} > 5MB)`);
    }
    
    totalSize += file.size;
    
    if (fileErrors.length > 0) {
      errors.push(`❌ ${file.name}: ${fileErrors.join(', ')}`);
    } else {
      validFiles.push(file);
    }
  });
  
  const summary = validFiles.length > 0 
    ? `✅ ${validFiles.length} archivo${validFiles.length !== 1 ? 's' : ''} válido${validFiles.length !== 1 ? 's' : ''} (${formatFileSize(totalSize)} total)`
    : '';
  
  return {
    valid: errors.length === 0 && validFiles.length > 0,
    errors: errors,
    validFiles: validFiles,
    summary: summary
  };
}

// Función auxiliar para formatear tamaños de archivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para configurar el formulario de subida
function setupUploadForm() {
  const form = document.querySelector('.upload-form');
  const fileInput = document.getElementById('photo');
  const fileLabel = document.querySelector('.file-label');
  
  if (!form || !fileInput || !fileLabel) return;
  
  // Actualizar label cuando se seleccionan archivos con validación
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    const validationInfo = document.querySelector('.file-validation-info');
    
    if (files.length > 0) {
      // Validar archivos
      const validation = validateFiles(files);
      
      if (validation.valid) {
        const fileText = files.length === 1 
          ? files[0].name 
          : `${files.length} archivos seleccionados`;
        
        fileLabel.innerHTML = `
          <i class="fas fa-check"></i>
          <span>${fileText}</span>
        `;
        fileLabel.style.borderColor = '#28a745';
        fileLabel.style.background = 'rgba(40, 167, 69, 0.1)';
        
        // Mostrar información de los archivos
        if (validationInfo) {
          validationInfo.innerHTML = validation.summary;
          validationInfo.className = 'file-validation-info success';
        }
      } else {
        fileLabel.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <span>Archivos con errores</span>
        `;
        fileLabel.style.borderColor = '#dc3545';
        fileLabel.style.background = 'rgba(220, 53, 69, 0.1)';
        
        // Mostrar errores
        if (validationInfo) {
          validationInfo.innerHTML = validation.errors.join('<br>');
          validationInfo.className = 'file-validation-info error';
        }
      }
    }
  });
  
  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.btn-upload');
    const originalText = submitBtn.innerHTML;
    
    const selectedFiles = fileInput.files;
    
    if (selectedFiles.length === 0) {
      showNotification('Por favor selecciona al menos una imagen', 'error');
      return;
    }
    
    // Mostrar estado de carga con contador
    const fileCount = selectedFiles.length;
    const loadingText = fileCount === 1 
      ? '<i class="fas fa-spinner fa-spin"></i> Subiendo foto...' 
      : `<i class="fas fa-spinner fa-spin"></i> Subiendo ${fileCount} fotos...`;
    
    submitBtn.innerHTML = loadingText;
    submitBtn.disabled = true;
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Mostrar mensaje de éxito personalizado
        showNotification(result.message || '¡Fotos subidas exitosamente!', 'success');
        
        // Si hay un álbum seleccionado, agregar las fotos automáticamente
        await handleAutoAddToSelectedAlbum(result.files);
        
        // Recargar galería
        setTimeout(() => {
          loadGalleryImages();
        }, 1000);
        
        // Resetear formulario
        form.reset();
        fileLabel.innerHTML = `
          <i class="fas fa-images"></i>
          <span>Seleccionar imágenes</span>
        `;
        fileLabel.style.borderColor = '#d4af37';
        fileLabel.style.background = 'rgba(212, 175, 55, 0.05)';
        
      } else {
        const errorData = await response.json();
        
        // Mostrar errores específicos según el código
        let errorMessage = errorData.error || 'Error al subir las imágenes';
        let errorType = 'error';
        
        switch (errorData.code) {
          case 'FILE_TOO_LARGE':
            errorMessage = '📁 ' + errorData.error;
            errorType = 'warning';
            break;
          case 'TOO_MANY_FILES':
            errorMessage = '📊 ' + errorData.error;
            errorType = 'warning';
            break;
          case 'INVALID_FILE_TYPE':
            errorMessage = '📷 ' + errorData.error;
            errorType = 'warning';
            break;
          case 'NO_FILES':
            errorMessage = '❌ ' + errorData.error;
            break;
          default:
            errorMessage = '⚠️ ' + errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Error al subir las imágenes', 'error');
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
    // Manejar el botón específico de galería de manera especial
    if (link.id === 'gallery-nav-btn') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        handleGalleryNavigation();
      });
    } else {
      // Comportamiento normal para otros enlaces
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
    }
  });
}

// Función específica para manejar la navegación del botón Galería
function handleGalleryNavigation() {
  // 1. Limpiar cualquier selección de álbum activa
  if (window.albumsManager) {
    window.albumsManager.showAllImages();
  }
  
  // 2. Recargar todas las imágenes en la galería
  if (window.loadAdminGallery) {
    window.loadAdminGallery();
  }
  
  // 3. Restaurar título original
  const sectionHeader = document.querySelector('#gallery .section-header h2');
  if (sectionHeader) {
    sectionHeader.textContent = 'Galería de Fotos';
  }
  
  // 4. Hacer scroll a la galería
  setTimeout(() => {
    const targetElement = document.querySelector('#gallery');
    if (targetElement) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }, 100); // Pequeño delay para que se carguen las imágenes
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

// Función para establecer imagen del hero
async function setHeroImage(filename) {
  try {
    const response = await fetch('/api/hero', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        heroImage: filename,
        title: 'LUZ',
        subtitle: 'Portfolio de Moda & Fotografía'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification('¡Imagen del hero actualizada exitosamente!', 'success');
      
      // Actualizar botones de hero
      updateHeroButtons();
      
      // Actualizar también la sección de portada para mostrar la nueva imagen del hero
      setTimeout(() => {
        updateCoverSection();
      }, 500);
      
    } else {
      throw new Error('Error al actualizar la imagen del hero');
    }
    
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al actualizar la imagen del hero', 'error');
  }
}

// Función para actualizar botones de hero
function updateHeroButtons() {
  fetch('/api/hero')
    .then(response => response.json())
    .then(config => {
      const heroButtons = document.querySelectorAll('.hero-btn, .lightbox-action-btn.hero-btn');
      
      heroButtons.forEach((btn, index) => {
        const imageData = allImages[index];
        if (imageData && config.heroImage === imageData.filename) {
          btn.classList.add('active');
          btn.innerHTML = '<i class="fas fa-home"></i>';
          btn.style.background = 'rgba(212, 175, 55, 0.9)';
          btn.style.color = 'white';
        } else {
          btn.classList.remove('active');
          btn.innerHTML = '<i class="fas fa-home"></i>';
          btn.style.background = 'rgba(255, 255, 255, 0.9)';
          btn.style.color = '#333';
        }
      });
    })
    .catch(error => {
      console.error('Error cargando configuración del hero:', error);
    });
}

// Inicializar animaciones cuando se carga la página
window.addEventListener('load', () => {
  setupScrollAnimations();
  updateHeroButtons();
});

// Función para mostrar el selector de álbumes
function showAlbumSelector(imageFilename, albumBtn) {
  // Verificar si el gestor de álbumes está disponible
  if (!window.albumsManager) {
    showNotification('Sistema de álbumes no disponible', 'error');
    return;
  }

  const albums = window.albumsManager.getAlbums();
  
  // Crear selector de álbumes
  const selector = document.createElement('div');
  selector.className = 'album-selector';
  
  if (albums.length === 0) {
    selector.innerHTML = `
      <div class="album-option">
        <span class="album-option-name">No hay álbumes creados</span>
      </div>
      <div class="album-option" onclick="window.albumsManager.openCreateModal()">
        <span class="album-option-name">Crear nuevo álbum</span>
      </div>
    `;
  } else {
    albums.forEach(album => {
      const option = document.createElement('div');
      option.className = 'album-option';
      option.innerHTML = `
        <span class="album-option-name">${album.name}</span>
        <span class="album-option-count">${album.images ? album.images.length : 0}</span>
      `;
      
      option.addEventListener('click', async () => {
        const success = await window.albumsManager.addImageToAlbum(imageFilename, album.id);
        if (success) {
          selector.classList.remove('active');
        }
      });
      
      selector.appendChild(option);
    });
  }
  
  // Agregar opción para crear nuevo álbum
  const createOption = document.createElement('div');
  createOption.className = 'album-option';
  createOption.innerHTML = '<span class="album-option-name">+ Crear nuevo álbum</span>';
  createOption.addEventListener('click', () => {
    window.albumsManager.openCreateModal();
    selector.classList.remove('active');
  });
  selector.appendChild(createOption);
  
  // Posicionar y mostrar el selector
  albumBtn.appendChild(selector);
  selector.classList.add('active');
  
  // Ajustar posición si está en el lightbox
  if (albumBtn.classList.contains('lightbox-action-btn')) {
    selector.style.position = 'absolute';
    selector.style.top = '100%';
    selector.style.left = '50%';
    selector.style.transform = 'translateX(-50%)';
    selector.style.marginTop = '10px';
    selector.style.zIndex = '1000';
  }
  
  // Cerrar selector al hacer clic fuera
  const closeSelector = (e) => {
    if (!selector.contains(e.target) && !albumBtn.contains(e.target)) {
      selector.classList.remove('active');
      document.removeEventListener('click', closeSelector);
    }
  };
  
  // Esperar un frame para evitar que se cierre inmediatamente
  requestAnimationFrame(() => {
    document.addEventListener('click', closeSelector);
  });
}

// Función para agregar automáticamente fotos al álbum seleccionado
async function handleAutoAddToSelectedAlbum(uploadedFiles) {
  // Verificar si hay un álbum seleccionado actualmente
  if (!window.albumsManager) {
    return;
  }

  const selectedAlbum = window.albumsManager.getSelectedAlbum();
  if (!selectedAlbum) {
    return; // No hay álbum seleccionado
  }

  let addedCount = 0;
  let errors = 0;

  // Agregar cada archivo subido al álbum seleccionado
  for (const file of uploadedFiles) {
    try {
      const success = await window.albumsManager.addImageToAlbum(file.filename, selectedAlbum.id);
      if (success) {
        addedCount++;
      } else {
        errors++;
      }
    } catch (error) {
      console.error('Error agregando imagen al álbum:', error);
      errors++;
    }
  }

  // Mostrar notificación del resultado
  if (addedCount > 0) {
    const message = addedCount === 1 
      ? `Foto agregada automáticamente al álbum "${selectedAlbum.name}"` 
      : `${addedCount} fotos agregadas automáticamente al álbum "${selectedAlbum.name}"`;
    
    showNotification(message, 'success');
    
    // Actualizar la vista del álbum si está siendo mostrado
    if (window.albumsManager.isShowingAlbum(selectedAlbum.id)) {
      setTimeout(() => {
        window.albumsManager.displayAlbumImages(selectedAlbum);
      }, 1500);
    }
  }

  if (errors > 0) {
    showNotification(`Error agregando ${errors} imagen(es) al álbum`, 'error');
  }
}
