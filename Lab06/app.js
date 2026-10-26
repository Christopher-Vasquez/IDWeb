
const express = require('express');
const path = require('path');

const cursoRoutes = require('./routes/cursoRoutes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = 3000;

// 1. Middlewares globales
app.use(logger);
// CORS básico: permite usar el frontend desde Live Server u otro puerto
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json());

// 2. Servir archivos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// 3. Rutas de la API
app.use('/api/cursos', cursoRoutes);

// 4. Ruta para probar errores
app.get('/api/error', (req, res, next) => {
    next(new Error('Error de prueba provocado a propósito'));
});

// 5. Rutas inexistentes
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// 6. Manejador global de errores (al final)
app.use(errorHandler);

// 7. Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
