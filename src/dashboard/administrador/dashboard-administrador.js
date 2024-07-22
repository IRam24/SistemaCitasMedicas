// dashboard-administrador.js

document.addEventListener('DOMContentLoaded', function() {
    cargarInfoUsuario();
    setupMenuListeners();
    cargarContenidoInicial();
});

function cargarInfoUsuario() {
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    if (userName && userRole === 'admin') {
        document.getElementById('nombreUsuario').textContent = `Bienvenido, ${userName}`;
    } else {
        // Redirigir si no es un administrador
        //window.location.href = '/login.html';
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
    // Carga el contenido de gestión de usuarios por defecto
    cargarContenido('gestion-usuarios');
}

async function cargarContenido(seccion) {
    const contenido = document.getElementById('contenido-principal');
    contenido.innerHTML = '<p>Cargando...</p>';

    try {
        let html;
        let scriptUrl;
        switch(seccion) {
            case 'gestion-usuarios':
                html = await fetch('/views/admin/gestion-usuarios.html').then(res => res.text());
                scriptUrl = '/dashboard/administrador/gestion-usuarios.js';
                break;
            case 'gestion-especialidades':
                html = await fetch('/views/gestion-especialidades.html').then(res => res.text());
                scriptUrl = '/dashboard/administrador/gestion-especialidades.js';
                break;
            case 'gestion-consultorios':
                html = await fetch('/views/admin/gestion-consultorios.html').then(res => res.text());
                scriptUrl = '/dashboard/administrador/gestion-consultorios.js';
                break;
            case 'estadisticas':
                html = await fetch('/views/estadisticas.html').then(res => res.text());
                scriptUrl = '/dashboard/administrador/estadisticas.js';
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

