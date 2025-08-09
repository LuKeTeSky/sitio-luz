# 🌟 LUZ - Portfolio de Moda y Fotografía

Un portfolio elegante y moderno para modelos de moda, con sistema de gestión de álbumes y galería profesional.

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
│   │   ├── gallery.js           # Funcionalidad de galería admin (subida múltiple, auto-agregado)
│   │   ├── albums.js            # Gestión de álbumes (drag & drop, reordenamiento)
│   │   ├── albums-homepage.js   # Gestión de álbumes página pública
│   │   ├── hero-loader.js       # Carga dinámica del hero
│   │   └── gallery-public.js    # Galería pública
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

## 🚀 Gitflow y Versionado

### 📋 **Estructura de Branches**

Este proyecto sigue las mejores prácticas de **Gitflow** con versionado semántico:

- **`main`** - Código de producción estable y releases
- **`develop`** - Rama de desarrollo principal e integración
- **`feature/*`** - Nuevas funcionalidades y mejoras
- **`release/*`** - Preparación y pruebas de releases
- **`hotfix/*`** - Correcciones urgentes de producción

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
| **v1.6.0** | 09 Ago 2025 | **🟢 ACTUAL** | **Subida múltiple + Auto-agregado + Drag & drop** |

#### 🔄 **Versión Actual: v1.6.0**
- **Fecha de lanzamiento**: 9 de agosto de 2025
- **Características principales**: Subida múltiple, auto-agregado inteligente, reordenamiento drag & drop
- **Estado**: Estable y en producción
- **Próxima versión**: v1.7.0 (en desarrollo)

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
