from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.model.celebration import Celebration
from app.schemas.celebrations import CelebrationCreate, CelebrationUpdate, CelebrationOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("/", response_model=list[CelebrationOut])
def list_celebrations(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """
    Listar celebraciones con paginación y filtros opcionales.
    """
    query = db.query(Celebration)

    if is_active is not None:
        query = query.filter(Celebration.is_active == is_active)
    if search:
        query = query.filter(Celebration.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=CelebrationOut, status_code=status.HTTP_201_CREATED)
def create_celebration(
    celebration_data: CelebrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crear una nueva celebración. Solo admin/editor pueden crear.
    """
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear celebraciones"
        )

    new_celebration = Celebration(**celebration_data.model_dump())
    db.add(new_celebration)
    db.commit()
    db.refresh(new_celebration)
    return new_celebration

@router.get("/{celebration_id}", response_model=CelebrationOut)
def get_celebration(
    celebration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    celebration = db.query(Celebration).filter(Celebration.id == celebration_id).first()
    if not celebration:
        raise HTTPException(status_code=404, detail="Celebración no encontrada")
    return celebration

@router.put("/{celebration_id}", response_model=CelebrationOut)
def update_celebration(
    celebration_id: int,
    celebration_data: CelebrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Actualizar una celebración. Solo admin/editor pueden actualizar.
    """
    celebration = db.query(Celebration).filter(Celebration.id == celebration_id).first()
    if not celebration:
        raise HTTPException(status_code=404, detail="Celebración no encontrada")

    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar celebraciones"
        )

    update_data = celebration_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(celebration, key, value)

    db.commit()
    db.refresh(celebration)
    return celebration

@router.delete("/{celebration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_celebration(
    celebration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Eliminar una celebración. Solo admin puede eliminar.
    """
    celebration = db.query(Celebration).filter(Celebration.id == celebration_id).first()
    if not celebration:
        raise HTTPException(status_code=404, detail="Celebración no encontrada")

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar celebraciones"
        )

    db.delete(celebration)
    db.commit()