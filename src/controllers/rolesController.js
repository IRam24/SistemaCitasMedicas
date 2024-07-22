// rolesController.js
const pool = require('../config/database');

const rolesController = {
  // Obtener todos los roles (útil para el formulario de registro)
  getAllRoles: async (req, res) => {
    try {
      const [roles] = await pool.query('SELECT id, asign_role, description FROM roles');
      res.json(roles);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Ver los roles de los usuarios registrados
  getUsersWithRoles: async (req, res) => {
    try {
      const [users] = await pool.query('SELECT u.id, u.nombre, u.email, r.asign_role FROM usuario u JOIN roles r ON u.rol = r.id');
      res.json(users);
    } catch (error) {
      console.error('Error al obtener usuarios con roles:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  getMedicos: async (req, res) => {
    try {
        const [medicos] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.apellido
            FROM usuario u
            JOIN roles r ON u.rol = r.id
            WHERE r.asign_role = 'medico'
        `);
        res.json(medicos);
    } catch (error) {
        console.error('Error al obtener médicos:', error);
        res.status(500).json({ message: 'Error al obtener médicos', error: error.message });
    }
},
};

module.exports = rolesController;