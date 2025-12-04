from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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

    class Config:
        from_attributes = True


# --- AGENDAMENTOS ---
class AgendamentoBase(BaseModel):
    paciente_id: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    tipo: str
    status: str = "agendado"
    observacoes: Optional[str] = None


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoOut(AgendamentoBase):
    id: int
    paciente: PacienteOut

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

    class Config:
        from_attributes = True
