"""create_site_settings

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-08-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'a7b8c9d0e1f2'
down_revision: Union[str, Sequence[str], None] = 'f6a7b8c9d0e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'site_settings',
        sa.Column('setting_key', sa.String(length=80), primary_key=True),
        sa.Column('setting_value', JSONB, nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
    )

    site_settings = sa.table(
        'site_settings',
        sa.column('setting_key', sa.String),
        sa.column('setting_value', JSONB),
    )

    op.bulk_insert(site_settings, [
        {
            'setting_key': 'branding',
            'setting_value': {
                'site_name': 'La Palmera',
                'logo_url': '/images/logo.png',
                'favicon_url': '/favicon.ico',
                'primary_color': '#2C5F2D',
                'secondary_color': '#D4A373',
                'typography': 'Playfair Display',
            },
        },
        {
            'setting_key': 'seo',
            'setting_value': {
                'meta_title': 'La Palmera Jardín de Eventos',
                'meta_description': 'Jardín de eventos en Coacalco...',
                'og_image': '/images/og.jpg',
                'keywords': 'jardín, eventos, bodas',
            },
        },
        {
            'setting_key': 'contact_info',
            'setting_value': [
                {'title': 'Dirección', 'value': 'Vicente Guerrero 23...'},
                {'title': 'Teléfono', 'value': '+52 55 2022 1427'},
                {'title': 'Correo', 'value': 'lapalmera@example.com'},
            ],
        },
        {
            'setting_key': 'schedule',
            'setting_value': [
                {'days': 'Lunes a viernes', 'time': '9:00 - 18:00'},
                {'days': 'Sábados', 'time': '10:00 - 14:00'},
            ],
        },
        {
            'setting_key': 'social_networks',
            'setting_value': {
                'facebook': 'https://www.facebook.com/',
                'instagram': 'https://www.instagram.com/',
                'tiktok': 'https://www.tiktok.com/',
                'whatsapp': 'https://wa.me/521234567890',
            },
        },
        {
            'setting_key': 'footer',
            'setting_value': {
                'copyright_text': 'Todos los derechos reservados.',
                'developer_credit': 'JAB Development',
                'extra_message': 'Hecho con amor para eventos inolvidables',
            },
        },
        {
            'setting_key': 'home_banner',
            'setting_value': {
                'title': 'La Palmera',
                'slogan': 'Donde la elegancia se une con la naturaleza',
                'button_text': 'Reserva tu fecha',
                'background_image': '/images/banner.jpg',
            },
        },
        {
            'setting_key': 'scripts',
            'setting_value': {
                'google_analytics_id': '',
                'facebook_pixel_id': '',
                'custom_head_code': '',
            },
        },
        {
            'setting_key': 'reservation',
            'setting_value': {
                'form_title': 'Comienza tu historia',
                'description': 'Completa el formulario y te contactaremos.',
                'success_message': 'Gracias, te contactaremos en breve.',
            },
        },
    ])


def downgrade() -> None:
    op.drop_table('site_settings')
