from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Transacao, User
from schemas import TransacaoCreate, TransacaoOut
from security import get_current_user

router = APIRouter(prefix="/financeiro", tags=["Financeiro"])


@router.post("/transacoes/", response_model=TransacaoOut, status_code=201)
def criar_transacao(
    transacao: TransacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    nova_transacao = Transacao(
        descricao=transacao.descricao,
        valor=transacao.valor,
        tipo=transacao.tipo,
        categoria=transacao.categoria,
        pago=transacao.pago,
        responsavel_id=current_user.id,
    )
    db.add(nova_transacao)
    db.commit()
    db.refresh(nova_transacao)
    return nova_transacao


@router.get("/transacoes/", response_model=list[TransacaoOut])
def listar_transacoes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Transacao)
        .filter((Transacao.responsavel_id == current_user.id) | (Transacao.responsavel_id.is_(None)))
        .order_by(Transacao.data_competencia.desc())
        .all()
    )


@router.get("/", response_model=list[TransacaoOut])
def alias_financeiro(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Alias para compatibilidade com o app mobile atual
    return listar_transacoes(db=db, current_user=current_user)
