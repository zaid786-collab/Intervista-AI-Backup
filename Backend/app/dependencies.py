from typing import Optional, cast
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.auth import decode_access_token
from app.database import get_db

import os

MASTER_ADMIN_EMAILS = [
    e.lower().strip()
    for e in os.getenv("MASTER_ADMIN_EMAILS", "zaidkhan24082006@gmail.com,admin@intervista.ai").split(",")
    if e.strip()
]
MASTER_ADMIN_EMAIL = MASTER_ADMIN_EMAILS[0]


def is_master_admin_email(email: Optional[str]) -> bool:
    """Case-insensitive, stripped check against designated master admin emails."""
    if not email:
        return False
    return email.lower().strip() in MASTER_ADMIN_EMAILS


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise unauthorized

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise unauthorized
    if not cast(bool, user.is_active):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    return user


def get_current_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not cast(bool, current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    if credentials is None:
        return None

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        return None

    try:
        user = db.query(models.User).filter(models.User.id == int(user_id)).first()
        if user and cast(bool, user.is_active):
            return user
    except Exception:
        pass
    return None


get_optional_current_user = get_current_user_optional

