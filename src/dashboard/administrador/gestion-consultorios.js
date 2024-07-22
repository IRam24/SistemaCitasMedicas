document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    cargarConsultorios();
    setupEventListeners();
    cargarMedicos(); 
});

function setupEventListeners() {
    console.log('Configurando event listeners');

    const btnNuevoConsultorio = document.getElementById('btnNuevoConsultorio');
    if (btnNuevoConsultorio) {
        btnNuevoConsultorio.addEventListener('click', mostrarFormularioConsultorio);
        console.log('Event listener añadido a btnNuevoConsultorio');
    } else {
        console.error('Botón Nuevo Consultorio no encontrado');
    }
    
    const formConsultorio = document.getElementById('formConsultorio');
    if (formConsultorio) {
        formConsultorio.removeEventListener('submit', crearOActualizarConsultorio); // Elimina listener existente si lo hay
        formConsultorio.addEventListener('submit', crearOActualizarConsultorio);
        console.log('Event listener añadido a formConsultorio');
    } else {
        console.error('Formulario de consultorio no encontrado');
    }
    
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarFormularioConsultorio);
        console.log('Event listener añadido a btnCancelar');
    } else {
        console.error('Botón Cancelar no encontrado');
    }

    const formAsignacion = document.getElementById('formAsignacion');
    if (formAsignacion) {
        formAsignacion.addEventListener('submit', asignarMedico);
        console.log('Event listener añadido a formAsignacion');
    } else {
        console.error('Formulario de asignación no encontrado');
    }

    const btnCancelarAsignacion = document.getElementById('btnCancelarAsignacion');
    if (btnCancelarAsignacion) {
        btnCancelarAsignacion.addEventListener('click', ocultarModalAsignacion);
        console.log('Event listener añadido a btnCancelarAsignacion');
    } else {
        console.error('Botón Cancelar Asignación no encontrado');
    }

    const filtroDisponibilidad = document.getElementById('filtroDisponibilidad');
    if (filtroDisponibilidad) {
        filtroDisponibilidad.addEventListener('change', cargarConsultorios);
        console.log('Event listener añadido a filtroDisponibilidad');
    } else {
        console.error('Selector de filtro de disponibilidad no encontrado');
    }

    const tablaConsultorios = document.querySelector('#tablaConsultorios tbody');
    if (tablaConsultorios) {
        tablaConsultorios.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-editar')) {
                const idConsultorio = e.target.getAttribute('data-id');
                editarConsultorio(idConsultorio);
            } else if (e.target.classList.contains('btn-asignar')) {
                const idConsultorio = e.target.getAttribute('data-id');
                mostrarModalAsignacion(idConsultorio);
            } else if (e.target.classList.contains('btn-liberar')) {
                const idConsultorio = e.target.getAttribute('data-id');
                liberarConsultorio(idConsultorio);
            } else if (e.target.classList.contains('btn-eliminar')) {
                const idConsultorio = e.target.getAttribute('data-id');
                eliminarConsultorio(idConsultorio);
            }
        });
        console.log('Event listener añadido a la tabla de consultorios');
    } else {
        console.error('Tabla de consultorios no encontrada');
    }
}

function mostrarFormularioConsultorio() {
    console.log('Mostrando formulario de nuevo consultorio');
    document.getElementById('formularioTitulo').textContent = 'Nuevo Consultorio';
    limpiarFormulario();
    const formularioConsultorio = document.getElementById('formularioConsultorio');
    if (formularioConsultorio) {
        formularioConsultorio.style.display = 'block';
        console.log('Formulario mostrado');
    } else {
        console.error('Elemento formularioConsultorio no encontrado');
    }
}

function cargarConsultorios() {
    fetch('/api/consultorios')
        .then(response => response.json())
        .then(consultorios => {
            const filtroDisponibilidad = document.getElementById('filtroDisponibilidad').value;
            const consultoriosFiltrados = filtroDisponibilidad === 'todos' 
                ? consultorios 
                : consultorios.filter(c => c.estado === filtroDisponibilidad);

            const consultoriosOrdenados = ordenarConsultorios(consultoriosFiltrados);
            mostrarConsultorios(consultoriosOrdenados);
        })
        .catch(error => console.error('Error al cargar consultorios:', error));
}

function mostrarConsultorios(consultorios) {
    const tbody = document.querySelector('#tablaConsultorios tbody');
    tbody.innerHTML = '';
    consultorios.forEach(consultorio => {
        const fechaFormateada = consultorio.fecha_asignacion ? new Date(consultorio.fecha_asignacion).toLocaleDateString() : 'N/A';
        tbody.innerHTML += `
            <tr>
                <td>${consultorio.codigo}</td>
                <td>${consultorio.descripcion || ''}</td>
                <td>${consultorio.estado}</td>
                <td>${consultorio.nombre_medico ? `${consultorio.nombre_medico} ${consultorio.apellido_medico}` : 'No asignado'}</td>
                <td>${fechaFormateada}</td>
                <td>
                    <button class="btn btn-editar" data-id="${consultorio.id_consultorio}">Editar</button>
                    ${consultorio.estado === 'disponible' 
                        ? `<button class="btn btn-asignar" data-id="${consultorio.id_consultorio}">Asignar</button>`
                        : `<button class="btn btn-liberar" data-id="${consultorio.id_consultorio}">Liberar</button>`
                    }
                    <button class="btn btn-eliminar" data-id="${consultorio.id_consultorio}">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function ordenarConsultorios(consultorios) {
    return consultorios.sort((a, b) => {
        if (a.estado === 'disponible' && b.estado !== 'disponible') return -1;
        if (a.estado !== 'disponible' && b.estado === 'disponible') return 1;
        return a.codigo.localeCompare(b.codigo);
    });
}

function ocultarFormularioConsultorio() {
    document.getElementById('formularioConsultorio').style.display = 'none';
}

function mostrarModalAsignacion(idConsultorio) {
    document.getElementById('asignacion_id_consultorio').value = idConsultorio;
    document.getElementById('modalAsignacion').style.display = 'block';
    cargarMedicos();
}

function ocultarModalAsignacion() {
    document.getElementById('modalAsignacion').style.display = 'none';
}

document.getElementById('btnCancelar').addEventListener('click', function() {
    console.log('Botón cancelar clickeado');
    document.getElementById('formularioConsultorio').style.display = 'none';
});

async function crearOActualizarConsultorio(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const consultorioData = Object.fromEntries(formData);
    const url = consultorioData.id_consultorio ? `/api/consultorios/${consultorioData.id_consultorio}` : '/api/consultorios';
    const method = consultorioData.id_consultorio ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consultorioData)
        });
        const result = await response.json();
        if (result.success) {
            alert(consultorioData.id_consultorio ? 'Consultorio actualizado con éxito' : `Consultorio creado con éxito. Código: ${result.codigo}`);
            cargarConsultorios();
            ocultarFormularioConsultorio();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al procesar el consultorio:', error);
        alert('Error al procesar el consultorio');
    }
}

function editarConsultorio(idConsultorio) {
    fetch(`/api/consultorios/${idConsultorio}`)
        .then(response => response.json())
        .then(consultorio => {
            document.getElementById('id_consultorio').value = consultorio.id_consultorio;
            document.getElementById('codigo').value = consultorio.codigo;
            document.getElementById('descripcion').value = consultorio.descripcion;
            document.getElementById('formularioTitulo').textContent = 'Editar Consultorio';
            document.getElementById('formularioConsultorio').style.display = 'block';
        })
        .catch(error => console.error('Error al cargar datos del consultorio:', error));
}

function eliminarConsultorio(idConsultorio) {
    if (confirm('¿Está seguro de que desea eliminar este consultorio?')) {
        fetch(`/api/consultorios/${idConsultorio}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Consultorio eliminado con éxito');
                    cargarConsultorios();
                } else {
                    alert('Error al eliminar consultorio: ' + result.message);
                }
            })
            .catch(error => console.error('Error al eliminar consultorio:', error));
    }
}

async function asignarMedico(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const asignacionData = Object.fromEntries(formData);

    try {
        const response = await fetch(`/api/consultorios/${asignacionData.id_consultorio}/asignar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(asignacionData)
        });
        const result = await response.json();
        if (result.success) {
            alert('Médico asignado con éxito');
            cargarConsultorios();
            ocultarModalAsignacion();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al asignar médico:', error);
        alert('Error al asignar médico');
    }
}

function cargarMedicos() {
    fetch('/api/medicos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(medicos => {
            const selectMedico = document.getElementById('id_usuario');
            selectMedico.innerHTML = '<option value="">Seleccionar médico</option>';
            medicos.forEach(medico => {
                const option = document.createElement('option');
                option.value = medico.id_usuario;
                option.textContent = `${medico.nombre} ${medico.apellido}`;
                selectMedico.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar médicos:', error);
            alert('Error al cargar la lista de médicos');
        });
}

function liberarConsultorio(idConsultorio) {
    if (confirm('¿Está seguro de que desea liberar este consultorio?')) {
        fetch(`/api/consultorios/${idConsultorio}/liberar`, {
            method: 'POST',
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Consultorio liberado con éxito');
                cargarConsultorios();
            } else {
                alert('Error al liberar consultorio: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error al liberar consultorio:', error);
            alert('Error al liberar consultorio');
        });
    }
}

function limpiarFormulario() {
    document.getElementById('formConsultorio').reset();
    document.getElementById('id_consultorio').value = '';
}
setupEventListeners();
document.addEventListener('DOMContentLoaded', setupEventListeners);