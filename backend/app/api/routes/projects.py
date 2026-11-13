from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project, ProjectComponent, ProjectActivity, ActivityPlannedPeriod
from app.models.change_control import ProjectBaseline, ReprogrammingRequest
from app.schemas.project import (
    ProjectCreate, ProjectResponse,
    ProjectComponentCreate, ProjectComponentResponse,
    ProjectActivityCreate, ProjectActivityResponse,
    ReprogrammingRequestCreate, ReprogrammingReviewRequest, ReprogrammingResponse
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

@router.post("/{project_id}/reprogramming", response_model=ReprogrammingResponse, status_code=status.HTTP_201_CREATED)
def request_reprogramming(
    project_id: str,
    req_in: ReprogrammingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registra una solicitud formal de reprogramación y causa obligatoria de desvío (Módulo 4.4).
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.tenant_id == current_user.tenant_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    new_request = ReprogrammingRequest(
        tenant_id=current_user.tenant_id,
        project_id=project.id,
        cause_category=req_in.cause_category,
        justification=req_in.justification,
        requested_days_extension=req_in.requested_days_extension,
        status="pending",
        requested_by_id=current_user.id
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/{project_id}/reprogramming", response_model=List[ReprogrammingResponse])
def list_project_reprogrammings(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Historial de solicitudes de reprogramación del proyecto.
    """
    return db.query(ReprogrammingRequest).filter(
        ReprogrammingRequest.project_id == project_id,
        ReprogrammingRequest.tenant_id == current_user.tenant_id
    ).order_by(ReprogrammingRequest.created_at.desc()).all()

@router.post("/reprogramming/{request_id}/review")
def review_reprogramming(
    request_id: str,
    review_in: ReprogrammingReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    El Alcalde o Director de Área aprueba o rechaza la reprogramación.
    Si aprueba, se genera una nueva versión oficial de Línea Base (v2, v3...).
    """
    reprog = db.query(ReprogrammingRequest).filter(
        ReprogrammingRequest.id == request_id,
        ReprogrammingRequest.tenant_id == current_user.tenant_id
    ).first()
    if not reprog:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    reprog.status = review_in.decision
    reprog.review_notes = review_in.review_notes
    reprog.reviewed_by_id = current_user.id
    reprog.reviewed_at = datetime.now(timezone.utc)

    if review_in.decision == "approved":
        project = reprog.project
        if reprog.requested_days_extension > 0:
            project.end_date_planned = project.end_date_planned + timedelta(days=reprog.requested_days_extension)

        # Desactivar líneas previas
        db.query(ProjectBaseline).filter(
            ProjectBaseline.project_id == project.id
        ).update({"is_active": False})

        version = db.query(ProjectBaseline).filter(ProjectBaseline.project_id == project.id).count() + 1

        new_baseline = ProjectBaseline(
            tenant_id=current_user.tenant_id,
            project_id=project.id,
            version_number=version,
            snapshot_data={
                "frozen_at": datetime.now(timezone.utc).isoformat(),
                "budget_allocated": float(project.budget_allocated),
                "end_date_planned": str(project.end_date_planned),
                "reason": f"Reprogramación aprobada: {reprog.cause_category}. {reprog.justification}"
            },
            is_active=True,
            approved_by_id=current_user.id
        )
        db.add(new_baseline)

    db.commit()
    return {
        "status": reprog.status,
        "message": f"Solicitud de reprogramación {reprog.status} exitosamente."
    }


