document.addEventListener('DOMContentLoaded', function() {
    cargarInfoUsuario();
    setupMenuListeners();
    cargarContenidoInicial();
    //cargarHistorialCitas();

});

function cargarInfoUsuario() {
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    document.getElementById('nombreUsuario').textContent = `Bienvenido, ${userName}`;
}

function setupMenuListeners() {
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', function() {
            cargarContenido(this.dataset.content);
        });
    });
}

function cargarContenidoInicial() {
    cargarContenido('agendar');
}

async function cargarContenido(seccion) {
    const contenido = document.getElementById('contenido-principal');
    contenido.innerHTML = '<p>Cargando...</p>';

    try {
        let html;
        switch(seccion) {
            case 'agendar':
                html = await fetch('/views/citas/agendar-cita.html').then(res => res.text());
                contenido.innerHTML = html;
                inicializarAgendarCita();
                break;
            case 'historial':
                html = await fetch('/views/citas/historial-citas.html').then(res => res.text());
                contenido.innerHTML = html;
                cargarHistorialCitas();
                break;
            case 'especialidades':
                html = await fetch('/views/especialidades/lista-especialidades.html').then(res => res.text());
                contenido.innerHTML = html;
                cargarListaEspecialidades();
                break;
            default:
                contenido.innerHTML = '<p>Sección no encontrada</p>';
        }
    } catch (error) {
        console.error('Error al cargar contenido:', error);
        contenido.innerHTML = '<p>Error al cargar el contenido. Por favor, intente de nuevo.</p>';
    }
}

function inicializarAgendarCita() {
    cargarEspecialidades();
    document.getElementById('formAgendarCita').addEventListener('submit', agendarCita);
    document.getElementById('especialidad').addEventListener('change', cargarMedicos);
    document.getElementById('medico').addEventListener('change', cargarHorariosDisponibles);
    document.getElementById('fecha').addEventListener('change', cargarHorariosDisponibles);
}

async function cargarEspecialidades() {
    try {
        const especialidades = await fetch('/api/especialidades').then(res => res.json());
        const select = document.getElementById('especialidad');
        select.innerHTML = '<option value="">Seleccione especialidad</option>';
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id_especialidad;
            option.textContent = esp.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
    }
}

async function cargarMedicos() {
    const especialidadId = document.getElementById('especialidad').value;
    const medicoSelect = document.getElementById('medico');
    medicoSelect.innerHTML = '<option value="">Seleccione médico</option>';
    if (!especialidadId) return;

    try {
        const medicos = await fetch(`/api/medicos-por-especialidad/${especialidadId}`).then(res => res.json());
        medicos.forEach(medico => {
            const option = document.createElement('option');
            option.value = medico.id_usuario;
            option.textContent = `${medico.nombre} ${medico.apellido}`;
            medicoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

async function cargarHorariosDisponibles() {
    const medicoId = document.getElementById('medico').value;
    const fecha = document.getElementById('fecha').value;
    const horaSelect = document.getElementById('hora');
    horaSelect.innerHTML = '<option value="">Seleccione hora</option>';
    
    if (!medicoId || !fecha) return;

    try {
        const horarios = await fetch(`/api/horarios-disponibles?id_medico=${medicoId}&fecha=${fecha}`).then(res => res.json());
        horarios.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            horaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar horarios disponibles:', error);
    }
}

async function agendarCita(event) {
    event.preventDefault();
    const userId = localStorage.getItem('userId');
    console.log('ID de usuario obtenido del localStorage:', userId);

    if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('ID de usuario no válido:', userId);
        alert('No se ha encontrado un ID de usuario válido. Por favor, inicie sesión nuevamente.');
        window.location.href = '/login';
        return;
    }

    const formData = new FormData(event.target);
    const citaData = Object.fromEntries(formData);

    citaData.id_usuario = userId;
    console.log('Datos de la cita a enviar:', citaData);

    try {
        const response = await fetch('/api/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(citaData)
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        const result = await response.json();
        console.log('Resultado de la petición:', result);

        if (result.success) {
            alert('Cita agendada con éxito');
            // Aquí puedes redirigir o actualizar la interfaz
        } else {
            console.error('Error al agendar cita:', result.message);
            alert('Error al agendar cita: ' + result.message);
        }
    } catch (error) {
        console.error('Error al agendar cita:', error);
        alert('Error al agendar cita: ' + error.message);
    }
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

async function cargarHistorialCitas() {
    try {
        const id_paciente = localStorage.getItem('userId');
        const citas = await fetch(`/api/paciente-citas?id_usuario=${id_paciente}`).then(res => res.json());
        
        const tablaCitas = document.getElementById('lista-citas');
        if (!tablaCitas) {
            console.error('Elemento lista-citas no encontrado');
            return;
        }
        tablaCitas.innerHTML = ''; // Limpiar la tabla antes de cargar nuevas citas

        if (citas.length === 0) {
            tablaCitas.innerHTML = '<tr><td colspan="6">No hay citas programadas.</td></tr>';
            return;
        }

        citas.forEach(cita => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${cita.hora}</td>
                <td>${cita.detalle_especialidad}</td>
                <td>Dr/a. ${cita.nombre_medico} ${cita.apellido_medico}</td>
                <td>${cita.estado}</td>
                <td>
                    <button class="btn-editar" data-id="${cita.id_cita}">Editar</button>
                    <button class="btn-eliminar" data-id="${cita.id_cita}">Eliminar</button>
                </td>
            `;
            tablaCitas.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar historial de citas:', error);
        const tablaCitas = document.getElementById('lista-citas');
        if (tablaCitas) {
            tablaCitas.innerHTML = '<tr><td colspan="6">Error al cargar el historial de citas.</td></tr>';
        }
    }
}

function agregarEventListeners() {
    const botonesEditar = document.querySelectorAll('.btn-editar');
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');

    botonesEditar.forEach(boton => {
        boton.addEventListener('click', function() {
            const idCita = this.getAttribute('data-id');
            editarCita(idCita);
        });
    });

    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', function() {
            const idCita = this.getAttribute('data-id');
            eliminarCita(idCita);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Para el formulario de editar cita
    const formEditarCita = document.getElementById('formEditarCita');
    if (formEditarCita) {
        formEditarCita.addEventListener('submit', actualizarCita);
    } else {
        console.error('Formulario de editar cita no encontrado');
    }

    // Para cerrar el modal
    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', cerrarModal);
    } else {
        console.error('Botón de cerrar modal no encontrado');
    }

    // Agregar event listeners a los botones de editar y eliminar
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-editar')) {
            const idCita = event.target.getAttribute('data-id');
            editarCita(idCita);
        } else if (event.target.classList.contains('btn-eliminar')) {
            const idCita = event.target.getAttribute('data-id');
            eliminarCita(idCita);
        }
    });
});

function editarCita(idCita) {
    fetch(`/api/citas/${idCita}`)
        .then(res => res.json())
        .then(cita => {
            const modal = document.getElementById('editarCitaModal');
            if (modal) {
                document.getElementById('editCitaId').value = cita.id_cita;
                document.getElementById('editFecha').value = cita.fecha.split('T')[0]; // Formato YYYY-MM-DD
                document.getElementById('editMotivo').value = cita.motivo;
                modal.style.display = 'block';

                // Cargar horarios disponibles
                cargarHorariosDisponiblesParaEdicion(cita.id_medico, cita.fecha.split('T')[0], cita.hora);

                // Configurar el evento de cierre del modal aquí
                const closeButton = modal.querySelector('.close');
                if (closeButton) {
                    closeButton.onclick = cerrarModal;
                }

                // Configurar el evento de envío del formulario aquí
                const formEditarCita = document.getElementById('formEditarCita');
                if (formEditarCita) {
                    formEditarCita.onsubmit = actualizarCita;
                }
            } else {
                console.error('Modal de editar cita no encontrado');
            }
        })
        .catch(error => console.error('Error al obtener datos de la cita:', error));
}

function cerrarModal() {
    const modal = document.getElementById('editarCitaModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function cargarHorariosDisponiblesParaEdicion(idMedico, fecha, horaActual) {
    const horaSelect = document.getElementById('editHora');
    horaSelect.innerHTML = '<option value="">Seleccione hora</option>';
    
    try {
        const response = await fetch(`/api/horarios-disponibles?id_medico=${idMedico}&fecha=${fecha}`);
        const horarios = await response.json();
        
        horarios.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            if (hora === horaActual) {
                option.selected = true;
            }
            horaSelect.appendChild(option);
        });

        if (horaActual && !horarios.includes(horaActual)) {
            const optionActual = document.createElement('option');
            optionActual.value = horaActual;
            optionActual.textContent = horaActual + " (hora actual)";
            optionActual.selected = true;
            horaSelect.appendChild(optionActual);
        }
    } catch (error) {
        console.error('Error al cargar horarios disponibles:', error);
        horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
    }
}

async function actualizarCita(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const citaData = Object.fromEntries(formData);

    try {
        const response = await fetch(`/api/citas/${citaData.id_cita}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(citaData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Cita actualizada con éxito');
            cerrarModal();
            cargarHistorialCitas(); // Recargar el historial
        } else {
            alert('Error al actualizar cita: ' + result.message);
        }
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        alert('Error al actualizar cita');
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
                cargarHistorialCitas(); // Recargar el historial
            } else {
                alert('Error al eliminar cita: ' + result.message);
            }
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            alert('Error al eliminar cita');
        }
    }
}

function cerrarModal() {
    document.getElementById('editarCitaModal').style.display = 'none';
}

async function cargarListaEspecialidades() {
    try {
        const especialidades = await fetch('/api/especialidades').then(res => res.json());
        const listaEspecialidades = especialidades.map(esp => `
            <li>${esp.detalle_especialidad}</li>
        `).join('');
        document.getElementById('lista-especialidades').innerHTML = `
            <ul>${listaEspecialidades}</ul>
        `;
    } catch (error) {
        console.error('Error al cargar lista de especialidades:', error);
        document.getElementById('lista-especialidades').innerHTML = '<p>Error al cargar la lista de especialidades.</p>';
    }
}