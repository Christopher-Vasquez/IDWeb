// js/app.js - Gestor de Tareas Universitarias
// ===== 1. Referencias al DOM =====
const form = document.querySelector('#form-tarea');
const inputTitulo = document.querySelector('#titulo');
const inputCurso = document.querySelector('#curso');
const inputFecha = document.querySelector('#fecha');
const alertas = document.querySelector('#alertas');
const lista = document.querySelector('#lista-tareas');
const contador = document.querySelector('#contador');
const filtros = document.querySelector('#filtros');
// ===== 2. Estado global: arreglo de objetos =====
// [{ id, titulo, curso, fechaEntrega, completada }]
let tareas = [];
let filtroActual = 'todas';
// ===== 3. Persistencia con localStorage =====
const guardarTareas = () => {
  localStorage.setItem('tareas', JSON.stringify(tareas));
};
const cargarTareas = () => {
  try {
    return JSON.parse(localStorage.getItem('tareas')) || [];
  } catch (error) {
    // Si el JSON guardado está corrupto, se reinicia el estado
    console.error('Error al leer localStorage:', error);
    return [];
  }
};
// ===== 4. Utilidades =====
const hoyISO = () => {
  // Fecha local en formato YYYY-MM-DD (comparable como texto)
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};
const mostrarAlerta = (mensaje) => {
  alertas.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'alert alert-danger py-2';
  div.textContent = mensaje; // textContent evita inyección de HTML
  alertas.appendChild(div);
};
const limpiarAlertas = () => {
  alertas.innerHTML = '';
};
// ===== 5. Renderizado dinámico (createElement, sin innerHTML con datos del usuario) =====
const filtrarTareas = () => {
  if (filtroActual === 'pendientes') return tareas.filter((t) => !t.completada);
  if (filtroActual === 'completadas') return tareas.filter((t) => t.completada);
  return tareas;
};
const crearItem = ({ id, titulo, curso, fechaEntrega, completada }) => {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center gap-2';
  li.dataset.id = id;
  const info = document.createElement('div');
  info.className = completada ? 'tarea-completada' : '';
  const strong = document.createElement('strong');
  strong.textContent = titulo;
  const detalle = document.createElement('small');
  detalle.className = 'd-block text-muted';
  detalle.textContent = `${curso} · Entrega: ${fechaEntrega}`;
  info.append(strong, detalle);
  const acciones = document.createElement('div');
  acciones.className = 'd-flex gap-2';
  const btnEstado = document.createElement('button');
  btnEstado.className = 'btn btn-sm btn-success';
  btnEstado.dataset.accion = 'alternar';
  btnEstado.textContent = completada ? 'Reabrir' : 'Completar';
  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'btn btn-sm btn-danger';
  btnEliminar.dataset.accion = 'eliminar';
  btnEliminar.textContent = 'Eliminar';
  acciones.append(btnEstado, btnEliminar);
  li.append(info, acciones);
  return li;
};
const renderTareas = () => {
  lista.innerHTML = '';
  const visibles = filtrarTareas();
  if (visibles.length === 0) {
    const vacio = document.createElement('li');
    vacio.className = 'list-group-item text-muted text-center';
    vacio.textContent = 'No hay tareas para mostrar.';
    lista.appendChild(vacio);
  } else {
    visibles.forEach((tarea) => lista.appendChild(crearItem(tarea)));
  }
  // reduce: cuenta las pendientes para el contador
  const pendientes = tareas.reduce((acc, t) => (t.completada ? acc : acc + 1), 0);
  contador.textContent = `${pendientes} pendiente(s) de ${tareas.length} tarea(s)`;
};
// ===== 6. Operaciones sobre el arreglo (map, filter, find) =====
const alternarTarea = (id) => {
  tareas = tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t));
  guardarTareas();
  renderTareas();
};
const eliminarTarea = (id) => {
  tareas = tareas.filter((t) => t.id !== id);
  guardarTareas();
  renderTareas();
};
// ===== 7. Eventos =====
// 7.1 Alta de tarea: interceptar submit + validación con JS
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = inputTitulo.value.trim();
  const curso = inputCurso.value.trim();
  const fechaEntrega = inputFecha.value;
  if (!titulo || !curso || !fechaEntrega) {
    mostrarAlerta('Todos los campos son obligatorios.');
    return;
  }
  if (fechaEntrega <= hoyISO()) {
    mostrarAlerta('La fecha de entrega debe ser posterior a la fecha actual.');
    return;
  }
  limpiarAlertas();
  tareas.push({ id: Date.now(), titulo, curso, fechaEntrega, completada: false });
  guardarTareas();
  form.reset();
  renderTareas();
});
// 7.2 Delegación de eventos: UN solo listener en la lista para todos los botones
lista.addEventListener('click', (e) => {
  const boton = e.target.closest('button[data-accion]');
  if (!boton) return;
  const id = Number(boton.closest('li').dataset.id);
  const tarea = tareas.find((t) => t.id === id); // find
  if (!tarea) return;

  if (boton.dataset.accion === 'alternar') alternarTarea(id);
  if (boton.dataset.accion === 'eliminar') eliminarTarea(id);
});
// 7.3 Filtros visuales (también por delegación)
filtros.addEventListener('click', (e) => {
  const boton = e.target.closest('button[data-filtro]');
  if (!boton) return;

  filtroActual = boton.dataset.filtro;
  filtros.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
  boton.classList.add('active');
  renderTareas();
});
// 7.4 Cargar y renderizar lo guardado al iniciar
document.addEventListener('DOMContentLoaded', () => {
  tareas = cargarTareas();
  renderTareas();
});