document.getElementById('btn-historia-medica').addEventListener('click', mostrarFormularioHistoriaMedica);

function mostrarFormularioHistoriaMedica() {
    document.getElementById('modal-historia-medica').style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('modal-historia-medica').style.display = 'none';
});

document.getElementById('form-historia-medica').addEventListener('submit', guardarHistoriaMedica);

async function guardarHistoriaMedica(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const historiaMedicaData = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/historia-medica', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(historiaMedicaData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar la historia médica');
        }

        const result = await response.json();
        alert('Historia médica guardada con éxito');
        document.getElementById('modal-historia-medica').style.display = 'none';
        // Aquí podrías recargar la información del paciente si es necesario
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la historia médica. Por favor, intente de nuevo.');
    }
}