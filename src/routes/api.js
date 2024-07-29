const express = require('express');
const router = express.Router();

// Importar controladores
const userController = require('../controllers/userController');
const rolesController = require('../controllers/rolesController');
const especialidadController = require('../controllers/especialidadController');
const citasController = require('../controllers/citasController');
const consultorioController = require('../controllers/consultorioController'); 
const diagnosticoController = require('../controllers/diagnosticoController');

// Importar middleware de autenticación
const { isAuthenticated } = require('../middleware/authMiddleware');

// Rutas de autenticación y usuario
router.post('/registro', userController.registro);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/users', isAuthenticated, userController.getAll);
router.get('/users/:id', isAuthenticated, userController.getById);
router.put('/users/:id', isAuthenticated, userController.update);
router.delete('/users/:id', isAuthenticated, userController.delete);
router.post('/users', userController.createUser);

// Ruta pública para obtener todos los roles (útil para el formulario de registro)
router.get('/roles', rolesController.getAllRoles);
router.get('/medicos', rolesController.getMedicos);
// Ruta protegida para ver usuarios con roles
router.get('/users-with-roles', isAuthenticated, rolesController.getUsersWithRoles);

// Rutas de especialidades
router.get('/especialidades', especialidadController.getAllEspecialidades);
router.post('/especialidades', isAuthenticated, especialidadController.createEspecialidad);
router.put('/especialidades/:id_especialidad', isAuthenticated, especialidadController.updateEspecialidad);
router.delete('/especialidades/:id_especialidad', isAuthenticated, especialidadController.deleteEspecialidad);
router.get('/medicos-por-especialidad/:id_especialidad', especialidadController.getMedicosPorEspecialidad);

router.post('/especialidades', especialidadController.createEspecialidad);
router.get('/especialidades/:id/medicos', especialidadController.getMedicosPorEspecialidad);

// Rutas de citas
router.post('/citas', isAuthenticated, citasController.crearCita);
router.put('/citas/:id', isAuthenticated, citasController.updateCita);
router.delete('/citas/:id', isAuthenticated, citasController.deleteCita);
router.get('/horarios-disponibles', citasController.getHorariosDisponibles);
router.get('/paciente-citas', isAuthenticated, citasController.getPacienteCitas);
router.get('/citas/:id', isAuthenticated, citasController.getCitaById);
router.post('/logout', isAuthenticated, userController.logout);

//rutas de diagnosticos
router.post('/diagnosticos', isAuthenticated, diagnosticoController.crearDiagnostico);
router.put('/citas/:id/cancelar', isAuthenticated, citasController.cancelarCita);

// Ruta para el dashboard
router.get('/dashboard', isAuthenticated, userController.getDashboardData);

// Obtener todos los consultorios
router.get('/consultorios', isAuthenticated, consultorioController.getAllConsultorios);
router.get('/consultorios/:id', isAuthenticated, consultorioController.getConsultorioById);
router.post('/consultorios', isAuthenticated, consultorioController.createConsultorio);
router.put('/consultorios/:id', isAuthenticated, consultorioController.updateConsultorio);
router.delete('/consultorios/:id', isAuthenticated, consultorioController.deleteConsultorio);
router.post('/consultorios/:id/asignar', consultorioController.asignarMedico);
router.post('/consultorios/:id/liberar', consultorioController.liberarConsultorio);

//Ruta para medicos
// Rutas para médicos
router.get('/medico-citas', isAuthenticated, citasController.getMedicoCitas);
router.put('/citas/:id/estado', isAuthenticated, citasController.actualizarEstadoCita);
router.get('/medico/:id', isAuthenticated, userController.getMedicoPerfil);

//rutas a estadisticas
router.get('/diagnosticos-estadisticas', diagnosticoController.getDiagnosticosEstadisticas);

// Ruta para widgets
router.get('/widgets/:role', isAuthenticated, (req, res) => {
    const role = req.params.role;
    res.render(`widgets_${role}`, { layout: false }, (err, html) => {
        if (err) {
            console.error('Error rendering widget:', err);
            res.status(500).json({ error: 'Error rendering widget' });
        } else {
            res.json({ html: html });
        }
    });
});

module.exports = router;
