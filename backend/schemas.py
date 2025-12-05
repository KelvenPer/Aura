from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# --- USUARIOS / AUTH ---
class UserBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    crm: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetOut(BaseModel):
    message: str
    expires_at: datetime
    token: Optional[str] = None  # Retorna token apenas em ambiente dev para testes


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    new_password: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# --- PACIENTES ---
class PacienteBase(BaseModel):
    nome: str
    telefone: str
    email: Optional[str] = None
    cpf: Optional[str] = None


class PacienteCreate(PacienteBase):
    pass


class PacienteOut(PacienteBase):
    id: int
    data_cadastro: datetime
    responsavel_id: Optional[int] = None

    class Config:
        from_attributes = True


# --- AGENDAMENTOS ---
class AgendamentoBase(BaseModel):
    paciente_id: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    tipo: str
    status: str = "agendado"
    valor_previsto: Optional[float] = None
    sala: Optional[str] = None
    observacoes: Optional[str] = None


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoOut(AgendamentoBase):
    id: int
    paciente: PacienteOut
    responsavel_id: Optional[int] = None

    class Config:
        from_attributes = True


# --- FINANCEIRO ---
class TransacaoBase(BaseModel):
    descricao: str
    valor: float
    tipo: str
    categoria: str
    pago: bool = False


class TransacaoCreate(TransacaoBase):
    pass


class TransacaoOut(TransacaoBase):
    id: int
    data_competencia: datetime
    responsavel_id: Optional[int] = None

    class Config:
        from_attributes = True
