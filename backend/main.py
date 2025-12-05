from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from routers import agendamentos, auth, financeiro, pacientes
from security import ensure_default_admin

app = FastAPI(
    title=settings.app_name,
    description="API de gestao inteligente para clinicas medicas",
    version="1.0.0",
)

# Permite consumir a API a partir do app mobile ou web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_default_admin()


@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "AURA",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


app.include_router(auth.router)
app.include_router(pacientes.router)
app.include_router(agendamentos.router)
app.include_router(financeiro.router)
