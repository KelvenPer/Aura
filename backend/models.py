from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="doctor")
    telefone = Column(String(30), nullable=True)
    crm = Column(String(50), unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    pacientes = relationship("Paciente", back_populates="responsavel")
    agendamentos = relationship("Agendamento", back_populates="responsavel")
    transacoes = relationship("Transacao", back_populates="responsavel")
    reset_tokens = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )


class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), index=True, nullable=False)
    telefone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    cpf = Column(String(11), unique=True, nullable=True)
    data_cadastro = Column(DateTime(timezone=True), default=utcnow)
    responsavel_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    responsavel = relationship("User", back_populates="pacientes")
    agendamentos = relationship("Agendamento", back_populates="paciente", cascade="all, delete-orphan")


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    data_hora_inicio = Column(DateTime(timezone=True), index=True, nullable=False)
    data_hora_fim = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(String(50), nullable=False)
    status = Column(String(20), default="agendado", nullable=False)
    valor_previsto = Column(Numeric(12, 2), nullable=True)
    sala = Column(String(50), nullable=True)
    observacoes = Column(Text, nullable=True)
    responsavel_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    paciente = relationship("Paciente", back_populates="agendamentos")
    responsavel = relationship("User", back_populates="agendamentos")


class Transacao(Base):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    valor = Column(Numeric(12, 2), nullable=False)
    tipo = Column(String(20), nullable=False)
    categoria = Column(String(50), nullable=False)
    data_competencia = Column(DateTime(timezone=True), default=utcnow)
    pago = Column(Boolean, default=False)
    responsavel_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    responsavel = relationship("User", back_populates="transacoes")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    is_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="reset_tokens")
