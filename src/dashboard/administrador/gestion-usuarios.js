document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired for gestion-usuarios');
    cargarUsuarios();
    setupEventListeners();
    cargarRoles();
    cargarEspecialidades();
});

function setupEventListeners() {
    console.log('Configurando event listeners');

    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', mostrarFormularioUsuario);
        console.log('Event listener añadido a btnNuevoUsuario');
    } else {
        console.error('Botón Nuevo Usuario no encontrado');
    }
    
    const formUsuario = document.getElementById('formUsuario');
    if (formUsuario) {
        formUsuario.removeEventListener('submit', crearOActualizarUsuario);
        formUsuario.addEventListener('submit', crearOActualizarUsuario);
        console.log('Event listener añadido a formUsuario');
    } else {
        console.error('Formulario de usuario no encontrado');
    }
    
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarFormularioUsuario);
        console.log('Event listener añadido a btnCancelar');
    } else {
        console.error('Botón Cancelar no encontrado');
    }

    const filtroUsuarios = document.getElementById('filtroUsuarios');
    if (filtroUsuarios) {
        filtroUsuarios.addEventListener('change', cargarUsuarios);
        console.log('Event listener añadido a filtroUsuarios');
    } else {
        console.error('Selector de filtro de usuarios no encontrado');
    }

    const tablaUsuarios = document.querySelector('#tablaUsuarios tbody');
    if (tablaUsuarios) {
        tablaUsuarios.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-editar')) {
                const idUsuario = e.target.getAttribute('data-id');
                editarUsuario(idUsuario);
            } else if (e.target.classList.contains('btn-eliminar')) {
                const idUsuario = e.target.getAttribute('data-id');
                eliminarUsuario(idUsuario);
            }
        });
        console.log('Event listener añadido a la tabla de usuarios');
    } else {
        console.error('Tabla de usuarios no encontrada');
    }

    const rolSelect = document.getElementById('rol');
    if (rolSelect) {
        rolSelect.addEventListener('change', toggleCamposMedico);
        console.log('Event listener añadido a rolSelect');
    } else {
        console.error('Selector de rol no encontrado');
    }
}

function mostrarFormularioUsuario() {
    console.log('Mostrando formulario de nuevo usuario');
    document.getElementById('formularioTitulo').textContent = 'Nuevo Usuario';
    limpiarFormulario();
    cargarRoles();
    document.getElementById('formUsuario').reset();
    document.getElementById('id_usuario').value = '';
    document.getElementById('formularioUsuario').style.display = 'block';
}

function cargarUsuarios() {
    console.log('Iniciando carga de usuarios');
    const filtroRol = document.getElementById('filtroUsuarios').value;
    
    fetch(`/api/users?filtro=${filtroRol}`)
        .then(response => {
            console.log('Respuesta de API recibida:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(usuarios => {
            console.log('Usuarios recibidos:', usuarios);
            mostrarUsuarios(usuarios);
        })
        .catch(error => {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar la lista de usuarios. Por favor, intente más tarde.');
        });
}

function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    if (!tbody) {
        console.error('Elemento tbody no encontrado');
        return;
    }
    tbody.innerHTML = '';
    usuarios.forEach(usuario => {
        const especialidad = usuario.especialidad || (usuario.rol === 'medico' ? 'Sin asignar' : 'N/A');
        tbody.innerHTML += `
            <tr>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.email}</td>
                <td>${usuario.rol}</td>
                <td>${especialidad}</td>
                <td>
                    <button class="btn btn-editar" data-id="${usuario.id_usuario}">Editar</button>
                    <button class="btn btn-eliminar" data-id="${usuario.id_usuario}">Eliminar</button>
                </td>
            </tr>
        `;
    });
    console.log(`${usuarios.length} usuarios mostrados en la tabla`);
}

function ocultarFormularioUsuario() {
    document.getElementById('formularioUsuario').style.display = 'none';
}

async function crearOActualizarUsuario(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const usuarioData = Object.fromEntries(formData);

    if (usuarioData.rol === 'medico') {
        const especialidadSelect = document.getElementById('especialidad');
        if (especialidadSelect) {
            usuarioData.id_especialidad = especialidadSelect.value;
            console.log('Especialidad seleccionada:', usuarioData.id_especialidad);
        } else {
            console.error('Elemento de selección de especialidad no encontrado');
            alert('Error: No se pudo seleccionar la especialidad');
            return;
        }

        if (!usuarioData.id_especialidad) {
            alert('Por favor, seleccione una especialidad para el médico');
            return;
        }
    }
    
    const url = usuarioData.id_usuario ? `/api/users/${usuarioData.id_usuario}` : '/api/users';
    const method = usuarioData.id_usuario ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            alert(usuarioData.id_usuario ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
            document.getElementById('formularioUsuario').style.display = 'none';
            cargarUsuarios();
            //ocultarFormularioUsuario();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al procesar el usuario:', error);
        alert('Error al procesar el usuario');
    }
}

function editarUsuario(idUsuario) {
    fetch(`/api/users/${idUsuario}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(usuario => {
            document.getElementById('id_usuario').value = usuario.id_usuario;
            document.getElementById('nombre').value = usuario.nombre;
            document.getElementById('apellido').value = usuario.apellido;
            document.getElementById('email').value = usuario.email;
            document.getElementById('rol').value = usuario.rol;
            toggleCamposMedico();
            if (usuario.rol === 'medico') {
                document.getElementById('especialidad').value = usuario.id_especialidad || '';
            }
            document.getElementById('formularioTitulo').textContent = 'Editar Usuario';
            document.getElementById('formularioUsuario').style.display = 'block';
        })
        .catch(error => {
            console.error('Error al cargar datos del usuario:', error);
            alert('Error al cargar datos del usuario');
        });
}

function eliminarUsuario(idUsuario) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        fetch(`/api/users/${idUsuario}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    alert('Usuario eliminado con éxito');
                    cargarUsuarios();
                } else {
                    alert('Error al eliminar usuario: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Error al eliminar usuario:', error);
                alert('Error al eliminar usuario');
            });
    }
}

function cargarRoles() {
    console.log('Iniciando carga de roles');
    fetch('/api/roles')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(roles => {
            console.log('Roles recibidos:', roles);
            const selectRol = document.getElementById('rol');
            if (!selectRol) {
                console.error('Elemento select de rol no encontrado');
                return;
            }
            selectRol.innerHTML = '<option value="">Seleccionar rol</option>';
            roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.asign_role;
                option.textContent = rol.asign_role;
                selectRol.appendChild(option);
            });
            console.log('Roles cargados en el select');
        })
        .catch(error => {
            console.error('Error al cargar roles:', error);
            alert('Error al cargar roles. Por favor, intente más tarde.');
        });
}

function toggleCamposMedico() {
    const rolSeleccionado = document.getElementById('rol').value;
    const camposMedico = document.getElementById('camposMedico');

    if (rolSeleccionado === 'medico') {
        camposMedico.style.display = 'block';
        cargarEspecialidades();
    } else {
        camposMedico.style.display = 'none';
    }
}

function cargarEspecialidades() {
    console.log('Cargando especialidades');
    fetch('/api/especialidades')
        .then(response => response.json())
        .then(especialidades => {
            const selectEspecialidad = document.getElementById('especialidad');
            selectEspecialidad.innerHTML = '<option value="">Seleccionar especialidad</option>';
            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id_especialidad;
                option.textContent = esp.nombre;
                selectEspecialidad.appendChild(option);
            });
            console.log('Especialidades cargadas');
        })
        .catch(error => console.error('Error al cargar especialidades:', error));
}

function limpiarFormulario() {
    document.getElementById('formUsuario').reset();
    document.getElementById('id_usuario').value = '';
    toggleCamposMedico();
}

setupEventListeners();
document.addEventListener('DOMContentLoaded', setupEventListeners);
cargarEspecialidades();
cargarUsuarios();