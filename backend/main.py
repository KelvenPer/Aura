from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from config import settings
# from database import Base, engine  <-- Removido para evitar erro de conexão no boot
from routers import agendamentos, auth, financeiro, pacientes
# from security import ensure_default_admin <-- Removido pois depende do engine síncrono

app = FastAPI(
    title=settings.app_name,
    description="API de gestao inteligente para clinicas medicas",
    version="1.0.0",
)

# Configuração de CORS (Mantida)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ATENÇÃO: STARTUP EVENTS REMOVIDOS ---
# No Cloudflare Workers, não usamos create_all().
# As tabelas devem ser criadas via migrações SQL (wrangler d1 migrations execute).
# O ensure_default_admin também foi removido temporariamente para evitar erros de conexão.

@app.get("/")
def health_check(request: Request):
    # Verifica se o banco D1 foi injetado pelo entry.py
    db_status = "conectado" if hasattr(request.app.state, "db") else "desconectado"
    
    return {
        "status": "online",
        "system": "AURA",
        "database": db_status,
        "environment": "Cloudflare Workers",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# Rotas
app.include_router(auth.router)
app.include_router(pacientes.router)
app.include_router(agendamentos.router)
app.include_router(financeiro.router)
