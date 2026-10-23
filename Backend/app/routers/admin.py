from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_admin, is_master_admin_email

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.get("/users/{user_id}", response_model=schemas.AdminUserDetails)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    completed_filter = (
        models.Interview.user_id == user.id,
        models.Interview.status == "Completed",
    )
    completed_interviews = db.query(models.Interview).filter(*completed_filter).count()
    scheduled_interviews = db.query(models.Interview).filter(
        models.Interview.user_id == user.id,
        models.Interview.status == "Scheduled",
    ).count()
    average_score = db.query(func.avg(models.Interview.score_num)).filter(
        *completed_filter, models.Interview.score_num.isnot(None)
    ).scalar()
    best_score = db.query(func.max(models.Interview.score_num)).filter(
        *completed_filter, models.Interview.score_num.isnot(None)
    ).scalar()
    practice_minutes = db.query(func.sum(models.Interview.duration_minutes)).filter(
        *completed_filter
    ).scalar() or 0

    recent = db.query(models.Interview).filter(
        models.Interview.user_id == user.id
    ).order_by(models.Interview.created_at.desc()).limit(5).all()

    return {
        **schemas.UserOut.model_validate(user).model_dump(),
        "completed_interviews": completed_interviews,
        "scheduled_interviews": scheduled_interviews,
        "average_interview_score": round(average_score) if average_score is not None else None,
        "best_interview_score": round(best_score) if best_score is not None else None,
        "practice_minutes": practice_minutes,
        "solved_resources": db.query(models.UserSolvedResource).filter(models.UserSolvedResource.user_id == user.id).count(),
        "solved_challenges": db.query(models.UserSolvedChallenge).filter(models.UserSolvedChallenge.user_id == user.id).count(),
        "unread_notifications": db.query(models.Notification).filter(
            models.Notification.user_id == user.id, models.Notification.is_read.is_(False)
        ).count(),
        "recent_interviews": recent,
    }


@router.patch("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    payload: schemas.UserUpdateByAdmin,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    """Admin-only: promote/demote administrators, enable/disable accounts, or update progress."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    is_target_master = is_master_admin_email(user.email)

    # 1. Master administrator account protections
    if is_target_master:
        if payload.is_admin is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The master administrator account cannot be demoted.",
            )
        if payload.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The master administrator account cannot be disabled.",
            )

    # 2. Prevent self-promotion, self-demotion, and self-disabling
    if user.id == admin.id:
        if payload.is_admin is not None and payload.is_admin != user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot modify your own administrator privileges.",
            )
        if payload.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot disable your own account.",
            )

    # 3. Handle redundant/already-in-state requests gracefully
    if payload.is_admin is not None:
        if payload.is_admin is True and user.is_admin is True:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This user is already an administrator.",
            )
        if payload.is_admin is False and not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This user is not an administrator.",
            )

    # 4. Prevent demoting or disabling the last remaining active administrator
    if payload.is_admin is False and user.is_admin:
        other_active_admins = db.query(models.User).filter(
            models.User.id != user.id,
            models.User.is_admin.is_(True),
            models.User.is_active.is_(True),
        ).count()
        if other_active_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the last remaining active administrator.",
            )

    if payload.is_active is False and user.is_admin:
        other_active_admins = db.query(models.User).filter(
            models.User.id != user.id,
            models.User.is_admin.is_(True),
            models.User.is_active.is_(True),
        ).count()
        if other_active_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disable the last remaining active administrator.",
            )

    # 5. Apply permitted updates
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    # Invariant: Master admin is always active and admin
    if is_target_master:
        user.is_admin = True
        user.is_active = True

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_master_admin_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The master administrator account cannot be deleted.",
        )

    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    if user.is_admin:
        other_active_admins = db.query(models.User).filter(
            models.User.id != user.id,
            models.User.is_admin.is_(True),
            models.User.is_active.is_(True),
        ).count()
        if other_active_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last remaining active administrator.",
            )

    db.delete(user)
    db.commit()
    return None


@router.get("/metrics")
def get_admin_metrics(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    """Aggregates platform-wide real database statistics for administrator analytics."""
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active.is_(True)).count()
    admin_count = db.query(models.User).filter(models.User.is_admin.is_(True)).count()

    total_interviews = db.query(models.Interview).count()
    completed_interviews = db.query(models.Interview).filter(models.Interview.status == "Completed").count()
    scheduled_interviews = db.query(models.Interview).filter(models.Interview.status == "Scheduled").count()
    failed_interviews = db.query(models.Interview).filter(models.Interview.status.in_(["Failed", "Terminated"])).count()

    avg_score_res = db.query(func.avg(models.Interview.score_num)).filter(
        models.Interview.status == "Completed",
        models.Interview.score_num.isnot(None),
    ).scalar()

    total_practice_minutes = db.query(func.sum(models.Interview.duration_minutes)).filter(
        models.Interview.status == "Completed"
    ).scalar() or 0

    total_solved_resources = db.query(models.UserSolvedResource).count()
    total_solved_challenges = db.query(models.UserSolvedChallenge).count()

    return {
        "success": True,
        "total_users": total_users,
        "active_users": active_users,
        "admin_count": admin_count,
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "scheduled_interviews": scheduled_interviews,
        "failed_interviews": failed_interviews,
        "average_score": round(avg_score_res) if avg_score_res is not None else 0,
        "practice_hours": round(total_practice_minutes / 60, 1),
        "total_solved_resources": total_solved_resources,
        "total_solved_challenges": total_solved_challenges,
        "system_health": {
            "status": "Operational",
            "database": "SQLite / Connected",
            "ai_engine": "Active",
            "checked_at": datetime.utcnow().isoformat(),
        }
    }


@router.get("/interviews")
def list_admin_interviews(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    """Admin-only: list all candidate interviews across the system with user metadata."""
    query = (
        db.query(
            models.Interview,
            models.User.name.label("candidate_name"),
            models.User.email.label("candidate_email"),
        )
        .outerjoin(models.User, models.Interview.user_id == models.User.id)
    )
    if status and status.lower() != "all":
        query = query.filter(models.Interview.status == status)

    total = query.count()
    results = query.order_by(models.Interview.id.desc()).offset(offset).limit(limit).all()

    interviews = []
    for interview, cand_name, cand_email in results:
        interviews.append({
            "id": interview.id,
            "user_id": interview.user_id,
            "candidate_name": cand_name or "Anonymous",
            "candidate_email": cand_email or "N/A",
            "company": interview.company,
            "role": interview.role,
            "status": interview.status or "Completed",
            "score": interview.score,
            "score_num": interview.score_num,
            "technical_score": interview.technical_score,
            "communication_score": interview.communication_score,
            "problem_solving_score": interview.problem_solving_score,
            "duration_minutes": interview.duration_minutes or 45,
            "date": interview.date or (interview.created_at.strftime("%d %b %Y") if interview.created_at else "N/A"),
            "feedback": interview.feedback,
        })

    return {
        "success": True,
        "total": total,
        "interviews": interviews,
    }

