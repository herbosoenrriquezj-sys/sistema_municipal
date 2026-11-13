from datetime import date
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectComponent, ProjectActivity, ActivityPlannedPeriod
from app.models.tracking import ActivityProgressReport
from app.models.strategic import StrategicArea

def calculate_activity_progress(activity: ProjectActivity, db: Session, target_date: date = None) -> Dict[str, Any]:
    """
    Calcula el avance real acumulado y el programado acumulado de una actividad.
    Solo considera reportes aprobados por el supervisor.
    """
    # 1. Avance Real Aprobado
    reports_query = db.query(ActivityProgressReport).filter(
        ActivityProgressReport.activity_id == activity.id,
        ActivityProgressReport.supervisor_status == "approved"
    )
    if target_date:
        reports_query = reports_query.filter(ActivityProgressReport.period_date <= target_date)
    
    total_executed = sum(float(r.quantity_executed) for r in reports_query.all())
    target_qty = float(activity.total_target_quantity) if activity.total_target_quantity else 1.0

    real_pct = (total_executed / target_qty) * 100.0 if target_qty > 0 else 0.0
    real_pct = min(real_pct, 100.0)  # Tope al 100%

    # 2. Avance Programado a la fecha
    planned_query = db.query(ActivityPlannedPeriod).filter(
        ActivityPlannedPeriod.activity_id == activity.id
    )
    if target_date:
        planned_query = planned_query.filter(ActivityPlannedPeriod.period_date <= target_date)
    
    total_planned = sum(float(p.planned_quantity) for p in planned_query.all())
    planned_pct = (total_planned / target_qty) * 100.0 if target_qty > 0 else 0.0
    planned_pct = min(planned_pct, 100.0)

    # 3. Índice de cumplimiento y semáforo
    if planned_pct > 0:
        compliance_index = round(real_pct / planned_pct, 2)
    else:
        compliance_index = 1.0 if real_pct >= 0 else 0.0

    traffic_light = get_traffic_light(compliance_index)

    return {
        "activity_id": activity.id,
        "name": activity.name,
        "unit": activity.unit_of_measure,
        "weight_pct": float(activity.weight_percentage),
        "total_target_quantity": target_qty,
        "total_executed": round(total_executed, 2),
        "real_progress_pct": round(real_pct, 2),
        "planned_progress_pct": round(planned_pct, 2),
        "compliance_index": compliance_index,
        "traffic_light": traffic_light
    }

def calculate_project_progress(project_id: str, db: Session, target_date: date = None) -> Dict[str, Any]:
    """
    Calcula el avance ponderado total de un proyecto a partir de sus componentes y actividades.
    Fórmula: Avance Proyecto = sum(Avance Componente * Peso Componente / 100)
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {}

    components_data = []
    project_real_pct = 0.0
    project_planned_pct = 0.0

    for comp in project.components:
        comp_weight = float(comp.weight_percentage)
        activities_data = []
        comp_real_sum = 0.0
        comp_planned_sum = 0.0

        for act in comp.activities:
            act_prog = calculate_activity_progress(act, db, target_date)
            act_weight = float(act.weight_percentage)

            comp_real_sum += (act_prog["real_progress_pct"] * act_weight / 100.0)
            comp_planned_sum += (act_prog["planned_progress_pct"] * act_weight / 100.0)
            activities_data.append(act_prog)

        comp_real_pct = round(comp_real_sum, 2)
        comp_planned_pct = round(comp_planned_sum, 2)

        project_real_pct += (comp_real_pct * comp_weight / 100.0)
        project_planned_pct += (comp_planned_pct * comp_weight / 100.0)

        components_data.append({
            "component_id": comp.id,
            "name": comp.name,
            "weight_pct": comp_weight,
            "real_progress_pct": comp_real_pct,
            "planned_progress_pct": comp_planned_pct,
            "activities": activities_data
        })

    project_real_pct = round(project_real_pct, 2)
    project_planned_pct = round(project_planned_pct, 2)

    compliance_index = round(project_real_pct / project_planned_pct, 2) if project_planned_pct > 0 else 1.0
    traffic_light = get_traffic_light(compliance_index)

    return {
        "project_id": project.id,
        "code": project.code,
        "name": project.name,
        "status": project.status,
        "strategic_area_id": project.strategic_area_id,
        "strategic_area_name": project.strategic_area.name if project.strategic_area else "",
        "budget_allocated": float(project.budget_allocated),
        "location_name": project.location_name or "Ubicación Municipal",
        "latitude": float(project.latitude) if project.latitude else None,
        "longitude": float(project.longitude) if project.longitude else None,
        "real_progress_pct": project_real_pct,
        "planned_progress_pct": project_planned_pct,
        "compliance_index": compliance_index,
        "traffic_light": traffic_light,
        "components": components_data
    }

def calculate_area_progress(area_id: str, db: Session, target_date: date = None) -> Dict[str, Any]:
    """
    Calcula el avance general de un Área Estratégica ponderando sus proyectos.
    """
    area = db.query(StrategicArea).filter(StrategicArea.id == area_id).first()
    if not area:
        return {}

    projects = area.projects
    if not projects:
        return {
            "area_id": area.id,
            "name": area.name,
            "code": area.code,
            "weight_pct": float(area.weight_percentage),
            "real_progress_pct": 0.0,
            "planned_progress_pct": 0.0,
            "compliance_index": 1.0,
            "traffic_light": "green",
            "total_projects": 0,
            "projects_summary": []
        }

    projects_summary = []
    total_real = 0.0
    total_planned = 0.0

    for p in projects:
        prog = calculate_project_progress(p.id, db, target_date)
        projects_summary.append(prog)
        total_real += prog.get("real_progress_pct", 0.0)
        total_planned += prog.get("planned_progress_pct", 0.0)

    count = len(projects)
    avg_real = round(total_real / count, 2)
    avg_planned = round(total_planned / count, 2)
    compliance = round(avg_real / avg_planned, 2) if avg_planned > 0 else 1.0

    return {
        "area_id": area.id,
        "name": area.name,
        "code": area.code,
        "weight_pct": float(area.weight_percentage),
        "real_progress_pct": avg_real,
        "planned_progress_pct": avg_planned,
        "compliance_index": compliance,
        "traffic_light": get_traffic_light(compliance),
        "total_projects": count,
        "projects_summary": projects_summary
    }

def get_traffic_light(compliance_index: float) -> str:
    """
    Regla del documento:
    - Verde: 90% o más (compliance_index >= 0.90)
    - Amarillo: entre 70% y 89% (compliance_index >= 0.70 y < 0.90)
    - Rojo: menos de 70% (compliance_index < 0.70)
    """
    if compliance_index >= 0.90:
        return "green"
    elif compliance_index >= 0.70:
        return "yellow"
    else:
        return "red"

