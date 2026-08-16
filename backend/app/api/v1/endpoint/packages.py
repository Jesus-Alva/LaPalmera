from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.model.package import Package
from app.model.package_feature import PackageFeature
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
    current_user: User = Depends(get_current_user),
):
    """
    Listar paquetes con paginación, filtros, y todas sus imágenes y características.
    """
    # 1. Consulta base con join a Celebration para obtener título
    query = db.query(Package, Celebration.title.label('celebration_title')) \
              .join(Celebration, Package.celebration_id == Celebration.id)

    # Aplicar filtros
    if celebration_id:
        query = query.filter(Package.celebration_id == celebration_id)
    if search:
        query = query.filter(Package.title.ilike(f"%{search}%"))
    if is_active is not None:
        query = query.filter(Package.is_active == is_active)

    # Paginación
    results = query.offset(skip).limit(limit).all()
    if not results:
        return []

    # 2. Extraer IDs de los paquetes
    package_ids = [p.id for p, _ in results]

    # 3. Obtener TODAS las imágenes agrupadas por package_id
    #    Usamos una subconsulta con ROW_NUMBER para ordenar, pero luego agrupamos todas.
    images_subq = (
        db.query(
            ImagesCatalog.package_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.package_id,
                order_by=Image.id  # Ordenadas por ID (más antigua primero)
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.package_id.in_(package_ids))
        .subquery()
    )

    # Obtenemos todas las filas (todas las imágenes)
    all_images = db.query(images_subq).all()
    
    # Diccionarios para almacenar imágenes
    images_map = {}      # package_id -> list of image_paths (todas)
    first_image_map = {} # package_id -> first image (destacada)

    for row in all_images:
        pkg_id = row.package_id
        if pkg_id not in images_map:
            images_map[pkg_id] = []
        images_map[pkg_id].append(row.image_path)
        # La primera imagen es la de rn=1 (la más antigua)
        if row.rn == 1:
            first_image_map[pkg_id] = row.image_path

    # 4. Obtener todas las características agrupadas por package_id
    features_map = {}
    if package_ids:
        feature_rows = db.query(PackageFeature).filter(
            PackageFeature.package_id.in_(package_ids)
        ).all()
        for f in feature_rows:
            features_map.setdefault(f.package_id, []).append(f)

    # 5. Construir respuesta
    result = []
    for package, celebration_title in results:
        package_out = PackageOut(
            id=package.id,
            title=package.title,
            short_description=package.short_description,
            is_active=package.is_active,
            sort_order=package.sort_order,
            date_available_start=package.date_available_start,
            date_available_end=package.date_available_end,
            celebration_id=package.celebration_id,
            celebration_title=celebration_title,
            image_url=first_image_map.get(package.id),          # primera imagen (destacada)
            images_url=images_map.get(package.id, []),          # todas las imágenes
            features=features_map.get(package.id, []),
        )
        result.append(package_out)

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

    # Crear paquete
    new_package = Package(**package_data.model_dump(exclude={'features'}))
    db.add(new_package)
    db.commit()
    db.refresh(new_package)

    # Procesar features
    if package_data.features:
        for feature_data in package_data.features:
            feature = PackageFeature(
                package_id=new_package.id,
                feature_key=feature_data.feature_key,
                feature_value=feature_data.feature_value
            )
            db.add(feature)
        db.commit()

    # Obtener el paquete completo con relaciones
    result = db.query(Package, Celebration.title.label('celebration_title')).join(Celebration, Package.celebration_id == Celebration.id).filter(Package.id == new_package.id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Error al recuperar paquete")

    package, celebration_title = result
    package_out = PackageOut(
        id=package.id,
        title=package.title,
        short_description=package.short_description,
        is_active=package.is_active,
        sort_order=package.sort_order,
        date_available_start=package.date_available_start,
        date_available_end=package.date_available_end,
        celebration_id=package.celebration_id,
        celebration_title=celebration_title,
        image_url=None,
        features=package.features  # Esto carga las relaciones lazy (necesitamos eager load)
    )
    return package_out

@router.get("/{package_id}", response_model=PackageOut)
def get_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")

    # Obtener celebration_title
    celebration = db.query(Celebration).filter(Celebration.id == package.celebration_id).first()
    celebration_title = celebration.title if celebration else None

    # Obtener imagen destacada
    image_path = None
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.package_id == package_id).first()
    if catalog:
        first_image = db.query(Image).filter(Image.catalog_id == catalog.id).order_by(Image.id).first()
        if first_image:
            image_path = first_image.image_path

    # Construir respuesta
    package_out = PackageOut(
        id=package.id,
        title=package.title,
        short_description=package.short_description,
        is_active=package.is_active,
        sort_order=package.sort_order,
        date_available_start=package.date_available_start,
        date_available_end=package.date_available_end,
        celebration_id=package.celebration_id,
        celebration_title=celebration_title,
        image_url=image_path,
        features=package.features  # Relación lazy, ya cargada
    )
    return package_out

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

    # Actualizar campos básicos
    update_data = package_data.model_dump(exclude_unset=True, exclude={'features'})
    for key, value in update_data.items():
        setattr(package, key, value)

    # Actualizar features (reemplazar)
    if package_data.features is not None:
        # Eliminar todas las existentes
        db.query(PackageFeature).filter(PackageFeature.package_id == package_id).delete()
        # Crear nuevas
        for feature_data in package_data.features:
            feature = PackageFeature(
                package_id=package_id,
                feature_key=feature_data.feature_key,
                feature_value=feature_data.feature_value
            )
            db.add(feature)

    db.commit()
    db.refresh(package)

    # Obtener celebration_title
    celebration = db.query(Celebration).filter(Celebration.id == package.celebration_id).first()
    celebration_title = celebration.title if celebration else None

    # Obtener imagen destacada
    image_path = None
    catalog = db.query(ImagesCatalog).filter(ImagesCatalog.package_id == package_id).first()
    if catalog:
        first_image = db.query(Image).filter(Image.catalog_id == catalog.id).order_by(Image.id).first()
        if first_image:
            image_path = first_image.image_path

    package_out = PackageOut(
        id=package.id,
        title=package.title,
        short_description=package.short_description,
        is_active=package.is_active,
        sort_order=package.sort_order,
        date_available_start=package.date_available_start,
        date_available_end=package.date_available_end,
        celebration_id=package.celebration_id,
        celebration_title=celebration_title,
        image_url=image_path,
        features=package.features
    )
    return package_out

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

    # Eliminar features asociados
    db.query(PackageFeature).filter(PackageFeature.package_id == package_id).delete()
    db.delete(package)
    db.commit()