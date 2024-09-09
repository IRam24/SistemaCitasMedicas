// userController.js
const pool = require('../config/database');
const userController = {
  // Autenticación
  login: async (req, res) => {
    try {
        const { email, password } = req.body;
        const [usuarios] = await pool.query(`
            SELECT u.*, r.asign_role as rol_nombre, p.id_paciente
            FROM usuario u
            JOIN roles r ON u.rol = r.id
            LEFT JOIN pacientes p ON u.id_usuario = p.id_usuario
            WHERE u.email = ?`, [email]);

        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const usuario = usuarios[0];

        // Reemplaza la comparación con bcrypt por una comparación directa
        if (password !== usuario.password) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Establecer la sesión del usuario
        req.session.user = {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol_nombre,
        };

        // Agregar id_paciente solo si el usuario es un paciente
        if (usuario.rol_nombre === 'paciente' && usuario.id_paciente) {
            req.session.user.id_paciente = usuario.id_paciente;
        }

        // Información adicional específica para médicos (si es necesario)
        if (usuario.rol_nombre === 'medico') {
          
            const [especialidadMedico] = await pool.query('SELECT id_especialidad FROM medicos WHERE id_usuario = ?', [usuario.id_usuario]);
            if (especialidadMedico.length > 0) {
                req.session.user.id_especialidad = especialidadMedico[0].id_especialidad;
            }
        }

        // Puedes agregar más información específica para administradores si es necesario

        console.log('Sesión del usuario establecida:', req.session.user);

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol_nombre,
                id_paciente: usuario.id_paciente, // Será undefined para no pacientes
                id_especialidad: req.session.user.id_especialidad // Será undefined para no médicos
            }
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
},

  // Registro de usuario
  registro: async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, rol, especialidadId } = req.body;
        
        // Verificar si el email ya existe
        const [existingUser] = await connection.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        }

        // Obtener el id del rol
        const [roles] = await connection.query('SELECT id FROM roles WHERE asign_role = ?', [rol]);
        if (roles.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Rol no válido' });
        }
        const rolId = roles[0].id;

        // Insertar el usuario
        const [result] = await connection.query(
            'INSERT INTO usuario (nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, is_active, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, true, rolId]
        );

        const userId = result.insertId;

        // Si el rol es de paciente, insertar en la tabla pacientes
        if (rol.toLowerCase() === 'paciente') {
          await connection.query(
              'INSERT INTO pacientes (id_usuario, fecha_registro) VALUES (?, CURDATE())',
              [userId]
          );
      }

        // Si el rol es médico, insertar en la tabla de médicos
if (rol === 'medico') {
  if (!especialidadId) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Se requiere una especialidad para los médicos' });
  }

  try {
      // Verificar si la especialidad existe
      const [especialidades] = await connection.query('SELECT id_especialidad FROM especialidades WHERE id_especialidad = ?', [especialidadId]);
      if (especialidades.length === 0) {
          await connection.rollback();
          return res.status(400).json({ success: false, message: 'La especialidad seleccionada no es válida' });
      }

      // Insertar en la tabla de médicos
      await connection.query(
          'INSERT INTO medicos (id_usuario, id_especialidad) VALUES (?, ?)',
          [userId, especialidadId]
      );
      console.log('Médico insertado con éxito');
  } catch (medicError) {
      console.error('Error al insertar médico:', medicError);
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Error al registrar el médico' });
  }
}

        await connection.commit();
        res.status(201).json({ success: true, message: 'Usuario registrado con éxito', userId: userId });
    } catch (error) {
        await connection.rollback();
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    } finally {
        connection.release();
    }
},

  // Obtener todos los usuarios (solo para administradores)
  // En userController.js
getAll: async (req, res) => {
    try {
        const filtro = req.query.filtro || 'todos';
        let query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.email, r.asign_role as rol, 
                   CASE 
                     WHEN r.asign_role = 'medico' THEN e.nombre
                     ELSE 'N/A'
                   END as especialidad
            FROM usuario u 
            JOIN roles r ON u.rol = r.id
            LEFT JOIN medicos m ON u.id_usuario = m.id_usuario
            LEFT JOIN especialidades e ON m.id_especialidad = e.id_especialidad
        `;

        if (filtro !== 'todos') {
            query += ` WHERE r.asign_role = ?`;
        }

        const [users] = await pool.query(query, filtro !== 'todos' ? [filtro] : []);
        
        console.log(`Usuarios obtenidos (${filtro}):`, users);
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener usuarios' });
    }
},

  // Obtener un usuario por ID
  getById: async (req, res) => {
    try {
      const [users] = await pool.query('SELECT u.*, r.asign_role as rol FROM usuario u JOIN roles r ON u.rol = r.id WHERE u.id_usuario = ?', [req.params.id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(users[0]);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar usuario
  update: async (req, res) => {
    try {
        const { nombre, apellido, ci, phone, email, direccion } = req.body;
        const userId = req.params.id;

        // Primero, obtenemos el rol actual del usuario
        const [currentUser] = await pool.query('SELECT rol FROM usuario WHERE id_usuario = ?', [userId]);
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const currentRolId = currentUser[0].rol;

        // Actualizamos los campos permitidos, manteniendo el rol actual
        const [result] = await pool.query(
            'UPDATE usuario SET nombre = ?, apellido = ?, ci = ?, phone = ?, email = ?, direccion = ? WHERE id_usuario = ?',
            [nombre, apellido, ci, phone, email, direccion, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Si el usuario es un médico, actualizamos la especialidad si se proporciona
        if (req.body.id_especialidad) {
            const [rolInfo] = await pool.query('SELECT asign_role FROM roles WHERE id = ?', [currentRolId]);
            if (rolInfo[0].asign_role === 'medico') {
                await pool.query(
                    'UPDATE medicos SET id_especialidad = ? WHERE id_usuario = ?',
                    [req.body.id_especialidad, userId]
                );
            }
        }

        res.json({ message: 'Usuario actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
},

  // Eliminar usuario
  delete: async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.params.id;

        // Verificar si el usuario existe y obtener su rol
        const [user] = await connection.query('SELECT id_usuario, rol FROM usuario WHERE id_usuario = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener el nombre del rol
        const [roleName] = await connection.query('SELECT asign_role FROM roles WHERE id = ?', [user[0].rol]);
        const userRole = roleName[0].asign_role;

        // Verificar y eliminar registros asociados basados en el rol
        if (userRole === 'medico') {
            // Verificar si el médico tiene citas
            const [citasMedico] = await connection.query('SELECT COUNT(*) as count FROM citas WHERE id_medico = ?', [userId]);
            if (citasMedico[0].count > 0) {
                return res.status(400).json({ message: 'No se puede eliminar el médico porque tiene citas asociadas' });
            }
            await connection.query('DELETE FROM medicos WHERE id_usuario = ?', [userId]);
        } else if (userRole === 'paciente') {
            // Verificar si el paciente tiene citas
            const [citasPaciente] = await connection.query('SELECT COUNT(*) as count FROM citas WHERE id_paciente = (SELECT id_paciente FROM pacientes WHERE id_usuario = ?)', [userId]);
            if (citasPaciente[0].count > 0) {
                return res.status(400).json({ message: 'No se puede eliminar el paciente porque tiene citas asociadas' });
            }
            await connection.query('DELETE FROM pacientes WHERE id_usuario = ?', [userId]);
        }

        // Intentar eliminar el usuario
        const [deleteResult] = await connection.query('DELETE FROM usuario WHERE id_usuario = ?', [userId]);

        if (deleteResult.affectedRows === 0) {
            // Si no se pudo eliminar, desactivamos el usuario
            await connection.query('UPDATE usuario SET is_active = FALSE WHERE id_usuario = ?', [userId]);
            await connection.commit();
            return res.json({ message: 'Usuario desactivado debido a restricciones. Sus registros asociados han sido eliminados.' });
        }

        await connection.commit();
        res.json({ message: 'Usuario y registros asociados eliminados con éxito' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar/desactivar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    } finally {
        connection.release();
    }
},
  
  createUser: async (req, res) => {
    const { 
        nombre, 
        apellido, 
        email, 
        password, 
        rol, 
        id_especialidad,
        ci,
        phone,
        direccion,
        fechanacimiento
    } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener el ID del rol
        const [roles] = await connection.query('SELECT id FROM roles WHERE asign_role = ?', [rol]);
        if (roles.length === 0) {
            throw new Error('Rol no válido');
        }
        const rolId = roles[0].id;

        // Insertar en la tabla usuario con todos los campos
        const [userResult] = await connection.query(
            `INSERT INTO usuario 
            (nombre, apellido, email, password, rol, ci, phone, direccion, fechanacimiento, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, email, password, rolId, ci, phone, direccion, fechanacimiento, true]
        );

        const userId = userResult.insertId;
        console.log('Nuevo usuario creado con ID:', userId); // Log para depuración

        if (rol === 'medico' && id_especialidad) {
            // Verificar si la especialidad existe
            const [especialidades] = await connection.query('SELECT id_especialidad FROM especialidades WHERE id_especialidad = ?', [id_especialidad]);
            if (especialidades.length === 0) {
                throw new Error('La especialidad seleccionada no es válida');
            }

            // Insertar en la tabla de médicos
            await connection.query(
                'INSERT INTO medicos (id_usuario, id_especialidad) VALUES (?, ?)',
                [userId, id_especialidad]
            );
            console.log('Médico insertado con ID de usuario:', userId); // Log para depuración
        } else if (rol === 'paciente') {
            // Insertar en la tabla pacientes
            await connection.query(
                'INSERT INTO pacientes (id_usuario, fecha_registro) VALUES (?, CURDATE())',
                [userId]
            );
            console.log('Paciente insertado con ID de usuario:', userId); // Log para depuración
        }

        await connection.commit();
        res.status(201).json({ message: 'Usuario creado con éxito', id: userId });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error al crear usuario: ' + error.message });
    } finally {
        connection.release();
    }
},

  // Cerrar sesión
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
      }
      res.json({ success: true, message: 'Sesión cerrada con éxito' });
    });
  },

  getMedicoPerfil: async (req, res) => {
    try {
        const { id } = req.params;
        const [perfil] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.email, e.detalle_especialidad
            FROM usuario u
            JOIN medicos m ON u.id_usuario = m.id_usuario
            JOIN especialidades e ON m.id_especialidad = e.id_especialidad
            WHERE u.id_usuario = ?
        `, [id]);

        if (perfil.length === 0) {
            return res.status(404).json({ message: 'Perfil de médico no encontrado' });
        }

        res.json(perfil[0]);
    } catch (error) {
        console.error('Error al obtener perfil del médico:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
},

  getDashboardData: async (req, res) => {
      try {
          if (!req.session.user) {
              return res.status(401).json({ message: 'No autenticado' });
          }

          const userId = req.session.user.id;
          const userRole = req.session.user.rol;

          let dashboardData = {
              menuItems: [],
              userInfo: {
                  id: userId,
                  nombre: req.session.user.nombre,
                  rol: userRole
    },
              statistics: {}
          };

          res.json(dashboardData);
      } catch (error) {
          console.error('Error al obtener datos del dashboard:', error);
          res.status(500).json({ message: 'Error al cargar el dashboard' });
      }
  },
};

module.exports = userController;

  
