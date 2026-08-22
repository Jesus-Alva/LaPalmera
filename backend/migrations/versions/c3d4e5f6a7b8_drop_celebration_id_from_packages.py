"""drop_celebration_id_from_packages

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # Existen dos nombres de constraint distintos creados por migraciones históricas
    # (una original y otra defensiva que no detectó correctamente la primera).
    op.execute("ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_celebration_id_fkey;")
    op.execute("ALTER TABLE packages DROP CONSTRAINT IF EXISTS fk_packages_celebration;")
    op.drop_column('packages', 'celebration_id')


def downgrade() -> None:
    op.add_column('packages', sa.Column('celebration_id', sa.Integer(), nullable=True))
    op.create_foreign_key('packages_celebration_id_fkey', 'packages', 'celebrations', ['celebration_id'], ['id'])
