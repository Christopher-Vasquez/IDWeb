// app.js - Artesanías y Artes Manuales: API con autenticación, sesiones y seguridad (Lab 07)
require('dotenv').config({ quiet: true }); // Carga PORT y SESSION_SECRET desde el archivo .env

const path = require('path');
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const productoRoutes = require('./routes/productoRoutes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// Los secretos nunca se escriben en el código: si falta SESSION_SECRET el servidor no arranca
if (!process.env.SESSION_SECRET) {
    console.error('Falta SESSION_SECRET. Copia .env.example a .env y vuelve a ejecutar.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by'); // No anunciar la tecnología del servidor en las cabeceras

// Interfaz web: sirve los archivos de la carpeta public/ (index.html, css y js)
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares globales
app.use(logger);
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,               // No regraba la sesión si no cambió
    saveUninitialized: false,    // No crea sesión (ni cookie) hasta que haya algo que guardar
    cookie: {
        httpOnly: true,                                   // JavaScript del navegador no puede leer la cookie (mitiga XSS)
        sameSite: 'lax',                                  // No se envía en peticiones cruzadas de otros sitios (mitiga CSRF)
        secure: process.env.NODE_ENV === 'production',    // En producción solo viaja por HTTPS
        maxAge: 1000 * 60 * 60                            // La sesión expira a la hora
    }
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/productos', productoRoutes);

// Rutas inexistentes (404)
app.use((req, res) => {
    res.status(404).json({ status: 'fail', message: `La ruta ${req.originalUrl} no existe` });
});

// Manejador global de errores: SIEMPRE debe registrarse al final
app.use(errorHandler);

app.listen(PORT, () => console.log(`API Artesanías en http://localhost:${PORT}`));