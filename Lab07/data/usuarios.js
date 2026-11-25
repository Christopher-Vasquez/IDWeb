// data/usuarios.js - Persistencia temporal en memoria de los usuarios registrados
// Cada usuario: { id, email, passwordHash, rol, creadoEn }
// IMPORTANTE: aquí solo se guarda el HASH de la contraseña, nunca el texto plano.
module.exports = [];