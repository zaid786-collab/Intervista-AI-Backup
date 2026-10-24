"""
Intervista AI - Comprehensive Resume ATS Scoring & Analysis Engine
Implements the 100-point transparent scoring methodology, deterministic section & keyword parsing,
and Groq LLM semantic analysis with graceful local fallback.
"""

import os
import re
import json
from typing import Dict, Any, List, Optional


# Comprehensive Technical & Industry Keyword Catalog
TECH_SKILL_TAXONOMY = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "swift", "kotlin", "scala", "sql", "r", "bash", "shell",
    # Frontend
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "svelte", "html", "html5", "css", "css3", "sass", "scss", "tailwind", "tailwindcss", "redux", "zustand", "graphql", "webpack", "vite", "responsive design", "web vitals",
    # Backend & Frameworks
    "node.js", "nodejs", "express", "express.js", "fastapi", "django", "flask", "spring", "spring boot", "asp.net", ".net", "nestjs", "rest api", "restful apis", "grpc", "microservices", "websockets",
    # Databases & Caching
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "elasticsearch", "dynamodb", "cassandra", "firebase", "supabase", "database indexing", "query optimization", "orm", "prisma", "sqlalchemy",
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "google cloud", "gcp", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "github actions", "gitlab ci", "jenkins", "linux", "nginx", "serverless", "lambda",
    # Architecture & Systems
    "system design", "distributed systems", "concurrency", "multithreading", "event-driven architecture", "message queues", "kafka", "rabbitmq", "load balancing", "caching strategies", "microservices architecture",
    # Data & AI
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "llm", "rag", "langchain", "transformers", "vector database",
    # Testing & Tooling
    "unit testing", "integration testing", "jest", "pytest", "cypress", "playwright", "git", "github", "gitlab", "jira", "agile", "scrum", "oop", "data structures", "algorithms"
}

POWER_ACTION_VERBS = [
    "architected", "spearheaded", "engineered", "orchestrated", "optimized", "streamlined",
    "scaled", "pioneered", "implemented", "deployed", "refactored", "automated", "designed",
    "accelerated", "formulated", "revamped", "eliminated", "delivered", "championed", "maximized"
]

WEAK_PASSIVE_VERBS_MAP = {
    "worked on": "Engineered / Spearheaded",
    "helped with": "Collaborated on / Drove",
    "handled": "Managed / Orchestrated",
    "did": "Executed / Formulated",
    "was responsible for": "Owned / Directed",
    "assisted": "Contributed to / Partnered on",
    "took care of": "Maintained / Administered",
    "tried to": "Initiated / Led",
}


def extract_keywords_from_text(text: str) -> List[str]:
    """Extracts recognizable technical and professional skills from text."""
    lower_text = text.lower()
    found = []
    # Match multi-word terms first, then single words
    sorted_taxonomy = sorted(TECH_SKILL_TAXONOMY, key=lambda x: len(x), reverse=True)
    for skill in sorted_taxonomy:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, lower_text):
            found.append(skill)
    return list(dict.fromkeys(found))


def extract_job_keywords(job_description: str) -> List[str]:
    """Extracts mandatory and primary technical competencies from a Job Description."""
    if not job_description or len(job_description.strip()) < 10:
        return []
    extracted = extract_keywords_from_text(job_description)
    # Also capture custom acronyms/terms like 'B2B', 'SaaS', 'API', 'ETL', 'K8s'
    extra_patterns = re.findall(r"\b[A-Z]{2,6}\b", job_description)
    for exp in extra_patterns:
        cleaned = exp.lower()
        if cleaned not in extracted and len(cleaned) >= 3 and cleaned not in ("the", "and", "for", "with", "from"):
            extracted.append(cleaned)
    return list(dict.fromkeys(extracted))


def analyze_resume_sections(text: str) -> Dict[str, Any]:
    """Analyzes the presence, structure, and quality of standard resume sections."""
    lower = text.lower()

    # 1. Contact Information Analysis
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", text)
    has_links = bool(re.search(r"(linkedin\.com|github\.com|portfolio|http[s]?://)", lower))

    contact_present = bool(email_match or phone_match)
    contact_details = []
    if email_match:
        contact_details.append(f"Email detected ({email_match.group(0)})")
    if phone_match:
        contact_details.append("Phone number detected")
    if has_links:
        contact_details.append("Professional profile / portfolio link detected")

    # 2. Section Headings Check
    has_summary = bool(re.search(r"\b(professional summary|summary|about me|executive summary|profile)\b", lower))
    has_experience = bool(re.search(r"\b(experience|work experience|employment history|professional experience|internships)\b", lower))
    has_education = bool(re.search(r"\b(education|academic background|degrees|university|college|bachelor|master|phd|b\.tech|m\.tech|b\.s|m\.s)\b", lower))
    has_skills = bool(re.search(r"\b(technical skills|skills|technologies|core competencies|tools & technologies)\b", lower))
    has_projects = bool(re.search(r"\b(projects|personal projects|technical projects|academic projects|key projects)\b", lower))
    has_certifications = bool(re.search(r"\b(certifications|certificates|licenses|accreditations|certified)\b", lower))
    has_achievements = bool(re.search(r"\b(achievements|awards|honors|publications|extracurricular)\b", lower))

    return {
        "contact_info": {
            "present": contact_present,
            "rating": "Complete" if (email_match and phone_match and has_links) else ("Adequate" if contact_present else "Missing"),
            "details": ", ".join(contact_details) if contact_details else "No direct email or contact phone number detected.",
            "has_email": bool(email_match),
            "has_phone": bool(phone_match),
            "has_links": has_links,
        },
        "professional_summary": {
            "present": has_summary,
            "rating": "Detected" if has_summary else "Missing",
            "details": "Professional summary or objective statement detected." if has_summary else "No clear summary section found. A 2-3 line executive summary improves recruiter scanning.",
        },
        "work_experience": {
            "present": has_experience,
            "rating": "Strong" if has_experience else "Missing / Incomplete",
            "details": "Professional work history or internship section detected." if has_experience else "No distinct Work Experience section detected.",
        },
        "education": {
            "present": has_education,
            "rating": "Detected" if has_education else "Missing",
            "details": "Academic credentials, degree, or university history detected." if has_education else "No explicit education credentials found.",
        },
        "skills": {
            "present": has_skills,
            "rating": "Dedicated Section" if has_skills else "Inline Only",
            "details": "Dedicated Skills taxonomy detected." if has_skills else "Skills are mentioned inline but lack a dedicated, organized skills section.",
        },
        "projects": {
            "present": has_projects,
            "rating": "Detected" if has_projects else "Optional",
            "details": "Project portfolio section detected." if has_projects else "No dedicated projects section. Valuable for showcasing practical application.",
        },
        "certifications": {
            "present": has_certifications,
            "rating": "Detected" if has_certifications else "Optional",
            "details": "Verified certifications or licenses detected." if has_certifications else "No external industry certifications listed.",
        },
        "achievements": {
            "present": has_achievements,
            "rating": "Detected" if has_achievements else "Optional",
            "details": "Honors or awards detected." if has_achievements else "No dedicated honors or awards section.",
        },
    }


def analyze_formatting_and_readability(text: str) -> Dict[str, Any]:
    """Evaluates readability, word count, metric quantifications, and action verbs."""
    words = text.split()
    word_count = len(words)
    lower = text.lower()

    # Metric quantifications check
    metric_matches = re.findall(r"(\b\d+%\b|\$\d+[\d,]*\b|\b\d+x\b|\b\d+\s*(?:ms|seconds|minutes|hours|users|req/s|rps|million|k)\b)", lower)
    has_metrics = len(metric_matches) > 0
    metric_count = len(metric_matches)

    # Power action verbs check
    power_verbs_found = [v for v in POWER_ACTION_VERBS if re.search(r"\b" + v + r"\b", lower)]
    weak_verbs_found = []
    for weak_p, suggestion in WEAK_PASSIVE_VERBS_MAP.items():
        if weak_p in lower:
            weak_verbs_found.append({"weak_phrase": weak_p, "suggested_alternative": suggestion})

    # Readability status & issues
    issues = []
    if word_count < 250:
        issues.append(f"Resume is very brief ({word_count} words). Recommended length is 400–900 words for comprehensive ATS parsing.")
    elif word_count > 1400:
        issues.append(f"Resume is unusually long ({word_count} words). Consider condensing to 1–2 pages for executive readability.")

    if metric_count < 2:
        issues.append("Low metric quantification: Few concrete numbers or percentage improvements detected in experience bullets.")

    if len(power_verbs_found) < 3:
        issues.append("Low action verb variety: Begin bullet points with strong power verbs like 'Architected', 'Spearheaded', 'Optimized'.")

    return {
        "word_count": word_count,
        "estimated_pages": max(1, round(word_count / 450)),
        "quantified_metrics_count": metric_count,
        "power_verbs_count": len(power_verbs_found),
        "power_verbs_sample": power_verbs_found[:6],
        "weak_verbs_found": weak_verbs_found[:4],
        "readability_status": "Clean & ATS-Optimized" if len(issues) == 0 else "Minor Formatting Optimization Needed",
        "potential_issues": issues,
    }


def compute_deterministic_ats_score(
    resume_text: str,
    job_description: Optional[str] = None,
    target_role: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Computes a transparent, 100-point rubric ATS score deterministically.
    Adheres strictly to the requested weighting system.
    """
    resume_skills = extract_keywords_from_text(resume_text)
    sections = analyze_resume_sections(resume_text)
    formatting = analyze_formatting_and_readability(resume_text)

    is_job_specific = bool(job_description and len(job_description.strip()) >= 20)

    if is_job_specific:
        jd_skills = extract_job_keywords(job_description)
        matched_skills = [s for s in jd_skills if s in resume_skills]
        missing_skills = [s for s in jd_skills if s not in resume_skills]

        # ── 1. Job-related skills and keyword alignment: 35 points ────────────────
        if len(jd_skills) > 0:
            match_ratio = len(matched_skills) / max(len(jd_skills), 1)
            cat_skills_score = round(min(match_ratio * 35, 35))
        else:
            cat_skills_score = min(round((len(resume_skills) / 10) * 35), 35)

        # ── 2. Relevant experience and projects: 25 points ─────────────────────────
        exp_score = 0
        if sections["work_experience"]["present"]:
            exp_score += 15
        if sections["projects"]["present"]:
            exp_score += 5
        # Reward quantified metrics in achievements
        if formatting["quantified_metrics_count"] >= 3:
            exp_score += 5
        elif formatting["quantified_metrics_count"] >= 1:
            exp_score += 3
        cat_experience_score = min(exp_score, 25)

        # ── 3. Required qualifications and education: 15 points ───────────────────
        edu_score = 0
        if sections["education"]["present"]:
            edu_score += 10
        if sections["certifications"]["present"]:
            edu_score += 5
        cat_qualifications_score = min(edu_score, 15)

        # ── 4. Resume structure and section completeness: 15 points ───────────────
        struct_score = 0
        if sections["contact_info"]["present"]:
            struct_score += 5
        if sections["skills"]["present"]:
            struct_score += 5
        if sections["professional_summary"]["present"]:
            struct_score += 5
        cat_structure_score = min(struct_score, 15)

        # ── 5. Formatting and text readability: 10 points ─────────────────────────
        fmt_score = 10
        if formatting["word_count"] < 200 or formatting["word_count"] > 1600:
            fmt_score -= 4
        if len(formatting["weak_verbs_found"]) > 2:
            fmt_score -= 2
        cat_formatting_score = max(fmt_score, 2)

        total_ats_score = cat_skills_score + cat_experience_score + cat_qualifications_score + cat_structure_score + cat_formatting_score
        total_ats_score = max(0, min(total_ats_score, 100))

        breakdown = {
            "skills_keyword_alignment": {
                "score": cat_skills_score,
                "max_score": 35,
                "percentage": round((cat_skills_score / 35) * 100),
                "description": f"Matched {len(matched_skills)} of {len(jd_skills)} target job competencies.",
            },
            "experience_projects": {
                "score": cat_experience_score,
                "max_score": 25,
                "percentage": round((cat_experience_score / 25) * 100),
                "description": "Evaluated work history, projects, and quantified achievement metrics.",
            },
            "qualifications_education": {
                "score": cat_qualifications_score,
                "max_score": 15,
                "percentage": round((cat_qualifications_score / 15) * 100),
                "description": "Validated academic qualifications and verified certifications.",
            },
            "structure_completeness": {
                "score": cat_structure_score,
                "max_score": 15,
                "percentage": round((cat_structure_score / 15) * 100),
                "description": "Assessed standard ATS section headers, contact channels, and layout.",
            },
            "formatting_readability": {
                "score": cat_formatting_score,
                "max_score": 10,
                "percentage": round((cat_formatting_score / 10) * 100),
                "description": f"Verified document word count ({formatting['word_count']} words) and action verbs.",
            },
        }

        scoring_methodology = (
            "Job-Specific ATS Match Rubric (100 Points Total): "
            "Skills & Keyword Alignment (35 pts), Experience & Projects (25 pts), "
            "Qualifications & Education (15 pts), Structure Completeness (15 pts), "
            "Formatting & Readability (10 pts)."
        )

    else:
        # General Resume Quality Scoring
        matched_skills = resume_skills
        missing_skills = []

        cat_skills_score = min(round((len(resume_skills) / 12) * 30), 30)
        
        cat_experience_score = 0
        if sections["work_experience"]["present"]:
            cat_experience_score += 15
        if formatting["quantified_metrics_count"] >= 3:
            cat_experience_score += 10
        elif formatting["quantified_metrics_count"] >= 1:
            cat_experience_score += 5
        cat_experience_score = min(cat_experience_score, 25)

        cat_qualifications_score = 15 if sections["education"]["present"] else 5
        
        struct_score = 0
        if sections["contact_info"]["present"]:
            struct_score += 8
        if sections["skills"]["present"]:
            struct_score += 6
        if sections["professional_summary"]["present"]:
            struct_score += 6
        cat_structure_score = min(struct_score, 20)

        fmt_score = 10
        if formatting["word_count"] < 250:
            fmt_score -= 4
        cat_formatting_score = max(fmt_score, 3)

        total_ats_score = cat_skills_score + cat_experience_score + cat_qualifications_score + cat_structure_score + cat_formatting_score
        total_ats_score = max(0, min(total_ats_score, 100))

        breakdown = {
            "skills_keyword_alignment": {
                "score": cat_skills_score,
                "max_score": 30,
                "percentage": round((cat_skills_score / 30) * 100),
                "description": f"Identified {len(resume_skills)} core technical competencies in candidate profile.",
            },
            "experience_projects": {
                "score": cat_experience_score,
                "max_score": 25,
                "percentage": round((cat_experience_score / 25) * 100),
                "description": "Evaluated experience depth and metric-driven accomplishments.",
            },
            "structure_completeness": {
                "score": cat_structure_score,
                "max_score": 20,
                "percentage": round((cat_structure_score / 20) * 100),
                "description": "Assessed standard section coverage, contact details, and headers.",
            },
            "qualifications_education": {
                "score": cat_qualifications_score,
                "max_score": 15,
                "percentage": round((cat_qualifications_score / 15) * 100),
                "description": "Checked educational degrees and credentials clarity.",
            },
            "formatting_readability": {
                "score": cat_formatting_score,
                "max_score": 10,
                "percentage": round((cat_formatting_score / 10) * 100),
                "description": f"Evaluated length ({formatting['word_count']} words) and power verbs.",
            },
        }

        scoring_methodology = (
            "General Resume Quality Rubric (100 Points Total - No Job Description Provided): "
            "Technical Competencies (30 pts), Experience Impact (25 pts), Structure (20 pts), "
            "Education & Credentials (15 pts), Readability & Formatting (10 pts)."
        )

    # ── Verdict Formulation ───────────────────────────────────────────────────
    if total_ats_score >= 85:
        verdict = "Excellent ATS Optimization • Top Tier Interview Readiness"
    elif total_ats_score >= 70:
        verdict = "Competitive Baseline • Target Optimization Recommended"
    elif total_ats_score >= 50:
        verdict = "Moderate Match • Requires Keyword & Structure Alignment"
    else:
        verdict = "Needs Structural Rework & Skill Quantification"

    # ── Evidence-Based Strengths ──────────────────────────────────────────────
    strengths = []
    if len(matched_skills) >= 5:
        sample = ", ".join(matched_skills[:5])
        strengths.append(f"Strong competency match: High-frequency terms detected ({sample}).")
    if formatting["quantified_metrics_count"] >= 2:
        strengths.append(f"Effective quantifiable impact: {formatting['quantified_metrics_count']} specific metric indicators detected in achievements.")
    if formatting["power_verbs_count"] >= 3:
        sample_v = ", ".join(formatting["power_verbs_sample"][:3])
        strengths.append(f"Engaging power verbs utilized across bullets (e.g. {sample_v}).")
    if sections["contact_info"]["has_links"]:
        strengths.append("Professional profile link (LinkedIn / GitHub) included for recruiter verification.")
    if len(strengths) == 0:
        strengths.append("Clean foundational text structure that parses cleanly without decoding errors.")

    # ── Evidence-Based Weaknesses ─────────────────────────────────────────────
    weaknesses = []
    if is_job_specific and len(missing_skills) > 0:
        missing_preview = ", ".join(missing_skills[:5])
        weaknesses.append(f"Missing core competencies specified in job requirements: {missing_preview}.")
    if formatting["quantified_metrics_count"] < 2:
        weaknesses.append("Lack of quantifiable outcomes: Bullets state activities rather than measurable percentage improvements or business results.")
    if not sections["professional_summary"]["present"]:
        weaknesses.append("Missing Professional Summary: Opening 2-3 sentence overview missing at top of document.")
    if not sections["certifications"]["present"]:
        weaknesses.append("No industry cloud or specialized certifications listed to substantiate skills.")
    if len(formatting["weak_verbs_found"]) > 0:
        weak_sample = formatting["weak_verbs_found"][0]["weak_phrase"]
        weaknesses.append(f"Passive phrasing detected ('{weak_sample}'). Replace with assertive technical verbs.")

    # ── Prioritized Actionable Recommendations ────────────────────────────────
    recommendations = []
    if is_job_specific and len(missing_skills) > 0:
        recommendations.append({
            "priority": "HIGH",
            "title": "Integrate Missing Target Competencies",
            "issue": f"Target job explicitly seeks competencies ({', '.join(missing_skills[:4])}) not explicitly evidenced in your resume text.",
            "impact": "ATS boolean filters and recruiter keyword searches will penalize your ranking if core requirements are omitted.",
            "suggestion": f"Where truthful to your background, naturally weave terms like '{missing_skills[0]}' into your project descriptions and skills section.",
            "evidence": f"Missing from resume: {', '.join(missing_skills[:5])}",
        })

    if formatting["quantified_metrics_count"] < 2:
        recommendations.append({
            "priority": "HIGH",
            "title": "Quantify Achievements with the STAR Formula",
            "issue": "Your bullet points describe tasks and duties rather than measurable results or scale metrics.",
            "impact": "Top tech companies prioritize candidates who demonstrate concrete business impact (speed, revenue, users, latency).",
            "suggestion": "Rewrite key bullets using: [Power Verb] + [What You Built] + [Result / % metric]. Example: 'Optimized PostgreSQL queries, reducing P99 latency by 40% across 500k daily queries.'",
            "evidence": "Few numbers, percentages, or scale metrics detected.",
        })

    if not sections["professional_summary"]["present"]:
        recommendations.append({
            "priority": "MEDIUM",
            "title": "Add a 3-Sentence Professional Summary",
            "issue": "No dedicated executive summary or candidate profile found at the beginning of the resume.",
            "impact": "Recruiters spend ~6 seconds on initial screen; an opening summary anchors your seniority and tech stack immediately.",
            "suggestion": "Add a 3-line summary: '[Target Role] with X years experience in [Tech Stack]. Proven track record in [Core Strength]. Spearheaded [Top Metric Achievement].'",
            "evidence": "Opening jumps directly into experience/education without summary.",
        })

    if len(formatting["weak_verbs_found"]) > 0:
        w = formatting["weak_verbs_found"][0]
        recommendations.append({
            "priority": "LOW",
            "title": "Elevate Passive Phrasing",
            "issue": f"Phrases like '{w['weak_phrase']}' dilute your technical ownership.",
            "impact": "Hiring managers look for leadership verbs demonstrating proactive technical decision-making.",
            "suggestion": f"Replace passive phrasing with active power verbs like '{w['suggested_alternative']}'.",
            "evidence": f"Found phrase: '{w['weak_phrase']}'",
        })

    return {
        "overall_score": total_ats_score,
        "job_match_score": total_ats_score if is_job_specific else None,
        "is_job_specific": is_job_specific,
        "scoring_methodology": scoring_methodology,
        "verdict": verdict,
        "breakdown": breakdown,
        "category_breakdown": breakdown,
        "keywords": {
            "matched": matched_skills,
            "missing": missing_skills,
            "total_matched_count": len(matched_skills),
            "total_missing_count": len(missing_skills),
        },
        "sections": sections,
        "section_analysis": sections,
        "formatting": formatting,
        "formatting_analysis": formatting,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "ai_powered": False,
        "ai_model": "Intervista Deterministic ATS Rubric Engine (100-pt standard)",
    }


def analyze_with_groq_llm(
    resume_text: str,
    job_description: Optional[str] = None,
    target_role: Optional[str] = "Software Engineer",
    api_key: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Leverages Groq's high-speed llama-3.3-70b-versatile model to conduct
    contextual semantic ATS analysis and generate customized, evidence-based recommendations.
    """
    key = api_key or os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
    if not key or len(key.strip()) < 5:
        return None

    is_groq = key.startswith("gsk_") or "groq" in key.lower()
    if is_groq:
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        candidate_models = [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
        ]
    else:
        api_url = "https://api.x.ai/v1/chat/completions"
        candidate_models = ["grok-2-latest", "grok-beta"]

    has_jd = bool(job_description and len(job_description.strip()) >= 20)

    prompt = f"""You are a Principal Talent Acquisition Partner and Technical ATS Architect.
Analyze the candidate's resume text below against the transparent 100-point scoring rubric.

{"TARGET JOB DESCRIPTION:" + chr(10) + job_description if has_jd else "NOTE: No specific job description provided. Perform General Resume Quality Evaluation."}

RESUME TEXT:
{resume_text[:4000]}

SCORING METHODOLOGY (STRICT 100-POINT RUBRIC):
- Skills & Keyword Alignment: 35 pts (30 if no JD)
- Experience & Project Achievements: 25 pts
- Qualifications & Education: 15 pts
- Structure & Section Completeness: 15 pts (20 if no JD)
- Formatting & Readability: 10 pts
Total = 100 Points.

CRITICAL RULES:
1. NEVER fabricate or hallucinate fake degrees, experience, or companies.
2. Ground all recommendations strictly in the actual text provided.
3. Return ONLY a valid JSON object strictly matching this schema (no markdown fences, no explanatory prefix):

{{
  "overall_score": 82,
  "verdict": "Clear 1-sentence verdict on interview readiness",
  "category_breakdown": {{
    "skills_keyword_alignment": {{"score": 28, "max_score": 35, "description": "Specific feedback on skills match"}},
    "experience_projects": {{"score": 21, "max_score": 25, "description": "Specific feedback on experience"}},
    "qualifications_education": {{"score": 14, "max_score": 15, "description": "Specific feedback on education"}},
    "structure_completeness": {{"score": 13, "max_score": 15, "description": "Specific feedback on structure"}},
    "formatting_readability": {{"score": 8, "max_score": 10, "description": "Specific feedback on formatting"}}
  }},
  "matched_keywords": ["skill1", "skill2", "skill3"],
  "missing_keywords": ["missing1", "missing2"],
  "strengths": ["Strength 1 with quote or evidence", "Strength 2 with evidence"],
  "weaknesses": ["Weakness 1 grounded in text", "Weakness 2 grounded in text"],
  "recommendations": [
    {{
      "priority": "HIGH",
      "title": "Clear action title",
      "issue": "What was identified in the text",
      "impact": "Why it affects ATS or recruiter perception",
      "suggestion": "Actionable instructions to improve it",
      "evidence": "Direct excerpt or missing element"
    }}
  ]
}}
"""

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    import requests

    for model_name in candidate_models:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "You are a professional technical ATS parser that outputs strictly valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }

        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=25)
            if response.status_code == 200:
                data = response.json()
                raw_content = data["choices"][0]["message"]["content"].strip()
                if raw_content.startswith("```json"):
                    raw_content = raw_content[7:]
                if raw_content.startswith("```"):
                    raw_content = raw_content[3:]
                if raw_content.endswith("```"):
                    raw_content = raw_content[:-3]
                parsed = json.loads(raw_content.strip())
                parsed["model_used"] = model_name
                return parsed
            elif response.status_code == 404:
                # Try next candidate model
                continue
            else:
                print(f"[ATS Service] Groq API returned status {response.status_code}: {response.text[:150]}")
        except Exception as e:
            print(f"[ATS Service] Groq attempt with {model_name} failed: {e}")

    return None


def calculate_comprehensive_ats_analysis(
    resume_text: str,
    job_description: Optional[str] = None,
    target_role: Optional[str] = "Software Engineer",
    file_name: Optional[str] = "Uploaded_Resume.pdf",
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main ATS Pipeline:
    1. Computes deterministic baseline score and section/formatting checks.
    2. Runs Groq LLM semantic analysis for deep contextual evaluation.
    3. Merges deterministic rubric with AI insights to ensure 100% reliability.
    """
    # 1. Deterministic Baseline
    base_result = compute_deterministic_ats_score(
        resume_text=resume_text,
        job_description=job_description,
        target_role=target_role,
    )

    # 2. Try Groq AI Semantic Enhancement
    groq_result = analyze_with_groq_llm(
        resume_text=resume_text,
        job_description=job_description,
        target_role=target_role,
        api_key=api_key,
    )

    if groq_result and isinstance(groq_result, dict):
        # Merge AI-enhanced insights while preserving strict rubric boundaries
        ai_score = groq_result.get("overall_score")
        if isinstance(ai_score, (int, float)) and 0 <= ai_score <= 100:
            # Authoritative score is weighted 60% deterministic rubric + 40% AI semantic alignment
            blended_score = round(base_result["overall_score"] * 0.6 + int(ai_score) * 0.4)
            base_result["overall_score"] = max(0, min(blended_score, 100))
            if base_result["is_job_specific"]:
                base_result["job_match_score"] = base_result["overall_score"]

        if groq_result.get("verdict"):
            base_result["verdict"] = groq_result["verdict"]

        if groq_result.get("matched_keywords"):
            all_matched = list(dict.fromkeys(base_result["keywords"]["matched"] + groq_result["matched_keywords"]))
            base_result["keywords"]["matched"] = all_matched
            base_result["keywords"]["total_matched_count"] = len(all_matched)

        if groq_result.get("missing_keywords"):
            base_result["keywords"]["missing"] = groq_result["missing_keywords"]
            base_result["keywords"]["total_missing_count"] = len(groq_result["missing_keywords"])

        if groq_result.get("strengths") and len(groq_result["strengths"]) > 0:
            base_result["strengths"] = groq_result["strengths"]

        if groq_result.get("weaknesses") and len(groq_result["weaknesses"]) > 0:
            base_result["weaknesses"] = groq_result["weaknesses"]

        if groq_result.get("recommendations") and len(groq_result["recommendations"]) > 0:
            base_result["recommendations"] = groq_result["recommendations"]

        base_result["ai_powered"] = True
        base_result["ai_model"] = "Groq LLaMA-3.3-70B-Versatile (Semantic ATS Engine)"

    base_result["file_name"] = file_name
    base_result["target_role"] = target_role or "Software Engineer"
    return base_result
