import os
import re
import json
import base64
import requests
from typing import Dict, Any, Optional

# Supported Vision Models in Order of Preference
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
]

PHONE_PROCTOR_PROMPT = """You are an expert AI proctor evaluating webcam integrity for an online technical interview.
Your single objective: Determine with absolute certainty whether the candidate is holding or actively using an unauthorized physical mobile phone / smartphone / tablet.

CRITICAL HARD RULES:
1. ACCURACY & CONSERVATISM: Only return phone_detected: true if a physical mobile phone, smartphone, or tablet is unambiguously and clearly visible in candidate's hands or on screen being actively operated or displayed.
2. DO NOT CONFUSE OR GUESS: Do NOT classify any of the following as a phone:
   - Candidate's hands, fingers, gestures, or palms
   - Candidates resting their chin or cheeks on their hands
   - Scratching hair, touching ears, or tilting head to think
   - Headphones, earbuds, headsets, or microphone boom
   - Computer mouse, trackpad, keyboard, or monitor bezels
   - Coffee mugs, drinking cups, water bottles, pens, or pencils
   - Dark clothing, jacket collars, black t-shirts, or shadows
3. If no physical mobile phone is visible, you MUST return phone_detected: false.

Return STRICTLY a JSON object with this exact schema (no markdown, no backticks, no preamble):
{
  "phone_detected": boolean,
  "confidence": float,
  "reason": "Clear, concise observation describing what is seen"
}"""


def verify_phone_with_llm(image_base64: str) -> Dict[str, Any]:
    """
    Analyzes candidate webcam frame using Multimodal LLM (Gemini Vision)
    to strictly confirm or refute presence of a mobile phone.
    Returns:
        {
            "verified": bool,
            "phone_detected": bool,
            "confidence": float,
            "reason": str
        }
    """
    if not image_base64 or len(image_base64) < 100:
        return {
            "verified": False,
            "phone_detected": False,
            "confidence": 0.0,
            "reason": "Invalid or empty image data received",
        }

    # Extract mime type and raw base64 data if formatted as data URL
    mime_type = "image/jpeg"
    clean_b64 = image_base64
    if "," in image_base64 and "data:" in image_base64[:30]:
        header, raw = image_base64.split(",", 1)
        clean_b64 = raw
        m = re.search(r"data:([^;]+);", header)
        if m:
            mime_type = m.group(1)

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not gemini_key or len(gemini_key) < 8:
        print("[PROCTORING_SERVICE] Warning: GEMINI_API_KEY not configured. Bypassing AI verification.")
        return {
            "verified": False,
            "phone_detected": False,
            "confidence": 0.0,
            "reason": "AI proctor vision verification key not configured.",
        }

    for model in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": PHONE_PROCTOR_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": clean_b64,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json",
            },
        }

        try:
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        raw_text = parts[0].get("text", "").strip()
                        # Clean any leftover markdown blocks if present
                        if raw_text.startswith("```"):
                            raw_text = re.sub(r"^```(?:json)?", "", raw_text)
                            raw_text = re.sub(r"```$", "", raw_text).strip()

                        result_json = json.loads(raw_text)
                        detected = bool(result_json.get("phone_detected", False))
                        confidence = float(result_json.get("confidence", 0.0))
                        reason = result_json.get("reason", "Observation complete.")

                        # Require high confidence (>= 0.75) for a true detection
                        if detected and confidence < 0.75:
                            print(f"[PROCTORING_SERVICE] Phone detection rejected due to low confidence ({confidence}): {reason}")
                            detected = False

                        print(f"[PROCTORING_SERVICE] AI Phone Verification ({model}): detected={detected}, conf={confidence}, reason={reason}")
                        return {
                            "verified": True,
                            "phone_detected": detected,
                            "confidence": confidence,
                            "reason": reason,
                        }
            else:
                print(f"[PROCTORING_SERVICE] Gemini API error ({model}) status={res.status_code}: {res.text[:150]}")
        except Exception as err:
            print(f"[PROCTORING_SERVICE] Model {model} request failed: {err}")
            continue

    # If all models fail, fail-safe to FALSE so candidate is never unjustly terminated
    return {
        "verified": False,
        "phone_detected": False,
        "confidence": 0.0,
        "reason": "AI verification service temporarily unreachable.",
    }
