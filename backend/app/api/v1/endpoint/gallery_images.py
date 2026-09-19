from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from datetime import datetime
import uuid
from app.db.session import get_db
from app.model.gallery_category import GalleryCategory
from app.model.gallery_image import GalleryImage
from app.schemas.gallery_image import GalleryImageCreate, GalleryImageOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()
UPLOAD_DIR = "static/gallery"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=GalleryImageOut, status_code=status.HTTP_201_CREATED)
async def upload_gallery_image(
    category_id: int = Form(...),
    alt_text: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Validar categoría
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Validar archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo no permitido")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo muy grande (máx 5MB)")
    
    # Generar nombre único
    ext = file.filename.split('.')[-1]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_name = f"{timestamp}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    image_path = f"/static/gallery/{unique_name}"
    new_image = GalleryImage(
        category_id=category_id,
        image_path=image_path,
        alt_text=alt_text or file.filename,
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    # Eliminar archivo físico
    if image.image_path:
        full_path = image.image_path.lstrip("/")
        if os.path.exists(full_path):
            os.remove(full_path)
    db.delete(image)
    db.commit()

@router.get("/category/{category_id}", response_model=list[GalleryImageOut])
def get_images_by_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    images = db.query(GalleryImage).filter(GalleryImage.category_id == category_id).order_by(GalleryImage.sort_order).all()
    return images