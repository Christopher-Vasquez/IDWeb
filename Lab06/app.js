// app.js - Punto de entrada de la API RESTful de Cursos
const express = require('express');
const cursoRoutes = require('./routes/cursoRoutes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = 3000;

// Middlewares globales (se ejecutan en este orden)
app.use(logger);         // Middleware propio de auditoría
app.use(express.json()); // Middleware incorporado: parsea el body JSON

// Rutas del recurso Cursos
app.use('/api/cursos', cursoRoutes);

// Ruta de prueba para comprobar el manejador global de errores (responde 500)
app.get('/api/error', (req, res, next) => {
    next(new Error('Error de prueba provocado a propósito'));
});

// Rutas inexistentes (404)
app.use((req, res) => {
    res.status(404).json({ status: 'fail', message: `La ruta ${req.originalUrl} no existe` });
});

// Manejador global de errores: SIEMPRE debe registrarse al final
app.use(errorHandler);

app.listen(PORT, () => console.log(`API Express en http://localhost:${PORT}`));