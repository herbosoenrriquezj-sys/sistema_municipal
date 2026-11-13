from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project, ProjectComponent, ProjectActivity, ActivityPlannedPeriod
from app.models.change_control import ProjectBaseline
from app.schemas.project import (
    ProjectCreate, ProjectResponse,
    ProjectComponentCreate, ProjectComponentResponse,
    ProjectActivityCreate, ProjectActivityResponse
)
from app.services.calculation import calculate_project_progress

router = APIRouter(prefix="/projects", tags=["Proyectos y Programación"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    area_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project).filter(Project.tenant_id == current_user.tenant_id)
    if area_id:
        query = query.filter(Project.strategic_area_id == area_id)
    if status_filter:
        query = query.filter(Project.status == status_filter)
    return query.order_by(Project.created_at.desc()).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.tenant_id == current_user.tenant_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project

@router.get("/{project_id}/progress")
def get_project_progress_metric(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna el avance físico ponderado en porcentaje, el índice de cumplimiento y el semáforo.
    """
    progress = calculate_project_progress(project_id, db)
    if not progress:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return progress

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    proj_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_proj = Project(
        tenant_id=current_user.tenant_id,
        **proj_in.model_dump()
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return new_proj

@router.post("/components", response_model=ProjectComponentResponse, status_code=status.HTTP_201_CREATED)
def add_component(
    comp_in: ProjectComponentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_comp = ProjectComponent(
        tenant_id=current_user.tenant_id,
        **comp_in.model_dump()
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)
    return new_comp

@router.post("/activities", response_model=ProjectActivityResponse, status_code=status.HTTP_201_CREATED)
def add_activity(
    act_in: ProjectActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = act_in.model_dump()
    planned_periods = data.pop("planned_periods", [])

    new_act = ProjectActivity(
        tenant_id=current_user.tenant_id,
        **data
    )
    db.add(new_act)
    db.flush()

    for p in planned_periods:
        period_obj = ActivityPlannedPeriod(
            tenant_id=current_user.tenant_id,
            activity_id=new_act.id,
            **p
        )
        db.add(period_obj)

    db.commit()
    db.refresh(new_act)
    return new_act

@router.post("/{project_id}/freeze-baseline")
def freeze_project_baseline(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Congela la línea base del proyecto una vez aprobada.
    Genera un snapshot inmutable para auditoría.
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.tenant_id == current_user.tenant_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Snapshot estructural
    snapshot = {
        "frozen_at": datetime.now(timezone.utc).isoformat(),
        "budget_allocated": float(project.budget_allocated),
        "start_date": str(project.start_date_planned),
        "end_date": str(project.end_date_planned),
        "components": [
            {
                "id": c.id,
                "name": c.name,
                "weight": float(c.weight_percentage),
                "activities": [
                    {
                        "id": a.id,
                        "name": a.name,
                        "unit": a.unit_of_measure,
                        "target_qty": float(a.total_target_quantity),
                        "weight": float(a.weight_percentage)
                    }
                    for a in c.activities
                ]
            }
            for c in project.components
        ]
    }

    # Desactivar líneas previas si existieran
    db.query(ProjectBaseline).filter(
        ProjectBaseline.project_id == project_id
    ).update({"is_active": False})

    version = db.query(ProjectBaseline).filter(ProjectBaseline.project_id == project_id).count() + 1

    baseline = ProjectBaseline(
        tenant_id=current_user.tenant_id,
        project_id=project.id,
        version_number=version,
        snapshot_data=snapshot,
        is_active=True,
        approved_by_id=current_user.id
    )
    project.status = "in_execution"
    project.baseline_frozen_at = datetime.now(timezone.utc)

    db.add(baseline)
    db.commit()

    return {
        "message": f"Línea base v{version} congelada y aprobada exitosamente.",
        "version": version,
        "frozen_at": project.baseline_frozen_at
    }

