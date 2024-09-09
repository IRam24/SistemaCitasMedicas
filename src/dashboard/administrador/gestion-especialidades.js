// gestion-especialidades.js

document.addEventListener('DOMContentLoaded', function() {
    cargarEspecialidades();
    
    // Event listeners
    document.getElementById('formNuevaEspecialidad').addEventListener('submit', crearEspecialidad);
    document.getElementById('formEditarEspecialidad').addEventListener('submit', guardarEdicionEspecialidad);
    document.getElementById('cancelarEdicion').addEventListener('click', cancelarEdicion);
});

function cargarEspecialidades() {
    fetch('/especialidades')
        .then(response => response.json())
        .then(especialidades => {
            const lista = document.getElementById('listaEspecialidades');
            lista.innerHTML = '';
            especialidades.forEach(esp => {
                const li = document.createElement('li');
                li.dataset.id = esp.id_especialidad;
                li.innerHTML = `
                    <strong>${esp.nombre}</strong> - ${esp.detalle_especialidad}
                    <div class="acciones-especialidad">
                        <button class="btn-editar">Editar</button>
                        <button class="btn-eliminar">Eliminar</button>
                    </div>
                `;
                lista.appendChild(li);

                // Agregar event listeners a los botones
                li.querySelector('.btn-editar').addEventListener('click', () => editarEspecialidad(esp.id_especialidad, esp.nombre, esp.detalle_especialidad));
                li.querySelector('.btn-eliminar').addEventListener('click', () => eliminarEspecialidad(esp.id_especialidad));
            });
        })
        .catch(error => {
            console.error('Error al cargar especialidades:', error);
            mostrarMensaje('Error al cargar especialidades', 'error');
        });
}

function crearEspecialidad(event) {
    event.preventDefault(); // Esto es crucial para evitar que el formulario se envíe de manera tradicional
    const nombre = document.getElementById('nombreEspecialidad').value;
    const detalle_especialidad = document.getElementById('detalleEspecialidad').value;
    fetch('/especialidades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Asegúrate de incluir el token de autenticación si es necesario
            // 'Authorization': 'Bearer ' + tuTokenDeAutenticacion
        },
        body: JSON.stringify({ nombre, detalle_especialidad }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al crear especialidad');
        }
        return response.json();
    })
    .then(data => {
        mostrarMensaje(data.message, 'success');
        document.getElementById('formNuevaEspecialidad').reset();
        cargarEspecialidades();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al crear especialidad', 'error');
    });
}

// Asegúrate de que este evento esté correctamente vinculado
document.getElementById('formNuevaEspecialidad').addEventListener('submit', crearEspecialidad);

function editarEspecialidad(id, nombre, detalle) {
    document.getElementById('editarIdEspecialidad').value = id;
    document.getElementById('editarNombreEspecialidad').value = nombre;
    document.getElementById('editarDetalleEspecialidad').value = detalle;
    document.querySelector('.editar-especialidad').style.display = 'block';
}

function guardarEdicionEspecialidad(event) {
    event.preventDefault();
    const id = document.getElementById('editarIdEspecialidad').value;
    const nombre = document.getElementById('editarNombreEspecialidad').value;
    const detalle_especialidad = document.getElementById('editarDetalleEspecialidad').value;
    fetch(`/especialidades/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Asegúrate de incluir el token de autenticación si es necesario
            // 'Authorization': 'Bearer ' + tuTokenDeAutenticacion
        },
        body: JSON.stringify({ nombre, detalle_especialidad }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar especialidad');
        }
        return response.json();
    })
    .then(data => {
        mostrarMensaje(data.message, 'success');
        document.querySelector('.editar-especialidad').style.display = 'none';
        cargarEspecialidades();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar especialidad', 'error');
    });
}

function eliminarEspecialidad(id) {
    if (confirm('¿Está seguro de que desea eliminar esta especialidad?')) {
        fetch(`/especialidades/${id}`, {
            method: 'DELETE',
            headers: {
                // Asegúrate de incluir el token de autenticación si es necesario
                // 'Authorization': 'Bearer ' + tuTokenDeAutenticacion
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar especialidad');
            }
            return response.json();
        })
        .then(data => {
            mostrarMensaje(data.message, 'success');
            cargarEspecialidades();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al eliminar especialidad', 'error');
        });
    }
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeElement = document.createElement('div');
    mensajeElement.textContent = mensaje;
    mensajeElement.className = tipo === 'error' ? 'error-message' : 'success-message';
    document.querySelector('.especialidades-container').prepend(mensajeElement);
    setTimeout(() => mensajeElement.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', setupEventListeners);
cargarEspecialidades();