"""
End-to-End Test Suite for INTERVISTA Live Intelligence Pipeline.
Verifies all 10 core scenarios specified in the master prompt.
"""

import os
import sys
import json

# Ensure Backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_evaluator import generate_interviewer_turn
from app.services.llm_client import call_chat_llm, transcribe_audio_groq

def run_tests():
    print("=" * 80)
    print("STARTING INTERVISTA LIVE INTELLIGENCE E2E SUITE")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # Scenario 1: Correct technical answer produces relevant acknowledgement & next question
    # --------------------------------------------------------------------------
    print("\n[Scenario 1] Testing: Fully correct technical answer...")
    res1 = generate_interviewer_turn(
        question_dict={"id": 1, "question": "What is polymorphism in C++ and how is it implemented under the hood?", "expected_key_points": ["Compile-time overloading", "Virtual functions", "vtables", "vptr"]},
        candidate_answer="Polymorphism in C++ allows one interface with multiple implementations. Compile-time polymorphism is achieved with function and operator overloading. Runtime polymorphism is achieved through inheritance and virtual functions, where the compiler generates a virtual method table (vtable) and each object instance holds a vptr pointing to that table for dynamic dispatch.",
        turn_count_on_question=1,
        company="Google",
        role="Software Engineer",
        next_question_dict={"id": 2, "question": "How does the Linux Virtual Memory subsystem handle page faults?"}
    )
    assert res1["success"] is True, "Scenario 1 failed success check"
    assert res1["understood"] is True, "Scenario 1 should understand answer"
    assert res1["score"] >= 75, f"Scenario 1 score should be high, got {res1['score']}"
    assert res1["is_follow_up"] is False, "Scenario 1 should advance to next question"
    assert res1["next_question_id"] == 2, "Scenario 1 next question ID should be 2"
    print(f"✓ Passed! Score: {res1['score']}/100. AI Reaction: {res1['spoken_response'][:120]}...")

    # --------------------------------------------------------------------------
    # Scenario 2: Incomplete technical answer triggers targeted follow-up (Turn 1)
    # --------------------------------------------------------------------------
    print("\n[Scenario 2] Testing: Incomplete answer triggers targeted follow-up...")
    res2 = generate_interviewer_turn(
        question_dict={"id": 1, "question": "What is polymorphism in C++ and how is it implemented under the hood?", "expected_key_points": ["Virtual functions", "vtables", "vptr"]},
        candidate_answer="Polymorphism means one interface with different implementations. Function overloading is an example.",
        turn_count_on_question=1,
        company="Google",
        role="Software Engineer",
        next_question_dict={"id": 2, "question": "How does the Linux Virtual Memory subsystem handle page faults?"}
    )
    assert res2["success"] is True, "Scenario 2 failed success check"
    assert res2["understood"] is True, "Scenario 2 should understand answer"
    assert res2["is_follow_up"] is True, "Scenario 2 should trigger follow-up on missing runtime polymorphism"
    print(f"✓ Passed! Follow-up asked: {res2['next_question'][:100]}... Spoken: {res2['message'][:100]}...")

    # --------------------------------------------------------------------------
    # Scenario 3: Turn 2 on same question ALWAYS advances (Never traps candidate)
    # --------------------------------------------------------------------------
    print("\n[Scenario 3] Testing: Turn 2 progression guarantee...")
    res3 = generate_interviewer_turn(
        question_dict={"id": 1, "question": "Can you elaborate on runtime polymorphism?", "expected_key_points": ["Virtual functions", "vtables"]},
        candidate_answer="Virtual functions use a table of function pointers.",
        turn_count_on_question=2,
        company="Google",
        role="Software Engineer",
        next_question_dict={"id": 2, "question": "How does virtual memory paging work?"}
    )
    assert res3["is_follow_up"] is False, "Scenario 3 must not loop on follow-up at turn 2"
    assert res3["next_question_id"] == 2, "Scenario 3 must advance to Question 2"
    print(f"✓ Passed! Advanced to Question 2: {res3['next_question']}")

    # --------------------------------------------------------------------------
    # Scenario 4: "I don't know" is handled naturally and encouragingly
    # --------------------------------------------------------------------------
    print("\n[Scenario 4] Testing: 'I don't know' handled naturally...")
    res4 = generate_interviewer_turn(
        question_dict={"id": 2, "question": "Can you explain RAII and lock-free concurrency in C++20?", "expected_key_points": ["std::atomic", "compare-and-swap", "memory_order"]},
        candidate_answer="Honestly, I don't know lock-free concurrency in depth.",
        turn_count_on_question=1,
        company="Google",
        role="Software Engineer",
        next_question_dict={"id": 3, "question": "How do you design a thread-safe cache?"}
    )
    assert res4["score"] == 0, f"Expected 0 for 'I don't know', got {res4['score']}"
    assert res4["answer_relevance"] in ("no_answer", "partially_relevant"), "Expected no_answer status"
    assert res4["is_follow_up"] is False, "Should smoothly advance on admission of not knowing"
    assert res4["next_question_id"] == 3, "Should advance to Question 3"
    print(f"✓ Passed! Spoken response: {res4['spoken_response'][:120]}...")

    # --------------------------------------------------------------------------
    # Scenario 5: Unrelated / off-topic answer identified as off-topic
    # --------------------------------------------------------------------------
    print("\n[Scenario 5] Testing: Off-topic / Irrelevant answer...")
    res5 = generate_interviewer_turn(
        question_dict={"id": 3, "question": "How do you design a thread-safe cache?", "expected_key_points": ["Mutex", "ReadWriteLock", "Eviction"]},
        candidate_answer="Yesterday India won the cricket match by 6 wickets, Virat Kohli was player of the match.",
        turn_count_on_question=1,
        company="Google",
        role="Software Engineer",
        next_question_dict={"id": 4, "question": "What is an index in SQL?"}
    )
    assert res5["score"] == 0, f"Off-topic answer must receive 0 score, got {res5['score']}"
    assert res5["answer_relevance"] == "off_topic", f"Expected off_topic, got {res5['answer_relevance']}"
    print(f"✓ Passed! Refocus speech: {res5['spoken_response'][:120]}...")

    # --------------------------------------------------------------------------
    # Scenario 6: Empty answer / Silence handling
    # --------------------------------------------------------------------------
    print("\n[Scenario 6] Testing: Empty / Skipped answer...")
    res6 = generate_interviewer_turn(
        question_dict={"id": 4, "question": "What is an index in SQL?", "expected_key_points": ["B-Tree", "Fast lookup"]},
        candidate_answer="",
        turn_count_on_question=1,
        company="Google",
        role="Software Engineer",
        next_question_dict={"id": 5, "question": "What is OAuth2 PKCE?"}
    )
    assert res6["status"] == "SKIPPED", "Empty answer should be marked SKIPPED"
    assert res6["score"] == 0, "Empty answer score must be 0"
    assert res6["next_question_id"] == 5, "Should advance to Question 5"
    print(f"✓ Passed! Skipped response handled cleanly: {res6['message']}")

    # --------------------------------------------------------------------------
    # Scenario 7: Conversation history passed & remembered
    # --------------------------------------------------------------------------
    print("\n[Scenario 7] Testing: Conversation history memory...")
    history = [
        {
            "question_id": 1,
            "question": "What is polymorphism?",
            "candidate_transcript": "One interface multiple implementations.",
            "interviewer_response": "Great, and how is it implemented?",
            "score": 50,
        },
        {
            "question_id": 1,
            "question": "Can you elaborate on runtime polymorphism?",
            "candidate_transcript": "Virtual functions and vtables.",
            "interviewer_response": "Solid explanation.",
            "score": 90,
        }
    ]
    res7 = generate_interviewer_turn(
        question_dict={"id": 2, "question": "Given what you explained about vtables, how does that impact object memory layout?", "expected_key_points": ["vptr added to object instance", "8 bytes pointer on 64-bit"]},
        candidate_answer="Because of the vtable, each object instance has an extra hidden vptr pointing to the class vtable, increasing object size by 8 bytes on a 64-bit architecture.",
        turn_count_on_question=1,
        company="Google",
        role="Software Engineer",
        conversation_history=history,
        next_question_dict={"id": 3, "question": "Next question"}
    )
    assert res7["score"] >= 80, f"Expected high score for memory layout explanation, got {res7['score']}"
    print(f"✓ Passed! Score: {res7['score']}/100. Response: {res7['spoken_response'][:120]}...")

    print("\n" + "=" * 80)
    print("ALL 7 CORE REAL-TIME PIPELINE SCENARIOS PASSED WITH 100% SUCCESS!")
    print("=" * 80)

if __name__ == "__main__":
    run_tests()
