from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Paciente, User
from schemas import PacienteCreate, PacienteOut
from security import get_current_user

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.post("/", response_model=PacienteOut, status_code=201)
def criar_paciente(
    paciente: PacienteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if paciente.cpf:
        existe = db.query(Paciente).filter(Paciente.cpf == paciente.cpf).first()
        if existe:
            raise HTTPException(status_code=400, detail="CPF ja cadastrado")

    novo_paciente = Paciente(
        nome=paciente.nome,
        telefone=paciente.telefone,
        email=paciente.email,
        cpf=paciente.cpf,
        responsavel_id=current_user.id,
    )
    db.add(novo_paciente)
    db.commit()
    db.refresh(novo_paciente)
    return novo_paciente


@router.get("/", response_model=list[PacienteOut])
def listar_pacientes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Paciente)
        .filter((Paciente.responsavel_id == current_user.id) | (Paciente.responsavel_id.is_(None)))
        .order_by(Paciente.nome)
        .all()
    )


@router.get("/{paciente_id}", response_model=PacienteOut)
def obter_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente nao encontrado")
    if paciente.responsavel_id not in (None, current_user.id):
        raise HTTPException(status_code=403, detail="Sem acesso a este paciente")
    return paciente
