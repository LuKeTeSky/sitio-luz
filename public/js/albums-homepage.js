// 🎨 Albums Homepage Manager
// Carga y muestra los álbumes en la página principal

class AlbumsHomepageManager {
    constructor() {
        this.albumsGrid = document.getElementById('albums-grid');
        this.albums = [];
        this.imagesIndex = new Map(); // filename -> { filename, url, ... }
        this.init();
    }

    async init() {
        // Cargar álbumes y el índice de imágenes (para obtener URLs públicas de Blob)
        await Promise.all([
            this.loadAlbums(),
            this.loadImagesIndex()
        ]);
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

    async loadImagesIndex() {
        try {
            const response = await fetch('/api/images');
            if (response.ok) {
                const images = await response.json();
                this.imagesIndex.clear();
                images.forEach(img => {
                    if (img && img.filename) {
                        this.imagesIndex.set(img.filename, img);
                    }
                });
            }
        } catch (error) {
            console.error('Error cargando índice de imágenes:', error);
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
                const src = this.getImageUrl(images[i]);
                html += `<img src="${src}" alt="Preview ${i + 1}" loading="lazy">`;
            } else {
                // Si no hay suficientes imágenes, duplicar la última
                const lastImage = images[images.length - 1];
                const src = this.getImageUrl(lastImage);
                html += `<img src="${src}" alt="Preview ${i + 1}" loading="lazy">`;
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
                    </div>
                `;
                const btn = document.createElement('button');
                btn.className = 'btn-show-all';
                btn.innerHTML = 'Ver todas las fotos';
                btn.addEventListener('click', () => this.showAllImages());
                emptyMessage.querySelector('.empty-album-content').appendChild(btn);
                galleryGrid.appendChild(emptyMessage);
            } else {
                // Mostrar las imágenes del álbum directamente (sin encabezado duplicado)
                albumImages.forEach((image, index) => {
                    const galleryItem = this.createGalleryItem(image, index, albumImages);
                    galleryGrid.appendChild(galleryItem);
                });
            }
            
            // Actualizar el título de la sección con información completa del álbum
            const sectionHeader = document.querySelector('#gallery .section-header h2');
            if (sectionHeader) {
                const albumInfo = [];
                if (album.description) albumInfo.push(album.description);
                if (album.campaign) albumInfo.push(`Campaña: ${album.campaign}`);
                albumInfo.push(`${albumImages.length} foto${albumImages.length !== 1 ? 's' : ''}`);
                
                const infoText = albumInfo.length > 0 ? ` • ${albumInfo.join(' • ')}` : '';
                sectionHeader.innerHTML = `<i class="fas fa-book-open"></i> ${album.name}${infoText}`;
            }
            
            // Agregar botón "Ver todas las fotos" al final de la galería
            const showAllBtn = document.createElement('div');
            showAllBtn.className = 'show-all-button-container';
            const showBtn = document.createElement('button');
            showBtn.className = 'btn-show-all-public';
            showBtn.innerHTML = '<i class="fas fa-th"></i> Ver todas las fotos';
            showBtn.addEventListener('click', () => this.showAllImages());
            showAllBtn.appendChild(showBtn);
            galleryGrid.appendChild(showAllBtn);
            
        } catch (error) {
            console.error('Error cargando imágenes del álbum:', error);
        }
    }

    createGalleryItem(imageData, index, albumImages) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = imageData.url || `/uploads/${imageData.filename}`;
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
        img.src = images[index].url || `/uploads/${images[index].filename}`;
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
            // Scroll al inicio de la galería tras recargar
            const gallerySection = document.getElementById('gallery');
            if (gallerySection) {
                gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
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
                // Scroll al inicio de la galería
                const gallerySection = document.getElementById('gallery');
                if (gallerySection) {
                    gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
            } catch (error) {
                console.error('Error cargando todas las imágenes:', error);
            }
        }
    }

    getImageUrl(filename) {
        const img = this.imagesIndex.get(filename);
        if (img && img.url) return img.url;
        return `/uploads/${filename}`;
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

// Agregar estilos CSS para el botón "Ver todas las fotos" en vista pública
const publicAlbumStyles = document.createElement('style');
publicAlbumStyles.textContent = `
    .show-all-button-container {
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        padding: 30px 20px;
        margin-top: 20px;
    }

    .btn-show-all-public {
        background: linear-gradient(135deg, var(--lv-gold) 0%, var(--lv-gold-dark) 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
    }

    .btn-show-all-public:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
        background: linear-gradient(135deg, var(--lv-gold-dark) 0%, var(--lv-gold) 100%);
    }

    .btn-show-all-public:active {
        transform: translateY(0);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .show-all-button-container {
            padding: 20px 15px;
            margin-top: 15px;
        }
        
        .btn-show-all-public {
            padding: 10px 20px;
            font-size: 0.9rem;
        }
    }
`;
document.head.appendChild(publicAlbumStyles); 