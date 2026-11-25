// controllers/productoController.js - Catálogo de artesanías
const productos = require('../data/productos');
const CATEGORIAS = ['alfareria', 'ceramica', 'ebanisteria', 'hilados-tejidos', 'muebleria-rustica'];
// GET /api/productos?categoria=ceramica -> público (no requiere sesión)
exports.getAllProductos = (req, res) => {
    const { categoria } = req.query;
    let resultado = productos;
    if (categoria !== undefined) {
        if (!CATEGORIAS.includes(categoria)) {
            return res.status(400).json({ status: 'fail', message: `La categoría debe ser una de: ${CATEGORIAS.join(', ')}` });
        }
        resultado = productos.filter((p) => p.categoria === categoria);
    }
    res.status(200).json({ status: 'success', results: resultado.length, data: resultado });
};
// POST /api/productos -> solo artesanos autenticados (authMiddleware + requireRol)
exports.createProducto = (req, res) => {
    const { nombre, categoria, precio } = req.body || {};
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ status: 'fail', message: 'El nombre es obligatorio' });
    }
    if (!CATEGORIAS.includes(categoria)) {
        return res.status(400).json({ status: 'fail', message: `La categoría debe ser una de: ${CATEGORIAS.join(', ')}` });
    }
    const numPrecio = Number(precio);
    if (precio === undefined || precio === null || precio === '' || !Number.isFinite(numPrecio) || numPrecio <= 0) {
        return res.status(400).json({ status: 'fail', message: 'El precio debe ser un número mayor que 0' });
    }
    const nuevoId = productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    // El artesano se toma de la SESIÓN, no del body: el cliente no puede publicar a nombre de otro
    const nuevoProducto = { id: nuevoId, nombre: nombre.trim(), categoria, precio: numPrecio, artesanoId: req.usuario.id };
    productos.push(nuevoProducto);
    res.status(201).json({ status: 'success', data: nuevoProducto });
};