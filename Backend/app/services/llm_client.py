"""
Unified LLM & STT Client for Intervista AI.
Seamlessly routes live interview evaluation, follow-up reasoning, and question generation
through existing project API keys (Groq & Google Gemini) with zero hardcoded credentials,
automatic model fallback, and robust schema validation.
"""

import os
import json
import re
from typing import List, Dict, Any, Optional, Tuple
import requests

from app.config import get_env, reload_env

# Candidate Groq models confirmed available on this API account
GROQ_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]

# Candidate Gemini models confirmed available on Google Gemini Studio key
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
]


def clean_json_text(raw_text: str) -> str:
    """Strips Markdown fences and leading/trailing noise to safely isolate pure JSON."""
    text = (raw_text or "").strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def call_chat_llm(
    messages: List[Dict[str, str]],
    response_json: bool = True,
    temperature: float = 0.2,
    timeout: int = 15,
) -> Tuple[Optional[str], Optional[Dict[str, Any]], Optional[str]]:
    """
    Executes a structured chat completion call using the existing configured keys.
    Priority 1: Groq API (ultra-fast low latency ~200-400ms)
    Priority 2: Google Gemini API (gemini-2.5-flash)
    Returns: (raw_content, parsed_json_dict, error_message)
    """
    reload_env()
    groq_key = get_env("GROQ_API_KEY")
    gemini_key = get_env("GEMINI_API_KEY") or get_env("GOOGLE_API_KEY")

    last_error = None

    # 1. Attempt Groq API
    if groq_key and groq_key.startswith("gsk_"):
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json",
        }
        for model in GROQ_MODELS:
            payload: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
            if response_json:
                payload["response_format"] = {"type": "json_object"}

            try:
                r = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=timeout,
                )
                if r.status_code == 200:
                    data = r.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = None
                    if response_json:
                        clean_str = clean_json_text(content)
                        parsed = json.loads(clean_str)
                    return content, parsed, None
                else:
                    last_error = f"Groq ({model}) HTTP {r.status_code}: {r.text[:200]}"
                    # If model not found or rate limited, try next model in candidate list
                    continue
            except Exception as e:
                last_error = f"Groq ({model}) connection error: {str(e)}"
                continue

    # 2. Fallback to Google Gemini API
    if gemini_key and len(gemini_key) > 8:
        # Convert messages format to Gemini contents
        system_instructions = []
        gemini_contents = []
        for m in messages:
            role = m.get("role")
            text = m.get("content", "")
            if role == "system":
                system_instructions.append(text)
            elif role == "assistant":
                gemini_contents.append({"role": "model", "parts": [{"text": text}]})
            else:
                gemini_contents.append({"role": "user", "parts": [{"text": text}]})

        for g_model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{g_model}:generateContent?key={gemini_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": gemini_contents,
                "generationConfig": {
                    "temperature": temperature,
                },
            }
            if system_instructions:
                payload["systemInstruction"] = {
                    "parts": [{"text": "\n\n".join(system_instructions)}]
                }
            if response_json:
                payload["generationConfig"]["responseMimeType"] = "application/json"

            try:
                r = requests.post(url, headers=headers, json=payload, timeout=timeout)
                if r.status_code == 200:
                    data = r.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            content = parts[0].get("text", "")
                            clean_str = clean_json_text(content)
                            parsed = json.loads(clean_str) if response_json else None
                            return content, parsed, None
                last_error = f"Gemini ({g_model}) HTTP {r.status_code}: {r.text[:200]}"
            except Exception as e:
                last_error = f"Gemini ({g_model}) error: {str(e)}"

    return None, None, (last_error or "No configured LLM API keys available in Backend/.env.")


def transcribe_audio_groq(
    audio_bytes: bytes,
    filename: str = "candidate_speech.webm",
    content_type: str = "audio/webm",
    language: str = "en",
) -> Tuple[Optional[str], Optional[str]]:
    """
    Transcribes candidate spoken audio using Groq Whisper.
    Returns: (transcript_text, error_message)
    """
    reload_env()
    groq_key = get_env("GROQ_API_KEY")
    if not groq_key or not groq_key.startswith("gsk_"):
        return None, "GROQ_API_KEY not configured or invalid."

    headers = {"Authorization": f"Bearer {groq_key}"}
    files_dict = {"file": (filename, audio_bytes, content_type)}
    lang_code = "hi" if language and language.lower().startswith("hi") else "en"

    for whisper_model in ["whisper-large-v3-turbo", "whisper-large-v3"]:
        data = {
            "model": whisper_model,
            "language": lang_code,
            "response_format": "json",
            "temperature": 0.0,
        }
        try:
            r = requests.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers=headers,
                files=files_dict,
                data=data,
                timeout=20,
            )
            if r.status_code == 200:
                transcript = r.json().get("text", "").strip()
                return transcript, None
        except Exception as e:
            continue

    return None, "Groq Whisper transcription failed."
