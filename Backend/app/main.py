import os
from contextlib import asynccontextmanager
from app.config import reload_env
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.routers import (
    admin,
    auth,
    dashboard,
    resources,
    users,
    ai,
    challenges,
    companies,
    interviews,
    coding_interview,
    leaderboard_jobs,
    payments,
    feedback,
    coach,
    resume,
)
from app.seed import seed_db

# Creates any tables that don't exist yet
Base.metadata.create_all(bind=engine)

def ensure_db_columns():
    """Idempotently adds missing columns to existing SQLite/Postgres tables."""
    from sqlalchemy import text, inspect
    try:
        insp = inspect(engine)
        user_cols = {c["name"] for c in insp.get_columns("users")}
        interview_cols = {c["name"] for c in insp.get_columns("interviews")}
    except Exception:
        user_cols, interview_cols = set(), set()

    with engine.connect() as conn:
        for col, col_type in [
            ("technical_score", "INTEGER"),
            ("communication_score", "INTEGER"),
            ("problem_solving_score", "INTEGER"),
            ("grade", "VARCHAR(50)"),
            ("report_data", "TEXT"),
            ("warning_count", "INTEGER DEFAULT 0"),
            ("termination_reason", "VARCHAR(255)"),
            ("proctoring_data", "TEXT"),
            ("candidate_answers", "TEXT"),
            ("question_count", "INTEGER DEFAULT 0"),
            ("answered_count", "INTEGER DEFAULT 0"),
            ("skipped_count", "INTEGER DEFAULT 0"),
            ("correct_count", "INTEGER DEFAULT 0"),
            ("partial_count", "INTEGER DEFAULT 0"),
            ("incorrect_count", "INTEGER DEFAULT 0"),
            ("started_at", "TIMESTAMP"),
            ("ended_at", "TIMESTAMP"),
            ("duration_seconds", "INTEGER"),
        ]:
            if col not in interview_cols:
                try:
                    conn.execute(text(f"ALTER TABLE interviews ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    conn.rollback()

        for col, col_type in [
            ("google_id", "VARCHAR(120)"),
            ("github_id", "VARCHAR(120)"),
            ("auth_provider", "VARCHAR(50) DEFAULT 'local'"),
            ("is_admin", "BOOLEAN DEFAULT FALSE"),
            ("progress", "INTEGER DEFAULT 0"),
            ("xp", "INTEGER DEFAULT 1250"),
            ("target_role", "VARCHAR(120) DEFAULT 'Software Engineer'"),
            ("bio", "VARCHAR(500) DEFAULT 'Passionate software engineer practicing for top tech interviews.'"),
            ("skills", "VARCHAR(500) DEFAULT 'React, Node.js, Python, System Design, SQL'"),
            ("avatar", "VARCHAR(500)"),
            ("is_active", "BOOLEAN DEFAULT TRUE"),
            ("subscription_plan", "VARCHAR(50) DEFAULT 'free'"),
            ("subscription_cycle", "VARCHAR(20) DEFAULT 'monthly'"),
            ("subscription_expires_at", "TIMESTAMP"),
            ("last_login_at", "TIMESTAMP"),
            ("last_active_at", "TIMESTAMP"),
            ("last_login_ip", "VARCHAR(100)"),
            ("last_login_user_agent", "VARCHAR(500)"),
            ("is_blocked", "BOOLEAN DEFAULT FALSE"),
            ("block_reason", "VARCHAR(500)"),
        ]:
            if col not in user_cols:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    conn.rollback()


def normalize_admin_privileges():
    """Ensures that the master admin account (if it exists) has is_admin=True and is_active=True.
    Preserves all other admin accounts so administrators can collaborate and test.
    """
    from app.database import SessionLocal
    from app.dependencies import MASTER_ADMIN_EMAIL, is_master_admin_email
    import logging

    log = logging.getLogger(__name__)
    db = SessionLocal()
    try:
        # If the master admin account exists, ensure is_admin=True and is_active=True
        all_users = db.query(models.User).all()
        for user in all_users:
            if is_master_admin_email(user.email) and (not user.is_admin or not user.is_active):
                user.is_admin = True
                user.is_active = True
                log.info("Ensured master admin active status: %s", user.email)

        db.commit()
    except Exception as exc:
        db.rollback()
        log.warning("Could not normalize admin privileges during startup: %s", exc)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all columns exist, seed default mock data if empty, and normalize admin role
    ensure_db_columns()
    seed_db()
    normalize_admin_privileges()
    yield


app = FastAPI(
    title="Intervista AI API",
    description="Full Backend API for Intervista AI Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# Robust CORS configuration for development, testing, and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(dashboard.router)
app.include_router(resources.router)
app.include_router(ai.router)
app.include_router(challenges.router)
app.include_router(companies.router)
app.include_router(interviews.router)
app.include_router(coding_interview.router)
app.include_router(leaderboard_jobs.router)
app.include_router(payments.router)
app.include_router(feedback.router)
app.include_router(coach.router)
app.include_router(resume.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Intervista AI Backend",
        "status": "online",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }