document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    if (!form) {
        console.error('El formulario de registro no se encontró');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('El botón de envío no se encontró');
        return;
    }
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

        // Validaciones
        if (!nombre || !apellido || !ci || !phone || !email || !direccion || !password || !confirmPassword || !fechanacimiento) {
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
        const usuario = { nombre, apellido, ci, phone, email, direccion, password, fechanacimiento, is_active: true };

        // Deshabilitar el botón y mostrar carga
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        try {
            // Enviar datos al backend y recibir la respuesta
            const resultado = await enviarAlBackend(usuario);
            
            if (resultado.success) {
                mostrarExito(`Registro exitoso. Bienvenido!`);
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 8000);
            } else {
                mostrarError(resultado.message || 'Hubo un problema con el registro');
            }
        } catch (error) {
            mostrarError('Error en el registro: ' + error.message);
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
            alert(mensaje);  // Fallback a un alert si el elemento no existe
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
            alert(mensaje);  // Fallback a un alert si el elemento no existe
        }
    }

    async function enviarAlBackend(datos) {
        const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el registro');
        }
        return response.json();
    }
});