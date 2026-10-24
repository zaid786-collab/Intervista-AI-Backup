import React, { useState, useEffect, useRef } from 'react';
import {
  Code,
  Play,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Terminal,
  FileCode,
  Lightbulb,
  Send,
  RotateCcw,
  Layers,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { apiRunCodingCode, apiSubmitCodingSolution, apiGetCodingHint } from '../utils/api';

/**
 * DeskCodingLaptop
 * The interactive coding environment rendered directly on the desk in ImmersiveInterviewRoom,
 * with full modal expansion to a premier full-screen dark IDE.
 * Fully connected to real sandboxed execution and AI submission evaluation.
 */
export default function DeskCodingLaptop({
  timer = '00:30:00',
  isExpanded = false,
  onToggleExpand,
  style = {},
  currentQuestion = null,
  sessionId = null,
  onInterviewerMessage = null,
  onSubmitSuccess = null,
  onNextQuestion = null,
  isLastQuestion = false,
  targetLanguage = 'python',
}) {
  // Normalize language identifier
  const [selectedLang, setSelectedLang] = useState('python');

  // Multi-language starter templates mapping
  const getDefaultStarter = (langKey, questionObj) => {
    if (questionObj?.starter_templates && questionObj.starter_templates[langKey]) {
      return questionObj.starter_templates[langKey];
    }
    const fnName = questionObj?.function_name || 'solution';
    switch (langKey) {
      case 'javascript':
        return `/**\n * @return {any}\n */\nfunction ${fnName}() {\n    // write your solution here\n    \n}\n`;
      case 'typescript':
        return `function ${fnName}(): any {\n    // write your solution here\n    \n}\n`;
      case 'cpp':
        return `#include <iostream>\n#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    void ${fnName}() {\n        // write your solution here\n    }\n};\n`;
      case 'java':
        return `import java.util.*;\n\nclass Solution {\n    public void ${fnName}() {\n        // write your solution here\n    }\n}\n`;
      case 'python':
      default:
        return `class Solution:\n    def ${fnName}(self):\n        # write your solution here\n        pass\n`;
    }
  };

  // State
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'output' | 'evaluation'
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [runResults, setRunResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeHint, setActiveHint] = useState(null);
  const [hintCount, setHintCount] = useState(0);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);

  // Sync language and starter code when currentQuestion or language changes
  useEffect(() => {
    const langKey = (targetLanguage || 'python').toLowerCase();
    const resolvedLang = ['python', 'javascript', 'typescript', 'cpp', 'java'].includes(langKey)
      ? langKey
      : 'python';
    setSelectedLang(resolvedLang);
    setCode(getDefaultStarter(resolvedLang, currentQuestion));
    setRunResults(null);
    setSubmissionResult(null);
    setActiveHint(null);
    setHintCount(0);
  }, [currentQuestion, targetLanguage]);

  // Handle switching language
  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    const starter = getDefaultStarter(newLang, currentQuestion);
    setCode(starter);
    setRunResults(null);
  };

  // Sample test cases from current question
  const sampleTestCases = currentQuestion?.sample_test_cases || [
    {
      id: 1,
      name: 'Sample 1',
      input: currentQuestion?.examples?.[0]?.input || 'sample',
      expected: currentQuestion?.examples?.[0]?.output || 'output',
      explanation: currentQuestion?.examples?.[0]?.explanation || '',
      isHidden: false,
    },
  ];

  // ─── 1. Run Code against Sample Tests in Sandbox ─────────────────────────
  const handleRunCode = async () => {
    if (!code || !code.trim()) return;
    setIsRunning(true);
    setActiveTab('output');
    try {
      const res = await apiRunCodingCode({
        sessionId: sessionId || 'default_session',
        questionId: currentQuestion?.id || 'q_1',
        code,
        language: selectedLang,
        testCases: sampleTestCases,
      });

      setRunResults(res);
      setExecutionLogs(res?.logs || []);

      if (onInterviewerMessage) {
        if (res?.success) {
          onInterviewerMessage(
            `Your code compiled cleanly and passed all sample test cases in ${res.executionTimeMs}ms. When you are confident, click 'Submit Solution' to evaluate against the hidden test suite.`
          );
        } else if (res?.verdict === 'Compilation Error') {
          onInterviewerMessage(
            `It looks like there's a compilation error in your ${selectedLang.toUpperCase()} code. Check the diagnostics in the execution output.`
          );
        } else {
          onInterviewerMessage(
            `Your code executed, but some test cases produced mismatched outputs (${res?.passedCount || 0}/${res?.totalCount || 0} passed). Check the difference between expected and actual output.`
          );
        }
      }
    } catch (err) {
      console.warn('[DeskCodingLaptop] Execution call error:', err);
      setRunResults({
        success: false,
        verdict: 'Execution Error',
        passedCount: 0,
        totalCount: sampleTestCases.length,
        executionTimeMs: 0,
        results: sampleTestCases.map((tc, idx) => ({
          id: tc.id || idx + 1,
          name: tc.name || `Test Case ${idx + 1}`,
          passed: false,
          input: tc.input || '',
          expected: tc.expected || '',
          actual: '',
          error: err.message || 'Execution service unreachable',
        })),
        logs: [`[ERROR] ${err.message}`],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ─── 2. Submit Solution for Official Server Evaluation ──────────────────
  const handleSubmitSolution = async () => {
    if (!code || !code.trim()) return;
    setIsSubmitting(true);
    setActiveTab('evaluation');
    try {
      const res = await apiSubmitCodingSolution({
        sessionId: sessionId || 'default_session',
        questionId: currentQuestion?.id || 'q_1',
        code,
        language: selectedLang,
      });

      setSubmissionResult(res);

      if (onSubmitSuccess) {
        onSubmitSuccess(res);
      }

      if (onInterviewerMessage && res?.interviewerMessage) {
        onInterviewerMessage(res.interviewerMessage);
      }
    } catch (err) {
      console.warn('[DeskCodingLaptop] Submission error:', err);
      setSubmissionResult({
        success: false,
        verdict: 'Submission Error',
        score: 0,
        passedCount: 0,
        totalCount: sampleTestCases.length,
        allPassed: false,
        interviewerMessage: `We encountered an issue submitting your code: ${err.message}. Please retry.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 3. Ask Interviewer for Progressive Contextual Hint ─────────────────
  const handleGetHint = async () => {
    setIsFetchingHint(true);
    const nextIdx = hintCount + 1;
    try {
      const res = await apiGetCodingHint({
        sessionId: sessionId || 'default_session',
        questionId: currentQuestion?.id || 'q_1',
        code,
        language: selectedLang,
        hintIndex: nextIdx,
      });

      setActiveHint(res?.hint || 'Think about the optimal data structure for O(1) lookups.');
      setHintCount(nextIdx);

      if (onInterviewerMessage && res?.interviewerMessage) {
        onInterviewerMessage(res.interviewerMessage);
      }
    } catch (err) {
      const fallbackHints = currentQuestion?.hints || [];
      const hint = fallbackHints[hintCount % Math.max(1, fallbackHints.length)] ||
        'Consider whether sorting the input or using a hash map can reduce your time complexity.';
      setActiveHint(hint);
      setHintCount(nextIdx);
      if (onInterviewerMessage) {
        onInterviewerMessage(`Here is a hint: ${hint}`);
      }
    } finally {
      setIsFetchingHint(false);
    }
  };

  // Handle Tab key inside editor for proper indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '    ';
      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = e.target.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Helper colors
  const getDifficultyColor = (diff) => {
    const d = (diff || 'medium').toLowerCase();
    if (d === 'easy') return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', border: 'rgba(34, 197, 94, 0.3)' };
    if (d === 'hard') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' };
    return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' };
  };

  const diffStyle = getDifficultyColor(currentQuestion?.difficulty);

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPANDED FULL-SCREEN MODAL IDE VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (isExpanded) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(4, 6, 10, 0.88)',
          backdropFilter: 'blur(24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            width: 'min(1400px, 96vw)',
            height: 'min(880px, 92vh)',
            backgroundColor: '#0A0E17',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(56, 189, 248, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Expanded Top Header */}
          <div
            style={{
              padding: '0.85rem 1.6rem',
              backgroundColor: '#070A12',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Code size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                    {currentQuestion?.title || 'Coding Round Problem'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: diffStyle.bg,
                      color: diffStyle.text,
                      border: `1px solid ${diffStyle.border}`,
                    }}
                  >
                    {currentQuestion?.difficulty || 'Medium'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  AI Technical Interview Round • Live Real-Time Code Execution Sandbox
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Interview Timer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#CBD5E1',
                  fontSize: '0.86rem',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Clock size={15} color="#38BDF8" />
                <span>{timer}</span>
              </div>

              {/* Get Hint Button */}
              <button
                type="button"
                onClick={handleGetHint}
                disabled={isFetchingHint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#FBBF24',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isFetchingHint ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Lightbulb size={14} />
                <span>{isFetchingHint ? 'Thinking...' : `Hint ${hintCount > 0 ? `(${hintCount})` : ''}`}</span>
              </button>

              {/* Dock to Desk (Minimize) */}
              <button
                type="button"
                onClick={onToggleExpand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#E2E8F0',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <Minimize2 size={14} />
                <span>Dock to Desk</span>
              </button>
            </div>
          </div>

          {/* Active Hint Banner if revealed */}
          {activeHint && (
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '0.65rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#FDE68A',
                fontSize: '0.84rem',
              }}
            >
              <Sparkles size={16} color="#FBBF24" style={{ flexShrink: 0 }} />
              <div>
                <strong>Interviewer Guidance:</strong> {activeHint}
              </div>
            </div>
          )}

          {/* Main 2-Column Split: Spec vs Editor */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Column: Problem Specification */}
            <div
              style={{
                width: '42%',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.6rem',
                overflowY: 'auto',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                color: '#CBD5E1',
                backgroundColor: '#080C14',
              }}
            >
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {currentQuestion?.title || 'Two Sum'}
              </div>

              {/* Topics Pills */}
              {currentQuestion?.topics && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                  {currentQuestion.topics.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        color: '#94A3B8',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Problem Statement */}
              <div style={{ whiteSpace: 'pre-line', marginBottom: '1.25rem', color: '#E2E8F0' }}>
                {currentQuestion?.description || 'Given an array of integers, implement the optimal algorithm.'}
              </div>

              {/* Examples */}
              {currentQuestion?.examples?.map((ex, idx) => (
                <div key={idx} style={{ marginBottom: '1.1rem' }}>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                    Example {idx + 1}:
                  </div>
                  <pre
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: '#E2E8F0',
                      fontFamily: '"Fira Code", monospace',
                      margin: 0,
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <strong>Input:</strong> {ex.input}{'\n'}
                    <strong>Output:</strong> {ex.output}
                    {ex.explanation ? `\nExplanation: ${ex.explanation}` : ''}
                  </pre>
                </div>
              ))}

              {/* Constraints */}
              {currentQuestion?.constraints && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.84rem', marginBottom: '0.4rem' }}>
                    Constraints & Complexity:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                    {currentQuestion.constraints.map((c, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{c}</li>
                    ))}
                    {currentQuestion?.time_complexity && (
                      <li style={{ color: '#38BDF8' }}>
                        Expected Time: {currentQuestion.time_complexity}
                      </li>
                    )}
                    {currentQuestion?.space_complexity && (
                      <li style={{ color: '#38BDF8' }}>
                        Expected Space: {currentQuestion.space_complexity}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Code Editor & Execution Console */}
            <div style={{ width: '58%', display: 'flex', flexDirection: 'column', backgroundColor: '#090D16' }}>
              {/* Editor Language & Action Bar */}
              <div
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: '#0B0F1A',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileCode size={15} color="#38BDF8" />
                  {/* Language Selector Dropdown */}
                  <select
                    value={selectedLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="cpp">C++ (G++ / STL)</option>
                    <option value="java">Java (OpenJDK)</option>
                  </select>
                </div>

                {/* Reset Code Button */}
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  title="Reset to starter template"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset Template</span>
                </button>
              </div>

              {/* Code Editor Area */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck="false"
                  placeholder="Write your solution here..."
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0A0E17',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    color: '#F1F5F9',
                    fontFamily: '"Fira Code", "Courier New", monospace',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    padding: '1.25rem',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre',
                  }}
                />
              </div>

              {/* Bottom Test / Output / Evaluation Tabs Panel */}
              <div
                style={{
                  height: '240px',
                  backgroundColor: '#060910',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Panel Navigation Tabs */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: '#070B13',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tests')}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '6px',
                        backgroundColor: activeTab === 'tests' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: activeTab === 'tests' ? '#38BDF8' : '#94A3B8',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sample Test Cases ({sampleTestCases.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('output')}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '6px',
                        backgroundColor: activeTab === 'output' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: activeTab === 'output' ? '#38BDF8' : '#94A3B8',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Execution Output {runResults ? `(${runResults.passedCount}/${runResults.totalCount} Passed)` : ''}
                    </button>
                    {submissionResult && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('evaluation')}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '6px',
                          backgroundColor: activeTab === 'evaluation' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                          color: activeTab === 'evaluation' ? '#4ADE80' : '#94A3B8',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        AI Evaluation ({submissionResult.verdict})
                      </button>
                    )}
                  </div>

                  {/* Actions: Run Code & Submit Solution */}
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '7px',
                        padding: '0.45rem 1rem',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isRunning ? (
                        <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Play size={13} fill="#FFFFFF" />
                      )}
                      <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitSolution}
                      disabled={isSubmitting || isRunning}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#0284C7',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '0.45rem 1.15rem',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.45)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSubmitting ? (
                        <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Send size={13} />
                      )}
                      <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content Display */}
                <div style={{ flex: 1, padding: '0.85rem 1.25rem', overflowY: 'auto', fontSize: '0.82rem' }}>
                  {/* TAB 1: Sample Tests Selection */}
                  {activeTab === 'tests' && (
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        {sampleTestCases.map((tc, idx) => (
                          <button
                            key={tc.id || idx}
                            type="button"
                            onClick={() => setActiveTestCaseIdx(idx)}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              backgroundColor: activeTestCaseIdx === idx ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              border: activeTestCaseIdx === idx ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: activeTestCaseIdx === idx ? '#38BDF8' : '#94A3B8',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                            }}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {sampleTestCases[activeTestCaseIdx] && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <div style={{ color: '#64748B', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Input:</div>
                            <pre style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '0.5rem 0.75rem', borderRadius: '6px', margin: 0, color: '#E2E8F0', fontFamily: 'monospace' }}>
                              {sampleTestCases[activeTestCaseIdx].input}
                            </pre>
                          </div>
                          <div>
                            <div style={{ color: '#64748B', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Expected Output:</div>
                            <pre style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '0.5rem 0.75rem', borderRadius: '6px', margin: 0, color: '#4ADE80', fontFamily: 'monospace' }}>
                              {sampleTestCases[activeTestCaseIdx].expected}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Execution Output Console */}
                  {activeTab === 'output' && (
                    <div>
                      {!runResults ? (
                        <div style={{ color: '#64748B', textAlign: 'center', paddingTop: '1.5rem' }}>
                          Click &quot;Run Code&quot; to execute your solution against the sample test suite in the local sandbox.
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {runResults.success ? (
                                <span style={{ color: '#4ADE80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <CheckCircle2 size={16} /> Accepted
                                </span>
                              ) : (
                                <span style={{ color: '#F87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <XCircle size={16} /> {runResults.verdict}
                                </span>
                              )}
                              <span style={{ color: '#64748B', fontSize: '0.78rem' }}>
                                ({runResults.passedCount}/{runResults.totalCount} Test Cases Passed • {runResults.executionTimeMs}ms)
                              </span>
                            </div>
                          </div>

                          {/* Individual results breakdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {runResults.results?.map((r, i) => (
                              <div
                                key={r.id || i}
                                style={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                  border: r.passed ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                                  borderRadius: '6px',
                                  padding: '0.45rem 0.75rem',
                                  fontSize: '0.78rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={{ color: r.passed ? '#4ADE80' : '#F87171' }}>
                                  {r.passed ? '✓' : '✗'} {r.name}
                                </span>
                                <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                                  Actual: {r.actual || r.error || 'N/A'} (Expected: {r.expected})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Post-Submission AI Evaluation */}
                  {activeTab === 'evaluation' && submissionResult && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: submissionResult.allPassed ? '#4ADE80' : '#F87171',
                            }}
                          >
                            {submissionResult.verdict}
                          </span>
                          <span style={{ color: '#CBD5E1', fontSize: '0.82rem' }}>
                            Score: <strong>{submissionResult.score}/100</strong> ({submissionResult.passedCount}/{submissionResult.totalCount} passed)
                          </span>
                          <span style={{ color: '#38BDF8', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                            Time: {submissionResult.timeComplexity} • Space: {submissionResult.spaceComplexity}
                          </span>
                        </div>

                        {onNextQuestion && (
                          <button
                            type="button"
                            onClick={onNextQuestion}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid #38BDF8',
                              borderRadius: '6px',
                              padding: '0.3rem 0.8rem',
                              color: '#38BDF8',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <span>{isLastQuestion ? 'Finalize Interview' : 'Next Question'}</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>

                      <div style={{ color: '#E2E8F0', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                        {submissionResult.interviewerMessage}
                      </div>

                      {submissionResult.strengths?.length > 0 && (
                        <div style={{ color: '#4ADE80', fontSize: '0.76rem', marginTop: '0.3rem' }}>
                          • <strong>Strengths:</strong> {submissionResult.strengths.join(' ')}
                        </div>
                      )}
                      {submissionResult.improvements?.length > 0 && (
                        <div style={{ color: '#FBBF24', fontSize: '0.76rem', marginTop: '0.2rem' }}>
                          • <strong>Improvements:</strong> {submissionResult.improvements.join(' ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal to Reset Code */}
        {confirmResetOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '400px',
                color: '#FFFFFF',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>Reset to Starter Template?</h4>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.84rem', color: '#94A3B8' }}>
                Your current code changes will be lost and restored to the default clean template for {selectedLang.toUpperCase()}.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#CBD5E1',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCode(getDefaultStarter(selectedLang, currentQuestion));
                    setConfirmResetOpen(false);
                  }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCKED PERSPECTIVE LAPTOP ON DESK (IN FIRST-PERSON ROOM)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        position: 'absolute',
        right: 'clamp(1rem, 3.5vw, 3.8rem)',
        bottom: 'clamp(3.5rem, 7.5vh, 6.5rem)',
        zIndex: 17,
        width: 'clamp(320px, 34vw, 480px)',
        height: 'clamp(210px, 22vw, 310px)',
        perspective: '1200px',
        ...style,
      }}
    >
      {/* Laptop Outer Frame */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0A0E18',
          borderRadius: '12px 12px 2px 2px',
          border: '2px solid #5A6578',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Laptop Header Bar */}
        <div
          style={{
            backgroundColor: '#060910',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.35rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#38BDF8',
                boxShadow: '0 0 6px #38BDF8',
              }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#38BDF8',
                textTransform: 'uppercase',
              }}
            >
              LIVE CODING ROUND
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Clock size={11} color="#38BDF8" />
              {timer}
            </span>

            <button
              type="button"
              onClick={onToggleExpand}
              title="Expand to Full IDE"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                padding: '0.15rem 0.35rem',
                color: '#E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Maximize2 size={11} />
            </button>
          </div>
        </div>

        {/* Laptop Screen Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#070B13' }}>
          {/* Left: Problem statement summary */}
          <div
            style={{
              width: '46%',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '0.45rem 0.55rem',
              overflowY: 'hidden',
              fontSize: '0.62rem',
              lineHeight: 1.35,
              color: '#94A3B8',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
              {currentQuestion?.title || 'Two Sum'}
            </div>
            <div style={{ color: '#CBD5E1', marginBottom: '0.35rem', fontSize: '0.6rem' }}>
              {currentQuestion?.description
                ? currentQuestion.description.substring(0, 110) + '...'
                : 'Given an array of integers, solve the algorithmic challenge.'}
            </div>
            {currentQuestion?.examples?.[0] && (
              <>
                <div style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.58rem' }}>Example:</div>
                <div style={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.54rem' }}>
                  Input: {currentQuestion.examples[0].input}{'\n'}
                  Output: {currentQuestion.examples[0].output}
                </div>
              </>
            )}
          </div>

          {/* Right: Code Editor view */}
          <div
            style={{
              width: '54%',
              padding: '0.45rem 0.55rem',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#05080E',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem',
                fontSize: '0.56rem',
                color: '#64748B',
                fontFamily: 'monospace',
              }}
            >
              <span>{selectedLang.toUpperCase()} ▾</span>
              <span>solution.{selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : selectedLang === 'java' ? 'java' : 'js'}</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: '#38BDF8',
                fontFamily: '"Fira Code", monospace',
                fontSize: '0.58rem',
                lineHeight: 1.35,
                margin: 0,
                padding: 0,
                whiteSpace: 'pre',
              }}
            />
          </div>
        </div>

        {/* Laptop Screen Footer */}
        <div
          style={{
            backgroundColor: '#05070D',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.35rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.58rem' }}>
            {runResults ? (
              <span style={{ color: runResults.success ? '#4ADE80' : '#F87171' }}>
                {runResults.success ? '✓' : '✗'} {runResults.verdict} ({runResults.passedCount}/{runResults.totalCount})
              </span>
            ) : (
              <span style={{ color: '#64748B' }}>Ready to run</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: '#0284C7',
                border: 'none',
                borderRadius: '5px',
                padding: '0.25rem 0.65rem',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.62rem',
                cursor: isRunning ? 'not-allowed' : 'pointer',
              }}
            >
              {isRunning ? (
                <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Play size={10} fill="#FFFFFF" />
              )}
              <span>Run Code</span>
            </button>

            <button
              type="button"
              onClick={onToggleExpand}
              title="Expand for full IDE & Submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '5px',
                padding: '0.25rem 0.5rem',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                cursor: 'pointer',
              }}
            >
              <Maximize2 size={10} />
              <span>Expand</span>
            </button>
          </div>
        </div>

        {/* Laptop Base Hinge */}
        <div style={{ height: '4px', backgroundColor: '#334155', borderTop: '1px solid #64748B' }} />
      </div>

      {/* Silver Laptop Bottom Base (Perspective Projection) */}
      <div
        style={{
          width: '106%',
          height: '14px',
          marginLeft: '-3%',
          backgroundColor: '#94A3B8',
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '42px', height: '3px', backgroundColor: '#64748B', borderRadius: '2px' }} />
      </div>
    </div>
  );
}
