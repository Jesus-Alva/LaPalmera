from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.model.banner import Banner
from app.model.images_catalog import ImagesCatalog
from app.model.image import Image
from app.schemas.banner import BannerCreate, BannerUpdate, BannerOut
from app.dependencies.auth import get_current_user
from app.model.user import User


router = APIRouter()

@router.get("/", response_model=list[BannerOut])
def list_banners(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """
    Listar banners con su primera imagen destacada.
    """
    # 1. Construir consulta base
    query = db.query(Banner)
    if search:
        query = query.filter(Banner.title.ilike(f"%{search}%"))

    # 2. Obtener banners (paginados)
    banners = query.offset(skip).limit(limit).all()
    if not banners:
        return []

    # 3. Obtener IDs de los banners
    banner_ids = [b.id for b in banners]

    # 4. Subconsulta para obtener TODAS las imágenes de cada banner, ordenadas
    subq = (
        db.query(
            ImagesCatalog.banner_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.banner_id,
                order_by=Image.id
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.banner_id.in_(banner_ids))
        .subquery()
    )

    all_images = db.query(subq).all()

    images_map = {}      # banner_id -> lista de todas las imágenes
    first_image_map = {} # banner_id -> primera imagen (destacada)

    for row in all_images:
        images_map.setdefault(row.banner_id, []).append(row.image_path)
        if row.rn == 1:
            first_image_map[row.banner_id] = row.image_path

    # 5. Construir respuesta
    result = []
    for banner in banners:
        banner_out = BannerOut(
            id=banner.id,
            title=banner.title,
            subtitle=banner.subtitle,
            description=banner.description,
            image_url=first_image_map.get(banner.id),
            images_url=images_map.get(banner.id, []),
        )
        result.append(banner_out)

    return result

@router.post("/", response_model=BannerOut, status_code=status.HTTP_201_CREATED)
def create_banner(
    banner_data: BannerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    new_banner = Banner(**banner_data.model_dump())
    db.add(new_banner)
    db.commit()
    db.refresh(new_banner)
    return new_banner

@router.get("/{banner_id}", response_model=BannerOut)
def get_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")

    images = []
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.banner_id == banner_id).first()
    if catalog:
        images = [
            img.image_path
            for img in db.query(Image).filter(Image.catalog_id == catalog.id).order_by(Image.id).all()
        ]

    return BannerOut(
        id=banner.id,
        title=banner.title,
        subtitle=banner.subtitle,
        description=banner.description,
        image_url=images[0] if images else None,
        images_url=images,
    )

@router.put("/{banner_id}", response_model=BannerOut)
def update_banner(
    banner_id: int,
    banner_data: BannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    update_data = banner_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(banner, key, value)
    db.commit()
    db.refresh(banner)
    return banner

@router.delete("/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    db.delete(banner)
    db.commit()