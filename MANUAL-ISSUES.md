# 📋 **CREAR ISSUES MANUALMENTE EN GITHUB**

Si no puedes usar el script automático `create-github-issues.sh`, aquí tienes las instrucciones para crear cada issue manualmente.

## 🚀 **PASO A PASO:**

### **1. Ir a la página de Issues**
- Navegar a: https://github.com/LuKeTeSky/sitio-luz/issues
- Hacer clic en **"New issue"**

### **2. Crear Issue #1: Subida de Fotos No Funciona**

**Título**: `🐛 Subida de Fotos No Funciona`

**Descripción**:
```markdown
## 🚨 **PRIORIDAD ALTA (Crítico)**

**Descripción**: No se pueden subir fotos al sitio, aunque no muestra errores visibles

**Tipo**: Bug
**Componente**: Sistema de upload

**Criterios de Aceptación**:
- [ ] Las fotos se suben correctamente
- [ ] Se muestran en la galería después de la subida
- [ ] No hay errores en consola
- [ ] Funciona tanto en local como en Vercel

**Reproducción**:
1. Ir al panel admin
2. Intentar subir una foto
3. La foto no aparece en la galería

**Entorno**:
- Local: ❌
- Vercel: ❌

**Relacionado con**: Sistema de upload, galería admin
```

**Labels**: `bug`, `high-priority`, `upload-system`

---

### **3. Crear Issue #2: Drag & Drop No Funciona**

**Título**: `🐛 Drag & Drop No Funciona en Galería`

**Descripción**:
```markdown
## 🚨 **PRIORIDAD ALTA (Crítico)**

**Descripción**: El drag & drop en la galería no funciona correctamente

**Tipo**: Bug
**Componente**: Galería admin

**Criterios de Aceptación**:
- [ ] Se puede arrastrar y soltar fotos
- [ ] El orden se mantiene después del drop
- [ ] No hay efecto "fantasma" que revierta la posición
- [ ] La funcionalidad es fluida y responsiva

**Reproducción**:
1. Ir al panel admin
2. Intentar arrastrar una foto
3. La foto vuelve a su posición original

**Estado Actual**: Funciona parcialmente pero con bugs
**Notas**: Ya se implementó pero necesita refinamiento
```

**Labels**: `bug`, `high-priority`, `drag-drop`

---

### **4. Crear Issue #3: Botones de Acción Inconsistentes**

**Título**: `🎨 Botones de Acción Inconsistentes en Galería`

**Descripción**:
```markdown
## 🟡 **PRIORIDAD MEDIA (Importante)**

**Descripción**: Los botones de portada, eliminar, etc. no tienen el mismo estilo y ubicación

**Tipo**: Mejora de UX
**Componente**: Galería y álbumes

**Criterios de Aceptación**:
- [ ] Todos los botones tienen el mismo color
- [ ] Todos los botones están en la misma ubicación
- [ ] El diseño es consistente en toda la aplicación
- [ ] Los botones son fácilmente identificables

**Componentes Afectados**:
- Galería principal
- Vista de álbumes
- Panel admin
- Galería pública
```

**Labels**: `enhancement`, `medium-priority`, `ux-improvement`

---

### **5. Crear Issue #4: Submenú de Hover Problemático**

**Título**: `🎯 Submenú de Hover Problemático en Galería`

**Descripción**:
```markdown
## 🟡 **PRIORIDAD MEDIA (Importante)**

**Descripción**: Al pasar el mouse sobre las fotos, el submenú es muy grande y no se puede seleccionar bien

**Tipo**: Mejora de UX
**Componente**: Galería

**Criterios de Aceptación**:
- [ ] El submenú tiene un tamaño apropiado
- [ ] Se puede navegar fácilmente por las opciones
- [ ] No interfiere con otras funcionalidades
- [ ] Es responsive en diferentes dispositivos

**Problema Actual**:
- Submenú demasiado grande
- Dificultad para seleccionar opciones
- Interfiere con la navegación
```

**Labels**: `enhancement`, `medium-priority`, `ux-improvement`

---

### **6. Crear Issue #5: DNS Personalizado**

**Título**: `🌐 Cambiar a DNS Personalizado`

**Descripción**:
```markdown
## 🟢 **PRIORIDAD BAJA (Mejoras)**

**Descripción**: Cambiar a un DNS propio en lugar del actual

**Tipo**: Mejora de infraestructura
**Componente**: Configuración de dominio

**Criterios de Aceptación**:
- [ ] El sitio funciona con el nuevo DNS
- [ ] No hay interrupciones en el servicio
- [ ] La configuración es estable
- [ ] Se documenta el proceso

**Consideraciones**:
- Mantener el sitio funcionando durante la transición
- Configurar DNS en Vercel
- Documentar el proceso para futuras referencias
```

**Labels**: `infrastructure`, `low-priority`, `dns`

---

### **7. Crear Issue #6: Datos de Contacto Reales**

**Título**: `📞 Actualizar Datos de Contacto Reales`

**Descripción**:
```markdown
## 🟢 **PRIORIDAD BAJA (Mejoras)**

**Descripción**: Actualizar la información de contacto con datos reales de la modelo

**Tipo**: Contenido
**Componente**: Páginas de contacto

**Criterios de Aceptación**:
- [ ] La información de contacto es real y verificable
- [ ] Los datos están actualizados
- [ ] La información es consistente en todas las páginas
- [ ] Se respeta la privacidad de la modelo

**Páginas a Actualizar**:
- Homepage
- Galería pública
- Formulario de contacto
- Footer
```

**Labels**: `enhancement`, `low-priority`, `content`

---

### **8. Crear Issue #7: Versionado y Firma Webmaster**

**Título**: `🏷️ Implementar Versionado Profesional y Firma Webmaster`

**Descripción**:
```markdown
## 🟢 **PRIORIDAD BAJA (Mejoras)**

**Descripción**: Implementar versionado profesional y firma del webmaster

**Tipo**: Mejora de profesionalismo
**Componente**: Footer y metadata

**Criterios de Aceptación**:
- [ ] Se muestra la versión actual del software
- [ ] Incluye firma del webmaster
- [ ] Tiene parámetros profesionales (build date, commit hash, etc.)
- [ ] Es visible pero no intrusivo

**Elementos a Implementar**:
- Badge de versión en footer
- Información de build
- Firma del desarrollador
- Metadata profesional
```

**Labels**: `enhancement`, `low-priority`, `professional`

---

## 🏷️ **ETIQUETAS A CREAR:**

Si no existen, crear estas etiquetas en GitHub:

### **Tipos**:
- `bug` - Para errores
- `enhancement` - Para mejoras
- `infrastructure` - Para cambios de infraestructura

### **Prioridades**:
- `high-priority` - Para issues críticos
- `medium-priority` - Para issues importantes
- `low-priority` - Para mejoras

### **Componentes**:
- `upload-system` - Sistema de subida
- `drag-drop` - Funcionalidad drag & drop
- `ux-improvement` - Mejoras de UX
- `dns` - Configuración DNS
- `content` - Contenido del sitio
- `professional` - Mejoras profesionales

---

## 📊 **DESPUÉS DE CREAR LOS ISSUES:**

1. **Revisar** que todos estén creados correctamente
2. **Asignar prioridades** usando milestones si es necesario
3. **Comenzar** con los issues de prioridad alta (#1 y #2)
4. **Crear feature branches** para cada issue que vayas a trabajar
5. **Seguir el flujo Gitflow** establecido

---

**¡Listo! Ahora tienes un backlog completo y organizado en GitHub.** 🎉
