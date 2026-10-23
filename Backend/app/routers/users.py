from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
@router.put("/me", response_model=schemas.UserOut)
@router.patch("/me/progress", response_model=schemas.UserOut)
def update_my_profile(
    payload: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile details (name, bio, target role, skills, avatar) and ensure account is active."""
    if payload.name is not None and payload.name.strip():
        current_user.name = payload.name.strip()
    if payload.bio is not None:
        current_user.bio = payload.bio.strip()
    if payload.target_role is not None and payload.target_role.strip():
        current_user.target_role = payload.target_role.strip()
    if payload.skills is not None:
        if isinstance(payload.skills, list):
            current_user.skills = ", ".join([str(s).strip() for s in payload.skills if str(s).strip()])
        else:
            current_user.skills = str(payload.skills).strip()
    avatar_val = payload.avatar or payload.picture
    if avatar_val is not None:
        current_user.avatar = str(avatar_val).strip()
    if payload.progress is not None:
        current_user.progress = payload.progress

    current_user.is_active = True
    db.commit()
    db.refresh(current_user)
    return current_user