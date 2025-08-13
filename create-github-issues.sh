#!/bin/bash

# 🚀 Script para crear Issues en GitHub desde el backlog
# Uso: ./create-github-issues.sh

echo "🌟 CREANDO ISSUES EN GITHUB PARA LUZ PORTFOLIO"
echo "================================================"
echo ""

echo -e "${BLUE}📋 Creando Issue #8: Persistencia de Álbumes falla en Producción (Vercel)${NC}"
gh issue create \
    --title "🐛 Persistencia de Álbumes falla en Producción (Vercel)" \
    --body "## 🚨 **PRIORIDAD ALTA (Crítico)**\n\n**Descripción**: Al crear un álbum nuevo desde el admin en producción, los datos no persisten. Tras unos segundos, reinicios de funciones o nuevos deploys, los álbumes desaparecen porque actualmente en prod se guarda en memoria.\n\n**Tipo**: Bug\n**Componente**: Álbumes (Frontend \`albums.js\` / Backend \`app.js\` + Vercel KV)\n\n**Criterios de Aceptación**:\n- [ ] Crear un álbum en admin lo persiste en **Vercel KV** (producción) y en archivo local (desarrollo)\n- [ ] El listado de álbumes se obtiene desde KV en producción (fallback seguro si KV no disponible)\n- [ ] Los álbumes creados sobreviven reinicios, escalado y nuevos deploys\n- [ ] Admin y página pública ven el mismo conjunto de álbumes\n- [ ] Logs sin exponer secretos; manejo de errores claro\n\n**Tareas**:\n- [ ] Implementar persistencia en \`app.js\` para \`loadAlbums()\`/\`saveAlbums()\` usando KV en Vercel\n- [ ] Exponer endpoints REST: \`GET /api/albums\`, \`POST /api/albums\`, \`PUT /api/albums/:id\`, \`DELETE /api/albums/:id\`\n- [ ] Actualizar \`albums.js\` y \`albums-homepage.js\` para consumir la API\n- [ ] Agregar validaciones básicas (nombre requerido, longitudes)\n- [ ] Tests manuales en producción y local\n\n**Pasos de Prueba**:\n1. Crear un álbum en admin (producción) y verificar respuesta 200 con ID\n2. Refrescar admin y página pública: el álbum debe aparecer\n3. Forzar nuevo deployment y/o esperar reinicio: el álbum debe seguir presente\n4. Editar/eliminar el álbum y verificar persistencia" \
    --label "bug,high-priority,albums" \
    --assignee "@me"

echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) no está instalado.${NC}"
    echo -e "${YELLOW}💡 Instalar con: brew install gh (macOS) o apt install gh (Ubuntu)${NC}"
    echo -e "${BLUE}📖 O crear los issues manualmente en: https://github.com/LuKeTeSky/sitio-luz/issues${NC}"
    exit 1
fi

# Verificar si está autenticado
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ No estás autenticado en GitHub CLI${NC}"
    echo -e "${YELLOW}💡 Ejecutar: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI detectado y autenticado${NC}"
echo ""

# Crear Issues uno por uno
echo -e "${BLUE}📋 Creando Issue #1: Subida de Fotos No Funciona${NC}"
gh issue create \
    --title "🐛 Subida de Fotos No Funciona" \
    --body "## 🚨 **PRIORIDAD ALTA (Crítico)**

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

**Relacionado con**: Sistema de upload, galería admin" \
    --label "bug,high-priority,upload-system" \
    --assignee "@me"

echo ""

echo -e "${BLUE}📋 Creando Issue #2: Drag & Drop No Funciona${NC}"
gh issue create \
    --title "🐛 Drag & Drop No Funciona en Galería" \
    --body "## 🚨 **PRIORIDAD ALTA (Crítico)**

**Descripción**: El drag & drop en la galería no funciona correctamente

**Tipo**: Bug
**Componente**: Galería admin

**Criterios de Aceptación**:
- [ ] Se puede arrastrar y soltar fotos
- [ ] El orden se mantiene después del drop
- [ ] No hay efecto \"fantasma\" que revierta la posición
- [ ] La funcionalidad es fluida y responsiva

**Reproducción**:
1. Ir al panel admin
2. Intentar arrastrar una foto
3. La foto vuelve a su posición original

**Estado Actual**: Funciona parcialmente pero con bugs
**Notas**: Ya se implementó pero necesita refinamiento" \
    --label "bug,high-priority,drag-drop" \
    --assignee "@me"

echo ""

echo -e "${BLUE}📋 Creando Issue #3: Botones de Acción Inconsistentes${NC}"
gh issue create \
    --title "🎨 Botones de Acción Inconsistentes en Galería" \
    --body "## 🟡 **PRIORIDAD MEDIA (Importante)**

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
- Galería pública" \
    --label "enhancement,medium-priority,ux-improvement" \
    --assignee "@me"

echo ""

echo -e "${BLUE}📋 Creando Issue #4: Submenú de Hover Problemático${NC}"
gh issue create \
    --title "🎯 Submenú de Hover Problemático en Galería" \
    --body "## 🟡 **PRIORIDAD MEDIA (Importante)**

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
- Interfiere con la navegación" \
    --label "enhancement,medium-priority,ux-improvement" \
    --assignee "@me"

echo ""

echo -e "${BLUE}📋 Creando Issue #5: DNS Personalizado${NC}"
gh issue create \
    --title "🌐 Cambiar a DNS Personalizado" \
    --body "## 🟢 **PRIORIDAD BAJA (Mejoras)**

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
- Documentar el proceso para futuras referencias" \
    --label "infrastructure,low-priority,dns" \
    --assignee "@me"

echo ""

echo -e "${BLUE}📋 Creando Issue #6: Datos de Contacto Reales${NC}"
gh issue create \
    --title "📞 Actualizar Datos de Contacto Reales" \
    --body "## 🟢 **PRIORIDAD BAJA (Mejoras)**

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
- Footer" \
    --label "enhancement,low-priority,content" \
    --assignee "@me"

echo ""

echo -e "${BLUE}📋 Creando Issue #7: Versionado y Firma Webmaster${NC}"
gh issue create \
    --title "🏷️ Implementar Versionado Profesional y Firma Webmaster" \
    --body "## 🟢 **PRIORIDAD BAJA (Mejoras)**

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
- Metadata profesional" \
    --label "enhancement,low-priority,professional" \
    --assignee "@me"

echo ""
echo -e "${GREEN}🎉 ¡Todos los Issues han sido creados exitosamente!${NC}"
echo ""
echo -e "${BLUE}📋 Ver todos los issues en:${NC}"
echo -e "${YELLOW}https://github.com/LuKeTeSky/sitio-luz/issues${NC}"
echo ""
echo -e "${GREEN}✅ Proceso completado. Ahora puedes:${NC}"
echo "1. Revisar los issues creados en GitHub"
echo "2. Asignar prioridades usando milestones"
echo "3. Comenzar a trabajar en los de prioridad alta"
echo "4. Crear feature branches para cada issue"
echo ""
echo -e "${BLUE}🚀 ¡Happy coding!${NC}"
