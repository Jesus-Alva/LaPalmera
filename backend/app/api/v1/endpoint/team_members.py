from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from datetime import datetime
import uuid

from app.db.session import get_db
from app.model.team_member import TeamMember
from app.schemas.team_members import TeamMemberCreate, TeamMemberUpdate, TeamMemberOut
from app.dependencies.auth import get_current_user
from app.model.user import User
from app.core.config import settings

router = APIRouter()

UPLOAD_DIR = "static/team_members"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=list[TeamMemberOut])
def list_team_members(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = db.query(TeamMember)

    if is_active is not None:
        query = query.filter(TeamMember.is_active == is_active)
    if search:
        query = query.filter(TeamMember.name.ilike(f"%{search}%"))

    items = query.offset(skip).limit(limit).all()
    return items

@router.post("", response_model=TeamMemberOut, status_code=status.HTTP_201_CREATED)
def create_team_member(
    data: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para crear miembros del equipo")

    new_item = TeamMember(**data.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/{item_id}", response_model=TeamMemberOut)
def get_team_member(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(TeamMember).filter(TeamMember.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Miembro del equipo no encontrado")
    return item

@router.put("/{item_id}", response_model=TeamMemberOut)
def update_team_member(
    item_id: int,
    data: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar miembros del equipo")

    item = db.query(TeamMember).filter(TeamMember.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Miembro del equipo no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_member(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar miembros del equipo")

    item = db.query(TeamMember).filter(TeamMember.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Miembro del equipo no encontrado")

    # Opcional: eliminar la foto físicamente si existe
    # if item.photo_path:
    #     file_path = item.photo_path.lstrip("/")
    #     if os.path.exists(file_path):
    #         os.remove(file_path)

    db.delete(item)
    db.commit()
    
@router.post("/upload-photo", status_code=status.HTTP_201_CREATED)
async def upload_team_member_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Subir una foto para un miembro del equipo.
    Retorna la ruta de la imagen guardada.
    """
    # Validar permisos
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para subir fotos"
        )

    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF."
        )

    # Validar tamaño (máx 5MB)
    contents = await file.read()
    file_size = len(contents)
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archivo demasiado grande (máx 5MB)"
        )

    # Generar nombre único
    ext = file.filename.split('.')[-1]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_name = f"{timestamp}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Guardar archivo
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Retornar ruta para almacenar en BD
    return {"photo_path": f"/static/team_members/{unique_name}"}