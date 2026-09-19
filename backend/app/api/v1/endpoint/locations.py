from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.model.location import Location
from app.schemas.location import LocationCreate, LocationUpdate, LocationOut
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("", response_model=list[LocationOut])
def list_locations(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = db.query(Location)
    if is_active is not None:
        query = query.filter(Location.is_active == is_active)
    if search:
        query = query.filter(
            (Location.name.ilike(f"%{search}%")) |
            (Location.city.ilike(f"%{search}%")) |
            (Location.state.ilike(f"%{search}%"))
        )
    items = query.offset(skip).limit(limit).all()
    return items

@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(
    location_data: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Si se marca como principal, desmarcar otros (opcional)
    if location_data.is_primary:
        db.query(Location).update({Location.is_primary: False})
    
    new_location = Location(**location_data.model_dump())
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@router.get("/{location_id}", response_model=LocationOut)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    return location

@router.put("/{location_id}", response_model=LocationOut)
def update_location(
    location_id: int,
    location_data: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    
    update_data = location_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(location, key, value)
    
    db.commit()
    db.refresh(location)
    return location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    
    db.delete(location)
    db.commit()