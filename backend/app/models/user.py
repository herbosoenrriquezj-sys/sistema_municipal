import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="RESTRICT"), nullable=False, index=True)
    email = Column(String(150), nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30))
    role = Column(String(40), nullable=False)  # alcalde, director_area, responsable_proyecto, supervisor_fiscal, planificacion, control_social, tenant_admin, super_admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_tenant_user_email"),
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    responsible_projects = relationship("Project", back_populates="responsible", foreign_keys="Project.responsible_id")
    supervised_projects = relationship("Project", back_populates="supervisor", foreign_keys="Project.supervisor_id")

