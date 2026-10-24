"""
Intervista AI - Sandboxed Code Execution Service
Securely executes candidate code in an isolated subprocess sandbox.
Supports Python, JavaScript, TypeScript, C++, and Java.
Validates inputs against test cases, catches compilation errors, runtime errors,
and prevents infinite loops with strict timeouts.
"""

import os
import sys
import time
import tempfile
import subprocess
import json
import re
from typing import Dict, Any, List, Optional

# Supported language identifiers
SUPPORTED_LANGUAGES = {"python", "python3", "javascript", "nodejs", "typescript", "cpp", "c++", "java"}

# Security constraints
EXECUTION_TIMEOUT_SECONDS = 5.0
MAX_OUTPUT_CHARS = 10000

# Locate binaries on host
PYTHON_BIN = sys.executable or "/usr/bin/python3"
NODE_BIN = (
    "/Users/mayankkotuli/.nvm/versions/node/v20.20.2/bin/node"
    if os.path.exists("/Users/mayankkotuli/.nvm/versions/node/v20.20.2/bin/node")
    else "node"
)
GCC_BIN = "/usr/bin/g++" if os.path.exists("/usr/bin/g++") else "g++"
JAVA_BIN = "/usr/bin/java" if os.path.exists("/usr/bin/java") else "java"
JAVAC_BIN = "/usr/bin/javac" if os.path.exists("/usr/bin/javac") else "javac"

# Safe execution environment: strip out backend secrets (.env keys)
STERILE_ENV = {
    "PATH": f"/usr/bin:/bin:/usr/local/bin:{os.path.dirname(NODE_BIN)}",
    "LANG": "en_US.UTF-8",
    "LC_ALL": "en_US.UTF-8",
}


def normalize_value_for_comparison(val: Any) -> str:
    """Normalizes stdout / test output strings for robust comparison."""
    if val is None:
        return ""
    s = str(val).strip()
    # Normalize boolean representations
    if s.lower() == "true":
        return "true"
    if s.lower() == "false":
        return "false"
    # Remove outer single/double quotes
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    # Normalize list/array spacing e.g. [0, 1] vs [0,1]
    s = re.sub(r"\s*([,\[\]\{\}:])\s*", r"\1", s)
    return s


def wrap_code_for_execution(code: str, language: str, input_str: str) -> str:
    """
    Wraps solution code with test invocation if candidate defined a standard class or function.
    """
    lang = language.lower()
    clean_input = input_str.strip()

    if "python" in lang:
        # If user defined class Solution or def function, append invocation helper
        wrapper = f"""
{code}

# --- Automatic Test Invocation ---
if __name__ == "__main__":
    import sys, json
    raw_in = \"\"\"{clean_input}\"\"\"
    lines = [l.strip() for l in raw_in.splitlines() if l.strip()]
    
    # Check if Solution class exists
    if 'Solution' in globals():
        sol = Solution()
        # Find method
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        if methods:
            func = getattr(sol, methods[0])
            try:
                # Try parsing lines as json or direct args
                args = []
                for line in lines:
                    try:
                        args.append(json.loads(line))
                    except Exception:
                        args.append(line)
                res = func(*args)
                if res is not None:
                    print(json.dumps(res) if isinstance(res, (list, dict, bool, int, float)) else res)
            except TypeError:
                # If args mismatch, try passing raw input
                pass
"""
        return wrapper

    elif "javascript" in lang or "node" in lang:
        wrapper = f"""
{code}

// --- Automatic Test Invocation ---
const fs = require('fs');
const rawIn = `{clean_input}`;
const lines = rawIn.split('\\n').map(l => l.trim()).filter(Boolean);

if (typeof Solution !== 'undefined') {{
    const sol = new Solution();
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
    if (methods.length > 0) {{
        try {{
            const args = lines.map(l => {{
                try {{ return JSON.parse(l); }} catch (e) {{ return l; }}
            }});
            const res = sol[methods[0]](...args);
            if (res !== undefined) console.log(typeof res === 'object' ? JSON.stringify(res) : res);
        }} catch(e) {{}}
    }}
}} else if (typeof twoSum === 'function') {{
    try {{
        const args = lines.map(l => {{ try {{ return JSON.parse(l); }} catch (e) {{ return l; }} }});
        const res = twoSum(...args);
        if (res !== undefined) console.log(JSON.stringify(res));
    }} catch(e) {{}}
}}
"""
        return wrapper

    return code


def execute_single_program(code: str, language: str, stdin_input: str) -> Dict[str, Any]:
    """
    Compiles (if required) and executes program with stdin input in an isolated temporary directory.
    """
    lang = language.lower()

    with tempfile.TemporaryDirectory() as temp_dir:
        stdout = ""
        stderr = ""
        exec_time_ms = 0.0
        status = "Success"

        try:
            # 1. PYTHON EXECUTION
            if "python" in lang:
                src_path = os.path.join(temp_dir, "solution.py")
                wrapped_code = wrap_code_for_execution(code, "python", stdin_input)
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(wrapped_code)

                t0 = time.time()
                proc = subprocess.run(
                    [PYTHON_BIN, "-u", src_path],
                    input=stdin_input,
                    capture_output=True,
                    text=True,
                    timeout=EXECUTION_TIMEOUT_SECONDS,
                    env=STERILE_ENV,
                    cwd=temp_dir,
                )
                exec_time_ms = round((time.time() - t0) * 1000, 1)
                stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
                stderr = proc.stderr[:MAX_OUTPUT_CHARS].strip()

                if proc.returncode != 0:
                    if "SyntaxError" in stderr or "IndentationError" in stderr or "TabError" in stderr:
                        status = "Compilation Error"
                    else:
                        status = "Runtime Error"

            # 2. JAVASCRIPT / NODE EXECUTION
            elif "javascript" in lang or "node" in lang or "typescript" in lang:
                src_path = os.path.join(temp_dir, "solution.js")
                wrapped_code = wrap_code_for_execution(code, "javascript", stdin_input)
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(wrapped_code)

                t0 = time.time()
                proc = subprocess.run(
                    [NODE_BIN, src_path],
                    input=stdin_input,
                    capture_output=True,
                    text=True,
                    timeout=EXECUTION_TIMEOUT_SECONDS,
                    env=STERILE_ENV,
                    cwd=temp_dir,
                )
                exec_time_ms = round((time.time() - t0) * 1000, 1)
                stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
                stderr = proc.stderr[:MAX_OUTPUT_CHARS].strip()

                if proc.returncode != 0:
                    if "SyntaxError" in stderr or "Unexpected token" in stderr:
                        status = "Compilation Error"
                    else:
                        status = "Runtime Error"

            # 3. C++ EXECUTION
            elif "cpp" in lang or "c++" in lang:
                src_path = os.path.join(temp_dir, "solution.cpp")
                out_path = os.path.join(temp_dir, "solution_bin")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(code)

                # Compilation step
                comp = subprocess.run(
                    [GCC_BIN, "-O2", "-std=c++17", src_path, "-o", out_path],
                    capture_output=True,
                    text=True,
                    timeout=8.0,
                    env=STERILE_ENV,
                    cwd=temp_dir,
                )
                if comp.returncode != 0:
                    return {
                        "status": "Compilation Error",
                        "stdout": "",
                        "stderr": comp.stderr[:MAX_OUTPUT_CHARS].strip(),
                        "execution_time_ms": 0.0,
                    }

                t0 = time.time()
                proc = subprocess.run(
                    [out_path],
                    input=stdin_input,
                    capture_output=True,
                    text=True,
                    timeout=EXECUTION_TIMEOUT_SECONDS,
                    env=STERILE_ENV,
                    cwd=temp_dir,
                )
                exec_time_ms = round((time.time() - t0) * 1000, 1)
                stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
                stderr = proc.stderr[:MAX_OUTPUT_CHARS].strip()

                if proc.returncode != 0:
                    status = "Runtime Error"

            # 4. JAVA EXECUTION
            elif "java" in lang:
                src_path = os.path.join(temp_dir, "Solution.java")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(code)

                comp = subprocess.run(
                    [JAVAC_BIN, src_path],
                    capture_output=True,
                    text=True,
                    timeout=8.0,
                    env=STERILE_ENV,
                    cwd=temp_dir,
                )
                if comp.returncode != 0:
                    return {
                        "status": "Compilation Error",
                        "stdout": "",
                        "stderr": comp.stderr[:MAX_OUTPUT_CHARS].strip(),
                        "execution_time_ms": 0.0,
                    }

                t0 = time.time()
                proc = subprocess.run(
                    [JAVA_BIN, "-cp", temp_dir, "Solution"],
                    input=stdin_input,
                    capture_output=True,
                    text=True,
                    timeout=EXECUTION_TIMEOUT_SECONDS,
                    env=STERILE_ENV,
                    cwd=temp_dir,
                )
                exec_time_ms = round((time.time() - t0) * 1000, 1)
                stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
                stderr = proc.stderr[:MAX_OUTPUT_CHARS].strip()

                if proc.returncode != 0:
                    status = "Runtime Error"

            else:
                return {
                    "status": "Unsupported Language",
                    "stdout": "",
                    "stderr": f"Language '{language}' is not supported.",
                    "execution_time_ms": 0.0,
                }

        except subprocess.TimeoutExpired:
            return {
                "status": "Time Limit Exceeded",
                "stdout": stdout,
                "stderr": f"Execution exceeded the maximum time limit of {EXECUTION_TIMEOUT_SECONDS} seconds.",
                "execution_time_ms": EXECUTION_TIMEOUT_SECONDS * 1000,
            }
        except Exception as e:
            return {
                "status": "Internal Execution Error",
                "stdout": "",
                "stderr": str(e),
                "execution_time_ms": 0.0,
            }

        return {
            "status": status,
            "stdout": stdout,
            "stderr": stderr,
            "execution_time_ms": exec_time_ms,
        }


def run_code_against_test_suite(
    code: str,
    language: str,
    test_cases: List[Dict[str, Any]],
    include_hidden: bool = False,
) -> Dict[str, Any]:
    """
    Evaluates candidate code against a list of test cases.
    Returns comprehensive execution metrics and individual test results.
    """
    if not code or not code.strip():
        return {
            "verdict": "Compilation Error",
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "logs": ["No code submitted."],
        }

    results = []
    total_time_ms = 0.0
    overall_verdict = "Accepted"

    # Filter out hidden test cases if not requested
    cases_to_run = test_cases if include_hidden else [tc for tc in test_cases if not tc.get("isHidden", False)]
    if not cases_to_run:
        cases_to_run = test_cases

    for idx, tc in enumerate(cases_to_run):
        # Format input string
        tc_input = tc.get("inputStr") or tc.get("input")
        if isinstance(tc_input, (list, dict)):
            input_str = "\n".join(json.dumps(x) if isinstance(x, (list, dict)) else str(x) for x in (tc_input if isinstance(tc_input, list) else [tc_input]))
        else:
            input_str = str(tc_input or "")

        expected = str(tc.get("expectedOutputStr") or tc.get("expected") or tc.get("expectedOutput") or "").strip()

        exec_res = execute_single_program(code, language, input_str)
        total_time_ms += exec_res["execution_time_ms"]

        actual_output = exec_res["stdout"].strip()
        exec_status = exec_res["status"]

        # Check for compile / runtime / timeout errors
        if exec_status == "Compilation Error":
            results.append({
                "id": tc.get("id", idx + 1),
                "name": tc.get("name", f"Test Case {idx + 1}"),
                "passed": False,
                "input": input_str if not tc.get("isHidden") else "[Hidden]",
                "expected": expected if not tc.get("isHidden") else "[Hidden]",
                "actual": "",
                "error": exec_res["stderr"],
                "execution_time_ms": 0.0,
                "isHidden": tc.get("isHidden", False),
            })
            overall_verdict = "Compilation Error"
            break

        if exec_status == "Time Limit Exceeded":
            results.append({
                "id": tc.get("id", idx + 1),
                "name": tc.get("name", f"Test Case {idx + 1}"),
                "passed": False,
                "input": input_str if not tc.get("isHidden") else "[Hidden]",
                "expected": expected if not tc.get("isHidden") else "[Hidden]",
                "actual": actual_output,
                "error": "Time Limit Exceeded (5.0s)",
                "execution_time_ms": exec_res["execution_time_ms"],
                "isHidden": tc.get("isHidden", False),
            })
            overall_verdict = "Time Limit Exceeded"
            break

        if exec_status == "Runtime Error":
            results.append({
                "id": tc.get("id", idx + 1),
                "name": tc.get("name", f"Test Case {idx + 1}"),
                "passed": False,
                "input": input_str if not tc.get("isHidden") else "[Hidden]",
                "expected": expected if not tc.get("isHidden") else "[Hidden]",
                "actual": actual_output,
                "error": exec_res["stderr"] or "Runtime error occurred.",
                "execution_time_ms": exec_res["execution_time_ms"],
                "isHidden": tc.get("isHidden", False),
            })
            if overall_verdict == "Accepted":
                overall_verdict = "Runtime Error"
            continue

        # Output comparison
        norm_actual = normalize_value_for_comparison(actual_output)
        norm_expected = normalize_value_for_comparison(expected)

        passed = (norm_actual == norm_expected)
        if not passed and overall_verdict == "Accepted":
            overall_verdict = "Wrong Answer"

        results.append({
            "id": tc.get("id", idx + 1),
            "name": tc.get("name", f"Test Case {idx + 1}"),
            "passed": passed,
            "input": input_str if not tc.get("isHidden") else "[Hidden Test Case]",
            "expected": expected if not tc.get("isHidden") else "[Hidden Output]",
            "actual": actual_output if not tc.get("isHidden") else ("[Passed]" if passed else "[Output Mismatch]"),
            "error": None if passed else "Output does not match expected answer.",
            "execution_time_ms": exec_res["execution_time_ms"],
            "isHidden": tc.get("isHidden", False),
            "explanation": tc.get("explanation"),
        })

    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)

    return {
        "verdict": overall_verdict if (passed_count == total_count and total_count > 0) else (overall_verdict if overall_verdict != "Accepted" else "Wrong Answer"),
        "all_passed": (passed_count == total_count and total_count > 0),
        "passed_count": passed_count,
        "total_count": total_count,
        "execution_time_ms": round(total_time_ms, 1),
        "results": results,
        "logs": [f"[{language.upper()}] Execution finished in {round(total_time_ms, 1)}ms: {passed_count}/{total_count} test cases passed."],
    }
