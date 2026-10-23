// controllers/cursoController.js - Lógica de negocio del recurso Cursos
const cursos = require('../data/cursos');

// Valida los campos obligatorios; devuelve un mensaje de error o null si todo es correcto
const validarCurso = ({ nombre, codigo, creditos } = {}) => {
    if (!nombre || !codigo || creditos === undefined || creditos === null || creditos === '') {
        return 'Faltan campos obligatorios: nombre, codigo y creditos';
    }
    if (typeof nombre !== 'string' || typeof codigo !== 'string') {
        return 'nombre y codigo deben ser texto';
    }
    const numCreditos = Number(creditos);
    if (!Number.isInteger(numCreditos) || numCreditos <= 0) {
        return 'creditos debe ser un número entero mayor que 0';
    }
    return null;
};

// GET /api/cursos?creditos=4 -> lista completa o filtrada por query string
exports.getAllCursos = (req, res) => {
    const { creditos } = req.query;
    let resultado = cursos;

    if (creditos !== undefined) {
        const numCreditos = Number(creditos);
        if (Number.isNaN(numCreditos)) {
            return res.status(400).json({ status: 'fail', message: 'El filtro creditos debe ser numérico' });
        }
        resultado = cursos.filter((c) => c.creditos === numCreditos);
    }

    res.status(200).json({ status: 'success', results: resultado.length, data: resultado });
};

// GET /api/cursos/:id -> 200 si existe, 404 si no
exports.getCursoById = (req, res) => {
    const id = Number(req.params.id);
    const curso = cursos.find((c) => c.id === id);

    if (!curso) {
        return res.status(404).json({ status: 'fail', message: `No existe un curso con id ${req.params.id}` });
    }
    res.status(200).json({ status: 'success', data: curso });
};

// POST /api/cursos -> valida y crea (201 Created)
exports.createCurso = (req, res) => {
    const error = validarCurso(req.body);
    if (error) {
        return res.status(400).json({ status: 'fail', message: error });
    }

    const { nombre, codigo, creditos } = req.body;
    // Se usa el mayor id + 1 (y no length + 1) para no repetir ids después de eliminar cursos
    const nuevoId = cursos.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const nuevoCurso = { id: nuevoId, nombre, codigo, creditos: Number(creditos) };

    cursos.push(nuevoCurso);
    res.status(201).json({ status: 'success', data: nuevoCurso });
};

// PUT /api/cursos/:id -> reemplaza las propiedades del curso (200 OK o 404)
exports.updateCurso = (req, res) => {
    const id = Number(req.params.id);
    const indice = cursos.findIndex((c) => c.id === id);

    if (indice === -1) {
        return res.status(404).json({ status: 'fail', message: `No existe un curso con id ${req.params.id}` });
    }

    const error = validarCurso(req.body);
    if (error) {
        return res.status(400).json({ status: 'fail', message: error });
    }

    const { nombre, codigo, creditos } = req.body;
    cursos[indice] = { id, nombre, codigo, creditos: Number(creditos) };
    res.status(200).json({ status: 'success', data: cursos[indice] });
};

// DELETE /api/cursos/:id -> elimina del arreglo (200 con confirmación o 404)
exports.deleteCurso = (req, res) => {
    const id = Number(req.params.id);
    const indice = cursos.findIndex((c) => c.id === id);

    if (indice === -1) {
        return res.status(404).json({ status: 'fail', message: `No existe un curso con id ${req.params.id}` });
    }

    const [eliminado] = cursos.splice(indice, 1);
    res.status(200).json({ status: 'success', message: 'Curso eliminado correctamente', data: eliminado });
};