from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class IndicatorBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    unit_of_measure: str
    baseline_value: float = 0.0
    target_value: float
    frequency: str = "monthly"
    calculation_type: str = "automatic_projects"
    verification_source: Optional[str] = None

class IndicatorCreate(IndicatorBase):
    objective_id: str

class IndicatorResponse(IndicatorBase):
    id: str
    tenant_id: str
    objective_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class StrategicObjectiveBase(BaseModel):
    code: str
    description: str
    target_year: int

class StrategicObjectiveCreate(StrategicObjectiveBase):
    area_id: str

class StrategicObjectiveResponse(StrategicObjectiveBase):
    id: str
    tenant_id: str
    area_id: str
    indicators: List[IndicatorResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class StrategicAreaBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    weight_percentage: float = Field(ge=0.0, le=100.0)
    order_index: int = 1

class StrategicAreaCreate(StrategicAreaBase):
    pass

class StrategicAreaResponse(StrategicAreaBase):
    id: str
    tenant_id: str
    objectives: List[StrategicObjectiveResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

