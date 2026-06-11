@echo off
cd /d "%~dp0"
title BTC Dashboard
set "PORT=4173"
set "HOST=127.0.0.1"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado o no esta en el PATH.
  echo Instala Node.js desde https://nodejs.org/ y vuelve a intentar.
  pause
  exit /b 1
)

echo Iniciando BTC Dashboard...
echo.
echo Manten esta ventana abierta mientras uses el dashboard.
echo URL: http://%HOST%:%PORT%
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 20; $i++) { try { Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -UseBasicParsing -TimeoutSec 1 | Out-Null; Start-Process 'http://127.0.0.1:4173'; exit 0 } catch { Start-Sleep -Milliseconds 500 } }; Start-Process 'http://127.0.0.1:4173'"
node server.mjs

echo.
echo El servidor se detuvo.
pause
