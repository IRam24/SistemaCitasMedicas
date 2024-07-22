const pool = require('../config/database');

const consultorioController = {
    // Obtener todos los consultorios
    getAllConsultorios: async function(req, res) {
        try {
            const [consultorios] = await pool.query(`
                SELECT c.*, u.nombre AS nombre_medico, u.apellido AS apellido_medico
                FROM consultorios c
                LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
            `);
            res.status(200).json(consultorios);
        } catch (err) {
            console.error('Error al obtener consultorios:', err);
            res.status(500).json({ message: 'Error al obtener consultorios', error: err.message });
        }
    },

    // Obtener un consultorio por ID
    getConsultorioById: async function(req, res) {
        const id = req.params.id;
        try {
            const [consultorios] = await pool.query('SELECT * FROM consultorios WHERE id_consultorio = ?', [id]);
            if (consultorios.length === 0) {
                return res.status(404).json({ message: 'Consultorio no encontrado' });
            }
            res.status(200).json(consultorios[0]);
        } catch (err) {
            console.error('Error al obtener el consultorio:', err);
            res.status(500).json({ message: 'Error al obtener el consultorio', error: err.message });
        }
    },

    createConsultorio: async function(req, res) {
        const { codigo, descripcion } = req.body;
        try {
            const [existingConsultorio] = await pool.query('SELECT id_consultorio FROM consultorios WHERE codigo = ?', [codigo]);
            if (existingConsultorio.length > 0) {
                return res.status(400).json({ success: false, message: 'El código del consultorio ya existe' });
            }

            const [result] = await pool.query(
                'INSERT INTO consultorios (codigo, descripcion, estado) VALUES (?, ?, "disponible")',
                [codigo, descripcion]
            );
            res.status(201).json({ 
                success: true, 
                id_consultorio: result.insertId, 
                message: 'Consultorio creado con éxito' 
            });
        } catch (err) {
            console.error('Error al crear consultorio:', err);
            res.status(500).json({ success: false, message: 'Error al crear consultorio', error: err.message });
        }
    },

    updateConsultorio: async function(req, res) {
        const id = req.params.id;
        const { codigo, descripcion } = req.body;
        try {
            const [result] = await pool.query(
                'UPDATE consultorios SET codigo = ?, descripcion = ? WHERE id_consultorio = ?',
                [codigo, descripcion, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Consultorio no encontrado' });
            }
            res.status(200).json({ success: true, message: 'Consultorio actualizado con éxito' });
        } catch (err) {
            console.error('Error al actualizar consultorio:', err);
            res.status(400).json({ success: false, message: 'Error al actualizar consultorio', error: err.message });
        }
    },

    asignarMedico: async function(req, res) {
        const id = req.params.id;
        const { id_usuario, fecha_asignacion } = req.body;
        try {
            const [result] = await pool.query(
                'UPDATE consultorios SET id_usuario = ?, fecha_asignacion = ?, estado = "no disponible" WHERE id_consultorio = ?',
                [id_usuario, fecha_asignacion, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Consultorio no encontrado' });
            }
            res.status(200).json({ success: true, message: 'Médico asignado con éxito' });
        } catch (err) {
            console.error('Error al asignar médico:', err);
            res.status(400).json({ success: false, message: 'Error al asignar médico', error: err.message });
        }
    },

    // Eliminar un consultorio
    deleteConsultorio: async function(req, res) {
        const id = req.params.id;
        try {
            const [result] = await pool.query('DELETE FROM consultorios WHERE id_consultorio = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Consultorio no encontrado' });
            }
            res.status(200).json({ success: true, message: 'Consultorio eliminado con éxito' });
        } catch (err) {
            console.error('Error al eliminar consultorio:', err);
            res.status(500).json({ success: false, message: 'Error al eliminar consultorio', error: err.message });
        }
    },

    liberarConsultorio: async function(req, res) {
        const id = req.params.id;
        try {
            const [result] = await pool.query(
                'UPDATE consultorios SET estado = "disponible", id_usuario = NULL, fecha_asignacion = NULL WHERE id_consultorio = ?',
                [id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Consultorio no encontrado' });
            }
            res.status(200).json({ success: true, message: 'Consultorio liberado con éxito' });
        } catch (err) {
            console.error('Error al liberar consultorio:', err);
            res.status(500).json({ success: false, message: 'Error al liberar consultorio', error: err.message });
        }
    }    
};

module.exports = consultorioController;