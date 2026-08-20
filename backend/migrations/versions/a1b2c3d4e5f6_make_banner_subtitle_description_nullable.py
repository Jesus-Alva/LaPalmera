"""make_banner_subtitle_description_nullable

Revision ID: a1b2c3d4e5f6
Revises: 707ed385fbf0
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '707ed385fbf0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # Eliminar NOT NULL de subtitle
    op.alter_column('banner', 'subtitle',
                    existing_type=sa.String(255),
                    nullable=True)

    # Eliminar NOT NULL de description
    op.alter_column('banner', 'description',
                    existing_type=sa.String(255),
                    nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    pass
