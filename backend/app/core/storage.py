import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings

UPLOAD_DIR = Path("static/images/spaces")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile):
    """Valida tipo y tamaño de la imagen"""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Formato no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Leer los primeros bytes para validar tamaño (no podemos usar file.size directamente)
    # FastAPI UploadFile no tiene size, lo leemos
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        file.file.seek(0)  # Resetear el puntero
        raise ValueError(f"El archivo excede el tamaño máximo de {MAX_FILE_SIZE//1024//1024}MB")
    file.file.seek(0)  # Resetear para lectura posterior
    return True

def save_image(file: UploadFile) -> str:
    """Guarda la imagen y devuelve la ruta relativa"""
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        content = file.file.read()
        f.write(content)
        file.file.seek(0)  # Resetear para futuras lecturas
    return f"/static/images/spaces/{filename}"

def delete_image(filepath: str):
    """Elimina la imagen del sistema de archivos"""
    # Limpiar path: eliminar /static/ si existe
    clean_path = filepath.replace("/static/", "")
    full_path = Path("static") / clean_path
    if full_path.exists():
        full_path.unlink()