// controllers/perfilController.js - Recurso protegido: datos del usuario autenticado
const usuarioPublico = require('../utils/usuarioPublico');
// GET /api/perfil (protegido por authMiddleware, que deja el usuario en req.usuario)
exports.getPerfil = (req, res) => {
    res.status(200).json({ status: 'success', data: usuarioPublico(req.usuario) });
};