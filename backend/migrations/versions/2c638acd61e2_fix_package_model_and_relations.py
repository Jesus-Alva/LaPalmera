"""fix_package_model_and_relations

Revision ID: 2c638acd61e2
Revises: 95aed8ee32c2
Create Date: 2026-08-14 05:58:35.668990

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c638acd61e2'
down_revision: Union[str, Sequence[str], None] = '95aed8ee32c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Verificar y agregar celebration_id solo si no existe
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='packages' AND column_name='celebration_id') THEN
                ALTER TABLE packages ADD COLUMN celebration_id INTEGER;
            END IF;
        END $$;
    """)

    # 2. Verificar y crear la llave foránea solo si no existe
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                           WHERE constraint_name='fk_packages_celebration') THEN
                ALTER TABLE packages ADD CONSTRAINT fk_packages_celebration 
                    FOREIGN KEY (celebration_id) REFERENCES celebrations(id);
            END IF;
        END $$;
    """)

    # 3. Renombrar columnas de fecha (si existen con nombre antiguo)
    # Verificar si existe data_available_start y renombrar a date_available_start
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='packages' AND column_name='data_available_start') THEN
                ALTER TABLE packages RENAME COLUMN data_available_start TO date_available_start;
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='packages' AND column_name='data_available_end') THEN
                ALTER TABLE packages RENAME COLUMN data_available_end TO date_available_end;
            END IF;
        END $$;
    """)

    # 4. Agregar columnas date_available_start/end si no existen (por si acaso)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='packages' AND column_name='date_available_start') THEN
                ALTER TABLE packages ADD COLUMN date_available_start DATE;
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='packages' AND column_name='date_available_end') THEN
                ALTER TABLE packages ADD COLUMN date_available_end DATE;
            END IF;
        END $$;
    """)

def downgrade():
    # Downgrade no es necesario, pero puedes implementarlo si quieres revertir
    pass
