const pool = require('../config/database');

const diagnosticoController = {
    crearDiagnostico: async (req, res) => {
        try {
            const { id_cita, peso, talla, diagnostico, receta, id_enfermedad } = req.body;
            const [result] = await pool.query(
                'INSERT INTO diagnosticos (id_cita, peso, talla, diagnostico, receta, id_enfermedad) VALUES (?, ?, ?, ?, ?, ?)',
                [id_cita, peso, talla, diagnostico, receta, id_enfermedad]
            );
            res.status(201).json({ message: 'Diagnóstico creado con éxito', id: result.insertId });
        } catch (error) {
            console.error('Error al crear diagnóstico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getDiagnosticoById: async (req, res) => {
        try {
            const { id } = req.params;
            const [diagnosticos] = await pool.query('SELECT * FROM diagnosticos WHERE id = ?', [id]);
            if (diagnosticos.length === 0) {
                return res.status(404).json({ message: 'Diagnóstico no encontrado' });
            }
            res.json(diagnosticos[0]);
        } catch (error) {
            console.error('Error al obtener diagnóstico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    updateDiagnostico: async (req, res) => {
        try {
            const { id } = req.params;
            const { peso, talla, diagnostico, receta, id_enfermedad } = req.body;
            const [result] = await pool.query(
                'UPDATE diagnosticos SET peso = ?, talla = ?, diagnostico = ?, receta = ?, id_enfermedad = ? WHERE id = ?',
                [peso, talla, diagnostico, receta, id_enfermedad, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Diagnóstico no encontrado' });
            }
            res.json({ message: 'Diagnóstico actualizado con éxito' });
        } catch (error) {
            console.error('Error al actualizar diagnóstico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    deleteDiagnostico: async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query('DELETE FROM diagnosticos WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Diagnóstico no encontrado' });
            }
            res.json({ message: 'Diagnóstico eliminado con éxito' });
        } catch (error) {
            console.error('Error al eliminar diagnóstico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getPacienteDiagnosticos: async (req, res) => {
        try {
            const { id } = req.params; // Este es el id_paciente

            const [resultados] = await pool.query(`
                SELECT 
                    c.id_cita,
                    c.fecha AS fecha_cita,
                    c.hora,
                    c.motivo,
                    c.estado,
                    d.id_diagnostico,
                    d.peso,
                    d.talla,
                    d.diagnostico,
                    d.receta,
                    d.fecha_creacion AS fecha_diagnostico,
                    e.nombre AS nombre_enfermedad,
                    m.nombre AS nombre_medico,
                    m.apellido AS apellido_medico,
                    esp.nombre AS nombre_especialidad
                FROM citas c
                LEFT JOIN diagnosticos d ON c.id_cita = d.id_cita
                LEFT JOIN enfermedades e ON d.id_enfermedad = e.id_enfermedad
                JOIN usuario m ON c.id_medico = m.id_usuario
                JOIN especialidades esp ON c.id_especialidad = esp.id_especialidad
                WHERE c.id_paciente = ?
                ORDER BY c.fecha DESC, c.hora DESC
            `, [id]);

            if (resultados.length === 0) {
                return res.status(404).json({ message: 'No se encontraron citas o diagnósticos para este paciente' });
            }

            res.json(resultados);
        } catch (error) {
            console.error('Error al obtener citas y diagnósticos del paciente:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getMedicoDiagnosticos: async (req, res) => {
        try {
            const id_medico = req.session.user.id;
            const [diagnosticos] = await pool.query(`
                SELECT d.*, e.nombre AS nombre_enfermedad, u.nombre AS nombre_paciente, u.apellido AS apellido_paciente
                FROM diagnosticos d
                JOIN citas c ON d.id_cita = c.id_cita
                JOIN enfermedades e ON d.id_enfermedad = e.id_enfermedad
                JOIN pacientes p ON c.id_paciente = p.id_paciente
                JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE c.id_medico = ?
                ORDER BY d.fecha_creacion DESC
            `, [id_medico]);
            res.json(diagnosticos);
        } catch (error) {
            console.error('Error al obtener diagnósticos del médico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getPacienteInfo: async (req, res) => {
        try {
            const { id } = req.params; 
            const [pacienteInfo] = await pool.query(`
                SELECT 
                    c.id_cita,
                    c.fecha,
                    c.hora,
                    c.motivo,
                    c.estado,
                    e.nombre AS nombre_especialidad,
                    m.nombre AS nombre_medico,
                    m.apellido AS apellido_medico,
                    p.id_paciente,
                    p.tipo_sangre,
                    p.alergias,
                    p.detalle_alergia,
                    p.genero,
                    u.nombre AS nombre_paciente,
                    u.apellido AS apellido_paciente,
                    u.ci,
                    u.fechanacimiento
                FROM citas c
                JOIN pacientes p ON c.id_paciente = p.id_paciente
                JOIN usuario u ON p.id_usuario = u.id_usuario
                JOIN especialidades e ON c.id_especialidad = e.id_especialidad
                JOIN usuario m ON c.id_medico = m.id_usuario
                WHERE c.id_cita = ?
            `, [id]);

            if (pacienteInfo.length === 0) {
                return res.status(404).json({ message: 'Información de cita y paciente no encontrada' });
            }

            // Calcular la edad
            const fechaNacimiento = new Date(pacienteInfo[0].fechanacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            const m = hoy.getMonth() - fechaNacimiento.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                edad--;
            }

            const resultado = {
                ...pacienteInfo[0],
                edad: edad
            };

            res.json(resultado);
        } catch (error) {
            console.error('Error al obtener información del paciente:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    actualizarPaciente: async (req, res) => {
        try {
            const { id } = req.params;
            const { genero, tipo_sangre, alergias, detalle_alergia } = req.body;

            const [result] = await pool.query(
                'UPDATE pacientes SET genero = ?, tipo_sangre = ?, alergias = ?, detalle_alergia = ? WHERE id_paciente = ?',
                [genero, tipo_sangre, alergias, detalle_alergia, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
            res.json({ message: 'Datos del paciente actualizados con éxito' });
        } catch (error) {
            console.error('Error al actualizar datos del paciente:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getEnfermedades: async (req, res) => {
        try {
            const [enfermedades] = await pool.query('SELECT * FROM enfermedades');
            res.json(enfermedades);
        } catch (error) {
            console.error('Error al obtener enfermedades:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getGeneros: async (req, res) => {
        try {
            const generos = ['Masculino', 'Femenino', 'Otro', 'N/A'];
            res.json(generos);
        } catch (error) {
            console.error('Error al obtener géneros:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },


    getTiposSangre: async (req, res) => {
    try {
        const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        res.json(tiposSangre);
    } catch (error) {
        console.error('Error al obtener tipos de sangre:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
       }
   },

    getTiposAlergia: async (req, res) => {
    try {
        const tiposAlergia = ['Ninguna', 'Medicamentos', 'Alimentos', 'Ambientales', 'Otras', 'N/A'];
        res.json(tiposAlergia);
    } catch (error) {
        console.error('Error al obtener tipos de alergia:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }

};

module.exports = diagnosticoController;