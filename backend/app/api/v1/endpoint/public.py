from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.db.session import get_db

from app.model.banner import Banner
from app.model.space import Space
from app.model.celebration import Celebration
from app.model.package import Package
from app.model.package_feature import PackageFeature
from app.model.location import Location
from app.model.team_member import TeamMember
from app.model.gallery_category import GalleryCategory
from app.model.gallery_image import GalleryImage
from app.model.images_catalog import ImagesCatalog
from app.model.image import Image

from app.schemas.banner import BannerOut
from app.schemas.space import SpaceOut
from app.schemas.celebrations import CelebrationOut
from app.schemas.package import PackageOut
from app.schemas.location import LocationOut
from app.schemas.team_members import TeamMemberOut
from app.schemas.gallery import GalleryCategoryOut, GalleryImageOut

router = APIRouter()

"""
Endpoints públicos de solo lectura, sin autenticación, para alimentar el
sitio público (home, galería, etc). Solo exponen los datos ya marcados como
activos (is_active=True donde el modelo lo soporta) y no requieren sesión.
"""


@router.get("/banners", response_model=list[BannerOut])
def list_public_banners(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    banners = db.query(Banner).order_by(Banner.id).limit(limit).all()
    if not banners:
        return []

    banner_ids = [b.id for b in banners]
    subq = (
        db.query(
            ImagesCatalog.banner_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.banner_id,
                order_by=Image.id
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.banner_id.in_(banner_ids))
        .subquery()
    )
    images_map, first_image_map = {}, {}
    for row in db.query(subq).all():
        images_map.setdefault(row.banner_id, []).append(row.image_path)
        if row.rn == 1:
            first_image_map[row.banner_id] = row.image_path

    return [
        BannerOut(
            id=b.id,
            title=b.title,
            subtitle=b.subtitle,
            description=b.description,
            image_url=first_image_map.get(b.id),
            images_url=images_map.get(b.id, []),
        )
        for b in banners
    ]


@router.get("/spaces", response_model=list[SpaceOut])
def list_public_spaces(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    spaces = (
        db.query(Space)
        .filter(Space.is_active == True)
        .order_by(Space.id)
        .limit(limit)
        .all()
    )
    if not spaces:
        return []

    space_ids = [s.id for s in spaces]
    subq = (
        db.query(
            ImagesCatalog.space_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.space_id,
                order_by=Image.id
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.space_id.in_(space_ids))
        .subquery()
    )
    first_images = db.query(subq).filter(subq.c.rn == 1).all()
    image_map = {row.space_id: row.image_path for row in first_images}

    return [
        SpaceOut(
            id=s.id,
            title=s.title,
            description=s.description,
            is_active=s.is_active,
            image_url=image_map.get(s.id),
        )
        for s in spaces
    ]


@router.get("/celebrations", response_model=list[CelebrationOut])
def list_public_celebrations(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    return (
        db.query(Celebration)
        .filter(Celebration.is_active == True)
        .order_by(Celebration.sort_order, Celebration.id)
        .limit(limit)
        .all()
    )


@router.get("/packages", response_model=list[PackageOut])
def list_public_packages(
    db: Session = Depends(get_db),
    celebration_id: Optional[int] = None,
    limit: int = Query(20, ge=1, le=200),
):
    query = (
        db.query(Package, Celebration.title.label("celebration_title"))
        .join(Celebration, Package.celebration_id == Celebration.id)
        .filter(Package.is_active == True)
    )
    if celebration_id:
        query = query.filter(Package.celebration_id == celebration_id)

    results = query.order_by(Package.sort_order, Package.id).limit(limit).all()
    if not results:
        return []

    package_ids = [p.id for p, _ in results]

    images_subq = (
        db.query(
            ImagesCatalog.package_id,
            Image.image_path,
            func.row_number().over(
                partition_by=ImagesCatalog.package_id,
                order_by=Image.id
            ).label("rn")
        )
        .join(Image, Image.catalog_id == ImagesCatalog.id)
        .filter(ImagesCatalog.package_id.in_(package_ids))
        .subquery()
    )
    images_map, first_image_map = {}, {}
    for row in db.query(images_subq).all():
        images_map.setdefault(row.package_id, []).append(row.image_path)
        if row.rn == 1:
            first_image_map[row.package_id] = row.image_path

    features_map = {}
    for f in db.query(PackageFeature).filter(PackageFeature.package_id.in_(package_ids)).all():
        features_map.setdefault(f.package_id, []).append(f)

    return [
        PackageOut(
            id=package.id,
            title=package.title,
            short_description=package.short_description,
            is_active=package.is_active,
            sort_order=package.sort_order,
            date_available_start=package.date_available_start,
            date_available_end=package.date_available_end,
            celebration_id=package.celebration_id,
            celebration_title=celebration_title,
            image_url=first_image_map.get(package.id),
            images_url=images_map.get(package.id, []),
            features=features_map.get(package.id, []),
        )
        for package, celebration_title in results
    ]


@router.get("/locations", response_model=list[LocationOut])
def list_public_locations(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    return (
        db.query(Location)
        .filter(Location.is_active == True)
        .order_by(Location.sort_order, Location.id)
        .limit(limit)
        .all()
    )


@router.get("/team-members", response_model=list[TeamMemberOut])
def list_public_team_members(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
):
    return (
        db.query(TeamMember)
        .filter(TeamMember.is_active == True)
        .order_by(TeamMember.sort_order, TeamMember.id)
        .limit(limit)
        .all()
    )


@router.get("/gallery/categories", response_model=list[GalleryCategoryOut])
def list_public_gallery_categories(db: Session = Depends(get_db)):
    categories = db.query(GalleryCategory).order_by(GalleryCategory.sort_order, GalleryCategory.name).all()
    return [
        GalleryCategoryOut(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            sort_order=cat.sort_order,
            image_count=db.query(GalleryImage).filter(GalleryImage.category_id == cat.id).count(),
        )
        for cat in categories
    ]


@router.get("/gallery/images", response_model=list[GalleryImageOut])
def list_public_gallery_images(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(GalleryImage).order_by(GalleryImage.sort_order, GalleryImage.id)
    if category_id:
        query = query.filter(GalleryImage.category_id == category_id)
    return query.all()
