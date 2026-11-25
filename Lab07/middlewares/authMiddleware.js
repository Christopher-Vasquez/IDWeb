// middlewares/authMiddleware.js - AUTENTICACIÓN: ¿quién eres?
// Verifica que exista req.session.userId; si no, interrumpe el flujo con 401 Unauthorized.
const usuarios = require('../data/usuarios');
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.userId) {
        const usuario = usuarios.find((u) => u.id === req.session.userId);
        if (usuario) {
            req.usuario = usuario; // queda disponible para los siguientes middlewares y controladores
            return next();
        }
    }
    return res.status(401).json({ status: 'fail', message: 'Acceso no autorizado: inicia sesión primero' });
};
module.exports = authMiddleware;