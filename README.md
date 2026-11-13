# Sistema de Gerencia de Proyectos Municipal (SGP SaaS)

> Plataforma en línea (modelo SaaS) para la programación, seguimiento y reporte de la ejecución física de obras y proyectos, articulada con la planificación institucional (PTDI, PEI y POA).

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20/%20SQLite-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)

---

## 🏛️ Descripción General

El **SGP Municipal** resuelve la histórica desconexión entre la planificación institucional en papel/planillas y la ejecución física real en obras de campo. 

Centraliza la gestión municipal bajo un esquema **Multi-Tenant (SaaS B2G)** permitiendo:
1. **Programar actividades:** Desglose jerárquico (EDT / WBS) de componentes y tareas con pesos porcentuales.
2. **Congelar la Línea Base:** Snapshot inmutable y versionamiento de cronogramas para auditoría y control de cambios.
3. **Seguimiento en campo (Móvil / PWA):** Reporte periódico de avances físicos con fotografías de respaldo y geolocalización GPS.
4. **Validación del Supervisor:** Ningún avance cuenta en los tableros hasta ser fiscalizado y validado formalmente.
5. **Cálculo automático de semáforos:**
   * **Verde ($\ge 90\%$):** En ruta según cronograma.
   * **Amarillo ($70\% - 89\%$):** En riesgo, requiere seguimiento.
   * **Rojo ($< 70\%$):** Desvío crítico, requiere justificación obligatoria o intervención.
6. **Tablero Ejecutivo del Alcalde:** Vista panorámica institucional con trazabilidad de punta a punta: *Plan Estratégico $\rightarrow$ Área $\rightarrow$ Objetivo $\rightarrow$ Indicador $\rightarrow$ Proyecto $\rightarrow$ Avance Físico*.

---

## 📁 Estructura del Repositorio

```text
├── backend/                       # API REST (FastAPI + SQLAlchemy + JWT)
│   ├── app/
│   │   ├── api/routes/            # Endpoints: auth, dashboard, projects, tracking, strategic
│   │   ├── core/                  # Configuración, base de datos y seguridad
│   │   ├── models/                # Modelos ORM (Tenant, User, Project, Component, Evidence)
│   │   ├── schemas/               # Validaciones Pydantic
│   │   └── services/              # Motor de cálculo matemático de semáforos y avances
│   ├── requirements.txt           # Dependencias de Python
│   ├── run.py                     # Servidor de ejecución Uvicorn
│   └── seed_data.py               # Generador de datos semilla demostrativos
├── frontend/                      # Aplicación Web (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/            # Tablero Alcalde, Proyectos EDT, Módulo de Campo Móvil
│   │   ├── services/              # Cliente API y manejo de tokens
│   │   ├── types.ts               # Tipado TypeScript
│   │   └── App.tsx                # Aplicación principal y selector de roles
│   └── package.json
├── Sistema de Gerencia de Proyectos Municipal (SGP).docx  # Especificación funcional
├── Sistema de Gerencia de Proyectos Municipal (SGP).pptx  # Presentación para autoridades
├── iniciar_sistema.bat            # Lanzador de 1 clic para Windows
├── iniciar_sistema.ps1            # Lanzador PowerShell
└── README.md
```

---

## ⚡ Puesta en Marcha Rápida

### Opción 1: Lanzador Automático (Windows)
Haz doble clic sobre el archivo `iniciar_sistema.bat` o ejecuta en PowerShell:
```powershell
.\iniciar_sistema.ps1
```

### Opción 2: Ejecución Manual

#### 1. Backend (FastAPI)
```powershell
# Crear y activar entorno virtual
python -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r backend\requirements.txt

# Poblar base de datos con datos de prueba
$env:PYTHONPATH = "backend"
python backend\seed_data.py

# Iniciar servidor (puerto 8000)
python backend\run.py
```
* **Documentación interactiva Swagger:** `http://localhost:8000/api/v1/docs`

#### 2. Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
* **Plataforma Web:** `http://localhost:5173`

---

## 👥 Credenciales de Prueba del Sistema

| Rol | Correo | Contraseña | Vista / Atribución |
| :--- | :--- | :--- | :--- |
| **Alcalde / Ejecutivo** | `alcalde@sgp.gob` | `admin123` | Tablero general de avance y alertas de obras críticas |
| **Director de Obras** | `director.obras@sgp.gob` | `admin123` | Aprobación de proyectos y revisión de secretaría |
| **Residente de Obra** | `responsable.obras@sgp.gob` | `admin123` | Programación y reporte mensual de avance físico |
| **Fiscal / Supervisor** | `supervisor.fiscal@sgp.gob` | `admin123` | Validación de campo y aprobación con fotos/GPS |
| **Planificación** | `planificacion@sgp.gob` | `admin123` | Gestión de áreas, objetivos e indicadores |

---

## 📄 Licencia y Créditos
Desarrollado para el **Proyecto de Grado en Ingeniería de Sistemas de Información (ISI)**.
Propuesta de modelo SaaS para Gobiernos Autónomos Municipales.

