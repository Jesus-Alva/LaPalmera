"""merge heads

Revision ID: 707ed385fbf0
Revises: 42b04dd0af23, b45115376df5
Create Date: 2026-08-17 04:42:15.319468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '707ed385fbf0'
down_revision: Union[str, Sequence[str], None] = ('42b04dd0af23', 'b45115376df5')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
