# 🔧 Configuración de Vercel KV

## 📋 Variables de Entorno Necesarias

Vercel KV se configura automáticamente cuando creas la base de datos. Las variables se agregan a tu proyecto automáticamente:

```bash
# Vercel KV (Redis) - Se configuran automáticamente
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

## 🚀 Pasos para Configurar Vercel KV

### 1. Crear Base de Datos KV en Vercel
- Ve a tu dashboard de Vercel
- Selecciona tu proyecto `sitio-luz`
- Ve a la pestaña "Storage"
- Haz clic en "Create Database"
- Selecciona "KV (Redis)"
- Elige el plan gratuito (100MB)
- Selecciona la región más cercana

### 2. Variables de Entorno
- Las variables se configuran automáticamente
- No es necesario configurarlas manualmente
- Vercel las inyecta en tu aplicación

### 3. Deploy Automático
- Una vez creada la base de datos
- Vercel detecta los cambios automáticamente
- El deploy incluye la configuración de KV

## ✅ Beneficios de Vercel KV

- **Persistencia Real**: Las eliminaciones no se pierden al reiniciar
- **Escalabilidad**: Funciona con múltiples instancias
- **Gratuito**: Hasta 100MB de almacenamiento
- **Integración Nativa**: Funciona perfectamente con Vercel
- **Fallback**: Si KV falla, usa memoria como respaldo

## 🔍 Verificación

Después del deploy, puedes verificar que funcione:

1. **Eliminar una imagen** en el admin
2. **Recargar la página** - la imagen NO debe volver
3. **Verificar en la consola** que use "Vercel KV" en lugar de "memoria"

## 🚨 Troubleshooting

Si las eliminaciones no persisten:

1. **Verificar variables de entorno** en Vercel
2. **Revisar logs** del deploy
3. **Confirmar** que la base de datos KV esté activa
4. **Verificar** que el código use `await` correctamente
