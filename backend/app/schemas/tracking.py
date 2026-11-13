from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class ProgressEvidenceBase(BaseModel):
    file_name: str
    file_url: str
    file_type: str
    file_size_bytes: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    captured_at: Optional[datetime] = None
    description: Optional[str] = None

class ProgressEvidenceCreate(ProgressEvidenceBase):
    pass

class ProgressEvidenceResponse(ProgressEvidenceBase):
    id: str
    report_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityProgressReportBase(BaseModel):
    activity_id: str
    period_date: date
    quantity_executed: float = Field(ge=0.0)

class ActivityProgressReportCreate(ActivityProgressReportBase):
    evidences: Optional[List[ProgressEvidenceCreate]] = []

class SupervisorValidationRequest(BaseModel):
    status: str  # approved, rejected, observed
    comments: Optional[str] = None

class ActivityProgressReportResponse(ActivityProgressReportBase):
    id: str
    tenant_id: str
    reported_by_id: str
    reported_at: datetime
    supervisor_status: str
    supervisor_id: Optional[str] = None
    supervisor_reviewed_at: Optional[datetime] = None
    supervisor_comments: Optional[str] = None
    evidences: List[ProgressEvidenceResponse] = []

    class Config:
        from_attributes = True

