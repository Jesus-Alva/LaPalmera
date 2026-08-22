from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.model.package_feature_catalog import PackageFeatureCatalog
from app.schemas.package_feature_catalog import PackageFeatureCatalogCreate, PackageFeatureCatalogOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("/", response_model=list[PackageFeatureCatalogOut])
def list_feature_catalog(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Listar el catálogo de características disponibles para paquetes, ordenado alfabéticamente.
    """
    return db.query(PackageFeatureCatalog).order_by(PackageFeatureCatalog.name).all()

@router.post("/", response_model=PackageFeatureCatalogOut, status_code=status.HTTP_201_CREATED)
def create_feature_catalog_item(
    data: PackageFeatureCatalogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    name = data.name.strip()
    existing = db.query(PackageFeatureCatalog).filter(PackageFeatureCatalog.name.ilike(name)).first()
    if existing:
        return existing

    new_item = PackageFeatureCatalog(name=name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item
