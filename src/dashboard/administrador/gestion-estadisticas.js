
document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticas();
    setupEventListeners();
});
//import Chart from 'chart.js/auto';

function setupEventListeners() {
    const btnFiltrar = document.getElementById('btn-aplicar-filtro');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', cargarEstadisticas);
    }
}

async function cargarEstadisticas() {
    const estadoFiltro = document.getElementById('estado-filtro').value;
    
    try {
        let url = '/api/diagnosticos-estadisticas';
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
        generarGraficoDiagnosticos(citas);
    }   catch (error) {
        console.error('Error al cargar estadísticas:', error);
        alert('cargar las estadísticas...continuar');
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
        tablaCitas.innerHTML = '<tr><td colspan="8">No hay citas que coincidan con el filtro.</td></tr>';
        return;
    }

    citas.forEach(cita => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${formatearFecha(cita.fecha)} ${cita.hora}</td>
            <td>${cita.nombre_paciente}</td>
            <td>${cita.nombre_medico}</td>
            <td>${cita.especialidad}</td>
            <td>${cita.motivo}</td>
            <td>${cita.estado}</td>
            <td>${cita.diagnostico || 'N/A'}</td>
            <td>${cita.tratamiento || 'N/A'}</td>
        `;
        tablaCitas.appendChild(fila);
    });
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
}

/*function cargarChartJs() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function inicializar() {
    try {
        await cargarChartJs();
        cargarEstadisticas();
        setupEventListeners();
    } catch (error) {
        console.error('Error al cargar Chart.js:', error);
    }
}*/

async function loadChartJs() {
    if (typeof Chart === 'undefined') {
        await import('https://cdn.jsdelivr.net/npm/chart.js');
    }
}

async function generarGraficoDiagnosticos(citas) {
    await loadChartJs();
    
    if (typeof Chart === 'undefined') {
        console.error('Chart is not defined. Make sure Chart.js is loaded properly.');
        return;
    }

    const ctx = document.getElementById('grafico-diagnosticos');
    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }

    const diagnosticosConteo = citas.reduce((acc, cita) => {
        if (cita.diagnostico) {
            acc[cita.diagnostico] = (acc[cita.diagnostico] || 0) + 1;
        } else if (cita.estado === 'programada') {
            acc['Pendiente'] = (acc['Pendiente'] || 0) + 1;
        } else if (cita.estado === 'cancelada') {
            acc['Cancelada'] = (acc['Cancelada'] || 0) + 1;
        }
        return acc;
    }, {});

    if (window.miGrafico instanceof Chart) {
        window.miGrafico.destroy();
    }

    window.miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(diagnosticosConteo),
            datasets: [{
                label: 'Frecuencia de Diagnósticos/Estados',
                data: Object.values(diagnosticosConteo),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de casos'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Diagnósticos/Estados'
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', setupEventListeners);
cargarEstadisticas();
setupEventListeners();