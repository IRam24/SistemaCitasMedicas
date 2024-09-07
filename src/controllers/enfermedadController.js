const pool = require('../config/database');

const enfermedadController = {
    getAllEnfermedades: async (req, res) => {
        try {
            const [enfermedades] = await pool.query('SELECT id_enfermedad, codigo, nombre, sistema_afectado, descripcion FROM enfermedades ORDER BY sistema_afectado, nombre');
            console.log('Enfermedades obtenidas:', enfermedades); // Log para depuración
            res.json(enfermedades);
        } catch (error) {
            console.error('Error al obtener enfermedades:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    },

};

module.exports = enfermedadController;