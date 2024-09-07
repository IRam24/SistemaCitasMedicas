document.addEventListener('DOMContentLoaded', function() {
    const idCita = new URLSearchParams(window.location.search).get('idCita');
    if (idCita) {
        inicializarDashboardPaciente(idCita);
        cargarGeneros()
        cargarTiposSangre();
        cargarTiposAlergia();
    } else {
        alert('No se proporcionó un ID de cita válido');
    }
});

function inicializarDashboardPaciente(idCita) {
    cargarInformacionPaciente(idCita);
    cargarHistorialDiagnosticos(idCita);
    cargarEnfermedades();
    document.getElementById('id_cita').value = idCita;

    document.getElementById('form-diagnostico').addEventListener('submit', guardarDiagnostico);
    document.getElementById('enfermedad').addEventListener('change', mostrarDetallesEnfermedad);
    document.getElementById('btn-actualizar-paciente').addEventListener('click', mostrarModalActualizarPaciente);
    document.getElementById('form-actualizar-paciente').addEventListener('submit', actualizarDatosPaciente);
    document.querySelector('.close').addEventListener('click', cerrarModal);
}


async function cargarInformacionPaciente(idCita) {
    if (!idCita) {
        console.error('No se proporcionó un ID de cita válido');
        return;
    }
    try {
        let url = `/paciente-info/${idCita}`;
        console.log('URL de la petición:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const paciente = await response.json();
        mostrarInformacionPaciente(paciente);
    } catch (error) {
        console.error('Error al cargar información del paciente:', error);
        alert('Error al cargar la información del paciente. Por favor, intente de nuevo.');
    }
}

function mostrarInformacionPaciente(paciente) {
    const datosPacienteElement = document.getElementById('datos-paciente');
    if (!datosPacienteElement) {
        console.error('Elemento datos-paciente no encontrado en el DOM');
        return;
    }

    datosPacienteElement.innerHTML = `
        <h3>Información de la Cita</h3>
        <p><strong>Fecha:</strong> ${new Date(paciente.fecha).toLocaleDateString()}</p>
        <p><strong>Hora:</strong> ${paciente.hora}</p>
        <p><strong>Especialidad:</strong> ${paciente.nombre_especialidad}</p>
        <p><strong>Médico:</strong> ${paciente.nombre_medico} ${paciente.apellido_medico}</p>
        <p><strong>Motivo:</strong> ${paciente.motivo}</p>
        <p><strong>Estado:</strong> ${paciente.estado}</p>

        <h3>Información del Paciente</h3>
        <p><strong>Nombre:</strong> ${paciente.nombre_paciente} ${paciente.apellido_paciente}</p>
        <p><strong>CI:</strong> ${paciente.ci}</p>
        <p><strong>Fecha de Nacimiento:</strong> ${new Date(paciente.fechanacimiento).toLocaleDateString()}</p>
        <p><strong>Edad:</strong> ${paciente.edad} años</p>
        <p><strong>Género:</strong> <span id="genero-paciente">${paciente.genero || 'No especificado'}</span></p>
        <p><strong>Tipo de Sangre:</strong> <span id="tipo-sangre-paciente">${paciente.tipo_sangre || 'No especificado'}</span></p>
        <p><strong>Alergias:</strong> <span id="alergias-paciente">${paciente.alergias || 'Ninguna'}</span></p>
        <p><strong>Detalle de Alergia:</strong> <span id="detalle-alergia-paciente">${paciente.detalle_alergia || 'No especificado'}</span></p>
    `;

    document.getElementById('id_paciente').value = paciente.id_paciente;
    console.log('Información del paciente cargada en el DOM');

    if (!paciente.genero || !paciente.tipo_sangre || !paciente.alergias) {
        mostrarModalActualizarPaciente();
    }
    cargarHistorialDiagnosticos(paciente.id_paciente);
}

function toggleDetalleAlergia() {
    const alergias = document.getElementById('alergias');
    const detalleAlergia = document.getElementById('detalle_alergia');
    const detalleAlergiaContainer = document.getElementById('detalle_alergia_container');

    if (alergias.value === 'Ninguna') {
        detalleAlergiaContainer.style.display = 'none';
        detalleAlergia.value = '';
    } else {
        detalleAlergiaContainer.style.display = 'block';
    }
}function mostrarModalActualizarPaciente() {
    const modal = document.getElementById('modalActualizarPaciente');
    modal.style.display = 'block';

    // Cargar los datos actuales del paciente en el formulario
    document.getElementById('genero').value = document.getElementById('genero-paciente').textContent;
    
    const tipoSangreActual = document.getElementById('tipo-sangre-paciente').textContent;
    const selectTipoSangre = document.getElementById('tipo_sangre');
    if (tipoSangreActual !== 'No especificado') {
        selectTipoSangre.value = tipoSangreActual;
    }

    const alergiasPaciente = document.getElementById('alergias-paciente').textContent;
    const detalleAlergia = document.getElementById('detalle-alergia-paciente').textContent;
    
    document.getElementById('alergias').value = alergiasPaciente !== 'Ninguna' ? alergiasPaciente : 'Ninguna';
    document.getElementById('detalle_alergia').value = detalleAlergia !== 'No especificado' ? detalleAlergia : '';
    
    toggleDetalleAlergia();
}

function cerrarModal() {
    document.getElementById('modalActualizarPaciente').style.display = 'none';
}

async function actualizarDatosPaciente(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const datos = Object.fromEntries(formData);
    
    if (datos.alergias === 'Ninguna') {
        datos.detalle_alergia = '';
    }

    const idPaciente = document.getElementById('id_paciente').value;

    try {
        const response = await fetch(`/api/paciente/${idPaciente}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        alert(result.message);
        cerrarModal();
        cargarInformacionPaciente(document.getElementById('id_cita').value);
    } catch (error) {
        console.error('Error al actualizar datos del paciente:', error);
        alert('Error al actualizar los datos del paciente');
    }
}

async function cargarEnfermedades() {
    try {
        const response = await fetch('/api/enfermedades', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener enfermedades');
        const enfermedades = await response.json();
        const selectEnfermedad = document.getElementById('enfermedad');
        selectEnfermedad.innerHTML = '<option value="">Seleccione una enfermedad</option>';
        enfermedades.forEach(enfermedad => {
            const option = document.createElement('option');
            option.value = enfermedad.id_enfermedad;
            option.textContent = enfermedad.nombre;
            option.dataset.codigo = enfermedad.codigo;
            option.dataset.sistema = enfermedad.sistema_afectado;
            option.dataset.descripcion = enfermedad.descripcion;
            selectEnfermedad.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar enfermedades:', error);
        alert('Error al cargar la lista de enfermedades');
    }
}

function mostrarDetallesEnfermedad() {
    const select = document.getElementById('enfermedad');
    const selectedOption = select.options[select.selectedIndex];
    const detalles = document.getElementById('enfermedad-detalles');
    
    if (select.value) {
        document.getElementById('enfermedad-codigo').textContent = selectedOption.dataset.codigo;
        document.getElementById('enfermedad-sistema').textContent = selectedOption.dataset.sistema;
        document.getElementById('enfermedad-descripcion').textContent = selectedOption.dataset.descripcion;
        detalles.style.display = 'block';
    } else {
        detalles.style.display = 'none';
    }
}

async function cargarGeneros() {
    try {
        const response = await fetch('/generos', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener géneros');
        const generos = await response.json();
        
        const selectGenero = document.getElementById('genero');
        selectGenero.innerHTML = generos.map(genero => `<option value="${genero}">${genero}</option>`).join('');
    } catch (error) {
        console.error('Error al cargar géneros:', error);
    }
}
async function cargarTiposSangre() {
    try {
        const response = await fetch('/tipos-sangre', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener tipos de sangre');
        const tiposSangre = await response.json();
        
        const selectTipoSangre = document.getElementById('tipo_sangre');
        selectTipoSangre.innerHTML = tiposSangre.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('');
    } catch (error) {
        console.error('Error al cargar tipos de sangre:', error);
    }
}

async function cargarTiposAlergia() {
    try {
        const response = await fetch('/tipos-alergia', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener tipos de alergia');
        const tiposAlergia = await response.json();
        
        const selectAlergia = document.getElementById('alergias');
        selectAlergia.innerHTML = tiposAlergia.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('');
    } catch (error) {
        console.error('Error al cargar tipos de alergia:', error);
    }
}

async function guardarDiagnostico(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const diagnosticoData = Object.fromEntries(formData);
    
    try {
        // Guardar el diagnóstico
        const responseDiagnostico = await fetch('/diagnosticos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(diagnosticoData),
            credentials: 'include'
        });
        if (!responseDiagnostico.ok) throw new Error('Error al guardar el diagnóstico');
        
        // Actualizar el estado de la cita a "Completada"
        const idCita = document.getElementById('id_cita').value;
        const responseEstado = await fetch(`/citas/${idCita}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: 'Completada' }),
            credentials: 'include'
        });
        if (!responseEstado.ok) throw new Error('Error al actualizar el estado de la cita');

        alert('Diagnóstico guardado y cita completada con éxito');
       
        window.location.reload();
        
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el diagnóstico o actualizar la cita');
    }
}

async function cancelarCita() {
    const idCita = document.getElementById('id_cita').value;
    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
        try {
            const response = await fetch(`/citas/${idCita}/cancelar`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Error al cancelar la cita');
            
            alert('Cita cancelada con éxito');
            window.location.reload();
            //window.location.href = '/dashboard-medico'; // O la ruta que corresponda
        } catch (error) {
            console.error('Error al cancelar la cita:', error);
            alert('Error al cancelar la cita');
        }
    }
}

function cargarContenidoInicial() {
    cargarContenido('gestion-citas');
}

document.getElementById('btn-cancelar-cita').addEventListener('click', cancelarCita);


async function cargarHistorialDiagnosticos(idPaciente) {
    if (!idPaciente) {
        console.error('No se proporcionó un ID de paciente válido');
        return;
    }
    try {
        let url = `/diagnosticos/paciente/${idPaciente}`;
        console.log('URL de la petición para diagnósticos:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const diagnosticos = await response.json();
        mostrarHistorialDiagnosticos(diagnosticos);
    } catch (error) {
        /*console.error('Error al cargar historial de diagnósticos:', error);
        alert('Error al cargar el historial de diagnósticos. Por favor, intente de nuevo.');*/
    }
}

function mostrarHistorialDiagnosticos(diagnosticos) {
    const tablaDiagnosticos = document.getElementById('cuerpo-tabla-diagnosticos');
    if (!tablaDiagnosticos) {
        console.error('Elemento cuerpo-tabla-diagnosticos no encontrado en el DOM');
        return;
    }

    tablaDiagnosticos.innerHTML = '';

    if (diagnosticos.length === 0) {
        tablaDiagnosticos.innerHTML = '<tr><td colspan="9">No hay diagnósticos registrados para este paciente.</td></tr>';
        return;
    }

    diagnosticos.forEach(diag => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${new Date(diag.fecha_cita).toLocaleDateString()}</td>
            <td>${diag.hora}</td>
            <td>${diag.nombre_medico} ${diag.apellido_medico}</td>
            <td>${diag.nombre_especialidad}</td>
            <td>${diag.peso} kg</td>
            <td>${diag.talla} cm</td>
            <td>${diag.diagnostico}</td>
            <td>${diag.receta}</td>
            <td>${diag.nombre_enfermedad || 'No especificada'}</td>
        `;
        tablaDiagnosticos.appendChild(fila);
    });

    console.log('Historial de diagnósticos cargado en el DOM');
}

cargarGeneros()
cargarTiposSangre();
cargarTiposAlergia();
// Exponer la función de inicialización globalmente
window.inicializarDashboardPaciente = inicializarDashboardPaciente;




