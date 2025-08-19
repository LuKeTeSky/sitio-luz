// Script para manejar la funcionalidad de álbumes
class AlbumsManager {
    constructor() {
        this.albums = [];
        this.currentAlbum = null;
        this.selectedAlbum = null; // Álbum actualmente seleccionado
        this.currentlyShowingAlbumId = null; // ID del álbum que se está mostrando en galería
        this.isEditing = false;
        this.editingAlbumId = null;
        
        this.init();
    }

    async init() {
        await this.loadAlbums();
        this.setupEventListeners();
        this.setupSidebarToggle();
    }

    setupEventListeners() {
        // Botón crear álbum
        const btnCreateAlbum = document.getElementById('btn-create-album');
        if (btnCreateAlbum) {
            btnCreateAlbum.addEventListener('click', () => this.openCreateModal());
        }

        // Modal
        const modal = document.getElementById('album-modal');
        const modalClose = document.getElementById('modal-close');
        const btnCancel = document.getElementById('btn-cancel');
        const albumForm = document.getElementById('album-form');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.closeModal());
        }

        if (albumForm) {
            albumForm.addEventListener('submit', (e) => this.handleAlbumSubmit(e));
            // slug live validation
            const slugInput = document.getElementById('album-slug');
            if (slugInput) {
                const hint = document.getElementById('slug-hint');
                const updateHint = () => {
                    const raw = slugInput.value || document.getElementById('album-name')?.value || '';
                    const slug = (raw || '')
                      .normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
                      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
                    const exists = this.albums.some(a => (a.slug||'')===slug && (!this.isEditing || a.id!==this.editingAlbumId));
                    if (hint) {
                        hint.style.display = 'block';
                        hint.textContent = exists ? `Slug en uso: ${slug} (se ajustará automáticamente)` : `Slug: ${slug}`;
                        hint.style.color = exists ? '#b00020' : '#666';
                    }
                };
                slugInput.addEventListener('input', updateHint);
                const nameInput = document.getElementById('album-name');
                if (nameInput) nameInput.addEventListener('input', updateHint);
                setTimeout(updateHint,0);
            }
        }

        // Guardar edición con Enter desde inputs
        ['album-name', 'album-description', 'album-campaign'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
                        const form = document.getElementById('album-form');
                        if (form) form.requestSubmit();
                    }
                });
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Cerrar modal haciendo clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    setupSidebarToggle() {
        const sidebar = document.getElementById('albums-sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const mainContent = document.getElementById('main-content');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
                
                // Cambiar icono
                const icon = sidebarToggle.querySelector('i');
                if (sidebar.classList.contains('collapsed')) {
                    icon.className = 'fas fa-chevron-right';
                } else {
                    icon.className = 'fas fa-chevron-left';
                }
            });
        }

        // Agregar botón flotante para crear álbum cuando el sidebar está colapsado
        this.setupFloatingCreateButton();

        // Móvil: mostrar/ocultar sidebar
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }

        // Botón hamburguesa para móvil (se puede agregar al header)
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });

        // Agregar botón móvil al header si existe
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && window.innerWidth <= 768) {
            navMenu.appendChild(mobileMenuBtn);
        }
    }

    async loadAlbums() {
        try {
            const response = await fetch('/api/albums');
            if (response.ok) {
                this.albums = await response.json();
                this.renderAlbums();
            } else {
                console.error('Error cargando álbumes:', response.statusText);
            }
        } catch (error) {
            console.error('Error cargando álbumes:', error);
        }
    }

    renderAlbums() {
        const albumsList = document.getElementById('albums-list');
        if (!albumsList) return;

        albumsList.innerHTML = '';

        if (this.albums.length === 0) {
            albumsList.innerHTML = `
                <div class="album-empty">
                    <i class="fas fa-book-open"></i>
                    <p>No hay álbumes creados</p>
                    <small>Crea tu primer álbum para organizar tus fotos</small>
                </div>
            `;
            return;
        }

        this.albums.forEach(album => {
            const albumElement = this.createAlbumElement(album);
            albumsList.appendChild(albumElement);
        });

        // Configurar drag & drop después de renderizar
        this.setupDragAndDrop();
    }

    createAlbumElement(album) {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album-item';
        albumDiv.dataset.albumId = album.id;
        albumDiv.draggable = true; // Hacer el elemento draggable

        albumDiv.innerHTML = `
            <div class="album-drag-handle" title="Arrastrar para reordenar">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="album-header">
                <h4 class="album-name">${album.name}</h4>
                <div class="album-actions">
                    <span class="album-count">${album.images ? album.images.length : 0}</span>
                    <button class="album-edit-btn" title="Editar álbum">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="album-delete-btn" title="Eliminar álbum">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${album.campaign ? `<div class="album-campaign">${album.campaign}</div>` : ''}
            ${album.description ? `<p class="album-description">${album.description}</p>` : ''}
        `;

        // Event listeners para el álbum
        albumDiv.addEventListener('click', (e) => {
            // No seleccionar si se hace clic en el botón de eliminar
            if (!e.target.closest('.album-delete-btn')) {
                this.selectAlbum(album);
            }
        });
        albumDiv.addEventListener('dblclick', (e) => {
            // No editar si se hace clic en el botón de eliminar
            if (!e.target.closest('.album-delete-btn')) {
                this.editAlbum(album);
            }
        });

        // Event listener para el botón de eliminar
        const deleteBtn = albumDiv.querySelector('.album-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteAlbum(album.id);
            });
        }

        // Event listener para el botón de editar (acceso directo)
        const editBtn = albumDiv.querySelector('.album-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editAlbum(album);
            });
        }

        return albumDiv;
    }

    selectAlbum(album) {
        // Remover selección anterior
        document.querySelectorAll('.album-item').forEach(item => {
            item.classList.remove('active');
        });

        // Seleccionar álbum actual
        const albumElement = document.querySelector(`[data-album-id="${album.id}"]`);
        if (albumElement) {
            albumElement.classList.add('active');
        }

        this.currentAlbum = album;
        this.selectedAlbum = album; // Guardar como álbum seleccionado para auto-agregado
        
        // Mostrar las fotos del álbum seleccionado
        this.displayAlbumImages(album);
        
        // Scroll suave a la galería
        document.getElementById('gallery')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        console.log('Álbum seleccionado:', album);
    }

    async displayAlbumImages(album) {
        try {
            // Marcar que se está mostrando este álbum
            this.currentlyShowingAlbumId = album.id;
            
            // Obtener todas las imágenes
            const response = await fetch('/api/images');
            const allImages = await response.json();
            
            // Filtrar solo las imágenes del álbum seleccionado que realmente existen
            const albumImages = allImages.filter(image => 
                album.images && album.images.includes(image.filename) && image.filename
            ).map(img => ({ ...img, url: img.url || (img.filename ? undefined : undefined) }));
            
            // Verificar si hay imágenes huérfanas (referencias en el álbum que ya no existen)
            const existingImageFilenames = allImages.map(img => img.filename);
            const orphanedImages = album.images ? album.images.filter(filename => 
                !existingImageFilenames.includes(filename)
            ) : [];
            
            // Si hay imágenes huérfanas, limpiarlas automáticamente
            if (orphanedImages.length > 0) {
                console.warn(`Álbum "${album.name}" contiene ${orphanedImages.length} referencia(s) a imagen(es) inexistente(s):`, orphanedImages);
                console.log('Limpiando referencias huérfanas...');
                
                // Limpiar las referencias huérfanas automáticamente
                try {
                    await this.cleanupOrphanedImages(album.id, orphanedImages);
                } catch (error) {
                    console.error('Error limpiando referencias huérfanas:', error);
                }
            }
            
            const galleryGrid = document.getElementById('gallery-grid');
            if (!galleryGrid) return;
            
            // Limpiar galería
            galleryGrid.innerHTML = '';
            
            if (albumImages.length === 0) {
                // Mostrar mensaje cuando el álbum está vacío
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'album-empty-message';
                emptyMessage.innerHTML = `
                    <div class="empty-album-content">
                        <i class="fas fa-images"></i>
                        <h3>Álbum vacío</h3>
                        <p>El álbum "${album.name}" no tiene fotos aún.</p>
                        <p>Agrega fotos haciendo clic en el botón 📚 en cualquier imagen de la galería completa.</p>
                        <button class="btn-show-all" id="btn-show-all-empty">
                            Ver todas las fotos
                        </button>
                    </div>
                `;
                
                // Agregar event listener al botón
                const showAllBtn = emptyMessage.querySelector('#btn-show-all-empty');
                if (showAllBtn) {
                    showAllBtn.addEventListener('click', () => this.showAllImages());
                }
                galleryGrid.appendChild(emptyMessage);
            } else {
                // Mostrar encabezado del álbum
                const albumHeader = document.createElement('div');
                albumHeader.className = 'album-header';
                albumHeader.innerHTML = `
                    <div class="album-info">
                        <h3><i class="fas fa-book-open"></i> ${album.name}</h3>
                        ${album.description ? `<p class="album-description">${album.description}</p>` : ''}
                        ${album.campaign ? `<span class="album-campaign">Campaña: ${album.campaign}</span>` : ''}
                        <span class="album-count">${albumImages.length} foto${albumImages.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button class="btn-show-all" id="btn-show-all-header">
                        <i class="fas fa-th"></i> Ver todas las fotos
                    </button>
                `;
                
                // Agregar event listener al botón
                const showAllHeaderBtn = albumHeader.querySelector('#btn-show-all-header');
                if (showAllHeaderBtn) {
                    showAllHeaderBtn.addEventListener('click', () => this.showAllImages());
                }
                galleryGrid.appendChild(albumHeader);
                
                // Mostrar las imágenes del álbum
                albumImages.forEach((image, index) => {
                    const galleryItem = this.createAlbumGalleryItem(image, index, albumImages);
                    galleryGrid.appendChild(galleryItem);
                });
            }
            
            // Actualizar el título de la sección
            const sectionHeader = document.querySelector('#gallery .section-header h2');
            if (sectionHeader) {
                sectionHeader.innerHTML = `<i class="fas fa-book-open"></i> ${album.name}`;
            }
            
        } catch (error) {
            console.error('Error cargando imágenes del álbum:', error);
        }
    }

    createAlbumGalleryItem(imageData, index, albumImages) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = imageData.url || `/uploads/${imageData.filename}`;
        img.alt = imageData.title || 'Foto';
        img.loading = 'lazy';
        
        // Al hacer clic en la imagen, abrir lightbox con solo las imágenes del álbum
        img.addEventListener('click', () => {
            if (window.openLightbox) {
                window.openLightbox(index, albumImages);
            }
        });
        
        item.appendChild(img);
        return item;
    }

    showAllImages() {
        console.log('showAllImages() llamado');
        
        // Mostrar todas las imágenes de nuevo
        this.currentAlbum = null;
        this.selectedAlbum = null; // Limpiar selección para auto-agregado
        this.currentlyShowingAlbumId = null; // No mostrando álbum específico
        
        // Remover selección de álbumes
        document.querySelectorAll('.album-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Restaurar título original
        const sectionHeader = document.querySelector('#gallery .section-header h2');
        if (sectionHeader) {
            sectionHeader.textContent = 'Galería de Fotos';
            console.log('Título restaurado a "Galería de Fotos"');
        } else {
            console.warn('No se encontró el header de la galería');
        }
        
        // Recargar todas las imágenes (usar función existente de gallery.js)
        if (window.loadAdminGallery) {
            console.log('Llamando a loadAdminGallery...');
            window.loadAdminGallery();
        } else {
            console.error('loadAdminGallery no está disponible');
        }
        
        console.log('showAllImages() completado');

        // Scroll al inicio de la galería similar al botón de navbar "Galería"
        setTimeout(() => {
            const targetElement = document.querySelector('#gallery');
            const header = document.querySelector('.header');
            if (targetElement && header) {
                const headerHeight = header.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
            }
        }, 100);
    }

    // Método para obtener el álbum actualmente seleccionado (usado por gallery.js)
    getSelectedAlbum() {
        return this.selectedAlbum;
    }

    // Método para verificar si se está mostrando un álbum específico
    isShowingAlbum(albumId) {
        return this.currentlyShowingAlbumId === albumId;
    }

    // Método para obtener todos los álbumes (usado por gallery.js)
    getAlbums() {
        return this.albums;
    }

    editAlbum(album) {
        this.isEditing = true;
        this.editingAlbumId = album.id;
        this.openEditModal(album);
    }

    openCreateModal() {
        this.isEditing = false;
        this.editingAlbumId = null;
        
        const modal = document.getElementById('album-modal');
        const modalTitle = document.getElementById('modal-title');
        const albumForm = document.getElementById('album-form');

        if (modalTitle) modalTitle.textContent = 'Nuevo Álbum';
        if (albumForm) albumForm.reset();

        modal.classList.add('active');
    }

    openEditModal(album) {
        const modal = document.getElementById('album-modal');
        const modalTitle = document.getElementById('modal-title');
        const albumName = document.getElementById('album-name');
        const albumDescription = document.getElementById('album-description');
        const albumCampaign = document.getElementById('album-campaign');

        if (modalTitle) modalTitle.textContent = 'Editar Álbum';
        if (albumName) albumName.value = album.name || '';
        if (albumDescription) albumDescription.value = album.description || '';
        if (albumCampaign) albumCampaign.value = album.campaign || '';
        const albumSlug = document.getElementById('album-slug');
        if (albumSlug) albumSlug.value = album.slug || '';
        const albumCover = document.getElementById('album-cover');
        if (albumCover) albumCover.value = album.coverImage || '';
        const albumFeatured = document.getElementById('album-featured');
        if (albumFeatured) albumFeatured.checked = !!album.featured;

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('album-modal');
        modal.classList.remove('active');
        
        this.isEditing = false;
        this.editingAlbumId = null;
    }

    async handleAlbumSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const albumData = {
            name: formData.get('name'),
            description: formData.get('description'),
            campaign: formData.get('campaign'),
            slug: (formData.get('slug') || '').trim() || undefined,
            coverImage: (formData.get('coverImage') || '').trim(),
            featured: document.getElementById('album-featured')?.checked || false
        };

        try {
            let response;
            if (this.isEditing) {
                // Editar álbum existente
                response = await fetch(`/api/albums/${this.editingAlbumId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(albumData)
                });
            } else {
                // Crear nuevo álbum
                response = await fetch('/api/albums', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(albumData)
                });
            }

            if (response.ok) {
                this.closeModal();
                await this.loadAlbums();
                try { await fetch('/api/metrics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type: this.isEditing ? 'album_update' : 'album_create'})}); } catch (_) {}
                
                // Mostrar mensaje de éxito
                this.showNotification(
                    this.isEditing ? 'Álbum actualizado correctamente' : 'Álbum creado correctamente',
                    'success'
                );
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error guardando álbum:', error);
            this.showNotification('Error al guardar el álbum', 'error');
        }
    }

    async deleteAlbum(albumId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este álbum?')) {
            return;
        }

        try {
            const response = await fetch(`/api/albums/${albumId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadAlbums();
                this.showNotification('Álbum eliminado correctamente', 'success');
                try { await fetch('/api/metrics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'album_delete'})}); } catch(_) {}
            } else {
                throw new Error('Error eliminando álbum');
            }
        } catch (error) {
            console.error('Error eliminando álbum:', error);
            this.showNotification('Error al eliminar el álbum', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos básicos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Método para agregar imagen a álbum (llamado desde gallery.js)
    async addImageToAlbum(imageId, albumId) {
        try {
            const response = await fetch(`/api/albums/${albumId}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageId })
            });

            if (response.ok) {
                await this.loadAlbums();
                this.showNotification('Imagen agregada al álbum', 'success');
                return true;
            } else {
                throw new Error('Error agregando imagen al álbum');
            }
        } catch (error) {
            console.error('Error agregando imagen al álbum:', error);
            this.showNotification('Error al agregar imagen al álbum', 'error');
            return false;
        }
    }

    // Método para remover imagen de álbum
    async removeImageFromAlbum(imageId, albumId) {
        try {
            const response = await fetch(`/api/albums/${albumId}/images/${imageId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadAlbums();
                this.showNotification('Imagen removida del álbum', 'success');
                return true;
            } else {
                throw new Error('Error removiendo imagen del álbum');
            }
        } catch (error) {
            console.error('Error removiendo imagen del álbum:', error);
            this.showNotification('Error al remover imagen del álbum', 'error');
            return false;
        }
    }

    // Método para obtener álbumes (para usar en gallery.js)
    getAlbums() {
        return this.albums;
    }

    // Método para limpiar referencias huérfanas de imágenes eliminadas
    async cleanupOrphanedImages(albumId, orphanedImages) {
        try {
            // Remover cada imagen huérfana del álbum
            for (const imageId of orphanedImages) {
                const response = await fetch(`/api/albums/${albumId}/images/${imageId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log(`Referencia huérfana ${imageId} eliminada del álbum ${albumId}`);
                } else {
                    console.warn(`No se pudo eliminar referencia huérfana ${imageId} del álbum ${albumId}`);
                }
            }
            
            // Recargar los álbumes después de la limpieza
            await this.loadAlbums();
            
            this.showNotification(`${orphanedImages.length} referencia(s) de imagen(es) eliminada(s) limpiadas automáticamente`, 'info');
            
            return true;
        } catch (error) {
            console.error('Error en limpieza de referencias huérfanas:', error);
            return false;
        }
    }

    // Configurar botón flotante para crear álbum
    setupFloatingCreateButton() {
        // Crear botón flotante
        const floatingBtn = document.createElement('button');
        floatingBtn.className = 'floating-create-album';
        floatingBtn.innerHTML = '<i class="fas fa-plus"></i>';
        floatingBtn.title = 'Crear nuevo álbum';
        floatingBtn.addEventListener('click', () => this.openCreateModal());
        
        document.body.appendChild(floatingBtn);
        
        // Mostrar/ocultar según el estado del sidebar
        const sidebar = document.getElementById('albums-sidebar');
        const updateFloatingBtn = () => {
            if (sidebar.classList.contains('collapsed')) {
                floatingBtn.style.display = 'flex';
            } else {
                floatingBtn.style.display = 'none';
            }
        };
        
        // Observar cambios en el sidebar
        const observer = new MutationObserver(updateFloatingBtn);
        observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        
        // Estado inicial
        updateFloatingBtn();
    }

    // Configurar eventos de drag & drop para reordenar álbumes
    setupDragAndDrop() {
        const albumsList = document.getElementById('albums-list');
        if (!albumsList) return;

        let draggedElement = null;
        let draggedIndex = null;

        albumsList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('album-item')) {
                draggedElement = e.target;
                draggedIndex = Array.from(albumsList.children).indexOf(draggedElement);
                
                // Estilo visual durante drag
                e.target.classList.add('dragging');
                e.target.style.opacity = '0.5';
                
                // Configurar datos de transferencia
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.outerHTML);
            }
        });

        albumsList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('album-item')) {
                e.target.classList.remove('dragging');
                e.target.style.opacity = '';
                
                // Limpiar indicadores de drop
                const items = albumsList.querySelectorAll('.album-item');
                items.forEach(item => {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });
            }
        });

        albumsList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const targetItem = e.target.closest('.album-item');
            if (targetItem && targetItem !== draggedElement) {
                // Limpiar indicadores previos
                const items = albumsList.querySelectorAll('.album-item');
                items.forEach(item => {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                // Determinar posición de drop
                const rect = targetItem.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    targetItem.classList.add('drag-over-top');
                } else {
                    targetItem.classList.add('drag-over-bottom');
                }
            }
        });

        albumsList.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const targetItem = e.target.closest('.album-item');
            if (targetItem && targetItem !== draggedElement) {
                const targetIndex = Array.from(albumsList.children).indexOf(targetItem);
                
                // Determinar nueva posición
                const rect = targetItem.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                const insertAfter = e.clientY >= midY;
                
                let newIndex = targetIndex;
                if (insertAfter) {
                    newIndex = targetIndex + 1;
                }

                // Ajustar índice si movemos hacia arriba
                if (draggedIndex < newIndex) {
                    newIndex--;
                }

                // Reordenar elementos en el DOM
                if (insertAfter && targetItem.nextSibling) {
                    albumsList.insertBefore(draggedElement, targetItem.nextSibling);
                } else if (!insertAfter) {
                    albumsList.insertBefore(draggedElement, targetItem);
                } else {
                    albumsList.appendChild(draggedElement);
                }

                // Actualizar orden en el backend
                this.updateAlbumsOrder();
            }

            // Limpiar indicadores de drop
            const items = albumsList.querySelectorAll('.album-item');
            items.forEach(item => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });
        });
    }

    // Actualizar orden de álbumes en el backend
    async updateAlbumsOrder() {
        try {
            const albumsList = document.getElementById('albums-list');
            const albumItems = albumsList.querySelectorAll('.album-item');
            
            // Crear array con el nuevo orden de IDs
            const albumsOrder = Array.from(albumItems).map(item => 
                item.dataset.albumId
            );

            // Enviar al backend (incluye query como fallback para servidores que fallen parseando el body)
            const url = `/api/albums/reorder?order=${encodeURIComponent(albumsOrder.join(','))}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ albumsOrder })
            });

            if (response.ok) {
                console.log('Orden de álbumes actualizado exitosamente');
                
                // Actualizar array local de álbumes
                const newOrderedAlbums = [];
                albumsOrder.forEach(albumId => {
                    const album = this.albums.find(a => a.id === albumId);
                    if (album) {
                        newOrderedAlbums.push(album);
                    }
                });
                this.albums = newOrderedAlbums;

                // Recargar galería para reflejar nuevo orden
                if (window.loadAdminGallery) {
                    await window.loadAdminGallery();
                }
                
                // Mostrar notificación
                this.showNotification('Orden de álbumes actualizado', 'success');
            } else {
                let errText = '';
                try { errText = await response.text(); } catch (_) {}
                console.error('Error actualizando orden de álbumes', response.status, errText);
                this.showNotification('Error al actualizar orden', 'error');
                // Revertir a orden original
                this.renderAlbums();
            }
        } catch (error) {
            console.error('Error actualizando orden:', error);
            this.showNotification('Error de conexión', 'error');
            // Revertir a orden original
            this.renderAlbums();
        }
    }

    // Mostrar notificación temporal
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar el gestor de álbumes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.albumsManager = new AlbumsManager();
});

// Agregar estilos CSS para las animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .album-empty {
        text-align: center;
        padding: 40px 20px;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .album-empty i {
        font-size: 3rem;
        color: rgba(212, 175, 55, 0.3);
        margin-bottom: 15px;
    }
    
    .album-empty p {
        margin: 10px 0 5px 0;
        font-weight: 500;
    }
    
    .album-empty small {
        font-size: 0.85rem;
        opacity: 0.7;
    }
    
    .mobile-menu-btn {
        background: none;
        border: none;
        color: #d4af37;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-btn:hover {
        background: rgba(212, 175, 55, 0.1);
    }
    
    @media (min-width: 769px) {
        .mobile-menu-btn {
            display: none;
        }
    }
    
    .album-header {
        grid-column: 1 / -1;
        background: linear-gradient(135deg, var(--lv-gold) 0%, var(--lv-gold-dark) 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .album-info h3 {
        margin: 0 0 8px 0;
        font-size: 1.4rem;
        font-weight: 600;
    }
    
    .album-description {
        margin: 5px 0;
        opacity: 0.9;
        font-size: 0.95rem;
    }
    
    .album-campaign {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
        display: inline-block;
        margin: 5px 5px 0 0;
    }
    
    .album-count {
        background: rgba(255, 255, 255, 0.3);
        padding: 4px 8px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
        display: inline-block;
        margin: 5px 0 0 0;
    }
    
    .album-empty-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        border: 2px dashed rgba(212, 175, 55, 0.3);
    }
    
    .empty-album-content i {
        font-size: 4rem;
        color: rgba(212, 175, 55, 0.4);
        margin-bottom: 20px;
        display: block;
    }
    
    .empty-album-content h3 {
        color: var(--lv-text);
        margin-bottom: 15px;
        font-size: 1.5rem;
    }
    
    .empty-album-content p {
        color: var(--lv-text-light);
        margin: 10px 0;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .btn-show-all {
        background: linear-gradient(135deg, var(--lv-gold) 0%, var(--lv-gold-dark) 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 15px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-show-all:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
    }

    /* Estilos para drag & drop de álbumes */
    .album-item {
        position: relative;
        transition: all 0.3s ease;
    }

    .album-item.dragging {
        opacity: 0.5 !important;
        transform: rotate(5deg);
        z-index: 1000;
    }

    .album-drag-handle {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(212, 175, 55, 0.1);
        border-radius: 4px;
        cursor: grab;
        opacity: 0;
        transition: opacity 0.3s ease;
        color: #d4af37;
        font-size: 12px;
    }

    .album-item:hover .album-drag-handle {
        opacity: 1;
    }

    .album-drag-handle:hover {
        background: rgba(212, 175, 55, 0.2);
    }

    .album-drag-handle:active {
        cursor: grabbing;
    }

    .album-item.drag-over-top {
        border-top: 3px solid #d4af37;
        transform: translateY(2px);
    }

    .album-item.drag-over-bottom {
        border-bottom: 3px solid #d4af37;
        transform: translateY(-2px);
    }

    .album-item.drag-over-top::before,
    .album-item.drag-over-bottom::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #d4af37, transparent);
        z-index: 10;
    }

    .album-item.drag-over-top::before {
        top: -3px;
    }

    .album-item.drag-over-bottom::after {
        bottom: -3px;
    }
`;
document.head.appendChild(style); 