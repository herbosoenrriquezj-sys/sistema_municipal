from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.strategic import StrategicArea
from app.models.project import Project
from app.models.change_control import ReprogrammingRequest
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

@router.get("/official-report")
def get_official_report_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retorna los datos estructurados para el Informe Oficial de Rendición de Cuentas (Módulo 4.6).
    """
    exec_summary = get_executive_summary(db, current_user)
    
    projects = db.query(Project).filter(
        Project.tenant_id == current_user.tenant_id
    ).order_by(Project.code).all()

    projects_detailed = []
    total_budget = 0.0

    for p in projects:
        prog = calculate_project_progress(p.id, db)
        budget = float(p.budget_allocated)
        total_budget += budget
        
        last_reprog = db.query(ReprogrammingRequest).filter(
            ReprogrammingRequest.project_id == p.id,
            ReprogrammingRequest.status == "approved"
        ).order_by(ReprogrammingRequest.created_at.desc()).first()

        projects_detailed.append({
            "code": p.code,
            "name": p.name,
            "area_name": p.strategic_area.name if p.strategic_area else "General",
            "budget": budget,
            "start_date": str(p.start_date_planned),
            "end_date": str(p.end_date_planned),
            "status": p.status,
            "baseline_version": len(p.baselines) if p.baselines else 1,
            "real_progress_pct": prog.get("real_progress_pct", 0.0),
            "planned_progress_pct": prog.get("planned_progress_pct", 0.0),
            "compliance_index": prog.get("compliance_index", 1.0),
            "traffic_light": prog.get("traffic_light", "green"),
            "variance_reason": last_reprog.cause_category if last_reprog else ("Desvío operativo en campo" if prog.get("traffic_light") == "red" else "En ruta normal"),
            "variance_justification": last_reprog.justification if last_reprog else ""
        })

    return {
        "report_code": f"INF-TEC-{datetime.now().year}-001",
        "generated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M"),
        "institution_name": current_user.tenant.name if current_user.tenant else "Gobierno Autónomo Municipal",
        "department_state": current_user.tenant.department_state if current_user.tenant else "Chuquisaca",
        "evaluated_period": f"Gestión Fiscal {datetime.now().year} - Ejecución Física Acumulada",
        "summary": exec_summary,
        "total_budget": round(total_budget, 2),
        "projects_detailed": projects_detailed,
        "signers": [
            {"title": "Residente de Obra", "name": "Arq. Carlos Méndez", "sub": "Responsable Técnico de Ejecución"},
            {"title": "Supervisor / Fiscal", "name": "Ing. Laura Vargas", "sub": "Fiscal de Obras Públicas"},
            {"title": "Director de Obras", "name": "Ing. Roberto Fernández", "sub": "Secretaría Municipal de Obras"},
            {"title": "Alcalde Municipal", "name": "Alcalde Municipal", "sub": "Máxima Autoridad Ejecutiva (M.A.E.)"}
        ]
    }


