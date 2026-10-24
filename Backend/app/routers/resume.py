"""
Resume ATS Calculator Router for Intervista AI.
Provides secure server-side file parsing (PDF and DOCX), ATS calculation with Groq AI and deterministic rubric,
and historical analysis retrieval.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user_optional, get_current_user
from app.services.resume_parser import parse_resume_file
from app.services.ats_service import calculate_comprehensive_ats_analysis

router = APIRouter(prefix="/api/resume", tags=["Resume ATS Calculator"])


class ATSCalculateRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Extracted resume text")
    job_description: Optional[str] = Field(None, description="Optional target job description")
    target_role: Optional[str] = Field("Software Engineer", description="Target job role")
    file_name: Optional[str] = Field("Uploaded_Resume.pdf", description="Original filename")


@router.post("/parse-file")
async def parse_uploaded_resume_file(
    file: UploadFile = File(...),
):
    """
    Securely receives a PDF or DOCX file, extracts readable text in-memory without saving raw documents to disk,
    and returns parsed metadata and text content.
    Handles scanned PDFs, password-protected files, and corrupted files gracefully.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename must not be empty.",
        )

    try:
        raw_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    result = parse_resume_file(raw_bytes, file.filename)

    if not result.get("success"):
        return {
            "success": False,
            "error": result.get("error", "Unable to parse resume."),
            "is_scanned": result.get("is_scanned", False),
            "is_encrypted": result.get("is_encrypted", False),
            "is_corrupted": result.get("is_corrupted", False),
            "page_count": result.get("page_count", 0),
            "word_count": result.get("word_count", 0),
        }

    return result


@router.post("/ats-calculate")
def calculate_ats_score(
    payload: ATSCalculateRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Calculates comprehensive ATS score and diagnostics.
    If job_description is provided, performs deep job-specific alignment analysis.
    If omitted, performs general resume quality & competitive ATS readiness analysis.
    Optionally records result for authenticated user.
    """
    clean_resume_text = payload.resume_text.strip()
    if len(clean_resume_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text must contain at least 20 readable characters.",
        )

    clean_jd = payload.job_description.strip() if payload.job_description and payload.job_description.strip() else None

    # Run ATS Engine (Deterministic rubric + Groq LLM semantic enhancement)
    report = calculate_comprehensive_ats_analysis(
        resume_text=clean_resume_text,
        job_description=clean_jd,
        target_role=payload.target_role or "Software Engineer",
        file_name=payload.file_name or "Resume.pdf",
    )

    # Persist record if user is logged in
    if current_user:
        try:
            record = models.ResumeAnalysisRecord(
                user_id=current_user.id,
                target_role=report.get("target_role", payload.target_role or "Software Engineer"),
                ats_score=int(report.get("overall_score", 0)),
                verdict=report.get("verdict", "Evaluated"),
                matched_skills=",".join(report.get("keywords", {}).get("matched", [])[:20]),
                missing_skills=",".join(report.get("keywords", {}).get("missing", [])[:20]),
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            report["record_id"] = record.id
        except Exception as e:
            db.rollback()
            # Non-blocking: analysis succeeded even if history save failed
            print(f"[Resume Router] Could not save history record: {e}")

    return report


@router.post("/analyze-upload")
async def upload_and_calculate_ats(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form("Software Engineer"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    All-in-one multipart upload endpoint:
    Parses file in memory and immediately calculates the comprehensive ATS score.
    """
    raw_bytes = await file.read()
    parse_result = parse_resume_file(raw_bytes, file.filename or "resume.pdf")

    if not parse_result.get("success"):
        return {
            "success": False,
            "error": parse_result.get("error", "Unable to extract readable text from document."),
            "is_scanned": parse_result.get("is_scanned", False),
            "is_encrypted": parse_result.get("is_encrypted", False),
            "is_corrupted": parse_result.get("is_corrupted", False),
        }

    clean_jd = job_description.strip() if job_description and job_description.strip() else None

    report = calculate_comprehensive_ats_analysis(
        resume_text=parse_result["text"],
        job_description=clean_jd,
        target_role=target_role or "Software Engineer",
        file_name=file.filename or "Uploaded_Resume.pdf",
    )
    report["page_count"] = parse_result.get("page_count", 1)
    report["word_count"] = parse_result.get("word_count", 0)

    if current_user:
        try:
            record = models.ResumeAnalysisRecord(
                user_id=current_user.id,
                target_role=report.get("target_role", target_role or "Software Engineer"),
                ats_score=int(report.get("overall_score", 0)),
                verdict=report.get("verdict", "Evaluated"),
                matched_skills=",".join(report.get("keywords", {}).get("matched", [])[:20]),
                missing_skills=",".join(report.get("keywords", {}).get("missing", [])[:20]),
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            report["record_id"] = record.id
        except Exception as e:
            db.rollback()
            print(f"[Resume Router] Could not save history record: {e}")

    return {
        "success": True,
        "report": report,
    }


@router.get("/ats-history")
def get_user_ats_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves history of past ATS scans performed by the authenticated user.
    """
    records = (
        db.query(models.ResumeAnalysisRecord)
        .filter(models.ResumeAnalysisRecord.user_id == current_user.id)
        .order_by(models.ResumeAnalysisRecord.created_at.desc())
        .limit(20)
        .all()
    )

    items = []
    for r in records:
        items.append({
            "id": r.id,
            "target_role": r.target_role,
            "ats_score": r.ats_score,
            "verdict": r.verdict,
            "matched_skills": [s.strip() for s in (r.matched_skills or "").split(",") if s.strip()],
            "missing_skills": [s.strip() for s in (r.missing_skills or "").split(",") if s.strip()],
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })

    return {"success": True, "history": items}
