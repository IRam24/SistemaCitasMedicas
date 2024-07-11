const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Inicializar express
const app = express();

// Inicializar pool de conexiones
const pool = require('./config/database');

// Prueba de conexión a la base de datos
pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos establecida correctamente');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

// Configuración
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging
app.use(cors()); // Habilitar CORS

// Función para servir archivos estáticos con el tipo MIME correcto
const serveStatic = (directory) => {
  return express.static(path.join(__dirname, directory), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) {
        res.set('Content-Type', 'text/css');
      } else if (filePath.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.html')) {
        res.set('Content-Type', 'text/html');
      }
    }
  });
};

// Servir archivos estáticos
app.use('/', serveStatic('.'));
app.use('/login', serveStatic('login'));
app.use('/registro', serveStatic('registro'));
app.use('/menu', serveStatic('menu'));
app.use('/images', serveStatic('images'));

// Configurar Helmet después de servir archivos estáticos
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
    },
  },
}));

// Rutas
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

app.use('/', indexRouter);
app.use('/api', apiRouter);

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`Requested URL: ${req.url}`);
  console.log(`Content-Type: ${res.get('Content-Type')}`);
  next();
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;
