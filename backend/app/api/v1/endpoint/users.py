# app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import secrets
import string

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user import UserOut, UserAdminUpdate, UserProfileUpdate
from app.model.user import User
from app.core.auth import get_password_hash

router = APIRouter()

@router.post("/me/recovery-code")
def create_recovery_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crea un código de recuperación para el usuario autenticado."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    recovery_code = "-".join(
        "".join(secrets.choice(alphabet) for _ in range(5)) for _ in range(4)
    )
    current_user.recovery_code_hash = get_password_hash(recovery_code)
    db.commit()
    return {"recovery_code": recovery_code}

@router.post("/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Genera una contraseña temporal para otro usuario. Solo administradores."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para restablecer contraseñas")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes restablecer tu propia contraseña desde esta opción")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    alphabet = string.ascii_letters + string.digits + "!@#$%&*_-"
    # Garantiza mayúscula y número según la política aplicada al registro.
    password_chars = [secrets.choice(string.ascii_uppercase), secrets.choice(string.digits)]
    password_chars.extend(secrets.choice(alphabet) for _ in range(18))
    secrets.SystemRandom().shuffle(password_chars)
    temporary_password = "".join(password_chars)

    user.password_hash = get_password_hash(temporary_password)
    user.recovery_code_hash = None
    db.commit()
    return {"temporary_password": temporary_password}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_my_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Permite a cualquier usuario autenticado actualizar su propio perfil
    (nombre, teléfono, dirección, preferencia de notificaciones).
    No incluye rol ni estatus: esos solo los cambia un administrador vía
    PUT /user/{user_id}.
    """
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """
    Listar usuarios registrados con su rol. Solo accesible para administradores.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los usuarios")

    query = db.query(User)
    if search:
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                User.display_name.ilike(f"%{search}%"),
            )
        )

    return query.order_by(User.email).offset(skip).limit(limit).all()

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cambiar el rol y/o estatus de un usuario. Solo accesible para administradores.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar usuarios")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
