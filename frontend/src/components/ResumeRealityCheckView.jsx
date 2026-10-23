import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Layers,
  Cpu,
  RefreshCw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { apiResumeRealityCheck } from '../utils/api';

const SAMPLE_RESUME_TEXT = `Full Stack Software Engineer
Projects:
1. Distributed E-Commerce Microservices & Real-Time Order Stream
- Architected and deployed an e-commerce platform using React, Node.js, Express, MongoDB, and Redis.
- Implemented JWT authentication, role-based access control, and asynchronous order event processing.
- Scaled Docker container instances to handle 15,000 peak requests per minute with Redis cache-aside invalidation.

2. Collaborative Real-Time Code Workspace
- Built collaborative document editor using React, TypeScript, WebSockets, and PostgreSQL.
- Handled operational transforms and concurrent conflict resolution across distributed browser clients.`;

export default function ResumeRealityCheckView({ onStartInterview }) {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [loading, setLoading] = useState(false);
  const [realityResult, setRealityResult] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  const handleRunRealityCheck = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await apiResumeRealityCheck({
        resumeText,
        targetRole,
        targetCompany,
      });
      setRealityResult(res);
    } catch (err) {
      console.warn('Reality check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.12) 0%, rgba(18, 18, 18, 0.95) 100%)',
          border: '1px solid rgba(217, 183, 122, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '100px', background: 'rgba(217, 183, 122, 0.15)', border: '1px solid rgba(217, 183, 122, 0.3)', marginBottom: '0.85rem' }}>
          <FileText size={15} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
            PROJECT INTERROGATION ENGINE
          </span>
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
          Resume-to-Interview Reality Check
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '720px', margin: 0 }}>
          Transform your resume into a rigorous technical interrogation. The Reality Check analyzes your stated projects, libraries, and architecture decisions, surfaces the exact deep-dive questions top interviewers will ask, and flags superficial claims before an actual interview.
        </p>
      </div>

      {/* Input Section */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Paste Resume or Project Descriptions
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setResumeText(SAMPLE_RESUME_TEXT)}
              style={{
                fontSize: '0.8rem',
                color: 'var(--accent-gold)',
                background: 'rgba(217, 183, 122, 0.1)',
                border: '1px solid rgba(217, 183, 122, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Load Sample React/Node/MongoDB Resume
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume bullet points, project descriptions, and technical stack here..."
          style={{
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            padding: '1rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Target Role</span>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Target Company</span>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleRunRealityCheck}
            disabled={loading || !resumeText.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-gold)',
              color: '#080808',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 18px rgba(217, 183, 122, 0.3)',
            }}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
            <span>{loading ? 'Interrogating Architecture...' : 'Run Reality Check'}</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {realityResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Extracted Projects & Tech Stack */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Extracted Projects ({realityResult.extracted_projects.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {realityResult.extracted_projects.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={15} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Identified Tech Stack
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {realityResult.identified_tech_stack.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      background: 'rgba(217, 183, 122, 0.12)',
                      border: '1px solid rgba(217, 183, 122, 0.25)',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Incomplete Areas / Superficial Claims Alert */}
          {realityResult.incomplete_areas && realityResult.incomplete_areas.length > 0 && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', fontWeight: 700, fontSize: '0.92rem' }}>
                <AlertCircle size={17} />
                <span>Areas Where Understanding Appears Incomplete (Reality Check Flags)</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {realityResult.incomplete_areas.map((inc, idx) => (
                  <li key={idx}>{inc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Project Architecture Deep-Dive Questions (The 6 Blueprint Questions) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Project Architecture Interrogation Questions ({realityResult.project_deep_dive_questions.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Targeting: {realityResult.extracted_projects[0]?.title}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {realityResult.project_deep_dive_questions.map((q, idx) => {
                const isExpanded = expandedQuestion === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: isExpanded ? '1px solid rgba(217, 183, 122, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '1.15rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        background: isExpanded ? 'rgba(217, 183, 122, 0.06)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                          {q.dimension}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                          {q.question}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="var(--accent-gold)" /> : <ChevronDown size={18} />}
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Why Top Interviewers Ask This:
                          </span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
                            {q.why_it_matters}
                          </p>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                            Expected Technical Talking Points:
                          </span>
                          <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {q.expected_talking_points.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Concepts to Revise Before Actual Interview */}
          {realityResult.revision_concepts && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                <BookOpen size={18} />
                <span>Mandatory Concepts to Revise Before Your Live Round</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {realityResult.revision_concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <CheckCircle2 size={15} color="#10B981" />
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Launch Resume-Based Mock Interview Button */}
          <div
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.15) 0%, rgba(18, 18, 18, 0.95) 100%)',
              border: '1px solid rgba(217, 183, 122, 0.4)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Ready to practice your resume answers?
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Launch a 3D AI mock interview session where the interviewer will interrogate your actual resume projects.
              </p>
            </div>

            <button
              onClick={() => onStartInterview && onStartInterview(targetRole)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.75rem',
                background: 'var(--accent-gold)',
                color: '#080808',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(217, 183, 122, 0.35)',
              }}
            >
              <Play size={16} fill="#080808" />
              <span>Launch Resume Reality Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
