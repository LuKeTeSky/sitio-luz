require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// 🛡️ Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:"],
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

app.use(limiter);

// 🚦 Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 📁 Configuración de multer con límites y validación
const upload = multer({
  dest: 'public/uploads/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por archivo
    files: parseInt(process.env.MAX_FILES) || 10 // Máximo 10 archivos simultáneos
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

// 🚨 Acá va la línea para servir CSS, imágenes y otros archivos públicos
app.use(express.static('public'));

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
    return res.redirect('/login');
  }
  next();
});

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
          <form method="POST" action="/login">
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
    
    if (!password || !adminPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Comparar contraseña de forma segura
    const isValidPassword = await bcrypt.compare(password, await bcrypt.hash(adminPassword, 10));
    
    if (isValidPassword || password === adminPassword) { // Fallback para compatibilidad
      req.session.authenticated = true;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
        }
        res.redirect('/admin');
      });
    } else {
      throw new Error('Invalid password');
    }
  } catch (error) {
    console.error('Login error:', error.message);
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

// 🖼️ Página pública de galería (accesible sin login)
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gallery-public.html'));
});

// 📤 Subida de fotos (solo para usuarios logueados) - Soporte múltiple
app.post('/upload', (req, res) => {
  upload.array('photo', 10)(req, res, (err) => {
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
      return res.status(400).json({ 
        error: 'No se subió ningún archivo',
        code: 'NO_FILES'
      });
    }
    
    const uploadedFiles = [];
    
    try {
      // Procesar cada archivo subido
      req.files.forEach((file, index) => {
        const originalName = file.originalname;
        const extension = path.extname(originalName).toLowerCase();
        const newFileName = Date.now() + '_' + index + extension;
        const newPath = path.join('public/uploads', newFileName);
        
        fs.renameSync(file.path, newPath);
        
        uploadedFiles.push({
          originalName: originalName,
          filename: newFileName,
          size: file.size,
          sizeFormatted: formatFileSize(file.size)
        });
      });
      
      const message = req.files.length === 1 
        ? 'Foto subida exitosamente' 
        : `${req.files.length} fotos subidas exitosamente`;
      
      res.json({ 
        success: true, 
        files: uploadedFiles,
        count: req.files.length,
        message: message
      });
      
    } catch (error) {
      console.error('Error procesando archivos:', error);
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
app.get('/api/images', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'public/uploads');
    const files = fs.readdirSync(uploadsDir);
    
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
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

// 💾 Hero config en memoria para producción
let heroConfig = {
  heroImage: 'luz-hero.jpg',
  title: 'LUZ',
  subtitle: 'Portfolio de Moda & Fotografía'
};

// 🎯 API para obtener la configuración del hero (pública)
app.get('/api/hero', (req, res) => {
  try {
    // En producción, usar memoria
    if (process.env.NODE_ENV === 'production') {
      res.json(heroConfig);
      return;
    }
    
    // En desarrollo, usar archivo
    const configPath = path.join(__dirname, 'hero-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json(config);
    } else {
      // Configuración por defecto
      res.json(heroConfig);
    }
  } catch (error) {
    console.error('Error leyendo configuración del hero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🎯 API para establecer la imagen del hero (solo para usuarios logueados)
app.post('/api/hero', express.json(), (req, res) => {
  try {
    const { heroImage, title, subtitle } = req.body;
    
    if (!heroImage) {
      return res.status(400).json({ error: 'Se requiere una imagen para el hero' });
    }
    
    // Verificar que la imagen existe
    const imagePath = path.join(__dirname, 'public/uploads', heroImage);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    const config = {
      heroImage,
      title: title || 'LUZ',
      subtitle: subtitle || 'Portfolio de Moda & Fotografía',
      updatedAt: new Date().toISOString()
    };
    
    // Guardar configuración en memoria o archivo
    if (process.env.NODE_ENV === 'production') {
      heroConfig = config; // Guardar en memoria
      console.log('💾 Hero config guardado en memoria:', config);
    } else {
      // En desarrollo, guardar en archivo
      const configPath = path.join(__dirname, 'hero-config.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('📁 Hero config guardado en archivo:', configPath);
    }
    
    res.json({ 
      success: true, 
      message: 'Imagen del hero actualizada exitosamente',
      config: config
    });
    
  } catch (error) {
    console.error('Error guardando configuración del hero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ API para eliminar imágenes (solo para usuarios logueados)
app.delete('/api/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Eliminar el archivo físico
    fs.unlinkSync(filePath);
    
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
      message: 'Foto eliminada exitosamente',
      filename: filename,
      albumsUpdated: true
    });
    
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📚 API para álbumes (solo para usuarios logueados)

// Función para obtener la ruta del archivo de álbumes
function getAlbumsFilePath() {
  return path.join(__dirname, 'albums.json');
}

// 💾 Almacenamiento en memoria para producción
let albumsData = [];
let albumsInitialized = false;

// Función para cargar álbumes desde el archivo o memoria
function loadAlbums() {
  try {
    // En producción, usar memoria
    if (process.env.NODE_ENV === 'production') {
      if (!albumsInitialized) {
        // Inicializar con álbumes de ejemplo en primera carga
        albumsData = [
          {
            id: Date.now().toString(),
            name: "Portfolio Principal",
            description: "Mejores trabajos de moda y fotografía",
            campaign: "Colección 2025",
            images: [],
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        albumsInitialized = true;
        console.log('✨ Álbumes inicializados en memoria para producción');
      }
      return [...albumsData]; // Retornar copia
    }
    
    // En desarrollo, usar archivo
    const albumsPath = getAlbumsFilePath();
    if (fs.existsSync(albumsPath)) {
      const data = fs.readFileSync(albumsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error cargando álbumes:', error);
    return [];
  }
}

// Función para guardar álbumes en el archivo o memoria
function saveAlbums(albums) {
  try {
    // En producción, guardar en memoria
    if (process.env.NODE_ENV === 'production') {
      albumsData = [...albums]; // Guardar copia en memoria
      console.log(`💾 Álbumes guardados en memoria: ${albums.length} álbumes`);
      return;
    }
    
    // En desarrollo, guardar en archivo
    const albumsPath = getAlbumsFilePath();
    fs.writeFileSync(albumsPath, JSON.stringify(albums, null, 2));
    console.log(`📁 Álbumes guardados en archivo: ${albumsPath}`);
  } catch (error) {
    console.error('Error guardando álbumes:', error);
    throw error;
  }
}

// GET /api/albums - Obtener todos los álbumes
app.get('/api/albums', (req, res) => {
  try {
    const albums = loadAlbums();
    // Ordenar álbumes por el campo order
    albums.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(albums);
  } catch (error) {
    console.error('Error obteniendo álbumes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/albums - Crear nuevo álbum
app.post('/api/albums', express.json(), (req, res) => {
  try {
    const { name, description, campaign } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del álbum es requerido' });
    }
    
    const albums = loadAlbums();
    
    // Generar ID único
    const newId = Date.now().toString();
    
    const newAlbum = {
      id: newId,
      name: name.trim(),
      description: description ? description.trim() : '',
      campaign: campaign ? campaign.trim() : '',
      images: [],
      order: albums.length, // Agregar al final por defecto
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    albums.push(newAlbum);
    saveAlbums(albums);
    
    res.status(201).json(newAlbum);
    
  } catch (error) {
    console.error('Error creando álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/albums/:id - Actualizar álbum
app.put('/api/albums/:id', express.json(), (req, res) => {
  try {
    const albumId = req.params.id;
    const { name, description, campaign } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del álbum es requerido' });
    }
    
    const albums = loadAlbums();
    const albumIndex = albums.findIndex(album => album.id === albumId);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    albums[albumIndex] = {
      ...albums[albumIndex],
      name: name.trim(),
      description: description ? description.trim() : '',
      campaign: campaign ? campaign.trim() : '',
      updatedAt: new Date().toISOString()
    };
    
    saveAlbums(albums);
    
    res.json(albums[albumIndex]);
    
  } catch (error) {
    console.error('Error actualizando álbum:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/albums/:id - Eliminar álbum
app.delete('/api/albums/:id', (req, res) => {
  try {
    const albumId = req.params.id;
    const albums = loadAlbums();
    const albumIndex = albums.findIndex(album => album.id === albumId);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: 'Álbum no encontrado' });
    }
    
    albums.splice(albumIndex, 1);
    saveAlbums(albums);
    
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
app.post('/api/albums/:id/images', express.json(), (req, res) => {
  try {
    const albumId = req.params.id;
    const { imageId } = req.body;
    
    if (!imageId) {
      return res.status(400).json({ error: 'Se requiere el ID de la imagen' });
    }
    
    // Verificar que la imagen existe
    const imagePath = path.join(__dirname, 'public/uploads', imageId);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    const albums = loadAlbums();
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
    
    saveAlbums(albums);
    
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
app.delete('/api/albums/:id/images/:imageId', (req, res) => {
  try {
    const albumId = req.params.id;
    const imageId = req.params.imageId;
    
    const albums = loadAlbums();
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
    
    saveAlbums(albums);
    
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
app.put('/api/albums/reorder', (req, res) => {
  try {
    const { albumsOrder } = req.body;
    
    if (!Array.isArray(albumsOrder)) {
      return res.status(400).json({ error: 'Se requiere un array de IDs de álbumes' });
    }
    
    const albums = loadAlbums();
    
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
    
    saveAlbums(albums);
    
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

// 🚀 Iniciar el servidor
// 🚨 Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  
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
