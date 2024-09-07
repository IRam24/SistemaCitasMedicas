const pool = require('../config/database');

const especialidadController = {
  // Obtener todas las especialidades
  getAllEspecialidades: async (req, res) => {
    try {
        const [especialidades] = await pool.query('SELECT id_especialidad, nombre, detalle_especialidad FROM especialidades');
        
        // Para cada especialidad, obtenemos los médicos asociados
        for (let especialidad of especialidades) {
            const [medicos] = await pool.query(`
                SELECT u.id_usuario, u.nombre, u.apellido
                FROM usuario u
                JOIN medicos m ON u.id_usuario = m.id_usuario
                WHERE m.id_especialidad = ?
            `, [especialidad.id_especialidad]);
            
            especialidad.medicos = medicos;
        }

        res.json(especialidades);
    } catch (error) {
        console.error('Error al obtener especialidades y médicos:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
},

  // Crear una nueva especialidad
  createEspecialidad: async (req, res) => {
    try {
      const { detalle_especialidad } = req.body;
      const [result] = await pool.query('INSERT INTO especialidad (detalle_especialidad) VALUES (?)', [detalle_especialidad]);
      res.status(201).json({ message: 'Especialidad creada con éxito', id: result.insertId });
    } catch (error) {
      console.error('Error al crear especialidad:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar una especialidad
  updateEspecialidad: async (req, res) => {
    try {
      const { id_especialidad } = req.params;
      const { detalle_especialidad } = req.body;
      const [result] = await pool.query('UPDATE especialidad SET detalle_especialidad = ? WHERE id_especialidad = ?', [detalle_especialidad, id_especialidad]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }
      res.json({ message: 'Especialidad actualizada con éxito' });
    } catch (error) {
      console.error('Error al actualizar especialidad:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Eliminar una especialidad
  deleteEspecialidad: async (req, res) => {
    try {
      const { id_especialidad } = req.params;
      const [result] = await pool.query('DELETE FROM especialidad WHERE id_especialidad = ?', [id_especialidad]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }
      res.json({ message: 'Especialidad eliminada con éxito' });
    } catch (error) {
      console.error('Error al eliminar especialidad:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Obtener médicos por especialidad
  getMedicosPorEspecialidad: async (req, res) => {
    try {
        const { id_especialidad } = req.params;
        const [medicos] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.apellido
            FROM usuario u
            JOIN medicos m ON u.id_usuario = m.id_usuario
            WHERE m.id_especialidad = ?
        `, [id_especialidad]);
        
        if (medicos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron médicos para esta especialidad' });
        }
        
        res.json(medicos);
    } catch (error) {
        console.error('Error al obtener médicos por especialidad:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
}
};

module.exports = especialidadController;