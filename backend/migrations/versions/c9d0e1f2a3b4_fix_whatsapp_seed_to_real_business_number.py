"""fix_whatsapp_seed_to_real_business_number

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-08-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c9d0e1f2a3b4'
down_revision: Union[str, Sequence[str], None] = 'b8c9d0e1f2a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # La migración anterior (b8c9d0e1f2a3) asumió que el número usado por los
    # botones "Enviar WhatsApp" (525646133614) era el real, pero el negocio
    # confirmó que el número correcto es el que ya usaban las burbujas
    # flotantes y el footer (525520221427, en frontend/lib/constants/social.ts).
    op.execute(
        """
        UPDATE site_settings
        SET setting_value = jsonb_set(setting_value, '{whatsapp}', '"https://wa.me/525520221427"')
        WHERE setting_key = 'social_networks'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE site_settings
        SET setting_value = jsonb_set(setting_value, '{whatsapp}', '"https://wa.me/525646133614"')
        WHERE setting_key = 'social_networks'
        """
    )
