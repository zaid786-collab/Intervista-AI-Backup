"""
Intervista AI - Coding Round Service
Handles AI-driven coding problem generation, starter templates, hint generation,
test suite evaluation, and final scorecard generation using Groq / LLM APIs.
"""

import os
import json
import re
import time
from typing import Dict, Any, List, Optional
import requests

from app.services.code_executor import run_code_against_test_suite, execute_single_program, normalize_value_for_comparison

# Groq API endpoints and default models
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
PREFERRED_MODELS = [
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
]


# =====================================================================
# CURATED CODING PROBLEMS BANK (PRODUCTION FALLBACK & BENCHMARK)
# =====================================================================

CURATED_CODING_PROBLEMS: List[Dict[str, Any]] = [
    {
        "id": "two-sum",
        "title": "Two Sum",
        "difficulty": "Easy",
        "topics": ["Arrays", "Hash Table"],
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        "input_format": "Line 1: JSON array of integers `nums`.\nLine 2: integer `target`.",
        "output_format": "JSON array of two 0-based indices `[i, j]`.",
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        "examples": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0, 1]",
                "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1, 2]",
                "explanation": "nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."
            }
        ],
        "sample_test_cases": [
            {
                "id": 1,
                "name": "Example 1 (Basic Pair)",
                "input": "[2, 7, 11, 15]\n9",
                "expected": "[0, 1]",
                "isHidden": False,
                "explanation": "2 + 7 = 9 at indices 0 and 1"
            },
            {
                "id": 2,
                "name": "Example 2 (Adjacent Match)",
                "input": "[3, 2, 4]\n6",
                "expected": "[1, 2]",
                "isHidden": False,
                "explanation": "2 + 4 = 6 at indices 1 and 2"
            }
        ],
        "hidden_test_cases": [
            {
                "id": 3,
                "name": "Hidden 1 (Duplicate Values)",
                "input": "[3, 3]\n6",
                "expected": "[0, 1]",
                "isHidden": True
            },
            {
                "id": 4,
                "name": "Hidden 2 (Negative Numbers)",
                "input": "[-1, -2, -3, -4, -5]\n-8",
                "expected": "[2, 4]",
                "isHidden": True
            },
            {
                "id": 5,
                "name": "Hidden 3 (Target Zero)",
                "input": "[0, 4, 3, 0]\n0",
                "expected": "[0, 3]",
                "isHidden": True
            }
        ],
        "starter_templates": {
            "python": 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # write your code here\n        pass\n',
            "javascript": '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // write your code here\n}\n',
            "typescript": 'function twoSum(nums: number[], target: number): number[] {\n    // write your code here\n    return [];\n}\n',
            "cpp": '#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // write your code here\n        return {};\n    }\n};\n',
            "java": 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // write your code here\n        return new int[0];\n    }\n}\n'
        },
        "function_name": "twoSum",
        "time_complexity": "O(n)",
        "space_complexity": "O(n)",
        "hints": [
            "A brute-force approach compares every pair using nested loops in O(n^2) time. Can you do better?",
            "Can you use a hash map / dictionary to check if the complement `target - num` has already been seen in O(1) time?",
            "Store elements in the hash map as you iterate: map value to its index."
        ]
    },
    {
        "id": "valid-parentheses",
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "topics": ["String", "Stack"],
        "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        "input_format": "Line 1: string `s` (or quoted JSON string).",
        "output_format": "Boolean `true` or `false`.",
        "constraints": [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        "examples": [
            {
                "input": "s = \"()\"",
                "output": "true",
                "explanation": "Single matched pair."
            },
            {
                "input": "s = \"()[]{}\"",
                "output": "true",
                "explanation": "Multiple valid pairs."
            },
            {
                "input": "s = \"(]\"",
                "output": "false",
                "explanation": "Type mismatch."
            }
        ],
        "sample_test_cases": [
            {
                "id": 1,
                "name": "Example 1 (Simple Match)",
                "input": "\"()\"",
                "expected": "true",
                "isHidden": False,
                "explanation": "Parentheses match."
            },
            {
                "id": 2,
                "name": "Example 2 (Mixed Brackets)",
                "input": "\"()[]{}\"",
                "expected": "true",
                "isHidden": False,
                "explanation": "All types match."
            },
            {
                "id": 3,
                "name": "Example 3 (Mismatch)",
                "input": "\"(]\"",
                "expected": "false",
                "isHidden": False,
                "explanation": "Mismatched closing bracket."
            }
        ],
        "hidden_test_cases": [
            {
                "id": 4,
                "name": "Hidden 1 (Nested Correctly)",
                "input": "\"{[]}\"",
                "expected": "true",
                "isHidden": True
            },
            {
                "id": 5,
                "name": "Hidden 2 (Odd Length String)",
                "input": "\"([)\"",
                "expected": "false",
                "isHidden": True
            },
            {
                "id": 6,
                "name": "Hidden 3 (Starting with Closing)",
                "input": "\"]\"",
                "expected": "false",
                "isHidden": True
            }
        ],
        "starter_templates": {
            "python": 'class Solution:\n    def isValid(self, s: str) -> bool:\n        # write your code here\n        pass\n',
            "javascript": '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // write your code here\n}\n',
            "typescript": 'function isValid(s: string): boolean {\n    // write your code here\n    return false;\n}\n',
            "cpp": '#include <string>\n#include <stack>\n\nclass Solution {\npublic:\n    bool isValid(std::string s) {\n        // write your code here\n        return false;\n    }\n};\n',
            "java": 'import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // write your code here\n        return false;\n    }\n}\n'
        },
        "function_name": "isValid",
        "time_complexity": "O(n)",
        "space_complexity": "O(n)",
        "hints": [
            "Use a LIFO data structure like a Stack.",
            "When encountering an opening bracket, push it to the stack. When encountering a closing bracket, check if it matches the stack's top.",
            "Remember to check if the stack is completely empty at the end."
        ]
    },
    {
        "id": "longest-substring-without-repeating-characters",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "topics": ["Hash Table", "String", "Sliding Window"],
        "description": "Given a string `s`, find the length of the **longest substring** without repeating characters.",
        "input_format": "Line 1: string `s`.",
        "output_format": "Integer representing the maximum length.",
        "constraints": [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        "examples": [
            {
                "input": "s = \"abcabcbb\"",
                "output": "3",
                "explanation": "The answer is \"abc\", with the length of 3."
            },
            {
                "input": "s = \"bbbbb\"",
                "output": "1",
                "explanation": "The answer is \"b\", with the length of 1."
            },
            {
                "input": "s = \"pwwkew\"",
                "output": "3",
                "explanation": "The answer is \"wke\", with the length of 3."
            }
        ],
        "sample_test_cases": [
            {
                "id": 1,
                "name": "Example 1",
                "input": "\"abcabcbb\"",
                "expected": "3",
                "isHidden": False,
                "explanation": "\"abc\" has length 3."
            },
            {
                "id": 2,
                "name": "Example 2",
                "input": "\"bbbbb\"",
                "expected": "1",
                "isHidden": False,
                "explanation": "All identical characters."
            }
        ],
        "hidden_test_cases": [
            {
                "id": 3,
                "name": "Hidden 1 (Empty String)",
                "input": "\"\"",
                "expected": "0",
                "isHidden": True
            },
            {
                "id": 4,
                "name": "Hidden 2 (All Unique)",
                "input": "\"abcdefg\"",
                "expected": "7",
                "isHidden": True
            },
            {
                "id": 5,
                "name": "Hidden 3 (Repeat in Middle)",
                "input": "\"abba\"",
                "expected": "2",
                "isHidden": True
            }
        ],
        "starter_templates": {
            "python": 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # write your code here\n        pass\n',
            "javascript": '/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    // write your code here\n}\n',
            "typescript": 'function lengthOfLongestSubstring(s: string): number {\n    // write your code here\n    return 0;\n}\n',
            "cpp": '#include <string>\n#include <unordered_map>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        // write your code here\n        return 0;\n    }\n};\n',
            "java": 'import java.util.*;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // write your code here\n        return 0;\n    }\n}\n'
        },
        "function_name": "lengthOfLongestSubstring",
        "time_complexity": "O(n)",
        "space_complexity": "O(min(n, m))",
        "hints": [
            "Use a sliding window technique with two pointers `left` and `right`.",
            "Maintain a set or dictionary of characters and their last seen indices in the current window.",
            "When a duplicate is encountered, move the `left` pointer past the previous occurrence."
        ]
    },
    {
        "id": "best-time-to-buy-and-sell-stock",
        "title": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "topics": ["Array", "Dynamic Programming"],
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day.\n\nYou want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
        "input_format": "Line 1: JSON array of integer stock prices.",
        "output_format": "Integer maximum profit.",
        "constraints": [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4"
        ],
        "examples": [
            {
                "input": "prices = [7,1,5,3,6,4]",
                "output": "5",
                "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
            },
            {
                "input": "prices = [7,6,4,3,1]",
                "output": "0",
                "explanation": "In this case, no transactions are done and the max profit = 0."
            }
        ],
        "sample_test_cases": [
            {
                "id": 1,
                "name": "Example 1",
                "input": "[7, 1, 5, 3, 6, 4]",
                "expected": "5",
                "isHidden": False,
                "explanation": "Buy at 1, sell at 6 => 5."
            },
            {
                "id": 2,
                "name": "Example 2 (Decreasing)",
                "input": "[7, 6, 4, 3, 1]",
                "expected": "0",
                "isHidden": False,
                "explanation": "Prices only fall, return 0."
            }
        ],
        "hidden_test_cases": [
            {
                "id": 3,
                "name": "Hidden 1 (Single Day)",
                "input": "[5]",
                "expected": "0",
                "isHidden": True
            },
            {
                "id": 4,
                "name": "Hidden 2 (Flat Prices)",
                "input": "[3, 3, 3, 3]",
                "expected": "0",
                "isHidden": True
            },
            {
                "id": 5,
                "name": "Hidden 3 (Late Peak)",
                "input": "[2, 4, 1, 10]",
                "expected": "9",
                "isHidden": True
            }
        ],
        "starter_templates": {
            "python": 'class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        # write your code here\n        pass\n',
            "javascript": '/**\n * @param {number[]} prices\n * @return {number}\n */\nfunction maxProfit(prices) {\n    // write your code here\n}\n',
            "typescript": 'function maxProfit(prices: number[]): number {\n    // write your code here\n    return 0;\n}\n',
            "cpp": '#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int maxProfit(std::vector<int>& prices) {\n        // write your code here\n        return 0;\n    }\n};\n',
            "java": 'import java.util.*;\n\nclass Solution {\n    public int maxProfit(int[] prices) {\n        // write your code here\n        return 0;\n    }\n}\n'
        },
        "function_name": "maxProfit",
        "time_complexity": "O(n)",
        "space_complexity": "O(1)",
        "hints": [
            "Track the minimum price seen so far as you iterate through the list.",
            "For each price, calculate profit if sold today: `current_price - min_price`.",
            "Maintain the global maximum profit."
        ]
    },
    {
        "id": "merge-intervals",
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "topics": ["Array", "Sorting"],
        "description": "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "input_format": "Line 1: JSON array of interval pairs e.g. `[[1,3],[2,6],[8,10],[15,18]]`.",
        "output_format": "JSON array of merged interval pairs.",
        "constraints": [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= start_i <= end_i <= 10^4"
        ],
        "examples": [
            {
                "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                "output": "[[1,6],[8,10],[15,18]]",
                "explanation": "Intervals [1,3] and [2,6] overlap, merging them into [1,6]."
            },
            {
                "input": "intervals = [[1,4],[4,5]]",
                "output": "[[1,5]]",
                "explanation": "Intervals [1,4] and [4,5] are considered overlapping."
            }
        ],
        "sample_test_cases": [
            {
                "id": 1,
                "name": "Example 1",
                "input": "[[1, 3], [2, 6], [8, 10], [15, 18]]",
                "expected": "[[1, 6], [8, 10], [15, 18]]",
                "isHidden": False,
                "explanation": "[1,3] and [2,6] merge into [1,6]"
            },
            {
                "id": 2,
                "name": "Example 2 (Touching Boundary)",
                "input": "[[1, 4], [4, 5]]",
                "expected": "[[1, 5]]",
                "isHidden": False,
                "explanation": "[1,4] and [4,5] merge to [1,5]"
            }
        ],
        "hidden_test_cases": [
            {
                "id": 3,
                "name": "Hidden 1 (Unsorted Input)",
                "input": "[[2, 3], [1, 5]]",
                "expected": "[[1, 5]]",
                "isHidden": True
            },
            {
                "id": 4,
                "name": "Hidden 2 (Fully Disjoint)",
                "input": "[[1, 2], [3, 4], [5, 6]]",
                "expected": "[[1, 2], [3, 4], [5, 6]]",
                "isHidden": True
            }
        ],
        "starter_templates": {
            "python": 'class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # write your code here\n        pass\n',
            "javascript": '/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n    // write your code here\n}\n',
            "typescript": 'function merge(intervals: number[][]): number[][] {\n    // write your code here\n    return [];\n}\n',
            "cpp": '#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {\n        // write your code here\n        return {};\n    }\n};\n',
            "java": 'import java.util.*;\n\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        // write your code here\n        return new int[0][0];\n    }\n}\n'
        },
        "function_name": "merge",
        "time_complexity": "O(n log n)",
        "space_complexity": "O(n)",
        "hints": [
            "Sort the intervals by their start times first.",
            "Iterate through sorted intervals: if the current interval starts before or at the end of the previous one, merge them by updating the end time.",
            "Otherwise, append current interval as a new separate entry."
        ]
    }
]


def get_curated_problem_by_difficulty(difficulty: str = "Medium", topic: Optional[str] = None) -> Dict[str, Any]:
    """Finds the best matching curated problem from bank."""
    diff_lower = difficulty.lower()
    matches = [p for p in CURATED_CODING_PROBLEMS if p["difficulty"].lower() == diff_lower]
    if not matches:
        matches = CURATED_CODING_PROBLEMS
    
    if topic:
        topic_lower = topic.lower()
        topic_matches = [p for p in matches if any(topic_lower in t.lower() for t in p.get("topics", []))]
        if topic_matches:
            return topic_matches[0]
            
    return matches[0]


# =====================================================================
# GROQ LLM CODING QUESTION GENERATOR
# =====================================================================

def generate_coding_question_with_groq(
    language: str = "python",
    difficulty: str = "Medium",
    role: str = "Software Engineer",
    experience: str = "Mid Level",
    topic: str = "Data Structures & Algorithms",
    company: str = "Google",
    api_key: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Calls Groq API to dynamically generate an original coding challenge complete
    with LeetCode-style constraints, starter templates in 5 languages, sample tests,
    and hidden test cases.
    """
    key = api_key or os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
    if not key or len(key) < 8:
        return None

    prompt = f"""You are a Principal Software Engineer at {company} conducting a real {difficulty}-difficulty Coding Interview Round for a {role} ({experience}).

Task: Generate a realistic, original coding interview problem testing: "{topic}".
Candidate will solve in: {language}.

Output MUST strictly follow this exact JSON schema (return ONLY valid JSON, NO markdown wrappers, NO preamble):
{{
  "id": "slug-problem-title",
  "title": "Problem Title",
  "difficulty": "{difficulty}",
  "topics": ["{topic}", "Algorithms"],
  "description": "Complete problem statement explaining the goal clearly.",
  "input_format": "Explanation of input lines/arguments",
  "output_format": "Explanation of return value/stdout",
  "constraints": [
    "1 <= n <= 10^5",
    "Time complexity limit: O(n) or O(n log n)"
  ],
  "examples": [
    {{
      "input": "example input expression",
      "output": "example output",
      "explanation": "why this output is correct"
    }}
  ],
  "sample_test_cases": [
    {{
      "id": 1,
      "name": "Sample Test 1",
      "input": "raw stdin or args passed to wrapper (one arg per line or json)",
      "expected": "expected output string",
      "isHidden": false,
      "explanation": "sample walkthrough"
    }},
    {{
      "id": 2,
      "name": "Sample Test 2",
      "input": "second test input",
      "expected": "second expected output",
      "isHidden": false,
      "explanation": "walkthrough"
    }}
  ],
  "hidden_test_cases": [
    {{
      "id": 3,
      "name": "Edge Case (Empty / Single / Boundary)",
      "input": "edge input",
      "expected": "edge expected output",
      "isHidden": true
    }},
    {{
      "id": 4,
      "name": "Large Scale / Stress Test",
      "input": "stress input",
      "expected": "stress expected output",
      "isHidden": true
    }}
  ],
  "starter_templates": {{
    "python": "class Solution:\\n    def solve(self, ...):\\n        pass\\n",
    "javascript": "function solve(...) {{\\n    // code\\n}}\\n",
    "typescript": "function solve(...): ... {{\\n    // code\\n}}\\n",
    "cpp": "class Solution {{\\npublic:\\n    ... solve(...) {{\\n    }}\\n}};\\n",
    "java": "class Solution {{\\n    public ... solve(...) {{\\n    }}\\n}}\\n"
  }},
  "function_name": "solve",
  "time_complexity": "O(n)",
  "space_complexity": "O(n)",
  "hints": [
    "Hint 1: Initial insight on approach.",
    "Hint 2: Data structure recommendation.",
    "Hint 3: Boundary edge case to consider."
  ]
}}
"""

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    # Try preferred models
    for model in PREFERRED_MODELS:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a professional technical interviewer who only outputs valid JSON adhering strictly to schemas."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"} if "llama-3" in model or "gpt" in model else None,
        }
        # Remove None keys
        payload = {k: v for k, v in payload.items() if v is not None}

        try:
            res = requests.post(GROQ_URL, headers=headers, json=payload, timeout=20)
            if res.status_code == 200:
                data = res.json()
                raw_content = data["choices"][0]["message"]["content"].strip()
                # Clean up any residual markdown backticks
                if raw_content.startswith("```json"):
                    raw_content = raw_content[7:]
                if raw_content.startswith("```"):
                    raw_content = raw_content[3:]
                if raw_content.endswith("```"):
                    raw_content = raw_content[:-3]
                parsed = json.loads(raw_content.strip())

                # Validate essential fields
                if (
                    isinstance(parsed, dict)
                    and parsed.get("title")
                    and parsed.get("description")
                    and parsed.get("sample_test_cases")
                    and len(parsed["sample_test_cases"]) > 0
                ):
                    # Ensure starter templates exist
                    if not parsed.get("starter_templates"):
                        fn = parsed.get("function_name", "solution")
                        parsed["starter_templates"] = {
                            "python": f"class Solution:\n    def {fn}(self):\n        pass\n",
                            "javascript": f"function {fn}() {{\n    // code\n}}\n",
                            "typescript": f"function {fn}() {{\n    // code\n}}\n",
                            "cpp": f"class Solution {{\npublic:\n    void {fn}() {{\n    }}\n}};\n",
                            "java": f"class Solution {{\n    public void {fn}() {{\n    }}\n}}\n",
                        }
                    return parsed
        except Exception as e:
            print(f"[CodingService] Groq generation attempt with {model} failed: {e}")
            continue

    return None


def get_coding_question(
    language: str = "python",
    difficulty: str = "Medium",
    role: str = "Software Engineer",
    experience: str = "Mid Level",
    topic: str = "Data Structures & Algorithms",
    company: str = "Google",
    question_index: int = 0,
) -> Dict[str, Any]:
    """
    Main entry point for generating or retrieving a coding interview problem.
    1. Tries dynamic Groq generation.
    2. Gracefully falls back to curated verified bank.
    """
    # 1. Try Groq
    generated = generate_coding_question_with_groq(
        language=language,
        difficulty=difficulty,
        role=role,
        experience=experience,
        topic=topic,
        company=company,
    )
    if generated:
        return generated

    # 2. Resilient Fallback to Curated Problems
    bank_idx = question_index % len(CURATED_CODING_PROBLEMS)
    # Check if a specific problem fits the requested difficulty better
    diff_match = get_curated_problem_by_difficulty(difficulty, topic)
    if diff_match:
        return diff_match
    return CURATED_CODING_PROBLEMS[bank_idx]


# =====================================================================
# AI HINT GENERATOR
# =====================================================================

def generate_coding_hint(
    problem: Dict[str, Any],
    candidate_code: str,
    language: str = "python",
    hint_index: int = 1,
    failed_test: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Generates an intelligent interviewer nudge without revealing the full solution.
    """
    key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
    hints_list = problem.get("hints", [])
    
    if key and len(key) > 8:
        prompt = f"""You are an AI Technical Interviewer in a live coding interview.
Problem: {problem.get('title')}
Description: {problem.get('description')}
Candidate is writing in: {language}
Current Candidate Code:
{candidate_code}

Failed Test (if any): {json.dumps(failed_test) if failed_test else "None - candidate is asking for guidance."}
Hint request count: {hint_index}

Provide a conversational, 1-2 sentence guiding hint like a friendly Staff Interviewer.
DO NOT provide the full solution code. Suggest an algorithmic direction, edge case, or data structure.
"""
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a concise, helpful coding interviewer giving progressive hints without spoiling solutions."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 150,
        }
        try:
            res = requests.post(GROQ_URL, headers=headers, json=payload, timeout=10)
            if res.status_code == 200:
                hint_text = res.json()["choices"][0]["message"]["content"].strip()
                return hint_text
        except Exception:
            pass

    # Fallback to curated hint
    if hints_list:
        idx = min(hint_index - 1, len(hints_list) - 1)
        return hints_list[idx]
        
    return "Think about the data structures that allow constant O(1) lookups or how sorting the inputs could simplify the problem."


# =====================================================================
# POST-SUBMISSION AI EVALUATION SERVICE
# =====================================================================

def evaluate_coding_submission(
    problem: Dict[str, Any],
    candidate_code: str,
    language: str,
    execution_result: Dict[str, Any],
    interviewer_persona: str = "chen",
) -> Dict[str, Any]:
    """
    Evaluates candidate's submitted solution.
    Combines objective execution test pass metrics with subjective AI code quality,
    algorithmic complexity, and actionable feedback.
    """
    passed_count = execution_result.get("passed_count", 0)
    total_count = execution_result.get("total_count", 1)
    verdict = execution_result.get("verdict", "Wrong Answer")
    exec_time = execution_result.get("execution_time_ms", 0)
    pass_ratio = (passed_count / max(1, total_count))

    # Base correctness score from actual test execution (0 to 70 points)
    test_score = int(pass_ratio * 70)

    # Call Groq for qualitative review
    key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
    ai_evaluation = None

    if key and len(key) > 8:
        eval_prompt = f"""You are a Senior Principal Interviewer conducting an AI Technical Interview.
Candidate just submitted solution for:
Title: {problem.get('title')}
Target Expected Time Complexity: {problem.get('time_complexity', 'O(n)')}
Target Expected Space Complexity: {problem.get('space_complexity', 'O(n)')}
Language: {language}

Execution Verdict: {verdict}
Tests Passed: {passed_count} / {total_count} ({pass_ratio * 100:.1f}%)
Execution Time: {exec_time}ms

Candidate Source Code:
```
{candidate_code}
```

Provide an objective assessment in valid JSON:
{{
  "code_quality_score": <integer 0-30 based on readability, naming, idioms>,
  "detected_time_complexity": "<e.g. O(n) or O(n^2)>",
  "detected_space_complexity": "<e.g. O(1) or O(n)>",
  "complexity_feedback": "<1-2 sentences on asymptotic scaling>",
  "strengths": ["<Specific strength 1>", "<Specific strength 2>"],
  "improvements": ["<Actionable improvement 1>", "<Actionable improvement 2>"],
  "interviewer_dialogue": "<Conversational response spoken to candidate (2-3 sentences). Acknowledge pass/fail, discuss approach, prompt follow-up.>"
}}
"""
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a senior technical interviewer outputting strict JSON evaluation reports."},
                {"role": "user", "content": eval_prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }
        try:
            res = requests.post(GROQ_URL, headers=headers, json=payload, timeout=15)
            if res.status_code == 200:
                raw_json = res.json()["choices"][0]["message"]["content"].strip()
                ai_evaluation = json.loads(raw_json)
        except Exception as e:
            print(f"[CodingService] AI evaluation error: {e}")

    # Synthesize complete result
    quality_score = ai_evaluation.get("code_quality_score", 20 if pass_ratio > 0.5 else 10) if ai_evaluation else 20
    final_score = min(100, test_score + quality_score)

    if pass_ratio == 1.0:
        default_dialogue = f"Excellent work! Your code passed all {total_count} test cases including hidden edge conditions. Your solution demonstrates strong problem decomposition and optimal complexity."
    elif pass_ratio > 0.5:
        default_dialogue = f"Good progress. Your solution passed {passed_count} out of {total_count} test cases, but failed on some boundary edge cases. Take a moment to inspect negative numbers or empty collections."
    elif verdict == "Compilation Error":
        default_dialogue = "Your submission ran into a syntax or compilation error. Please check the compiler diagnostics in the output console and resolve the type or syntax issue."
    else:
        default_dialogue = f"Your solution returned mismatched outputs for the evaluated inputs ({passed_count}/{total_count} passed). Re-read the problem constraints and check your logic."

    return {
        "verdict": verdict,
        "score": final_score,
        "passed_count": passed_count,
        "total_count": total_count,
        "all_passed": (passed_count == total_count and total_count > 0),
        "execution_time_ms": exec_time,
        "time_complexity": ai_evaluation.get("detected_time_complexity", problem.get("time_complexity", "O(n)")) if ai_evaluation else problem.get("time_complexity", "O(n)"),
        "space_complexity": ai_evaluation.get("detected_space_complexity", problem.get("space_complexity", "O(n)")) if ai_evaluation else problem.get("space_complexity", "O(n)"),
        "complexity_feedback": ai_evaluation.get("complexity_feedback", "Demonstrates standard algorithmic scaling.") if ai_evaluation else "Demonstrates standard algorithmic scaling.",
        "strengths": ai_evaluation.get("strengths", ["Logical structure aligns with algorithmic approach."]) if ai_evaluation else ["Clear variable naming and modular logic."],
        "improvements": ai_evaluation.get("improvements", ["Ensure comprehensive boundary condition checking."]) if ai_evaluation else ["Guard against empty inputs or duplicate values."],
        "interviewer_message": ai_evaluation.get("interviewer_dialogue", default_dialogue) if ai_evaluation else default_dialogue,
        "test_case_results": execution_result.get("results", []),
    }


# =====================================================================
# FINAL CODING REPORT AGGREGATOR
# =====================================================================

def generate_final_coding_report(
    session_data: Dict[str, Any],
    submissions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Compiles full interview performance, score, question metrics,
    and personalized practice roadmap.
    """
    total_q = len(submissions)
    if total_q == 0:
        return {
            "overallScore": 0,
            "status": "Incomplete",
            "message": "No submissions were recorded.",
        }

    total_score = sum(s.get("score", 0) for s in submissions)
    overall_score = round(total_score / total_q)
    passed_problems = sum(1 for s in submissions if s.get("all_passed", False))
    total_tests_passed = sum(s.get("passed_count", 0) for s in submissions)
    total_tests_evaluated = sum(s.get("total_count", 0) for s in submissions)

    # Derive grade
    if overall_score >= 90:
        grade = "Strong Hire (L5/L6)"
    elif overall_score >= 75:
        grade = "Hire (L4)"
    elif overall_score >= 60:
        grade = "Leaning Hire (L3/Junior)"
    else:
        grade = "Needs Improvement"

    # Assemble comprehensive roadmap
    study_roadmap = [
        {
            "step": 1,
            "title": "Sliding Window & Two Pointer Patterns",
            "focus": "Practice variable-size window tracking to optimize substring and subarray lookups from O(n^2) to O(n).",
        },
        {
            "step": 2,
            "title": "Hash Table Lookups & Prefix Sums",
            "focus": "Utilize constant-time O(1) hash maps to eliminate redundant nested traversals in cumulative array sums.",
        },
        {
            "step": 3,
            "title": "Boundary & Edge Case Rigor",
            "focus": "Prioritize zero/empty collections, duplicates, and integer overflow before writing algorithmic cores.",
        },
    ]

    return {
        "sessionId": session_data.get("session_id"),
        "role": session_data.get("role", "Software Engineer"),
        "company": session_data.get("company", "Google"),
        "difficulty": session_data.get("difficulty", "Medium"),
        "overallScore": overall_score,
        "grade": grade,
        "questionsAttempted": total_q,
        "questionsPassed": passed_problems,
        "totalTestsPassed": total_tests_passed,
        "totalTestsEvaluated": total_tests_evaluated,
        "scores": {
            "correctness": min(100, int((total_tests_passed / max(1, total_tests_evaluated)) * 100)),
            "technicalDepth": overall_score,
            "problemSolving": min(100, overall_score + 4),
            "codeQuality": min(100, max(60, overall_score - 2)),
        },
        "submissions": submissions,
        "studyRoadmap": study_roadmap,
        "summary": f"Completed coding round with {passed_problems}/{total_q} problems fully accepted and {total_tests_passed}/{total_tests_evaluated} total test cases verified.",
    }
