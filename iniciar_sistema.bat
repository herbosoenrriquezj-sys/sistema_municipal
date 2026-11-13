@echo off
title Sistema de Gerencia de Proyectos Municipal (SGP SaaS)
echo ======================================================================
echo    INICIANDO SISTEMA DE GERENCIA DE PROYECTOS MUNICIPAL (SGP)
echo ======================================================================
echo.

echo 1. Iniciando Servidor Backend (FastAPI en http://localhost:8000)...
start "SGP Backend (FastAPI)" cmd /k "backend\.venv\Scripts\python.exe backend\run.py"

echo 2. Iniciando Servidor Frontend (React + Vite en http://localhost:5173)...
start "SGP Frontend (React + Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  Todo listo!
echo  - Frontend Web: http://localhost:5173
echo  - Backend API:  http://localhost:8000/api/v1/docs
echo ======================================================================
echo.
timeout /t 5
start http://localhost:5173

