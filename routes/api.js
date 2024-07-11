const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de autenticación
router.post('/auth/login', userController.login);
router.post('/auth/registro', userController.registro);

// Rutas de usuarios
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);
router.patch('/users/:id/toggle-active', userController.toggleActive);
router.put('/users/:id/change-password', userController.changePassword);

module.exports = router;