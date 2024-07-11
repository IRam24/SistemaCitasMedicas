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

        const loginData = { email, password };
        console.log('Datos de inicio de sesión:', loginData); 

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            console.log('Respuesta completa:', response);
            console.log('Status de la respuesta:', response.status);

            const data = await response.json();
            console.log('Datos de respuesta:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error en el servidor');
            }

            if (data.success) {
                mostrarExito('Inicio de sesión exitoso. Redirigiendo...');
                console.log('Redirigiendo a /menu...');
                setTimeout(() => {
                    window.location.href = '/menu';
                }, 1500);
            } else {
                mostrarError(data.message || 'Credenciales incorrectas. Por favor, intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error detallado durante el inicio de sesión:', error);
            mostrarError('Hubo un error al intentar iniciar sesión. Por favor, intenta de nuevo más tarde.');
        }
    });

    function mostrarError(mensaje) {
        const errorDiv = document.getElementById('error-mensaje');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
            setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
        } else {
            alert(mensaje);
        }
    }

    function mostrarExito(mensaje) {
        const exitoDiv = document.getElementById('exito-mensaje');
        if (exitoDiv) {
            exitoDiv.textContent = mensaje;
            exitoDiv.style.display = 'block';
            setTimeout(() => { exitoDiv.style.display = 'none'; }, 5000);
        } else {
            alert(mensaje);
        }
    }
});