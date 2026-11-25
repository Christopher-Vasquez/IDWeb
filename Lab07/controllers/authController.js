// controllers/authController.js - Registro, inicio y cierre de sesión
const bcrypt = require('bcryptjs');
const usuarios = require('../data/usuarios');
const usuarioPublico = require('../utils/usuarioPublico');

const SALT_ROUNDS = 10;
const ROLES = ['cliente', 'artesano'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_SESION = 'connect.sid'; // nombre por defecto de la cookie de express-session

// Hash de relleno: permite que el login tarde lo mismo exista o no el email
// (evita descubrir qué correos están registrados midiendo el tiempo de respuesta)
const hashRelleno = bcrypt.hash('relleno-anti-timing', SALT_ROUNDS);

// POST /api/auth/register -> email, password y rol opcional (cliente por defecto)
exports.register = async (req, res, next) => {
    try {
        const { email, password, rol = 'cliente' } = req.body || {};
        if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ status: 'fail', message: 'El email no es válido' });
        }
        // bcrypt solo procesa los primeros 72 caracteres, por eso se limita la longitud
        if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
            return res.status(400).json({ status: 'fail', message: 'La contraseña debe tener entre 8 y 72 caracteres' });
        }
        if (!ROLES.includes(rol)) {
            return res.status(400).json({ status: 'fail', message: `El rol debe ser uno de: ${ROLES.join(', ')}` });
        }
        const emailNormalizado = email.trim().toLowerCase();
        if (usuarios.some((u) => u.email === emailNormalizado)) {
            return res.status(409).json({ status: 'fail', message: 'Ya existe un usuario con ese email' });
        }
        // Hash asíncrono con sal (10 salt rounds): el texto plano nunca se guarda
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Se vuelve a comprobar tras el await: otra petición pudo registrar el mismo email mientras se calculaba el hash
        if (usuarios.some((u) => u.email === emailNormalizado)) {
            return res.status(409).json({ status: 'fail', message: 'Ya existe un usuario con ese email' });
        }
        const nuevoId = usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;
        const nuevoUsuario = { id: nuevoId, email: emailNormalizado, passwordHash, rol, creadoEn: new Date().toISOString() };
        usuarios.push(nuevoUsuario);
        res.status(201).json({ status: 'success', message: 'Usuario registrado correctamente', data: usuarioPublico(nuevoUsuario) });
    } catch (error) {
        next(error);
    }
};
// POST /api/auth/login -> compara con bcrypt.compare y crea req.session.userId
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Email y password son obligatorios' });
        }
        const usuario = usuarios.find((u) => u.email === email.trim().toLowerCase());
        const coincide = await bcrypt.compare(password, usuario ? usuario.passwordHash : await hashRelleno);
        // Mismo mensaje si falla el email o la contraseña: no se revela cuál de los dos es incorrecto
        if (!usuario || !coincide) {
            return res.status(401).json({ status: 'fail', message: 'Credenciales inválidas' });
        }
        // regenerate() entrega un id de sesión nuevo al iniciar sesión (previene session fixation)
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.userId = usuario.id;
            res.status(200).json({ status: 'success', message: 'Inicio de sesión exitoso', data: usuarioPublico(usuario) });
        });
    } catch (error) {
        next(error);
    }
};
// POST /api/auth/logout -> destruye la sesión en el servidor y limpia la cookie
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie(COOKIE_SESION);
        res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
    });
};