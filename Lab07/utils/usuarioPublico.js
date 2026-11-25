// utils/usuarioPublico.js - Lista blanca de campos que se pueden devolver al cliente
// Seguridad: nunca se expone passwordHash en una respuesta JSON.
const usuarioPublico = ({ id, email, rol, creadoEn }) => ({ id, email, rol, creadoEn });
module.exports = usuarioPublico;