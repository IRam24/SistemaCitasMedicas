// gestion-estadisticas.js
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no se ha cargado correctamente');
        document.querySelector('.estadisticas-container').innerHTML = '<p>Error: No se pudo cargar la biblioteca de gráficos</p>';
        return;
    }
    cargarEstadisticas();
});
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/estadisticas/dashboard');
        const data = await response.json();
        console.log('Datos recibidos:', data); // Agregar esta línea

        if (!data || Object.keys(data).length === 0) {
            throw new Error('No se recibieron datos');
        }

        crearGraficoPie('usuariosChart', data.usuarios, 'Distribución de Usuarios por Rol');
        crearGraficoPie('citasChart', data.citas, 'Distribución de Citas por Estado');
        crearGraficoBarra('especialidadesChart', data.especialidades, 'Médicos por Especialidad');
        
        actualizarResumen(data);
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        document.querySelector('.estadisticas-container').innerHTML = '<p>Error al cargar las estadísticas. Por favor, intente de nuevo.</p>';
    }
}

function crearGraficoPie(canvasId, data, titulo) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.rol_nombre || item.estado || item.detalle_especialidad),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        }
    });
}

function crearGraficoBarra(canvasId, data, titulo) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.nombre),
            datasets: [{
                label: 'Número de Médicos',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 200, 0.8)',
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
                        text: 'Número de Médicos'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Especialidades'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        }
    });
}

function actualizarResumen(data) {
    const resumenContainer = document.getElementById('resumen-estadisticas');
    resumenContainer.innerHTML = '';

    // Resumen de usuarios
    const totalUsuarios = data.usuarios.reduce((sum, item) => sum + item.count, 0);
    let usuariosHTML = `<h3>Resumen de Usuarios</h3><ul>`;
    data.usuarios.forEach(item => {
        const porcentaje = ((item.count / totalUsuarios) * 100).toFixed(2);
        usuariosHTML += `<li>${item.rol_nombre}: ${item.count} (${porcentaje}%)</li>`;
    });
    usuariosHTML += `<li><strong>Total de usuarios: ${totalUsuarios}</strong></li></ul>`;

    // Resumen de citas
    const totalCitas = data.citas.reduce((sum, item) => sum + item.count, 0);
    let citasHTML = `<h3>Resumen de Citas</h3><ul>`;
    data.citas.forEach(item => {
        const porcentaje = ((item.count / totalCitas) * 100).toFixed(2);
        citasHTML += `<li>${item.estado}: ${item.count} (${porcentaje}%)</li>`;
    });
    citasHTML += `<li><strong>Total de citas: ${totalCitas}</strong></li></ul>`;

    // Resumen de especialidades
    const totalMedicos = data.especialidades.reduce((sum, item) => sum + item.count, 0);
    let especialidadesHTML = `<h3>Resumen de Especialidades</h3><ul>`;
    data.especialidades.forEach(item => {
        const porcentaje = ((item.count / totalMedicos) * 100).toFixed(2);
        especialidadesHTML += `<li>${item.nombre}: ${item.count} médicos (${porcentaje}%)</li>`;
    });
    especialidadesHTML += `<li><strong>Total de médicos: ${totalMedicos}</strong></li></ul>`;

    resumenContainer.innerHTML = usuariosHTML + citasHTML + especialidadesHTML;
}

document.addEventListener('DOMContentLoaded', setupEventListeners);
cargarEstadisticas();