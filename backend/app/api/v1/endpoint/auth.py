# app/api/v1/endpoints/auth.py
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut
from app.schemas.token import Token
from app.core.auth import authenticate_user, create_access_token, get_password_hash
from app.db.session import get_db
from app.model.user import User
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed,
        display_name=user_data.display_name,
        phone=user_data.phone,
        address=user_data.address,
        notifications_enabled=user_data.notifications_enabled,
        role="read",  # Todo usuario nuevo inicia en solo-lectura; un admin debe elevarlo desde el panel de usuarios
        status="active",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta cuenta está inactiva o suspendida. Contacta a un administrador.",
        )

    user.last_login_at = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    # Establecer la cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="none",   # Permite cross-origin
        secure=True,       # Solo HTTPS (Railway ya lo provee)
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60 # 30 min en segundos
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
