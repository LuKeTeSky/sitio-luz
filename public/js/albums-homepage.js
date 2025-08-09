// 🎨 Albums Homepage Manager
// Carga y muestra los álbumes en la página principal

class AlbumsHomepageManager {
    constructor() {
        this.albumsGrid = document.getElementById('albums-grid');
        this.albums = [];
        this.init();
    }

    async init() {
        await this.loadAlbums();
        this.renderAlbums();
    }

    async loadAlbums() {
        try {
            const response = await fetch('/api/albums');
            if (response.ok) {
                this.albums = await response.json();
                // Filtrar solo álbumes que tengan imágenes
                this.albums = this.albums.filter(album => album.images && album.images.length > 0);
            } else {
                console.error('Error cargando álbumes:', response.statusText);
            }
        } catch (error) {
            console.error('Error cargando álbumes:', error);
        }
    }

    renderAlbums() {
        if (!this.albumsGrid) return;

        if (this.albums.length === 0) {
            this.albumsGrid.innerHTML = `
                <div class="albums-empty" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-images" style="font-size: 3rem; color: var(--lv-text-light); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--lv-text); margin-bottom: 10px;">No hay álbumes disponibles</h3>
                    <p style="color: var(--lv-text-light);">Los álbumes aparecerán aquí cuando se creen desde el panel de administración.</p>
                </div>
            `;
            return;
        }

        this.albumsGrid.innerHTML = this.albums.map(album => this.createAlbumCard(album)).join('');
        
        // Agregar event listeners a las tarjetas
        this.addEventListeners();
    }

    createAlbumCard(album) {
        const previewImages = this.getPreviewImages(album.images);
        const imageCount = album.images ? album.images.length : 0;
        
        return `
            <div class="album-card" data-album-id="${album.id}">
                <div class="album-preview">
                    ${this.createPreviewGrid(previewImages)}
                    <div class="album-preview-overlay">
                        <button class="view-album-btn">
                            <i class="fas fa-eye"></i>
                            Ver Álbum
                        </button>
                    </div>
                </div>
                <div class="album-info">
                    <h3>${this.escapeHtml(album.name)}</h3>
                    ${album.campaign ? `<span class="album-campaign-badge">${this.escapeHtml(album.campaign)}</span>` : ''}
                    ${album.description ? `<p class="album-description">${this.escapeHtml(album.description)}</p>` : ''}
                    <div class="album-stats">
                        <div class="album-stat">
                            <i class="fas fa-images"></i>
                            <span>${imageCount} fotos</span>
                        </div>
                        <div class="album-stat">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(album.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createPreviewGrid(images) {
        if (images.length === 0) {
            return `
                <div style="grid-column: 1 / 3; grid-row: 1 / 3; background: var(--lv-beige); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-images" style="font-size: 2rem; color: var(--lv-text-light);"></i>
                </div>
            `;
        }

        let html = '';
        for (let i = 0; i < 4; i++) {
            if (i < images.length) {
                html += `<img src="/uploads/${images[i]}" alt="Preview ${i + 1}" loading="lazy">`;
            } else {
                // Si no hay suficientes imágenes, duplicar la última
                const lastImage = images[images.length - 1];
                html += `<img src="/uploads/${lastImage}" alt="Preview ${i + 1}" loading="lazy">`;
            }
        }
        return html;
    }

    getPreviewImages(images) {
        if (!images || images.length === 0) return [];
        // Tomar las primeras 4 imágenes para el preview
        return images.slice(0, 4);
    }

    addEventListeners() {
        const albumCards = this.albumsGrid.querySelectorAll('.album-card');
        albumCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.view-album-btn')) {
                    const albumId = card.dataset.albumId;
                    this.openAlbumView(albumId);
                }
            });

            const viewBtn = card.querySelector('.view-album-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const albumId = card.dataset.albumId;
                    this.openAlbumView(albumId);
                });
            }
        });
    }

    async openAlbumView(albumId) {
        // Buscar el álbum por ID
        const album = this.albums.find(a => a.id === albumId);
        if (!album) return;

        // Mostrar las fotos del álbum en la sección de galería de la misma página
        await this.displayAlbumInGallery(album);
        
        // Hacer scroll suave a la galería
        document.getElementById('gallery')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    async displayAlbumInGallery(album) {
        try {
            // Obtener todas las imágenes
            const response = await fetch('/api/images');
            const allImages = await response.json();
            
            // Filtrar solo las imágenes del álbum seleccionado
            const albumImages = allImages.filter(image => 
                album.images && album.images.includes(image.filename)
            );
            
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
                        <p>El álbum "${album.name}" no tiene fotos disponibles.</p>
                        <button class="btn-show-all" onclick="homepageAlbums.showAllImages()">
                            Ver todas las fotos
                        </button>
                    </div>
                `;
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
                    <button class="btn-show-all" onclick="homepageAlbums.showAllImages()">
                        <i class="fas fa-th"></i> Ver todas las fotos
                    </button>
                `;
                galleryGrid.appendChild(albumHeader);
                
                // Mostrar las imágenes del álbum
                albumImages.forEach((image, index) => {
                    const galleryItem = this.createGalleryItem(image, index, albumImages);
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

    createGalleryItem(imageData, index, albumImages) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = `/uploads/${imageData.filename}`;
        img.alt = imageData.title || 'Foto';
        img.loading = 'lazy';
        
        // Al hacer clic en la imagen, abrir lightbox con solo las imágenes del álbum
        img.addEventListener('click', () => {
            this.openPublicLightbox(index, albumImages);
        });
        
        item.appendChild(img);
        return item;
    }

    openPublicLightbox(index, images) {
        // Crear lightbox simple para la página pública
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;

        const img = document.createElement('img');
        img.src = `/uploads/${images[index].filename}`;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 10px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 30px;
            background: none;
            border: none;
            color: white;
            font-size: 40px;
            cursor: pointer;
            z-index: 10001;
        `;

        closeBtn.onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };

        overlay.appendChild(img);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
    }

    async showAllImages() {
        // Restaurar título original
        const sectionHeader = document.querySelector('#gallery .section-header h2');
        if (sectionHeader) {
            sectionHeader.textContent = 'Galería de Fotos';
        }
        
        // Usar la función global de gallery-public.js si está disponible
        if (window.loadPublicGallery) {
            await window.loadPublicGallery();
        } else {
            // Fallback: mostrar todas las imágenes manualmente
            try {
                const response = await fetch('/api/images');
                const allImages = await response.json();
                
                const galleryGrid = document.getElementById('gallery-grid');
                if (!galleryGrid) return;
                
                // Limpiar galería
                galleryGrid.innerHTML = '';
                
                // Mostrar todas las imágenes
                allImages.forEach((image, index) => {
                    const galleryItem = this.createGalleryItem(image, index, allImages);
                    galleryGrid.appendChild(galleryItem);
                });
                
            } catch (error) {
                console.error('Error cargando todas las imágenes:', error);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return 'Reciente';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hoy';
        if (diffDays === 2) return 'Ayer';
        if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
        if (diffDays <= 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        if (diffDays <= 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
        
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short' 
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.homepageAlbums = new AlbumsHomepageManager();
}); 