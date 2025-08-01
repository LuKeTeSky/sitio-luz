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

    openAlbumView(albumId) {
        // Por ahora, redirigir a la galería con un parámetro para filtrar por álbum
        // En el futuro, esto podría abrir una vista modal o una página dedicada
        window.location.href = `/gallery?album=${albumId}`;
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
    new AlbumsHomepageManager();
}); 