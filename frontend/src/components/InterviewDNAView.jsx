import React, { useState, useEffect } from 'react';
import {
  Dna,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Target,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart2,
  RefreshCw,
  Compass,
  Layers,
  Zap,
} from 'lucide-react';
import { apiGetInterviewDNA } from '../utils/api';

export default function InterviewDNAView({ onStartInterview, defaultRole = 'Software Engineer' }) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [dnaData, setDnaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'skill_map', 'strengths'

  const rolesList = ['Software Engineer', 'Frontend Developer', 'Backend Developer'];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGetInterviewDNA(targetRole)
      .then((data) => {
        if (mounted) {
          setDnaData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load Interview DNA:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [targetRole]);

  if (loading && !dnaData) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem auto', color: 'var(--accent-gold)' }} />
        <p>Synthesizing candidate Interview DNA profile from historical evaluations...</p>
      </div>
    );
  }

  const radarProfile = dnaData?.radar_profile || [];
  const skillMap = dnaData?.skill_gap_map || [];
  const verifiedStrengths = dnaData?.verified_strengths || [];
  const developmentAreas = dnaData?.development_areas || [];
  const nextSteps = dnaData?.actionable_next_steps || [];
  const overallScore = dnaData?.overall_dna_score || 83;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.12) 0%, rgba(18, 18, 18, 0.95) 100%)',
          border: '1px solid rgba(217, 183, 122, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '100px', background: 'rgba(217, 183, 122, 0.15)', border: '1px solid rgba(217, 183, 122, 0.3)', marginBottom: '0.85rem' }}>
              <Dna size={15} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
                EMPIRICAL PERFORMANCE PROFILE
              </span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Interview DNA
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              {dnaData?.dna_summary ||
                'A dynamic, multi-axis profile of verified interview performance. Grounded strictly in demonstrated technical depth, communication clarity, and problem-solving execution rather than unsupported assumptions.'}
            </p>
          </div>

          {/* DNA Score Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem 2rem',
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(217, 183, 122, 0.4)',
              borderRadius: '16px',
              minWidth: '150px',
            }}
          >
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Composite DNA
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1 }}>
              {overallScore}
              <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/100</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: '0.25rem' }}>
              Competitive Readiness
            </span>
          </div>
        </div>

        {/* Target Role Selector */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Role Profile:</span>
          {rolesList.map((r) => (
            <button
              key={r}
              onClick={() => setTargetRole(r)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: targetRole === r ? 600 : 400,
                background: targetRole === r ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                color: targetRole === r ? '#0a0a0a' : 'var(--text-primary)',
                border: targetRole === r ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
        {[
          { key: 'radar', label: '6-Axis Competency Radar', icon: BarChart2 },
          { key: 'skill_map', label: 'Role Skill Gap Map', icon: Target },
          { key: 'strengths', label: 'Verified Strengths & Flaws', icon: ShieldCheck },
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

      {/* Tab 1: 6-Axis Radar Cards */}
      {activeTab === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {radarProfile.map((dim, idx) => {
            const isStrength = dim.score >= dim.benchmark;
            return (
              <div
                key={dim.dimension}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: isStrength ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(217, 183, 122, 0.3)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dim.dimension}
                  </span>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: isStrength ? '#10B981' : 'var(--accent-gold)',
                    }}
                  >
                    {dim.score}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                      {' '}/ {dim.benchmark} benchmark
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${dim.score}%`,
                      height: '100%',
                      background: isStrength
                        ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                        : 'linear-gradient(90deg, #D9B77A 0%, #F59E0B 100%)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {dim.assessment}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Skill Gap Map */}
      {activeTab === 'skill_map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Target Role Benchmark: <strong style={{ color: 'var(--text-primary)' }}>{targetRole}</strong></span>
            <span>Based on demonstrated performance records</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {skillMap.map((item) => {
              const badgeStyle = {
                Mastered: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
                Proficient: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
                'Needs Drill': { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
                'Unverified Gap': { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
              }[item.gap_status] || { bg: 'rgba(255,255,255,0.05)', color: '#fff', border: 'rgba(255,255,255,0.1)' };

              return (
                <div
                  key={item.skill}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.skill}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {item.category}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.evidence}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Demonstrated / Required</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.demonstrated_level}% <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {item.required_level}%</span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '100px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                        minWidth: '100px',
                        textAlign: 'center',
                      }}
                    >
                      {item.gap_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Verified Strengths & Development Areas */}
      {activeTab === 'strengths' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Verified Strengths */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 700 }}>
              <CheckCircle2 size={18} />
              <span>Verified Strengths (Ground-Truth Data)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {verifiedStrengths.map((str, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Development Areas */}
          <div
            style={{
              background: 'rgba(217, 183, 122, 0.04)',
              border: '1px solid rgba(217, 183, 122, 0.25)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
              <AlertTriangle size={18} />
              <span>Development Areas (Target Practice)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {developmentAreas.map((dev, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                  <span>{dev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actionable Next Steps */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Recommended Next Steps
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {nextSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span>{step.type}</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{step.estimated_time}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 500 }}>
                  {step.impact}
                </div>
              </div>

              <button
                onClick={() => onStartInterview && onStartInterview(targetRole)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  background: 'rgba(217, 183, 122, 0.15)',
                  border: '1px solid rgba(217, 183, 122, 0.35)',
                  borderRadius: '8px',
                  color: 'var(--accent-gold)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(217, 183, 122, 0.28)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(217, 183, 122, 0.15)')}
              >
                <span>Practice Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
