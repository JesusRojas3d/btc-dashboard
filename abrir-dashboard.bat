@echo off
cd /d "%~dp0"
title Abrir BTC Dashboard

echo Abriendo BTC Dashboard sin servidor local...
echo.
echo Si el navegador pregunta permisos para cargar contenido local, permite la carga.
echo.

start "" "%cd%\index.html"
