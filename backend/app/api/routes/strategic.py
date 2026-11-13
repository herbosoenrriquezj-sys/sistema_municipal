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
    Lista las áreas estratégicas del municipio del usuario logueado con sus objetivos e indicadores.
    """
    return db.query(StrategicArea).filter(
        StrategicArea.tenant_id == current_user.tenant_id
    ).order_by(StrategicArea.order_index).all()

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

@router.get("/indicators-tree")
def get_strategic_indicators_tree(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna el árbol estratégico completo (Áreas -> Objetivos -> Indicadores)
    con el cálculo del avance acumulado a partir de los proyectos vinculados.
    """
    from app.services.calculation import calculate_project_progress, get_traffic_light

    areas = db.query(StrategicArea).filter(
        StrategicArea.tenant_id == current_user.tenant_id
    ).order_by(StrategicArea.order_index).all()

    result = []
    for area in areas:
        area_dict = {
            "id": area.id,
            "code": area.code,
            "name": area.name,
            "weight_percentage": float(area.weight_percentage),
            "objectives": []
        }
        for obj in area.objectives:
            obj_dict = {
                "id": obj.id,
                "code": obj.code,
                "description": obj.description,
                "target_year": obj.target_year,
                "indicators": []
            }
            for ind in obj.indicators:
                linked_projects = ind.projects
                total_target = float(ind.target_value)
                
                current_value = 0.0
                for proj in linked_projects:
                    prog = calculate_project_progress(proj.id, db)
                    real_pct = prog.get("real_progress_pct", 0.0)
                    current_value += (real_pct / 100.0) * total_target

                current_value = round(current_value, 2)
                progress_pct = round((current_value / total_target) * 100.0, 2) if total_target > 0 else 0.0
                traffic_light = get_traffic_light(progress_pct / 100.0)

                ind_dict = {
                    "id": ind.id,
                    "code": ind.code,
                    "name": ind.name,
                    "unit_of_measure": ind.unit_of_measure,
                    "baseline_value": float(ind.baseline_value),
                    "target_value": total_target,
                    "current_value": current_value,
                    "progress_pct": progress_pct,
                    "traffic_light": traffic_light,
                    "frequency": ind.frequency,
                    "verification_source": ind.verification_source,
                    "linked_projects": [
                        {
                            "id": p.id,
                            "code": p.code,
                            "name": p.name,
                            "status": p.status
                        }
                        for p in linked_projects
                    ]
                }
                obj_dict["indicators"].append(ind_dict)
            area_dict["objectives"].append(obj_dict)
        result.append(area_dict)

    return result

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

