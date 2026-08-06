from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.auth import decode_access_token
from app.db.session import get_db
from app.model.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False  # No lanza error automáticamente
)

def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtiene el usuario autenticado desde el token en:
    - Header Authorization: Bearer <token>
    - Cookie: access_token
    """
    # 1. Intentar desde el header
    if token:
        payload = decode_access_token(token)
        if payload:
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    return user

    # 2. Intentar desde la cookie
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        payload = decode_access_token(cookie_token)
        if payload:
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    return user

    # 3. Si nada funciona, lanzar error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

# Para usar en endpoints protegidos:
# from app.dependencies.auth import get_current_user