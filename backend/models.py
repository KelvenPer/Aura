from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), index=True, nullable=False)
    telefone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    cpf = Column(String(11), unique=True, nullable=True)
    data_cadastro = Column(DateTime(timezone=True), default=utcnow)

    agendamentos = relationship("Agendamento", back_populates="paciente", cascade="all, delete-orphan")


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    data_hora_inicio = Column(DateTime(timezone=True), index=True, nullable=False)
    data_hora_fim = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(String(50), nullable=False)
    status = Column(String(20), default="agendado", nullable=False)
    observacoes = Column(Text, nullable=True)

    paciente = relationship("Paciente", back_populates="agendamentos")


class Transacao(Base):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    valor = Column(Numeric(12, 2), nullable=False)
    tipo = Column(String(20), nullable=False)
    categoria = Column(String(50), nullable=False)
    data_competencia = Column(DateTime(timezone=True), default=utcnow)
    pago = Column(Boolean, default=False)
