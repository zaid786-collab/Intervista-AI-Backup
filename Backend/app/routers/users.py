from fastapi import APIRouter, Depends, HTTPException, status
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


@router.post("/change-password")
def change_password(
    payload: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Securely update account password after verifying the existing password."""
    from app.auth import verify_password, hash_password

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"success": True, "message": "Password updated successfully."}


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_my_account(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Self-service account deletion.
    Permanently deletes user profile and associated private interview/progress records.
    Master administrator accounts cannot be deleted self-service.
    """
    from app.dependencies import is_master_admin_email

    if is_master_admin_email(current_user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The master administrator account cannot be deleted.",
        )

    uid = current_user.id
    # Cascade delete private user records
    db.query(models.InterviewAnswer).filter(models.InterviewAnswer.user_id == uid).delete(synchronize_session=False)
    db.query(models.Interview).filter(models.Interview.user_id == uid).delete(synchronize_session=False)
    db.query(models.Activity).filter(models.Activity.user_id == uid).delete(synchronize_session=False)
    db.query(models.Notification).filter(models.Notification.user_id == uid).delete(synchronize_session=False)
    db.query(models.WeeklyPerformance).filter(models.WeeklyPerformance.user_id == uid).delete(synchronize_session=False)
    db.query(models.UserSolvedResource).filter(models.UserSolvedResource.user_id == uid).delete(synchronize_session=False)
    db.query(models.UserSolvedChallenge).filter(models.UserSolvedChallenge.user_id == uid).delete(synchronize_session=False)
    db.query(models.EmailVerificationOTP).filter(models.EmailVerificationOTP.user_id == uid).delete(synchronize_session=False)

    db.delete(current_user)
    db.commit()
    return {"success": True, "message": "Your account and associated data have been permanently removed."}