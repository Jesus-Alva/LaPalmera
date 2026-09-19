from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.model.space import Space
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceOut
from app.dependencies.auth import get_current_user
from app.model.user import User

from app.model.image import Image
from app.model.images_catalog import ImagesCatalog

router = APIRouter()

@router.get("", response_model=list[SpaceOut])
def list_spaces(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """
    Listar espacios con paginación, filtros, y todas sus imágenes.
    """
    query = db.query(Space)

    if is_active is not None:
        query = query.filter(Space.is_active == is_active)
    if search:
        query = query.filter(Space.title.ilike(f"%{search}%"))

    spaces = query.offset(skip).limit(limit).all()
    if not spaces:
        return []

    space_ids = [s.id for s in spaces]

    # Obtener TODAS las imágenes agrupadas por space_id
    images_subq = (
        db.query(
            ImagesCatalog.space_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.space_id,
                order_by=Image.id
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.space_id.in_(space_ids))
        .subquery()
    )

    images_map, first_image_map = {}, {}
    for row in db.query(images_subq).all():
        images_map.setdefault(row.space_id, []).append(row.image_path)
        if row.rn == 1:
            first_image_map[row.space_id] = row.image_path

    return [
        SpaceOut(
            id=space.id,
            title=space.title,
            description=space.description,
            is_active=space.is_active,
            image_url=first_image_map.get(space.id),
            images_url=images_map.get(space.id, []),
        )
        for space in spaces
    ]

@router.post("", response_model=SpaceOut, status_code=status.HTTP_201_CREATED)
def create_space(
    space_data: SpaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crear un nuevo espacio. Solo admin/editor pueden crear.
    """
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

    image_path = None
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.space_id == space_id).first()
    if catalog:
        first_image = db.query(Image).filter(Image.catalog_id == catalog.id).order_by(Image.id).first()
        if first_image:
            image_path = first_image.image_path

    return SpaceOut(
        id=space.id,
        title=space.title,
        description=space.description,
        is_active=space.is_active,
        image_url=image_path,
    )

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

    # Actualizar solo campos enviados. Las imágenes se gestionan aparte
    # (vía /images), así que si no se tocan aquí el espacio las conserva tal cual.
    update_data = space_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(space, key, value)

    db.commit()
    db.refresh(space)

    image_path = None
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.space_id == space_id).first()
    if catalog:
        first_image = db.query(Image).filter(Image.catalog_id == catalog.id).order_by(Image.id).first()
        if first_image:
            image_path = first_image.image_path

    return SpaceOut(
        id=space.id,
        title=space.title,
        description=space.description,
        is_active=space.is_active,
        image_url=image_path,
    )

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
