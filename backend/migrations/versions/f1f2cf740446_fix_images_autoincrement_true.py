"""fix_images_autoincrement_true

Revision ID: f1f2cf740446
Revises: 2a955cdfa479
Create Date: 2026-08-09 23:39:59.185868

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1f2cf740446'
down_revision: Union[str, Sequence[str], None] = '2a955cdfa479'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE SEQUENCE IF NOT EXISTS images_id_seq")
    op.execute("ALTER TABLE images ALTER COLUMN id SET DEFAULT nextval('images_id_seq')")
    op.execute("ALTER SEQUENCE images_id_seq OWNED BY images.id")


def downgrade() -> None:
    op.execute("ALTER TABLE images ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS images_id_seq")
