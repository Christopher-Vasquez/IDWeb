# Artesanías y Artes Manuales: Autenticación, Sesiones y Seguridad (Lab 07)

Proyecto del **Grupo 01** de Introducción al Desarrollo Web. API desarrollada con **Node.js y Express** para una plataforma de artesanías (alfarería, cerámicas, ebanistería, hilados y tejidos, mueblería rústica). Permite que artesanos y clientes se registren, inicien sesión y accedan a recursos protegidos.

## 1. Requisitos
- Node.js 18.11 o superior y npm
- Postman (o Thunder Client) para probar la API

## 2. Cómo ejecutarlo

**Opción A: archivo ejecutable (Windows).** Doble clic en `iniciar.bat`. Crea el `.env` si falta, instala las dependencias la primera vez y arranca el servidor.

**Opción B: terminal** (dentro de la carpeta `Lab07`):
```powershell
Copy-Item .env.example .env
npm install
npm run dev
```
Debe aparecer `API Artesanías en http://localhost:3000`. Abre esa dirección en el navegador para ver la interfaz. Para detener el servidor: `Ctrl + C`.

El archivo `.env` **no se sube al repositorio** (está en `.gitignore`). La plantilla es `.env.example`:
```text
PORT=3000
SESSION_SECRET=clave_secreta_super_segura
```
Esa clave es solo de práctica; en un sistema real debe ser larga, aleatoria y distinta en cada entorno.

## 3. Estructura
```text
Lab07/
├── app.js                       Punto de entrada, sesión y middlewares globales
├── routes/                      authRoutes, perfilRoutes, productoRoutes
├── controllers/                 authController, perfilController, productoController
├── middlewares/                 authMiddleware, roleMiddleware, logger, errorHandler
├── data/                        usuarios.js, productos.js (persistencia en memoria)
├── utils/usuarioPublico.js      Lista blanca de campos que se devuelven al cliente
├── public/                      Interfaz web (la sirve Express)
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js               Script del NAVEGADOR (no confundir con app.js del servidor)
├── postman/                     Colección de pruebas (flujo completo)
├── .env.example                 Plantilla de variables de entorno
├── iniciar.bat                  Lanzador para Windows
└── package.json
```

## 4. Interfaz web
Disponible en `http://localhost:3000` con el servidor en marcha:
- **Catálogo público** con filtro por las 5 categorías (alfarería, cerámica, ebanistería, hilados y tejidos, mueblería rústica).
- **Registro e inicio de sesión**, eligiendo el rol cliente o artesano.
- **Panel de cuenta** con el usuario autenticado y botón para cerrar sesión. La sesión se mantiene al recargar la página.
- **Formulario para publicar piezas**, visible solo para artesanos. Los clientes ven un aviso.
- Diseño adaptable a celular, tablet y escritorio. Los datos se muestran con `textContent`, no como HTML, para evitar XSS.

## 5. Endpoints

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/api/auth/register` | Público | 201, 400, 409 |
| POST | `/api/auth/login` | Público | 200, 400, 401 |
| POST | `/api/auth/logout` | Público | 200 |
| GET | `/api/perfil` | Sesión iniciada | 200, 401 |
| GET | `/api/productos?categoria=ceramica` | Público | 200, 400 |
| POST | `/api/productos` | Sesión + rol `artesano` | 201, 400, 401, 403 |

Categorías: `alfareria`, `ceramica`, `ebanisteria`, `hilados-tejidos`, `muebleria-rustica`.
Roles: `cliente` (por defecto) y `artesano`.

**Ejemplo de registro** (`POST /api/auth/register`):
```json
{ "email": "rosa@taller.com", "password": "Clave12345", "rol": "artesano" }
```

## 6. Seguridad aplicada
- **Hash con sal:** las contraseñas se cifran con `bcryptjs` (10 salt rounds, asíncrono) y se comparan con `bcrypt.compare()`. Nunca se guarda el texto plano.
- **Sin datos sensibles en las respuestas:** el hash no se devuelve en ningún JSON.
- **Cookie de sesión:** `httpOnly`, `sameSite: lax`, expira a la hora y `secure` en producción.
- **Secretos en `.env`:** el servidor no arranca si falta `SESSION_SECRET`.
- **Autenticación y autorización separadas:** `authMiddleware` (401) y `roleMiddleware` (403).
- **Credenciales genéricas:** el login responde igual si falla el email o la contraseña, y tarda lo mismo en ambos casos.
- **Nueva sesión al iniciar sesión** (`regenerate`) y **cierre completo** con `destroy()` y limpieza de la cookie.

## 7. Pruebas
En Postman: `Import` → `postman/Lab07_Autenticacion.postman_collection.json` → `Run collection`. Ejecuta el flujo Registro → Login → Rutas privadas → Roles → Logout, con 34 aserciones. Se puede repetir sin reiniciar el servidor.

## 8. Limitaciones conocidas
- Los datos y las sesiones están en memoria: se pierden al reiniciar el servidor (en producción se usaría una base de datos y un almacén de sesiones como Redis).
- No incluye límite de intentos de login ni tokens CSRF (la cookie `sameSite` mitiga parte de ese riesgo).
- Para usar la cookie `secure` hace falta servir la aplicación por HTTPS.