// Si la página no se abre desde el servidor Express (Live Server, file://), apunta a localhost:3000
const BASE = window.location.port === '3000' ? '' : 'http://localhost:3000';
const API_URL = `${BASE}/api/cursos`;

const divMensaje = document.getElementById('mensaje');
const contenedor = document.getElementById('lista-cursos');

function mostrarMensaje(texto) {
    divMensaje.textContent = texto;
}

// 1. Obtener y renderizar todos los cursos (GET)
async function cargarCursos() {
    try {
        const respuesta = await fetch(API_URL);
        const data = await respuesta.json();

        contenedor.innerHTML = '';

        if (data.status !== 'success') {
            mostrarMensaje(data.message || 'No se pudo cargar la lista de cursos');
            return;
        }

        if (data.data.length === 0) {
            contenedor.textContent = 'No hay cursos registrados.';
            return;
        }

        data.data.forEach((curso) => {
            const card = document.createElement('div');
            card.className = 'curso-card';

            const info = document.createElement('div');
            const titulo = document.createElement('strong');
            titulo.textContent = curso.nombre;
            const detalle = document.createElement('small');
            detalle.textContent = `Créditos: ${curso.creditos}`;
            info.append(titulo, ` (${curso.codigo})`, document.createElement('br'), detalle);

            const btn = document.createElement('button');
            btn.className = 'btn-delete';
            btn.textContent = 'Eliminar';
            btn.addEventListener('click', () => eliminarCurso(curso.id));

            card.append(info, btn);
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        mostrarMensaje('No se pudo conectar con el servidor. ¿Está corriendo en http://localhost:3000?');
    }
}

// 2. Agregar un curso (POST)
async function agregarCurso() {
    const nombre = document.getElementById('nombre').value.trim();
    const codigo = document.getElementById('codigo').value.trim();
    const creditos = document.getElementById('creditos').value;
    mostrarMensaje('');

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, codigo, creditos })
        });
        const resultado = await respuesta.json();

        if (resultado.status !== 'success') {
            mostrarMensaje(resultado.message || 'No se pudo guardar el curso');
            return;
        }

        document.getElementById('nombre').value = '';
        document.getElementById('codigo').value = '';
        document.getElementById('creditos').value = '';
        cargarCursos();
    } catch (error) {
        console.error('Error al guardar curso:', error);
        mostrarMensaje('No se pudo conectar con el servidor.');
    }
}

// 3. Eliminar un curso (DELETE)
async function eliminarCurso(id) {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (resultado.status === 'success') {
            cargarCursos();
        } else {
            mostrarMensaje(resultado.message || 'No se pudo eliminar el curso');
        }
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        mostrarMensaje('No se pudo conectar con el servidor.');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-guardar').addEventListener('click', agregarCurso);
    cargarCursos();
});