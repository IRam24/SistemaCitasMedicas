const pool = require('../config/database');

const diagnosticoController = {
    crearDiagnostico: async (req, res) => {
        try {

            console.log('Cuerpo de la solicitud completo:', req.body);
            const { id_cita, sintomas, diagnostico, tratamiento, observaciones } = req.body;
            
            console.log('Datos recibidos:', { id_cita, sintomas, diagnostico, tratamiento, observaciones });
    
            if (!id_cita || id_cita === 'undefined') {
                return res.status(400).json({ message: 'Falta el id_cita requerido' });
            }
    
            const fecha_diagnostico = new Date().toISOString().split('T')[0];
    
            await pool.query('START TRANSACTION');
    
            try {
                // Verificar que la cita existe
                const [citaExistente] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [id_cita]);
                if (citaExistente.length === 0) {
                    throw new Error('La cita especificada no existe');
                }
    
                // Insertar el diagnóstico
                const [result] = await pool.query(
                    'INSERT INTO diagnosticos (id_cita, fecha_diagnostico, sintomas, diagnostico, tratamiento, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_cita, fecha_diagnostico, sintomas, diagnostico, tratamiento, observaciones]
                );
    
                // Actualizar el estado de la cita
                await pool.query('UPDATE citas SET estado = "completada" WHERE id_cita = ?', [id_cita]);
    
                await pool.query('COMMIT');
                res.status(201).json({ message: 'Diagnóstico creado con éxito', id: result.insertId });
            } catch (error) {
                await pool.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Error al crear diagnóstico:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

    getDiagnosticosEstadisticas: async (req, res) => {
        try {
            const { estado } = req.query;
            let query = `
                SELECT 
                    c.id_cita,
                    c.fecha,
                    c.hora,
                    CONCAT(up.nombre, ' ', up.apellido) AS nombre_paciente,
                    CONCAT(um.nombre, ' ', um.apellido) AS nombre_medico,
                    e.detalle_especialidad AS especialidad,
                    c.motivo,
                    c.estado,
                    d.diagnostico,
                    d.tratamiento
                FROM citas c
                JOIN pacientes p ON c.id_paciente = p.id_paciente
                JOIN usuario up ON p.id_usuario = up.id_usuario
                JOIN usuario um ON c.id_medico = um.id_usuario
                JOIN especialidades e ON c.id_especialidad = e.id_especialidad
                LEFT JOIN diagnosticos d ON c.id_cita = d.id_cita
            `;
    
            const queryParams = [];
            if (estado && estado !== 'todos') {
                query += ' WHERE c.estado = ?';
                queryParams.push(estado);
            }
    
            query += ' ORDER BY c.fecha DESC, c.hora DESC LIMIT 100';
    
            console.log('Query SQL:', query);
            console.log('Parámetros de la query:', queryParams);
    
            const [citas] = await pool.query(query, queryParams);
    
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener estadísticas de citas:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
};

module.exports = diagnosticoController;