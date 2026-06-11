@echo off
cd /d "%~dp0"
title Diagnostico BTC Dashboard
set "PORT=4173"
set "HOST=127.0.0.1"

echo === BTC Dashboard diagnostico ===
echo Carpeta: %cd%
echo.

echo Buscando Node.js...
where node
if errorlevel 1 (
  echo.
  echo ERROR: Node.js no esta instalado o no esta en el PATH.
  pause
  exit /b 1
)

echo.
echo Version de Node:
node --version

echo.
echo Revisando sintaxis:
node --check server.mjs
if errorlevel 1 goto done
node --check src\app.js
if errorlevel 1 goto done

echo.
echo Probando puerto %PORT%:
netstat -ano | findstr ":%PORT%"

echo.
echo Iniciando servidor. Si todo va bien, debe aparecer:
echo BTC Dashboard running at http://127.0.0.1:4173
echo.
echo Luego abre manualmente http://127.0.0.1:4173
echo Mantén esta ventana abierta.
echo.
node server.mjs

:done
echo.
echo El diagnostico termino o el servidor se detuvo.
pause
