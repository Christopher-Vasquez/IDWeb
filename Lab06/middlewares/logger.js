// middlewares/logger.js - Auditoría: método, URL, código de estado y tiempo de respuesta
const logger = (req, res, next) => {
    const inicio = process.hrtime.bigint();

    // El evento 'finish' se dispara cuando la respuesta ya fue enviada al cliente
    res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms.toFixed(2)} ms)`);
    });

    next();
};

module.exports = logger;