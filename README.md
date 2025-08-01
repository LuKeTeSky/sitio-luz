# 🌟 LUZ - Portfolio de Moda y Fotografía

Un portfolio elegante y moderno para modelos de moda, con sistema de gestión de álbumes y galería profesional.

## ✨ Características Principales

### 🎨 **Diseño y UX**
- **Diseño elegante estilo Louis Vuitton** con gradientes dorados y tipografía sofisticada
- **Interfaz responsive** que se adapta a todos los dispositivos
- **Animaciones suaves** y transiciones profesionales
- **Modo oscuro** con paleta de colores premium

### 📸 **Galería de Fotos**
- **Lightbox avanzado** con controles de zoom y navegación
- **Ajuste automático a pantalla** y opción de tamaño real
- **Navegación con teclado** (flechas, ESC)
- **Botones de acción** en cada imagen:
  - ⭐ Establecer como portada
  - 🏠 Establecer como imagen del hero
  - 📚 Agregar a álbum
  - 🗑️ Eliminar foto

### 📚 **Sistema de Álbumes**
- **Menú lateral estilo Louis Vuitton** para gestión de álbumes
- **Crear álbumes por campaña** con nombre, descripción y campaña
- **Selección múltiple** de fotos para álbumes
- **Botón flotante** para crear álbumes cuando el sidebar está colapsado
- **Edición y eliminación** de álbumes existentes

### 🎯 **Gestión de Contenido**
- **Panel de administración** con autenticación
- **Subida de fotos** con drag & drop
- **Configuración dinámica del hero** (imagen, título, subtítulo)
- **Sección de fotos de portada** destacadas
- **Notificaciones en tiempo real** para todas las acciones

### 🔧 **Funcionalidades Técnicas**
- **API RESTful** para gestión de contenido
- **Almacenamiento local** de configuraciones
- **Sistema de sesiones** para administración
- **Optimización de imágenes** automática
- **Navegación suave** entre secciones

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd sitio-luz
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional)
   ```bash
   # Crear archivo .env
   echo "SESSION_SECRET=tu_clave_secreta_aqui" > .env
   ```

4. **Iniciar el servidor**
   ```bash
   # Opción 1: Usar npm (recomendado)
   npm start
   
   # Opción 2: Usar script de inicio automático
   # Windows: start.bat
   # Linux/Mac: ./start.sh
   
   # Opción 3: Ejecutar directamente
   node app.js
   ```

5. **Acceder al sitio**
   - **Sitio público**: http://localhost:3000
   - **Panel de administración**: http://localhost:3000/admin
   - **Login**: http://localhost:3000/login

## 📖 Guía de Uso

### 👤 **Acceso al Panel de Administración**

1. Ve a http://localhost:3000/login
2. Usa las credenciales por defecto:
   - **Usuario**: admin
   - **Contraseña**: admin123

### 📸 **Subir Fotos**

1. Accede al panel de administración
2. Ve a la sección "Subir Fotos"
3. Haz clic en "Seleccionar imagen" o arrastra una foto
4. Haz clic en "Subir Foto"
5. La foto aparecerá automáticamente en la galería

### 🎯 **Configurar Imagen del Hero**

1. En la galería, busca la foto que quieres usar
2. Haz clic en el botón 🏠 (casa) en la imagen
3. La imagen se establecerá como fondo del hero
4. El título y subtítulo se actualizarán automáticamente

### ⭐ **Gestionar Fotos de Portada**

1. En la galería, haz clic en el botón ⭐ en las fotos que quieres destacar
2. Las fotos seleccionadas aparecerán en la sección "Fotos de Portada"
3. Puedes remover fotos de portada haciendo clic nuevamente en el botón ⭐

### 📚 **Crear y Gestionar Álbumes**

#### Crear un Nuevo Álbum
1. En el panel de administración, usa el menú lateral izquierdo
2. Haz clic en "Nuevo Álbum" (botón dorado)
3. Completa el formulario:
   - **Nombre**: Nombre del álbum
   - **Descripción**: Descripción opcional
   - **Campaña**: Campaña asociada (ej: "Primavera 2024")
4. Haz clic en "Guardar"

#### Agregar Fotos a un Álbum
1. En la galería, haz clic en el botón 📚 en la foto
2. Selecciona el álbum de la lista desplegable
3. La foto se agregará al álbum seleccionado
4. Si no hay álbumes, puedes crear uno nuevo desde el selector

#### Gestionar Álbumes
- **Ver álbumes**: Usa el menú lateral izquierdo
- **Editar álbum**: Haz doble clic en el álbum
- **Seleccionar álbum**: Haz clic en el álbum para verlo activo
- **Botón flotante**: Cuando el sidebar está colapsado, aparece un botón flotante para crear álbumes

### 🔍 **Usar el Lightbox**

1. Haz clic en cualquier foto de la galería
2. Se abrirá el lightbox con controles:
   - **Navegación**: Flechas izquierda/derecha o botones
   - **Zoom**: Botones + y - para acercar/alejar
   - **Tamaño**: Botón para cambiar entre ajuste a pantalla y tamaño real
   - **Reset**: Botón para restablecer zoom
   - **Acciones**: Botones en la parte inferior para gestionar la foto

## 🛠️ Comandos del Servidor

### Iniciar el Servidor
```bash
# Desarrollo
npm start

# Producción
node app.js

# Con nodemon (desarrollo)
npm run dev
```

### Detener el Servidor
```bash
# En Windows
taskkill /f /im node.exe

# En Linux/Mac
pkill node

# O presiona Ctrl+C en la terminal
```

### Reiniciar el Servidor
```bash
# Detener y volver a iniciar
taskkill /f /im node.exe && npm start
```

### 🚀 Scripts de Inicio Rápido

#### Windows
```bash
# Usar el script de inicio automático
start.bat

# O ejecutar directamente
npm start
```

#### Linux/Mac
```bash
# Hacer ejecutable el script (solo la primera vez)
chmod +x start.sh

# Usar el script de inicio automático
./start.sh

# O ejecutar directamente
npm start
```

### 📊 Gestión con PM2 (Producción)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs sitio-luz

# Reiniciar
pm2 restart sitio-luz

# Detener
pm2 stop sitio-luz

# Ver estado
pm2 status
```

## 📁 Estructura del Proyecto

```
sitio-luz/
├── app.js                 # Servidor principal
├── package.json           # Dependencias y scripts
├── .gitignore            # Archivos ignorados por Git
├── README.md             # Este archivo
├── ecosystem.config.js   # Configuración PM2 (producción)
├── start.bat             # Script de inicio Windows
├── start.sh              # Script de inicio Linux/Mac
├── views/                # Plantillas HTML
│   ├── index.html        # Página principal pública
│   └── admin.html        # Panel de administración
├── public/               # Archivos públicos
│   ├── css/
│   │   └── style.css     # Estilos principales
│   ├── js/
│   │   ├── gallery.js    # Funcionalidad de galería
│   │   ├── albums.js     # Gestión de álbumes
│   │   ├── hero-loader.js # Carga dinámica del hero
│   │   └── gallery-public.js # Galería pública
│   └── uploads/          # Imágenes subidas
└── node_modules/         # Dependencias (generado)
```

## 🔧 Configuración Avanzada

### Personalizar Credenciales
Edita el archivo `app.js` y cambia las credenciales de login:
```javascript
// Líneas 120-125 aproximadamente
if (username === 'admin' && password === 'admin123') {
  req.session.authenticated = true;
  res.redirect('/admin');
}
```

### Cambiar Puerto del Servidor
Edita el archivo `app.js` al final:
```javascript
app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
```

### Configurar Rutas Públicas
En `app.js`, modifica el array `publicPaths`:
```javascript
const publicPaths = [
  '/', '/login', '/css', '/uploads', '/js',
  '/api/images', '/api/hero', '/gallery'
];
```

## 🎨 Personalización

### Cambiar Colores
Edita `public/css/style.css` y modifica las variables de color:
```css
/* Colores principales */
--primary-color: #d4af37;    /* Dorado */
--secondary-color: #1a1a1a;  /* Negro */
--accent-color: #b8941f;     /* Dorado oscuro */
```

### Cambiar Fuentes
En los archivos HTML, modifica los enlaces de Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### Agregar Nuevas Funcionalidades
1. Crea nuevos archivos JavaScript en `public/js/`
2. Agrega los scripts en los archivos HTML correspondientes
3. Implementa las funcionalidades en el servidor (`app.js`)

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que Node.js esté instalado: `node --version`
- Reinstala las dependencias: `npm install`
- Verifica que el puerto 3000 esté libre

### Las fotos no se suben
- Verifica que la carpeta `public/uploads/` exista
- Asegúrate de que el servidor tenga permisos de escritura
- Revisa la consola del navegador para errores

### El panel de administración no carga
- Verifica que estés logueado correctamente
- Limpia las cookies del navegador
- Revisa la consola del servidor para errores

### Los álbumes no se guardan
- Verifica que el archivo `albums.json` se pueda crear
- Asegúrate de que el servidor tenga permisos de escritura
- Revisa la consola del navegador para errores de red

## 📱 Compatibilidad

- ✅ **Navegadores modernos**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos móviles**: iOS, Android
- ✅ **Tablets**: iPad, Android tablets
- ✅ **Escritorio**: Windows, macOS, Linux

## 🔒 Seguridad

- **Autenticación de sesiones** para el panel de administración
- **Validación de archivos** en la subida de imágenes
- **Sanitización de datos** en formularios
- **Rutas protegidas** para funciones administrativas

## 📄 Licencia

Este proyecto es de uso libre para portfolios personales y comerciales.

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- Revisa la sección de solución de problemas
- Verifica los logs del servidor
- Consulta la documentación de Node.js y Express

---

**Desarrollado con ❤️ para el mundo de la moda y la fotografía**