const express = require('express');
const router = express.Router();

// Importar controladores
const userController = require('../controllers/userController');
const rolesController = require('../controllers/rolesController');
const especialidadController = require('../controllers/especialidadController');
const citasController = require('../controllers/CitasController');
const consultorioController = require('../controllers/consultorioController'); 
const diagnosticoController = require('../controllers/diagnosticoController');
const historiaController = require('../controllers/historiaController');
const estadisticasController = require('../controllers/estadisticasController');

// Importar middleware de autenticación
const { isAuthenticated } = require('../middleware/authMiddleware');

// Rutas de autenticación y usuario
router.post('/registro', userController.registro);
router.post('/login', userController.login);
router.post('/logout', isAuthenticated, userController.logout);
router.get('/users', isAuthenticated, userController.getAll);
router.get('/users/:id', isAuthenticated, userController.getById);
router.put('/users/:id', isAuthenticated, userController.update);
router.delete('/users/:id', isAuthenticated, userController.delete);
router.post('/users', isAuthenticated, userController.createUser);

// Rutas de roles
router.get('/roles', rolesController.getAllRoles);
router.get('/medicos', rolesController.getMedicos);
router.get('/users-with-roles', isAuthenticated, rolesController.getUsersWithRoles);

// Rutas de especialidades
router.get('/especialidades', especialidadController.getAllEspecialidades);
router.post('/especialidades', isAuthenticated, especialidadController.createEspecialidad);
router.put('/especialidades/:id_especialidad', isAuthenticated, especialidadController.updateEspecialidad);
router.delete('/especialidades/:id_especialidad', isAuthenticated, especialidadController.deleteEspecialidad);
router.get('/especialidades/:id/medicos', especialidadController.getMedicosPorEspecialidad);
router.get('/medicos-por-especialidad/:id_especialidad', especialidadController.getMedicosPorEspecialidad);

// Rutas de citas
router.post('/citas', isAuthenticated, citasController.crearCita);
router.put('/citas/:id', isAuthenticated, citasController.updateCita);
router.delete('/citas/:id', isAuthenticated, citasController.deleteCita);
router.get('/horarios-disponibles', citasController.getHorariosDisponibles);
router.get('/paciente-citas', isAuthenticated, citasController.getPacienteCitas);
router.get('/citas/:id', isAuthenticated, citasController.getCitaById);
router.put('/citas/:id/estado', isAuthenticated, citasController.actualizarEstadoCita);
router.get('/medico-citas', isAuthenticated, citasController.getMedicoCitas);
router.get('/pacientes/buscar', citasController.buscarPacientePorCI);

// Rutas de diagnóstico
router.post('/diagnosticos', isAuthenticated, diagnosticoController.crearDiagnostico);
router.get('/diagnosticos/:id', isAuthenticated, diagnosticoController.getDiagnosticoById);
router.put('/diagnosticos/:id', isAuthenticated, diagnosticoController.updateDiagnostico);
router.delete('/diagnosticos/:id', isAuthenticated, diagnosticoController.deleteDiagnostico);
router.get('/diagnosticos/paciente/:id', diagnosticoController.getPacienteDiagnosticos);
router.get('/medico-diagnosticos', isAuthenticated, diagnosticoController.getMedicoDiagnosticos);
router.get('/paciente-info/:id', isAuthenticated, diagnosticoController.getPacienteInfo);
router.put('/paciente/:id', isAuthenticated, diagnosticoController.actualizarPaciente);
router.get('/enfermedades', isAuthenticated, diagnosticoController.getEnfermedades);

// Nuevas rutas para genero, tipos de sangre y alergias
router.get('/tipos-sangre', isAuthenticated, diagnosticoController.getTiposSangre);
router.get('/tipos-alergia', isAuthenticated, diagnosticoController.getTiposAlergia);
router.get('/generos', isAuthenticated, diagnosticoController.getGeneros);

// Rutas de historia médica
router.get('/paciente/:id_paciente/historia-medica', isAuthenticated, historiaController.obtenerHistoriaMedica);
router.post('/historia-medica', isAuthenticated, historiaController.crearActualizarHistoriaMedica);
router.get('/paciente/:id_paciente/historial', isAuthenticated, historiaController.obtenerHistorialDiagnosticos);
router.get('/paciente/:id_paciente/info', isAuthenticated, historiaController.getInfoCompletaPaciente);

// Rutas de consultorios
router.get('/consultorios', isAuthenticated, consultorioController.getAllConsultorios);
router.get('/consultorios/:id', isAuthenticated, consultorioController.getConsultorioById);
router.post('/consultorios', isAuthenticated, consultorioController.createConsultorio);
router.put('/consultorios/:id', isAuthenticated, consultorioController.updateConsultorio);
router.delete('/consultorios/:id', isAuthenticated, consultorioController.deleteConsultorio);
router.post('/consultorios/:id/asignar', isAuthenticated, consultorioController.asignarMedico);
router.post('/consultorios/:id/liberar', isAuthenticated, consultorioController.liberarConsultorio);

// Rutas de estadísticas
router.get('/api/estadisticas/usuarios', isAuthenticated, estadisticasController.getUsuariosStats);
router.get('/api/estadisticas/citas', isAuthenticated, estadisticasController.getCitasStats);
router.get('/api/estadisticas/especialidades', isAuthenticated, estadisticasController.getEspecialidadesStats);
router.get('/api/estadisticas/dashboard', isAuthenticated, estadisticasController.getDashboardStats);

// Ruta para el dashboard
router.get('/dashboard', isAuthenticated, userController.getDashboardData);

// Ruta para perfil de médico
router.get('/medico/:id', isAuthenticated, userController.getMedicoPerfil);

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
