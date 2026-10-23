import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  Flame,
} from 'lucide-react';
import { apiGetCoachProfile } from '../utils/api';

export default function AICoachWidget({ onStartInterview }) {
  const [coachProfile, setCoachProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiGetCoachProfile()
      .then((data) => {
        if (mounted) {
          setCoachProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load coach profile:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading && !coachProfile) {
    return (
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <RefreshCw size={20} className="spin" style={{ color: 'var(--accent-gold)' }} />
      </div>
    );
  }

  const delta = coachProfile?.score_delta || 10;
  const recurring = coachProfile?.recurring_weaknesses || [];
  const progression = coachProfile?.progression || [];
  const drills = coachProfile?.targeted_drill_recommendations || [];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.08) 0%, rgba(18, 18, 18, 0.95) 100%)',
        border: '1px solid rgba(217, 183, 122, 0.3)',
        borderRadius: '16px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.65rem', borderRadius: '100px', background: 'rgba(217, 183, 122, 0.15)', border: '1px solid rgba(217, 183, 122, 0.3)', marginBottom: '0.65rem' }}>
            <BrainCircuit size={14} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
              PERSONALIZED INTERVIEW COACH
            </span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
            AI That Remembers Your Weaknesses
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            {coachProfile?.coach_verdict ||
              'INTERVISTA continuously tracks mistakes across previous sessions and generates targeted drills instead of repeating standard questions.'}
          </p>
        </div>

        {/* Score Progression Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Score Progression</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {coachProfile?.previous_score || 76}%
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>→</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {coachProfile?.latest_score || 86}%
              </span>
            </div>
          </div>
          <div
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: delta >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: delta >= 0 ? '#10B981' : '#F87171',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </div>
        </div>
      </div>

      {/* Progression Steps Visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Recent Trajectory:</span>
        {progression.map((p, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              background: idx === progression.length - 1 ? 'rgba(217, 183, 122, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: idx === progression.length - 1 ? '1px solid rgba(217, 183, 122, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>{p.session_label}:</span>
            <span style={{ fontWeight: 700, color: idx === progression.length - 1 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
              {p.score}%
            </span>
          </div>
        ))}
      </div>

      {/* Recurring Mistakes Identified */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          Recurring Patterns Tracked Across Rounds ({recurring.length})
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {recurring.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(217, 183, 122, 0.25)',
                borderRadius: '12px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.12)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    Seen in {item.recurrence_count} rounds
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {item.title}
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {item.description}
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78rem', color: '#10B981' }}>
                <strong>Coach Drill:</strong> {item.suggested_exercise}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Targeted Drill Launch Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Targeted practice prioritized: <strong>Big-O Space & Time Upfront</strong> • <strong>STAR Metric Results</strong>
        </div>

        <button
          onClick={() => onStartInterview && onStartInterview('Software Engineer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.25rem',
            background: 'var(--accent-gold)',
            color: '#080808',
            fontWeight: 700,
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(217, 183, 122, 0.25)',
          }}
        >
          <Zap size={14} fill="#080808" />
          <span>Practice Weaknesses in Mock Interview</span>
        </button>
      </div>
    </div>
  );
}
