// gestion-usuarios.js

document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('buscar-usuario').addEventListener('input', buscarUsuarios);
    document.getElementById('form-editar-cita').addEventListener('submit', editarCita);
    
    // Cerrar modales
    document.querySelectorAll('.modal .close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
}

async function cargarUsuarios() {
    try {
        const response = await fetch('/api/users');
        const usuarios = await response.json();
        const listaUsuarios = document.getElementById('lista-usuarios');
        listaUsuarios.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.email}</td>
                <td>
                    <button onclick="verCitasUsuario(${usuario.id_usuario})">Ver Citas</button>
                    <button onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
                    <button onclick="eliminarUsuario(${usuario.id_usuario})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

function buscarUsuarios() {
    const busqueda = document.getElementById('buscar-usuario').value.toLowerCase();
    const filas = document.querySelectorAll('#lista-usuarios tr');
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(busqueda) ? '' : 'none';
    });
}

async function verCitasUsuario(idUsuario) {
    try {
        const response = await fetch(`/api/paciente-citas?id_usuario=${idUsuario}`);
        const citas = await response.json();
        const listaCitas = document.getElementById('lista-citas');
        listaCitas.innerHTML = citas.map(cita => `
            <tr>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.nombre_medico}</td>
                <td>${cita.estado}</td>
                <td>
                    <button onclick="editarCita(${cita.id_cita})">Editar</button>
                    <button onclick="eliminarCita(${cita.id_cita})">Eliminar</button>
                </td>
            </tr>
        `).join('');
        document.getElementById('modal-citas').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar citas del usuario:', error);
    }
}

function mostrarFormularioNuevaCita() {
    // Implementar lógica para mostrar formulario de nueva cita
    console.log('Mostrar formulario de nueva cita');
}

async function editarCita(event) {
    event.preventDefault();
    const citaId = document.getElementById('editar-cita-id').value;
    const formData = new FormData(event.target);
    const citaData = Object.fromEntries(formData);

    try {
        const response = await fetch(`/api/citas/${citaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(citaData)
        });
        const result = await response.json();
        if (result.success) {
            alert('Cita actualizada con éxito');
            document.getElementById('modal-editar-cita').style.display = 'none';
            verCitasUsuario(result.id_usuario); // Recargar las citas del usuario
        } else {
            alert('Error al actualizar cita: ' + result.message);
        }
    } catch (error) {
        console.error('Error al editar cita:', error);
        alert('Error al editar cita');
    }
}

async function eliminarCita(idCita) {
    if (confirm('¿Está seguro de que desea eliminar esta cita?')) {
        try {
            const response = await fetch(`/api/citas/${idCita}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                alert('Cita eliminada con éxito');
                verCitasUsuario(result.id_usuario); // Recargar las citas del usuario
            } else {
                alert('Error al eliminar cita: ' + result.message);
            }
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            alert('Error al eliminar cita');
        }
    }
}

function editarUsuario(idUsuario) {
    // Implementar lógica para editar usuario
    console.log('Editar usuario:', idUsuario);
}

function eliminarUsuario(idUsuario) {
    // Implementar lógica para eliminar usuario
    console.log('Eliminar usuario:', idUsuario);
}

// Funciones auxiliares para cargar opciones en los selectores
async function cargarEspecialidades() {
    // Implementar lógica para cargar especialidades
}

async function cargarMedicos() {
    // Implementar lógica para cargar médicos
}

async function cargarHorariosDisponibles() {
    // Implementar lógica para cargar horarios disponibles
}