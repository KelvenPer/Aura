from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

# --- CORREÇÃO IMPORTANTE PARA FLY.IO ---
# O Fly.io pode fornecer a URL como "postgres://...", mas o SQLAlchemy
# moderno exige "postgresql://...". Esta linha corrige isso automaticamente.
db_url = settings.database_url
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Cria a engine com a URL corrigida
engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()