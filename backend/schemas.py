from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# --- USUARIOS / AUTH ---
class UserBase(BaseModel):
    nome: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    role: str
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
