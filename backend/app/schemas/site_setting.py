from pydantic import BaseModel, Field
from typing import Union, Literal
from datetime import datetime

# Claves permitidas para setting_key. Cada una representa una sección de
# configuración del sitio; su setting_value es un JSON de forma libre
# (dict o list, según la sección) definido por el frontend/admin.
SettingKey = Literal[
    "branding",
    "seo",
    "contact_info",
    "schedule",
    "social_networks",
    "footer",
    "home_banner",
    "scripts",
    "reservation",
]

JsonValue = Union[dict, list]

class SiteSettingUpdate(BaseModel):
    setting_value: JsonValue = Field(...)

class SiteSettingOut(BaseModel):
    setting_key: str
    setting_value: JsonValue
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
