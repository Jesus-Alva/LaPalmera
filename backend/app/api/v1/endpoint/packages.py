# app/api/v1/endpoints/packages.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from app.db.session import get_db
from app.model.package import Package
from app.model.celebration import Celebration
from app.model.images_catalog import ImagesCatalog
from app.model.image import Image
from app.schemas.package import PackageCreate, PackageUpdate, PackageOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("/", response_model=list[PackageOut])
def list_packages(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    celebration_id: Optional[int] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    available_only: bool = Query(False, description="Filtrar solo paquetes disponibles (activos y dentro de rango de fechas)"),
    current_user: User = Depends(get_current_user),
):
    """
    Listar paquetes con paginación, filtros y su primera imagen.
    """
    # 1. Consulta base
    query = db.query(Package).join(Celebration, Celebration.id == Package.celebration_id)
    
    if celebration_id:
        query = query.filter(Package.celebration_id == celebration_id)
    if search:
        query = query.filter(Package.title.ilike(f"%{search}%"))
    if is_active is not None:
        query = query.filter(Package.is_active == is_active)
    
    # Filtrar solo disponibles (activos y dentro de rango de fechas, o sin fechas)
    if available_only:
        today = date.today()
        query = query.filter(
            Package.is_active == True,
            (Package.data_available_start.is_(None) | (Package.data_available_start <= today)),
            (Package.data_available_end.is_(None) | (Package.data_available_end >= today))
        )

    # 2. Obtener paquetes (paginados)
    packages = query.offset(skip).limit(limit).all()
    if not packages:
        return []

    # 3. Obtener imagen destacada para cada paquete
    package_ids = [p.id for p in packages]
    subq = (
        db.query(
            ImagesCatalog.package_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.package_id,
                order_by=Image.id
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.package_id.in_(package_ids))
        .subquery()
    )
    first_images = db.query(subq).filter(subq.c.rn == 1).all()
    image_map = {row.package_id: row.image_path for row in first_images}

    # 4. Construir respuesta
    result = []
    today = date.today()
    for pkg in packages:
        is_available = (
            pkg.is_active and
            (pkg.data_available_start is None or pkg.data_available_start <= today) and
            (pkg.data_available_end is None or pkg.data_available_end >= today)
        )
        result.append(
            PackageOut(
                id=pkg.id,
                title=pkg.title,
                short_description=pkg.short_description,
                image_path=pkg.image_path,
                is_active=pkg.is_active,
                sort_order=pkg.sort_order,
                celebration_id=pkg.celebration_id,
                data_available_start=pkg.data_available_start,
                data_available_end=pkg.data_available_end,
                image_url=image_map.get(pkg.id),
                celebration_title=pkg.celebration.title if pkg.celebration else None,
                is_available=is_available,
            )
        )
    return result

@router.post("/", response_model=PackageOut, status_code=status.HTTP_201_CREATED)
def create_package(
    package_data: PackageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Verificar que la celebración existe
    celebration = db.query(Celebration).filter(Celebration.id == package_data.celebration_id).first()
    if not celebration:
        raise HTTPException(status_code=404, detail="Celebración no encontrada")
    
    new_package = Package(**package_data.model_dump())
    db.add(new_package)
    db.commit()
    db.refresh(new_package)
    return PackageOut(
        id=new_package.id,
        title=new_package.title,
        short_description=new_package.short_description,
        image_path=new_package.image_path,
        is_active=new_package.is_active,
        sort_order=new_package.sort_order,
        celebration_id=new_package.celebration_id,
        data_available_start=new_package.data_available_start,
        data_available_end=new_package.data_available_end,
        celebration_title=celebration.title,
        is_available=True,
    )

@router.get("/{package_id}", response_model=PackageOut)
def get_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    # Obtener imagen destacada
    first_image = (
        db.query(Image.image_path)
        .join(ImagesCatalog, ImagesCatalog.id == Image.catalog_id)
        .filter(ImagesCatalog.package_id == package_id)
        .order_by(Image.id)
        .first()
    )
    image_url = first_image.image_path if first_image else None
    
    today = date.today()
    is_available = (
        package.is_active and
        (package.data_available_start is None or package.data_available_start <= today) and
        (package.data_available_end is None or package.data_available_end >= today)
    )
    
    return PackageOut(
        id=package.id,
        title=package.title,
        short_description=package.short_description,
        image_path=package.image_path,
        is_active=package.is_active,
        sort_order=package.sort_order,
        celebration_id=package.celebration_id,
        data_available_start=package.data_available_start,
        data_available_end=package.data_available_end,
        image_url=image_url,
        celebration_title=package.celebration.title if package.celebration else None,
        is_available=is_available,
    )

@router.put("/{package_id}", response_model=PackageOut)
def update_package(
    package_id: int,
    package_data: PackageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    # Si se cambia la celebración, verificar que existe
    if package_data.celebration_id:
        celebration = db.query(Celebration).filter(Celebration.id == package_data.celebration_id).first()
        if not celebration:
            raise HTTPException(status_code=404, detail="Celebración no encontrada")
    
    update_data = package_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(package, key, value)
    
    db.commit()
    db.refresh(package)
    
    # Obtener imagen destacada
    first_image = (
        db.query(Image.image_path)
        .join(ImagesCatalog, ImagesCatalog.id == Image.catalog_id)
        .filter(ImagesCatalog.package_id == package_id)
        .order_by(Image.id)
        .first()
    )
    image_url = first_image.image_path if first_image else None
    
    today = date.today()
    is_available = (
        package.is_active and
        (package.data_available_start is None or package.data_available_start <= today) and
        (package.data_available_end is None or package.data_available_end >= today)
    )
    
    return PackageOut(
        id=package.id,
        title=package.title,
        short_description=package.short_description,
        image_path=package.image_path,
        is_active=package.is_active,
        sort_order=package.sort_order,
        celebration_id=package.celebration_id,
        data_available_start=package.data_available_start,
        data_available_end=package.data_available_end,
        image_url=image_url,
        celebration_title=package.celebration.title if package.celebration else None,
        is_available=is_available,
    )

@router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    # Eliminar también las características y las imágenes (opcional, o dejar en cascada)
    db.delete(package)
    db.commit()