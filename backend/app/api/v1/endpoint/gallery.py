from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
from datetime import datetime
import uuid
from app.db.session import get_db
from app.model.gallery_category import GalleryCategory
from app.model.gallery_image import GalleryImage
from app.schemas.gallery_category import GalleryCategoryCreate, GalleryCategoryUpdate, GalleryCategoryOut
from app.schemas.gallery_image import GalleryImageCreate, GalleryImageOut
from app.dependencies.auth import get_current_user
from app.model.user import User
from app.core.config import settings

router = APIRouter()

# Directorio de subida para imágenes de galería
UPLOAD_DIR = "static/gallery"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============ CATEGORÍAS ============
@router.get("/categories", response_model=list[GalleryCategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categories = db.query(GalleryCategory).order_by(GalleryCategory.sort_order).all()
    return categories

@router.post("/categories", response_model=GalleryCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: GalleryCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    # Verificar slug único
    existing = db.query(GalleryCategory).filter(GalleryCategory.slug == category_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug ya existe")
    new_category = GalleryCategory(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.get("/categories/{category_id}", response_model=GalleryCategoryOut)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category

@router.put("/categories/{category_id}", response_model=GalleryCategoryOut)
def update_category(
    category_id: int,
    category_data: GalleryCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    update_data = category_data.model_dump(exclude_unset=True)
    if 'slug' in update_data:
        existing = db.query(GalleryCategory).filter(GalleryCategory.slug == update_data['slug'], GalleryCategory.id != category_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug ya existe")
    for key, value in update_data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    # Eliminar imágenes físicas
    for image in category.images:
        if image.image_path:
            file_path = image.image_path.lstrip("/")
            if os.path.exists(file_path):
                os.remove(file_path)
    db.delete(category)
    db.commit()

# ============ IMÁGENES ============
@router.post("/categories/{category_id}/images", response_model=GalleryImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image_to_category(
    category_id: int,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    sort_order: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo demasiado grande (máx 5MB)")
    
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
        sort_order=sort_order
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image

@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
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
        file_path = image.image_path.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)
    db.delete(image)
    db.commit()

@router.put("/images/{image_id}", response_model=GalleryImageOut)
def update_gallery_image(
    image_id: int,
    alt_text: Optional[str] = None,
    sort_order: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    if alt_text is not None:
        image.alt_text = alt_text
    if sort_order is not None:
        image.sort_order = sort_order
    db.commit()
    db.refresh(image)
    return image

@router.get("/categories/{category_id}/images", response_model=list[GalleryImageOut])
def get_images_by_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    images = db.query(GalleryImage).filter(GalleryImage.category_id == category_id).order_by(GalleryImage.sort_order).all()
    return images