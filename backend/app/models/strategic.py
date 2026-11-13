import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class StrategicArea(Base):
    __tablename__ = "strategic_areas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    weight_percentage = Column(Numeric(5, 2), nullable=False, default=0.0)
    order_index = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_tenant_area_code"),
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="strategic_areas")
    objectives = relationship("StrategicObjective", back_populates="area", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="strategic_area")


class StrategicObjective(Base):
    __tablename__ = "strategic_objectives"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    area_id = Column(String(36), ForeignKey("strategic_areas.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    target_year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_tenant_objective_code"),
    )

    # Relationships
    area = relationship("StrategicArea", back_populates="objectives")
    indicators = relationship("Indicator", back_populates="objective", cascade="all, delete-orphan")


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    objective_id = Column(String(36), ForeignKey("strategic_objectives.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(30), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    unit_of_measure = Column(String(50), nullable=False)
    baseline_value = Column(Numeric(12, 2), nullable=False, default=0.0)
    target_value = Column(Numeric(12, 2), nullable=False)
    frequency = Column(String(20), nullable=False, default="monthly")  # monthly, quarterly, semi_annual, annual
    calculation_type = Column(String(30), nullable=False, default="automatic_projects")  # automatic_projects, manual_evidence
    verification_source = Column(String(255))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_tenant_indicator_code"),
    )

    # Relationships
    objective = relationship("StrategicObjective", back_populates="indicators")
    projects = relationship("Project", back_populates="indicator")

