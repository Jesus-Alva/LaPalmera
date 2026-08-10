from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.model.space import Space
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceOut
from app.dependencies.auth import get_current_user
from app.model.user import User

from app.schemas.image import ImageOut
from app.model.image import Image
from app.model.images_catalog import ImagesCatalog
import uuid
import shutil
import os
from pathlib import Path

router = APIRouter()
UPLOAD_DIR = Path("static/uploads/spaces")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", response_model=list[SpaceOut])
def list_spaces(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    # 1. Construir consulta base para espacios
    query = db.query(Space)

    if is_active is not None:
        query = query.filter(Space.is_active == is_active)
    if search:
        query = query.filter(Space.title.ilike(f"%{search}%"))

    # 2. Obtener espacios (con paginación)
    spaces = query.offset(skip).limit(limit).all()

    if not spaces:
        return []

    # 3. Obtener IDs de los espacios
    space_ids = [s.id for s in spaces]

    # 4. Obtener la primera imagen de cada espacio
    #    Usamos una subconsulta con ROW_NUMBER para obtener la primera (la de menor ID)
    subq = (
        db.query(
            ImagesCatalog.space_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.space_id,
                order_by=Image.id  # la primera imagen (menor ID)
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.space_id.in_(space_ids))
        .subquery()
    )

    # Filtramos solo la primera imagen (rn = 1)
    first_images = db.query(subq).filter(subq.c.rn == 1).all()

    # Crear un diccionario {space_id: image_path}
    image_map = {row.space_id: row.image_path for row in first_images}

    # 5. Construir respuesta
    result = []
    for space in spaces:
        space_out = SpaceOut(
            id=space.id,
            title=space.title,
            description=space.description,
            is_active=space.is_active,
            image_url=image_map.get(space.id)  # None si no tiene imagen
        )
        result.append(space_out)

    return result

@router.post("/", response_model=SpaceOut, status_code=status.HTTP_201_CREATED)
def create_space(
    space_data: SpaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crear un nuevo espacio. Solo admin/editor pueden crear.
    """
    # Verificar permisos (opcional)
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear espacios"
        )
    
    new_space = Space(**space_data.model_dump())
    db.add(new_space)
    db.commit()
    db.refresh(new_space)
    return new_space

@router.get("/{space_id}", response_model=SpaceOut)
def get_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return space

@router.put("/{space_id}", response_model=SpaceOut)
def update_space(
    space_id: int,
    space_data: SpaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Actualizar un espacio. Solo admin/editor pueden actualizar.
    """
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar espacios"
        )
    
    # Actualizar solo campos enviados
    update_data = space_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(space, key, value)
    
    db.commit()
    db.refresh(space)
    return space

@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Eliminar un espacio. Solo admin puede eliminar.
    """
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar espacios"
        )
    
    db.delete(space)
    db.commit()
    
@router.get("/{space_id}/images", response_model=list[ImageOut])
def get_space_images(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener todas las imágenes de un espacio"""
    # Verificar que el espacio existe
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")

    # Buscar el catálogo de imágenes del espacio
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.space_id == space_id).first()
    if not catalog:
        return []  # Si no hay catálogo, devolver lista vacía

    images = db.query(Image).filter(Image.catalog_id == catalog.id).all()
    return images

@router.post("/{space_id}/images", response_model=ImageOut, status_code=status.HTTP_201_CREATED)
def upload_space_image(
    space_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Subir una imagen para un espacio"""
    # Verificar permisos
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para subir imágenes")

    # Verificar que el espacio existe
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")

    # Validar tipo de archivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    # Validar tamaño (5MB)
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no debe superar 5MB")

    # Crear nombre único para el archivo
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"space_{space_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    # Guardar archivo
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Error al guardar la imagen")

    # Buscar o crear catálogo de imágenes del espacio
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.space_id == space_id).first()
    if not catalog:
        catalog = ImagesCatalog(
            package_id=1,  # Temporal, esto se ajustará después
            space_id=space_id,
            banner_id=1,   # Temporal
        )
        db.add(catalog)
        db.commit()
        db.refresh(catalog)

    # Crear registro de imagen
    image = Image(
        catalog_id=catalog.id,
        image_path=f"/static/uploads/spaces/{unique_filename}",
        alt_text=file.filename,
    )
    db.add(image)
    db.commit()
    db.refresh(image)

    return image

@router.delete("/{space_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space_image(
    space_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Eliminar una imagen de un espacio"""
    # Verificar permisos
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar imágenes")

    # Buscar la imagen
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    # Verificar que la imagen pertenece al espacio
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.id == image.catalog_id).first()
    if not catalog or catalog.space_id != space_id:
        raise HTTPException(status_code=403, detail="La imagen no pertenece a este espacio")

    # Eliminar archivo físico
    file_path = Path("static") / image.image_path.lstrip("/")
    if file_path.exists():
        file_path.unlink()

    # Eliminar registro de la base de datos
    db.delete(image)
    db.commit()