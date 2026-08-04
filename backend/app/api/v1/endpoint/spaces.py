from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.model.space import Space
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("/", response_model=list[SpaceOut])
def list_spaces(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),  # solo autenticados
):
    """
    Listar espacios con paginación y filtros opcionales.
    """
    query = db.query(Space)

    if is_active is not None:
        query = query.filter(Space.is_active == is_active)
    
    if search:
        query = query.filter(Space.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items

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