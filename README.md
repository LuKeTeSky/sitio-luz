# 🌟 LUZ - Portfolio de Moda y Fotografía

Un portfolio elegante y moderno para modelos de moda, con sistema de gestión de álbumes y galería profesional.

## 🎯 **Novedades Principales v1.15.0**

### 🗂️ Imágenes en Vercel Blob + URLs públicas
- Almacenamiento persistente de imágenes con `@vercel/blob` (CDN y URLs públicas `*.vercel-storage.com`).
- Endpoint de subida usa `put()` y limpia temporales.
- `/api/images`: primero intenta KV; si no hay datos, lista directamente desde Blob.

### 🔐 Seguridad y compatibilidad
- `helmet` actualizado: `imgSrc` permite `blob:` y `*.vercel-storage.com`.
- `crossOriginEmbedderPolicy: false` y `crossOriginResourcePolicy: 'cross-origin'` para evitar `ERR_BLOCKED_BY_RESPONSE`.

### 🖼️ Frontend
- `public/js/gallery.js`: imágenes usan `image.url` si existe, con fallback a `/uploads/${filename}`.

### 🧭 Gitflow (backup/RC)
- Ramas `release/*` funcionan como respaldo congelado (Release Candidate).
- Creadas: `release/v1.15.0` (actual), `release/v1.14.0`, `release/v1.13.0`.

---

## 🎯 **Novedades Principales v1.14.0**

### 🔑 Autenticación y rutas en Vercel
- Login corregido: comparación de contraseña correcta (soporta hash `bcrypt` o texto plano via `ADMIN_PASSWORD`).
- `vercel.json`: `/uploads/(.*)` dirigido a `app.js` para que el backend gestione imágenes.

### 🖱️ Experiencia de subida
- `setupUploadForm()` robustecido: listeners se registran aunque haya cargas en curso, evitando que el botón/label no actualice el nombre del archivo.

### 📦 Preparativos de almacenamiento
- Dependencia `@vercel/blob` agregada (migración completada en v1.15.0).

---

## 🎯 **Novedades Principales v1.15.0**

### 🗂️ Imágenes en Vercel Blob + URLs públicas
- Almacenamiento persistente de imágenes con `@vercel/blob` (CDN y URLs públicas `*.vercel-storage.com`).
- Endpoint de subida usa `put()` y limpia temporales.
- `/api/images`: primero intenta KV; si no hay datos, lista directamente desde Blob.

### 🔐 Seguridad y compatibilidad
- `helmet` actualizado: `imgSrc` permite `blob:` y `*.vercel-storage.com`.
- `crossOriginEmbedderPolicy: false` y `crossOriginResourcePolicy: 'cross-origin'` para evitar `ERR_BLOCKED_BY_RESPONSE`.

### 🖼️ Frontend
- `public/js/gallery.js`: imágenes usan `image.url` si existe, con fallback a `/uploads/${filename}`.

### 🧭 Gitflow (backup/RC)
- Ramas `release/*` funcionan como respaldo congelado (Release Candidate).
- Creadas: `release/v1.15.0` (actual), `release/v1.14.0`, `release/v1.13.0`.

---

## 🎯 **Novedades Principales v1.14.0**

### 🔑 Autenticación y rutas en Vercel
- Login corregido: comparación de contraseña correcta (soporta hash `bcrypt` o texto plano via `ADMIN_PASSWORD`).
- `vercel.json`: `/uploads/(.*)` dirigido a `app.js` para que el backend gestione imágenes.

### 🖱️ Experiencia de subida
- `setupUploadForm()` robustecido: listeners se registran aunque haya cargas en curso, evitando que el botón/label no actualice el nombre del archivo.

### 📦 Preparativos de almacenamiento
- Dependencia `@vercel/blob` agregada (migración completada en v1.15.0).

---

## 🎯 **Novedades Principales v1.13.0**

### 🚨 **LOOPS INFINITOS COMPLETAMENTE CORREGIDOS**
- **16 puntos críticos de loops infinitos** identificados y corregidos
- **Protección completa** contra ejecuciones múltiples en todas las funciones
- **Variables de protección** implementadas para evitar inicializaciones duplicadas
- **Event listeners protegidos** contra múltiples ejecuciones
- **Sistema de debug** con funciones para resetear protecciones
- **Performance mejorada** y estabilidad total del sitio

### 🔧 **Protecciones Implementadas**
- **DOMContentLoaded**: Protegido contra ejecuciones múltiples
- **Timeouts**: Protegidos contra loops infinitos
- **Funciones de galería**: Protegidas contra inicializaciones duplicadas
- **Event listeners**: Protegidos contra múltiples registros
- **Drag & drop**: Protegido contra configuraciones múltiples

---

## 🎯 **Novedades Principales v1.12.2**

### 🚨 **Configuración de Vercel CORREGIDA**
- **Ruta `/uploads/*` eliminada de vercel.json** que bloqueaba el endpoint personalizado
- **Endpoint `/uploads/:filename` ahora funcional** en producción
- **Deploy automático configurado** para futuras correcciones
- **Sistema de upload completamente operativo** en Vercel

---

## 🎯 **Novedades Principales v1.12.1**

### 🔧 **Bug Crítico de Upload CORREGIDO**
- **Sistema de upload completamente funcional** tanto en local como en Vercel
- **Endpoint `/uploads/:filename` implementado** para servir archivos desde `/tmp` en Vercel
- **Lógica adaptativa de directorios** que funciona en ambos entornos
- **Validación de archivos mejorada** con mensajes de error claros
- **Compatibilidad total** entre desarrollo local y producción

---

## 🎯 **Novedades Principales v1.12.0**

### 📋 **Sistema de Backlog Completo Implementado**
- **Backlog organizado por prioridades** con 7 issues categorizados
- **Issues críticos identificados** y documentados con criterios de aceptación
- **Flujo de trabajo estandarizado** para desarrollo y deployment
- **Sistema de issues de GitHub** integrado con el flujo de trabajo
- **Documentación completa** de funcionalidades pendientes y completadas

### 🔄 **Gitflow Reorganizado y Configurado**
- **Sistema de ramas de backup** implementado para rollbacks seguros
- **Ramas de respaldo** creadas para `main` y `develop` v1.10.0
- **Flujo de trabajo estandarizado** siguiendo Gitflow al 100%
- **Proceso de merge automatizado** entre feature → develop → main
- **Tags de versión** implementados para releases

### 🛡️ **Sistema de Rollback Seguro**
- **Backup automático** de cada versión estable
- **Rollback instantáneo** a cualquier versión anterior
- **Ramas de emergencia** disponibles para casos críticos
- **Seguridad total** para producción y desarrollo

---

## 🎯 **Novedades Principales v1.11.0**

### 🧹 **Limpieza Completa del Repositorio**
- **Repositorio completamente limpio** sin fotos de prueba
- **Eliminadas todas las fotos** de `Photos-1-001/` y `public/uploads/`
- **Solo queda `.gitkeep`** para mantener estructura del directorio
- **Base sólida** para implementar Gitflow correctamente
- **Control total** sobre qué fotos se suben al sitio

---

## 🎯 **Novedades Principales v1.10.0**

### 🔧 **Bug Crítico de Eliminación de Imágenes CORREGIDO**
- **Eliminación directa del DOM** sin recargas automáticas de galería
- **NO más límite de intentos** alcanzado al eliminar múltiples fotos
- **Imágenes eliminadas NO vuelven** a aparecer después de 20-30 segundos
- **Sistema de filtrado robusto** que mantiene las eliminaciones persistentes
- **Performance mejorada** - eliminación instantánea sin recargas innecesarias

### 🔧 **Persistencia de Eliminaciones con Vercel KV**
- **Eliminaciones persistentes** en Vercel usando base de datos Redis
- **Sistema robusto** que funciona entre deploys y reinicios
- **Fallback automático** a memoria si KV no está disponible
- **Integración nativa** con Vercel para máxima confiabilidad

### 🎨 **Drag & Drop en Galería con Efectos Visuales**
- **Reordenamiento visual** de fotos en la galería
- **Efecto fantasma** durante el arrastre (fotos se "corren" lateralmente)
- **Persistencia automática** del orden personalizado
- **Solo para usuarios autenticados** en el panel admin
- **Notificaciones mejoradas** que no se solapan

### 📧 **Contacto Actualizado**
- **Email de contacto** actualizado a `msmvdg@gmail.com`
- **Consistencia** en todas las páginas del sitio

---

## 🎯 **Novedades Principales v1.8.0**

### 🔧 **Sistema de Eliminación de Imágenes Mejorado**
- **Eliminación física** en desarrollo local
- **Marcado para eliminación** en Vercel (sistema temporal)
- **Filtrado automático** de imágenes eliminadas en la API
- **Endpoint `/api/deleted-images`** para administración
- **Sistema de fallback** entre memoria y archivos

### 🎨 **Drag & Drop en Galería con Efectos Visuales**
- **Reordenamiento visual** de fotos en la galería
- **Efecto fantasma** durante el arrastre (fotos se "corren" lateralmente)
- **Persistencia automática** del orden personalizado
- **Solo para usuarios autenticados** en el panel admin
- **Notificaciones mejoradas** que no se solapan

### 📧 **Contacto Actualizado**
- **Email de contacto** actualizado a `msmvdg@gmail.com`
- **Consistencia** en todas las páginas del sitio

---

## 🎯 **Novedades Principales v1.6.0**

### 📤 **Subida Múltiple de Fotos**
- **Hasta 10 fotos simultáneas** en una sola operación
- **Selección múltiple** con Ctrl/Cmd+Click o Shift+Click
- **Contador dinámico** de archivos seleccionados
- **Progreso inteligente** con notificaciones personalizadas

### 🔗 **Auto-Agregado Inteligente**
- **Selecciona álbum → Sube fotos → Automáticamente en el álbum**
- **Sin pasos manuales** adicionales
- **Notificaciones contextuales** con nombre del álbum
- **Actualización en tiempo real** de la vista del álbum

### 🎨 **Reordenamiento Drag & Drop**
- **Arrastra álbumes** para cambiar su orden en el sidebar
- **Indicadores visuales** durante el arrastre (grip handle ⋮⋮)
- **Orden reflejado** automáticamente en la galería principal
- **Persistencia** del orden personalizado

### 📸 **Ordenamiento Inteligente de Galería**
- **Portada primero**: Imagen del hero siempre al inicio
- **Álbumes ordenados**: Según tu orden personalizado
- **Fotos libres al final**: Imágenes sin asignar

---

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
- **Auto-agregado inteligente** - fotos se agregan automáticamente al álbum seleccionado
- **Drag & drop para reordenar** álbumes en el sidebar con indicadores visuales
- **Orden personalizable** que se refleja en la galería principal
- **Selección múltiple** de fotos para álbumes (método manual alternativo)
- **Botón flotante** para crear álbumes cuando el sidebar está colapsado
- **Edición y eliminación** de álbumes existentes

### 🎯 **Gestión de Contenido**
- **Panel de administración** con autenticación
- **Subida múltiple de fotos** (hasta 10 archivos) con drag & drop
- **Auto-agregado** de fotos a álbum seleccionado
- **Ordenamiento inteligente** de galería (portada → álbumes → fotos libres)
- **Drag & drop para reordenar álbumes** en el sidebar
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

### 🔧 **Configuración de Vercel KV (Producción)**

Para que las eliminaciones de imágenes sean persistentes en Vercel:

1. **Crear Base de Datos KV en Vercel:**
   - Ve a tu dashboard de Vercel
   - Selecciona tu proyecto `sitio-luz`
   - Ve a la pestaña "Storage"
   - Haz clic en "Create Database"
   - Selecciona "KV (Redis)"
   - Elige el plan gratuito (100MB)
   - Selecciona la región más cercana

2. **Variables de Entorno:**
   - Se configuran automáticamente
   - No es necesario configurarlas manualmente
   - Vercel las inyecta en tu aplicación

3. **Deploy Automático:**
   - Una vez creada la base de datos
   - Vercel detecta los cambios automáticamente
   - El deploy incluye la configuración de KV

**Nota:** En desarrollo local, el sistema usa memoria como fallback.

**📋 Documentación Detallada:** Ver archivo `vercel-kv-setup.md` para instrucciones paso a paso.

### 🔧 **Configuración de Vercel Blob (Producción)**

Para almacenar imágenes de forma persistente con CDN y URLs públicas:

1. Conectar Blob al proyecto en Vercel:
   - Dashboard de Vercel → tu proyecto `sitio-luz` → pestaña "Storage" → "Add" → seleccionar "Blob"
   - Esto crea el bucket y agrega automáticamente las variables de entorno requeridas (p. ej. `BLOB_READ_WRITE_TOKEN`) sin exponerlas en el repo

2. Dependencias y backend:
   - `package.json` ya incluye `@vercel/blob`
   - El backend usa `put()` para subir y obtiene `url` pública; no registres ni expongas el valor del token en logs

3. Seguridad y CSP (ya aplicado en `app.js`):
   - `helmet` `contentSecurityPolicy.imgSrc` debe permitir: `"'self'", "data:", "blob:", "*.vercel-storage.com"`
   - `crossOriginEmbedderPolicy: false` y `crossOriginResourcePolicy: 'cross-origin'` para permitir imágenes del CDN

4. Verificación rápida:
   - Subir una imagen desde Admin y comprobar que el JSON de respuesta incluya `url` de `*.vercel-storage.com`
   - Ver la galería pública y confirmar que las miniaturas cargan desde esa URL

5. Deploy:
   - Si conectaste Blob o cambiaste variables de entorno, haz un redeploy desde Vercel para que los cambios apliquen

### ✅ **Checklist de Seguridad y Entorno (Producción)**

- Variables sensibles en Vercel (no en el repo):
  - `ADMIN_PASSWORD` (usa un valor fuerte; puede ser hash `bcrypt` o texto plano)
  - `SESSION_SECRET` (mín. 32 caracteres aleatorios)
  - `BLOB_READ_WRITE_TOKEN` (inyectado automáticamente al conectar Blob; no loguear)
  - KV sólo si se usa: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`
- No exponer tokens ni contraseñas en frontend ni en logs
- Revisar CSP/COEP/CORP en `helmet` para sólo permitir los orígenes necesarios
- Mantener `rate limiting` activo para evitar abuso
- Rotar `SESSION_SECRET` periódicamente y cambiar `ADMIN_PASSWORD` si se sospecha filtración
- Tras cambios de entorno (env/Storage), redeploy en Vercel

### Pasos de Instalación

1. **Clonar el repositorio**
   ```zsh
   git clone <url-del-repositorio>
   cd sitio-luz
   ```

2. **Instalar dependencias**
   ```zsh
   npm install
   ```

3. **Configurar variables de entorno** (opcional)
   ```zsh
   # Crear archivo .env
   echo "SESSION_SECRET=tu_clave_secreta_aqui" > .env
   ```

4. **Iniciar el servidor**
   ```zsh
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

#### Subida Individual o Múltiple
1. Accede al panel de administración
2. Ve a la sección "Subir Fotos"
3. **Opción A**: Haz clic en "Seleccionar imágenes" y elige una o múltiples fotos (Ctrl/Cmd+Click)
4. **Opción B**: Arrastra una o múltiples fotos al área de subida
5. Haz clic en "Subir Fotos"
6. Las fotos aparecerán automáticamente en la galería

#### Auto-Agregado a Álbum (Nuevo)
1. **Selecciona un álbum** en el sidebar izquierdo antes de subir
2. Sube las fotos normalmente
3. **✨ Las fotos se agregarán automáticamente** al álbum seleccionado
4. Recibirás una notificación confirmando el agregado
5. La vista del álbum se actualizará automáticamente

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
- **Seleccionar álbum**: Haz clic en el álbum para verlo activo (activará auto-agregado)
- **Reordenar álbumes**: Arrastra los álbumes para cambiar su orden ⋮⋮ (aparece al hacer hover)
- **Editar álbum**: Haz doble clic en el álbum
- **Eliminar álbum**: Usa el botón 🗑️ en cada álbum
- **Botón flotante**: Cuando el sidebar está colapsado, aparece un botón flotante para crear álbumes

#### Orden de Galería Inteligente
Las fotos se muestran automáticamente en este orden:
1. **🖼️ Foto de portada** (imagen del hero) - siempre primera
2. **📚 Fotos de álbumes** - según el orden personalizado de álbumes
3. **📷 Fotos libres** - fotos sin asignar a álbumes

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
```zsh
# Desarrollo
npm start

# Producción
node app.js

# Con nodemon (desarrollo)
npm run dev
```

### Detener el Servidor
```zsh
# En Windows
taskkill /f /im node.exe

# En Linux/Mac
pkill node

# O presiona Ctrl+C en la terminal
```

### Reiniciar el Servidor
```zsh
# En Mac/Linux (detener y volver a iniciar)
pkill node && npm start
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
```zsh
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

## �� Estructura del Proyecto

```
sitio-luz/
├── app.js                 # Servidor principal
├── package.json           # Dependencias y scripts
├── .gitignore            # Archivos ignorados por Git
├── README.md             # Este archivo
├── vercel-kv-setup.md   # Guía de configuración de Vercel KV
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
│   │   ├── gallery.js           # Funcionalidad de galería admin (subida múltiple, auto-agregado)
│   │   ├── albums.js            # Gestión de álbumes (drag & drop, reordenamiento)
│   │   ├── albums-homepage.js   # Gestión de álbumes página pública
│   │   ├── hero-loader.js       # Carga dinámica del hero
│   │   └── gallery-public.js    # Galería pública
│   └── uploads/          # Imágenes subidas
└── node_modules/         # Dependencias (generado)
```

## 🔧 Configuración Avanzada

### 📋 Variables de Entorno Requeridas
Crea un archivo `.env` en la raíz del proyecto con:

```bash
# 🔐 Autenticación
ADMIN_PASSWORD=tu_password_super_seguro_aqui
SESSION_SECRET=clave_aleatoria_de_32_caracteres_minimo

# 🌍 Entorno
NODE_ENV=development
PORT=3000

# 🚀 Vercel (solo para producción)
VERCEL=true

# 🔑 Vercel KV (Redis) - Solo si usas Vercel
REDIS_URL=redis://localhost:6379
KV_URL=redis://localhost:6379
KV_REST_API_URL=https://your-project.vercel.app
KV_REST_API_TOKEN=tu_token_aqui
KV_REST_API_READ_ONLY_TOKEN=tu_token_readonly_aqui
```

### Personalizar Credenciales
**IMPORTANTE**: NO edites directamente `app.js`. Usa variables de entorno:
```javascript
// El código ya está configurado para usar:
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;
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
- **Límite de archivos**: Máximo 10 fotos por subida
- **Tamaño**: Verifica que las imágenes no sean demasiado grandes
- Revisa la consola del navegador para errores

### El panel de administración no carga
- Verifica que estés logueado correctamente
- Limpia las cookies del navegador
- Revisa la consola del servidor para errores

### Los álbumes no se guardan
- Verifica que el archivo `albums.json` se pueda crear
- Asegúrate de que el servidor tenga permisos de escritura
- Revisa la consola del navegador para errores de red

### Las fotos no se agregan automáticamente al álbum
- Asegúrate de **seleccionar el álbum primero** (clic en el álbum del sidebar)
- Verifica que el álbum esté marcado como activo (color dorado)
- Si no hay álbum seleccionado, usa el método manual (botón 📚)
- Revisa las notificaciones para confirmar el auto-agregado

## 📱 Compatibilidad

- ✅ **Navegadores modernos**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos móviles**: iOS, Android
- ✅ **Tablets**: iPad, Android tablets
- ✅ **Escritorio**: Windows, macOS, Linux

## 🔒 Seguridaddd

### 🛡️ **Medidas Implementadas**
- **Autenticación de sesiones** para el panel de administración
- **Validación de archivos** en la subida de imágenes (magic bytes)
- **Sanitización de datos** en formularios
- **Rutas protegidas** para funciones administrativas
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Helmet.js** para headers de seguridad HTTP

### 🚨 **IMPORTANTE - Configuración de Seguridad**
1. **NUNCA** subas archivos `.env` al repositorio
2. **SIEMPRE** usa contraseñas fuertes (mín. 12 caracteres)
3. **ROTA** el `SESSION_SECRET` cada 3 meses
4. **VERIFICA** que las variables de entorno estén configuradas en Vercel

### 🔐 **Variables de Entorno Críticas**
```bash
# OBLIGATORIAS para producción:
ADMIN_PASSWORD=contraseña_super_fuerte_aqui
SESSION_SECRET=clave_aleatoria_32_caracteres_minimo

# OPCIONALES (solo si usas Vercel KV):
REDIS_URL=redis://localhost:6379
KV_REST_API_TOKEN=tu_token_aqui
```

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

## 🚀 Gitflow y Versionado

### 📋 **Estructura de Branches**

Este proyecto sigue las mejores prácticas de **Gitflow** con versionado semántico:

- **`main`** - Código de producción estable y releases
- **`develop`** - Rama de desarrollo principal e integración
- **`feature/*`** - Nuevas funcionalidades y mejoras
- **`release/*`** - Preparación y pruebas de releases
- **`hotfix/*`** - Correcciones urgentes de producción

#### 🔒 Ramas de Release como Respaldo (Release Candidate)

Las ramas `release/*` cumplen el rol de **backup congelado (RC)** de cada versión:

- Disponibles: `release/v1.15.0` (actual), `release/v1.14.0`, `release/v1.13.0`
- Para futuros ciclos: crear desde `develop` con `git checkout -b release/vX.Y.Z` y `git push -u origin release/vX.Y.Z`
- Evitar crear ramas `backup/*`; usar siempre `release/*` como respaldo

### 🔄 **Flujo de Rollback Seguro**

El sistema está diseñado para rollback fácil:
- Cada release tiene su propia rama `release/v1.x.x`
- Si algo falla, cambiar a la rama de release anterior
- Los tags marcan puntos estables para volver atrás

### 🏷️ **Sistema de Versionado Semántico**

Utilizamos **MAJOR.MINOR.PATCH** (ej: 1.2.3):

- **MAJOR** (1.x.x): Cambios incompatibles con versiones anteriores
- **MINOR** (x.1.x): Nuevas funcionalidades compatibles
- **PATCH** (x.x.1): Correcciones de bugs compatibles

### 📦 **Historial de Versiones**

| Versión | Fecha | Estado | Funcionalidades Principales |
|---------|-------|--------|------------------------------|
| **v1.0.0** | Jul 2025 | Inicial | Portfolio básico con galería y hero dinámico |
| **v1.1.0** | Jul 2025 | Stable | Lightbox mejorado con ajuste a pantalla y tamaño real |
| **v1.2.0** | Jul 2025 | Stable | Sistema completo de gestión de álbumes |
| **v1.2.1** | Jul 2025 | Stable | Correcciones: acciones lightbox, menús, eliminar álbum |
| **v1.3.0** | Ago 2025 | Stable | Navegación mejorada, reordenamiento de secciones |
| **v1.4.0** | 01 Ago 2025 | Stable | Diseño Louis Vuitton + álbumes en homepage |
| **v1.5.0** | 09 Ago 2025 | Stable | Gitflow completo + navegación navbar mejorada |
| **v1.6.0** | 09 Ago 2025 | Stable | **Subida múltiple + Auto-agregado + Drag & drop** |
| **v1.7.0** | 09 Ago 2025 | Stable | **Mejoras en sistema de álbumes y navegación** |
| **v1.8.0** | 09 Ago 2025 | Stable | **Drag & drop en galería + Efectos visuales + Contacto actualizado** |
| **v1.15.0** | 12 Ago 2025 | **🟢 ACTUAL** | **Imágenes persistentes en Vercel Blob + CSP/COEP/CORP ajustado + Frontend usando URLs públicas** |
| **v1.14.0** | 11 Ago 2025 | ✅ Stable | **Login corregido (bcrypt/llano), vercel.json rutas a app.js, mejoras en upload UI** |
| **v1.13.0** | 10 Ago 2025 | ✅ Stable | **LOOPS INFINITOS COMPLETAMENTE CORREGIDOS + Protección total contra ejecuciones múltiples** |
| **v1.12.2** | 10 Ago 2025 | ✅ Stable | **Configuración de Vercel CORREGIDA + Endpoint de uploads funcional en producción** |
| **v1.12.1** | 10 Ago 2025 | ✅ Stable | **Bug crítico de upload CORREGIDO + Sistema funcional en local y Vercel** |
| **v1.12.0** | 10 Ago 2025 | ✅ Stable | **Sistema de backlog completo + Issues organizados + Flujo de trabajo estandarizado** |
| **v1.11.0** | 10 Ago 2025 | ✅ Stable | **Repositorio completamente limpio + Gitflow reorganizado + Sistema de backup** |
| **v1.10.0** | 09 Ago 2025 | ✅ Stable | **Bug crítico de eliminación CORREGIDO + Eliminación directa del DOM** |
| **v1.9.0** | 09 Ago 2025 | ✅ Stable | **Persistencia de eliminaciones con Vercel KV + Sistema robusto** |

#### 🔄 **Versión Actual: v1.15.0**
- **Fecha de lanzamiento**: 12 de agosto de 2025
- **Características principales**: Vercel Blob para almacenamiento persistente, CSP/COEP/CORP ajustado, frontend usa URLs públicas de Blob
- **Estado**: Estable y en producción
- **Próxima versión**: v1.16.0 (en desarrollo)

#### 📋 **Cómo Verificar Tu Versión**
```zsh
# Ver todas las versiones disponibles
git tag -l

# Ver la versión actual del repositorio
git describe --tags

# Ver información detallada de una versión
git show v1.6.0

# Verificar qué rama estás usando
git branch --show-current
```

### 🛡️ **Rollback de Emergencia**

Si necesitas volver a una versión anterior:

```zsh
# Opción 1: Cambiar a una rama de release específica
git checkout release/v1.2.0

# Opción 2: Rollback con tag
git checkout v1.2.0

# Opción 3: Crear branch de emergencia desde tag
git checkout -b emergency/rollback-v1.2.0 v1.2.0
```

### 🔄 **Flujo de Trabajo para Nuevas Funcionalidades**

#### 1. **Crear Feature Branch desde Develop**
```zsh
# Siempre partir desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo
```

#### 2. **Desarrollar y Commit**
```zsh
# Hacer cambios
git add .
git commit -m "✨ feat: descripción de la funcionalidad"
git push origin feature/nombre-descriptivo
```

#### 3. **Merge a Develop**
```zsh
git checkout develop
git merge feature/nombre-descriptivo
git push origin develop
```

#### 4. **Crear Release Branch**
```zsh
# Para nueva versión
git checkout develop
git checkout -b release/v1.4.0
git push origin release/v1.4.0
```

#### 5. **Finalizar Release**
```zsh
# Mergear a main
git checkout main
git merge release/v1.4.0
git tag -a v1.4.0 -m "🎉 Release v1.4.0: Descripción"
git push origin main --tags

# Mergear de vuelta a develop
git checkout develop
git merge main
git push origin develop
```

### 🚨 **Hotfix para Producción**

```zsh
# Desde main
git checkout main
git checkout -b hotfix/critical-bug-fix
# Hacer corrección
git commit -m "🔧 Fix critical bug"
git checkout main
git merge hotfix/critical-bug-fix
git tag -a v1.2.2 -m "🔧 Critical bug fix"
git push origin main --tags
```

### 📊 **Comandos Útiles**

```zsh
# Ver todas las versiones
git tag -l

# Ver información de una versión
git show v1.2.0

# Ver diferencias entre versiones
git diff v1.1.0..v1.2.0

# Crear tag para el último commit
git tag -a v1.2.2 -m "🔧 Bug fix description"
git push origin v1.2.2
```

### 🔧 **Comandos de Vercel KV**

```zsh
# Instalar dependencia de Vercel KV
npm install @vercel/kv

# Verificar que Vercel KV esté funcionando
# Los logs del servidor mostrarán:
# ✅ Imagen X marcada para eliminación en Vercel KV
# 📋 Total de imágenes marcadas: X

# Verificar eliminaciones persistentes
# Las imágenes eliminadas NO deben volver a aparecer
# después de recargar la página
```

## 🚨 **PROBLEMA PENDIENTE: Drag & Drop en Galería**

### 🔍 **Estado Actual del Problema (v1.9.0)**

**Fecha de identificación**: 9 de agosto de 2025  
**Última sesión de debugging**: Chat con asistente AI  
**Rama de trabajo**: `feature/fix-gallery-drag-drop-loop`

#### ❌ **Problema Identificado**
El drag & drop en la galería **visualmente funciona** pero **no persiste los cambios**:
- ✅ **Efecto fantasma**: Las fotos se vuelven transparentes durante el arrastre
- ✅ **Indicadores visuales**: Las fotos se "corren" lateralmente mostrando dónde se van a colocar
- ❌ **No se mueven físicamente**: Al soltar, las fotos vuelven a su posición original
- ❌ **No se guarda en servidor**: El orden no se persiste

#### 🔧 **Cambios Implementados (Incompletos)**
1. **Función `updateGalleryOrderDOM()` corregida**:
   - Ahora mueve físicamente los elementos en el DOM
   - Implementa reordenamiento real de elementos
   - Actualiza índices correctamente

2. **Logs de debugging agregados**:
   - `🔄 Reordenando: elemento X → posición Y`
   - `📸 Nuevo orden: [lista de archivos]`
   - `🎨 Actualizando DOM...`
   - `💾 Guardando en servidor...`

3. **Protecciones contra loops**:
   - Variables `isLoadingGallery` y `galleryLoadAttempts`
   - Debounce en `saveGalleryOrder()` (500ms)
   - Verificación de orden idéntico antes de guardar

#### 🎯 **Lo que Falta Investigar**

1. **Función `handleDrop()`**:
   - Verificar que esté llamando correctamente a `reorderImages()`
   - Confirmar que los índices `fromIndex` y `toIndex` sean correctos

2. **Timing de animaciones**:
   - El `setTimeout` de 300ms en `reorderImages()` podría estar interfiriendo
   - Posible conflicto entre `applyReorderAnimation()` y `updateGalleryOrderDOM()`

3. **Eventos de drag & drop**:
   - Verificar que `makeGalleryItemDraggable()` esté configurando correctamente los eventos
   - Confirmar que `data-index` y `dataset.index` se mantengan sincronizados

4. **Sincronización DOM vs Array**:
   - El array `allImages` se actualiza correctamente
   - Pero el DOM no refleja el cambio visual

#### 🧪 **Pasos para Debuggear (Futura Sesión)**

1. **Verificar consola del navegador**:
   ```javascript
   // Deberían aparecer estos logs al hacer drag & drop:
   🔄 Reordenando: elemento X → posición Y
   📸 Nuevo orden: [lista de archivos]
   🎨 Actualizando DOM...
   🔄 DOM actualizado: elemento X movido a posición Y
   💾 Guardando en servidor...
   ```

2. **Revisar función `handleDrop()`**:
   - Buscar en `public/js/gallery.js` alrededor de la línea 154
   - Verificar que llame a `reorderImages(fromIndex, toIndex)`

3. **Probar sin animaciones**:
   - Comentar temporalmente `applyReorderAnimation()`
   - Verificar si el problema es de timing

4. **Verificar índices**:
   - Confirmar que `data-index` en elementos HTML coincida con índices del array
   - Verificar que `makeGalleryItemDraggable()` reciba índices correctos

#### 📁 **Archivos Clave para Revisar**
- `public/js/gallery.js` (líneas 154-200, 262-285)
- `views/admin.html` (verificar que solo se cargue `gallery.js` una vez)
- `app.js` (endpoint `/api/gallery/order` para verificar que reciba datos)

#### 💡 **Posibles Soluciones Futuras**
1. **Usar librería externa**: Sortable.js o Dragula para manejo automático
2. **Simplificar el flujo**: Eliminar animaciones temporales y actualizar DOM inmediatamente
3. **Revisar eventos**: Asegurar que no haya conflictos entre múltiples event listeners

---

## ✅ **PROBLEMA RESUELTO: Subida de Archivos en Vercel (v1.8.1)**

### 🔧 **Solución Implementada (9 de agosto de 2025)**

**Rama de trabajo**: `feature/fix-gallery-drag-drop-loop` → `main`  
**Estado**: ✅ **RESUELTO Y DESPLEGADO**

#### 🎯 **Problema Identificado**
- ❌ **Subida de fotos fallaba en Vercel** pero funcionaba en local
- ❌ **Error de permisos de archivos** en sistema de solo lectura de Vercel
- ❌ **Directorio `public/uploads/` no accesible** para escritura en producción

#### ✅ **Solución Implementada**

1. **Configuración de Multer adaptativa**:
   - **Local**: Usa `public/uploads/` (como antes)
   - **Vercel**: Usa `/tmp/` (directorio temporal accesible)

2. **Detección automática de entorno**:
   ```javascript
   const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
   ```

3. **Ruta de imágenes adaptativa**:
   - **Local**: `/uploads/` (archivos estáticos)
   - **Vercel**: `/temp-images/` (desde directorio temporal)

4. **Configuración de Vercel optimizada**:
   ```json
   {
     "env": { "VERCEL": "1" },
     "functions": { "maxDuration": 30 },
     "regions": ["iad1"]
   }
   ```

#### 🚀 **Estado del Deploy**
- ✅ **Merge a `main` completado**
- ✅ **Push a GitHub ejecutado**
- ✅ **Deploy automático de Vercel activado**
- ✅ **Funcionando correctamente en producción**

#### 📁 **Archivos Modificados**
- `app.js`: Configuración de multer y rutas adaptativas
- `public/js/gallery.js`: Detección de entorno para rutas de imágenes
- `vercel.json`: Configuración optimizada para producción
- `README.md`: Documentación del problema y solución

---

## ✅ **PROBLEMA RESUELTO: Eliminación de Imágenes en Vercel (v1.9.0)**

### 🔧 **Solución Implementada (9 de agosto de 2025)**

**Rama de trabajo**: `feature/vercel-kv-persistence` → `main`  
**Estado**: ✅ **RESUELTO Y DESPLEGADO**

#### 🎯 **Problema Identificado**
- ❌ **Error 500 al eliminar imágenes** en Vercel
- ❌ **Imágenes eliminadas volvían a aparecer** después de eliminar
- ❌ **Sistema de memoria temporal** no persistía entre reinicios
- ❌ **Thumbnails no visibles** (errores 404)

#### ✅ **Solución Implementada**

1. **Vercel KV (Redis) para persistencia**:
   - **Base de datos Redis** nativa de Vercel
   - **Almacenamiento persistente** de imágenes eliminadas
   - **Funciona entre deploys** y reinicios de funciones

2. **Sistema de fallback robusto**:
   - **Primera opción**: Vercel KV (producción)
   - **Segunda opción**: Memoria global (fallback)
   - **Tercera opción**: Archivo local (desarrollo)

3. **API endpoints mejorados**:
   - `DELETE /api/images/:filename`: Marca imagen para eliminación
   - `GET /api/images`: Filtra imágenes eliminadas automáticamente
   - `GET /api/deleted-images`: Lista imágenes marcadas (admin)

4. **Corrección de thumbnails**:
   - **Rutas unificadas**: Siempre usar `/uploads/` en lugar de `/temp-images/`
   - **Detección de imágenes mejorada**: Magic bytes + extensiones
   - **Filtrado inteligente**: Excluye archivos no válidos

#### 🚀 **Estado del Deploy**
- ✅ **Merge a `main` completado**
- ✅ **Push a GitHub ejecutado**
- ✅ **Deploy automático de Vercel activado**
- ✅ **Vercel KV configurado y funcionando**

#### 📁 **Archivos Modificados**
- `app.js`: Implementación de Vercel KV, funciones helper, endpoints async
- `public/js/gallery.js`: Rutas de imágenes unificadas
- `package.json`: Nueva dependencia `@vercel/kv`
- `README.md`: Documentación de Vercel KV
- `vercel-kv-setup.md`: Guía de configuración paso a paso

#### 🔧 **Funcionalidades Técnicas**
- **Async/await**: Todos los endpoints relacionados con KV
- **Helper functions**: `addDeletedImage()` y `getDeletedImages()`
- **Error handling**: Fallback automático si KV falla
- **Logging mejorado**: Indicadores de uso de KV vs memoria

---

## ✅ **BUG CRÍTICO CORREGIDO: Eliminación de Imágenes (v1.10.0)**

### 🔧 **Problema Identificado (9 de agosto de 2025)**

**Rama de trabajo**: `main`  
**Estado**: ✅ **RESUELTO Y DESPLEGADO**

#### 🚨 **Síntomas del Bug**
- ❌ **Múltiples recargas automáticas** de la galería al eliminar fotos
- ❌ **Límite de intentos alcanzado** después de eliminar la 3ra foto
- ❌ **Imágenes eliminadas volvían a aparecer** después de 20-30 segundos
- ❌ **Mensaje de error**: "Máximo de intentos de carga alcanzado, saltando loadGalleryImages"

#### 🔍 **Causa Raíz Identificada**
```javascript
// CÓDIGO PROBLEMÁTICO (ANTES):
setTimeout(() => {
  loadGalleryImages();  // ← Recargaba toda la galería automáticamente
}, 500);
```

#### ✅ **Solución Implementada**
```javascript
// CÓDIGO CORREGIDO (DESPUÉS):
setTimeout(() => {
  const imageElement = document.querySelector(`[data-filename="${filename}"]`);
  if (imageElement) {
    imageElement.remove();  // ← Solo remueve la imagen del DOM
    console.log('✅ Imagen removida del DOM sin recargar galería');
  }
}, 500);
```

#### 🎯 **Beneficios de la Corrección**
- ✅ **Eliminación instantánea** sin recargas innecesarias
- ✅ **NO más límite de intentos** alcanzado
- ✅ **Imágenes eliminadas NO vuelven** a aparecer
- ✅ **Performance mejorada** - operación más rápida
- ✅ **Sistema de filtrado robusto** mantenido

#### 📁 **Archivos Modificados**
- `public/js/gallery.js`: 
  - Función `deleteImage()` corregida
  - Agregado `data-filename` a elementos de galería
  - Eliminación directa del DOM implementada

#### 🚀 **Estado del Deploy**
- ✅ **Commit**: `fd8c7f0` - "🔧 fix: Eliminar recarga automática de galería en deleteImage"
- ✅ **Push a GitHub**: Completado
- ✅ **Deploy automático de Vercel**: En progreso

---

## 📊 **ESTADO ACTUAL DEL PROYECTO (v1.11.0)**

### 🎯 **Funcionalidades Implementadas y Estables**
- ✅ **Portfolio público** con galería responsive
- ✅ **Panel de administración** con autenticación segura
- ✅ **Sistema de álbumes** completo con drag & drop
- ✅ **Subida múltiple** de fotos (hasta 10 simultáneas)
- ✅ **Auto-agregado inteligente** a álbumes
- ✅ **Drag & drop en galería** con efectos visuales
- ✅ **Persistencia de eliminaciones** con Vercel KV (Redis)
- ✅ **Bug crítico de eliminación** CORREGIDO (v1.10.0)
- ✅ **Repositorio completamente limpio** sin fotos de prueba (v1.11.0)
- ✅ **Gitflow reorganizado** con sistema de backup (v1.11.0)

### 🔧 **Funcionalidades en Desarrollo/Mejora**
- 🟡 **Drag & drop en galería**: Funciona pero necesita refinamiento
- 🟡 **Sistema de notificaciones**: Funcional pero podría mejorarse
- 🟡 **Responsive design**: Funciona en móviles pero podría optimizarse

### 🚧 **Funcionalidades Pendientes/Futuras**
- 🔴 **Multi-selección para eliminación**: No implementado
- 🔴 **Búsqueda y filtros**: No implementado
- 🔴 **Sistema de tags**: No implementado
- 🔴 **Exportar galería**: No implementado
- 🔴 **Backup automático**: No implementado

> **💡 Nota**: Todas las funcionalidades pendientes están documentadas en el [BACKLOG.md](./BACKLOG.md) con criterios de aceptación detallados.

### 🐛 **Bugs Conocidos y Soluciones**
- ✅ **Imágenes vuelven a aparecer**: RESUELTO en v1.10.0
- ✅ **Límite de intentos alcanzado**: RESUELTO en v1.10.0
- ✅ **Thumbnails no visibles**: RESUELTO en v1.9.0
- ✅ **Eliminación en Vercel**: RESUELTO en v1.9.0

### 🛡️ **Sistema de Backup y Rollback (v1.11.0)**
- ✅ **Ramas de backup automáticas** para `main` y `develop`
- ✅ **Rollback instantáneo** a cualquier versión estable
- ✅ **Tags de versión** implementados para releases
- ✅ **Proceso Gitflow estandarizado** al 100%

---

## 📋 **SISTEMA DE BACKLOG Y ISSUES (v1.11.0)**

### 🎯 **Backlog Organizado por Prioridades**

El proyecto ahora cuenta con un sistema completo de backlog organizado en **7 issues** categorizados por prioridad:

#### 🚨 **PRIORIDAD ALTA (Crítico)**
- **Issue #1**: 🐛 Subida de Fotos No Funciona
- **Issue #2**: 🐛 Drag & Drop No Funciona en Galería

#### 🟡 **PRIORIDAD MEDIA (Importante)**
- **Issue #3**: 🎨 Botones de Acción Inconsistentes
- **Issue #4**: 🎯 Submenú de Hover Problemático

#### 🟢 **PRIORIDAD BAJA (Mejoras)**
- **Issue #5**: 🌐 DNS Personalizado
- **Issue #6**: 📞 Datos de Contacto Reales
- **Issue #7**: 🏷️ Versionado y Firma Webmaster

### 📚 **Documentación del Backlog**

- **`BACKLOG.md`** - Backlog completo con criterios de aceptación
- **`MANUAL-ISSUES.md`** - Instrucciones para crear issues manualmente
- **`create-github-issues.sh`** - Script automático (requiere GitHub CLI)

### 🔄 **Flujo de Trabajo con Issues**

1. **Crear feature branch** desde `develop` para cada issue
2. **Desarrollar** la funcionalidad siguiendo los criterios de aceptación
3. **Crear Pull Request** hacia `develop`
4. **Merge y deploy** después de revisión
5. **Cerrar issue** cuando esté completado

### 📍 **Acceso al Backlog**

- **GitHub Issues**: https://github.com/LuKeTeSky/sitio-luz/issues
- **Documentación local**: `BACKLOG.md` en el repositorio
- **Instrucciones manuales**: `MANUAL-ISSUES.md`

---

## 🚨 **IMPORTANTE: Sistema de Versionado y Gitflow**

### 📋 **ANTES de Implementar Cualquier Cambio:**

1. **✅ SIEMPRE verificar la versión actual:**
   ```zsh
   git tag -l | tail -5  # Ver las últimas 5 versiones
   git describe --tags   # Ver la versión actual del repositorio
   ```

2. **✅ SIEMPRE crear feature branch desde develop:**
   ```zsh
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-descriptivo
   ```

3. **✅ SIEMPRE respetar el versionado semántico:**
   - **v1.8.0** → **v1.9.0** (nueva funcionalidad)
   - **v1.8.0** → **v1.8.1** (bug fix)
   - **v1.8.0** → **v2.0.0** (cambio incompatible)

4. **✅ SIEMPRE actualizar el footer con la versión correcta:**
   - Buscar en `views/index.html`, `views/gallery-public.html`, `views/admin.html`
   - Actualizar `<span class="version-badge">vX.X.X</span>`
   - Actualizar `<span class="build-info">build: YYYY-MM-DD</span>`

5. **✅ SIEMPRE actualizar el README:**
   - Agregar nueva sección "Novedades Principales vX.X.X"
   - Actualizar tabla de historial de versiones
   - Marcar la nueva versión como "🟢 ACTUAL"

### 🚨 **Procedimiento de Rollback Seguro**

#### **Cuando algo falla en producción:**

```zsh
# 1. Identificar la última versión estable
git tag -l | grep v1

# 2. Cambiar a la rama de release anterior
git checkout release/v1.2.0

# 3. O crear rama de emergencia desde tag
git checkout -b emergency/rollback-from-v1.3.0 v1.2.0

# 4. Desplegar desde la versión estable
npm start
```

#### **Para volver a develop después del rollback:**

```zsh
# Mergear los cambios de la rama de emergencia si es necesario
git checkout develop
git merge emergency/rollback-from-v1.3.0
git push origin develop
```

### 🎯 **Convenciones de Commits**

- **✨** `feat:` Nueva funcionalidad
- **🔧** `fix:` Corrección de bug
- **📝** `docs:` Documentación
- **🎨** `style:` Cambios de estilo/formato
- **♻️** `refactor:` Refactorización de código
- **⚡** `perf:` Mejoras de rendimiento
- **🧪** `test:` Agregar o modificar tests
- **🔧** `chore:` Tareas de mantenimiento

---

**Desarrollado con ❤️ para el mundo de la moda y la fotografía**# Deploy trigger Sat Aug  9 18:16:34 -03 2025
# Deploy trigger Sat Aug  9 18:32:37 -03 2025
# Deploy hook configured Sat Aug  9 18:39:56 -03 2025
# Repository now public - ready for Vercel deploy Sat Aug  9 18:46:32 -03 2025
# Public repo deploy test Sat Aug  9 18:48:18 -03 2025
