// middlewares/roleMiddleware.js - AUTORIZACIÓN: ¿qué puedes hacer?
// Se usa después de authMiddleware. Si el rol no está permitido responde 403 Forbidden.
const requireRol = (...rolesPermitidos) => (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
            status: 'fail',
            message: `Acción permitida solo para: ${rolesPermitidos.join(', ')}`
        });
    }
    next();
};
module.exports = requireRol;