# app/core/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    # Dominios del frontend permitidos por CORS, separados por comas (ej.
    # "https://lapalmera.com,https://www.lapalmera.com" en producción). Si no
    # se define, cae a los orígenes de desarrollo local.
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000"
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        # El .env local (o el que inyecte la plataforma) puede traer variables
        # que no son de esta app (ej. credenciales sueltas de Postgres para
        # herramientas locales) — sin esto, pydantic-settings las trata como
        # error de validación en vez de ignorarlas.
        extra = "ignore"

settings = Settings()