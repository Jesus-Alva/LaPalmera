"""add_sequence_to_celebrations_id

Revision ID: 1bd407bd0914
Revises: 556832dbeaf8
Create Date: 2026-08-10 05:25:50.938458

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1bd407bd0914'
down_revision: Union[str, Sequence[str], None] = '556832dbeaf8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Crear la secuencia
    op.execute("CREATE SEQUENCE IF NOT EXISTS celebrations_id_seq")
    # Asignarla como default
    op.execute("ALTER TABLE celebrations ALTER COLUMN id SET DEFAULT nextval('celebrations_id_seq')")
    # Vincular la secuencia a la columna
    op.execute("ALTER SEQUENCE celebrations_id_seq OWNED BY celebrations.id")



def downgrade() -> None:
    op.execute("ALTER TABLE celebrations ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS celebrations_id_seq")
