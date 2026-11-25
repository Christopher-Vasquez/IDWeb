// routes/productoRoutes.js - Catálogo de artesanías (/api/productos)
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRol = require('../middlewares/roleMiddleware');
// Lectura pública
router.get('/', productoController.getAllProductos);
// Escritura: primero autenticación (401) y luego autorización por rol (403)
router.post('/', authMiddleware, requireRol('artesano'), productoController.createProducto);
module.exports = router;