import React, { useState } from 'react';
import {
  Code,
  Play,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Terminal,
  FileCode
} from 'lucide-react';

/**
 * DeskCodingLaptop
 * Renders the silver coding laptop directly on the executive desk as seen in the reference image.
 * Features:
 * - "LIVE CODING ROUND" header with countdown/elapsed timer (e.g. 00:44:27)
 * - Two Sum problem specification, examples, and constraints
 * - Interactive Python 3 code editor with editable code
 * - Live "Run Code" execution with passing test cases
 * - Modal expansion toggle (so candidate can code either on-desk or full-screen)
 */
export default function DeskCodingLaptop({
  timer = '00:44:27',
  isExpanded = false,
  onToggleExpand,
  style = {}
}) {
  const [selectedLang, setSelectedLang] = useState('Python3');
  const [code, setCode] = useState(
`class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # write your code here
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`
  );

  const [isRunning, setIsRunning] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState(1);
  const [testResult, setTestResult] = useState({
    status: 'Ready to run',
    passed: true,
    runtime: '38ms',
    output: '[0, 1]'
  });

  const handleRunCode = () => {
    setIsRunning(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setTestResult({
        status: 'Accepted',
        passed: true,
        runtime: `${Math.floor(Math.random() * 20 + 25)}ms`,
        output: activeTestCase === 1 ? '[0, 1]' : activeTestCase === 2 ? '[1, 2]' : '[0, 1]'
      });
    }, 700);
  };

  // If rendered as the full expanded modal
  if (isExpanded) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(5, 7, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            width: 'min(1200px, 95vw)',
            height: 'min(820px, 90vh)',
            backgroundColor: '#0D131F',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Laptop Expanded Top Bar */}
          <div
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#090D15',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Code size={16} />
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.08em', color: '#FFFFFF' }}>
                LIVE CODING ROUND — TWO SUM
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              >
                <Clock size={15} color="#38BDF8" />
                <span>{timer}</span>
              </div>
              <button
                type="button"
                onClick={onToggleExpand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#E2E8F0',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                <Minimize2 size={14} />
                <span>Dock to Desk</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Code & Spec View */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Column: Problem Statement */}
            <div
              style={{
                width: '42%',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.5rem',
                overflowY: 'auto',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: '#CBD5E1',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Two Sum
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ADE80',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                Easy
              </div>
              <p style={{ margin: '0 0 1rem 0' }}>
                Given an array of integers <code style={{ color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>nums</code> and an integer <code style={{ color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>target</code>, return <em>indices of the two numbers such that they add up to target</em>.
              </p>
              <p style={{ margin: '0 0 1rem 0', color: '#94A3B8', fontSize: '0.82rem' }}>
                You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.
              </p>

              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '1.2rem', marginBottom: '0.4rem' }}>
                Example 1:
              </div>
              <pre
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#E2E8F0',
                  fontFamily: 'monospace',
                  margin: 0,
                }}
              >
                <strong>Input:</strong> nums = [2,7,11,15], target = 9{'\n'}
                <strong>Output:</strong> [0,1]{'\n'}
                <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
              </pre>

              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '1rem', marginBottom: '0.4rem' }}>
                Example 2:
              </div>
              <pre
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#E2E8F0',
                  fontFamily: 'monospace',
                  margin: 0,
                }}
              >
                <strong>Input:</strong> nums = [3,2,4], target = 6{'\n'}
                <strong>Output:</strong> [1,2]
              </pre>

              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '1rem', marginBottom: '0.4rem' }}>
                Constraints:
              </div>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                <li>2 &le; nums.length &le; 10<sup>4</sup></li>
                <li>-10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></li>
                <li>-10<sup>9</sup> &le; target &le; 10<sup>9</sup></li>
                <li>Only one valid answer exists.</li>
              </ul>
            </div>

            {/* Right Column: Code Editor & Test Runner */}
            <div style={{ width: '58%', display: 'flex', flexDirection: 'column' }}>
              {/* Editor Header */}
              <div
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0B0F18',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCode size={14} color="#38BDF8" />
                  <span style={{ fontSize: '0.8rem', color: '#E2E8F0', fontFamily: 'monospace' }}>solution.py</span>
                </div>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Python3">Python3</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
              </div>

              {/* Editable Code Textarea */}
              <div style={{ flex: 1, position: 'relative', backgroundColor: '#0A0E17' }}>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    color: '#E2E8F0',
                    fontFamily: '"Fira Code", monospace, "Courier New"',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    padding: '1rem',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre',
                  }}
                />
              </div>

              {/* Bottom Test Runner & Execution Bar */}
              <div
                style={{
                  backgroundColor: '#070A10',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[1, 2, 3].map((tc) => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => setActiveTestCase(tc)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: activeTestCase === tc ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: activeTestCase === tc ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: activeTestCase === tc ? '#38BDF8' : '#94A3B8',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Case {tc}
                      </button>
                    ))}
                  </div>

                  {testResult && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4ADE80', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={14} />
                      <span>{testResult.status} ({testResult.runtime})</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: '#0284C7',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.45)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isRunning ? (
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Play size={14} fill="#FFFFFF" />
                  )}
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Docked Perspective Laptop Directly on Desk ───
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
      {/* Laptop Chassis Outer Frame (Silver Metallic MacBook Style) */}
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
        {/* Laptop Screen Header Bar */}
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
          {/* Left Title: LIVE CODING ROUND */}
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

          {/* Right Timer & Maximize Action */}
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
              title="Expand Code Editor"
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

        {/* Laptop Screen Body: Problem Statement & Python Code Editor */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#070B13' }}>
          {/* Left half: Two Sum problem text */}
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
              Two Sum
            </div>
            <div style={{ color: '#CBD5E1', marginBottom: '0.35rem', fontSize: '0.6rem' }}>
              Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
            </div>
            <div style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.58rem' }}>
              Example 1:
            </div>
            <div style={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.54rem' }}>
              Input: nums = [2,7,11,15], target = 9{'\n'}
              Output: [0,1]
            </div>
            <div style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.58rem', marginTop: '0.25rem' }}>
              Constraints:
            </div>
            <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.52rem' }}>
              • 2 &le; nums.length &le; 10⁴{'\n'}
              • -10⁹ &le; nums[i] &le; 10⁹
            </div>
          </div>

          {/* Right half: Python Code Editor */}
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
              <span>Python3 ▾</span>
              <span>solution.py</span>
            </div>

            <pre
              style={{
                flex: 1,
                margin: 0,
                fontSize: '0.56rem',
                fontFamily: '"Fira Code", monospace',
                lineHeight: 1.35,
                color: '#38BDF8',
                overflow: 'hidden',
                whiteSpace: 'pre',
              }}
            >
              <span style={{ color: '#F472B6' }}>class</span> <span style={{ color: '#FBBF24' }}>Solution</span>:{'\n'}
              {'  '}<span style={{ color: '#F472B6' }}>def</span> <span style={{ color: '#60A5FA' }}>twoSum</span>(self, nums, target):{'\n'}
              {'    '}<span style={{ color: '#64748B' }}># write your code here</span>{'\n'}
              {'    '}seen = {'{}'}{'\n'}
              {'    '}<span style={{ color: '#F472B6' }}>for</span> i, n <span style={{ color: '#F472B6' }}>in</span> enumerate(nums):{'\n'}
              {'      '}<span style={{ color: '#F472B6' }}>if</span> target - n <span style={{ color: '#F472B6' }}>in</span> seen:{'\n'}
              {'        '}<span style={{ color: '#F472B6' }}>return</span> [seen[target - n], i]{'\n'}
              {'      '}seen[n] = i
            </pre>
          </div>
        </div>

        {/* Laptop Screen Footer Bar: Test cases & Run Code Button */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.56rem' }}>
            <span style={{ color: '#38BDF8', fontWeight: 600 }}>Test Case 1</span>
            <span style={{ color: '#64748B', fontFamily: 'monospace' }}>nums = [2,7,11,15], target = 9</span>
          </div>

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
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)',
            }}
          >
            {isRunning ? (
              <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Play size={10} fill="#FFFFFF" />
            )}
            <span>{isRunning ? 'Running' : 'Run Code'}</span>
          </button>
        </div>

        {/* Laptop Base / Keyboard Hinge illusion */}
        <div
          style={{
            height: '4px',
            backgroundColor: '#334155',
            borderTop: '1px solid #64748B',
          }}
        />
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
        {/* Trackpad notch */}
        <div
          style={{
            width: '42px',
            height: '3px',
            backgroundColor: '#64748B',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
}
