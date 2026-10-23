// Función para consultar el estado del servidor (GET /api/status)
async function obtenerStatus() {
    const contStatus = document.getElementById('resultado-status');
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        contStatus.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        contStatus.textContent = 'Error al consultar el estado del servidor.';
    }
}

// Función para consumir GET /api/estudiantes
async function obtenerEstudiantes() {
    const contGet = document.getElementById('resultado-get');
    try {
        const response = await fetch('/api/estudiantes');
        const data = await response.json();
        contGet.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        contGet.textContent = 'Error al conectar con el servidor.';
    }
}

// Función para consumir POST /api/estudiantes
async function registrarEstudiante() {
    const contPost = document.getElementById('resultado-post');

    const nuevoEstudiante = {
        nombre: document.getElementById('nombre').value,
        codigo: document.getElementById('codigo').value,
        carrera: document.getElementById('carrera').value
    };

    try {
        const response = await fetch('/api/estudiantes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoEstudiante)
        });

        const resultado = await response.json();
        contPost.textContent = JSON.stringify(resultado, null, 2);

        // Si se registró con éxito (201 Created), actualizamos la lista automáticamente
        if (response.status === 201) {
            obtenerEstudiantes();
            document.getElementById('formEstudiante').reset();
        }
    } catch (error) {
        contPost.textContent = 'Error al registrar el estudiante.';
    }
}