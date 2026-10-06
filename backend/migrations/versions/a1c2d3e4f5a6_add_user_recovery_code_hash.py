"""add user recovery code hash

Revision ID: a1c2d3e4f5a6
Revises: c9d0e1f2a3b4
Create Date: 2026-10-05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = 'c9d0e1f2a3b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('recovery_code_hash', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'recovery_code_hash')
