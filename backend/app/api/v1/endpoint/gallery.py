from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
from datetime import datetime
import uuid

from app.db.session import get_db
from app.model.gallery_category import GalleryCategory
from app.model.gallery_image import GalleryImage
from app.schemas.gallery import (
    GalleryCategoryCreate, GalleryCategoryUpdate, GalleryCategoryOut,
    GalleryImageCreate, GalleryImageUpdate, GalleryImageOut
)
from app.dependencies.auth import get_current_user
from app.model.user import User
from app.core.slugify import generate_slug

router = APIRouter()

# Configuración de almacenamiento
UPLOAD_DIR = "static/gallery"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============ CATEGORÍAS ============

@router.get("/categories", response_model=list[GalleryCategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listar todas las categorías con conteo de imágenes."""
    categories = db.query(GalleryCategory).order_by(GalleryCategory.sort_order, GalleryCategory.name).all()
    result = []
    for cat in categories:
        image_count = db.query(GalleryImage).filter(GalleryImage.category_id == cat.id).count()
        result.append(GalleryCategoryOut(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            sort_order=cat.sort_order,
            image_count=image_count
        ))
    return result

@router.post("/categories", response_model=GalleryCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: GalleryCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crear una nueva categoría. Genera slug automáticamente si no se proporciona."""
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Generar slug si no viene
    slug = category_data.slug or generate_slug(category_data.name)
    # Verificar unicidad del slug
    existing = db.query(GalleryCategory).filter(GalleryCategory.slug == slug).first()
    if existing:
        # Si ya existe, añadir un sufijo numérico
        base_slug = slug
        counter = 1
        while True:
            new_slug = f"{base_slug}-{counter}"
            if not db.query(GalleryCategory).filter(GalleryCategory.slug == new_slug).first():
                slug = new_slug
                break
            counter += 1

    new_category = GalleryCategory(
        name=category_data.name,
        slug=slug,
        sort_order=category_data.sort_order or 0
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

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
    if 'name' in update_data and update_data['name']:
        category.name = update_data['name']
        # Actualizar slug si cambia el nombre y no se proporcionó manualmente
        if 'slug' not in update_data or not update_data['slug']:
            category.slug = generate_slug(update_data['name'])
    if 'slug' in update_data and update_data['slug']:
        # Verificar unicidad del nuevo slug
        existing = db.query(GalleryCategory).filter(GalleryCategory.slug == update_data['slug'], GalleryCategory.id != category_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe una categoría con ese slug")
        category.slug = update_data['slug']
    if 'sort_order' in update_data:
        category.sort_order = update_data['sort_order']

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

    # Eliminar imágenes físicas antes de eliminar la categoría (cascade lo hará en BD)
    images = db.query(GalleryImage).filter(GalleryImage.category_id == category_id).all()
    for img in images:
        if img.image_path:
            file_path = img.image_path.lstrip("/")
            if os.path.exists(file_path):
                os.remove(file_path)

    db.delete(category)
    db.commit()

# ============ IMÁGENES ============

@router.get("/images", response_model=list[GalleryImageOut])
def list_images(
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listar imágenes. Filtro opcional por categoría."""
    query = db.query(GalleryImage).order_by(GalleryImage.sort_order, GalleryImage.id)
    if category_id:
        query = query.filter(GalleryImage.category_id == category_id)
    return query.all()

@router.post("/images", response_model=GalleryImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    category_id: int = Form(...),
    alt_text: Optional[str] = Form(None),
    sort_order: Optional[int] = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Subir una imagen a una categoría."""
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Validar que la categoría existe
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    # Leer contenido y validar tamaño
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="Archivo demasiado grande (máx 5MB)")

    # Generar nombre único
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_name = f"{timestamp}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Guardar archivo
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Crear registro en BD
    image_path = f"/static/gallery/{unique_name}"
    new_image = GalleryImage(
        category_id=category_id,
        image_path=image_path,
        alt_text=alt_text,
        sort_order=sort_order or 0
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image

@router.put("/images/{image_id}", response_model=GalleryImageOut)
def update_image(
    image_id: int,
    image_data: GalleryImageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    update_data = image_data.model_dump(exclude_unset=True)
    if 'category_id' in update_data:
        # Verificar que la categoría existe
        category = db.query(GalleryCategory).filter(GalleryCategory.id == update_data['category_id']).first()
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for key, value in update_data.items():
        setattr(image, key, value)

    db.commit()
    db.refresh(image)
    return image

@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
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