import re
from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        # Convierte CamelCase a snake_case: ImagesCatalog -> images_catalog
        name = re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower()
        # Opcional: pluralizar si quieres que coincida exactamente (users, spaces, etc.)
        # Puedes agregar una lógica de pluralización aquí si lo deseas.
        return name