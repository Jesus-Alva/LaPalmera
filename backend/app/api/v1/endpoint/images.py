from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from datetime import datetime
from app.db.session import get_db
from app.model.image import Image
from app.model.images_catalog import ImagesCatalog
from app.schemas.image import ImageCreate, ImageOut, ImageUploadResponse
from app.schemas.images_catalog import ImagesCatalogCreate, ImagesCatalogOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

# Configuración de almacenamiento
UPLOAD_DIR = "static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------- Catálogos ----------
@router.post("/catalogs", response_model=ImagesCatalogOut)
def create_catalog(
    catalog_data: ImagesCatalogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo admin/editor pueden crear
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Verificar que al menos un ID esté presente
    if not any([catalog_data.package_id, catalog_data.space_id, catalog_data.banner_id]):
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un ID")
    
    new_catalog = ImagesCatalog(**catalog_data.model_dump())
    db.add(new_catalog)
    db.commit()
    db.refresh(new_catalog)
    return new_catalog

@router.get("/catalogs/space/{space_id}", response_model=Optional[ImagesCatalogOut])
def get_catalog_by_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.space_id == space_id).first()
    if not catalog:
        return None
    return catalog

@router.post("/catalogs/space/{space_id}", response_model=ImagesCatalogOut)
def get_or_create_catalog_for_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo admin/editor pueden crear/modificar catálogos
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Buscar catálogo existente para este espacio
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.space_id == space_id).first()
    if catalog:
        return catalog
    
    # Si no existe, crear uno nuevo
    new_catalog = ImagesCatalog(space_id=space_id)
    db.add(new_catalog)
    db.commit()
    db.refresh(new_catalog)
    return new_catalog

# ---------- Imágenes ----------
@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    catalog_id: int = Form(...),
    alt_text: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validar permiso
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    
    # Validar tamaño (máx 5MB)
    file_size = 0
    contents = await file.read()
    file_size = len(contents)
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo demasiado grande (máx 5MB)")
    
    # Generar nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Guardar archivo
    with open(filepath, "wb") as buffer:
        buffer.write(contents)
    
    # Crear registro en BD
    image_path = f"/static/images/{filename}"
    new_image = Image(
        catalog_id=catalog_id,
        image_path=image_path,
        alt_text=alt_text or file.filename
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    
    return ImageUploadResponse(
        id=new_image.id,
        image_path=new_image.image_path,
        alt_text=new_image.alt_text
    )

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Eliminar archivo físico
    if image.image_path:
        file_path = image.image_path.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.delete(image)
    db.commit()

@router.get("/catalog/{catalog_id}", response_model=list[ImageOut])
def get_images_by_catalog(
    catalog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    images = db.query(Image).filter(Image.catalog_id == catalog_id).all()
    return images