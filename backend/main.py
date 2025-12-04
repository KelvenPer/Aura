from datetime import datetime, timezone
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import Base, engine, get_db
from models import Agendamento, Paciente, Transacao
from schemas import (
    AgendamentoCreate,
    AgendamentoOut,
    PacienteCreate,
    PacienteOut,
    TransacaoCreate,
    TransacaoOut,
)


app = FastAPI(
    title="Aura Clinic Intelligence",
    description="API de gestao inteligente para clinicas medicas",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "AURA",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/pacientes/", response_model=PacienteOut, tags=["Pacientes"])
def criar_paciente(paciente: PacienteCreate, db: Session = Depends(get_db)):
    if paciente.cpf:
        existe = db.query(Paciente).filter(Paciente.cpf == paciente.cpf).first()
        if existe:
            raise HTTPException(status_code=400, detail="CPF ja cadastrado")

    novo_paciente = Paciente(
        nome=paciente.nome,
        telefone=paciente.telefone,
        email=paciente.email,
        cpf=paciente.cpf,
    )
    db.add(novo_paciente)
    db.commit()
    db.refresh(novo_paciente)
    return novo_paciente


@app.get("/pacientes/", response_model=List[PacienteOut], tags=["Pacientes"])
def listar_pacientes(db: Session = Depends(get_db)):
    return db.query(Paciente).all()


@app.post("/agendamentos/", response_model=AgendamentoOut, tags=["Agenda"])
def criar_agendamento(agendamento: AgendamentoCreate, db: Session = Depends(get_db)):
    paciente = db.query(Paciente).filter(Paciente.id == agendamento.paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente nao encontrado")

    if agendamento.data_hora_fim <= agendamento.data_hora_inicio:
        raise HTTPException(status_code=400, detail="Horario final deve ser maior que o inicial")

    novo_agendamento = Agendamento(
        paciente_id=agendamento.paciente_id,
        data_hora_inicio=agendamento.data_hora_inicio,
        data_hora_fim=agendamento.data_hora_fim,
        tipo=agendamento.tipo,
        status=agendamento.status,
        observacoes=agendamento.observacoes,
    )
    db.add(novo_agendamento)
    db.commit()

    return (
        db.query(Agendamento)
        .options(joinedload(Agendamento.paciente))
        .filter(Agendamento.id == novo_agendamento.id)
        .first()
    )


@app.get("/agendamentos/", response_model=List[AgendamentoOut], tags=["Agenda"])
def listar_agendamentos(db: Session = Depends(get_db)):
    return (
        db.query(Agendamento)
        .options(joinedload(Agendamento.paciente))
        .order_by(Agendamento.data_hora_inicio)
        .all()
    )


@app.post("/financeiro/transacoes/", response_model=TransacaoOut, tags=["Financeiro"])
def criar_transacao(transacao: TransacaoCreate, db: Session = Depends(get_db)):
    nova_transacao = Transacao(
        descricao=transacao.descricao,
        valor=transacao.valor,
        tipo=transacao.tipo,
        categoria=transacao.categoria,
        pago=transacao.pago,
    )
    db.add(nova_transacao)
    db.commit()
    db.refresh(nova_transacao)
    return nova_transacao


@app.get("/financeiro/transacoes/", response_model=List[TransacaoOut], tags=["Financeiro"])
def listar_transacoes(db: Session = Depends(get_db)):
    return db.query(Transacao).order_by(Transacao.data_competencia.desc()).all()
