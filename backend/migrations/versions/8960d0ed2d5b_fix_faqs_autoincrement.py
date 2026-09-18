"""fix_faqs_autoincrement

Revision ID: 8960d0ed2d5b
Revises: 565bc0910d64
Create Date: 2026-08-14 04:45:57.334215

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8960d0ed2d5b'
down_revision: Union[str, Sequence[str], None] = '565bc0910d64'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear la secuencia para la columna id
    op.execute("CREATE SEQUENCE IF NOT EXISTS faqs_id_seq START WITH 1 INCREMENT BY 1")
    
    # 2. Asignar la secuencia como valor por defecto
    op.execute("ALTER TABLE faqs ALTER COLUMN id SET DEFAULT nextval('faqs_id_seq')")
    
    # 3. Vincular la secuencia a la columna (para que se elimine automáticamente si se borra la tabla)
    op.execute("ALTER SEQUENCE faqs_id_seq OWNED BY faqs.id")
    
    # 4. Sincronizar la secuencia con el valor máximo actual (por si hay datos existentes)
    op.execute("SELECT setval('faqs_id_seq', COALESCE((SELECT MAX(id) FROM faqs), 0) + 1, false)")


def downgrade() -> None:
    # 1. Eliminar el valor por defecto
    op.execute("ALTER TABLE faqs ALTER COLUMN id DROP DEFAULT")
    
    # 2. Eliminar la secuencia
    op.execute("DROP SEQUENCE IF EXISTS faqs_id_seq")
