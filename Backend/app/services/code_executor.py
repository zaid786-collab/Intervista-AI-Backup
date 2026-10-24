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

# Safe execution environment
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
    Wraps solution code with an intelligent, multi-language test invocation harness.
    Separates user print statements (stdout) from actual return values using a sentinel delimiter.
    Supports Solution classes, standalone functions, and direct stdin script executions.
    """
    lang = language.lower()
    clean_input = input_str.strip()
    encoded_input = json.dumps(clean_input)

    # 1. PYTHON EXECUTION HARNESS
    if "python" in lang:
        wrapper = f"""# -*- coding: utf-8 -*-
import sys, os, json, inspect, io

{code}

# --- Intervista AI Dynamic Test Harness ---
if __name__ == "__main__":
    raw_input_str = {encoded_input}
    
    # 1. Discover target callable
    target_func = None
    target_instance = None
    
    # Check if Solution class exists
    if 'Solution' in globals() and isinstance(globals()['Solution'], type):
        try:
            target_instance = globals()['Solution']()
            user_methods = [
                m for m in dir(target_instance) 
                if not m.startswith('_') and callable(getattr(target_instance, m))
            ]
            if user_methods:
                target_func = getattr(target_instance, user_methods[0])
        except Exception:
            pass
            
    # If no Solution method found, look for top-level user functions
    if target_func is None:
        for name, obj in list(globals().items()):
            if (
                callable(obj) 
                and not name.startswith('_') 
                and not inspect.isclass(obj) 
                and getattr(obj, '__module__', None) in (None, '__main__')
                and name not in ('Solution',)
            ):
                target_func = obj
                break

    # 2. Parse input arguments from lines
    lines = [l.strip() for l in raw_input_str.splitlines() if l.strip()]
    parsed_args = []
    for l in lines:
        try:
            parsed_args.append(json.loads(l))
        except Exception:
            parts = l.split()
            if len(parts) > 1 and all(p.lstrip('-').isdigit() for p in parts):
                parsed_args.append([int(p) for p in parts])
            else:
                parsed_args.append(l)

    # 3. If a target function is found, invoke it with appropriate arguments
    if target_func is not None:
        try:
            sig = inspect.signature(target_func)
            params = [
                p for p in sig.parameters.values() 
                if p.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
            ]
            num_params = len(params)
        except Exception:
            num_params = None

        res = None
        called = False

        # Attempt 1: 0 params (reads from sys.stdin)
        if num_params == 0:
            try:
                res = target_func()
                called = True
            except Exception as e:
                raise e

        # Attempt 2: Arity matches parsed lines
        if not called and num_params is not None and len(parsed_args) == num_params:
            try:
                res = target_func(*parsed_args)
                called = True
            except TypeError:
                pass

        # Attempt 3: Single parameter
        if not called and num_params == 1:
            try:
                if len(parsed_args) == 1:
                    res = target_func(parsed_args[0])
                else:
                    res = target_func(parsed_args)
                called = True
            except TypeError:
                pass

        # Attempt 4: Flatten space-separated tokens if needed
        if not called and num_params is not None and num_params > len(parsed_args):
            flat_args = []
            for a in parsed_args:
                if isinstance(a, list):
                    flat_args.extend(a)
                elif isinstance(a, str) and ' ' in a:
                    for token in a.split():
                        try:
                            flat_args.append(json.loads(token))
                        except Exception:
                            flat_args.append(token)
                else:
                    flat_args.append(a)
            if len(flat_args) == num_params:
                try:
                    res = target_func(*flat_args)
                    called = True
                except TypeError:
                    pass

        # Attempt 5: Default call with whatever parsed_args we have
        if not called:
            try:
                res = target_func(*parsed_args)
                called = True
            except Exception:
                if len(parsed_args) == 1:
                    res = target_func(parsed_args[0])
                else:
                    res = target_func()

        # Emit return value with delimiter
        if res is not None:
            if isinstance(res, bool):
                ret_str = "true" if res else "false"
            elif isinstance(res, (list, dict, int, float, str)):
                ret_str = json.dumps(res)
            else:
                ret_str = str(res)
            sys.stdout.write(chr(10) + "__INTERVISTA_RET__:" + ret_str + chr(10))
            sys.stdout.flush()
"""
        return wrapper

    # 2. JAVASCRIPT / NODE.JS EXECUTION HARNESS
    elif "javascript" in lang or "node" in lang or "typescript" in lang:
        wrapper = f"""
{code}

// --- Intervista AI Test Harness ---
(function() {{
    const rawInputStr = {encoded_input};
    const lines = rawInputStr.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);
    const parsedArgs = lines.map(l => {{
        try {{ return JSON.parse(l); }} catch (e) {{
            const parts = l.split(/\\s+/);
            if (parts.length > 1 && parts.every(p => !isNaN(Number(p)))) {{
                return parts.map(Number);
            }}
            return l;
        }}
    }});

    let targetFunc = null;

    try {{
        if (typeof Solution !== "undefined" && typeof Solution === "function") {{
            const targetInst = new Solution();
            const proto = Object.getPrototypeOf(targetInst);
            const methods = Object.getOwnPropertyNames(proto).filter(m => m !== "constructor" && typeof targetInst[m] === "function");
            if (methods.length > 0) {{
                targetFunc = targetInst[methods[0]].bind(targetInst);
            }}
        }}
    }} catch (e) {{}}

    if (!targetFunc) {{
        const candidateNames = [
            "twoSum", "isValid", "maxProfit", "merge", "lengthOfLongestSubstring", 
            "maxSubArray", "search", "climbStairs", "groupAnagrams", "maxArea", 
            "maxClicksInWindow", "solve", "solution"
        ];
        for (const name of candidateNames) {{
            try {{
                const fn = eval(name);
                if (typeof fn === "function") {{
                    targetFunc = fn;
                    break;
                }}
            }} catch (e) {{}}
        }}
    }}

    if (!targetFunc) {{
        // Regex search for functions declared in code
        try {{
            const codeStr = {json.dumps(code)};
            const fnMatches = [...codeStr.matchAll(/(?:function\s+|const\s+|let\s+|var\s+)([a-zA-Z0-9_$]+)/g)].map(m => m[1]);
            for (const name of fnMatches) {{
                try {{
                    const fn = eval(name);
                    if (typeof fn === "function") {{
                        targetFunc = fn;
                        break;
                    }}
                }} catch (e) {{}}
            }}
        }} catch (e) {{}}
    }}

    if (targetFunc) {{
        let res = undefined;
        try {{
            if (targetFunc.length === 0) {{
                res = targetFunc();
            }} else if (parsedArgs.length === targetFunc.length) {{
                res = targetFunc(...parsedArgs);
            }} else if (targetFunc.length === 1 && parsedArgs.length === 1) {{
                res = targetFunc(parsedArgs[0]);
            }} else {{
                res = targetFunc(...parsedArgs);
            }}
        }} catch (err) {{
            console.error(err);
        }}

        if (res !== undefined) {{
            const retStr = typeof res === "object" ? JSON.stringify(res) : String(res);
            process.stdout.write(String.fromCharCode(10) + "__INTERVISTA_RET__:" + retStr + String.fromCharCode(10));
        }}
    }}
}})();
"""
        return wrapper

    # 3. C++ EXECUTION HARNESS
    elif "cpp" in lang or "c++" in lang:
        if "main(" not in code:
            # Append automatic main runner
            harness = f"""
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

int main() {{
    std::string line;
    std::string all_input = {encoded_input};
    
    // Check if class Solution exists
    #ifdef SOLUTION_EXISTS
    Solution sol;
    #endif
    return 0;
}}
"""
            return code
        return code

    # 4. JAVA EXECUTION HARNESS
    elif "java" in lang:
        return code

    return code


def execute_single_program(code: str, language: str, stdin_input: str) -> Dict[str, Any]:
    """
    Compiles (if required) and executes program with stdin input in an isolated temporary directory.
    Separates user stdout from return value delimiter.
    """
    lang = language.lower()

    with tempfile.TemporaryDirectory() as temp_dir:
        raw_stdout = ""
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
                raw_stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
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
                raw_stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
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
                        "user_stdout": "",
                        "return_val": "",
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
                raw_stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
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
                        "user_stdout": "",
                        "return_val": "",
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
                raw_stdout = proc.stdout[:MAX_OUTPUT_CHARS].strip()
                stderr = proc.stderr[:MAX_OUTPUT_CHARS].strip()

                if proc.returncode != 0:
                    status = "Runtime Error"

            else:
                return {
                    "status": "Unsupported Language",
                    "stdout": "",
                    "user_stdout": "",
                    "return_val": "",
                    "stderr": f"Language '{language}' is not supported.",
                    "execution_time_ms": 0.0,
                }

        except subprocess.TimeoutExpired:
            return {
                "status": "Time Limit Exceeded",
                "stdout": raw_stdout,
                "user_stdout": raw_stdout,
                "return_val": "",
                "stderr": f"Execution exceeded the maximum time limit of {EXECUTION_TIMEOUT_SECONDS} seconds.",
                "execution_time_ms": EXECUTION_TIMEOUT_SECONDS * 1000,
            }
        except Exception as e:
            return {
                "status": "Internal Execution Error",
                "stdout": "",
                "user_stdout": "",
                "return_val": "",
                "stderr": str(e),
                "execution_time_ms": 0.0,
            }

        # Parse user stdout vs return value delimiter
        user_stdout = raw_stdout
        return_val = raw_stdout
        if "__INTERVISTA_RET__:" in raw_stdout:
            parts = raw_stdout.rpartition("__INTERVISTA_RET__:")
            user_stdout = parts[0].strip()
            return_val = parts[2].strip()

        return {
            "status": status,
            "stdout": raw_stdout,
            "user_stdout": user_stdout,
            "return_val": return_val,
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
    Returns comprehensive execution metrics, individual test results, user stdout prints,
    and a fully formatted terminal output stream for the IDE terminal.
    """
    if not code or not code.strip():
        return {
            "verdict": "Compilation Error",
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "logs": ["No code submitted."],
            "stdout": "",
            "stderr": "Error: No code submitted in editor.",
            "terminal_output": "intervista-sandbox:~$ run\n[ERROR] No code submitted in editor.",
        }

    results = []
    total_time_ms = 0.0
    overall_verdict = "Accepted"
    all_user_stdouts = []
    first_stderr = ""

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

        actual_output = exec_res["return_val"].strip()
        user_stdout = exec_res["user_stdout"].strip()
        exec_status = exec_res["status"]

        if user_stdout and user_stdout not in all_user_stdouts:
            all_user_stdouts.append(user_stdout)

        if exec_res["stderr"] and not first_stderr:
            first_stderr = exec_res["stderr"]

        # Check for compile / runtime / timeout errors
        if exec_status == "Compilation Error":
            results.append({
                "id": tc.get("id", idx + 1),
                "name": tc.get("name", f"Test Case {idx + 1}"),
                "passed": False,
                "input": input_str if not tc.get("isHidden") else "[Hidden]",
                "expected": expected if not tc.get("isHidden") else "[Hidden]",
                "actual": "",
                "stdout": user_stdout,
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
                "stdout": user_stdout,
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
                "stdout": user_stdout,
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
            "stdout": user_stdout if not tc.get("isHidden") else "",
            "error": None if passed else "Output does not match expected answer.",
            "execution_time_ms": exec_res["execution_time_ms"],
            "isHidden": tc.get("isHidden", False),
            "explanation": tc.get("explanation"),
        })

    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)

    final_verdict = overall_verdict if (passed_count == total_count and total_count > 0) else (overall_verdict if overall_verdict != "Accepted" else "Wrong Answer")

    combined_stdout = "\n".join(all_user_stdouts).strip()

    # Formatted terminal output for pro IDE developer experience
    ext_map = {"python": "py", "javascript": "js", "typescript": "ts", "cpp": "cpp", "java": "java"}
    file_ext = ext_map.get(language.lower(), "py")
    term_lines = [
        f"guest@intervista-box:~$ {language.lower()} solution.{file_ext}",
        f"[*] Executing {total_count} test case(s) against sandboxed runtime...",
    ]

    for idx, r in enumerate(results):
        status_icon = "✔ PASS" if r["passed"] else "✖ FAIL"
        term_lines.append(f"    [{status_icon}] {r['name']} ({r.get('execution_time_ms', 0)}ms)")
        if not r["passed"]:
            if r.get("error") and "Output does not match" not in r["error"]:
                term_lines.append(f"           Error: {r['error']}")
            else:
                term_lines.append(f"           Expected: {r['expected']}")
                term_lines.append(f"           Actual:   {r['actual']}")

    if combined_stdout:
        term_lines.append("\n[Console Output / Stdout]:")
        for line in combined_stdout.splitlines():
            term_lines.append(f"  > {line}")

    if first_stderr:
        term_lines.append("\n[Diagnostics / Stderr]:")
        for line in first_stderr.splitlines():
            term_lines.append(f"  ! {line}")

    term_lines.append(f"\n==================================================")
    term_lines.append(f"Verdict: {final_verdict.upper()} ({passed_count}/{total_count} test cases passed in {round(total_time_ms, 1)}ms)")
    term_lines.append(f"==================================================")

    return {
        "verdict": final_verdict,
        "all_passed": (passed_count == total_count and total_count > 0),
        "passed_count": passed_count,
        "total_count": total_count,
        "execution_time_ms": round(total_time_ms, 1),
        "results": results,
        "logs": [f"[{language.upper()}] Execution finished in {round(total_time_ms, 1)}ms: {passed_count}/{total_count} test cases passed."],
        "stdout": combined_stdout,
        "stderr": first_stderr,
        "terminal_output": "\n".join(term_lines),
    }
