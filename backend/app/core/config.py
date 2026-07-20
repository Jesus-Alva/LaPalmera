import secrets
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import (
    AnyHttpUrl, HttpUrl, PostgresDsn,
    field_validator, ValidationInfo, model_validator
)
from dotenv import load_dotenv
import os

logging.basicConfig(level=logging.INFO)

PROJECT_NAME = "lapalmera"

# --- Cargar .env desde la raíz del proyecto ---
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # lapalmera/
ENV_FILE = BASE_DIR / ".env"

if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
    logging.info(f"Archivo .env cargado desde: {ENV_FILE}")
else:
    logging.warning(f"No se encontró el archivo .env en: {ENV_FILE}")

class AsyncPostgresDsn(PostgresDsn):
    allowed_schemes = {"postgres+asyncpg", "postgresql+asyncpg"}

class Settings(BaseSettings):
    # --- Configuración general ---
    API_V1_STR: str = "/api/v1"
    API_DOMAIN: str = "http://localhost:8000"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    JOB_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1
    SERVER_NAME: str = "localhost"
    SERVER_HOST: AnyHttpUrl = "http://localhost"
    BACKEND_CORS_ORIGINS: List[Union[AnyHttpUrl, str]] = []
    TEST_MODE: bool = False
    PROFILE_QUERY_MODE: bool = False
    CODE_SYSTEM: str = "82a4e5ab-a19e-4bdf-a418-aa94b8d4da30"
    
    # --- WhatsApp ---
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_API_VERSION: str = "v19.0"
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # --- Sentry ---
    SENTRY_DSN: Optional[HttpUrl] = None

    @field_validator("SENTRY_DSN", mode="before")
    @classmethod
    def sentry_dsn_can_be_blank(cls, v: str) -> Optional[str]:
        return None if v == "" else v

    # --- PostgreSQL ---
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str = "5432"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    SQLALCHEMY_DATABASE_URI_ASYNC: Optional[str] = None

    # --- Superusuario (opcional) ---
    FIRST_SUPERUSER: Optional[str] = None
    FIRST_SUPERUSER_NICKNAME: Optional[str] = None
    FIRST_SUPERUSER_PASSWORD: Optional[str] = None
    USERS_OPEN_REGISTRATION: bool = True

    # --- Configuración de Pydantic ---
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,                # Aún lo dejamos como respaldo
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def assemble_db_connections(self) -> "Settings":
        """Construye las URIs de base de datos después de que todos los campos estén validados."""
        port = self.POSTGRES_PORT or "5432"
        self.SQLALCHEMY_DATABASE_URI = (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{port}/{self.POSTGRES_DB}"
        )
        self.SQLALCHEMY_DATABASE_URI_ASYNC = (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{port}/{self.POSTGRES_DB}"
        )
        return self

# Instancia global
settings = Settings()