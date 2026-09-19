from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.model.site_setting import SiteSetting
from app.schemas.site_setting import SiteSettingOut, SiteSettingUpdate
from app.dependencies.auth import get_current_user
from app.model.user import User

router = APIRouter()

@router.get("", response_model=list[SiteSettingOut])
def list_site_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(SiteSetting).order_by(SiteSetting.setting_key).all()

@router.get("/{setting_key}", response_model=SiteSettingOut)
def get_site_setting(
    setting_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = db.query(SiteSetting).filter(SiteSetting.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return setting

@router.put("/{setting_key}", response_model=SiteSettingOut)
def upsert_site_setting(
    setting_key: str,
    setting_data: SiteSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    setting = db.query(SiteSetting).filter(SiteSetting.setting_key == setting_key).first()
    if setting:
        setting.setting_value = setting_data.setting_value
    else:
        setting = SiteSetting(setting_key=setting_key, setting_value=setting_data.setting_value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
