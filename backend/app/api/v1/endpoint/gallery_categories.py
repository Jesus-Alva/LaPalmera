from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.model.gallery_category import GalleryCategory
from app.schemas.gallery_category import (
    GalleryCategoryCreate, GalleryCategoryUpdate, GalleryCategoryOut
)
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("", response_model=list[GalleryCategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = db.query(GalleryCategory)
    if search:
        query = query.filter(GalleryCategory.name.ilike(f"%{search}%"))
    return query.order_by(GalleryCategory.sort_order).offset(skip).limit(limit).all()

@router.post("", response_model=GalleryCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    data: GalleryCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    # Validar slug único
    existing = db.query(GalleryCategory).filter(GalleryCategory.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug ya existe")
    new = GalleryCategory(**data.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@router.get("/{category_id}", response_model=GalleryCategoryOut)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category

@router.put("/{category_id}", response_model=GalleryCategoryOut)
def update_category(
    category_id: int,
    data: GalleryCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    category = db.query(GalleryCategory).filter(GalleryCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
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
    db.delete(category)
    db.commit()