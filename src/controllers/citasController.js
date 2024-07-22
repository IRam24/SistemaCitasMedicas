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
                    e.detalle_especialidad,
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
    
            const { id_usuario, id_especialidad, id_medico, fecha, hora, motivo } = req.body;
            console.log('Datos de la cita recibidos:', { id_usuario, id_especialidad, id_medico, fecha, hora, motivo });
    
            // Validación de datos
            if (!id_usuario || !id_especialidad || !id_medico || !fecha || !hora || !motivo) {
                throw new Error('Faltan datos requeridos para la cita');
            }
            if (id_usuario === 'null') {
                throw new Error('ID de usuario no válido');
            }
    
            // Obtener el id_paciente
            const [pacientes] = await connection.query(
                'SELECT id_paciente FROM pacientes WHERE id_usuario = ?',
                [id_usuario]
            );
            console.log('Resultado de la búsqueda de paciente:', pacientes);
    
            if (pacientes.length === 0) {
                throw new Error('No se encontró un paciente para este usuario');
            }
    
            const id_paciente = pacientes[0].id_paciente;
            console.log('ID de paciente encontrado:', id_paciente);
    
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
                [id_paciente, id_medico, id_especialidad, fecha, hora, motivo, 'programada']
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
            if (error.message.includes('Faltan datos requeridos') || error.message.includes('ID de usuario no válido')) {
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
        console.log('Tipo de id_usuario recibido:', typeof req.body.id_usuario);
        console.log('Valor de id_usuario recibido:', req.body.id_usuario);
    },
    
    getAllEspecialidades: async (req, res) => {
        try {
            const [especialidades] = await pool.query('SELECT id_especialidad, nombre FROM especialidades');
            res.json(especialidades);
        } catch (error) {
            console.error('Error al obtener especialidades:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getMedicosPorEspecialidad: async (req, res) => {
        try {
            const { id_especialidad } = req.params;
            const [medicos] = await pool.query(`
                SELECT u.id_usuario, u.nombre, u.apellido
                FROM usuario u
                JOIN medicos m ON u.id_usuario = m.id_usuario
                WHERE m.id_especialidad = ?
            `, [id_especialidad]);
            res.json(medicos);
        } catch (error) {
            console.error('Error al obtener médicos por especialidad:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getCitaById: async (req, res) => {
        try {
            const { id } = req.params;
            const [cita] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [id]);
            if (cita.length === 0) {
                return res.status(404).json({ message: 'Cita no encontrada' });
            }
            res.json(cita[0]);
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
    }
};

module.exports = citasController;