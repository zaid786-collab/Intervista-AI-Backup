import React, { useState } from 'react';
import {
  Compass,
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Award,
  RefreshCw,
  Play,
  FileText,
} from 'lucide-react';
import { apiCareerReadinessMap } from '../utils/api';

const SAMPLE_SDE_JD = `Software Development Engineer (SDE) Intern — Tech Systems
Responsibilities:
- Design, implement, and maintain high-performance software modules in C++.
- Apply Data Structures and Algorithms (DSA) to solve complex computational problems.
- Collaborate on database management systems (DBMS) schema design, query optimization, and transaction management.
- Understand Operating Systems fundamentals, process scheduling, multithreading, and memory allocation.
- Demonstrate strong problem-solving and clean code discipline.`;

export default function CareerReadinessMapView({ onStartInterview }) {
  const [jobDescription, setJobDescription] = useState(SAMPLE_SDE_JD);
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [targetCompany, setTargetCompany] = useState('Tech Systems');
  const [loading, setLoading] = useState(false);
  const [readinessData, setReadinessData] = useState(null);
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix', 'roadmap', 'questions'

  const handleCalculateReadiness = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      const res = await apiCareerReadinessMap({
        jobDescription,
        targetRole,
        targetCompany,
      });
      setReadinessData(res);
    } catch (err) {
      console.warn('Failed to calculate career readiness:', err);
    } finally {
      setLoading(false);
    }
  };

  const readinessScore = readinessData?.readiness_score || 68;
  const breakdown = readinessData?.evidence_breakdown;
  const matrix = readinessData?.skill_gap_matrix || [];
  const roadmap = readinessData?.personalized_7day_roadmap || [];
  const questions = readinessData?.tailored_mock_questions || [];

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
          <Compass size={15} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
            ROLE-TARGETED PREPARATION ENGINE
          </span>
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
          Job Description to Career Readiness Map
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '720px', margin: 0 }}>
          Prepare strategically for the exact roles you want. Paste any Job Description to extract mandatory competencies, compare against your demonstrated Interview DNA, compute your Interview Readiness Score, and follow a personalized 7-day preparation roadmap.
        </p>
      </div>

      {/* JD Input Section */}
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
            Paste Target Job Description (JD)
          </div>
          <button
            onClick={() => {
              setJobDescription(SAMPLE_SDE_JD);
              setTargetRole('Software Development Engineer');
              setTargetCompany('Tech Systems');
            }}
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
            Load Sample SDE Intern JD (C++, DSA, DBMS, OS)
          </button>
        </div>

        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description or key technical requirements here..."
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Company Name</span>
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
            onClick={handleCalculateReadiness}
            disabled={loading || !jobDescription.trim()}
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
            {loading ? <RefreshCw size={16} className="spin" /> : <Target size={16} />}
            <span>{loading ? 'Mapping JD Requirements...' : 'Generate Career Readiness Map'}</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {readinessData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Readiness Score Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.14) 0%, rgba(18, 18, 18, 0.98) 100%)',
              border: '1px solid rgba(217, 183, 122, 0.35)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Interview Readiness Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
                  {readinessScore}
                </span>
                <span style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10B981', marginTop: '0.5rem' }}>
                {readinessData.readiness_tier}
              </div>
            </div>

            {/* Evidence Breakdown Grid */}
            {breakdown && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Resume Alignment</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{breakdown.resume_alignment_score}%</span>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Interview DNA Demonstrated</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{breakdown.demonstrated_interview_score}%</span>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#F87171', display: 'block' }}>Gap Penalty</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F87171' }}>-{breakdown.gap_penalty}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            {[
              { key: 'matrix', label: 'Competency Match Matrix', icon: Target },
              { key: 'roadmap', label: '7-Day Personalized Study Plan', icon: Calendar },
              { key: 'questions', label: 'Role-Specific Mock Questions', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '8px',
                    background: active ? 'rgba(217, 183, 122, 0.12)' : 'transparent',
                    border: active ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid transparent',
                    color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Competency Match Matrix */}
          {activeTab === 'matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ color: '#10B981', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Demonstrated JD Strengths ({readinessData.matched_competencies?.length || 0})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {readinessData.matched_competencies?.join(', ') || 'C++ & OOP'}
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ color: '#F87171', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Critical Skill Gaps ({readinessData.critical_missing_competencies?.length || 0})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {readinessData.critical_missing_competencies?.join(', ') || 'DSA Problem-Solving, Operating Systems'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matrix.map((item, idx) => {
                  const statusColors = {
                    'Strong Match': { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
                    'Partial Match': { color: '#60A5FA', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
                    'Skill Gap': { color: '#F87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
                    Satisfactory: { color: 'var(--accent-gold)', bg: 'rgba(217, 183, 122, 0.12)', border: 'rgba(217, 183, 122, 0.3)' },
                  }[item.match_status] || { color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ maxWidth: '520px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {item.competency}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {item.evidence}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Demonstrated Level</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.demonstrated_proficiency}%</span>
                        </div>
                        <span
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '100px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: statusColors.color,
                            backgroundColor: statusColors.bg,
                            border: `1px solid ${statusColors.border}`,
                            minWidth: '105px',
                            textAlign: 'center',
                          }}
                        >
                          {item.match_status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: 7-Day Personalized Study Roadmap */}
          {activeTab === 'roadmap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {roadmap.map((dayPlan, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.85rem',
                      background: 'rgba(217, 183, 122, 0.15)',
                      border: '1px solid rgba(217, 183, 122, 0.35)',
                      borderRadius: '8px',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {dayPlan.day}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {dayPlan.theme}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      {dayPlan.focus}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: '#10B981', fontWeight: 500 }}>
                      <CheckCircle2 size={14} />
                      <span>Deliverable: {dayPlan.deliverable}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Tailored Mock Interview Questions */}
          {activeTab === 'questions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'rgba(217, 183, 122, 0.15)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {q}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legal Disclaimer */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong>Disclaimer:</strong> {readinessData.disclaimer}
          </div>

          {/* 1-Click Launch Role Simulation */}
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
                Start Targeted Mock Interview for {targetRole}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Practice questions matching this exact JD with real-time adaptive feedback and scoring.
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
              <span>Launch Targeted Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
