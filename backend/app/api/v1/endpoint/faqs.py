from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.model.faq import Faq
from app.schemas.faq import FaqCreate, FaqUpdate, FaqOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("", response_model=list[FaqOut])
def list_faqs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = db.query(Faq)
    if is_active is not None:
        query = query.filter(Faq.is_active == is_active)
    if search:
        query = query.filter(Faq.question.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.post("", response_model=FaqOut, status_code=status.HTTP_201_CREATED)
def create_faq(
    faq_data: FaqCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    new_faq = Faq(**faq_data.model_dump())
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return new_faq

@router.get("/{faq_id}", response_model=FaqOut)
def get_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    faq = db.query(Faq).filter(Faq.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrado")
    return faq

@router.put("/{faq_id}", response_model=FaqOut)
def update_faq(
    faq_id: int,
    faq_data: FaqUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    faq = db.query(Faq).filter(Faq.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrado")
    update_data = faq_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(faq, key, value)
    db.commit()
    db.refresh(faq)
    return faq

@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    faq = db.query(Faq).filter(Faq.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrado")
    db.delete(faq)
    db.commit()