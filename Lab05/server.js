const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Petición recibida: ${req.method} ${req.url}`);

    // Requerimiento: Servir archivos estáticos del frontend (HTML, JS) desde la carpeta /public
    if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/public/') || req.url.endsWith('.js') || req.url.endsWith('.html'))) {
        const targetPath = req.url === '/' ? 'index.html' : req.url;
        const filePath = path.join(__dirname, 'public', targetPath);

        const extname = path.extname(filePath);
        let contentType = 'text/html; charset=utf-8';
        if (extname === '.js') contentType = 'application/javascript; charset=utf-8';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Archivo no encontrado' }));
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
   
    // Requerimiento: Endpoint de control de estado del servidor
    } else if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ 
            status: 'OK', 
            uptime: process.uptime()
        }));

    // Requerimiento: API GET para leer y retornar los registros del archivo JSON (estudiantes.json)
    } else if (req.url === '/api/estudiantes' && req.method === 'GET') {
        const filePath = path.join(__dirname, 'data', 'estudiantes.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error al leer la base de datos' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(data);
            }
        });

    // Requerimiento: API POST para recibir datos, calcular ID autoincremental y persistirlos en el JSON
    } else if (req.url === '/api/estudiantes' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const datosNuevos = JSON.parse(body);
                const filePath = path.join(__dirname, 'data', 'estudiantes.json');

                fs.readFile(filePath, 'utf8', (err, data) => {
                    const estudiantes = err ? [] : JSON.parse(data);
                    
                    // Implementación de ID automático según la cantidad de elementos actuales
                    const nuevoId = estudiantes.length + 1;

                    const nuevoEstudiante = {
                        id: nuevoId,
                        nombre: datosNuevos.nombre,
                        carrera: datosNuevos.carrera
                    };

                    estudiantes.push(nuevoEstudiante);

                    fs.writeFile(filePath, JSON.stringify(estudiantes, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Error al guardar el estudiante' }));
                        } else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Estudiante registrado con éxito', estudiante: nuevoEstudiante }));
                        }
                    });
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'JSON mal formado' }));
            }
        });

    // Requerimiento: Manejo estándar de rutas no encontradas (404)
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: 'Recurso no encontrado' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});