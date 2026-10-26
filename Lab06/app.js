// app.js - Punto de entrada de la API RESTful de Cursos
const express = require('express');
const path = require('path'); // Módulo nativo para gestionar rutas de carpetas
const cursoRoutes = require('./routes/cursoRoutes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = 3000;

// 1. Middlewares globales esenciales
app.use(logger);         // Middleware propio de auditoría
app.use(express.json()); // Parsea el body JSON de las peticiones POST/PUT

// 2. Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// 3. Forzar a que la ruta raíz siempre entregue el index.html de tu interfaz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Rutas del recurso Cursos (API backend)
app.use('/api/cursos', cursoRoutes);

// Ruta de prueba para comprobar el manejador global de errores
app.get('/api/error', (req, res, next) => {
    next(new Error('Error de prueba provocado a propósito'));
});

// 5. Capturar rutas inexistentes (404) que NO sean archivos ni endpoints reales
app.use((req, res) => {
    res.status(404).json({ status: 'fail', message: `La ruta ${req.originalUrl} no existe` });
});

// 6. Manejador global de errores (SIEMPRE al final)
app.use(errorHandler);

app.listen(PORT, () => console.log(`API Express en http://localhost:${PORT}`));


//SCRIPTS.JS


const API_URL = '/api/cursos';

// 1. OBTENER TODOS LOS CURSOS O FILTRADOS (GET /api/cursos)
async function cargarCursos(urlQuery = API_URL) {
    try {
        const respuesta = await fetch(urlQuery);
        const data = await respuesta.json();
        
        const contenedor = document.getElementById('lista-cursos');
        contenedor.innerHTML = '';

        if (data.status === 'success') {
            if (data.data.length === 0) {
                contenedor.innerHTML = '<p style="color: #64748b; text-align: center;">No se encontraron cursos.</p>';
                return;
            }
            // Mapea el arreglo enviado por el controlador
            data.data.forEach(curso => {
                const item = document.createElement('div');
                item.className = 'curso-item';
                item.innerHTML = `
                    <div class="curso-info">
                        <strong>ID: ${curso.id}</strong> — ${curso.nombre} 
                        <span class="badge">${curso.codigo}</span>
                        <br><small style="color: #64748b;">Créditos asignados: ${curso.creditos}</small>
                    </div>
                    <div class="curso-actions">
                        <button class="btn-warning" onclick="prepararEdicion(${JSON.stringify(curso).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn-danger" onclick="eliminarCurso(${curso.id})">Eliminar</button>
                    </div>
                `;
                contenedor.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error cargando los recursos:', error);
    }
}

// 2. FILTRAR POR QUERY STRING (?creditos=X)
function cargarCursosFiltrados() {
    const creditos = document.getElementById('filter-creditos').value;
    if (!creditos) return;
    cargarCursos(`${API_URL}?creditos=${creditos}`);
}

function limpiarFiltros() {
    document.getElementById('filter-creditos').value = '';
    document.getElementById('search-status').innerText = '';
    cargarCursos();
}

// 3. BUSCAR POR ID INDIVIDUAL (GET /api/cursos/:id)
async function buscarPorId() {
    const id = document.getElementById('search-id').value;
    const statusDiv = document.getElementById('search-status');
    statusDiv.className = 'status-msg';
    statusDiv.innerText = '';

    if (!id) {
        statusDiv.className = 'status-msg fail';
        statusDiv.innerText = 'Ingresa un ID válido primero';
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${id}`);
        const resultado = await respuesta.json();

        if (resultado.status === 'success') {
            statusDiv.className = 'status-msg success';
            statusDiv.innerText = `Encontrado: ${resultado.data.nombre} (${resultado.data.codigo})`;
            // Renderizar únicamente este curso en la lista principal
            const contenedor = document.getElementById('lista-cursos');
            contenedor.innerHTML = '';
            const item = document.createElement('div');
            item.className = 'curso-item';
            item.innerHTML = `
                <div class="curso-info">
                    <strong>ID: ${resultado.data.id}</strong> — ${resultado.data.nombre} 
                    <span class="badge">${resultado.data.codigo}</span>
                    <br><small style="color: #64748b;">Créditos asignados: ${resultado.data.creditos}</small>
                </div>
                <div class="curso-actions">
                    <button class="btn-warning" onclick="prepararEdicion(${JSON.stringify(resultado.data).replace(/"/g, '&quot;')})">Editar</button>
                    <button class="btn-danger" onclick="eliminarCurso(${resultado.data.id})">Eliminar</button>
                </div>
            `;
            contenedor.appendChild(item);
        } else {
            statusDiv.className = 'status-msg fail';
            statusDiv.innerText = resultado.message; // 404 del backend
        }
    } catch (error) {
        console.error(error);
    }
}

// 4. CREAR (POST) O ACTUALIZAR (PUT) CURSO
async function guardarCurso() {
    const id = document.getElementById('curso-id').value;
    const nombre = document.getElementById('nombre').value;
    const codigo = document.getElementById('codigo').value;
    const creditos = document.getElementById('creditos').value;
    const statusDiv = document.getElementById('form-status');
    
    statusDiv.innerText = '';

    // Determinamos si es una edición (PUT) o creación (POST)
    const esEdicion = id !== "";
    const url = esEdicion ? `${API_URL}/${id}` : API_URL;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, codigo, creditos })
        });
        
        const resultado = await respuesta.json();

        if (resultado.status === 'fail' || resultado.status === 'error') {
            statusDiv.className = 'status-msg fail';
            statusDiv.innerText = resultado.message; // Muestra error de validación de Express
        } else {
            statusDiv.className = 'status-msg success';
            statusDiv.innerText = esEdicion ? 'Curso actualizado con éxito' : 'Curso creado con éxito';
            limpiarFormulario();
            cargarCursos();
        }
    } catch (error) {
        console.error(error);
    }
}

// 5. ELIMINAR CURSO (DELETE /api/cursos/:id)
async function eliminarCurso(id) {
    if (!confirm(`¿Deseas eliminar el curso con ID ${id}?`)) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (resultado.status === 'success') {
            cargarCursos();
        }
    } catch (error) {
        console.error(error);
    }
}

// Auxiliares de interfaz gráfica
function prepararEdicion(curso) {
    document.getElementById('form-title').innerText = 'Modificar Curso existente';
    document.getElementById('curso-id').value = curso.id;
    document.getElementById('nombre').value = curso.nombre;
    document.getElementById('codigo').value = curso.codigo;
    document.getElementById('creditos').value = curso.creditos;
    
    document.getElementById('btn-save').className = 'btn-warning';
    document.getElementById('btn-save').innerText = 'Actualizar Datos';
    document.getElementById('btn-cancel').style.display = 'block';
}

function limpiarFormulario() {
    document.getElementById('form-title').innerText = 'Crear / Modificar Curso';
    document.getElementById('curso-id').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('codigo').value = '';
    document.getElementById('creditos').value = '';
    
    document.getElementById('btn-save').className = 'btn-primary';
    document.getElementById('btn-save').innerText = 'Crear Curso';
    document.getElementById('btn-cancel').style.display = 'none';
}

// Inicializar la API al cargar la vista
document.addEventListener('DOMContentLoaded', () => cargarCursos());


