from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class ActivityPlannedPeriodBase(BaseModel):
    period_date: date
    planned_quantity: float
    planned_budget: Optional[float] = 0.0

class ActivityPlannedPeriodCreate(ActivityPlannedPeriodBase):
    pass

class ActivityPlannedPeriodResponse(ActivityPlannedPeriodBase):
    id: str
    activity_id: str

    class Config:
        from_attributes = True

class ProjectActivityBase(BaseModel):
    code: str
    name: str
    unit_of_measure: str
    total_target_quantity: float
    weight_percentage: float = Field(ge=0.0, le=100.0)
    start_date: date
    end_date: date
    order_index: int = 1

class ProjectActivityCreate(ProjectActivityBase):
    component_id: str
    planned_periods: Optional[List[ActivityPlannedPeriodCreate]] = []

class ProjectActivityResponse(ProjectActivityBase):
    id: str
    component_id: str
    planned_periods: List[ActivityPlannedPeriodResponse] = []

    class Config:
        from_attributes = True

class ProjectComponentBase(BaseModel):
    code: str
    name: str
    weight_percentage: float = Field(ge=0.0, le=100.0)
    order_index: int = 1

class ProjectComponentCreate(ProjectComponentBase):
    project_id: str

class ProjectComponentResponse(ProjectComponentBase):
    id: str
    project_id: str
    activities: List[ProjectActivityResponse] = []

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    budget_allocated: float = 0.0
    funding_source: Optional[str] = None
    start_date_planned: date
    end_date_planned: date
    strategic_area_id: str
    indicator_id: Optional[str] = None
    responsible_id: str
    supervisor_id: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    tenant_id: str
    status: str
    baseline_frozen_at: Optional[datetime] = None
    created_at: datetime
    components: List[ProjectComponentResponse] = []

    class Config:
        from_attributes = True

