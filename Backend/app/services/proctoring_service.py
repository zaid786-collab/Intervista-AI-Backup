import os
import re
import json
import base64
import requests
from typing import Dict, Any, Optional

# ==============================================================================
# CONFIGURABLE DETECTION & PROCTORING SETTINGS
# ==============================================================================
PROCTORING_CONFIG = {
    # Minimum score from local MediaPipe ObjectDetector to flag candidate object
    "DETECTION_CONFIDENCE_THRESHOLD": float(os.getenv("PHONE_DETECTION_CONFIDENCE_THRESHOLD", "0.35")),
    # Minimum consecutive frames before requesting AI classification
    "MIN_CONSECUTIVE_CONFIRMATIONS": int(os.getenv("PHONE_MIN_CONSECUTIVE_CONFIRMATIONS", "2")),
    # Minimum confidence score from Vision LLM to accept as a confirmed violation
    "MIN_EVIDENCE_CONFIDENCE": float(os.getenv("PHONE_MIN_EVIDENCE_CONFIDENCE", "0.70")),
    # Minimum cooldown seconds between server-side AI Vision calls per session
    "DETECTION_COOLDOWN_SECONDS": float(os.getenv("PHONE_DETECTION_COOLDOWN_SECONDS", "3.5")),
    # Vision API timeout in seconds
    "VISION_API_TIMEOUT": int(os.getenv("PHONE_VISION_API_TIMEOUT", "12")),
    # Termination policy: "immediate" (zero tolerance) or "warning" (accumulate warnings)
    "TERMINATION_POLICY": os.getenv("PHONE_TERMINATION_POLICY", "immediate"),
    # Max warnings permitted before termination when warning policy is enabled
    "MAX_WARNINGS_BEFORE_TERMINATION": int(os.getenv("PHONE_MAX_WARNINGS", "1")),
}

# Supported Vision Models in Order of Preference
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
]


# Standard Structured Classification Prompt as specified
PHONE_PROCTOR_PROMPT = """You are an object-verification system for a supervised interview. Determine whether the visible candidate object is actually a mobile phone or smartphone.

Inspect the visual evidence carefully. A rectangular outline alone is not evidence that an object is a phone.

Distinguish mobile phones from laptops, tablets, calculators, notebooks, books, wallets, ID cards, monitors, and other everyday objects.

Return one of these classifications:
- mobile_phone
- non_phone
- uncertain

Return valid JSON containing:
{
  "classification": "mobile_phone | non_phone | uncertain",
  "confidence": 0.0,
  "visual_evidence": "Brief description of the visible evidence",
  "reason": "Why this classification is appropriate"
}

Only classify an object as mobile_phone when the visual evidence supports that conclusion. If the image is blurry, obscured, too small, or ambiguous, return uncertain. Do not infer that an object is a phone merely because the candidate is holding it."""


def clean_base64_data(raw_b64: str) -> tuple[str, str]:
    """Extracts mime_type and clean base64 payload from data URL or raw string."""
    mime_type = "image/jpeg"
    clean_b64 = raw_b64 or ""
    if "," in clean_b64 and "data:" in clean_b64[:30]:
        header, raw = clean_b64.split(",", 1)
        clean_b64 = raw
        m = re.search(r"data:([^;]+);", header)
        if m:
            mime_type = m.group(1)
    return mime_type, clean_b64


def verify_candidate_object_with_llm(
    image_base64: str,
    full_frame_base64: Optional[str] = None,
    bounding_box: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Classifies a candidate object image using Multimodal Vision LLM (Gemini Vision).
    Implements Stage 2 & Stage 4 of the Mobile Phone Detection Pipeline:
    - Analyzes cropped candidate object + optional full frame context.
    - Classifies as 'mobile_phone', 'non_phone', or 'uncertain'.
    - Returns structured visual evidence and confidence score.
    - Fails safe to 'uncertain' on timeouts, errors, or ambiguity.
    """
    if not image_base64 or len(image_base64) < 100:
        return {
            "verified": False,
            "classification": "uncertain",
            "phone_detected": False,
            "confidence": 0.0,
            "visual_evidence": "No image data or invalid frame received.",
            "reason": "Candidate frame image was missing or corrupted.",
        }

    crop_mime, crop_b64 = clean_base64_data(image_base64)

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not gemini_key or len(gemini_key) < 8:
        print("[PROCTORING_SERVICE] Warning: GEMINI_API_KEY not configured. Bypassing AI verification.")
        return {
            "verified": False,
            "classification": "uncertain",
            "phone_detected": False,
            "confidence": 0.0,
            "visual_evidence": "AI Vision proctoring API key not configured.",
            "reason": "Vision classification model credentials unavailable.",
        }

    # Construct request parts: prompt text, cropped candidate object, and optional full frame context
    content_parts = [
        {"text": PHONE_PROCTOR_PROMPT},
        {
            "inline_data": {
                "mime_type": crop_mime,
                "data": crop_b64,
            }
        },
    ]

    if full_frame_base64 and len(full_frame_base64) > 100:
        frame_mime, frame_b64 = clean_base64_data(full_frame_base64)
        content_parts.append({
            "inline_data": {
                "mime_type": frame_mime,
                "data": frame_b64,
            }
        })

    timeout_sec = PROCTORING_CONFIG["VISION_API_TIMEOUT"]
    min_evidence_conf = PROCTORING_CONFIG["MIN_EVIDENCE_CONFIDENCE"]

    for model in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        payload = {
            "contents": [{"parts": content_parts}],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json",
            },
        }

        try:
            res = requests.post(url, json=payload, timeout=timeout_sec)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        raw_text = parts[0].get("text", "").strip()
                        # Clean markdown wrappers if present
                        if raw_text.startswith("```"):
                            raw_text = re.sub(r"^```(?:json)?", "", raw_text)
                            raw_text = re.sub(r"```$", "", raw_text).strip()

                        result_json = json.loads(raw_text)
                        raw_classification = str(result_json.get("classification", "uncertain")).lower().strip()
                        raw_conf = float(result_json.get("confidence", 0.0))
                        visual_evidence = str(result_json.get("visual_evidence", "Visual analysis complete.")).strip()
                        reason = str(result_json.get("reason", "Observation complete.")).strip()

                        # Validate classification category strictly
                        if raw_classification not in ("mobile_phone", "non_phone", "uncertain"):
                            raw_classification = "uncertain"

                        # Confirmed mobile phone requires:
                        # 1. Classification is strictly 'mobile_phone'
                        # 2. Confidence meets or exceeds configured threshold (default >= 0.75)
                        is_confirmed_phone = False
                        if raw_classification == "mobile_phone":
                            if raw_conf >= min_evidence_conf:
                                is_confirmed_phone = True
                            else:
                                print(f"[PROCTORING_SERVICE] Mobile phone classification demoted to 'uncertain' due to low confidence ({raw_conf} < {min_evidence_conf}): {reason}")
                                raw_classification = "uncertain"

                        print(f"[PROCTORING_SERVICE] AI Vision Verification ({model}): class={raw_classification}, conf={raw_conf}, confirmed={is_confirmed_phone}, reason={reason}")

                        return {
                            "verified": True,
                            "classification": raw_classification,
                            "phone_detected": is_confirmed_phone,
                            "confidence": raw_conf,
                            "visual_evidence": visual_evidence,
                            "reason": reason,
                        }
            else:
                print(f"[PROCTORING_SERVICE] Gemini API error ({model}) status={res.status_code}: {res.text[:150]}")
        except Exception as err:
            print(f"[PROCTORING_SERVICE] Model {model} request failed: {err}")
            continue

    # Fail-safe default: candidate is NEVER terminated on API issues or timeouts
    return {
        "verified": False,
        "classification": "uncertain",
        "phone_detected": False,
        "confidence": 0.0,
        "visual_evidence": "Vision API temporarily unreachable or timed out.",
        "reason": "Classification inconclusive; proctoring fail-safe preserved session integrity.",
    }


# Backwards compatibility alias
def verify_phone_with_llm(image_base64: str) -> Dict[str, Any]:
    return verify_candidate_object_with_llm(image_base64)
