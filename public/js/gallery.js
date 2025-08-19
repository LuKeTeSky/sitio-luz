document.addEventListener('DOMContentLoaded', () => {
  // Protección contra ejecuciones múltiples
  if (isDOMContentLoadedExecuted) {
    console.log('⚠️ DOMContentLoaded ya ejecutado, saltando...');
    return;
  }
  
  isDOMContentLoadedExecuted = true;
  console.log('🚀 DOMContentLoaded ejecutándose...');
  
  // Agregar funciones de debug a la consola
  console.log('🔧 Funciones de debug disponibles:');
  console.log('  - window.clearGalleryProtection() - Limpiar protección');
  console.log('  - window.resetGalleryLoadProtection() - Resetear protección');
  console.log('  - window.resetDOMContentLoadedProtection() - Resetear protección DOMContentLoaded');
  console.log('  - window.loadAdminGallery() - Recargar galería manualmente');
  
  // Cargar imágenes existentes
  loadGalleryImages();
  
  // Configurar el formulario de subida
  setupUploadForm();
  
  // Configurar navegación suave
  setupSmoothScrolling();
  
  // Cargar configuración de portada
  loadCoverSettings();

  // Mantener Portada sincronizada suavemente con el servidor
  startCoverAutoRefresh();
  
  // Configurar drag & drop para la galería
  setupGalleryDragAndDrop();
  
  console.log('✅ DOMContentLoaded completado');
});

// Variables globales para el lightbox
let currentImageIndex = 0;
let allImages = [];
let coverImages = [];

// Variables para drag & drop
let draggedElement = null;
let draggedIndex = -1;
let originalOrder = [];
let lastTargetIndex = -1;

// Protección contra ejecuciones múltiples
let isLoadingGallery = false;
let galleryLoadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;
let isDOMContentLoadedExecuted = false;

// ===== Métricas helper =====
async function sendMetric(type, label, metadata) {
  try {
    await fetch('/api/metrics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label, metadata })
    });
  } catch (_) {}
}

// Función para configurar drag & drop en la galería
function setupGalleryDragAndDrop() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  // Solo configurar si hay imágenes y no está cargando
  if (allImages.length === 0 || isLoadingGallery) {
    console.log('🔄 setupGalleryDragAndDrop saltado - sin imágenes o galería cargando');
    return;
  }
  
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
  lastTargetIndex = -1;
  
  // Remover clase de drag activo
  document.body.classList.remove('dragging');
  
  // Limpiar efectos fantasma y clases de drop zones
  clearGhostEffects();
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.classList.remove('drag-over', 'drop-zone');
  });
}

// Función para manejar drag over
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  // Obtener el elemento sobre el que estamos arrastrando
  const targetItem = e.target.closest('.gallery-item');
  if (!targetItem || targetItem === draggedElement) return;
  
  const targetIndex = parseInt(targetItem.dataset.index);
  if (isNaN(targetIndex)) return;
  
  // Solo crear efecto fantasma si el índice cambió
  if (targetIndex !== lastTargetIndex) {
    lastTargetIndex = targetIndex;
    createGhostEffect(targetIndex);
  }
  
  // Agregar indicador visual de drop zone
  targetItem.classList.add('drop-zone');
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
  
  // Limpiar efectos fantasma antes de reordenar
  clearGhostEffects();
  
  // Reordenar imágenes
  reorderImages(draggedIndex, targetIndex);
  
  // Limpiar clases
  targetItem.classList.remove('drag-over', 'drop-zone');
}

// Función para reordenar imágenes
function reorderImages(fromIndex, toIndex) {
  console.log(`🔄 Reordenando: elemento ${fromIndex} → posición ${toIndex}`);
  
  // Crear nueva lista ordenada
  const newOrder = [...allImages];
  const [movedImage] = newOrder.splice(fromIndex, 1);
  newOrder.splice(toIndex, 0, movedImage);
  
  // Actualizar array global
  allImages = newOrder;
  
  console.log(`📸 Nuevo orden:`, newOrder.map((img, i) => `${i}: ${img.filename}`));
  
  // Aplicar animación de reordenamiento
  applyReorderAnimation(fromIndex, toIndex);
  
  // Actualizar visualización después de un pequeño delay
  setTimeout(() => {
    console.log(`🎨 Actualizando DOM...`);
    
    // Solo actualizar el DOM sin recrear toda la grilla
    updateGalleryOrderDOM(fromIndex, toIndex);
    
    console.log(`💾 Guardando en servidor...`);
    
    // Guardar nuevo orden en el servidor
    saveGalleryOrder(newOrder);
    
    // Mostrar notificación
    showNotification('Orden de la galería actualizado', 'success');
  }, 300); // Delay para que se vea la animación
}

// Función para aplicar animación de reordenamiento
function applyReorderAnimation(fromIndex, toIndex) {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const movedItem = galleryItems[fromIndex];
  
  if (!movedItem) return;
  
  // Obtener información de la grilla
  const gridContainer = document.getElementById('gallery-grid');
  const gridRect = gridContainer.getBoundingClientRect();
  const itemRect = movedItem.getBoundingClientRect();
  
  if (!itemRect) return;
  
  // Calcular columnas por fila
  const itemWidth = itemRect.width;
  const itemMargin = 20;
  const effectiveItemWidth = itemWidth + itemMargin;
  const columnsPerRow = Math.floor(gridRect.width / effectiveItemWidth);
  
  // Calcular posiciones
  const fromPos = { row: Math.floor(fromIndex / columnsPerRow), col: fromIndex % columnsPerRow };
  const toPos = { row: Math.floor(toIndex / columnsPerRow), col: toIndex % columnsPerRow };
  
  // Calcular desplazamiento
  const deltaX = (toPos.col - fromPos.col) * effectiveItemWidth;
  const deltaY = (toPos.row - fromPos.row) * (itemRect.height + itemMargin);
  
  // Aplicar animación
  movedItem.style.transition = 'all 0.3s ease';
  movedItem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  movedItem.style.zIndex = '1000';
  
  // Restaurar después de la animación
  setTimeout(() => {
    movedItem.style.transition = '';
    movedItem.style.transform = '';
    movedItem.style.zIndex = '';
  }, 300);
}

// Función para actualizar el orden visual de la galería (recrea toda la grilla)
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

// Función para actualizar solo el DOM sin recrear toda la grilla
function updateGalleryOrderDOM(fromIndex, toIndex) {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  // Obtener todos los elementos de la galería
  const galleryItems = Array.from(galleryGrid.children);
  
  // Crear nueva lista ordenada de elementos
  const newOrder = [...galleryItems];
  const [movedItem] = newOrder.splice(fromIndex, 1);
  newOrder.splice(toIndex, 0, movedItem);
  
  // Limpiar la grilla
  galleryGrid.innerHTML = '';
  
  // Agregar elementos en el nuevo orden
  newOrder.forEach((item, index) => {
    // Actualizar índices
    item.setAttribute('data-index', index);
    item.dataset.index = index;
    
    // Agregar a la grilla
    galleryGrid.appendChild(item);
  });
  
  console.log(`🔄 DOM actualizado: elemento ${fromIndex} movido a posición ${toIndex}`);
}

// Protección contra llamadas repetitivas a saveGalleryOrder
let saveOrderTimeout = null;
let lastSavedOrder = null;

// Función para guardar el nuevo orden en el servidor
async function saveGalleryOrder(newOrder) {
  // Evitar guardar el mismo orden múltiples veces
  if (lastSavedOrder && JSON.stringify(lastSavedOrder) === JSON.stringify(newOrder)) {
    console.log('🔄 Orden idéntico, saltando guardado');
    return;
  }
  
  // Debounce: cancelar llamada anterior si hay una nueva
  if (saveOrderTimeout) {
    clearTimeout(saveOrderTimeout);
  }
  
  // Esperar 500ms antes de guardar para evitar llamadas repetitivas
  saveOrderTimeout = setTimeout(async () => {
    try {
      console.log('💾 Guardando orden de galería...');
      
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
      
      // Guardar referencia del último orden guardado
      lastSavedOrder = JSON.parse(JSON.stringify(newOrder));
      console.log('✅ Orden de galería guardado exitosamente');
      
    } catch (error) {
      console.error('Error guardando orden de galería:', error);
      showNotification('Error al guardar el orden', 'error');
      
      // Revertir cambios en caso de error
      allImages = [...originalOrder];
      updateGalleryOrder();
    }
  }, 500); // Debounce de 500ms
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
  // Protección contra ejecuciones múltiples
  if (isLoadingGallery) {
    console.log('🔄 loadGalleryImages ya está en ejecución, saltando...');
    return;
  }
  
  if (galleryLoadAttempts >= MAX_LOAD_ATTEMPTS) {
    console.warn('⚠️ Máximo de intentos de carga alcanzado, reintentando suave en 2s...');
    setTimeout(() => {
      // Permitir otro intento controlado
      galleryLoadAttempts = Math.max(0, galleryLoadAttempts - 1);
      if (!isLoadingGallery) loadGalleryImages();
    }, 2000);
    return;
  }
  
  isLoadingGallery = true;
  galleryLoadAttempts++;
  
  console.log(`📸 Cargando galería (intento ${galleryLoadAttempts}/${MAX_LOAD_ATTEMPTS})`);
  
  try {
    const [imagesResponse, albumsResponse, heroResponse, orderResponse, deletedImagesResponse] = await Promise.all([
      fetch('/api/images'),
      fetch('/api/albums'),
      fetch('/api/hero'),
      fetch('/api/gallery/order').catch(() => null), // Intentar cargar orden, pero no fallar si no existe
      fetch('/api/deleted-images').catch(() => ({ deletedImages: [] })) // Obtener imágenes eliminadas
    ]);
    
    const images = await imagesResponse.json();
    const albums = await albumsResponse.json();
    const heroConfig = await heroResponse.json();
    const deletedImagesData = await deletedImagesResponse.json();
    
    // Filtrar imágenes marcadas para eliminación
    const deletedFilenames = deletedImagesData.deletedImages || [];
    const filteredImages = images.filter(image => !deletedFilenames.includes(image.filename));
    
    console.log(`🔍 Filtrado: ${images.length} imágenes totales, ${deletedFilenames.length} eliminadas, ${filteredImages.length} visibles`);
    
    // Ordenar imágenes según prioridad: portada primero, luego por álbumes según su orden
    let orderedImages = sortImagesByPriority(filteredImages, albums, heroConfig);
    
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
    
    // Reset de protección después de carga exitosa
    isLoadingGallery = false;
    galleryLoadAttempts = 0; // ← importante: permitir futuras recargas después de una exitosa
    console.log('✅ Galería cargada exitosamente');
    
  } catch (error) {
    console.error('Error cargando imágenes:', error);
    // Mostrar imágenes de ejemplo si no hay API
    loadSampleImages();
    
    // Reset de protección en caso de error
    isLoadingGallery = false;
  }
}

// Hacer función disponible globalmente para admin
window.loadAdminGallery = loadGalleryImages;

// Función para resetear la protección de carga
function resetGalleryLoadProtection() {
  isLoadingGallery = false;
  galleryLoadAttempts = 0;
  isDOMContentLoadedExecuted = false;
  console.log('🔄 Protección de carga de galería reseteada');
}

// Hacer función disponible globalmente
window.resetGalleryLoadProtection = resetGalleryLoadProtection;

// Función para limpiar toda la protección
function clearGalleryProtection() {
  isLoadingGallery = false;
  galleryLoadAttempts = 0;
  isDOMContentLoadedExecuted = false;
  if (saveOrderTimeout) {
    clearTimeout(saveOrderTimeout);
    saveOrderTimeout = null;
  }
  lastSavedOrder = null;
  console.log('🧹 Protección de galería limpiada');
}

// Hacer función disponible globalmente
window.clearGalleryProtection = clearGalleryProtection;

// Función para resetear específicamente la protección del DOMContentLoaded
function resetDOMContentLoadedProtection() {
  isDOMContentLoadedExecuted = false;
  console.log('🔄 Protección de DOMContentLoaded reseteada');
}

// Hacer función disponible globalmente
window.resetDOMContentLoadedProtection = resetDOMContentLoadedProtection;

// ===== Auto refresh de Portada =====
let coverRefreshTimer = null;
function startCoverAutoRefresh() {
  if (coverRefreshTimer) clearInterval(coverRefreshTimer);
  coverRefreshTimer = setInterval(() => {
    if (!isLoadingGallery) {
      updateCoverSection();
      updateCoverButtons();
    }
  }, 30000); // cada 30s
}
window.addEventListener('beforeunload', () => {
  if (coverRefreshTimer) clearInterval(coverRefreshTimer);
});

// Función para crear un elemento de galería
function createGalleryItem(imageData, index) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.dataset.index = index;
  item.dataset.filename = imageData.filename; // Agregar filename para eliminación
  
  const img = document.createElement('img');
  
  // Si viene URL pública (Blob), úsala; si no, fallback a /uploads/
  img.src = imageData.url ? imageData.url : `/uploads/${imageData.filename}`;
  
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
    sendMetric('cover_toggle', imageData.filename);
  };
  
  const expandBtn = document.createElement('button');
  expandBtn.className = 'gallery-action-btn';
  expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
  expandBtn.title = 'Ver en pantalla completa';
  expandBtn.onclick = (e) => {
    e.stopPropagation();
    openLightbox(index);
    sendMetric('lightbox_open', imageData.filename);
  };
  
  const heroBtn = document.createElement('button');
  heroBtn.className = 'gallery-action-btn hero-btn';
  heroBtn.innerHTML = '<i class="fas fa-home"></i>';
  heroBtn.title = 'Establecer como imagen del hero';
  heroBtn.onclick = (e) => {
    e.stopPropagation();
    setHeroImage(imageData.filename);
    // métrica final se envía en setHeroImage() al confirmarse en backend
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
  // Solo configurar si no está cargando la galería
  if (isLoadingGallery) {
    console.log('🔄 setupLightbox saltado - galería cargando');
    return;
  }
  
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
  fullImg.src = imageData.url ? imageData.url : `/uploads/${imageData.filename}`;
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
    fullImg.src = newImageData.url ? newImageData.url : `/uploads/${newImageData.filename}`;
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
      sendMetric('delete', filename);
      
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
      
      // Remover la imagen del DOM sin recargar toda la galería
      setTimeout(() => {
        const imageElement = document.querySelector(`[data-filename="${filename}"]`);
        if (imageElement) {
          imageElement.remove();
          console.log('✅ Imagen removida del DOM sin recargar galería');
        }
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
async function toggleCoverImage(filename, index) {
  // Portada ÚNICA: servidor es la fuente de verdad
  const optimistic = [filename];
  try {
    const serverList = await persistCoverImagesServer(optimistic);
    const finalList = Array.isArray(serverList) ? serverList : optimistic;
    localStorage.setItem('coverImages', JSON.stringify(finalList));
    if (finalList.length === 0) {
      showNotification('Imagen removida de la portada', 'info');
    } else {
      showNotification('Imagen establecida como portada', 'success');
    }
  } catch (_) {
    // fallback local para no quedar sin feedback
    localStorage.setItem('coverImages', JSON.stringify(optimistic));
  }
  // Tras persistir, refrescar desde servidor para evitar carreras
  await updateCoverSection();
  updateCoverButtons();
}

async function persistCoverImagesServer(list) {
  try {
    const r = await fetch('/api/cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverImages: list })
    });
    if (r.ok) {
      const j = await r.json();
      return j && Array.isArray(j.coverImages) ? j.coverImages : list;
    }
  } catch (_) {}
  return list;
}

// Función para actualizar botones de portada
async function updateCoverButtons() {
  // Consultar al servidor para evitar desfasajes
  let coverImages = [];
  try {
    const r = await fetch('/api/cover');
    if (r.ok) {
      const j = await r.json();
      coverImages = Array.isArray(j.coverImages) ? j.coverImages : [];
      localStorage.setItem('coverImages', JSON.stringify(coverImages));
    }
  } catch (_) {
    coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
  }
  const coverButtons = document.querySelectorAll('.cover-btn, .lightbox-action-btn.cover-btn');
  
  coverButtons.forEach((btn, index) => {
    const imageData = allImages[index] || allImages[index % (allImages.length || 1)];
    if (!imageData) return; // Guardar si no hay correspondencia
    if (coverImages.includes(imageData.filename)) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fas fa-star"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="far fa-star"></i>';
    }
  });

  // Resaltar tarjeta seleccionada como portada (borde azul)
  const items = document.querySelectorAll('#gallery-grid .gallery-item');
  items.forEach((item) => {
    const fn = item.getAttribute('data-filename');
    if (fn && coverImages.includes(fn)) {
      item.classList.add('selected-cover');
    } else {
      item.classList.remove('selected-cover');
    }
  });
}

// Función para cargar configuración de portada
function loadCoverSettings() {
  // Solo cargar si no está cargando ya
  if (!isLoadingGallery) {
    setTimeout(() => {
      updateCoverButtons();
      updateCoverSection();
    }, 500);
  }
}

// Función para actualizar la sección de fotos de portada
async function updateCoverSection() {
  // Protección contra ejecuciones múltiples
  if (isLoadingGallery) {
    console.log('🔄 updateCoverSection pospuesto - galería cargando');
    setTimeout(() => {
      // Reintentar cuando la galería probablemente ya esté cargada
      if (!isLoadingGallery) {
        updateCoverSection();
      } else {
        // Volver a intentar en otro ciclo si sigue cargando
        setTimeout(() => updateCoverSection(), 300);
      }
    }, 300);
    return;
  }
  
  const coverGrid = document.getElementById('cover-grid');
  const coverEmpty = document.getElementById('cover-empty');
  const coverSection = document.querySelector('.cover-section');
  
  if (!coverGrid || !coverEmpty) return;
  
  // Estado del servidor es la verdad. Fallback a localStorage solo si la API falla.
  let coverImages = [];
  let itemsFromServer = [];
  try {
    const r = await fetch('/api/cover');
    if (r.ok) {
      const j = await r.json();
      coverImages = Array.isArray(j.coverImages) ? j.coverImages : [];
      itemsFromServer = Array.isArray(j.items) ? j.items : [];
      localStorage.setItem('coverImages', JSON.stringify(coverImages));
    } else {
      coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
    }
  } catch (_) {
    coverImages = JSON.parse(localStorage.getItem('coverImages') || '[]');
  }
  
  if (coverImages.length === 0) {
    coverGrid.style.display = 'none';
    coverEmpty.style.display = 'block';
    coverSection.classList.remove('has-cover-image');
    return;
  }
  
  coverGrid.style.display = 'grid';
  coverEmpty.style.display = 'none';
  coverGrid.innerHTML = '';
  
  // Preparar mapa de imágenes por filename; si falta info, pedir /api/images
  let imagesByFilename = new Map((allImages || []).map(img => [img.filename, img]));
  if (coverImages.some(fn => !imagesByFilename.has(fn))) {
    try {
      const ri = await fetch('/api/images');
      if (ri.ok) {
        const list = await ri.json();
        imagesByFilename = new Map((list || []).map(img => [img.filename, img]));
      }
    } catch (_) {}
  }
  // Complementar URLs con lo que venga del servidor
  itemsFromServer.forEach(it => {
    if (it && it.filename && it.url) {
      const found = imagesByFilename.get(it.filename);
      if (found) found.url = it.url;
    }
  });

  // Tomar la primera imagen como fondo principal
  const firstImageData = imagesByFilename.get(coverImages[0]);
  if (firstImageData && coverSection) {
    coverSection.classList.add('has-cover-image');
    // Crear un fondo sutil con la primera imagen (usar URL pública si existe)
    const bgSrc = firstImageData.url ? firstImageData.url : `/uploads/${firstImageData.filename}`;
    coverSection.style.backgroundImage = `linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(51, 51, 51, 0.8) 100%), url('${bgSrc}')`;
    coverSection.style.backgroundSize = 'cover';
    coverSection.style.backgroundPosition = 'center';
    coverSection.style.backgroundAttachment = 'fixed';
  }
  
  coverImages.forEach(filename => {
    const imageData = imagesByFilename.get(filename) || { filename, url: null, title: 'Foto de Portada' };
    const coverItem = createCoverItem(imageData, false);
    coverGrid.appendChild(coverItem);
  });
}

// Función para crear un elemento de portada
function createCoverItem(imageData, isHeroImage = false) {
  const item = document.createElement('div');
  item.className = `cover-item ${isHeroImage ? 'hero-image' : ''}`;
  item.setAttribute('data-filename', imageData.filename || '');
  
  const img = document.createElement('img');
  
  img.src = imageData.url ? imageData.url : `/uploads/${imageData.filename}`;
  
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
        // Además, si estaba en portadas, removerla de Portada
        const current = JSON.parse(localStorage.getItem('coverImages') || '[]');
        const idx = current.indexOf(imageData.filename);
        if (idx > -1) {
          current.splice(idx, 1);
          localStorage.setItem('coverImages', JSON.stringify(current));
          persistCoverImagesServer(current).catch(()=>{});
          setTimeout(() => updateCoverSection(), 200);
        }
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
  const maxSize = 30 * 1024 * 1024; // 30MB
  const maxFiles = 15;
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

  // Asegurar inicialización aunque la galería esté cargando.
  // Si está cargando, volvemos a intentar en breve (máx 5 veces) sin duplicar listeners.
  if (isLoadingGallery) {
    window.__uploadInitAttempts = (window.__uploadInitAttempts || 0) + 1;
    if (window.__uploadInitAttempts <= 5) {
      console.log('🔄 setupUploadForm diferido - galería cargando');
      setTimeout(setupUploadForm, 300);
    }
  }

  if (fileInput.__uploadBound) return; // evitar duplicar listeners
  fileInput.__uploadBound = true;
  
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
      // Subir en lotes para evitar 413 (límite de payload de Vercel)
      const batchesResult = await uploadFilesInBatches(Array.from(selectedFiles), (done, total) => {
        const uploadingText = `<i class="fas fa-spinner fa-spin"></i> Subiendo lote ${done}/${total}...`;
        submitBtn.innerHTML = uploadingText;
      });

      // métrica de subida
      sendMetric('upload', 'batch', { files: selectedFiles.length });

      // Consolidar archivos subidos
      const uploadedAll = batchesResult.flatMap(r => (r && r.files) ? r.files : []);
      showNotification(`Subida completada: ${uploadedAll.length} foto(s)`, 'success');

      // Auto-agregar al álbum seleccionado si corresponde
      await handleAutoAddToSelectedAlbum(uploadedAll);

      // Recargar galería
      setTimeout(() => { if (!isLoadingGallery) loadGalleryImages(); }, 500);

      // Resetear formulario
      form.reset();
      fileLabel.innerHTML = `
        <i class=\"fas fa-images\"></i>
        <span>Seleccionar imágenes</span>
      `;
      fileLabel.style.borderColor = '#d4af37';
      fileLabel.style.background = 'rgba(212, 175, 55, 0.05)';

    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Error al subir las imágenes', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Subir archivos en lotes pequeños para evitar 413 (límite de body en serverless)
async function uploadFilesInBatches(files, onProgress) {
  const MAX_BATCH_BYTES = 4 * 1024 * 1024; // ~4MB por request
  const MAX_FILES_PER_BATCH = 5; // seguridad adicional
  const batches = [];

  let i = 0;
  while (i < files.length) {
    let batch = [];
    let size = 0;
    while (i < files.length) {
      const f = files[i];
      const fitsCount = batch.length < MAX_FILES_PER_BATCH;
      const fitsSize = (size + f.size) <= MAX_BATCH_BYTES || batch.length === 0; // si no entra, enviar solo ese
      if (fitsCount && fitsSize) {
        batch.push(f);
        size += f.size;
        i++;
      } else {
        break;
      }
    }
    batches.push(batch);
  }

  const results = [];
  for (let b = 0; b < batches.length; b++) {
    const form = new FormData();
    batches[b].forEach(file => form.append('photo', file));
    if (onProgress) onProgress(b + 1, batches.length);

    const resp = await fetch('/upload', { method: 'POST', body: form });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Upload falló (HTTP ${resp.status}) ${text?.slice(0,120)}`);
    }
    let json = {};
    try { json = await resp.json(); } catch (_) { json = { success: true, files: [] }; }
    results.push(json);
  }
  return results;
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  // Crear contenedor de notificaciones si no existe
  let notificationContainer = document.querySelector('#notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(notificationContainer);
  }
  
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
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        min-width: 300px;
      }
      .notification-success { border-left: 4px solid #28a745; }
      .notification-error { border-left: 4px solid #dc3545; }
      .notification-info { border-left: 4px solid #17a2b8; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .notification.removing {
        animation: slideOut 0.3s ease forwards;
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Agregar la notificación al contenedor
  notificationContainer.appendChild(notification);
  
  // Remover después de 3 segundos con animación
  setTimeout(() => {
    notification.classList.add('removing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
      // Si no hay más notificaciones, remover el contenedor
      if (notificationContainer.children.length === 0) {
        notificationContainer.remove();
      }
    }, 300);
  }, 3000);
}

// Función para crear efecto fantasma de desplazamiento
function createGhostEffect(targetIndex) {
  // Limpiar efectos fantasma anteriores
  clearGhostEffects();
  
  // Obtener todos los elementos de la galería
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  // Obtener información de la grilla
  const gridContainer = document.getElementById('gallery-grid');
  const gridRect = gridContainer.getBoundingClientRect();
  const itemRect = galleryItems[0]?.getBoundingClientRect();
  
  if (!itemRect) return;
  
  // Calcular columnas por fila basado en el CSS grid
  const itemWidth = itemRect.width;
  const itemMargin = 20; // Margen entre elementos
  const effectiveItemWidth = itemWidth + itemMargin;
  const columnsPerRow = Math.floor(gridRect.width / effectiveItemWidth);
  
  // Calcular posición en la grilla (fila y columna)
  const getGridPosition = (index) => {
    const row = Math.floor(index / columnsPerRow);
    const col = index % columnsPerRow;
    return { row, col };
  };
  
  const draggedPos = getGridPosition(draggedIndex);
  const targetPos = getGridPosition(targetIndex);
  
  // Determinar dirección del movimiento
  const isMovingDown = draggedIndex < targetIndex;
  const isMovingUp = draggedIndex > targetIndex;
  
  // Aplicar efectos fantasma inteligentes
  if (isMovingDown) {
    // Arrastrando hacia abajo: elementos se mueven hacia arriba
    for (let i = draggedIndex + 1; i <= targetIndex; i++) {
      if (galleryItems[i]) {
        const currentPos = getGridPosition(i);
        const shiftDirection = getShiftDirection(currentPos, draggedPos, targetPos, columnsPerRow);
        galleryItems[i].classList.add(shiftDirection);
      }
    }
  } else if (isMovingUp) {
    // Arrastrando hacia arriba: elementos se mueven hacia abajo
    for (let i = targetIndex; i < draggedIndex; i++) {
      if (galleryItems[i]) {
        const currentPos = getGridPosition(i);
        const shiftDirection = getShiftDirection(currentPos, draggedPos, targetPos, columnsPerRow);
        galleryItems[i].classList.add(shiftDirection);
      }
    }
  }
}

// Función auxiliar para determinar la dirección del desplazamiento
function getShiftDirection(currentPos, draggedPos, targetPos, columnsPerRow) {
  const { row: currentRow, col: currentCol } = currentPos;
  const { row: draggedRow, col: draggedCol } = draggedPos;
  const { row: targetRow, col: targetCol } = targetPos;
  
  // Si estamos en la misma fila
  if (currentRow === draggedRow) {
    if (draggedCol < targetCol) {
      // Moviendo hacia la derecha: elementos se mueven a la izquierda
      return 'ghost-shift-left';
    } else {
      // Moviendo hacia la izquierda: elementos se mueven a la derecha
      return 'ghost-shift-right';
    }
  }
  
  // Si estamos en filas diferentes
  if (currentRow < draggedRow) {
    // Elementos arriba se mueven hacia abajo
    return 'ghost-shift-down';
  } else if (currentRow > draggedRow) {
    // Elementos abajo se mueven hacia arriba
    return 'ghost-shift-up';
  }
  
  // Por defecto, desplazamiento horizontal
  return draggedCol < targetCol ? 'ghost-shift-left' : 'ghost-shift-right';
}

// Función para limpiar efectos fantasma
function clearGhostEffects() {
  document.querySelectorAll('.ghost-shift-left, .ghost-shift-right, .ghost-shift-up, .ghost-shift-down').forEach(item => {
    item.classList.remove('ghost-shift-left', 'ghost-shift-right', 'ghost-shift-up', 'ghost-shift-down');
  });
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
  if (window.loadAdminGallery && !isLoadingGallery) {
    window.loadAdminGallery();
  }
  
  // 3. Restaurar título original
  const sectionHeader = document.querySelector('#gallery .section-header h2');
  if (sectionHeader) {
    sectionHeader.textContent = 'Galería de Fotos';
  }
  
  // 4. Hacer scroll a la galería aun si está cargando (reintentos suaves)
  const tryScroll = (attemptsLeft = 10) => {
    const targetElement = document.querySelector('#gallery');
    const header = document.querySelector('.header');
    if (targetElement && header) {
      const headerHeight = header.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
    }
    if (attemptsLeft > 0 && (isLoadingGallery || !targetElement)) {
      setTimeout(() => tryScroll(attemptsLeft - 1), 200);
    }
  };
  setTimeout(() => tryScroll(10), 50);
}

// Función para animar elementos cuando entran en el viewport
function setupScrollAnimations() {
  // Solo configurar si no está cargando la galería
  if (isLoadingGallery) {
    console.log('🔄 setupScrollAnimations saltado - galería cargando');
    return;
  }
  
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
      sendMetric('hero_set', filename);
      
      // Actualizar botones de hero
      updateHeroButtons();
      
      // Actualizar también la sección de portada para mostrar la nueva imagen del hero
      // Solo si no está cargando ya
      if (!isLoadingGallery) {
        setTimeout(() => {
          updateCoverSection();
        }, 300);
      }
      
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
  // Protección contra ejecuciones múltiples
  if (isLoadingGallery) {
    console.log('🔄 updateHeroButtons saltado - galería cargando');
    return;
  }
  
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
  // Solo actualizar botones si no está cargando la galería
  if (!isLoadingGallery) {
    updateHeroButtons();
  }
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
      const alreadyIn = Array.isArray(album.images) && album.images.includes(imageFilename);
      option.className = `album-option${alreadyIn ? ' selected' : ''}`;
      option.innerHTML = `
        <span class="album-option-name">${alreadyIn ? '✓ ' : ''}${album.name}</span>
        <span class="album-option-count">${album.images ? album.images.length : 0}</span>
      `;

      option.addEventListener('click', async () => {
        let success = false;
        if (option.classList.contains('selected')) {
          success = await window.albumsManager.removeImageFromAlbum(imageFilename, album.id);
          if (success) {
            option.classList.remove('selected');
            // actualizar contador visual
            const count = option.querySelector('.album-option-count');
            if (count) count.textContent = String(Math.max(0, (album.images?.length || 1) - 1));
            const nameEl = option.querySelector('.album-option-name');
            if (nameEl) nameEl.textContent = album.name;
          }
        } else {
          success = await window.albumsManager.addImageToAlbum(imageFilename, album.id);
          if (success) {
            option.classList.add('selected');
            const count = option.querySelector('.album-option-count');
            if (count) count.textContent = String((album.images?.length || 0) + 1);
            const nameEl = option.querySelector('.album-option-name');
            if (nameEl) nameEl.textContent = `✓ ${album.name}`;
          }
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
