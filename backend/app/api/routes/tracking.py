from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_roles
from app.models.user import User
from app.models.tracking import ActivityProgressReport, ProgressEvidence
from app.models.project import ProjectActivity
from app.schemas.tracking import (
    ActivityProgressReportCreate, ActivityProgressReportResponse,
    SupervisorValidationRequest, ProgressEvidenceCreate
)

router = APIRouter(prefix="/tracking", tags=["Seguimiento y Validación en Campo"])

@router.post("/reports", response_model=ActivityProgressReportResponse, status_code=status.HTTP_201_CREATED)
def submit_progress_report(
    report_in: ActivityProgressReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registra un avance físico periódico para una actividad (Responsable de Proyecto).
    """
    activity = db.query(ProjectActivity).filter(ProjectActivity.id == report_in.activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    # Verificar si ya existe reporte para ese periodo
    existing = db.query(ActivityProgressReport).filter(
        ActivityProgressReport.activity_id == report_in.activity_id,
        ActivityProgressReport.period_date == report_in.period_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un reporte registrado para este periodo. Use actualización.")

    data = report_in.model_dump()
    evidences_data = data.pop("evidences", [])

    new_report = ActivityProgressReport(
        tenant_id=current_user.tenant_id,
        reported_by_id=current_user.id,
        supervisor_status="submitted",
        **data
    )
    db.add(new_report)
    db.flush()

    for ev in evidences_data:
        ev_obj = ProgressEvidence(
            tenant_id=current_user.tenant_id,
            report_id=new_report.id,
            **ev
        )
        db.add(ev_obj)

    db.commit()
    db.refresh(new_report)
    return new_report

@router.post("/reports/{report_id}/validate", response_model=ActivityProgressReportResponse)
def validate_progress_report(
    report_id: str,
    val_in: SupervisorValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["supervisor_fiscal", "director_area", "alcalde"]))
):
    """
    El Supervisor o Fiscal aprueba, rechaza u observa el avance reportado.
    """
    report = db.query(ActivityProgressReport).filter(
        ActivityProgressReport.id == report_id,
        ActivityProgressReport.tenant_id == current_user.tenant_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")

    if val_in.status not in ["approved", "rejected", "observed"]:
        raise HTTPException(status_code=400, detail="Estado de validación inválido.")

    report.supervisor_status = val_in.status
    report.supervisor_id = current_user.id
    report.supervisor_reviewed_at = datetime.now(timezone.utc)
    report.supervisor_comments = val_in.comments

    db.commit()
    db.refresh(report)
    return report

@router.get("/reports/pending", response_model=List[ActivityProgressReportResponse])
def list_pending_reports_for_supervisor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bandeja de reportes de campo pendientes de revisión para supervisores.
    """
    return db.query(ActivityProgressReport).filter(
        ActivityProgressReport.tenant_id == current_user.tenant_id,
        ActivityProgressReport.supervisor_status == "submitted"
    ).order_by(ActivityProgressReport.reported_at.desc()).all()

