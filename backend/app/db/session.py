# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Crear el engine usando la URL de la base de datos
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,          # Verifica conexiones antes de usarlas
    pool_recycle=3600,           # Recicla conexiones cada hora
    echo=False,                  # En desarrollo puedes poner True para ver SQL
)

# Crear una fábrica de sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Dependencia para obtener la sesión en cada request
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()