#!/bin/bash

echo "========================================"
echo "   LUZ - Portfolio de Moda y Fotografia"
echo "========================================"
echo

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: No se pudieron instalar las dependencias"
        exit 1
    fi
fi

echo
echo "Iniciando servidor..."
echo "Sitio público: http://localhost:3000"
echo "Panel admin: http://localhost:3000/admin"
echo "Login: http://localhost:3000/login"
echo
echo "Presiona Ctrl+C para detener el servidor"
echo

npm start 