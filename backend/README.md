# Backend SGP Municipal (SaaS B2G)

API REST desarrollada con **FastAPI**, **SQLAlchemy** y **Pydantic** para la programación, seguimiento físico y articulación estratégica de proyectos de gobiernos municipales.

---

## 🚀 Inicio Rápido

### 1. Activar el Entorno Virtual
En Windows PowerShell:
```powershell
backend\.venv\Scripts\Activate.ps1
```

### 2. Poblar la Base de Datos con Datos de Prueba
Para regenerar las tablas y los datos demostrativos (proyectos con semáforo verde y rojo):
```powershell
$env:PYTHONPATH = "backend"
backend\.venv\Scripts\python.exe backend\seed_data.py
```

### 3. Levantar el Servidor de Desarrollo
```powershell
backend\.venv\Scripts\python.exe backend\run.py
```
El servidor quedará disponible en:
* **API Principal:** `http://localhost:8000`
* **Swagger UI (Documentación interactiva):** `http://localhost:8000/api/v1/docs`
* **ReDoc:** `http://localhost:8000/api/v1/redoc`

---

## 🔑 Credenciales Demostrativas Creadas

| Rol Municipal | Correo | Contraseña | Función |
| :--- | :--- | :--- | :--- |
| **Alcalde / Ejecutivo** | `alcalde@sgp.gob` | `admin123` | Tablero general de avance y alertas de desvíos |
| **Director de Obras** | `director.obras@sgp.gob` | `admin123` | Aprobación de proyectos y revisión de su secretaría |
| **Responsable de Obra** | `responsable.obras@sgp.gob` | `admin123` | Programación y reporte mensual de avance físico |
| **Supervisor Fiscal** | `supervisor.fiscal@sgp.gob` | `admin123` | Verificación en campo y aprobación de reportes con fotos |
| **Planificación** | `planificacion@sgp.gob` | `admin123` | Gestión del árbol estratégico (áreas, objetivos, indicadores) |

---

## 📡 Módulos y Endpoints Principales

* **`POST /api/v1/auth/login-json`**: Autenticación JWT por rol y tenant.
* **`GET /api/v1/dashboard/executive-summary`**: Tablero consolidado para el Alcalde (avance global, % por área estratégica, proyectos críticos en rojo).
* **`GET /api/v1/projects`**: Lista de proyectos con filtros por secretaría y estado.
* **`GET /api/v1/projects/{id}/progress`**: Cálculo en tiempo real del avance ponderado ($\sum \text{avance}_i \times \text{peso}_i$), índice de cumplimiento y semáforo.
* **`POST /api/v1/projects/{id}/freeze-baseline`**: Congelamiento de línea base histórica inmutable para auditoría.
* **`POST /api/v1/tracking/reports`**: Registro de avance físico con evidencias (fotos/GPS).
* **`POST /api/v1/tracking/reports/{id}/validate`**: Aprobación o rechazo del supervisor fiscal.

