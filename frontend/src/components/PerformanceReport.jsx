import React from 'react';
import { MessageSquare, Code2, Lightbulb, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';

export default function PerformanceReport({ onViewReport }) {
  const metrics = [
    {
      icon: MessageSquare,
      label: 'Communication',
      score: 92,
    },
    {
      icon: Code2,
      label: 'Technical Depth',
      score: 86,
    },
    {
      icon: Lightbulb,
      label: 'Problem Solving',
      score: 89,
    },
    {
      icon: BarChart3,
      label: 'Confidence',
      score: 84,
    },
  ];

  return (
    <section id="analysis" className="section-wrapper">
      <div className="container">
        {/* Header with "View sample report" CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
              Your performance, clearly understood
            </h2>
            <p className="section-subtitle" style={{ textAlign: 'left', margin: 0 }}>
              Get detailed insights into your interview performance across key areas.
            </p>
          </div>

          <button
            onClick={onViewReport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
              padding: '0.4rem 0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <span>View sample report</span>
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>→</span>
          </button>
        </div>

        {/* Wide Analytics Panel Card */}
        <div
          className="glass-card report-panel"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            padding: '3.5rem 4rem',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '5rem',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div
            style={{
              position: 'absolute',
              left: '5%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '260px',
              height: '260px',
              background: 'radial-gradient(circle, rgba(217, 183, 122, 0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* Left Side: Circular Progress Ring & Trend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5rem',
            }}
            className="report-left"
          >
            {/* SVG Progress Ring */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                {/* Background Track */}
                <circle
                  cx="65"
                  cy="65"
                  r="52"
                  fill="none"
                  stroke="#1c1c1c"
                  strokeWidth="8"
                />
                {/* Champagne Gold Progress Fill (88% of 2*PI*52 = 326.7; offset = 39.2) */}
                <circle
                  cx="65"
                  cy="65"
                  r="52"
                  fill="none"
                  stroke="var(--accent-gold)"
                  strokeWidth="8"
                  strokeDasharray="326.7"
                  strokeDashoffset="39.2"
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(217, 183, 122, 0.45))' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '2.3rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  88%
                </span>
              </div>
            </div>

            {/* Labels and Trend */}
            <div>
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  marginBottom: '2px',
                }}
              >
                Interview Score
              </div>
              <div
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                Overall Score
              </div>

              {/* Upward trend pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.22)',
                  color: '#4ADE80',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                }}
              >
                <TrendingUp size={13} />
                <span>+12% from last interview</span>
              </div>
            </div>
          </div>

          {/* Right Side: Horizontal Progress Bars */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.4rem',
            }}
          >
            {metrics.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '170px 1fr 50px',
                    alignItems: 'center',
                    gap: '1.5rem',
                  }}
                  className="metric-row"
                >
                  {/* Metric Label & Icon */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.92rem',
                      fontWeight: 400,
                    }}
                  >
                    <Icon size={16} color="var(--accent-gold)" />
                    <span>{item.label}</span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: '#1E1E1E',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.score}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #B59355 0%, #E8D2A7 100%)',
                        borderRadius: '9999px',
                        boxShadow: '0 0 12px rgba(217, 183, 122, 0.35)',
                        transition: 'width 1s ease-out',
                      }}
                    />
                  </div>

                  {/* Score Percentage */}
                  <div
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    {item.score}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo/Sample Disclaimer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            color: 'var(--text-tertiary)',
            fontSize: '0.78rem',
          }}
        >
          * Illustrative sample assessment report based on candidate simulated interview rubrics.
        </div>
      </div>

      <style>{`
        .report-panel {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-card);
          border-radius: 24px;
          padding: 3.5rem 4rem;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 5rem;
          align-items: center;
          position: relative;
        }
        @media (max-width: 992px) {
          .report-panel {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            padding: 2.5rem !important;
          }
          .report-left {
            justify-content: center;
          }
        }
        @media (max-width: 600px) {
          .metric-row {
            grid-template-columns: 130px 1fr 40px !important;
            gap: 0.75rem !important;
          }
          .report-left {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
