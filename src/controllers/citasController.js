const pool = require('../config/database');

const citasController = {
    getPacienteCitas: async (req, res) => {
        try {
            const { id_usuario } = req.query; 
            if (!id_usuario) {
                return res.status(400).json({ message: 'Se requiere el ID del usuario' });
            }
    
            const [citas] = await pool.query(`
                SELECT 
                    c.id_cita,
                    c.fecha,
                    c.hora,
                    c.motivo,
                    c.estado,
                    e.nombre,
                    u.nombre AS nombre_medico,
                    u.apellido AS apellido_medico
                FROM citas c
                JOIN pacientes p ON c.id_paciente = p.id_paciente
                JOIN especialidades e ON c.id_especialidad = e.id_especialidad
                JOIN usuario u ON c.id_medico = u.id_usuario
                WHERE p.id_usuario = ?
                ORDER BY c.fecha DESC, c.hora DESC
            `, [id_usuario]);
    
            if (citas.length === 0) {
                return res.status(404).json({ message: 'No se encontraron citas para este usuario' });
            }
    
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener citas del paciente:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getHorariosDisponibles: async (req, res) => {
        try {
            const { id_medico, fecha } = req.query;
            
            if (!id_medico || !fecha) {
                return res.status(400).json({ message: 'Se requiere id_medico y fecha' });
            }

            const horariosDisponibles = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
                '16:00', '16:30', '17:00', '17:30'
            ];
            
            const [citasOcupadas] = await pool.query(
                'SELECT hora FROM citas WHERE id_medico = ? AND fecha = ?',
                [id_medico, fecha]
            );
            
            const horariosOcupados = citasOcupadas.map(cita => cita.hora.slice(0, 5));
            const horariosDisponiblesFiltrados = horariosDisponibles.filter(
                horario => !horariosOcupados.includes(horario)
            );
            
            res.json(horariosDisponiblesFiltrados);
        } catch (error) {
            console.error('Error al obtener horarios disponibles:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    crearCita: async (req, res) => {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
    
            const { id_paciente, id_usuario, id_especialidad, id_medico, fecha, hora, motivo } = req.body;
            console.log('Datos de la cita recibidos:', { id_paciente, id_usuario, id_especialidad, id_medico, fecha, hora, motivo });
    
            // Validación de datos
            if ((!id_paciente && !id_usuario) || !id_especialidad || !id_medico || !fecha || !hora || !motivo) {
                throw new Error('Faltan datos requeridos para la cita');
            }
    
            let paciente_id;
    
            if (id_paciente) {
                // Si se proporciona id_paciente, verificamos que exista
                const [pacienteExiste] = await connection.query(
                    'SELECT id_paciente FROM pacientes WHERE id_paciente = ?',
                    [id_paciente]
                );
                if (pacienteExiste.length === 0) {
                    throw new Error('No se encontró un paciente con el ID proporcionado');
                }
                paciente_id = id_paciente;
            } else if (id_usuario) {
                // Si se proporciona id_usuario, buscamos el id_paciente correspondiente
                const [pacientes] = await connection.query(
                    'SELECT id_paciente FROM pacientes WHERE id_usuario = ?',
                    [id_usuario]
                );
                console.log('Resultado de la búsqueda de paciente:', pacientes);
    
                if (pacientes.length === 0) {
                    throw new Error('No se encontró un paciente para este usuario');
                }
                paciente_id = pacientes[0].id_paciente;
            } else {
                throw new Error('Se requiere id_paciente o id_usuario');
            }
    
            console.log('ID de paciente a utilizar:', paciente_id);
    
            // Verificar disponibilidad de la cita
            const [citasExistentes] = await connection.query(
                'SELECT id_cita FROM citas WHERE id_medico = ? AND fecha = ? AND hora = ?',
                [id_medico, fecha, hora]
            );
            console.log('Citas existentes:', citasExistentes);
    
            if (citasExistentes.length > 0) {
                throw new Error('La hora seleccionada ya no está disponible');
            }
    
            // Insertar la nueva cita
            const [result] = await connection.query(
                'INSERT INTO citas (id_paciente, id_medico, id_especialidad, fecha, hora, motivo, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [paciente_id, id_medico, id_especialidad, fecha, hora, motivo, 'programada']
            );
            console.log('Resultado de la inserción:', result);
    
            // Verificar que la cita se insertó correctamente
            const [citaInsertada] = await connection.query(
                'SELECT * FROM citas WHERE id_cita = ?',
                [result.insertId]
            );
    
            await connection.commit();
            res.status(201).json({ success: true, message: 'Cita creada con éxito', id: result.insertId });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error detallado al crear la cita:', error);
    
            // Manejar diferentes tipos de errores
            if (error.message.includes('Faltan datos requeridos') || error.message.includes('Se requiere id_paciente o id_usuario')) {
                res.status(400).json({ success: false, message: error.message });
            } else if (error.message.includes('No se encontró un paciente')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error.message.includes('La hora seleccionada ya no está disponible')) {
                res.status(409).json({ success: false, message: error.message });
            } else {
                res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
            }
        } finally {
            if (connection) connection.release();
        }
    },
    
    getCitaById: async (req, res) => {
        try {
            const { id } = req.params;
            const [citas] = await pool.query(`
                SELECT c.*, 
                       u.nombre, u.apellido, u.ci, u.phone, u.email, u.direccion, u.fechanacimiento,
                       e.nombre,
                       um.nombre AS nombre_medico, um.apellido AS apellido_medico
                FROM citas c
                JOIN pacientes p ON c.id_paciente = p.id_paciente
                JOIN usuario u ON p.id_usuario = u.id_usuario
                JOIN especialidades e ON c.id_especialidad = e.id_especialidad
                JOIN usuario um ON c.id_medico = um.id_usuario
                WHERE c.id_cita = ?
            `, [id]);

            if (citas.length === 0) {
                return res.status(404).json({ message: 'Cita no encontrada' });
            }

            res.json(citas[0]);
        } catch (error) {
            console.error('Error al obtener la cita:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    updateCita: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const { id_cita, fecha, hora, motivo } = req.body;
            
            const [result] = await connection.query(
                'UPDATE citas SET fecha = ?, hora = ?, motivo = ? WHERE id_cita = ?',
                [fecha, hora, motivo, id_cita]
            );
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Cita no encontrada' });
            }
            
            await connection.commit();
            res.json({ success: true, message: 'Cita actualizada con éxito' });
        } catch (error) {
            await connection.rollback();
            console.error('Error al actualizar la cita:', error);
            res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
        } finally {
            connection.release();
        }
    },

    deleteCita: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const { id } = req.params;
            
            const [result] = await connection.query('DELETE FROM citas WHERE id_cita = ?', [id]);
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Cita no encontrada' });
            }
            
            await connection.commit();
            res.json({ success: true, message: 'Cita eliminada con éxito' });
        } catch (error) {
            await connection.rollback();
            console.error('Error al eliminar la cita:', error);
            res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
        } finally {
            connection.release();
        }
    },

    getMedicoCitas: async (req, res) => {
        try {
            if (!req.session || !req.session.user || req.session.user.rol !== 'medico') {
                return res.status(401).json({ message: 'No autorizado o no es un médico' });
            }
    
            const id_medico = req.session.user.id_usuario;
            const { estado } = req.query;
    
            let query = `
                SELECT 
                c.id_cita, c.fecha, c.hora, c.motivo, c.estado,
                up.nombre AS nombre_paciente, up.apellido AS apellido_paciente,
                e.nombre,
                um.nombre AS nombre_medico, um.apellido AS apellido_medico
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id_paciente
            JOIN usuario up ON p.id_usuario = up.id_usuario
            JOIN medicos m ON c.id_medico = m.id_usuario
            JOIN usuario um ON m.id_usuario = um.id_usuario
            JOIN especialidades e ON m.id_especialidad = e.id_especialidad
            WHERE c.id_medico = ?
            `;
    
            const queryParams = [id_medico];
    
            if (estado) {
                query += ' AND c.estado = ?';
                queryParams.push(estado);
            }
    
            query += ' ORDER BY c.fecha ASC, c.hora ASC';
    
            const [citas] = await pool.query(query, queryParams);
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener citas del médico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    actualizarEstadoCita: async (req, res) => {
        try {
            const { id } = req.params; // Cambiado de id_cita a id para coincidir con la ruta
            const { estado } = req.body;
            const id_medico = req.session.user.id_usuario;
    
            if (estado !== 'Completada' && estado !== 'Cancelada') {
                return res.status(400).json({ message: 'Estado no válido' });
            }
    
            const [result] = await pool.query(
                'UPDATE citas SET estado = ? WHERE id_cita = ? AND id_medico = ?',
                [estado, id, id_medico]
            );
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Cita no encontrada o no autorizada para actualizar' });
            }
    
            res.json({ message: 'Estado de la cita actualizado con éxito' });
        } catch (error) {
            console.error('Error al actualizar estado de la cita:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },
    

    getHistorialMedico: async (req, res) => {
        try {
            const { id_paciente } = req.params;
            const [historial] = await pool.query(`
                SELECT c.fecha, c.hora, c.motivo, 
                       e.nombre,
                       um.nombre AS nombre_medico, um.apellido AS apellido_medico
                FROM citas c
                JOIN especialidades e ON c.id_especialidad = e.id_especialidad
                JOIN usuario um ON c.id_medico = um.id_usuario
                WHERE c.id_paciente = ?
                ORDER BY c.fecha DESC, c.hora DESC
            `, [id_paciente]);

            res.json(historial);
        } catch (error) {
            console.error('Error al obtener historial médico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    buscarPacientePorCI: async (req, res) => {
        try {
            const { ci } = req.query;
            if (!ci) {
                return res.status(400).json({ message: 'Se requiere el CI del paciente' });
            }
    
            const [pacientes] = await pool.query(`
                SELECT p.id_paciente, u.id_usuario, u.nombre, u.apellido, u.ci, u.fechanacimiento
                FROM pacientes p
                JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE u.ci = ?
            `, [ci]);
    
            if (pacientes.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
    
            console.log('Paciente encontrado:', pacientes[0]); // Para depuración
    
            res.json(pacientes[0]);
        } catch (error) {
            console.error('Error al buscar paciente por CI:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

};

module.exports = citasController;