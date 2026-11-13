from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.tenant import Tenant
from app.models.project import Project
from app.models.citizen import CitizenInquiry
from app.models.user import User
from app.models.tracking import ProgressEvidence, ActivityProgressReport
from app.services.calculation import calculate_project_progress
from pydantic import BaseModel

router = APIRouter(prefix="/transparency", tags=["Transparencia y Control Social (Ley 341)"])

class CitizenInquiryCreate(BaseModel):
    district: str
    citizen_name: str
    citizen_contact: str
    organization: Optional[str] = None
    category: str = "consulta"
    message: str
    project_id: Optional[str] = None

class CitizenInquiryResponse(BaseModel):
    id: str
    district: str
    citizen_name: str
    citizen_contact: str
    organization: Optional[str] = None
    category: str
    message: str
    status: str
    official_response: Optional[str] = None
    created_at: datetime
    responded_at: Optional[datetime] = None

class CitizenRespondRequest(BaseModel):
    response: str

@router.get("/public-projects")
def get_public_projects(
    district: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Portal de Transparencia Pública para Ciudadanos y Juntas Vecinales (Ley 341 de Control Social).
    Permite fiscalizar proyectos sin necesidad de credenciales.
    """
    tenant = db.query(Tenant).filter(Tenant.code == "MUN-SUCRE-01").first() or db.query(Tenant).first()
    if not tenant:
        return []

    query = db.query(Project).filter(Project.tenant_id == tenant.id)
    if district and district != "Todos":
        query = query.filter(Project.location_name.contains(district))
    if search:
        query = query.filter(
            (Project.name.ilike(f"%{search}%")) |
            (Project.code.ilike(f"%{search}%")) |
            (Project.location_name.ilike(f"%{search}%"))
        )

    projects = query.order_by(Project.created_at.desc()).all()
    results = []

    for p in projects:
        prog = calculate_project_progress(p.id, db)
        
        # Buscar fotos de evidencia recientes de la obra
        evidences = db.query(ProgressEvidence).join(
            ActivityProgressReport, ProgressEvidence.report_id == ActivityProgressReport.id
        ).filter(
            ProgressEvidence.tenant_id == tenant.id
        ).order_by(ProgressEvidence.captured_at.desc()).limit(3).all()

        photo_urls = [
            ev.file_url for ev in evidences 
            if ev.file_url and ev.file_url.startswith("http")
        ]
        if not photo_urls:
            photo_urls = ["https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800"]

        results.append({
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "description": p.description,
            "location_name": p.location_name,
            "latitude": float(p.latitude) if p.latitude else -19.0380,
            "longitude": float(p.longitude) if p.longitude else -65.2580,
            "budget_allocated": float(p.budget_allocated),
            "funding_source": p.funding_source,
            "start_date": str(p.start_date_planned),
            "end_date": str(p.end_date_planned),
            "status": p.status,
            "real_progress_pct": prog.get("real_progress_pct", 0.0),
            "planned_progress_pct": prog.get("planned_progress_pct", 0.0),
            "compliance_index": prog.get("compliance_index", 1.0),
            "traffic_light": prog.get("traffic_light", "green"),
            "photos": photo_urls,
            "supervisor_name": p.supervisor.full_name if p.supervisor else "Fiscalía General de Obras"
        })

    return {
        "municipality": tenant.name,
        "department": tenant.department_state,
        "total_projects": len(results),
        "projects": results
    }

@router.get("/inquiries", response_model=List[CitizenInquiryResponse])
def list_citizen_inquiries(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Listado del buzón público de Control Social y consultas vecinales.
    """
    tenant = db.query(Tenant).filter(Tenant.code == "MUN-SUCRE-01").first() or db.query(Tenant).first()
    if not tenant:
        return []

    query = db.query(CitizenInquiry).filter(CitizenInquiry.tenant_id == tenant.id)
    if district and district != "Todos":
        query = query.filter(CitizenInquiry.district == district)

    return query.order_by(CitizenInquiry.created_at.desc()).all()

@router.post("/inquiries", status_code=status.HTTP_201_CREATED)
def submit_citizen_inquiry(
    inquiry_in: CitizenInquiryCreate,
    db: Session = Depends(get_db)
):
    """
    Envío de reporte o solicitud de control social por un vecino o junta vecinal.
    """
    tenant = db.query(Tenant).filter(Tenant.code == "MUN-SUCRE-01").first() or db.query(Tenant).first()
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant no disponible")

    new_inquiry = CitizenInquiry(
        tenant_id=tenant.id,
        project_id=inquiry_in.project_id,
        district=inquiry_in.district,
        citizen_name=inquiry_in.citizen_name,
        citizen_contact=inquiry_in.citizen_contact,
        organization=inquiry_in.organization,
        category=inquiry_in.category,
        message=inquiry_in.message,
        status="pending"
    )
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    return {
        "success": True,
        "id": new_inquiry.id,
        "message": "Su observación ha sido registrada exitosamente en el buzón municipal de Control Social."
    }

@router.post("/inquiries/{inquiry_id}/respond")
def respond_citizen_inquiry(
    inquiry_id: str,
    resp_in: CitizenRespondRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Respuesta oficial del Supervisor o Director al reporte vecinal.
    """
    inquiry = db.query(CitizenInquiry).filter(CitizenInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")

    inquiry.official_response = resp_in.response
    inquiry.status = "responded"
    inquiry.responded_by_id = current_user.id
    inquiry.responded_at = datetime.now(timezone.utc)

    db.commit()
    return {
        "success": True,
        "message": "Respuesta oficial registrada y publicada para la junta vecinal."
    }
