import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Text, Date, DateTime, ForeignKey, BigInteger, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class ActivityProgressReport(Base):
    __tablename__ = "activity_progress_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String(36), ForeignKey("project_activities.id", ondelete="CASCADE"), nullable=False, index=True)
    period_date = Column(Date, nullable=False)
    quantity_executed = Column(Numeric(12, 2), nullable=False, default=0.0)
    reported_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reported_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    supervisor_status = Column(String(20), nullable=False, default="submitted")  # draft, submitted, approved, rejected, observed
    supervisor_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    supervisor_reviewed_at = Column(DateTime, nullable=True)
    supervisor_comments = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("activity_id", "period_date", name="uq_activity_report_period"),
    )

    # Relationships
    activity = relationship("ProjectActivity", back_populates="progress_reports")
    reported_by = relationship("User", foreign_keys=[reported_by_id])
    supervisor = relationship("User", foreign_keys=[supervisor_id])
    evidences = relationship("ProgressEvidence", back_populates="report", cascade="all, delete-orphan")


class ProgressEvidence(Base):
    __tablename__ = "progress_evidences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(String(36), ForeignKey("activity_progress_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False, default=0)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    captured_at = Column(DateTime, nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    report = relationship("ActivityProgressReport", back_populates="evidences")

