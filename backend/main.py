from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import agendamentos, auth, financeiro, pacientes

app = FastAPI(
    title=settings.app_name,
    description="API de gestao inteligente para clinicas medicas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check(request: Request):
    db_status = "conectado" if hasattr(request.app.state, "db") else "desconectado"
    
    return {
        "status": "online",
        "system": "AURA",
        "database": db_status,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

app.include_router(auth.router)
app.include_router(pacientes.router)
app.include_router(agendamentos.router)
app.include_router(financeiro.router)
