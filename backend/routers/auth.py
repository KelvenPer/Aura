from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import PasswordResetToken, User
from schemas import (
    LoginRequest,
    PasswordChange,
    PasswordResetConfirm,
    PasswordResetOut,
    PasswordResetRequest,
    Token,
    UserCreate,
    UserOut,
)
from security import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
RESET_TOKEN_TTL_MINUTES = 30


def _generate_numeric_token(length: int = 6) -> str:
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == user_in.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="E-mail ja cadastrado")
    if user_in.crm:
        crm_exists = db.query(User).filter(User.crm == user_in.crm).first()
        if crm_exists:
            raise HTTPException(status_code=400, detail="CRM ja cadastrado")

    user = User(
        nome=user_in.nome,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="doctor",
        telefone=user_in.telefone,
        crm=user_in.crm,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha invalidos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inativo")

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(subject=str(user.id), expires_delta=access_token_expires)
    return Token(access_token=access_token, user=user, token_type="bearer")


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", response_model=PasswordResetOut)
def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    token_plain = _generate_numeric_token()
    token_hash = get_password_hash(token_plain)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    reset = PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(reset)
    db.commit()
    db.refresh(reset)

    return PasswordResetOut(
        message="Token de recuperacao gerado. Envie ao usuario.",
        expires_at=expires_at,
        token=token_plain if settings.environment != "prod" else None,
    )


@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    token_entries = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.user_id == user.id, PasswordResetToken.is_used.is_(False))
        .order_by(PasswordResetToken.created_at.desc())
        .all()
    )
    if not token_entries:
        raise HTTPException(status_code=400, detail="Nenhum token ativo encontrado")

    now = datetime.now(timezone.utc)
    valid_token = next(
        (
            t
            for t in token_entries
            if t.expires_at >= now and verify_password(payload.token, t.token_hash)
        ),
        None,
    )
    if not valid_token:
        raise HTTPException(status_code=400, detail="Token invalido ou expirado")

    user.hashed_password = get_password_hash(payload.new_password)
    for token in token_entries:
        token.is_used = True
    db.commit()

    return {"message": "Senha redefinida com sucesso"}


@router.post("/change-password")
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    current_user.hashed_password = get_password_hash(payload.new_password)
    # Invalida tokens de reset ativos ao trocar a senha
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == current_user.id, PasswordResetToken.is_used.is_(False)
    ).update({"is_used": True})
    db.commit()

    return {"message": "Senha alterada com sucesso"}
