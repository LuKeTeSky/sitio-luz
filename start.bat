@echo off
echo ========================================
echo    LUZ - Portfolio de Moda y Fotografia
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor...
echo Sitio publico: http://localhost:3000
echo Panel admin: http://localhost:3000/admin
echo Login: http://localhost:3000/login
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm start

pause 