from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.strategic import StrategicArea
from app.models.project import Project
from app.services.calculation import calculate_area_progress, calculate_project_progress, get_traffic_light

router = APIRouter(prefix="/dashboard", tags=["Tablero Ejecutivo Alcalde / Directores"])

@router.get("/executive-summary")
def get_executive_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retorna el tablero consolidado de gestión municipal para el Alcalde:
    - Avance global institucional.
    - Cumplimiento por Área Estratégica.
    - Proyectos críticos en estado de alerta (Rojo / Desvío > 30%).
    """
    areas = db.query(StrategicArea).filter(
        StrategicArea.tenant_id == current_user.tenant_id
    ).order_by(StrategicArea.order_index).all()

    areas_summary = []
    total_weighted_real = 0.0
    total_weighted_planned = 0.0
    critical_projects = []

    for area in areas:
        area_calc = calculate_area_progress(area.id, db)
        weight = float(area.weight_percentage)
        
        # Ponderación al avance general institucional
        total_weighted_real += (area_calc["real_progress_pct"] * weight / 100.0)
        total_weighted_planned += (area_calc["planned_progress_pct"] * weight / 100.0)
        
        # Detectar proyectos en rojo
        for proj in area_calc.get("projects_summary", []):
            if proj.get("traffic_light") == "red":
                critical_projects.append({
                    "project_id": proj["project_id"],
                    "code": proj["code"],
                    "name": proj["name"],
                    "area_name": area.name,
                    "budget": proj["budget_allocated"],
                    "real_progress_pct": proj["real_progress_pct"],
                    "planned_progress_pct": proj["planned_progress_pct"],
                    "compliance_index": proj["compliance_index"]
                })
        
        areas_summary.append(area_calc)

    global_real = round(total_weighted_real, 2)
    global_planned = round(total_weighted_planned, 2)
    global_compliance = round(global_real / global_planned, 2) if global_planned > 0 else 1.0

    # Conteo de proyectos totales
    total_projects_count = db.query(Project).filter(Project.tenant_id == current_user.tenant_id).count()

    return {
        "institution_name": current_user.tenant.name if current_user.tenant else "Municipio",
        "total_projects": total_projects_count,
        "global_real_progress_pct": global_real,
        "global_planned_progress_pct": global_planned,
        "global_compliance_index": global_compliance,
        "global_traffic_light": get_traffic_light(global_compliance),
        "areas_summary": areas_summary,
        "critical_projects_count": len(critical_projects),
        "critical_projects": critical_projects
    }

