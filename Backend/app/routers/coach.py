"""
Coach & Intelligence Router for Intervista AI Core Features
Exposes endpoints for:
- /api/coach/profile (Weakness Memory & Progression Tracker)
- /api/interviews/dna (Personal Interview Performance Profile & Skill Gap Map)
- /api/resume/reality-check (Resume-to-Interview Reality Check & Project Interrogation)
- /api/career/readiness-map (Job Description to Career Readiness Map & 7-Day Plan)
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user_optional, get_current_user
from app import models, schemas
from app.services.coach_service import (
    analyze_candidate_weaknesses,
    generate_interview_dna,
    perform_resume_reality_check,
    generate_career_readiness_map,
)

router = APIRouter(prefix="/api", tags=["Coach & Core Intelligence"])


@router.get("/coach/profile", response_model=schemas.CoachProfileResponse)
def get_personalized_coach_profile(
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    1. AI That Remembers Your Weaknesses (Personalized Interview Coach)
    Maintains a personalized performance history across sessions, identifies recurring
    mistakes in technical knowledge, communication, problem-solving, and answer structure,
    and visualizes progress across previous and current evaluations.
    """
    profile = analyze_candidate_weaknesses(user=current_user, db=db)
    return schemas.CoachProfileResponse(**profile)


@router.get("/interviews/dna", response_model=schemas.InterviewDNAResponse)
def get_candidate_interview_dna(
    target_role: Optional[str] = "Software Engineer",
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    2. Interview DNA (Personal Interview Performance Profile)
    Dynamic, multi-axis empirical profile of demonstrated interview strengths, recurring
    weaknesses, and developmental areas, including a personalized Skill Gap Map.
    """
    dna = generate_interview_dna(user=current_user, target_role=target_role, db=db)
    return schemas.InterviewDNAResponse(**dna)


@router.post("/resume/reality-check", response_model=schemas.ResumeRealityCheckResponse)
def check_resume_reality(
    payload: schemas.ResumeRealityCheckRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    3. Resume-to-Interview Reality Check
    Transforms uploaded resume text into personalized technical questions interrogating
    project architecture, stack rationale, data flow, auth, challenges, and scalability.
    Diagnoses incomplete understanding and prepares candidates for deep follow-ups.
    """
    if not payload.resume_text or len(payload.resume_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume content must be provided for the Reality Check analysis.",
        )

    res = perform_resume_reality_check(
        resume_text=payload.resume_text,
        target_role=payload.target_role or "Software Engineer",
        target_company=payload.target_company or "Tech Company",
        user=current_user,
        db=db,
    )
    return schemas.ResumeRealityCheckResponse(**res)


@router.post("/career/readiness-map", response_model=schemas.CareerReadinessResponse)
def compute_career_readiness_map(
    payload: schemas.CareerReadinessRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    5. Job Description to Career Readiness Map
    Extracts required technical competencies from a target JD, compares with candidate's
    resume and verified Interview DNA, computes an indicative Interview Readiness Score
    (e.g. 68/100) with supporting evidence, and creates a 7-day preparation roadmap.
    """
    if not payload.job_description or len(payload.job_description.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is required to generate the Career Readiness Map.",
        )

    readiness = generate_career_readiness_map(
        job_description=payload.job_description,
        target_role=payload.target_role or "Software Engineer",
        target_company=payload.target_company or "Target Company",
        resume_text=payload.resume_text or "",
        user=current_user,
        db=db,
    )
    return schemas.CareerReadinessResponse(**readiness)
