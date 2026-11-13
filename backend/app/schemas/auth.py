from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    tenant_id: str
    user_name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    tenant_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    tenant_slug: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_id: str
    is_active: bool

    class Config:
        from_attributes = True

