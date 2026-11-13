import uvicorn
import os
import sys

# Asegurar que el directorio backend esté en el sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" Iniciando Servidor API - Sistema de Gerencia de Proyectos Municipal")
    print(" Documentación Swagger UI: http://localhost:8000/api/v1/docs")
    print(" Documentación ReDoc:      http://localhost:8000/api/v1/redoc")
    print("="*60 + "\n")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

