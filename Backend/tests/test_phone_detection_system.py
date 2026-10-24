import os
import json
import base64
import time
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db, Base, engine
from app.services.proctoring_service import (
    verify_candidate_object_with_llm,
    PROCTORING_CONFIG,
    PHONE_PROCTOR_PROMPT,
)
from app.routers.interviews import ACTIVE_PROCTORING_SESSIONS

# Generate synthetic test base64 image (valid 10x10 PNG)
TINY_PNG_B64 = (
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHR"
    "Tb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABtJREFUeNpi/P//PwM1AAMDFQAjHQ8AA"
    "AD//wMAv5oD9S8Y18kAAAAASUVORK5CYII="
)


def run_comprehensive_proctoring_tests():
    print("======================================================================")
    print("INTERVISTA AI — MOBILE PHONE PROCTORING & DETECTION TEST SUITE")
    print("======================================================================\n")

    client = TestClient(app)

    # ------------------------------------------------------------------
    # TEST 1: Config & Prompt Validation
    # ------------------------------------------------------------------
    print("[TEST 1] Verifying Proctoring Configuration & Prompt Structure...")
    assert PROCTORING_CONFIG["DETECTION_CONFIDENCE_THRESHOLD"] >= 0.30
    assert PROCTORING_CONFIG["MIN_EVIDENCE_CONFIDENCE"] >= 0.70
    assert PROCTORING_CONFIG["MIN_CONSECUTIVE_CONFIRMATIONS"] >= 2
    assert "mobile_phone" in PHONE_PROCTOR_PROMPT
    assert "non_phone" in PHONE_PROCTOR_PROMPT
    assert "uncertain" in PHONE_PROCTOR_PROMPT
    assert "calculators, notebooks, books, wallets" in PHONE_PROCTOR_PROMPT
    print("  ✓ PROCTORING_CONFIG and structured prompt valid.\n")

    # ------------------------------------------------------------------
    # TEST 2: Multi-Stage Object Classification & False-Positive Rejection
    # ------------------------------------------------------------------
    print("[TEST 2] Testing Classification Scenarios (Mocked Vision LLM)...")

    test_scenarios = [
        {
            "name": "Clearly Visible Smartphone",
            "llm_output": {
                "classification": "mobile_phone",
                "confidence": 0.94,
                "visual_evidence": "Candidate holding iPhone with illuminated screen and camera bump.",
                "reason": "Unmistakable modern smartphone in hand."
            },
            "expected_phone_detected": True,
            "expected_action": "TERMINATION",
        },
        {
            "name": "Notebook / Spiral Book",
            "llm_output": {
                "classification": "non_phone",
                "confidence": 0.96,
                "visual_evidence": "Spiral binding, lined paper sheets, and cardboard cover.",
                "reason": "Object is clearly a paper notebook, not an electronic phone."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
        {
            "name": "Laptop / External Monitor Bezel",
            "llm_output": {
                "classification": "non_phone",
                "confidence": 0.98,
                "visual_evidence": "Large display hinge and keyboard surface visible.",
                "reason": "Workstation laptop screen, not a handheld phone."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
        {
            "name": "Scientific Calculator",
            "llm_output": {
                "classification": "non_phone",
                "confidence": 0.92,
                "visual_evidence": "Segmented LCD numeric display and rubberized calculation keys.",
                "reason": "Desktop calculator, distinct from smartphone interface."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
        {
            "name": "Leather Wallet / ID Card",
            "llm_output": {
                "classification": "non_phone",
                "confidence": 0.89,
                "visual_evidence": "Folded leather billfold with plastic ID sleeve.",
                "reason": "Everyday personal wallet, no screen or electronics."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
        {
            "name": "Blank Rectangular Object / Plastic Case",
            "llm_output": {
                "classification": "non_phone",
                "confidence": 0.85,
                "visual_evidence": "Monolithic plastic slab with no bezel, screen, or ports.",
                "reason": "Rectangular object lacks smartphone characteristics."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
        {
            "name": "Blurry / Motion Smeared Frame",
            "llm_output": {
                "classification": "uncertain",
                "confidence": 0.35,
                "visual_evidence": "Severe motion blur; object edges are unresolvable.",
                "reason": "Visual evidence insufficient for classification."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
        {
            "name": "Partially Obscured Phone (Under Confidence Threshold 0.60 < 0.75)",
            "llm_output": {
                "classification": "mobile_phone",
                "confidence": 0.60,
                "visual_evidence": "Small corner of a dark object covered by palm.",
                "reason": "Possible phone corner, but mostly obscured."
            },
            "expected_phone_detected": False,
            "expected_action": "SUSPICION_CLEARED",
        },
    ]

    for scenario in test_scenarios:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [{
                "content": {
                    "parts": [{"text": json.dumps(scenario["llm_output"])}]
                }
            }]
        }

        with patch("requests.post", return_value=mock_response):
            session_id = f"test-sess-{scenario['name'].replace(' ', '_')}"
            res = client.post("/api/interviews/verify-phone", json={
                "image_base64": TINY_PNG_B64,
                "full_frame_base64": TINY_PNG_B64,
                "bounding_box": {"x": 100, "y": 150, "width": 80, "height": 160},
                "session_id": session_id,
                "consecutive_count": 2,
            })
            assert res.status_code == 200
            data = res.json()
            assert data["phone_detected"] == scenario["expected_phone_detected"], (
                f"Failed on {scenario['name']}: expected {scenario['expected_phone_detected']}, got {data['phone_detected']}"
            )
            assert data["action_enforced"] == scenario["expected_action"], (
                f"Failed action on {scenario['name']}: expected {scenario['expected_action']}, got {data['action_enforced']}"
            )
            print(f"  ✓ {scenario['name']}: class={data['classification']}, conf={data['confidence']} -> action={data['action_enforced']}")

    print("\n[TEST 2 PASSED] All everyday objects & low-confidence cases correctly rejected!\n")

    # ------------------------------------------------------------------
    # TEST 3: Resilient Error Handling (Timeouts & Malformed Responses)
    # ------------------------------------------------------------------
    print("[TEST 3] Testing API Failures & Malformed Responses (Fail-Safe Preservation)...")

    # 3a. Timeout
    with patch("requests.post", side_effect=Exception("Request timed out after 8s")):
        res = client.post("/api/interviews/verify-phone", json={
            "image_base64": TINY_PNG_B64,
            "session_id": "test-timeout-sess",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["phone_detected"] is False
        assert data["session_terminated"] is False
        assert data["action_enforced"] == "SUSPICION_CLEARED"
        print("  ✓ Timeout handled safely: candidate is NOT terminated.")

    # 3b. Malformed JSON
    mock_malformed = MagicMock()
    mock_malformed.status_code = 200
    mock_malformed.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": "I am unable to analyze this image."}]}}]
    }
    with patch("requests.post", return_value=mock_malformed):
        res = client.post("/api/interviews/verify-phone", json={
            "image_base64": TINY_PNG_B64,
            "session_id": "test-malformed-sess",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["phone_detected"] is False
        assert data["session_terminated"] is False
        print("  ✓ Malformed LLM response handled safely: fails safe to non-violation.")

    print("\n[TEST 3 PASSED] Fail-safe behavior verified.\n")

    # ------------------------------------------------------------------
    # TEST 4: Session Termination Lifecycle & Idempotency
    # ------------------------------------------------------------------
    print("[TEST 4] Testing Session Termination Lifecycle & Deduplication...")

    session_id = "lifecycle-integration-test-session"
    ACTIVE_PROCTORING_SESSIONS.pop(session_id, None)

    # Step A: Non-phone check maintains ACTIVE status
    mock_clear = MagicMock()
    mock_clear.status_code = 200
    mock_clear.json.return_value = {
        "candidates": [{
            "content": {"parts": [{"text": json.dumps({
                "classification": "non_phone",
                "confidence": 0.95,
                "visual_evidence": "Hand holding pen.",
                "reason": "Writing instrument."
            })}]}
        }]
    }
    with patch("requests.post", return_value=mock_clear):
        res = client.post("/api/interviews/verify-phone", json={
            "image_base64": TINY_PNG_B64,
            "session_id": session_id,
        })
        assert res.json()["session_terminated"] is False
        assert ACTIVE_PROCTORING_SESSIONS[session_id]["status"] == "ACTIVE"
        print("  ✓ Session remains ACTIVE on non-phone observation.")

    # Step B: Confirmed smartphone triggers immediate termination
    time.sleep(0.1)
    ACTIVE_PROCTORING_SESSIONS[session_id]["last_phone_check_ts"] = 0  # bypass cooldown for test
    mock_phone = MagicMock()
    mock_phone.status_code = 200
    mock_phone.json.return_value = {
        "candidates": [{
            "content": {"parts": [{"text": json.dumps({
                "classification": "mobile_phone",
                "confidence": 0.97,
                "visual_evidence": "Active smartphone screen displaying unauthorized notes.",
                "reason": "Cheating with phone verified."
            })}]}
        }]
    }
    with patch("requests.post", return_value=mock_phone):
        res = client.post("/api/interviews/verify-phone", json={
            "image_base64": TINY_PNG_B64,
            "session_id": session_id,
        })
        data = res.json()
        assert data["phone_detected"] is True
        assert data["session_terminated"] is True
        assert data["action_enforced"] == "TERMINATION"
        assert ACTIVE_PROCTORING_SESSIONS[session_id]["status"] == "TERMINATED_FOR_CHEATING"
        print("  ✓ Confirmed smartphone authoritatively terminates session.")

    # Step C: Subsequent repeated verification requests are idempotent
    res_repeat = client.post("/api/interviews/verify-phone", json={
        "image_base64": TINY_PNG_B64,
        "session_id": session_id,
    })
    assert res_repeat.json()["session_terminated"] is True
    assert res_repeat.json()["action_enforced"] == "TERMINATION"
    print("  ✓ Repeated requests return idempotent terminated status.")

    # ------------------------------------------------------------------
    # TEST 5: Proctoring Events Endpoint (GET /{session_id}/proctoring-events)
    # ------------------------------------------------------------------
    print("\n[TEST 5] Testing GET /{session_id}/proctoring-events Endpoint...")
    events_res = client.get(f"/api/interviews/{session_id}/proctoring-events")
    assert events_res.status_code == 200
    events_data = events_res.json()
    assert events_data["session_id"] == session_id
    assert events_data["status"] == "TERMINATED_FOR_CHEATING"
    assert events_data["terminated"] is True
    assert len(events_data["violations"]) >= 1
    assert events_data["violations"][0]["type"] == "MOBILE_PHONE_DETECTED"
    print(f"  ✓ Events endpoint returned {len(events_data['violations'])} violations. Status: {events_data['status']}")

    # ------------------------------------------------------------------
    # TEST 6: Real Gemini Vision Verification (Live API)
    # ------------------------------------------------------------------
    print("\n[TEST 6] Testing Live Gemini Vision with Screenshot Artifact...")
    test_artifact = "/Users/mayankkotuli/.gemini/antigravity-ide/brain/ae09c0e3-20de-4880-87b2-51f88ad50577/.user_uploaded/media_1792803914062.png"
    if os.path.exists(test_artifact):
        with open(test_artifact, "rb") as f:
            art_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
        live_res = client.post("/api/interviews/verify-phone", json={
            "image_base64": art_b64,
            "session_id": "test-live-gemini-session",
        })
        assert live_res.status_code == 200
        live_data = live_res.json()
        print(f"  Live Gemini classification: '{live_data['classification']}' (confidence: {live_data['confidence']})")
        print(f"  Visual evidence: {live_data['visual_evidence']}")
        print(f"  Reason: {live_data['reason']}")
        assert live_data["phone_detected"] is False
        assert live_data["session_terminated"] is False
        print("  ✓ Live Gemini Vision accurately determined no physical phone is present in the screen!")

    print("\n======================================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("======================================================================")


if __name__ == "__main__":
    run_comprehensive_proctoring_tests()
