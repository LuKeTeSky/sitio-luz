# 📋 **BACKLOG DE DESARROLLO - LUZ Portfolio**

## 🚨 **PRIORIDAD ALTA (Crítico)**

### **Issue #1: Subida de Fotos No Funciona** ✅ **COMPLETADO**
- **Descripción**: No se pueden subir fotos al sitio, aunque no muestra errores visibles
- **Tipo**: Bug
- **Componente**: Sistema de upload
- **Estado**: ✅ **RESUELTO** - Sistema de upload completamente funcional en v1.12.1
- **Criterios de Aceptación**:
  - [x] Las fotos se suben correctamente
  - [x] Se muestran en la galería después de la subida
  - [x] No hay errores en consola
  - [x] Funciona tanto en local como en Vercel
- **Notas**: Sistema completamente corregido en v1.12.1 con endpoint adaptativo para Vercel

### **Issue #2: Drag & Drop No Funciona** ✅ **COMPLETADO**
- **Descripción**: El drag & drop en la galería no funciona correctamente
- **Tipo**: Bug
- **Componente**: Galería admin
- **Estado**: ✅ **RESUELTO** - Drag & drop implementado en albums.js y gallery.js
- **Criterios de Aceptación**:
  - [x] Se puede arrastrar y soltar fotos
  - [x] El orden se mantiene después del drop
  - [x] No hay efecto "fantasma" que revierta la posición
  - [x] La funcionalidad es fluida y responsiva
- **Notas**: Sistema implementado en v1.8.0 con efectos visuales y persistencia

### **Issue #8: Persistencia de Álbumes falla en Producción (Vercel)**
- **Descripción**: Al crear un álbum nuevo desde el admin en producción, los datos no persisten. Tras unos segundos, reinicios de funciones o nuevos deploys, los álbumes desaparecen porque actualmente en prod se guarda en memoria.
- **Tipo**: Bug
- **Componente**: Álbumes (Frontend `albums.js` / Backend `app.js` + Vercel KV)
- **Estado**: 🔴 PENDIENTE
- **Causa raíz (probable)**: En Vercel, `loadAlbums()`/`saveAlbums()` usan memoria en vez de almacenamiento persistente.
- **Criterios de Aceptación**:
  - [ ] Crear un álbum en admin lo persiste en **Vercel KV** (producción) y en archivo local (desarrollo)
  - [ ] El listado de álbumes se obtiene desde KV en producción (fallback seguro si KV no disponible)
  - [ ] Los álbumes creados sobreviven reinicios, escalado y nuevos deploys
  - [ ] Admin y página pública ven el mismo conjunto de álbumes
  - [ ] Logs sin exponer secretos; manejo de errores claro
- **Tareas**:
  - [ ] Implementar persistencia en `app.js` para `loadAlbums()`/`saveAlbums()` usando KV en Vercel
  - [ ] Exponer endpoints REST: `GET /api/albums`, `POST /api/albums`, `PUT /api/albums/:id`, `DELETE /api/albums/:id`
  - [ ] Actualizar `albums.js` y `albums-homepage.js` para consumir la API
  - [ ] Agregar validaciones básicas (nombre requerido, longitudes)
  - [ ] Tests manuales en producción y local
- **Pasos de Prueba**:
  1. Crear un álbum en admin (producción) y verificar respuesta 200 con ID
  2. Refrescar admin y página pública: el álbum debe aparecer
  3. Forzar nuevo deployment y/o esperar reinicio: el álbum debe seguir presente
  4. Editar/eliminar el álbum y verificar persistencia

---

## 🟡 **PRIORIDAD MEDIA (Importante)**

### **Issue #3: Botones de Acción Inconsistentes**
- **Descripción**: Los botones de portada, eliminar, etc. no tienen el mismo estilo y ubicación
- **Tipo**: Mejora de UX
- **Componente**: Galería y álbumes
- **Criterios de Aceptación**:
  - [ ] Todos los botones tienen el mismo color
  - [ ] Todos los botones están en la misma ubicación
  - [ ] El diseño es consistente en toda la aplicación
  - [ ] Los botones son fácilmente identificables

### **Issue #4: Submenú de Hover Problemático**
- **Descripción**: Al pasar el mouse sobre las fotos, el submenú es muy grande y no se puede seleccionar bien
- **Tipo**: Mejora de UX
- **Componente**: Galería
- **Criterios de Aceptación**:
  - [ ] El submenú tiene un tamaño apropiado
  - [ ] Se puede navegar fácilmente por las opciones
  - [ ] No interfiere con otras funcionalidades
  - [ ] Es responsive en diferentes dispositivos

---

## 🟢 **PRIORIDAD BAJA (Mejoras)**

### **Issue #5: DNS Personalizado**
- **Descripción**: Cambiar a un DNS propio en lugar del actual
- **Tipo**: Mejora de infraestructura
- **Componente**: Configuración de dominio
- **Criterios de Aceptación**:
  - [ ] El sitio funciona con el nuevo DNS
  - [ ] No hay interrupciones en el servicio
  - [ ] La configuración es estable
  - [ ] Se documenta el proceso

### **Issue #6: Datos de Contacto Reales**
- **Descripción**: Actualizar la información de contacto con datos reales de la modelo
- **Tipo**: Contenido
- **Componente**: Páginas de contacto
- **Criterios de Aceptación**:
  - [ ] La información de contacto es real y verificable
  - [ ] Los datos están actualizados
  - [ ] La información es consistente en todas las páginas
  - [ ] Se respeta la privacidad de la modelo

### **Issue #7: Versionado y Firma Webmaster**
- **Descripción**: Implementar versionado profesional y firma del webmaster
- **Tipo**: Mejora de profesionalismo
- **Componente**: Footer y metadata
- **Criterios de Aceptación**:
  - [ ] Se muestra la versión actual del software
  - [ ] Incluye firma del webmaster
  - [ ] Tiene parámetros profesionales (build date, commit hash, etc.)
  - [ ] Es visible pero no intrusivo

---

## 📊 **ESTADO DEL BACKLOG**

- **Total de Issues**: 8
- **✅ Completados**: 2 (Issues #1 y #2)
- **🟡 En Desarrollo**: 2 (Issues #3 y #4)
- **🟢 Pendientes**: 4 (Issues #5, #6, #7 y #8)
- **🎯 Progreso**: 25% completado
- **🚨 Críticos**: 2/3 (66.7% resueltos)

## 🔄 **FLUJO DE TRABAJO**

1. **Crear Issue en GitHub** para cada tarea
2. **Asignar etiquetas** apropiadas (bug, enhancement, etc.)
3. **Establecer prioridades** usando milestones
4. **Crear feature branch** para cada Issue
5. **Desarrollar y testear** la funcionalidad
6. **Crear Pull Request** hacia develop
7. **Merge y deploy** después de revisión
8. **Cerrar Issue** cuando esté completado

## 🏷️ **ETIQUETAS RECOMENDADAS**

- `bug` - Para Issues #1 y #2
- `enhancement` - Para Issues #3, #4, #6, #7
- `infrastructure` - Para Issue #5
- `high-priority` - Para Issues #1 y #2
- `medium-priority` - Para Issues #3 y #4
- `low-priority` - Para Issues #5, #6 y #7

---

**Última actualización**: 13 de agosto de 2025  
**Versión del backlog**: v1.0  
**Responsable**: Equipo de desarrollo
