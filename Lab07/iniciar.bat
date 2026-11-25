@echo off
rem iniciar.bat - Lanzador del proyecto (Windows)
cd /d "%~dp0"

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo Se creo el archivo .env a partir de .env.example
)

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo Iniciando el servidor. Abre http://localhost:3000 en el navegador.
call npm start
pause