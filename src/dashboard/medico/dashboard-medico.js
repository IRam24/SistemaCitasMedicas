// dashboard-medico.js

document.addEventListener('DOMContentLoaded', function() {
    cargarInfoMedico();
    setupMenuListeners();
    cargarContenidoInicial();
});

function cargarInfoMedico() {
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    if (userName && userRole === 'medico') {
        document.getElementById('nombreMedico').textContent = `Bienvenido, Dr. ${userName}`;
    } else {
        // Redirigir si no es un médico
        window.location.href = '/login.html';
    }
}

function setupMenuListeners() {
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', function() {
            cargarContenido(this.dataset.content);
        });
    });
}

function cargarContenidoInicial() {
    // Carga el contenido de gestión de citas por defecto
    cargarContenido('gestion-citas');
}

async function cargarContenido(seccion) {
    const contenido = document.getElementById('contenido-principal');
    contenido.innerHTML = '<p>Cargando...</p>';

    try {
        let html;
        let scriptUrl;
        switch(seccion) {
            case 'gestion-citas':
                html = await fetch('/views/medico/gestion-citas.html').then(res => res.text());
                scriptUrl = '/dashboard/medico/gestion-citas.js';
                break;
            case 'gestion-disponibilidad':
                html = await fetch('/views/medico/gestion-disponibilidad.html').then(res => res.text());
                scriptUrl = '/dashboard/medico/gestion-disponibilidad.js';
                break;
            case 'perfil-medico':
                html = await fetch('/views/medico/perfil-medico.html').then(res => res.text());
                scriptUrl = '/dashboard/medico/perfil-medico.js';
                break;
            default:
                contenido.innerHTML = '<p>Sección no encontrada</p>';
                return;
        }

        contenido.innerHTML = html;
        
        try {
            await cargarScript(scriptUrl);
            console.log(`Script ${scriptUrl} cargado y ejecutado`);
        } catch (scriptError) {
            console.error(`Error al cargar o ejecutar el script ${scriptUrl}:`, scriptError);
            contenido.innerHTML += '<p>Error al cargar funcionalidades. Por favor, recargue la página.</p>';
        }
    } catch (error) {
        console.error('Error al cargar contenido:', error);
        contenido.innerHTML = '<p>Error al cargar el contenido. Por favor, intente de nuevo.</p>';
    }
}

function cargarScript(url) {
    console.log('Intentando cargar script:', url);
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
            console.log('Script ya cargado:', url);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            console.log('Script cargado con éxito:', url);
            resolve();
        };
        script.onerror = (error) => {
            console.error('Error al cargar script:', url, error);
            reject(error);
        };
        document.body.appendChild(script);
    });
}