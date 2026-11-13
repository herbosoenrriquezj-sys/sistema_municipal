from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Carga todos los modelos para SQLAlchemy

# Crear tablas en SQLite o PostgreSQL automáticamente si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API REST para Programación, Seguimiento Físico y Articulación Estratégica Municipal (SGP SaaS)",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configurar CORS para permitir comunicación con el Frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Rutas de la API
from app.api.routes import auth, strategic, projects, tracking, dashboard, transparency

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(strategic.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(tracking.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(transparency.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "sistema": settings.PROJECT_NAME,
        "status": "online",
        "docs": f"{settings.API_V1_STR}/docs"
    }

