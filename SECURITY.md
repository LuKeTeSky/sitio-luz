# 🔒 Guía de Seguridad - Portfolio LUZ

## 🚀 Preparación para Hosting Público

### ⚠️ ANTES DE HACER DEPLOY

#### 1. 🔑 Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con valores seguros
nano .env
```

**Variables obligatorias:**
- `ADMIN_PASSWORD`: Contraseña fuerte para admin (mín. 12 caracteres)
- `SESSION_SECRET`: Clave aleatoria de 32+ caracteres
- `NODE_ENV=production`

#### 2. 🛡️ Medidas de Seguridad Implementadas

**Autenticación:**
- ✅ Contraseñas desde variables de entorno
- ✅ Rate limiting en login (5 intentos/15min)
- ✅ Sesiones seguras con httpOnly cookies
- ✅ Regeneración de sesión tras login

**Protección General:**
- ✅ Helmet.js para headers de seguridad
- ✅ Rate limiting global (100 req/15min)
- ✅ Content Security Policy
- ✅ Validación de uploads robusta
- ✅ Manejo seguro de errores

**Prevención de Exposición:**
- ✅ .gitignore para archivos sensibles
- ✅ Variables de entorno para credenciales
- ✅ Logs de seguridad sin información sensible

### 🌐 Opciones de Hosting

#### 1. **Vercel (Recomendado)**
- ✅ Deploy automático desde GitHub
- ✅ HTTPS automático
- ✅ Variables de entorno seguras
- ✅ Configuración incluida (vercel.json)

**Deploy:**
```bash
npm install -g vercel
vercel --prod
```

#### 2. **Railway**
- ✅ Hosting Node.js nativo
- ✅ Base de datos incluida
- ✅ Domain personalizado

#### 3. **Heroku**
- ✅ Free tier disponible
- ✅ Add-ons para BD
- ✅ Git deployment

### ⚠️ GitHub Pages NO es compatible
GitHub Pages solo sirve archivos estáticos, no aplicaciones Node.js.

### 🔧 Configuración de Producción

#### Variables de Entorno en Hosting:
```
ADMIN_PASSWORD=tu_password_super_seguro
SESSION_SECRET=clave_aleatoria_de_32_caracteres_minimo
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=31457280
MAX_FILES=15
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### Verificar Seguridad:
```bash
# Endpoint de health check
curl https://tu-dominio.com/health

# Test de rate limiting
curl -I https://tu-dominio.com/login
```

### 🚨 Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Contraseña fuerte establecida
- [ ] .env añadido a .gitignore
- [ ] Rate limits configurados
- [ ] HTTPS habilitado en hosting
- [ ] Logs de error configurados
- [ ] Backup de archivos críticos

### 📞 Soporte de Seguridad

Si encuentras vulnerabilidades:
1. NO crear issue público
2. Contactar directamente
3. Proporcionar detalles técnicos
4. Esperar respuesta antes de disclosure

### 🔄 Mantenimiento

**Actualizaciones regulares:**
- Dependencias npm mensualmente
- Revisión de logs semanalmente
- Rotación de SECRET_SESSION cada 3 meses
- Backup de uploads regularmente
