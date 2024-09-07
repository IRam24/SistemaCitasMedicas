document.addEventListener('DOMContentLoaded', function() {
    cargarCitasMedico();
    setupEventListeners();
});

function setupEventListeners() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function(event) {
            event.preventDefault(); // Prevenir el comportamiento por defecto del botón
            cargarCitasMedico();
        });
    }

    // Agregar evento de cambio al select de filtro
    const selectFiltro = document.getElementById('estado-filtro');
    if (selectFiltro) {
        selectFiltro.addEventListener('change', cargarCitasMedico);
    }
}

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
            <td>${cita.nombre}</td>
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
            const idCita = this.getAttribute('data-id-cita');
            if (typeof window.cargarDashboardPaciente === 'function') {
                window.cargarDashboardPaciente(idCita);
            } else {
                console.error('La función cargarDashboardPaciente no está disponible');
                alert('Error al cargar el dashboard del paciente. Por favor, intente de nuevo.');
            }
        });
    });
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
}


document.addEventListener('DOMContentLoaded', setupEventListeners);
setupEventListeners();
cargarCitasMedico();

