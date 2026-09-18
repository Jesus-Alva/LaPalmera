# migrations/env.py
import sys
from pathlib import Path

# Calcula la ruta absoluta al directorio raíz del proyecto (backend)
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# -------------------- CARGA EL .env.dev --------------------
from dotenv import load_dotenv
import os

# El archivo .env.dev está en la raíz del proyecto (un nivel por encima de backend)
ENV_FILE = BASE_DIR.parent / ".env.dev"
load_dotenv(dotenv_path=ENV_FILE)

# -------------------- OBTENER LA URL CORRECTA --------------------
# Si estás dentro del contenedor, usa DATABASE_URL (con 'postgres' como host)
# Si estás en el host, usa DATABASE_URL_HOST (con 'localhost' y puerto 5433)
# Por defecto, usamos la del host (porque es el caso más común para desarrollo)
# Elegir URL según el entorno
# if os.getenv("ENV") == "container":
#     DATABASE_URL = os.getenv("DATABASE_URL")       # postgres:5432
# else:
#     DATABASE_URL = os.getenv("DATABASE_URL_HOST") 

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL no definida en el entorno")


# -------------------- CONFIGURACIÓN DE ALEMBIC --------------------
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Importa tus modelos y Base
# from app.core.config import setting     # CORREGIDO: era 'settings' -> 'setting'
from app.base_class import Base

import app.model  # Asegura que todos los modelos estén registrados

target_metadata = Base.metadata

# Asigna la URL a Alembic
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# -------------------- FUNCIONES DE MIGRACIÓN (sin cambios) --------------------
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()