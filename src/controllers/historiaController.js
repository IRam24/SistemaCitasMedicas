const pool = require('../config/database');

const historiaController = {
    obtenerHistoriaMedica: async (req, res) => {
        try {
            const { id_paciente } = req.params;
            const [historia] = await pool.query(
                'SELECT * FROM historia_medica WHERE id_paciente = ? ORDER BY id_historia DESC LIMIT 1',
                [id_paciente]
            );

            if (historia.length === 0) {
                return res.status(404).json({ message: 'Historia médica no encontrada' });
            }

            res.json(historia[0]);
        } catch (error) {
            console.error('Error al obtener historia médica:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    crearActualizarHistoriaMedica: async (req, res) => {
        try {
            const { id_historia, id_paciente, tipo_sangre, alergias, cirugias } = req.body;
            
            let result;
            if (id_historia) {
                // Actualizar historia existente
                [result] = await pool.query(
                    'UPDATE historia_medica SET tipo_sangre = ?, alergias = ?, cirugias = ? WHERE id_historia = ?',
                    [tipo_sangre, alergias, cirugias, id_historia]
                );
            } else {
                // Crear nueva historia
                [result] = await pool.query(
                    'INSERT INTO historia_medica (id_paciente, tipo_sangre, alergias, cirugias) VALUES (?, ?, ?, ?)',
                    [id_paciente, tipo_sangre, alergias, cirugias]
                );
            }

            res.status(201).json({
                message: id_historia ? 'Historia médica actualizada con éxito' : 'Historia médica creada con éxito',
                id: id_historia || result.insertId
            });
        } catch (error) {
            console.error('Error al crear/actualizar historia médica:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    obtenerHistorialDiagnosticos: async (req, res) => {
        try {
            const { id_paciente } = req.params;
            const [historial] = await pool.query(`
                SELECT d.id_diagnostico, d.fecha_diagnostico, d.peso, d.talla, d.edad, 
                       d.sintomas, d.diagnostico, e.nombre as nombre_enfermedad, d.receta
                FROM diagnosticos d
                JOIN enfermedades e ON d.id_enfermedad = e.id_enfermedad
                JOIN citas c ON d.id_cita = c.id_cita
                WHERE c.id_paciente = ?
                ORDER BY d.fecha_diagnostico DESC
            `, [id_paciente]);

            res.json(historial);
        } catch (error) {
            console.error('Error al obtener el historial de diagnósticos:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getInfoCompletaPaciente: async (req, res) => {
        try {
            const { id_paciente } = req.params;
            const [paciente] = await pool.query(`
                SELECT p.id_paciente, u.nombre, u.apellido, u.fecha_nacimiento, 
                       u.genero, u.telefono, u.email, u.direccion
                FROM pacientes p 
                JOIN usuario u ON p.id_usuario = u.id_usuario 
                WHERE p.id_paciente = ?
            `, [id_paciente]);

            if (paciente.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }

            res.json(paciente[0]);
        } catch (error) {
            console.error('Error al obtener información completa del paciente:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
};

module.exports = historiaController;