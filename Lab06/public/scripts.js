const API_URL = '/api/cursos';

// 1. Obtener y renderizar todos los cursos (GET)
async function cargarCursos() {
    try {
        const respuesta = await fetch(API_URL);
        const data = await respuesta.json();
        
        const contenedor = document.getElementById('lista-cursos');
        contenedor.innerHTML = ''; // Limpiar lista

        if (data.status === 'success') {
            data.data.forEach(curso => {
                const card = document.createElement('div');
                card.className = 'curso-card';
                card.innerHTML = `
                    <div>
                        <strong>${curso.nombre}</strong> (${curso.codigo}) 
                        <br> <small>Créditos: ${curso.creditos}</small>
                    </div>
                    <button class="btn-delete" onclick="eliminarCurso(${curso.id})">Eliminar</button>
                `;
                contenedor.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}

// 2. Agregar un curso validando los campos (POST)
async function agregarCurso() {
    const nombre = document.getElementById('nombre').value;
    const codigo = document.getElementById('codigo').value;
    const creditos = document.getElementById('creditos').value;
    const divMensaje = document.getElementById('mensaje');
    divMensaje.innerText = ''; // Limpiar errores previos

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, codigo, creditos })
        });
        
        const resultado = await respuesta.json();

        if (resultado.status === 'fail') {
            divMensaje.innerText = resultado.message; // Mostrar error del controlador Express
        } else {
            // Limpiar formulario si todo sale bien
            document.getElementById('nombre').value = '';
            document.getElementById('codigo').value = '';
            document.getElementById('creditos').value = '';
            cargarCursos(); // Refrescar lista visualmente
        }
    } catch (error) {
        console.error('Error al guardar curso:', error);
    }
}

// 3. Eliminar un curso de la lista (DELETE)
async function eliminarCurso(id) {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        const resultado = await respuesta.json();
        
        if (resultado.status === 'success') {
            cargarCursos(); // Refrescar lista visualmente
        }
    } catch (error) {
        console.error('Error al eliminar curso:', error);
    }
}

// Inicializar la carga al abrir la página
document.addEventListener('DOMContentLoaded', cargarCursos);