// estadisticasController.js
const pool = require('../config/database');

const estadisticasController = {
    getUsuariosStats: async (req, res) => {
        try {
            const [results] = await pool.query(`
                SELECT 
                    CASE 
                        WHEN r.asign_role = 'admin' THEN 'Administrador'
                        WHEN r.asign_role = 'medico' THEN 'Médico'
                        WHEN r.asign_role = 'paciente' THEN 'Paciente'
                        ELSE 'Otro'
                    END AS rol_nombre,
                    COUNT(*) as count
                FROM usuario u
                JOIN roles r ON u.rol = r.id
                GROUP BY r.asign_role
            `);
            res.json(results);
        } catch (error) {
            console.error('Error al obtener estadísticas de usuarios:', error);
            res.status(500).json({ message: 'Error en el servidor al obtener estadísticas de usuarios' });
        }
    },

    getCitasStats: async (req, res) => {
        try {
            const [results] = await pool.query(`
                SELECT 
                    estado,
                    COUNT(*) as count
                FROM citas
                GROUP BY estado
            `);
            res.json(results);
        } catch (error) {
            console.error('Error al obtener estadísticas de citas:', error);
            res.status(500).json({ message: 'Error en el servidor al obtener estadísticas de citas' });
        }
    },

    getEspecialidadesStats: async (req, res) => {
        try {
            const [results] = await pool.query(`
                SELECT 
                    e.nombre,
                    COUNT(m.id_medico) as count
                FROM especialidades e
                LEFT JOIN medicos m ON e.id_especialidad = m.id_especialidad
                GROUP BY e.id_especialidad, e.nombre
                ORDER BY count DESC
            `);
            res.json(results);
        } catch (error) {
            console.error('Error al obtener estadísticas de especialidades:', error);
            res.status(500).json({ message: 'Error en el servidor al obtener estadísticas de especialidades' });
        }
    },

    getDashboardStats: async (req, res) => {
        try {
            const [usuariosStats] = await pool.query(`
                SELECT 
                    CASE 
                        WHEN r.asign_role = 'admin' THEN 'Administrador'
                        WHEN r.asign_role = 'medico' THEN 'Médico'
                        WHEN r.asign_role = 'paciente' THEN 'Paciente'
                        ELSE 'Otro'
                    END AS rol_nombre,
                    COUNT(*) as count
                FROM usuario u
                JOIN roles r ON u.rol = r.id
                GROUP BY r.asign_role
            `);

            const [citasStats] = await pool.query(`
                SELECT 
                    estado,
                    COUNT(*) as count
                FROM citas
                GROUP BY estado
            `);

            const [especialidadesStats] = await pool.query(`
                SELECT 
                    e.nombre,
                    COUNT(m.id_medico) as count
                FROM especialidades e
                LEFT JOIN medicos m ON e.id_especialidad = m.id_especialidad
                GROUP BY e.id_especialidad
            `);

            res.json({
                usuarios: usuariosStats,
                citas: citasStats,
                especialidades: especialidadesStats
            });
        } catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            res.status(500).json({ message: 'Error en el servidor al obtener estadísticas del dashboard' });
        }
    }
};

module.exports = estadisticasController;