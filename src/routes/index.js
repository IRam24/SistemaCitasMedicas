const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware para loggear las solicitudes
router.use((req, res, next) => {
    console.log(`Route requested: ${req.url}`);
    next();
});

// Ruta para la página de login
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../login/login.html'));
});

// Ruta para el CSS de login
router.get('/login/login.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../login/login.css'), { 
        headers: { 'Content-Type': 'text/css' } 
    });
});

// Ruta para el JS de login
router.get('/login/login.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../login/login.js'), { 
        headers: { 'Content-Type': 'application/javascript' } 
    });
});

// Ruta para la página de registro
router.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../registro/registro.html'));
});

// Ruta para el CSS de registro
router.get('/registro/registro.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../registro/registro.css'), { 
        headers: { 'Content-Type': 'text/css' } 
    });
});

// Ruta para el JS de registro
router.get('/registro/registro.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../registro/registro.js'), { 
        headers: { 'Content-Type': 'application/javascript' } 
    });
});

// Ruta para servir imágenes
router.get('/images/:imageName', (req, res) => {
    res.sendFile(path.join(__dirname, `../images/${req.params.imageName}`));
});

module.exports = router;
