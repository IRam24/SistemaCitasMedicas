document.addEventListener('DOMContentLoaded', function() {
    cargarInfoMedico();
    cargarContenido('agenda');
});

async function cargarInfoMedico() {
    try {
        const data = await API.users.getById('me');
        document.getElementById('nombreUsuario').textContent = `Dr. ${data.nombre}`;
    } catch (error) {
        console.error('Error al cargar información del médico:', error);
    }
}

function cargarContenido(seccion) {
    const contenido = document.getElementById('contenido-principal');
    switch(seccion) {
        case 'agenda':
            contenido.innerHTML = '<h2>Agenda Médica</h2>';
            cargarAgendaMedica();
            break;
        case 'horario':
            contenido.innerHTML = `
                <h2>Horario Disponible</h2>
                <form id="formHorario">
                    <input type="date" id="fecha">
                    <input type="time" id="horaInicio">
                    <input type="time" id="horaFin">
                    <button type="submit">Agregar Horario</button>
                </form>
            `;
            document.getElementById('formHorario').addEventListener('submit', agregarHorario);
            break;
        case 'especialidad':
            contenido.innerHTML = '<h2>Mi Especialidad</h2>';
            cargarInfoEspecialidad();
            break;
    }
}

async function cargarAgendaMedica() {
    try {
        const citas = await API.citas.getDoctorHorario();
        const listaCitas = citas.map(cita => `
            <li>Fecha: ${cita.fecha}, Paciente: ${cita.paciente}</li>
        `).join('');
        document.getElementById('contenido-principal').innerHTML += `
            <ul>${listaCitas}</ul>
        `;
    } catch (error) {
        console.error('Error al cargar agenda médica:', error);
    }
}

async function agregarHorario(event) {
    event.preventDefault();
    const fecha = document.getElementById('fecha').value;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    try {
        await API.citas.addDoctorHorario({ fecha, horaInicio, horaFin });
        alert('Horario agregado con éxito');
    } catch (error) {
        console.error('Error al agregar horario:', error);
        alert('Error al agregar horario');
    }
}

async function cargarInfoEspecialidad() {
    try {
        const data = await API.especialidades.getDoctorEspecialidad();
        document.getElementById('contenido-principal').innerHTML += `
            <p>Especialidad: ${data.nombre}</p>
            <p>Descripción: ${data.descripcion}</p>
        `;
    } catch (error) {
        console.error('Error al cargar información de especialidad:', error);
    }
}