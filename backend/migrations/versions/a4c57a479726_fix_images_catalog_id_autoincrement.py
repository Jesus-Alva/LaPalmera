"""fix_images_catalog_id_autoincrement

Revision ID: a4c57a479726
Revises: 4b6681fa6a85
Create Date: 2026-08-09 23:24:49.823063

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4c57a479726'
down_revision: Union[str, Sequence[str], None] = '4b6681fa6a85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear una secuencia para la columna id
    op.execute("CREATE SEQUENCE images_catalog_id_seq START WITH 1 INCREMENT BY 1")
    
    # 2. Asignar la secuencia como valor por defecto
    op.execute("ALTER TABLE images_catalog ALTER COLUMN id SET DEFAULT nextval('images_catalog_id_seq')")
    
    # 3. Vincular la secuencia a la columna
    op.execute("ALTER SEQUENCE images_catalog_id_seq OWNED BY images_catalog.id")

def downgrade() -> None:
    op.execute("ALTER TABLE images_catalog ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE images_catalog_id_seq")
