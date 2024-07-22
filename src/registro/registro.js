const API_BASE_URL = 'http://localhost:3000';
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const rolSelect = document.getElementById('asign_role');
    const especialidadDiv = document.getElementById('especialidad-div');
    const especialidadSelect = document.getElementById('especialidad');

    if (!form || !submitButton || !rolSelect || !especialidadDiv || !especialidadSelect) {
        console.error('Uno o más elementos del formulario no se encontraron');
        return;
    }

    // Cargar roles disponibles
    cargarRoles();

    // Evento para mostrar/ocultar el campo de especialidad
    rolSelect.addEventListener('change', function() {
        if (this.value === 'medico') {
            especialidadDiv.style.display = 'block';
            cargarEspecialidades();
        } else {
            especialidadDiv.style.display = 'none';
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const ci = document.getElementById('ci').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fechanacimiento = document.getElementById('fechanacimiento').value;
        const rol = rolSelect.value;

        // Validaciones
        if (!nombre || !apellido || !ci || !phone || !email || !direccion || !password || !confirmPassword || !fechanacimiento || !rol) {
            mostrarError('Todos los campos son obligatorios');
            return;
        }

        if (!validarEmail(email)) {
            mostrarError('El formato del email no es válido');
            return;
        }

        if (password !== confirmPassword) {
            mostrarError('Las contraseñas no coinciden');
            return;
        }

        if (!validarFortalezaPassword(password)) {
            mostrarError('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número');
            return;
        }

        if (!validarEdad(fechanacimiento)) {
            mostrarError('Debes ser mayor de 18 años para registrarte');
            return;
        }

        // Objeto con los datos del usuario
        const usuario = { nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, rol };

        // Añadir especialidad si el rol es médico
        if (rol === 'medico') {
            const especialidadId = especialidadSelect.value;
            if (!especialidadId) {
                mostrarError('Debe seleccionar una especialidad para médicos');
                return;
            }
            usuario.especialidadId = especialidadId;
        }

        // Deshabilitar el botón y mostrar carga
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        try {
            // Enviar datos al backend y recibir la respuesta
            const resultado = await enviarAlBackend(usuario);
            
            if (resultado.success) {
                mostrarExito(`Registro exitoso. Bienvenido!`);
                setTimeout(() => {
                    window.location.href = '/login/login.html';
                }, 3000);
            } else {
                mostrarError(resultado.message || 'Hubo un problema con el registro');
            }
        } catch (error) {
            mostrarError('Error en el registro.....: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarse';
        }
    });

    function validarEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email);
    }

    function validarFortalezaPassword(password) {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(password);
    }

    function validarEdad(fechanacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechanacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad >= 18;
    }

    function mostrarError(mensaje) {
        const errorDiv = document.getElementById('error-mensaje');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            console.error('Elemento de mensaje de error no encontrado');
            alert(mensaje);  
        }
    }
    
    function mostrarExito(mensaje) {
        const exitoDiv = document.getElementById('exito-mensaje');
        if (exitoDiv) {
            exitoDiv.textContent = mensaje;
            exitoDiv.style.display = 'block';
            setTimeout(() => {
                exitoDiv.style.display = 'none';
            }, 5000);
        } else {
            console.error('Elemento de mensaje de éxito no encontrado');
            alert(mensaje);  
        }
    }  

    async function enviarAlBackend(datos) {
        try {
            const url = `${API_BASE_URL}/api/registro`;
            console.log('Intentando enviar datos a:', url);
            console.log('Datos enviados al servidor:', datos);
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });
    
            console.log('Respuesta del servidor:', response.status, response.statusText);
    
            const responseData = await response.json();
            console.log('Datos de respuesta:', responseData);
    
            if (!response.ok) {
                throw new Error(responseData.message || `Error del servidor: ${response.status}`);
            }
            return responseData;
        } catch (error) {
            console.error('Error detallado:', error);
            throw error;
        }
    }

    async function cargarRoles() {
        try {
            console.log('Iniciando carga de roles');
            const rolSelect = document.getElementById('asign_role');
            if (!rolSelect) {
                throw new Error('Elemento select de roles no encontrado');
            }
    
            console.log('Haciendo fetch a /api/roles');
            const response = await fetch('/api/roles');
            console.log('Respuesta recibida:', response);
            
            if (!response.ok) {
                throw new Error(`Error al cargar roles: ${response.status} ${response.statusText}`);
            }
            
            const roles = await response.json();
            console.log('Roles recibidos:', roles);
    
            rolSelect.innerHTML = '<option value="">Seleccione un rol</option>';
            roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.asign_role;
                option.textContent = rol.asign_role;
                rolSelect.appendChild(option);
            });
            console.log('Roles cargados en el select');
        } catch (error) {
            console.error('Error detallado al cargar roles:', error);
            mostrarError('Error al cargar roles. Por favor, intente más tarde.');
        }
    }

    async function cargarEspecialidades() {
        try {
            const response = await fetch('/api/especialidades');
            if (!response.ok) {
                throw new Error(`Error al cargar especialidades: ${response.status} ${response.statusText}`);
            }
            const especialidades = await response.json();
            const especialidadSelect = document.getElementById('especialidad');
            especialidadSelect.innerHTML = '<option value="">Seleccione una especialidad</option>';
            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id_especialidad;
                option.textContent = esp.nombre;
                especialidadSelect.appendChild(option); 
            });
        } catch (error) {
            console.error('Error detallado al cargar especialidades:', error);
            mostrarError('Error al cargar especialidades. Por favor, intente más tarde.');
        }
    }
});
