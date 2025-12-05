from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Agendamento, Paciente, User
from schemas import AgendamentoCreate, AgendamentoOut
from security import get_current_user

router = APIRouter(prefix="/agendamentos", tags=["Agenda"])


@router.post("/", response_model=AgendamentoOut, status_code=201)
def criar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
        valor_previsto=agendamento.valor_previsto,
        sala=agendamento.sala,
        observacoes=agendamento.observacoes,
        responsavel_id=current_user.id,
    )
    db.add(novo_agendamento)
    db.commit()

    return (
        db.query(Agendamento)
        .options(joinedload(Agendamento.paciente))
        .filter(Agendamento.id == novo_agendamento.id)
        .first()
    )


@router.get("/", response_model=list[AgendamentoOut])
def listar_agendamentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Agendamento)
        .options(joinedload(Agendamento.paciente))
        .order_by(Agendamento.data_hora_inicio)
        .all()
    )


@router.get("/agenda", response_model=list[AgendamentoOut])
def alias_agenda(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Alias para compatibilidade com o app mobile atual
    return listar_agendamentos(db=db, current_user=current_user)
