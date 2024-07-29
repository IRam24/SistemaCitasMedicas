document.addEventListener('DOMContentLoaded', function() {
    //document.getElementById('formDiagnostico').addEventListener('submit', registrarDiagnostico);
    cargarCitasMedico();
    setupEventListeners();
});

function setupEventListeners() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', cargarCitasMedico);
    }

    const formDiagnostico = document.getElementById('formDiagnostico');
    if (formDiagnostico) {
        formDiagnostico.addEventListener('submit', registrarDiagnostico);
    }

    const btnRegresar = document.getElementById('btnRegresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', cerrarModalDiagnostico);
    }

    const btnCancelarCita = document.getElementById('btnCancelarCita');
    if (btnCancelarCita) {
        btnCancelarCita.addEventListener('click', cancelarCita);
    }
}

document.querySelectorAll('.btn-dar-cita').forEach(button => {
    button.addEventListener('click', function() {
        const idCita = this.getAttribute('data-id-cita');
        abrirModalDiagnostico(idCita);
    });
  });

async function cargarCitasMedico() {
    const estadoFiltro = document.getElementById('estado-filtro').value;
    
    try {
        let url = '/api/medico-citas';
        if (estadoFiltro) {
            url += `?estado=${estadoFiltro}`;
        }

        console.log('URL de la petición:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const citas = await response.json();
        mostrarCitasEnTabla(citas);
    } catch (error) {
        console.error('Error al cargar citas:', error);
        alert('Error al cargar las citas. Por favor, intente de nuevo.');
    }
}

function mostrarCitasEnTabla(citas) {
    const tablaCitas = document.getElementById('cuerpo-tabla-citas');
    if (!tablaCitas) {
        console.error('Elemento cuerpo-tabla-citas no encontrado');
        return;
    }

    tablaCitas.innerHTML = '';

    if (citas.length === 0) {
        tablaCitas.innerHTML = '<tr><td colspan="7">No hay citas que coincidan con el filtro.</td></tr>';
        return;
    }

    citas.forEach(cita => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${formatearFecha(cita.fecha)}</td>
            <td>${cita.hora}</td>
            <td>${cita.nombre_paciente} ${cita.apellido_paciente}</td>
            <td>${cita.detalle_especialidad}</td>
            <td>${cita.motivo}</td>
            <td>${cita.estado}</td>
            <td>
            ${cita.estado === 'programada' ? 
                `<button class="btn btn-primary btn-dar-cita" data-id-cita="${cita.id_cita}">Dar Cita</button>` :
                    '-'
                }
            </td>
        `;
        tablaCitas.appendChild(fila);
    });

    // Añadir event listeners a los botones "Dar Cita"
    document.querySelectorAll('.btn-dar-cita').forEach(button => {
        button.addEventListener('click', function() {
            abrirModalDiagnostico(this.getAttribute('data-id-cita'));
        });
    });
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
}

function abrirModalDiagnostico(idCita) {
    document.getElementById('cita-id').value = idCita;
    document.getElementById('modalDiagnostico').style.display = 'block';
}

function cerrarModalDiagnostico() {
    document.getElementById('modalDiagnostico').style.display = 'none';
}

async function cancelarCita() {
    const idCita = document.getElementById('cita-id').value;
    if (!confirm('¿Está seguro de que desea cancelar esta cita?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/citas/${idCita}/cancelar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error al cancelar la cita');
        }

        alert('Cita cancelada con éxito');
        cerrarModalDiagnostico();
        cargarCitasMedico(); // Recargar la lista de citas
    } catch (error) {
        console.error('Error al cancelar la cita:', error);
        alert('Error al cancelar la cita. Por favor, intente de nuevo.');
    }
}

async function registrarDiagnostico(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const diagnosticoData = Object.fromEntries(formData);
    /*{
        id_cita: formData.get('id_cita'),
        sintomas: formData.get('sintomas'),
        diagnostico: formData.get('diagnostico'),
        tratamiento: formData.get('tratamiento'),
        observaciones: formData.get('observaciones')
    };*/

    console.log('Datos del diagnóstico a enviar:', diagnosticoData);

    try {
        const response = await fetch('/api/diagnosticos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(diagnosticoData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el diagnóstico');
        }

        alert('Diagnóstico guardado con éxito');
        ocultarModalDiagnostico();
        cargarCitasMedico(); // Recargar las citas
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el diagnóstico');
    }
}

function ocultarModalDiagnostico() {
    document.getElementById('modalDiagnostico').style.display = 'none';
}

// Asegúrate de llamar a setupEventListeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', setupEventListeners);
    cargarCitasMedico();
    setupEventListeners();