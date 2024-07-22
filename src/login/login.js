document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            mostrarError('Por favor, completa todos los campos.');
            return;
        }

        try {
            console.log('Intentando iniciar sesión con email:', email);
            
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            const data = await response.json();
            console.log('Datos de respuesta:', data);

            if (data.success) {
                // Guardar información del usuario
                localStorage.setItem('userId', data.user.id_usuario);
                localStorage.setItem('userName', data.user.nombre);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userRole', data.user.rol);
                
                // Asegúrate de que id_paciente exista antes de guardarlo
                if (data.user.id_paciente) {
                    localStorage.setItem('id_paciente', data.user.id_paciente);
                } else {
                    console.warn('No se encontró id_paciente en la respuesta');
                }

                console.log('Información guardada en localStorage:', {
                    userId: localStorage.getItem('userId'),
                    userName: localStorage.getItem('userName'),
                    userEmail: localStorage.getItem('userEmail'),
                    userRole: localStorage.getItem('userRole'),
                    id_paciente: localStorage.getItem('id_paciente')
                });

                // Redirigir al dashboard específico según el rol
                redirigirSegunRol(data.user.rol);
            } else {
                console.error('Error en el inicio de sesión:', data.message);
                mostrarError(data.message || 'Error en el inicio de sesión');
            }
        } catch (error) {
            console.error('Error detallado:', error);
            mostrarError('Error en el servidor. Por favor, intenta más tarde.');
        }
    });

    function mostrarError(mensaje) {
        console.error('Error mostrado al usuario:', mensaje);
        const errorDiv = document.getElementById('error-mensaje');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        } else {
            console.warn('Elemento de error no encontrado en el DOM');
            alert(mensaje);
        }
    }

    function redirigirSegunRol(rol) {
        console.log('Redirigiendo según rol:', rol);
        switch(rol) {
            case 'paciente':
                window.location.href = '/dashboard/paciente';
                break;
            case 'medico':
                window.location.href = '/dashboard/medico';
                break;
            case 'administrador':
                window.location.href = '/dashboard/administrador';
                break;
            default:
                console.error('Rol no reconocido:', rol);
                mostrarError('Error en el rol de usuario. Por favor, contacta al administrador.');
        }
    }
});