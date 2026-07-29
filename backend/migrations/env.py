import sys
from pathlib import Path

# Calcula la ruta absoluta al directorio raíz del proyecto (backend)
# Esto asume que 'migrations' está dentro de 'backend'
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Importar configuración y Base
from app.core.config import setting     # CORREGIDO: era 'settings' -> 'setting'
from app.base_class import Base                # Tu Base declarativa

# ---------- IMPORTAR TODOS LOS MODELOS ----------
# Esto es fundamental para que Alembic pueda ver las tablas.
# Opción 1: si tienes un paquete app/models/ con __init__.py que importa todo:
import app.model

# Opción 2: si tienes un solo archivo app/models.py:
# from app import models
# 
# Opción 3: importar cada clase individualmente (menos elegante):
# from app.models.user import User
# from app.models.space import Space
# ... etc.

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------- ASIGNAR METADATA ----------
target_metadata = Base.metadata          # CORREGIDO: ya no es None

# Tomar la URL de la base de datos desde la configuración de la app
config.set_main_option("sqlalchemy.url", setting.SQLALCHEMY_DATABASE_URI)  # CORREGIDO

# ... el resto del código (run_migrations_offline y run_migrations_online) no cambia ...

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
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