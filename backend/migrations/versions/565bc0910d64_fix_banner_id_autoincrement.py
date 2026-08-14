"""fix_banner_id_autoincrement

Revision ID: 565bc0910d64
Revises: 0fb28279e0dd
Create Date: 2026-08-13 06:01:43.361226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '565bc0910d64'
down_revision: Union[str, Sequence[str], None] = '0fb28279e0dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear una secuencia para la columna id
    op.execute("CREATE SEQUENCE banner_id_seq START WITH 1 INCREMENT BY 1")
    
    # 2. Asignar la secuencia como valor por defecto
    op.execute("ALTER TABLE banner ALTER COLUMN id SET DEFAULT nextval('banner_id_seq')")
    
    # 3. Vincular la secuencia a la columna
    op.execute("ALTER SEQUENCE banner_id_seq OWNED BY banner.id")
    
    # 4. Sincronizar la secuencia con el valor máximo actual (si hay datos)
    op.execute("SELECT setval('banner_id_seq', COALESCE((SELECT MAX(id) FROM banner), 0) + 1, false)")


def downgrade() -> None:
    op.execute("ALTER TABLE banner ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE banner_id_seq")
