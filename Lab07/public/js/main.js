// public/js/main.js - Interfaz web de Artesanías (consume la API del servidor)
const API = '/api';

const CATEGORIAS = {
    'alfareria': 'Alfarería',
    'ceramica': 'Cerámica',
    'ebanisteria': 'Ebanistería',
    'hilados-tejidos': 'Hilados y tejidos',
    'muebleria-rustica': 'Mueblería rústica'
};

// ===== Referencias al DOM =====
const $ = (id) => document.getElementById(id);
const filtros = $('filtros');
const listaProductos = $('lista-productos');
const mensajeCatalogo = $('mensaje-catalogo');
const panelAuth = $('panel-auth');
const panelSesion = $('panel-sesion');
const panelPublicar = $('panel-publicar');
const avisoCliente = $('aviso-cliente');
const formLogin = $('form-login');
const formRegistro = $('form-registro');
const formPublicar = $('form-publicar');
const mensajeAuth = $('mensaje-auth');
const mensajePublicar = $('mensaje-publicar');

// ===== Estado de la interfaz =====
let usuarioActual = null; // datos del usuario si hay sesión iniciada, o null
let categoriaActual = ''; // '' = todas

// ===== Utilidades =====
// Llama a la API y devuelve siempre { ok, status, datos }, aunque falle la conexión
const llamarApi = async (ruta, opciones = {}) => {
    try {
        const respuesta = await fetch(`${API}${ruta}`, {
            ...opciones,
            headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
        });
        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, datos };
    } catch (error) {
        return { ok: false, status: 0, datos: { message: 'No se pudo conectar con el servidor' } };
    }
};

// tipo: 'error' | 'exito' | 'info' | '' (limpia el mensaje)
const mostrarMensaje = (elemento, texto, tipo) => {
    elemento.textContent = texto;
    elemento.className = tipo ? `mensaje mensaje--${tipo}` : 'mensaje';
};

// ===== Catálogo =====
// Se construye con createElement y textContent: los datos nunca se interpretan como HTML (previene XSS)
const crearTarjeta = (producto) => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'producto';
    tarjeta.dataset.categoria = producto.categoria;

    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta';
    etiqueta.textContent = CATEGORIAS[producto.categoria] || producto.categoria;

    const titulo = document.createElement('h3');
    titulo.textContent = producto.nombre;

    const precio = document.createElement('p');
    precio.className = 'producto__precio';
    precio.textContent = `S/ ${Number(producto.precio).toFixed(2)}`;

    const origen = document.createElement('p');
    origen.className = 'producto__origen';
    origen.textContent = producto.artesanoId === null ? 'Catálogo de muestra' : 'Publicado por un artesano';

    tarjeta.append(etiqueta, titulo, precio, origen);
    return tarjeta;
};

const cargarProductos = async () => {
    const consulta = categoriaActual ? `?categoria=${encodeURIComponent(categoriaActual)}` : '';
    const { ok, datos } = await llamarApi(`/productos${consulta}`);

    listaProductos.textContent = '';
    if (!ok) {
        mostrarMensaje(mensajeCatalogo, datos.message, 'error');
        return;
    }
    if (datos.data.length === 0) {
        mostrarMensaje(mensajeCatalogo, 'Todavía no hay artesanías en esta categoría.', 'info');
        return;
    }
    mostrarMensaje(mensajeCatalogo, '', '');
    datos.data.forEach((producto) => listaProductos.appendChild(crearTarjeta(producto)));
};

const construirFiltros = () => {
    [['', 'Todas'], ...Object.entries(CATEGORIAS)].forEach(([valor, texto]) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'filtro';
        boton.dataset.categoria = valor;
        boton.textContent = texto;
        boton.setAttribute('aria-pressed', String(valor === categoriaActual));
        filtros.appendChild(boton);
    });
};

// Un solo listener para todos los botones de filtro (delegación de eventos)
filtros.addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-categoria]');
    if (!boton) return;

    categoriaActual = boton.dataset.categoria;
    filtros.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
    cargarProductos();
});

// ===== Sesión y paneles =====
const actualizarVista = () => {
    const hayUsuario = usuarioActual !== null;

    panelAuth.hidden = hayUsuario;
    panelSesion.hidden = !hayUsuario;
    panelPublicar.hidden = !(hayUsuario && usuarioActual.rol === 'artesano');
    avisoCliente.hidden = !(hayUsuario && usuarioActual.rol === 'cliente');

    if (hayUsuario) {
        $('sesion-email').textContent = usuarioActual.email;
        $('sesion-rol').textContent = usuarioActual.rol === 'artesano' ? 'Artesano' : 'Cliente';
    }
};

// Pregunta al servidor si la cookie de sesión sigue siendo válida (GET /api/perfil)
const cargarPerfil = async () => {
    const { ok, datos } = await llamarApi('/perfil');
    usuarioActual = ok ? datos.data : null;
    actualizarVista();
};

const mostrarFormulario = (cual) => {
    const esLogin = cual === 'login';
    formLogin.hidden = !esLogin;
    formRegistro.hidden = esLogin;
    $('tab-login').setAttribute('aria-pressed', String(esLogin));
    $('tab-registro').setAttribute('aria-pressed', String(!esLogin));
    mostrarMensaje(mensajeAuth, '', '');
};

$('tab-login').addEventListener('click', () => mostrarFormulario('login'));
$('tab-registro').addEventListener('click', () => mostrarFormulario('registro'));

// ===== Registro =====
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('reg-email').value;

    const { ok, datos } = await llamarApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: $('reg-password').value, rol: $('reg-rol').value })
    });

    if (!ok) return mostrarMensaje(mensajeAuth, datos.message, 'error');

    formRegistro.reset();
    mostrarFormulario('login');
    $('login-email').value = email;
    mostrarMensaje(mensajeAuth, 'Cuenta creada. Ahora inicia sesión.', 'exito');
});

// ===== Inicio de sesión =====
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { ok, datos } = await llamarApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: $('login-email').value, password: $('login-password').value })
    });

    if (!ok) return mostrarMensaje(mensajeAuth, datos.message, 'error');

    formLogin.reset();
    mostrarMensaje(mensajeAuth, '', '');
    await cargarPerfil();
});

// ===== Cierre de sesión =====
$('btn-logout').addEventListener('click', async () => {
    await llamarApi('/auth/logout', { method: 'POST' });
    usuarioActual = null;
    mostrarMensaje(mensajePublicar, '', '');
    actualizarVista();
});

// ===== Publicar una artesanía (solo artesanos) =====
formPublicar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { ok, status, datos } = await llamarApi('/productos', {
        method: 'POST',
        body: JSON.stringify({
            nombre: $('pub-nombre').value,
            categoria: $('pub-categoria').value,
            precio: $('pub-precio').value
        })
    });

    if (status === 401) {
        usuarioActual = null;
        actualizarVista();
        return mostrarMensaje(mensajeAuth, 'Tu sesión expiró. Inicia sesión de nuevo.', 'error');
    }
    if (!ok) return mostrarMensaje(mensajePublicar, datos.message, 'error');

    formPublicar.reset();
    mostrarMensaje(mensajePublicar, 'Artesanía publicada correctamente.', 'exito');
    cargarProductos();
});

// ===== Inicio =====
document.addEventListener('DOMContentLoaded', () => {
    construirFiltros();
    cargarPerfil();
    cargarProductos();
});