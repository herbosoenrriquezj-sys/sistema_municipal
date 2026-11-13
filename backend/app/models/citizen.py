import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class CitizenInquiry(Base):
    __tablename__ = "citizen_inquiries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    
    district = Column(String(50), nullable=False)
    citizen_name = Column(String(150), nullable=False)
    citizen_contact = Column(String(100), nullable=False)
    organization = Column(String(150), nullable=True)  # Ej. Junta Vecinal, Control Social
    category = Column(String(50), nullable=False, default="consulta")  # consulta, alerta_retraso, solicitud_inspeccion, felicitacion
    message = Column(Text, nullable=False)
    
    status = Column(String(30), nullable=False, default="pending")  # pending, in_review, responded
    official_response = Column(Text, nullable=True)
    responded_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tenant = relationship("Tenant")
    project = relationship("Project")
    responded_by = relationship("User")
