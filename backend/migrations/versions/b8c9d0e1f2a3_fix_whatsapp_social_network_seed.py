"""fix_whatsapp_social_network_seed

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-08-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b8c9d0e1f2a3'
down_revision: Union[str, Sequence[str], None] = 'a7b8c9d0e1f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # El seed original traía un número de ejemplo ("521234567890"). Se corrige al
    # número real ya usado en el código (botones "Enviar WhatsApp" del sitio),
    # para que al conectar esos botones a este setting no cambie silenciosamente
    # el número al que llegan los mensajes.
    op.execute(
        """
        UPDATE site_settings
        SET setting_value = jsonb_set(setting_value, '{whatsapp}', '"https://wa.me/525646133614"')
        WHERE setting_key = 'social_networks'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE site_settings
        SET setting_value = jsonb_set(setting_value, '{whatsapp}', '"https://wa.me/521234567890"')
        WHERE setting_key = 'social_networks'
        """
    )
