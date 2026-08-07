from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.model.space import Space
from app.model.image import Image
from app.model.images_catalog import ImagesCatalog
from app.dependencies.auth import get_current_user
from app.model.user import User
from app.core.config import settings
import os
import shutil
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/spaces/{space_id}/images")
async def upload_space_images(
    space_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subir múltiples imágenes a un espacio"""
    # Verificar que el espacio existe
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    
    # Verificar permisos
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    
    # Crear un catálogo para las imágenes del espacio (si no existe)
    catalog = db.query(ImagesCatalog).filter(
        ImagesCatalog.space_id == space_id,
        ImagesCatalog.package_id.is_(None),
        ImagesCatalog.banner_id.is_(None)
    ).first()
    
    if not catalog:
        catalog = ImagesCatalog(
            space_id=space_id,
            package_id=None,
            banner_id=None
        )
        db.add(catalog)
        db.commit()
        db.refresh(catalog)
    
    uploaded_images = []
    for file in files:
        # Validar tipo de archivo
        if not file.content_type.startswith('image/'):
            continue
        
        # Generar nombre único
        ext = file.filename.split('.')[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"
        
        # Ruta de guardado (carpeta por espacio)
        upload_dir = os.path.join(settings.UPLOAD_DIR, f"spaces/{space_id}")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_name)
        
        # Guardar archivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Crear registro en BD
        image = Image(
            catalog_id=catalog.id,
            image_path=f"/uploads/spaces/{space_id}/{unique_name}",
            alt_text=file.filename
        )
        db.add(image)
        db.commit()
        db.refresh(image)
        uploaded_images.append(image)
    
    return uploaded_images

@router.get("/spaces/{space_id}/images")
def get_space_images(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener todas las imágenes de un espacio"""
    images = db.query(Image).join(ImagesCatalog).filter(
        ImagesCatalog.space_id == space_id
    ).all()
    return images

@router.delete("/images/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar una imagen (solo admin/editor)"""
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Eliminar archivo físico
    if os.path.exists(image.image_path.lstrip('/')):
        os.remove(image.image_path.lstrip('/'))
    
    db.delete(image)
    db.commit()
    return {"message": "Imagen eliminada"}