// middlewares/errorHandler.js - Manejo global de errores (se registra al final de app.js)
// Los middlewares de error se reconocen por tener 4 parámetros (err, req, res, next)
const errorHandler = (err, req, res, next) => {
    // JSON mal formado en el body: es un error del cliente (400), no del servidor
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ status: 'fail', message: 'El cuerpo de la petición no es un JSON válido' });
    }

    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
};

module.exports = errorHandler;