import re
import unicodedata

def generate_slug(text: str) -> str:
    """
    Genera un slug a partir de un texto.
    Ejemplo: "Cumpleaños 2025" -> "cumpleanos-2025"
    """
    # Normalizar caracteres Unicode (ej. ñ -> n, á -> a)
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    # Convertir a minúsculas y reemplazar espacios y caracteres no alfanuméricos por guiones
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Eliminar guiones al inicio o final
    text = text.strip('-')
    return text