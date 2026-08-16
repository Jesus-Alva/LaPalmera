"""fix_package_feature_autoincrement

Revision ID: c1f8ca4cdf8d
Revises: 2c638acd61e2
Create Date: 2026-08-16 04:18:25.559714

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f8ca4cdf8d'
down_revision: Union[str, Sequence[str], None] = '2c638acd61e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Crear una secuencia para la columna id (si no existe)
    op.execute("CREATE SEQUENCE IF NOT EXISTS package_features_id_seq")
    
    # 2. Asignar la secuencia como valor por defecto
    op.execute("ALTER TABLE package_features ALTER COLUMN id SET DEFAULT nextval('package_features_id_seq')")
    
    # 3. Vincular la secuencia a la columna
    op.execute("ALTER SEQUENCE package_features_id_seq OWNED BY package_features.id")

def downgrade():
    op.execute("ALTER TABLE package_features ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS package_features_id_seq")
