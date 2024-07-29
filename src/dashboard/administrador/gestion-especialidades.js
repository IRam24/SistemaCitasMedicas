document.addEventListener('DOMContentLoaded', function() {
    cargarEspecialidades();
    document.getElementById('formNuevaEspecialidad').addEventListener('submit', agregarEspecialidad);
    document.getElementById('formEditarEspecialidad').addEventListener('submit', handleEditarEspecialidad);
    document.getElementById('cancelarEdicion').addEventListener('click', ocultarFormularioEdicion);
});

async function cargarEspecialidades() {
    try {
        const response = await fetch('/api/especialidades');
        const especialidades = await response.json();
        const lista = document.getElementById('listaEspecialidades');
        lista.innerHTML = '';
        especialidades.forEach(especialidad => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${especialidad.nombre}
                <button onclick="mostrarFormularioEdicion(${especialidad.id_especialidad}, '${especialidad.nombre}')">Editar</button>
                <button onclick="eliminarEspecialidad(${especialidad.id_especialidad})">Eliminar</button>
            `;
            li.addEventListener('click', () => mostrarDetallesEspecialidad(especialidad.id_especialidad));
            lista.appendChild(li);
        });
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
        alert('Error al cargar las especialidades');
    }
}

async function agregarEspecialidad(event) {
    event.preventDefault();
    const detalle_especialidad = document.getElementById('nombreEspecialidad').value;
    try {
        const response = await fetch('/api/especialidades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ detalle_especialidad }),
        });
        if (response.ok) {
            alert('Especialidad agregada con éxito');
            document.getElementById('nombreEspecialidad').value = '';
            cargarEspecialidades();
        } else {
            throw new Error('Error al agregar la especialidad');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar la especialidad');
    }
}

async function mostrarDetallesEspecialidad(id_especialidad) {
    try {
        const response = await fetch(`/api/especialidades/${id_especialidad}/medicos`);
        const medicos = await response.json();
        const detalles = document.querySelector('.detalles-especialidad');
        const nombreEspecialidad = document.getElementById('nombreEspecialidadDetalle');
        const listaMedicos = document.getElementById('listaMedicos');
        
        nombreEspecialidad.textContent = 'Especialidad ' + id_especialidad;
        listaMedicos.innerHTML = '';
        medicos.forEach(medico => {
            const li = document.createElement('li');
            li.textContent = `${medico.nombre} ${medico.apellido}`;
            listaMedicos.appendChild(li);
        });
        
        detalles.style.display = 'block';
    } catch (error) {
        console.error('Error al cargar detalles de la especialidad:', error);
        alert('Error al cargar los detalles de la especialidad');
    }
}

function mostrarFormularioEdicion(id, nombre) {
    document.getElementById('editarIdEspecialidad').value = id;
    document.getElementById('editarNombreEspecialidad').value = nombre;
    document.querySelector('.editar-especialidad').style.display = 'block';
}

function ocultarFormularioEdicion() {
    document.querySelector('.editar-especialidad').style.display = 'none';
}

async function handleEditarEspecialidad(event) {
    event.preventDefault();
    const id_especialidad = document.getElementById('editarIdEspecialidad').value;
    const detalle_especialidad = document.getElementById('editarNombreEspecialidad').value;
    try {
        const response = await fetch(`/api/especialidades/${id_especialidad}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ detalle_especialidad }),
        });
        if (response.ok) {
            alert('Especialidad actualizada con éxito');
            ocultarFormularioEdicion();
            cargarEspecialidades();
        } else {
            throw new Error('Error al actualizar la especialidad');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la especialidad');
    }
}

async function eliminarEspecialidad(id_especialidad) {
    if (confirm('¿Está seguro de que desea eliminar esta especialidad?')) {
        try {
            const response = await fetch(`/api/especialidades/${id_especialidad}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Especialidad eliminada con éxito');
                cargarEspecialidades();
            } else {
                throw new Error('Error al eliminar la especialidad');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la especialidad');
        }
    }
}