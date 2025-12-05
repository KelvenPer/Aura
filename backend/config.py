import os
from dataclasses import dataclass

from dotenv import load_dotenv

# Carrega variaveis de ambiente definidas em .env (quando existir)
load_dotenv()


@dataclass
class Settings:
    app_name: str = "Aura Clinic Intelligence"
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:Saladas.2@localhost/aura_db")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-please")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))  # 12h
    admin_email: str = os.getenv("ADMIN_EMAIL", "dr.kelven@aura.app")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "aura123")
    admin_name: str = os.getenv("ADMIN_NAME", "Dr. Kelven")
    environment: str = os.getenv("ENVIRONMENT", "dev")


settings = Settings()
