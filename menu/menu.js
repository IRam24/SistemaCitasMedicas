document.addEventListener('DOMContentLoaded', function() {
    // Cargar información del perfil
    cargarPerfilUsuario();

    // Manejar clics en los elementos del menú
    const menuItems = document.querySelectorAll('.sidebar nav ul li a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            cargarSeccion(section);
        });
    });

    // Manejar clic en Editar Perfil
    document.getElementById('edit-profile').addEventListener('click', function(e) {
        e.preventDefault();
        cargarSeccion('editar-perfil');
    });

    // Manejar clic en Cerrar Sesión
    document.getElementById('logout-btn').addEventListener('click', cerrarSesion);

    // Cargar la sección de agendar cita por defecto
    cargarSeccion('agendar-cita');
});

function cargarPerfilUsuario() {
    // Simulación de carga de datos del usuario
    const usuario = {
        nombre: "Juan Pérez",
        email: "juan@ejemplo.com",
        foto: "default-avatar.png"
    };

    document.getElementById('user-name').textContent = usuario.nombre;
    document.getElementById('user-email').textContent = usuario.email;
    document.getElementById('profile-pic').src = usuario.foto;
}

function cargarSeccion(seccion) {
    console.log(`Cargando sección: ${seccion}`);
    const contentArea = document.querySelector('.content');
    contentArea.innerHTML = ''; // Limpiar el contenido actual

    switch(seccion) {
        case 'agendar-cita':
            contentArea.innerHTML = `
                <h2>Agendar Cita Médica</h2>
                <form id="agendar-cita-form">
                    <select name="especialidad" required>
                        <option value="">Seleccione especialidad</option>
                        <option value="general">Medicina General</option>
                        <option value="cardiologia">Cardiología</option>
                        <!-- Añadir más especialidades -->
                    </select>
                    <input type="date" name="fecha" required>
                    <input type="time" name="hora" required>
                    <button type="submit">Agendar Cita</button>
                </form>
            `;
            document.getElementById('agendar-cita-form').addEventListener('submit', agendarCita);
            break;
        case 'citas-agendadas':
            cargarCitasAgendadas();
            break;
        case 'historial-medico':
            cargarHistorialMedico();
            break;
        case 'especialidades':
            cargarEspecialidades();
            break;
        case 'editar-perfil':
            cargarFormularioEditarPerfil();
            break;
        default:
            contentArea.innerHTML = '<p>Sección no encontrada</p>';
    }
}

function agendarCita(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const citaData = Object.fromEntries(formData);
    console.log('Datos de la cita:', citaData);
    // Aquí irías la lógica para enviar los datos al servidor
    alert('Cita agendada con éxito');
}

async function cargarCitasAgendadas() {
    const contentArea = document.querySelector('.content');
    contentArea.innerHTML = '<h2>Citas Agendadas</h2><p>Cargando citas...</p>';
    
    try {
        // Simulación de una llamada a la API
        const citas = await new Promise(resolve => setTimeout(() => resolve([
            { fecha: '2023-12-01', hora: '10:00', especialidad: 'Cardiología' },
            { fecha: '2023-12-15', hora: '11:30', especialidad: 'Medicina General' }
        ]), 1000));

        let citasHTML = '<ul>';
        citas.forEach(cita => {
            citasHTML += `<li>${cita.fecha} - ${cita.hora}: ${cita.especialidad}</li>`;
        });
        citasHTML += '</ul>';

        contentArea.innerHTML = `<h2>Citas Agendadas</h2>${citasHTML}`;
    } catch (error) {
        contentArea.innerHTML = '<h2>Citas Agendadas</h2><p>Error al cargar las citas</p>';
    }
}

function cargarHistorialMedico() {
    const contentArea = document.querySelector('.content');
    contentArea.innerHTML = `
        <h2>Historial Médico</h2>
        <p>Aquí se mostraría el historial médico del paciente.</p>
        <!-- Aquí irías la lógica para cargar y mostrar el historial médico -->
    `;
}

function cargarEspecialidades() {
    const contentArea = document.querySelector('.content');
    contentArea.innerHTML = `
        <h2>Especialidades Médicas</h2>
        <ul>
            <li>Medicina General</li>
            <li>Cardiología</li>
            <li>Dermatología</li>
            <li>Pediatría</li>
            <!-- Añadir más especialidades -->
        </ul>
    `;
}

function cargarFormularioEditarPerfil() {
    const contentArea = document.querySelector('.content');
    contentArea.innerHTML = `
        <h2>Editar Perfil</h2>
        <form id="editar-perfil-form">
            <input type="text" name="nombre" placeholder="Nombre" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Nueva contraseña">
            <input type="file" name="foto" accept="image/*">
            <button type="submit">Guardar Cambios</button>
        </form>
    `;
    document.getElementById('editar-perfil-form').addEventListener('submit', actualizarPerfil);
}

function actualizarPerfil(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Datos del perfil a actualizar:', Object.fromEntries(formData));
    // Aquí irías la lógica para enviar los datos al servidor
    alert('Perfil actualizado con éxito');
}

function cerrarSesion() {
    localStorage.removeItem('authToken');
    window.location.href = 'login/login.html';
}
