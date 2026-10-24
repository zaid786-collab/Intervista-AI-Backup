"""
Intervista AI - Coding Round API Router
Provides end-to-end endpoints for:
- Session start with dynamic question generation
- Sandboxed code execution against sample test cases
- Sandboxed evaluation against hidden test cases
- AI hint generation
- Progressive next-question navigation
- AI submission evaluation & final scorecard persistence
"""

import os
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user_optional, get_current_user
from app.services.code_executor import run_code_against_test_suite
from app.services.coding_service import (
    get_coding_question,
    generate_coding_hint,
    evaluate_coding_submission,
    generate_final_coding_report,
)

router = APIRouter(prefix="/api/coding-interview", tags=["AI Coding Interview Round"])

# Authoritative In-Memory Coding Session Registry
ACTIVE_CODING_SESSIONS: Dict[str, Dict[str, Any]] = {}


# =====================================================================
# PYDANTIC REQUEST & RESPONSE SCHEMAS
# =====================================================================

class StartCodingSessionRequest(BaseModel):
    company: str = "Google"
    role: str = "Software Engineer"
    language: str = "python"
    difficulty: str = "Medium"
    experience: str = "Mid Level"
    duration_minutes: int = 30
    total_questions: int = 3
    topic: Optional[str] = "Data Structures & Algorithms"
    interviewer_persona: str = "chen"


class RunCodingCodeRequest(BaseModel):
    session_id: str
    question_id: str
    code: str
    language: str = "python"
    test_cases: Optional[List[Dict[str, Any]]] = None


class SubmitCodingSolutionRequest(BaseModel):
    session_id: str
    question_id: str
    code: str
    language: str = "python"
    time_spent_seconds: Optional[int] = 0


class CodingHintRequest(BaseModel):
    session_id: str
    question_id: str
    code: str
    language: str = "python"
    hint_index: Optional[int] = 1


class NextCodingQuestionRequest(BaseModel):
    session_id: str


class FinishCodingSessionRequest(BaseModel):
    session_id: str
    proctoring_data: Optional[Dict[str, Any]] = None
    vision_data: Optional[Dict[str, Any]] = None


# =====================================================================
# ENDPOINTS
# =====================================================================

@router.post("/start")
def start_coding_interview(
    payload: StartCodingSessionRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Initializes a dedicated AI Coding Interview Session.
    Generates the first programming question tailored to language & difficulty,
    prepares starter templates, and announces the coding round start.
    """
    session_id = f"coding_{payload.company.lower()}_{int(time.time())}"
    
    # Generate all coding questions for the session up-front
    all_raw_questions = []
    all_client_questions = []
    total_q = max(1, min(payload.total_questions or 3, 5))
    for q_idx in range(total_q):
        raw_q = get_coding_question(
            language=payload.language.lower(),
            difficulty=payload.difficulty,
            role=payload.role,
            experience=payload.experience,
            topic=payload.topic or "Data Structures & Algorithms",
            company=payload.company,
            question_index=q_idx,
        )
        all_raw_questions.append(raw_q)
        cq = dict(raw_q)
        cq.pop("hidden_test_cases", None)
        cq["id"] = q_idx + 1
        all_client_questions.append(cq)

    first_question = all_raw_questions[0]
    client_question = all_client_questions[0]

    # Announce coding round introduction
    persona_title = "Hiring Manager" if payload.interviewer_persona == "chen" else "VP of Engineering"
    persona_name = "Mr. J. Chen" if payload.interviewer_persona == "chen" else "Sophia Sterling"

    announcement = (
        f"Now we will begin the coding round. Read the problem carefully and solve it in the coding editor. "
        f"I'm {persona_name}, {persona_title} at {payload.company}. "
        f"You will have approximately {payload.duration_minutes} minutes to develop and test your solution. "
        f"Please explain your algorithmic approach as you code. Let's begin with your first coding question: '{first_question.get('title')}'."
    )

    # Register in authoritative memory
    ACTIVE_CODING_SESSIONS[session_id] = {
        "session_id": session_id,
        "user_id": current_user.id if current_user else None,
        "company": payload.company,
        "role": payload.role,
        "language": payload.language.lower(),
        "difficulty": payload.difficulty,
        "experience": payload.experience,
        "duration_minutes": payload.duration_minutes,
        "total_questions": total_q,
        "topic": payload.topic,
        "interviewer_persona": payload.interviewer_persona,
        "current_index": 0,
        "questions": all_raw_questions,
        "submissions": [],
        "attempts": {},
        "created_at": time.time(),
        "status": "IN_PROGRESS",
    }

    # Create interview record in database if user is logged in
    interview_db_id = None
    try:
        new_interview = models.Interview(
            user_id=current_user.id if current_user else None,
            role=payload.role,
            company=payload.company,
            duration_minutes=payload.duration_minutes,
            status="In Progress",
            date=datetime.now(timezone.utc).strftime("%d %b %Y"),
            time=datetime.now(timezone.utc).strftime("%I:%M %p"),
            mode="Online Coding",
            feedback="AI Coding Interview initiated.",
            started_at=datetime.now(timezone.utc),
            question_count=payload.total_questions,
        )
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        interview_db_id = new_interview.id
        ACTIVE_CODING_SESSIONS[session_id]["interview_db_id"] = interview_db_id
    except Exception as e:
        db.rollback()
        print(f"[CodingRouter] Database initial commit warning: {e}")

    return {
        "sessionId": session_id,
        "session_id": session_id,
        "interviewId": interview_db_id,
        "interviewerAnnouncement": announcement,
        "welcomeMessage": announcement,
        "message": announcement,
        "company": payload.company,
        "role": payload.role,
        "language": payload.language,
        "difficulty": payload.difficulty,
        "questionIndex": 1,
        "totalQuestions": payload.total_questions,
        "currentQuestion": client_question,
        "questions": all_client_questions,
        "status": "ACTIVE",
    }


@router.post("/run-code")
def run_coding_code(
    payload: RunCodingCodeRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Executes candidate code in an isolated sandbox against sample test cases.
    Returns actual stdout, stderr, runtimes, and passing status.
    NEVER runs against hidden test cases.
    """
    session = ACTIVE_CODING_SESSIONS.get(payload.session_id)
    test_cases_to_run = payload.test_cases

    if not test_cases_to_run and session:
        # Fetch from session current question
        curr_q = session["questions"][session["current_index"]]
        test_cases_to_run = curr_q.get("sample_test_cases", [])

    if not test_cases_to_run:
        test_cases_to_run = [
            {"id": 1, "name": "Sample Test 1", "input": "", "expected": "", "isHidden": False}
        ]

    # Execute against local sandbox
    execution_result = run_code_against_test_suite(
        code=payload.code,
        language=payload.language,
        test_cases=test_cases_to_run,
        include_hidden=False,
    )

    return {
        "success": execution_result.get("all_passed", False),
        "verdict": execution_result.get("verdict", "Execution Complete"),
        "passedCount": execution_result.get("passed_count", 0),
        "totalCount": execution_result.get("total_count", 0),
        "executionTimeMs": execution_result.get("execution_time_ms", 0),
        "results": execution_result.get("results", []),
        "logs": execution_result.get("logs", []),
        "stdout": execution_result.get("stdout", ""),
        "stderr": execution_result.get("stderr", ""),
        "terminal_output": execution_result.get("terminal_output", ""),
    }


@router.post("/submit")
def submit_coding_solution(
    payload: SubmitCodingSolutionRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Evaluates candidate's solution against the complete test suite (sample + hidden).
    Computes server-side verdict, invokes AI evaluation for algorithmic complexity
    and code quality, updates database records, and returns structured feedback.
    """
    session = ACTIVE_CODING_SESSIONS.get(payload.session_id)
    if not session:
        # Fallback question lookup
        q_obj = get_coding_question(
            language=payload.language,
            difficulty="Medium",
            question_index=0,
        )
    else:
        q_obj = session["questions"][session["current_index"]]

    sample_tests = q_obj.get("sample_test_cases", [])
    hidden_tests = q_obj.get("hidden_test_cases", [])
    full_suite = sample_tests + hidden_tests

    # 1. Execute actual sandbox test suite
    exec_result = run_code_against_test_suite(
        code=payload.code,
        language=payload.language,
        test_cases=full_suite,
        include_hidden=True,
    )

    # 2. Run AI evaluation
    persona = session.get("interviewer_persona", "chen") if session else "chen"
    ai_evaluation = evaluate_coding_submission(
        problem=q_obj,
        candidate_code=payload.code,
        language=payload.language,
        execution_result=exec_result,
        interviewer_persona=persona,
    )

    # 3. Record in session
    submission_record = {
        "question_id": q_obj.get("id"),
        "question_title": q_obj.get("title"),
        "code": payload.code,
        "language": payload.language,
        "verdict": ai_evaluation["verdict"],
        "score": ai_evaluation["score"],
        "passed_count": ai_evaluation["passed_count"],
        "total_count": ai_evaluation["total_count"],
        "all_passed": ai_evaluation["all_passed"],
        "execution_time_ms": ai_evaluation["execution_time_ms"],
        "time_complexity": ai_evaluation["time_complexity"],
        "space_complexity": ai_evaluation["space_complexity"],
        "complexity_feedback": ai_evaluation["complexity_feedback"],
        "strengths": ai_evaluation["strengths"],
        "improvements": ai_evaluation["improvements"],
        "interviewer_message": ai_evaluation["interviewer_message"],
        "submitted_at": time.time(),
    }

    if session:
        session["submissions"].append(submission_record)

    # 4. Update Database Interview Record
    if session and session.get("interview_db_id"):
        try:
            intv_rec = db.query(models.Interview).filter(models.Interview.id == session["interview_db_id"]).first()
            if intv_rec:
                intv_rec.candidate_answers = json.dumps(session["submissions"])
                intv_rec.answered_count = len(session["submissions"])
                if ai_evaluation["all_passed"]:
                    intv_rec.correct_count = (intv_rec.correct_count or 0) + 1
                else:
                    intv_rec.incorrect_count = (intv_rec.incorrect_count or 0) + 1
                db.commit()
        except Exception as e:
            db.rollback()
            print(f"[CodingRouter] DB submit update error: {e}")

    return {
        "success": True,
        "verdict": ai_evaluation["verdict"],
        "score": ai_evaluation["score"],
        "passedCount": ai_evaluation["passed_count"],
        "totalCount": ai_evaluation["total_count"],
        "allPassed": ai_evaluation["all_passed"],
        "executionTimeMs": ai_evaluation["execution_time_ms"],
        "timeComplexity": ai_evaluation["time_complexity"],
        "spaceComplexity": ai_evaluation["space_complexity"],
        "complexityFeedback": ai_evaluation["complexity_feedback"],
        "strengths": ai_evaluation["strengths"],
        "improvements": ai_evaluation["improvements"],
        "interviewerMessage": ai_evaluation["interviewer_message"],
        "testCaseResults": ai_evaluation["test_case_results"],
    }


@router.post("/hint")
def get_coding_hint(
    payload: CodingHintRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Generates an intelligent interviewer nudge without revealing the full solution code.
    """
    session = ACTIVE_CODING_SESSIONS.get(payload.session_id)
    q_obj = session["questions"][session["current_index"]] if session else get_coding_question()

    hint_text = generate_coding_hint(
        problem=q_obj,
        candidate_code=payload.code,
        language=payload.language,
        hint_index=payload.hint_index or 1,
    )

    return {
        "hint": hint_text,
        "hintIndex": payload.hint_index or 1,
        "interviewerMessage": f"Here is a hint for you: {hint_text}",
    }


@router.post("/next-question")
def get_next_coding_question(
    payload: NextCodingQuestionRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Retrieves or generates the next coding problem for the candidate.
    Enforces the session's question count limit.
    """
    session = ACTIVE_CODING_SESSIONS.get(payload.session_id)
    if not session:
        session = {
            "session_id": payload.session_id,
            "company": "Google",
            "role": "Software Engineer",
            "language": "javascript",
            "difficulty": "Medium",
            "experience": "Mid-level",
            "topic": "Algorithms",
            "total_questions": 3,
            "current_index": 0,
            "questions": [],
            "answers": {},
        }
        ACTIVE_CODING_SESSIONS[payload.session_id] = session

    next_idx = session["current_index"] + 1
    if next_idx >= session["total_questions"]:
        return {
            "hasMore": False,
            "message": "You have completed all coding problems in this session. You can now finalize your interview.",
        }

    session["current_index"] = next_idx

    # Check if question is already generated
    if next_idx < len(session["questions"]):
        next_q = session["questions"][next_idx]
    else:
        next_q = get_coding_question(
            language=session["language"],
            difficulty=session["difficulty"],
            role=session["role"],
            experience=session["experience"],
            topic=session["topic"],
            company=session["company"],
            question_index=next_idx,
        )
        session["questions"].append(next_q)

    # Sanitize for browser (strip hidden tests)
    client_q = dict(next_q)
    client_q.pop("hidden_test_cases", None)

    interviewer_msg = (
        f"Well done on your previous question. Let's move to problem {next_idx + 1} of {session['total_questions']}: "
        f"'{next_q.get('title')}'. Take a moment to read the specifications and constraints before developing your solution."
    )

    return {
        "hasMore": True,
        "questionIndex": next_idx + 1,
        "totalQuestions": session["total_questions"],
        "question": client_q,
        "interviewerMessage": interviewer_msg,
    }


@router.post("/finish")
def finish_coding_session(
    payload: FinishCodingSessionRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Finalizes the coding round, computes the complete report,
    records results to the database and dashboard history, and returns the final scorecard.
    """
    session = ACTIVE_CODING_SESSIONS.get(payload.session_id)
    if not session:
        # Construct fallback summary
        session_data = {
            "session_id": payload.session_id,
            "role": "Software Engineer",
            "company": "Google",
            "difficulty": "Medium",
        }
        submissions = []
    else:
        session_data = session
        submissions = session.get("submissions", [])
        session["status"] = "COMPLETED"

    # Compile authoritative final report
    final_report = generate_final_coding_report(session_data, submissions)

    # Update database record
    db_id = session.get("interview_db_id") if session else None
    if db_id:
        try:
            intv = db.query(models.Interview).filter(models.Interview.id == db_id).first()
            if intv:
                intv.status = "Completed"
                intv.score = f"{final_report['overallScore']}%"
                intv.score_num = final_report["overallScore"]
                intv.technical_score = final_report["scores"]["technicalDepth"]
                intv.problem_solving_score = final_report["scores"]["problemSolving"]
                intv.communication_score = final_report["scores"]["correctness"]
                intv.grade = final_report["grade"]
                intv.feedback = final_report["summary"]
                intv.report_data = json.dumps(final_report)
                intv.ended_at = datetime.now(timezone.utc)
                if intv.started_at:
                    intv.duration_seconds = int((datetime.now(timezone.utc) - intv.started_at).total_seconds())

                # Add user activity & notification
                if intv.user_id:
                    db.add(models.Activity(
                        user_id=intv.user_id,
                        title=f"Completed Coding Round: {intv.company}",
                        company=f"{intv.role} • Score {final_report['overallScore']}%",
                        time="Just now",
                        color="#38bdf8",
                    ))
                    db.add(models.Notification(
                        user_id=intv.user_id,
                        title=f"{intv.company} Coding Round Complete",
                        desc=f"Your coding session was evaluated: {final_report['overallScore']}% ({final_report['grade']}).",
                        color="#38bdf8",
                        time="Just now",
                        is_read=False,
                    ))
                db.commit()
        except Exception as e:
            db.rollback()
            print(f"[CodingRouter] DB finish commit error: {e}")

    return {
        "success": True,
        "report": final_report,
    }


@router.get("/{session_id}/report")
def get_coding_report(
    session_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Retrieves the saved final scorecard for a coding interview session.
    """
    session = ACTIVE_CODING_SESSIONS.get(session_id)
    if session and session.get("interview_db_id"):
        intv = db.query(models.Interview).filter(models.Interview.id == session["interview_db_id"]).first()
        if intv and intv.report_data:
            return json.loads(intv.report_data)

    # Check database directly by session ID in answers
    if session:
        return generate_final_coding_report(session, session.get("submissions", []))

    raise HTTPException(status_code=404, detail="Coding report not found.")
