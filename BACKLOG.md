# 📋 **BACKLOG DE DESARROLLO - LUZ Portfolio**

## 🚨 **PRIORIDAD ALTA (Crítico)**

### **Issue #1: Subida de Fotos No Funciona**
- **Descripción**: No se pueden subir fotos al sitio, aunque no muestra errores visibles
- **Tipo**: Bug
- **Componente**: Sistema de upload
- **Criterios de Aceptación**:
  - [ ] Las fotos se suben correctamente
  - [ ] Se muestran en la galería después de la subida
  - [ ] No hay errores en consola
  - [ ] Funciona tanto en local como en Vercel

### **Issue #2: Drag & Drop No Funciona**
- **Descripción**: El drag & drop en la galería no funciona correctamente
- **Tipo**: Bug
- **Componente**: Galería admin
- **Criterios de Aceptación**:
  - [ ] Se puede arrastrar y soltar fotos
  - [ ] El orden se mantiene después del drop
  - [ ] No hay efecto "fantasma" que revierta la posición
  - [ ] La funcionalidad es fluida y responsiva

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

- **Total de Issues**: 7
- **Críticos**: 2
- **Importantes**: 2
- **Mejoras**: 3

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

**Última actualización**: 10 de agosto de 2025  
**Versión del backlog**: v1.0  
**Responsable**: Equipo de desarrollo
