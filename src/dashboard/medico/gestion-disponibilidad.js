document.addEventListener('DOMContentLoaded', function() {
    inicializarAgendamientoCita();
});

function inicializarAgendamientoCita() {
    const formBusqueda = document.getElementById('formBusquedaPaciente');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', buscarPacientePorCI);
    }

    const formCita = document.getElementById('formAgendarCita');
    if (formCita) {
        formCita.addEventListener('submit', agendarCita);
    }

    // Inicializar eventos para los selectores
    document.getElementById('especialidad').addEventListener('change', cargarMedicos);
    document.getElementById('medico').addEventListener('change', () => {
        if (document.getElementById('fecha').value) {
            cargarHorariosDisponibles();
        }
    });
    document.getElementById('fecha').addEventListener('change', cargarHorariosDisponibles);
}

async function buscarPacientePorCI(event) {
    event.preventDefault();
    const ci = document.getElementById('ciPaciente').value;
    
    try {
        const response = await fetch(`/pacientes/buscar?ci=${ci}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la búsqueda');
        }
        const paciente = await response.json();
        console.log('Datos del paciente recibidos:', paciente); // Para depuración
        
        mostrarInfoPaciente(paciente);
        habilitarFormularioCita(paciente.id_paciente);
        await cargarEspecialidades();
    } catch (error) {
        console.error('Error al buscar paciente:', error);
        mostrarMensaje('Error al buscar paciente: ' + error.message, 'error');
    }
}

function mostrarInfoPaciente(paciente) {
    const infoPaciente = document.getElementById('infoPaciente');
    if (!paciente.id_paciente) {
        console.error('id_paciente no encontrado en los datos del paciente:', paciente);
    }
    infoPaciente.innerHTML = `
        <h3>Información del Paciente</h3>
        <p>Nombre: ${paciente.nombre} ${paciente.apellido}</p>
        <p>CI: ${paciente.ci}</p>
        <p>Fecha de Nacimiento: ${paciente.fechanacimiento}</p>
        <p>ID Paciente: ${paciente.id_paciente || 'No disponible'}</p>
    `;
    infoPaciente.style.display = 'block';
    
    const idPacienteInput = document.getElementById('idPaciente');
    if (idPacienteInput) {
        idPacienteInput.value = paciente.id_paciente || '';
    } else {
        console.error('Elemento idPaciente no encontrado en el DOM');
    }
}

function habilitarFormularioCita(idPaciente) {
    const formCita = document.getElementById('formAgendarCita');
    if (formCita) {
        formCita.style.display = 'block';
        const idPacienteInput = document.getElementById('idPaciente');
        if (idPacienteInput) {
            idPacienteInput.value = idPaciente || '';
        } else {
            console.error('Elemento idPaciente no encontrado en el formulario');
        }
    } else {
        console.error('Formulario de cita no encontrado');
    }
}

async function cargarEspecialidades() {
    try {
        const response = await fetch('/especialidades');
        if (!response.ok) throw new Error('Error al cargar especialidades');
        const especialidades = await response.json();
        
        const selectEspecialidad = document.getElementById('especialidad');
        selectEspecialidad.innerHTML = '<option value="">Seleccione una especialidad</option>' + 
            especialidades.map(esp => 
                `<option value="${esp.id_especialidad}">${esp.nombre}</option>`
            ).join('');
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
        mostrarMensaje('Error al cargar especialidades.', 'error');
    }
}

async function cargarMedicos() {
    const idEspecialidad = document.getElementById('especialidad').value;
    if (!idEspecialidad) {
        document.getElementById('medico').innerHTML = '<option value="">Seleccione un médico</option>';
        return;
    }

    try {
        const response = await fetch(`/medicos-por-especialidad/${idEspecialidad}`);
        if (!response.ok) throw new Error('Error al cargar médicos');
        const medicos = await response.json();
        
        const selectMedico = document.getElementById('medico');
        selectMedico.innerHTML = '<option value="">Seleccione un médico</option>' + 
            medicos.map(med => 
                `<option value="${med.id_usuario}">${med.nombre} ${med.apellido}</option>`
            ).join('');
    } catch (error) {
        console.error('Error al cargar médicos:', error);
        mostrarMensaje('Error al cargar médicos.', 'error');
    }
}

async function cargarHorariosDisponibles() {
    const idMedico = document.getElementById('medico').value;
    const fecha = document.getElementById('fecha').value;
    if (!idMedico || !fecha) return;

    try {
        const response = await fetch(`/horarios-disponibles?id_medico=${idMedico}&fecha=${fecha}`);
        if (!response.ok) throw new Error('Error al cargar horarios disponibles');
        const horarios = await response.json();
        
        const selectHora = document.getElementById('hora');
        selectHora.innerHTML = '<option value="">Seleccione una hora</option>' + 
            horarios.map(hora => 
                `<option value="${hora}">${hora}</option>`
            ).join('');

        if (horarios.length === 0) {
            mostrarMensaje('No hay horarios disponibles para la fecha seleccionada', 'info');
        }
    } catch (error) {
        console.error('Error al cargar horarios disponibles:', error);
        mostrarMensaje('Error al cargar horarios disponibles.', 'error');
    }
}

async function agendarCita(event) {
    event.preventDefault();
    const idPaciente = document.getElementById('idPaciente').value;
    const idEspecialidad = document.getElementById('especialidad').value;
    const idMedico = document.getElementById('medico').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const motivo = document.getElementById('motivo').value;

    // Validación mejorada
    if (!idPaciente || idPaciente === 'undefined') {
        mostrarMensaje('Error: ID de paciente no válido', 'error');
        console.error('ID de paciente no válido:', idPaciente);
        return;
    }

    if (!idEspecialidad || !idMedico || !fecha || !hora || !motivo) {
        mostrarMensaje('Por favor, complete todos los campos', 'error');
        return;
    }

    const datosCita = { 
        id_paciente: idPaciente,
        id_especialidad: idEspecialidad,
        id_medico: idMedico,
        fecha,
        hora,
        motivo,
        estado: 'Programada'
    };

    console.log('Datos a enviar:', datosCita);

    try {
        const response = await fetch('/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosCita),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al agendar cita');
        }
        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);
        mostrarMensaje('Cita agendada con éxito', 'success');
        limpiarFormulario();
    } catch (error) {
        console.error('Error al agendar cita:', error);
        mostrarMensaje(error.message || 'Error al agendar cita. Intente nuevamente.', 'error');
    }
}

function limpiarFormulario() {
    document.getElementById('formAgendarCita').reset();
    document.getElementById('idPaciente').value = '';
    document.getElementById('infoPaciente').innerHTML = '';
    document.getElementById('infoPaciente').style.display = 'none';
    document.getElementById('formAgendarCita').style.display = 'none';
    // Limpiar también los selects
    document.getElementById('especialidad').innerHTML = '<option value="">Seleccione una especialidad</option>';
    document.getElementById('medico').innerHTML = '<option value="">Seleccione un médico</option>';
    document.getElementById('hora').innerHTML = '<option value="">Seleccione una hora</option>';
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeElement = document.getElementById('mensaje');
    if (mensajeElement) {
        mensajeElement.textContent = mensaje;
        mensajeElement.className = tipo;
        mensajeElement.style.display = 'block';
        
        setTimeout(() => {
            mensajeElement.style.display = 'none';
        }, 5000);
    } else {
        console.error('Elemento mensaje no encontrado');
        alert(mensaje);
    }
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeElement = document.getElementById('mensaje');
    if (mensajeElement) {
        mensajeElement.textContent = mensaje;
        mensajeElement.className = tipo;
        mensajeElement.style.display = 'block';
        
        setTimeout(() => {
            mensajeElement.style.display = 'none';
        }, 5000);
    } else {
        console.error('Elemento mensaje no encontrado');
        alert(mensaje);
    }
}

function limpiarFormulario() {
    document.getElementById('formAgendarCita').reset();
    document.getElementById('idPaciente').value = '';
    document.getElementById('infoPaciente').innerHTML = '';
    document.getElementById('infoPaciente').style.display = 'none';
    document.getElementById('formAgendarCita').style.display = 'none';
}

inicializarAgendamientoCita();

