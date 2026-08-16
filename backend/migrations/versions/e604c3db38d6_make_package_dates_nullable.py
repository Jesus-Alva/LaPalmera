"""make_package_dates_nullable

Revision ID: e604c3db38d6
Revises: c1f8ca4cdf8d
Create Date: 2026-08-16 05:38:30.898616

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e604c3db38d6'
down_revision: Union[str, Sequence[str], None] = 'c1f8ca4cdf8d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # Eliminar NOT NULL de date_available_start
    op.alter_column('packages', 'date_available_start',
                    existing_type=sa.Date(),
                    nullable=True)

    # Eliminar NOT NULL de date_available_end
    op.alter_column('packages', 'date_available_end',
                    existing_type=sa.Date(),
                    nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    pass
