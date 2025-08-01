// Script para manejar la funcionalidad de álbumes
class AlbumsManager {
    constructor() {
        this.albums = [];
        this.currentAlbum = null;
        this.isEditing = false;
        this.editingAlbumId = null;
        
        this.init();
    }

    init() {
        this.loadAlbums();
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
        }

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
    }

    createAlbumElement(album) {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album-item';
        albumDiv.dataset.albumId = album.id;

        albumDiv.innerHTML = `
            <div class="album-header">
                <h4 class="album-name">${album.name}</h4>
                <div class="album-actions">
                    <span class="album-count">${album.images ? album.images.length : 0}</span>
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
        
        // Aquí se puede agregar lógica para mostrar las fotos del álbum
        console.log('Álbum seleccionado:', album);
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
        if (albumName) albumName.value = album.name;
        if (albumDescription) albumDescription.value = album.description || '';
        if (albumCampaign) albumCampaign.value = album.campaign || '';

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
            campaign: formData.get('campaign')
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
`;
document.head.appendChild(style); 