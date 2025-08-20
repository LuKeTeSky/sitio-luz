require('dotenv').config();
const express = require('express');
const multer = require('multer');
// Vercel Blob (persistencia de imágenes)
let blobPut = null;
let blobDel = null;
let blobList = null;
try {
  const blobLib = require('@vercel/blob');
  blobPut = blobLib.put;
  blobDel = blobLib.del;
  blobList = blobLib.list;
} catch (_) {}
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');

// 🔧 Vercel KV para persistencia
let kv = null;
if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
  try {
    const kvPkg = require('@vercel/kv');
    // SDK exporta { kv }
    kv = kvPkg && kvPkg.kv ? kvPkg.kv : kvPkg;
    if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
      console.log('✅ Vercel KV inicializado correctamente');
    } else {
      console.log('⚠️ Vercel KV no se inicializó correctamente (sin métodos get/set). Usando memoria como fallback');
      kv = null;
    }
  } catch (error) {
    console.log('⚠️ Vercel KV no disponible, usando memoria como fallback:', error.message);
    kv = null;
  }
}

const app = express();

// Vercel está detrás de un proxy/edge. Necesario para que req.secure sea true
// y se emita correctamente la cookie `secure` de la sesión en producción.
app.set('trust proxy', 1);

// 🔍 Debug: Verificar variables de entorno
  console.log('🔍 Entorno: VERCEL=', process.env.VERCEL, ' NODE_ENV=', process.env.NODE_ENV);
  console.log('🔍 KV:', kv ? '✅ disponible' : '❌ no disponible');

// 🛡️ Configuración de seguridad
app.use(helmet({
  // Permitir carga de imágenes desde dominios externos (Blob) y evitar bloquear por COEP/CORP
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        // Algunos entornos corporativos/ZeroTrust redirigen cdnjs a speed.cloudflareaccess.com
        // Permitimos este host para evitar bloqueos del loader de terceros
        "https://speed.cloudflareaccess.com"
      ],
      connectSrc: [
        "'self'",
        // Permitir consulta de amanecer/atardecer para modo automático atenuado
        "https://api.sunrise-sunset.org"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        // Permitir imágenes servidas desde Vercel Blob (URLs públicas)
        "https://*.vercel-storage.com",
        "https://*.blob.vercel-storage.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.sunrise-sunset.org",
        "https://ipapi.co"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiter general, pero excluir rutas de galería
app.use((req, res, next) => {
  if (req.path.startsWith('/api/gallery')) {
    return next(); // Saltar rate limiter para rutas de galería
  }
  limiter(req, res, next);
});

// 🚦 Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 🚦 Rate limiting específico para galería (más permisivo)
const galleryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // 50 requests por minuto para operaciones de galería
  message: 'Too many gallery operations from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 🧩 Correlation ID simple para trazas
app.use((req, res, next) => {
  req._rid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});

// 📁 Configuración de multer con límites y validación
const upload = multer({
  dest: process.env.VERCEL === '1' ? '/tmp/' : path.join(__dirname, 'public/uploads'),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 30 * 1024 * 1024, // 30MB por archivo
    files: parseInt(process.env.MAX_FILES) || 15 // Máximo 15 archivos simultáneos
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    
    const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
    const extensionValid = allowedExtensions.test(file.originalname);
    
    if (mimeTypeValid && extensionValid) {
      return cb(null, true);
    } else {
      const error = new Error('Solo se permiten imágenes (JPG, JPEG, PNG, GIF, WebP). Tamaño máximo: 5MB');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
  }
});

// 🔧 Funciones helper para Vercel KV
async function addDeletedImage(filename) {
  try {
    if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
      // Usar Vercel KV para persistencia
      const deletedImages = await kv.get('deletedImages') || [];
      if (!deletedImages.includes(filename)) {
        deletedImages.push(filename);
        await kv.set('deletedImages', deletedImages);
        console.log(`✅ Imagen ${filename} marcada para eliminación en Vercel KV`);
      }
      return deletedImages;
    } else {
      // Fallback a memoria global
      if (!global.deletedImages) {
        global.deletedImages = [];
      }
      if (!global.deletedImages.includes(filename)) {
        global.deletedImages.push(filename);
        console.log(`✅ Imagen ${filename} marcada para eliminación en memoria`);
      }
      return global.deletedImages;
    }
  } catch (error) {
    console.error('❌ Error marcando imagen para eliminación:', error);
    // Fallback a memoria global en caso de error
    if (!global.deletedImages) {
      global.deletedImages = [];
    }
    if (!global.deletedImages.includes(filename)) {
      global.deletedImages.push(filename);
    }
    return global.deletedImages;
  }
}

async function getDeletedImages() {
  try {
    if (kv && typeof kv.get === 'function') {
      // Obtener desde Vercel KV
      const deletedImages = await kv.get('deletedImages') || [];
      return deletedImages;
    } else {
      // Fallback a memoria global
      return global.deletedImages || [];
    }
  } catch (error) {
    console.error('❌ Error obteniendo imágenes eliminadas:', error);
    // Fallback a memoria global en caso de error
    return global.deletedImages || [];
  }
}

// 🔧 Función para crear directorio de uploads si no existe
function ensureUploadsDirectory() {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Directorio de uploads creado:', uploadsDir);
    } catch (error) {
      console.error('❌ Error creando directorio de uploads:', error);
      // En Vercel, usar directorio temporal
      return '/tmp/';
    }
  }
  return uploadsDir;
}

// 🚨 Acá va la línea para servir CSS, imágenes y otros archivos públicos
app.use(express.static('public'));

// 🔧 Ruta especial para servir imágenes en Vercel (desde directorio temporal) - YA NO NECESARIA
// if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
//   app.use('/temp-images', express.static('/tmp'));
// }

// 🛡️ Configuración de sesión segura
app.use(session({
  secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true, // Prevenir acceso desde JavaScript
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// 🔐 Middleware de autenticación para rutas protegidas
app.use((req, res, next) => {
  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    '/', // Página principal ahora es pública
    '/login', 
    '/login/', 
    '/css', 
    '/uploads', 
    '/js',
    '/api/images', // API pública para obtener imágenes
    '/api/hero', // API pública para obtener configuración del hero
    '/gallery' // Ruta pública para la galería
  ];
  
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  if (isPublicPath) {
    return next();
  }
  
  // Rutas que requieren autenticación (solo /admin y /upload)
  if (!req.session.authenticated) {
    // Para peticiones API/XHR o no-GET, devolver JSON 401 en vez de redirigir
    const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
    const isApiPath = req.path.startsWith('/api') || req.path.startsWith('/upload');
    const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
    if (acceptsJson || isApiPath || req.method !== 'GET' || isAjax) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    return res.redirect('/login');
  }
  next();
});

// ===================== MÉTRICAS (Issue #13) =====================
// Estructura diaria: { date: 'YYYY-MM-DD', visits: number, events: { [type]: number } }
let metricsMemory = { daily: {} };

function getDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function getDailyMetrics(dateKey) {
  try {
    if (kv && typeof kv.get === 'function') {
      const data = await kv.get(`metrics:daily:${dateKey}`);
      if (data && typeof data === 'object') return data;
      return { date: dateKey, visits: 0, uniques: 0, events: {}, countries: {}, photoViews: {}, linkClicks: {} };
    }
  } catch (e) {
    console.warn('KV get metrics error:', e.message);
  }
  // Fallback memoria
  if (!metricsMemory.daily[dateKey]) metricsMemory.daily[dateKey] = { date: dateKey, visits: 0, uniques: 0, events: {}, countries: {}, photoViews: {}, linkClicks: {} };
  return metricsMemory.daily[dateKey];
}

async function saveDailyMetrics(dateKey, data) {
  try {
    if (kv && typeof kv.set === 'function') {
      await kv.set(`metrics:daily:${dateKey}`, data);
      return true;
    }
  } catch (e) {
    console.warn('KV set metrics error:', e.message);
  }
  // Fallback memoria
  metricsMemory.daily[dateKey] = data;
  return false;
}

async function incrementMetric(type) {
  try {
    const key = getDateKey(0);
    const daily = await getDailyMetrics(key);
    daily.events = daily.events || {};
    daily.events[type] = (daily.events[type] || 0) + 1;
    await saveDailyMetrics(key, daily);
  } catch (e) {
    console.warn('incrementMetric error:', e.message);
  }
}

// POST /api/metrics/event  Body: { type, label?, metadata? }
app.post('/api/metrics/event', express.json(), async (req, res) => {
  try {
    const { type, label } = req.body || {};
    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'type requerido' });
    }
    const dateKey = getDateKey(0);
    const daily = await getDailyMetrics(dateKey);
    if (type === 'page_view') {
      // Totales
      daily.visits = (daily.visits || 0) + 1;
      // Uniques por IP (hash)
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0];
      const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
      try {
        if (kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
          const keyIps = `metrics:ips:${dateKey}`;
          const arr = (await kv.get(keyIps)) || [];
          if (!arr.includes(ipHash)) {
            arr.push(ipHash);
            daily.uniques = (daily.uniques || 0) + 1;
            await kv.set(keyIps, arr);
          }
        } else {
          // memoria fallback
          metricsMemory[`ips:${dateKey}`] = metricsMemory[`ips:${dateKey}`] || new Set();
          if (!metricsMemory[`ips:${dateKey}`].has(ipHash)) {
            metricsMemory[`ips:${dateKey}`].add(ipHash);
            daily.uniques = (daily.uniques || 0) + 1;
          }
        }
      } catch (e) {
        // continuar aunque falle
      }
      // País por IP
      try {
        const country = await geolocateCountry(ip);
        if (country) {
          daily.countries = daily.countries || {};
          daily.countries[country] = (daily.countries[country] || 0) + 1;
        }
      } catch (_) {}
    } else {
      daily.events = daily.events || {};
      daily.events[type] = (daily.events[type] || 0) + 1;
      // Contadores específicos
      if (type === 'photo_view' && label) {
        daily.photoViews = daily.photoViews || {};
        daily.photoViews[label] = (daily.photoViews[label] || 0) + 1;
      }
      if ((type === 'link_click' || type === 'external_click') && label) {
        daily.linkClicks = daily.linkClicks || {};
        daily.linkClicks[label] = (daily.linkClicks[label] || 0) + 1;
      }
    }
    await saveDailyMetrics(dateKey, daily);
    res.json({ success: true });
  } catch (e) {
    console.error('POST /api/metrics/event error:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/metrics/summary?days=7
app.get('/api/metrics/summary', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const labels = [];
    const visits = [];
    const uniques = [];
    const countriesAgg = {};
    const photoViewsAgg = {};
    const linkClicksAgg = {};
    const eventsTotals = {}; // por tipo
    const seriesByType = {}; // opcional por día
    for (let i = days - 1; i >= 0; i--) {
      const key = getDateKey(i);
      const daily = await getDailyMetrics(key);
      labels.push(key);
      visits.push(daily.visits || 0);
      uniques.push(daily.uniques || 0);
      // Acumulados
      const cc = daily.countries || {};
      for (const c of Object.keys(cc)) countriesAgg[c] = (countriesAgg[c] || 0) + (cc[c] || 0);
      const pv = daily.photoViews || {};
      for (const k of Object.keys(pv)) photoViewsAgg[k] = (photoViewsAgg[k] || 0) + (pv[k] || 0);
      const lc = daily.linkClicks || {};
      for (const k of Object.keys(lc)) linkClicksAgg[k] = (linkClicksAgg[k] || 0) + (lc[k] || 0);
      const ev = daily.events || {};
      for (const t of Object.keys(ev)) {
        eventsTotals[t] = (eventsTotals[t] || 0) + (ev[t] || 0);
        if (!seriesByType[t]) seriesByType[t] = [];
      }
    }
    // Reconstruir series por tipo en el mismo orden de labels
    for (const t of Object.keys(seriesByType)) {
      seriesByType[t] = [];
      for (let i = days - 1; i >= 0; i--) {
        const key = getDateKey(i);
        const daily = await getDailyMetrics(key);
        seriesByType[t].push((daily.events && daily.events[t]) || 0);
      }
    }
    // Top 5
    const topArray = (obj) => Object.entries(obj || {}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>({ key:k, count:v }));
    res.json({ labels, visits, uniques, eventsTotals, seriesByType, topCountries: topArray(countriesAgg), topPhotos: topArray(photoViewsAgg), linkClicks: linkClicksAgg });
  } catch (e) {
    console.error('GET /api/metrics/summary error:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Admin JSON dashboard (protegido por sesión a través del middleware global)
app.get('/admin/metrics-data', async (req, res) => {
  try {
    if (!req.session || !req.session.authenticated) return res.status(401).json({ error: 'No autenticado' });
    // Generar el mismo JSON que /api/metrics/summary sin hacer fetch a localhost
    const days = 30;
    const labels = [];
    const visits = [];
    const uniques = [];
    const countriesAgg = {};
    const photoViewsAgg = {};
    const linkClicksAgg = {};
    const eventsTotals = {};
    const seriesByType = {};
    for (let i = days - 1; i >= 0; i--) {
      const key = getDateKey(i);
      const daily = await getDailyMetrics(key);
      labels.push(key);
      visits.push(daily.visits || 0);
      uniques.push(daily.uniques || 0);
      const cc = daily.countries || {};
      for (const c of Object.keys(cc)) countriesAgg[c] = (countriesAgg[c] || 0) + (cc[c] || 0);
      const pv = daily.photoViews || {};
      for (const k of Object.keys(pv)) photoViewsAgg[k] = (photoViewsAgg[k] || 0) + (pv[k] || 0);
      const lc = daily.linkClicks || {};
      for (const k of Object.keys(lc)) linkClicksAgg[k] = (linkClicksAgg[k] || 0) + (lc[k] || 0);
      const ev = daily.events || {};
      for (const t of Object.keys(ev)) {
        eventsTotals[t] = (eventsTotals[t] || 0) + (ev[t] || 0);
        if (!seriesByType[t]) seriesByType[t] = [];
      }
    }
    for (const t of Object.keys(seriesByType)) {
      seriesByType[t] = [];
      for (let i = days - 1; i >= 0; i--) {
        const key = getDateKey(i);
        const daily = await getDailyMetrics(key);
        seriesByType[t].push((daily.events && daily.events[t]) || 0);
      }
    }
    const topArray = (obj) => Object.entries(obj || {}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>({ key:k, count:v }));
    res.json({ labels, visits, uniques, eventsTotals, seriesByType, topCountries: topArray(countriesAgg), topPhotos: topArray(photoViewsAgg), linkClicks: linkClicksAgg });
  } catch (e) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Helper: geolocate country by IP with caching (KV)
async function geolocateCountry(ip) {
  try {
    if (!ip) return null;
    const key = `geo:${ip}`;
    if (kv && typeof kv.get === 'function') {
      const cached = await kv.get(key);
      if (cached) return cached;
    }
    // Use ipapi.co (no key) as simple source
    const url = `https://ipapi.co/${encodeURIComponent(ip)}/country_name/`;
    const r = await fetch(url, { headers: { 'accept': 'text/plain' }, cache: 'no-store' });
    const txt = await r.text();
    const country = (txt || '').trim() || null;
    if (country && kv && typeof kv.set === 'function') await kv.set(key, country);
    return country;
  } catch (_) { return null; }
}

// 📥 Página de login
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login - Portfolio de Moda</title>
        <link rel="stylesheet" href="/css/style.css">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: 'Inter', sans-serif;
          }
          .login-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
          }
          .login-container h1 {
            font-family: 'Playfair Display', serif;
            color: #1a1a1a;
            margin-bottom: 30px;
            font-size: 2rem;
          }
          .login-container input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            margin-bottom: 20px;
            transition: border-color 0.3s ease;
          }
          .login-container input:focus {
            outline: none;
            border-color: #d4af37;
          }
          .login-container button {
            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
          }
          .login-container button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
          }
          .public-link {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
          }
          .public-link a {
            color: #d4af37;
            text-decoration: none;
            font-weight: 500;
          }
          .public-link a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h1>LUZ</h1>
          <p style="color: #666; margin-bottom: 30px;">Portfolio de Moda</p>
          <form method="POST" action="/login${req.query.next ? ('?next='+encodeURIComponent(req.query.next)) : ''}">
            <input type="password" name="password" placeholder="Clave de acceso" required>
            <button type="submit">Entrar</button>
          </form>
          <div class="public-link">
            <p>¿Solo quieres ver la galería?</p>
            <a href="/gallery">Ver galería pública</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ✅ Validación de contraseña segura
app.post('/login', loginLimiter, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const password = req.body.password;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const rid = req._rid || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0];
    if (process.env.DEBUG_LOGS === '1') {
      const maskedInput = typeof password === 'string' ? '*'.repeat(Math.min(password.length, 8)) : '[none]';
      const hasEnv = Boolean(adminPassword);
      const isHashed = hasEnv && (adminPassword.startsWith('$2b$') || adminPassword.startsWith('$2a$'));
      console.log(`[RID ${rid}] LOGIN attempt ip=${ip} hasADMIN_PASSWORD=${hasEnv} hashed=${isHashed} inputLen=${password ? password.length : 0} inputPreview=${maskedInput}`);
    }

    if (!password || !adminPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Comparar contraseña de forma segura
    let isValidPassword = false;
    // Si ADMIN_PASSWORD viene hasheado, comparar con bcrypt
    if (adminPassword && (adminPassword.startsWith('$2b$') || adminPassword.startsWith('$2a$'))) {
      isValidPassword = await bcrypt.compare(password, adminPassword);
    } else {
      // Texto plano (entornos sin hash)
      isValidPassword = password === adminPassword;
    }

    if (isValidPassword) { // Autenticado
      // Regenerar primero para evitar fijación de sesión y conservar los datos nuevos
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
        }
        // Marcar la nueva sesión como autenticada y guardar
        req.session.authenticated = true;
        if (process.env.DEBUG_LOGS === '1') {
          console.log(`[RID ${rid}] LOGIN success ip=${ip}`);
        }
        const nextUrl = (req.query && req.query.next) ? String(req.query.next) : '/admin';
        res.redirect(nextUrl);
      });
    } else {
      if (process.env.DEBUG_LOGS === '1') {
        console.warn(`[RID ${rid}] LOGIN failed ip=${ip} reason=Invalid password`);
      }
      throw new Error('Invalid password');
    }
  } catch (error) {
    if (process.env.DEBUG_LOGS === '1') {
      console.error('Login error:', error.message);
    }
    res.send(`
      <html>
        <head>
          <title>Error - Portfolio de Moda</title>
          <link rel="stylesheet" href="/css/style.css">
          <style>
            body {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: 'Inter', sans-serif;
            }
            .error-container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
              width: 90%;
            }
            .error-container h2 {
              color: #dc3545;
              margin-bottom: 20px;
            }
            .error-container a {
              background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h2>Clave incorrecta</h2>
            <p>La contraseña ingresada no es válida.</p>
            <a href="/login">Volver al login</a>
          </div>
        </body>
      </html>
    `);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.clearCookie('connect.sid'); // Limpiar cookie de sesión
    res.redirect('/');
  });
});

// 🏥 Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 📸 Página principal (ahora pública)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 🔧 Página de administración (solo para usuarios logueados)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Dashboard de métricas (HTML) - protegido por sesión
app.get('/admin/metrics', (req, res) => {
  if (!req.session || !req.session.authenticated) return res.redirect('/login?next=/admin/metrics');
  res.sendFile(path.join(__dirname, 'views', 'admin-metrics.html'));
});

// 🖼️ Página pública de galería (accesible sin login)
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gallery-public.html'));
});

// 🖼️ Página pública para un álbum específico por slug
app.get('/album/:slug', (req, res) => {
  // Reutilizamos la misma vista pública y el JS filtrará por slug
  res.sendFile(path.join(__dirname, 'views', 'gallery-public.html'));
});

// 📁 Servir archivos de upload
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const rid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0];
  if (process.env.DEBUG_LOGS === '1') console.log(`[GET /uploads ${rid}] ip=${ip} filename=${filename}`);

  if (process.env.VERCEL === '1') {
    // En Vercel: servir desde /tmp (filesystem efímero)
    const filePath = path.join('/tmp', filename);
    if (fs.existsSync(filePath)) {
      if (process.env.DEBUG_LOGS === '1') console.log(`[GET /uploads ${rid}] FOUND ${filePath}`);
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      return fs.createReadStream(filePath).pipe(res);
    }
    if (process.env.DEBUG_LOGS === '1') console.log(`[GET /uploads ${rid}] NOT_FOUND ${filePath}`);
    return res.status(404).json({ error: 'Archivo no encontrado' });
  } else {
    // En local: servir desde public/uploads
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
      // Determinar el tipo MIME basado en la extensión
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Servir el archivo
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } else {
      // Fallback: si piden la imagen por defecto del hero y no existe en /tmp,
      // devolver un PNG transparente de 1x1 para evitar romper la UI pública.
      if (filename === 'luz-hero.jpg' || filename === 'luz-hero.png') {
        const transparent1x1Png = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMB9pA1trEAAAAASUVORK5CYII=',
          'base64'
        );
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', transparent1x1Png.length);
        return res.send(transparent1x1Png);
      }
      res.status(404).json({ error: 'Archivo no encontrado' });
    }
  }
});

// 📤 Subida de fotos (solo para usuarios logueados) - Soporte múltiple
app.post('/upload', (req, res) => {
  const rid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0];
  console.log(`[POST /upload ${rid}] START ip=${ip}`);
  upload.array('photo', parseInt(process.env.MAX_FILES) || 15)(req, res, async (err) => {
    // Manejar errores de multer/validación
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'Archivo demasiado grande. Tamaño máximo: 5MB por imagen',
          code: 'FILE_TOO_LARGE'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          error: 'Demasiados archivos. Máximo: 10 imágenes simultáneas',
          code: 'TOO_MANY_FILES'
        });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ 
          error: err.message,
          code: 'INVALID_FILE_TYPE'
        });
      }
      console.error('Error de upload:', err);
      return res.status(500).json({ 
        error: 'Error en la subida de archivos',
        code: 'UPLOAD_ERROR'
      });
    }
    
    // Validar que se subieron archivos
    if (!req.files || req.files.length === 0) {
      console.warn(`[POST /upload ${rid}] NO_FILES`);
      return res.status(400).json({ 
        error: 'No se subió ningún archivo',
        code: 'NO_FILES'
      });
    }
    
    const uploadedFiles = [];
    
    try {
      // Asegurar que existe el directorio de uploads
      const uploadsDir = ensureUploadsDirectory();
      
      // Procesar cada archivo subido
      console.log(`[POST /upload ${rid}] FILES=${req.files.length} -> ${req.files.map(f=>f.originalname).join(', ')}`);
      const newImagesForKv = [];
      for (const [index, file] of req.files.entries()) {
        const originalName = file.originalname;
        const extension = path.extname(originalName).toLowerCase();
        const newFileName = Date.now() + '_' + index + extension;
        
        // Determinar si estamos en Vercel
        const isVercel = process.env.VERCEL === '1';
        
        if (isVercel) {
          // En Vercel: subir a Blob para persistencia y obtener URL pública
          try {
            if (!blobPut) throw new Error('Blob library not available');
            const buffer = fs.readFileSync(file.path);
            const { url } = await blobPut(`uploads/${newFileName}`, buffer, {
              access: 'public',
              contentType: file.mimetype || 'application/octet-stream',
              addRandomSuffix: false
            });
            // Limpiar temp
            try { fs.unlinkSync(file.path); } catch (_) {}
            const meta = {
              originalName: originalName,
              filename: newFileName,
              size: file.size,
              sizeFormatted: formatFileSize(file.size),
              url,
              uploadedAt: new Date().toISOString()
            };
            uploadedFiles.push(meta);
            newImagesForKv.push({ filename: newFileName, url, uploadedAt: meta.uploadedAt });
          } catch (e) {
            console.error(`[POST /upload ${rid}] BLOB_ERROR:`, e.message);
          }
        } else {
          // En local: mover a public/uploads
          const newPath = path.join(uploadsDir, newFileName);
          fs.renameSync(file.path, newPath);
          
          uploadedFiles.push({
            originalName: originalName,
            filename: newFileName,
            size: file.size,
            sizeFormatted: formatFileSize(file.size)
          });
        }
      }
      // Persistir listado en KV (solo Vercel)
      try {
        const isVercel = process.env.VERCEL === '1';
        if (isVercel && newImagesForKv.length && kv && typeof kv.get === 'function' && typeof kv.set === 'function') {
          const existing = (await kv.get('images')) || [];
          const merged = existing.concat(newImagesForKv);
          await kv.set('images', merged);
          console.log(`[POST /upload ${rid}] KV images += ${newImagesForKv.length} (total ${merged.length})`);
        }
      } catch (kvErr) {
        console.error(`[POST /upload ${rid}] KV_SET_ERROR:`, kvErr.message);
      }
      
      const message = req.files.length === 1 
        ? 'Foto subida exitosamente' 
        : `${req.files.length} fotos subidas exitosamente`;
      
      console.log(`[POST /upload ${rid}] OK count=${req.files.length}`);
      res.json({ 
        success: true, 
        files: uploadedFiles,
        count: req.files.length,
        message: message
      });
      
    } catch (error) {
      console.error(`[POST /upload ${rid}] PROCESSING_ERROR`, error);
      res.status(500).json({ 
        error: 'Error procesando los archivos',
        code: 'PROCESSING_ERROR'
      });
    }
  });
});

// 📏 Función auxiliar para formatear tamaños de archivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 🖼️ API para obtener lista de imágenes (pública)
app.get('/api/images', async (req, res) => {
  try {
    const isVercel = process.env.VERCEL === '1';
    let uploadsDir, files;
    
    if (isVercel) {
      // En Vercel: devolver desde KV (persistencia Blob)
      const list = (kv && typeof kv.get === 'function') ? (await kv.get('images')) || [] : [];

      let images = list.map((it) => ({
        filename: it.filename,
        url: it.url,
        title: `Foto ${it.filename?.split?.('.')?.[0] || ''}`,
        description: 'Capturado con estilo',
        uploadedAt: it.uploadedAt || new Date().toISOString()
      })).sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));

      // Fallback 1: si KV está vacío, listar directo desde Blob
      if ((!images || images.length === 0) && typeof blobList === 'function') {
        try {
          const { blobs } = await blobList({ prefix: 'uploads/' });
          images = (blobs || []).map((b) => ({
            filename: (b?.pathname || '').split('/').pop(),
            url: b?.url,
            title: `Foto ${(b?.pathname || '').split('/').pop()?.split('.')?.[0] || ''}`,
            description: 'Capturado con estilo',
            uploadedAt: b?.uploadedAt || new Date().toISOString()
          })).sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));
        } catch (e) {
          console.error('Blob list fallback error:', e.message);
        }
      }

      // Fallback 2: si hay registros en KV sin url, completar desde Blob y opcionalmente persistir
      const needUrl = (images || []).filter(img => !img.url && img.filename);
      if (needUrl.length > 0 && typeof blobList === 'function') {
        try {
          const { blobs } = await blobList({ prefix: 'uploads/' });
          const byFilename = new Map((blobs || []).map(b => [String(b.pathname || '').split('/').pop(), b.url]));
          let updated = false;
          images = images.map(img => {
            if (!img.url && img.filename && byFilename.has(img.filename)) {
              updated = true;
              return { ...img, url: byFilename.get(img.filename) };
            }
            return img;
          });
          // Persistir de vuelta en KV para futuras respuestas (best-effort)
          if (updated && kv && typeof kv.set === 'function') {
            try {
              const kvPayload = (await kv.get('images')) || [];
              const map = new Map(kvPayload.map(it => [it.filename, it]));
              images.forEach(img => {
                const entry = map.get(img.filename) || { filename: img.filename };
                if (!entry.url && img.url) entry.url = img.url;
                if (!entry.uploadedAt && img.uploadedAt) entry.uploadedAt = img.uploadedAt;
                map.set(img.filename, entry);
              });
              await kv.set('images', Array.from(map.values()));
            } catch (persistErr) {
              console.warn('KV persist fallback skipped:', persistErr.message);
            }
          }
        } catch (e) {
          console.error('Blob lookup to complete missing URLs failed:', e.message);
        }
      }

      // Filtrar imágenes marcadas para eliminación
      try {
        const deletedImages = await getDeletedImages();
        if (Array.isArray(deletedImages) && deletedImages.length > 0) {
          images = images.filter(img => !deletedImages.includes(img.filename));
        }
      } catch (_) {}

      return res.json(images || []);
    } else {
      // En local: leer desde public/uploads
      uploadsDir = path.join(__dirname, 'public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ images: [] });
      }
      files = fs.readdirSync(uploadsDir);
    }
    
    // Cargar lista de imágenes marcadas para eliminación
    const deletedImages = await getDeletedImages();
    
    if (isVercel) {
      console.log(`📋 Imágenes marcadas para eliminación en Vercel KV: ${deletedImages.length}`);
    }
    
    const images = files
      .filter(file => {
        // Excluir imágenes marcadas para eliminación
        if (deletedImages.includes(file)) {
          console.log(`🚫 Excluyendo imagen marcada para eliminación: ${file}`);
          return false;
        }
        
        // Verificar si es un archivo de imagen válido
        const ext = path.extname(file).toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        // Si tiene extensión válida, incluirlo
        if (validExtensions.includes(ext)) {
          return true;
        }
        
        // Si no tiene extensión, verificar si es una imagen por contenido
        try {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          
          // Solo verificar archivos que no sean directorios y tengan tamaño > 0
          if (stats.isFile() && stats.size > 0) {
            // Verificar si el archivo comienza con bytes de imagen
            const buffer = fs.readFileSync(filePath, { start: 0, end: 8 });
            const isImage = buffer.length >= 8 && (
              // PNG signature: 89 50 4E 47 0D 0A 1A 0A
              (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) ||
              // JPEG signature: FF D8 FF
              (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) ||
              // GIF signature: 47 49 46 38 (GIF8)
              (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38)
            );
            return isImage;
          }
        } catch (error) {
          console.log(`⚠️ Error verificando archivo ${file}:`, error.message);
        }
        
        return false;
      })
      .map(file => ({
        filename: file,
        title: `Foto ${file.split('.')[0]}`,
        description: 'Capturado con estilo',
        uploadedAt: fs.statSync(path.join(uploadsDir, file)).mtime
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    res.json(images);
  } catch (error) {
    console.error('Error leyendo directorio de uploads:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🛠️ Admin: Reparar URLs públicas en KV si quedaron obsoletas (evita 403 desde Blob)
// Requiere sesión iniciada. Uso recomendado: POST /api/images/repair-urls
// Opcional: ?dryRun=1 para no persistir, solo reportar cambios
app.post('/api/images/repair-urls', express.json(), async (req, res) => {
  try {
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    if (!isVercel) {
      return res.status(400).json({ error: 'Solo necesario en producción' });
    }
    if (!kv || typeof kv.get !== 'function' || typeof kv.set !== 'function') {
      return res.status(500).json({ error: 'KV no disponible' });
    }
    if (typeof blobList !== 'function') {
      return res.status(500).json({ error: 'Vercel Blob no disponible' });
    }

    const dryRun = String(req.query.dryRun || (req.body && req.body.dryRun) || '') === '1';
    const current = (await kv.get('images')) || [];
    const { blobs } = await blobList({ prefix: 'uploads/' });
    const byFilename = new Map((blobs || []).map(b => [String(b.pathname || '').split('/').pop(), b.url]));

    let updates = 0;
    let missing = 0;
    const repaired = (current || []).map((it) => {
      if (!it || !it.filename) return it;
      const freshUrl = byFilename.get(it.filename);
      if (!freshUrl) { missing++; return it; }
      if (!it.url || it.url !== freshUrl) { updates++; return { ...it, url: freshUrl }; }
      return it;
    });

    if (!dryRun && updates > 0) {
      await kv.set('images', repaired);
    }

    return res.json({ success: true, dryRun, total: current.length, updates, missingInBlob: missing, persisted: !dryRun && updates > 0 });
  } catch (e) {
    console.error('repair-urls error:', e);
    return res.status(500).json({ error: 'Error reparando URLs', details: e.message });
  }
});

// 💾 Hero config en memoria para producción
let heroConfig = {
  heroImage: 'luz-hero.jpg',
  title: 'LUZ',
  subtitle: 'Portfolio de Moda & Fotografía'
};

// 💾 Portadas (cover images) en memoria (fallback para dev/prod si KV no está)
let coverImagesMemory = [];

// 🎯 Helper: obtener URL pública de imagen por filename (Vercel Blob/KV)
async function getPublicUrlForFilename(filename) {
  try {
    if (!filename) return null;
    // 1) Intentar KV
    if (kv && typeof kv.get === 'function') {
      const list = (await kv.get('images')) || [];
      const match = Array.isArray(list) ? list.find(i => i.filename === filename && i.url) : null;
      if (match && match.url) return match.url;
    }
    // 2) Fallback a Blob listing
    if (typeof blobList === 'function') {
      const { blobs } = await blobList({ prefix: 'uploads/' });
      const found = (blobs || []).find(b => String(b.pathname || '').split('/').pop() === filename);
      return found ? found.url : null;
    }
  } catch (e) {
    console.warn('getPublicUrlForFilename error:', e.message);
  }
  return null;
}

// 🎯 Helper: obtener Set de filenames existentes (KV/Blob)
async function getExistingImageFilenamesSet() {
  const names = new Set();
  try {
    if (kv && typeof kv.get === 'function') {
      const list = (await kv.get('images')) || [];
      for (const it of (Array.isArray(list) ? list : [])) {
        if (it && it.filename) names.add(it.filename);
      }
    }
    if (names.size === 0 && typeof blobList === 'function') {
      const { blobs } = await blobList({ prefix: 'uploads/' });
      for (const b of (blobs || [])) {
        const fn = String(b.pathname || '').split('/').pop();
        if (fn) names.add(fn);
      }
    }
  } catch (_) {}
  return names;
}

// 🎯 API para obtener la configuración del hero (pública)
app.get('/api/hero', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const rid = req._rid || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    let config = heroConfig;
    // En desarrollo, intentar archivo local
    if (process.env.NODE_ENV !== 'production') {
      const configPath = path.join(__dirname, 'hero-config.json');
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    }
    // Ya no forzamos fallback automático a primera portada para evitar cambios involuntarios
    // Adjuntar URL pública si existe
    const heroImageUrl = await getPublicUrlForFilename(config.heroImage);
    if (process.env.DEBUG_LOGS === '1') {
      console.log(`[RID ${rid}] GET /api/hero → heroImage=${config.heroImage || ''} url=${heroImageUrl || ''}`);
    }
    res.json({ ...config, heroImageUrl });
  } catch (error) {
    console.error('Error leyendo configuración del hero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🎯 API para establecer la imagen del hero (solo para usuarios logueados)
app.post('/api/hero', express.json(), async (req, res) => {
  try {
    const { heroImage, title, subtitle } = req.body;
    // Permitir limpiar heroImage cuando venga vacío/null
    const clearHero = !heroImage;
    
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    if (!clearHero) {
      if (!isProd) {
        // Desarrollo: validar en filesystem local
        const imagePath = path.join(__dirname, 'public/uploads', heroImage);
        if (!fs.existsSync(imagePath)) {
          return res.status(404).json({ error: 'Imagen no encontrada' });
        }
      } else {
        // Producción (Vercel): intentar validar contra KV/Blob; si no se encuentra, seguimos best-effort
        const publicUrl = await getPublicUrlForFilename(heroImage);
        if (!publicUrl) {
          console.warn(`Hero image '${heroImage}' no encontrada en KV/Blob. Se guarda igualmente (best-effort).`);
        }
      }
    }
    
    const config = {
      heroImage: clearHero ? '' : heroImage,
      title: title || 'LUZ',
      subtitle: subtitle || 'Portfolio de Moda & Fotografía',
      updatedAt: new Date().toISOString()
    };
    
    // Guardar configuración en memoria o archivo
    if (isProd) {
      heroConfig = config; // Guardado en memoria para prod
      console.log('💾 Hero config guardado en memoria:', config);
    } else {
      const configPath = path.join(__dirname, 'hero-config.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('📁 Hero config guardado en archivo:', configPath);
    }
    
    // Adjuntar URL pública si está disponible
    const heroImageUrl = await getPublicUrlForFilename(heroImage);
    
    res.json({ 
      success: true, 
      message: 'Imagen del hero actualizada exitosamente',
      config: { ...config, heroImageUrl }
    });
    
  } catch (error) {
    console.error('Error guardando configuración del hero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ====== Portadas (Cover Images) ======
async function getCoverImagesKV() {
  try {
    if (kv && typeof kv.get === 'function') {
      const list = (await kv.get('coverImages')) || [];
      return Array.isArray(list) ? list : [];
    }
  } catch (e) {
    console.warn('KV get coverImages error:', e.message);
  }
  return null; // indica que no hay KV
}

async function setCoverImagesKV(list) {
  try {
    if (kv && typeof kv.set === 'function') {
      await kv.set('coverImages', Array.isArray(list) ? list : []);
      return true;
    }
  } catch (e) {
    console.warn('KV set coverImages error:', e.message);
  }
  return false;
}

// GET /api/cover - obtener lista de filenames marcados como portada
app.get('/api/cover', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    if (isProd) {
      const kvList = await getCoverImagesKV();
      // Filtrar portadas que ya no existen en Blob/KV para evitar fantasmas
      if (Array.isArray(kvList) && kvList.length) {
        const existing = await getExistingImageFilenamesSet();
        const filtered = kvList.filter(fn => existing.has(fn));
        if (filtered.length !== kvList.length) {
          // Persistir limpieza best-effort
          await setCoverImagesKV(filtered);
        }
        // Adjuntar URLs públicas para evitar 404s de /uploads
        const items = await Promise.all(filtered.map(async (fn) => ({
          filename: fn,
          url: await getPublicUrlForFilename(fn)
        })));
        if (process.env.DEBUG_LOGS === '1') {
          console.log(`[RID ${req._rid}] GET /api/cover → ${items.length} cover(s): ${filtered.join(',')}`);
        }
        return res.json({ coverImages: filtered, items });
      }
      if (kvList) return res.json({ coverImages: kvList, items: [] });
    }
    // Fallback memoria
    const items = await Promise.all((coverImagesMemory || []).map(async (fn) => ({ filename: fn, url: await getPublicUrlForFilename(fn) })));
    return res.json({ coverImages: coverImagesMemory, items });
  } catch (e) {
    console.error('GET /api/cover error:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/cover - marcar/desmarcar portada o reemplazar lista completa
// Body: { filename, marked }  ó  { coverImages: [] }
app.post('/api/cover', express.json(), async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    let current = [];
    if (isProd) {
      const kvList = await getCoverImagesKV();
      current = Array.isArray(kvList) ? kvList : coverImagesMemory;
    } else {
      current = coverImagesMemory;
    }

    if (Array.isArray(req.body?.coverImages)) {
      // Modo portada única: tomar solo el primero si hay varios
      const requested = req.body.coverImages.filter(Boolean).slice(0, 1);
      const existing = await getExistingImageFilenamesSet();
      current = requested.filter(fn => existing.size === 0 || existing.has(fn));
    } else if (req.body && typeof req.body.filename === 'string') {
      const fn = req.body.filename;
      const marked = !!req.body.marked;
      // No permitir portadas de archivos inexistentes
      const existing = await getExistingImageFilenamesSet();
      if (marked && existing.size && !existing.has(fn)) {
        if (process.env.DEBUG_LOGS === '1') console.warn(`[RID ${req._rid}] cover: attempt to mark missing file ${fn}`);
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      const idx = current.indexOf(fn);
      if (marked && idx === -1) current = [fn]; // portada única
      if (!marked && idx !== -1) current.splice(idx, 1);
    } else {
      return res.status(400).json({ error: 'Body inválido' });
    }

    // Persistir según entorno
    if (isProd) {
      const ok = await setCoverImagesKV(current);
      if (!ok) coverImagesMemory = current;
    } else {
      coverImagesMemory = current;
    }

    // Unificación: establecer hero igual a la primera portada si existe
    if (Array.isArray(current) && current.length > 0) {
      heroConfig.heroImage = current[0];
      heroConfig.updatedAt = new Date().toISOString();
    }

    // Sincronizar álbum "Portada" con la(s) imagen(es) de portada
    try {
      const albums = await loadAlbums();
      const portadaIndex = albums.findIndex(a => (
        (a.slug || '').toLowerCase() === 'portada' ||
        (a.name || '').toLowerCase() === 'portada'
      ));
      if (portadaIndex !== -1) {
        albums[portadaIndex].images = Array.isArray(current) ? [...current] : [];
        albums[portadaIndex].updatedAt = new Date().toISOString();
        await saveAlbums(albums);
      }
    } catch (syncErr) {
      console.warn('No se pudo sincronizar álbum Portada:', syncErr.message);
    }

    if (process.env.DEBUG_LOGS === '1') console.log(`[RID ${req._rid}] POST /api/cover saved -> ${current.join(',')}`);
    res.json({ success: true, coverImages: current });
  } catch (e) {
    console.error('POST /api/cover error:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ API para eliminar imágenes (solo para usuarios logueados)
app.delete('/api/images/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    console.log(`🗑️ Intentando eliminar: ${filename}`);
    console.log(`📁 Ruta del archivo: ${filePath}`);
    
    if (isVercel) {
      console.log(`⚠️ En Vercel: No se puede eliminar archivo físico ${filename}`);
      console.log(`📝 Marcando imagen para eliminación en Vercel KV y opcionalmente borrando del Blob`);

      // Marcar en KV
      const deletedImages = await addDeletedImage(filename);
      console.log(`📋 Total de imágenes marcadas: ${deletedImages.length}`);

      // Intentar eliminación en Blob si está disponible (best-effort)
      try {
        if (blobDel && typeof blobDel === 'function') {
          await blobDel(`uploads/${filename}`);
          console.log(`🗑️ Eliminada en Blob: uploads/${filename}`);
        }
      } catch (blobErr) {
        console.warn(`Blob delete error for ${filename}:`, blobErr.message);
      }
    } else {
      // Entorno local: eliminar archivo físico
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Archivo no encontrado: ${filePath}`);
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      // Verificar permisos de escritura (solo en desarrollo)
      try {
        fs.accessSync(filePath, fs.constants.W_OK);
      } catch (permissionError) {
        console.error(`❌ Error de permisos para ${filename}:`, permissionError.message);
        return res.status(403).json({ error: 'No tienes permisos para eliminar este archivo' });
      }
      
      // Eliminar el archivo físico (solo en desarrollo)
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Archivo eliminado exitosamente: ${filename}`);
      } catch (unlinkError) {
        console.error(`❌ Error eliminando archivo ${filename}:`, unlinkError.message);
        return res.status(500).json({ error: 'Error al eliminar el archivo físico' });
      }
    }
    
    // Limpiar referencias de la imagen en todos los álbumes
    try {
      const albums = loadAlbums();
      let albumsModified = false;
      
      albums.forEach(album => {
        if (album.images && album.images.includes(filename)) {
          const imageIndex = album.images.indexOf(filename);
          if (imageIndex > -1) {
            album.images.splice(imageIndex, 1);
            album.updatedAt = new Date().toISOString();
            albumsModified = true;
          }
        }
      });
      
      // Guardar álbumes solo si se modificaron
      if (albumsModified) {
        saveAlbums(albums);
        console.log(`Imagen ${filename} eliminada de todos los álbumes`);
      }
    } catch (albumError) {
      console.error('Error limpiando referencias en álbumes:', albumError);
      // No fallar la eliminación de la imagen por esto
    }
    
    res.json({ 
      success: true, 
      message: isVercel ? 'Foto eliminada (Blob/KV)' : 'Foto eliminada exitosamente',
      filename: filename,
      albumsUpdated: true,
      isVercel: isVercel
    });
    
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📋 API para obtener lista de imágenes marcadas para eliminación (solo admin)
app.get('/api/deleted-images', async (req, res) => {
  try {
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    if (!isVercel) {
      return res.json({ deletedImages: [], message: 'Solo disponible en Vercel' });
    }
    
    // En Vercel, usar Vercel KV para persistencia
    const deletedImages = await getDeletedImages();
    
    res.json({ 
      deletedImages,
      count: deletedImages.length,
      message: 'Lista de imágenes marcadas para eliminación en Vercel KV (persistente)'
    });
    
  } catch (error) {
    console.error('Error obteniendo imágenes eliminadas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📚 API para álbumes (solo para usuarios logueados)

// Función para obtener la ruta del archivo de álbumes
function getAlbumsFilePath() {
  return path.join(__dirname, 'albums.json');
}

// 💾 Almacenamiento en memoria para producción (fallback)
let albumsData = [];
let albumsInitialized = false;

// Utilidades de slug para álbumes
function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function buildUniqueSlug(existing, baseSlug, currentId) {
  let slug = baseSlug || 'album';
  const set = new Set((existing || []).filter(Boolean).map(a => a.slug).filter(Boolean));
  if (!set.has(slug)) return slug;
  let i = 2;
  while (set.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

// Cargar álbumes (KV en Vercel; archivo en dev; memoria como fallback)
async function loadAlbums() {
  try {
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    if (isVercel) {
      if (kv && typeof kv.get === 'function') {
        let albums = await kv.get('albums');
        if (!Array.isArray(albums)) {
          // Inicializar estructura por defecto
          albums = [
            {
              id: Date.now().toString(),
              name: 'Portfolio Principal',
              description: 'Mejores trabajos de moda y fotografía',
              campaign: 'Colección 2025',
              images: [],
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          if (typeof kv.set === 'function') {
            await kv.set('albums', albums);
          }
          console.log('✨ Álbumes inicializados en KV (producción)');
        }
        // Migración ligera: asegurar campos slug/coverImage/featured
        let migrated = false;
        const seen = new Set();
        albums = albums.map((a) => {
          const copy = { ...a };
          if (!copy.slug) {
            copy.slug = slugify(copy.name || 'album');
            migrated = true;
          }
          if (seen.has(copy.slug)) { // colisión
            copy.slug = buildUniqueSlug(albums, copy.slug, copy.id);
            migrated = true;
          }
          seen.add(copy.slug);
          if (copy.featured === undefined) { copy.featured = false; migrated = true; }
          if (copy.coverImage === undefined) { copy.coverImage = ''; migrated = true; }
          return copy;
        });
        if (migrated && typeof kv.set === 'function') {
          await kv.set('albums', albums);
        }
        return albums;
      }
      // Fallback en Vercel sin KV: usar memoria del proceso (no persistente)
      if (!albumsInitialized) {
        albumsData = [];
        albumsInitialized = true;
        console.log('⚠️ KV no disponible: usando memoria como fallback para álbumes');
      }
      // Migración para memoria
      albumsData = (albumsData || []).map((a) => ({
        ...a,
        slug: a.slug || slugify(a.name || 'album'),
        featured: a.featured === undefined ? false : a.featured,
        coverImage: a.coverImage === undefined ? '' : a.coverImage,
      }));
      return [...albumsData];
    }

    // Desarrollo: archivo local
    const albumsPath = getAlbumsFilePath();
    if (fs.existsSync(albumsPath)) {
      const data = JSON.parse(fs.readFileSync(albumsPath, 'utf8'));
      // Migración local
      let migrated = false;
      const seen = new Set();
      const albums = (Array.isArray(data) ? data : []).map((a) => {
        const copy = { ...a };
        if (!copy.slug) { copy.slug = slugify(copy.name || 'album'); migrated = true; }
        if (seen.has(copy.slug)) { copy.slug = buildUniqueSlug(data, copy.slug, copy.id); migrated = true; }
        seen.add(copy.slug);
        if (copy.featured === undefined) { copy.featured = false; migrated = true; }
        if (copy.coverImage === undefined) { copy.coverImage = ''; migrated = true; }
        return copy;
      });
      if (migrated) {
        fs.writeFileSync(albumsPath, JSON.stringify(albums, null, 2));
      }
      return albums;
    }
    return [];
  } catch (error) {
    console.error('Error cargando álbumes:', error);
    // Fallback memoria
    if (process.env.NODE_ENV === 'production') {
      if (!albumsInitialized) {
        albumsData = [];
        albumsInitialized = true;
      }
      return [...albumsData];
    }
    return [];
  }
}

// Guardar álbumes (KV en Vercel; archivo en dev; memoria como fallback)
async function saveAlbums(albums) {
  try {
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    if (isVercel) {
      if (kv && typeof kv.set === 'function') {
        await kv.set('albums', albums);
        console.log(`💾 Álbumes guardados en KV: ${albums.length} álbumes`);
        return;
      }
      // Fallback en Vercel sin KV: memoria del proceso (no persistente)
      albumsData = [...albums];
      albumsInitialized = true;
      console.log(`💾 Álbumes guardados en memoria (fallback, prod): ${albums.length}`);
      return;
    }
    // Desarrollo: archivo local
    const albumsPath = getAlbumsFilePath();
    fs.writeFileSync(albumsPath, JSON.stringify(albums, null, 2));
    console.log(`📁 Álbumes guardados en archivo: ${albumsPath}`);
  } catch (error) {
    console.error('Error guardando álbumes:', error);
    // Fallback memoria en producción
    if (process.env.NODE_ENV === 'production') {
      albumsData = [...albums];
      console.log(`💾 Álbumes guardados en memoria (fallback): ${albums.length}`);
      return;
    }
    throw error;
  }
}

// GET /api/albums - Obtener todos los álbumes
app.get('/api/albums', async (req, res) => {
  try {
    const albums = await loadAlbums();
    // Ordenar álbumes por el campo order
    albums.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(albums);
  } catch (error) {
    console.error('Error obteniendo álbumes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/albums/slug/:slug - obtener álbum por slug
app.get('/api/albums/slug/:slug', async (req, res) => {
  try {
    const albums = await loadAlbums();
    const slug = String(req.params.slug || '').toLowerCase();
    const album = albums.find(a => (a.slug || '').toLowerCase() === slug);
    if (!album) return res.status(404).json({ error: 'Álbum no encontrado' });
    return res.json(album);
  } catch (e) {
    console.error('Error obteniendo álbum por slug:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/albums - Crear nuevo álbum
app.post('/api/albums', express.json(), async (req, res) => {
  try {
    const { name, description, campaign, coverImage, featured } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del álbum es requerido' });
    }
    
    const albums = await loadAlbums();
    
    // Generar ID único
    const newId = Date.now().toString();
    
    // generar slug único
    const baseSlug = slugify(name);
    const slug = buildUniqueSlug(albums, baseSlug);

    const newAlbum = {
      id: newId,
      name: name.trim(),
      description: description ? description.trim() : '',
      campaign: campaign ? campaign.trim() : '',
      images: [],
      order: albums.length, // Agregar al final por defecto
      slug,
      coverImage: coverImage || '',
      featured: !!featured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    albums.push(newAlbum);
    await saveAlbums(albums);
    
    res.status(201).json(newAlbum);
    
  } catch (error) {
    console.error('Error creando álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta explícita para reordenar definida ANTES de rutas :id para evitar conflictos
app.put('/api/albums/reorder', express.json(), async (req, res) => {
  try {
    let { albumsOrder } = req.body || {};
    if (!Array.isArray(albumsOrder)) {
      if (Array.isArray(req.body)) {
        albumsOrder = req.body;
      } else if (req.body && Array.isArray(req.body.order)) {
        albumsOrder = req.body.order;
      } else if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          if (Array.isArray(parsed)) albumsOrder = parsed;
          if (!Array.isArray(albumsOrder) && parsed && Array.isArray(parsed.albumsOrder)) albumsOrder = parsed.albumsOrder;
          if (!Array.isArray(albumsOrder) && parsed && Array.isArray(parsed.order)) albumsOrder = parsed.order;
        } catch (_) {}
      } else if (req.body && typeof req.body === 'object') {
        const vals = Object.values(req.body);
        if (vals.length && vals.every(v => typeof v === 'string')) {
          albumsOrder = vals;
        }
      }
    }
    if (!Array.isArray(albumsOrder)) {
      const q = (req.query && (req.query.order || req.query.albumsOrder));
      if (typeof q === 'string') {
        albumsOrder = q.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(albumsOrder)) {
      if (process.env.DEBUG_LOGS === '1') return res.status(400).json({ error: 'Se requiere un array de IDs de álbumes', debug: { bodyType: typeof req.body, body: req.body, query: req.query } });
      return res.status(400).json({ error: 'Se requiere un array de IDs de álbumes' });
    }

    const albums = await loadAlbums();
    albumsOrder.forEach((albumId, index) => {
      const albumIndex = albums.findIndex(album => album.id === albumId);
      if (albumIndex !== -1) {
        albums[albumIndex].order = index;
        albums[albumIndex].updatedAt = new Date().toISOString();
      }
    });
    albums.sort((a, b) => (a.order || 0) - (b.order || 0));
    await saveAlbums(albums);
    res.json({ success: true, message: 'Orden de álbumes actualizado exitosamente', albums });
  } catch (error) {
    console.error('Error reordenando álbumes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/albums/:id - Actualizar álbum
app.put('/api/albums/:id', express.json(), async (req, res) => {
  try {
    const albumId = req.params.id;
    const { name, description, campaign, coverImage, featured, slug: desiredSlug } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del álbum es requerido' });
    }
    
    const albums = await loadAlbums();
    const albumIndex = albums.findIndex(album => album.id === albumId);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    const album = { ...albums[albumIndex] };
    album.name = name.trim();
    album.description = description ? description.trim() : '';
    album.campaign = campaign ? campaign.trim() : '';
    album.coverImage = coverImage !== undefined ? coverImage : (album.coverImage || '');
    album.featured = featured !== undefined ? !!featured : !!album.featured;
    // si se pide cambiar slug, validar unicidad
    if (desiredSlug && desiredSlug !== album.slug) {
      const base = slugify(desiredSlug);
      album.slug = buildUniqueSlug(albums.filter(a=>a.id!==albumId), base);
    }
    album.updatedAt = new Date().toISOString();
    albums[albumIndex] = album;
    
    await saveAlbums(albums);
    
    res.json(albums[albumIndex]);
    
  } catch (error) {
    console.error('Error actualizando álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/albums/:id - Eliminar álbum
app.delete('/api/albums/:id', async (req, res) => {
  try {
    const albumId = req.params.id;
    const albums = await loadAlbums();
    const albumIndex = albums.findIndex(album => album.id === albumId);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    albums.splice(albumIndex, 1);
    await saveAlbums(albums);
    
    res.json({ 
      success: true, 
      message: 'Álbum eliminado exitosamente',
      albumId: albumId
    });
    
  } catch (error) {
    console.error('Error eliminando álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/albums/:id/images - Agregar imagen a álbum
app.post('/api/albums/:id/images', express.json(), async (req, res) => {
  try {
    const albumId = req.params.id;
    const { imageId } = req.body;
    
    if (!imageId) {
      return res.status(400).json({ error: 'Se requiere el ID de la imagen' });
    }
    
    // En Vercel no verificamos FS local; en dev sí
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    if (!isVercel) {
      const imagePath = path.join(__dirname, 'public/uploads', imageId);
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
    }
    
    const albums = await loadAlbums();
    const albumIndex = albums.findIndex(album => album.id === albumId);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    // Verificar que la imagen no esté ya en el álbum
    if (albums[albumIndex].images.includes(imageId)) {
      return res.status(400).json({ error: 'La imagen ya está en este álbum' });
    }
    
    albums[albumIndex].images.push(imageId);
    albums[albumIndex].updatedAt = new Date().toISOString();
    
    await saveAlbums(albums);
    
    res.json({
      success: true,
      message: 'Imagen agregada al álbum exitosamente',
      album: albums[albumIndex]
    });
    
  } catch (error) {
    console.error('Error agregando imagen al álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/albums/:id/images/:imageId - Remover imagen de álbum
app.delete('/api/albums/:id/images/:imageId', async (req, res) => {
  try {
    const albumId = req.params.id;
    const imageId = req.params.imageId;
    
    const albums = await loadAlbums();
    const albumIndex = albums.findIndex(album => album.id === albumId);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    const imageIndex = albums[albumIndex].images.indexOf(imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagen no encontrada en el álbum' });
    }
    
    albums[albumIndex].images.splice(imageIndex, 1);
    albums[albumIndex].updatedAt = new Date().toISOString();
    
    await saveAlbums(albums);
    
    res.json({
      success: true,
      message: 'Imagen removida del álbum exitosamente',
      album: albums[albumIndex]
    });
    
  } catch (error) {
    console.error('Error removiendo imagen del álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/albums/reorder - Reordenar álbumes
app.put('/api/albums/reorder', express.json(), async (req, res) => {
  try {
    let { albumsOrder } = req.body || {};
    // Tolerancia a distintos payloads o parsers
    if (!Array.isArray(albumsOrder)) {
      if (Array.isArray(req.body)) {
        albumsOrder = req.body;
      } else if (req.body && Array.isArray(req.body.order)) {
        albumsOrder = req.body.order;
      } else if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          if (Array.isArray(parsed)) albumsOrder = parsed;
          if (!Array.isArray(albumsOrder) && parsed && Array.isArray(parsed.albumsOrder)) albumsOrder = parsed.albumsOrder;
          if (!Array.isArray(albumsOrder) && parsed && Array.isArray(parsed.order)) albumsOrder = parsed.order;
        } catch (_) {}
      } else if (req.body && typeof req.body === 'object') {
        // Posibles formatos form-urlencoded ({"0":"idA","1":"idB"})
        const vals = Object.values(req.body);
        if (vals.length && vals.every(v => typeof v === 'string')) {
          albumsOrder = vals;
        }
      }
    }
    // Querystring como último recurso: ?order=idA,idB
    if (!Array.isArray(albumsOrder)) {
      const q = (req.query && (req.query.order || req.query.albumsOrder));
      if (typeof q === 'string') {
        albumsOrder = q.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    if (!Array.isArray(albumsOrder)) {
      if (process.env.DEBUG_LOGS === '1') {
        return res.status(400).json({ error: 'Se requiere un array de IDs de álbumes', debug: { bodyType: typeof req.body, body: req.body, query: req.query } });
      }
      return res.status(400).json({ error: 'Se requiere un array de IDs de álbumes' });
    }
    
    const albums = await loadAlbums();
    
    // Actualizar el order de cada álbum según la nueva posición
    albumsOrder.forEach((albumId, index) => {
      const albumIndex = albums.findIndex(album => album.id === albumId);
      if (albumIndex !== -1) {
        albums[albumIndex].order = index;
        albums[albumIndex].updatedAt = new Date().toISOString();
      }
    });
    
    // Ordenar álbumes por el campo order
    albums.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    await saveAlbums(albums);
    
    res.json({
      success: true,
      message: 'Orden de álbumes actualizado exitosamente',
      albums: albums
    });
    
  } catch (error) {
    console.error('Error reordenando álbumes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/gallery/order - Reordenar imágenes de la galería
app.put('/api/gallery/order', galleryLimiter, express.json(), (req, res) => {
  try {
    const { imageOrder } = req.body;
    
    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({ error: 'Se requiere un array de orden de imágenes' });
    }
    
    // Cargar imágenes existentes
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    const imageFiles = fs.readdirSync(uploadsDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(filename => ({ filename }));
    
    // Crear mapa de archivos para validación
    const fileMap = new Map(imageFiles.map(img => [img.filename, img]));
    
    // Validar que todas las imágenes en el orden existen
    const validOrder = imageOrder.filter(item => {
      if (!fileMap.has(item.filename)) {
        console.warn(`Imagen no encontrada: ${item.filename}`);
        return false;
      }
      return true;
    });
    
    if (validOrder.length === 0) {
      return res.status(400).json({ error: 'No se encontraron imágenes válidas para reordenar' });
    }
    
    // Guardar el nuevo orden en un archivo de configuración
    const orderConfigPath = path.join(__dirname, 'data', 'gallery-order.json');
    const orderData = {
      order: validOrder,
      updatedAt: new Date().toISOString()
    };
    
    // Crear directorio data si no existe
    const dataDir = path.dirname(orderConfigPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(orderConfigPath, JSON.stringify(orderData, null, 2));
    
    console.log(`Orden de galería actualizado: ${validOrder.length} imágenes`);
    
    res.json({
      success: true,
      message: 'Orden de galería actualizado exitosamente',
      order: validOrder,
      updatedAt: orderData.updatedAt
    });
    
  } catch (error) {
    console.error('Error reordenando galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/gallery/order - Obtener orden actual de la galería
app.get('/api/gallery/order', galleryLimiter, (req, res) => {
  try {
    const orderConfigPath = path.join(__dirname, 'data', 'gallery-order.json');
    
    if (!fs.existsSync(orderConfigPath)) {
      return res.json({
        order: [],
        updatedAt: null
      });
    }
    
    const orderData = JSON.parse(fs.readFileSync(orderConfigPath, 'utf8'));
    
    res.json({
      order: orderData.order || [],
      updatedAt: orderData.updatedAt || null
    });
    
  } catch (error) {
    console.error('Error obteniendo orden de galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🚀 Iniciar el servidor
// 🚨 Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  // métrica de error API
  incrementMetric('api_error').catch(()=>{});
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Archivo demasiado grande',
      code: 'FILE_TOO_LARGE'
    });
  }
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    code: 'SERVER_ERROR'
  });
});

// 🌐 Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
  console.log('📸 Portfolio de moda listo para exhibir fotos de modelo');
  console.log(`🌐 Galería pública disponible en http://localhost:${PORT}/gallery`);
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Límites: ${process.env.MAX_FILE_SIZE ? formatFileSize(parseInt(process.env.MAX_FILE_SIZE)) : '5MB'} por archivo, ${process.env.MAX_FILES || 10} archivos`);
});
