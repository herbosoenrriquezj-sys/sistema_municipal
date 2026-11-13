import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class ProjectBaseline(Base):
    __tablename__ = "project_baselines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    snapshot_data = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    approved_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    approved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("project_id", "version_number", name="uq_project_baseline_version"),
    )

    # Relationships
    project = relationship("Project", back_populates="baselines")
    approved_by = relationship("User", foreign_keys=[approved_by_id])


class ReprogrammingRequest(Base):
    __tablename__ = "reprogramming_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    cause_category = Column(String(40), nullable=False)  # climatic_factors, contractor_delay, lack_of_budget, scope_change, social_conflict, other
    justification = Column(Text, nullable=False)
    requested_days_extension = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="pending")  # pending, approved, rejected
    requested_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reviewed_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="reprogramming_requests")
    requested_by = relationship("User", foreign_keys=[requested_by_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])

