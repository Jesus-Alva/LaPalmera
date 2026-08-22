"""add_package_feature_catalog

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Crear la tabla de catálogo de características
    op.create_table(
        'package_feature_catalog',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.UniqueConstraint('name', name='uq_package_feature_catalog_name'),
    )

    # 2. Sembrar el catálogo con los valores distintos de feature_key ya existentes
    op.execute("""
        INSERT INTO package_feature_catalog (name)
        SELECT DISTINCT feature_key FROM package_features;
    """)

    # 3. Agregar catalog_id (nullable por ahora, para poder rellenarlo)
    op.add_column('package_features', sa.Column('catalog_id', sa.Integer(), nullable=True))

    # 4. Rellenar catalog_id a partir del feature_key existente
    op.execute("""
        UPDATE package_features pf
        SET catalog_id = c.id
        FROM package_feature_catalog c
        WHERE c.name = pf.feature_key;
    """)

    # 5. Ahora sí, NOT NULL + FK, y eliminar la columna vieja feature_key
    op.alter_column('package_features', 'catalog_id', nullable=False)
    op.create_foreign_key(
        'fk_package_features_catalog', 'package_features', 'package_feature_catalog',
        ['catalog_id'], ['id']
    )
    op.drop_column('package_features', 'feature_key')


def downgrade() -> None:
    op.add_column('package_features', sa.Column('feature_key', sa.String(length=255), nullable=True))
    op.execute("""
        UPDATE package_features pf
        SET feature_key = c.name
        FROM package_feature_catalog c
        WHERE c.id = pf.catalog_id;
    """)
    op.alter_column('package_features', 'feature_key', nullable=False)
    op.drop_constraint('fk_package_features_catalog', 'package_features', type_='foreignkey')
    op.drop_column('package_features', 'catalog_id')
    op.drop_table('package_feature_catalog')
