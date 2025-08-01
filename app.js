const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const upload = multer({ dest: 'public/uploads/' });

// 🚨 Acá va la línea para servir CSS, imágenes y otros archivos públicos
app.use(express.static('public'));

// 🛡️ Configuración de sesión
app.use(session({
  secret: '4321', // cambiá esta clave si querés
  resave: false,
  saveUninitialized: true
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

// ✅ Validación de contraseña
app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
  const password = req.body.password;
  if (password === '1234') { // Podés cambiar la clave aquí
    req.session.authenticated = true;
    res.redirect('/admin');
  } else {
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
  req.session.destroy(() => {
    res.redirect('/login');
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

// 📤 Subida de foto (solo para usuarios logueados)
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  // Renombrar el archivo con un nombre más amigable
  const originalName = req.file.originalname;
  const extension = path.extname(originalName);
  const newFileName = Date.now() + extension;
  const newPath = path.join('public/uploads', newFileName);
  
  fs.renameSync(req.file.path, newPath);
  
  res.json({ 
    success: true, 
    filename: newFileName,
    message: 'Foto subida exitosamente' 
  });
});

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

// 🗑️ API para eliminar imágenes (solo para usuarios logueados)
app.delete('/api/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Eliminar el archivo
    fs.unlinkSync(filePath);
    
    res.json({ 
      success: true, 
      message: 'Foto eliminada exitosamente',
      filename: filename
    });
    
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🚀 Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
  console.log('Portfolio de moda listo para exhibir fotos de modelo');
  console.log('Galería pública disponible en http://localhost:3000/gallery');
});
