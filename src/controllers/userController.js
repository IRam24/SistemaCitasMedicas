// userController.js
const pool = require('../config/database');

const userController = {
  // Autenticación
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const [usuarios] = await pool.query('SELECT * FROM usuario WHERE email = ? AND password = ?', [email, password]);
      
      if (usuarios.length === 0) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      const usuario = usuarios[0];
      res.json({ 
        success: true, 
        message: 'Inicio de sesión exitoso', 
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email
        }
      });
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
  },

  registro: async (req, res) => {
    try {
      const { nombre, apellido, ci, phone, email, direccion, password, fechanacimiento } = req.body;
      
      const [existingUsers] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
      }

      const [result] = await pool.query(
        'INSERT INTO usuario (nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, true]
      );

      res.status(201).json({ success: true, message: 'Usuario registrado con éxito', userId: result.insertId });
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
  },

  // Operaciones CRUD
  getAll: async (req, res) => {
    try {
      const [users] = await pool.query('SELECT * FROM usuario');
      res.json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  getById: async (req, res) => {
    try {
      const [users] = await pool.query('SELECT * FROM usuario WHERE id = ?', [req.params.id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(users[0]);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre, apellido, ci, phone, email, direccion } = req.body;
      const [result] = await pool.query(
        'UPDATE usuario SET nombre = ?, apellido = ?, ci = ?, phone = ?, email = ?, direccion = ? WHERE id = ?',
        [nombre, apellido, ci, phone, email, direccion, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario actualizado con éxito' });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM usuario WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  toggleActive: async (req, res) => {
    try {
      const [result] = await pool.query('UPDATE usuario SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Estado de activación del usuario cambiado con éxito' });
    } catch (error) {
      console.error('Error al cambiar estado de activación del usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { newPassword } = req.body;
      const [result] = await pool.query('UPDATE usuario SET password = ? WHERE id = ?', [newPassword, req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Contraseña cambiada con éxito' });
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = userController;