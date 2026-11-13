import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, Text, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    strategic_area_id = Column(String(36), ForeignKey("strategic_areas.id", ondelete="RESTRICT"), nullable=False, index=True)
    indicator_id = Column(String(36), ForeignKey("indicators.id", ondelete="SET NULL"), nullable=True, index=True)
    responsible_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    supervisor_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)
    
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    location_name = Column(String(200))
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    budget_allocated = Column(Numeric(14, 2), nullable=False, default=0.0)
    funding_source = Column(String(100))
    start_date_planned = Column(Date, nullable=False)
    end_date_planned = Column(Date, nullable=False)
    status = Column(String(30), nullable=False, default="draft")  # draft, submitted, approved, in_execution, delayed, suspended, completed
    baseline_frozen_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_tenant_project_code"),
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="projects")
    strategic_area = relationship("StrategicArea", back_populates="projects")
    indicator = relationship("Indicator", back_populates="projects")
    responsible = relationship("User", foreign_keys=[responsible_id], back_populates="responsible_projects")
    supervisor = relationship("User", foreign_keys=[supervisor_id], back_populates="supervised_projects")
    components = relationship("ProjectComponent", back_populates="project", cascade="all, delete-orphan", order_by="ProjectComponent.order_index")
    baselines = relationship("ProjectBaseline", back_populates="project", cascade="all, delete-orphan", order_by="ProjectBaseline.version_number")
    reprogramming_requests = relationship("ReprogrammingRequest", back_populates="project", cascade="all, delete-orphan")


class ProjectComponent(Base):
    __tablename__ = "project_components"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    name = Column(String(200), nullable=False)
    weight_percentage = Column(Numeric(5, 2), nullable=False)
    order_index = Column(Integer, default=1)

    __table_args__ = (
        UniqueConstraint("project_id", "code", name="uq_project_component_code"),
    )

    # Relationships
    project = relationship("Project", back_populates="components")
    activities = relationship("ProjectActivity", back_populates="component", cascade="all, delete-orphan", order_by="ProjectActivity.order_index")


class ProjectActivity(Base):
    __tablename__ = "project_activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id = Column(String(36), ForeignKey("project_components.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    name = Column(String(255), nullable=False)
    unit_of_measure = Column(String(50), nullable=False)
    total_target_quantity = Column(Numeric(12, 2), nullable=False)
    weight_percentage = Column(Numeric(5, 2), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    order_index = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("component_id", "code", name="uq_component_activity_code"),
    )

    # Relationships
    component = relationship("ProjectComponent", back_populates="activities")
    planned_periods = relationship("ActivityPlannedPeriod", back_populates="activity", cascade="all, delete-orphan")
    progress_reports = relationship("ActivityProgressReport", back_populates="activity", cascade="all, delete-orphan")


class ActivityPlannedPeriod(Base):
    __tablename__ = "activity_planned_periods"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String(36), ForeignKey("project_activities.id", ondelete="CASCADE"), nullable=False, index=True)
    period_date = Column(Date, nullable=False)
    planned_quantity = Column(Numeric(12, 2), nullable=False, default=0.0)
    planned_budget = Column(Numeric(14, 2), default=0.0)

    __table_args__ = (
        UniqueConstraint("activity_id", "period_date", name="uq_activity_period"),
    )

    # Relationships
    activity = relationship("ProjectActivity", back_populates="planned_periods")

