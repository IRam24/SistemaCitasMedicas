const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

// Cargar variables de entorno
dotenv.config();

// Inicializar express
const app = express();

// Configuración de EJS
//app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging
app.use(cors()); // Habilitar CORS

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_secreto_aqui',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/registro', express.static(path.join(__dirname, 'registro')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Configurar Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
    },
  },
}));

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

// Importar rutas
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const Chart = require('chart.js/auto');
if (typeof window !== 'undefined') {
    window.Chart = Chart;
} else {
    global.Chart = Chart;
}

// Usar rutas
app.use('/', indexRouter);
app.use('/api', apiRouter);

// Ruta para el dashboard
app.get('/dashboard/paciente', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'paciente', 'dashboard-paciente.html'));
});

app.get('/dashboard/medico', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'medico', 'dashboard-medico.html'));
});

app.get('/dashboard/administrador', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'administrador', 'dashboard-administrador.html'));
});

// Servir archivos estáticos
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/views/citas', express.static(path.join(__dirname, 'views', 'citas')));
app.use('/views/admin', express.static(path.join(__dirname, 'views', 'admin')));
app.use('/views/medico', express.static(path.join(__dirname, 'views', 'medico')));
// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Algo salió mal!' });
});
app.use((req, res, next) => {
  console.log('Solicitud recibida:', req.method, req.url);
  next();
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;
