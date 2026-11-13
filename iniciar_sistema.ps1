Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   INICIANDO SISTEMA DE GERENCIA DE PROYECTOS MUNICIPAL (SGP)        " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Levantando Backend (FastAPI en http://localhost:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "backend\.venv\Scripts\python.exe backend\run.py"

Write-Host "2. Levantando Frontend (React en http://localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host ""
Write-Host "Servicios iniciados en ventanas separadas." -ForegroundColor Green
Write-Host "Abriendo http://localhost:5173 en su navegador..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

