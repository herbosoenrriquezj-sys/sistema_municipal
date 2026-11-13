from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.strategic import StrategicArea, StrategicObjective, Indicator
from app.schemas.strategic import (
    StrategicAreaCreate, StrategicAreaResponse,
    StrategicObjectiveCreate, StrategicObjectiveResponse,
    IndicatorCreate, IndicatorResponse
)

router = APIRouter(prefix="/strategic", tags=["Planificación Institucional"])

@router.get("/areas", response_model=List[StrategicAreaResponse])
def list_strategic_areas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista las áreas estratégicas del municipio del usuario logueado.
    """
    areas = db.query(StrategicArea).filter(
        StrategicArea.tenant_id == current_user.tenant_id
    ).order_index = StrategicArea.order_index
    return db.query(StrategicArea).filter(StrategicArea.tenant_id == current_user.tenant_id).order_by(StrategicArea.order_index).all()

@router.post("/areas", response_model=StrategicAreaResponse, status_code=status.HTTP_201_CREATED)
def create_strategic_area(
    area_in: StrategicAreaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea una nueva área estratégica (ej. Infraestructura, Desarrollo Humano).
    """
    existing = db.query(StrategicArea).filter(
        StrategicArea.tenant_id == current_user.tenant_id,
        StrategicArea.code == area_in.code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un área con ese código en este municipio.")

    new_area = StrategicArea(
        tenant_id=current_user.tenant_id,
        **area_in.model_dump()
    )
    db.add(new_area)
    db.commit()
    db.refresh(new_area)
    return new_area

@router.post("/objectives", response_model=StrategicObjectiveResponse, status_code=status.HTTP_201_CREATED)
def create_objective(
    obj_in: StrategicObjectiveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_obj = StrategicObjective(
        tenant_id=current_user.tenant_id,
        **obj_in.model_dump()
    )
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)
    return new_obj

@router.post("/indicators", response_model=IndicatorResponse, status_code=status.HTTP_201_CREATED)
def create_indicator(
    ind_in: IndicatorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_ind = Indicator(
        tenant_id=current_user.tenant_id,
        **ind_in.model_dump()
    )
    db.add(new_ind)
    db.commit()
    db.refresh(new_ind)
    return new_ind

