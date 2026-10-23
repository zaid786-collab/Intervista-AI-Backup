import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import PricingSection from './PricingSection';

const COMPARISON_ROWS = [
  {
    category: 'Mock Interviews & Voice Pipeline',
    features: [
      { name: 'Monthly AI Voice Interviews', starter: '2 / month', pro: 'Unlimited', elite: 'Unlimited' },
      { name: 'Adaptive Question Follow-ups', starter: false, pro: true, elite: true },
      { name: 'Voice Engine Latency', starter: 'Standard (~950ms)', pro: 'Ultra-low (<400ms)', elite: 'Dedicated VIP Node' },
      { name: 'Video & Camera Participation', starter: 'Audio only', pro: 'Audio + Camera', elite: 'Audio + Camera + Screen Share' },
    ],
  },
  {
    category: 'Question Bank & Roles',
    features: [
      { name: 'Standard Behavioral & Technical Questions', starter: true, pro: true, elite: true },
      { name: 'Company-Specific Packs (Google, Amazon, Meta)', starter: false, pro: true, elite: true },
      { name: 'System Design & Distributed Systems Mocks', starter: false, pro: true, elite: true },
      { name: 'Custom Job Description (JD) AI Matcher', starter: false, pro: false, elite: true },
    ],
  },
  {
    category: 'Evaluation & Analytics',
    features: [
      { name: 'Scorecard Overview & Grade', starter: 'Basic Summary', pro: 'Detailed Multi-Metric', elite: 'Executive Audit' },
      { name: 'Speech Metrics (WPM, Filler Words)', starter: false, pro: true, elite: true },
      { name: 'STAR Behavioral Scoring', starter: false, pro: true, elite: true },
      { name: 'Downloadable PDF Reports', starter: false, pro: true, elite: true },
    ],
  },
  {
    category: 'Mentorship & Support',
    features: [
      { name: 'Support Channel', starter: 'Discord Forum', pro: 'Priority Email + Discord', elite: '24/7 VIP Concierge' },
      { name: '1-on-1 Senior Mentor Review', starter: false, pro: false, elite: '1 Session / mo' },
    ],
  },
];

export default function PlansPage({ onStartInterview, onBackToHome }) {
  const [showMatrix, setShowMatrix] = useState(false);

  return (
    <div style={{ backgroundColor: '#090909', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Top Banner Navigation Bar */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          backgroundColor: 'rgba(15, 15, 15, 0.7)',
          backdropFilter: 'blur(12px)',
          padding: '0.85rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBackToHome}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.86rem',
              fontWeight: 500,
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Instant UPI QR Activation · 7-Day Money-Back Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* Page Hero Header - Clean & Classy */}
      <div
        style={{
          paddingTop: '3.5rem',
          paddingBottom: '1rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '880px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(217, 183, 122, 0.1)',
              border: '1px solid rgba(217, 183, 122, 0.25)',
              borderRadius: '9999px',
              padding: '4px 14px',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={12} color="var(--accent-gold)" />
            <span
              style={{
                color: 'var(--accent-gold)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              INVEST IN YOUR NEXT CAREER LEAP
            </span>
          </div>

          <h1
            className="serif-heading"
            style={{
              fontSize: 'clamp(2.4rem, 4.8vw, 3.6rem)',
              lineHeight: 1.15,
              marginBottom: '1rem',
              letterSpacing: '-0.025em',
            }}
          >
            Simple, transparent <span className="gold-italic">plans for serious candidates.</span>
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Unlimited voice simulations, company-specific drills, and instant scoring.
            Cancel anytime with zero questions asked.
          </p>
        </div>
      </div>

      {/* Main Pricing Section */}
      <PricingSection onStartInterview={onStartInterview} />

      {/* Optional Feature Matrix Toggle */}
      <div className="container" style={{ marginTop: '1rem', marginBottom: '3.5rem', textAlign: 'center' }}>
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="btn-secondary"
          style={{
            padding: '0.7rem 1.6rem',
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderColor: 'rgba(217, 183, 122, 0.3)',
            color: 'var(--text-primary)',
          }}
        >
          <span>{showMatrix ? 'Hide Full Feature Comparison' : 'Compare All Features & Limits'}</span>
          <ChevronDown
            size={16}
            style={{
              transform: showMatrix ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {showMatrix && (
          <div
            style={{
              marginTop: '2rem',
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              overflowX: 'auto',
              textAlign: 'left',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.84rem',
                minWidth: '600px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    FEATURE
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Free Starter
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '0.85rem',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                      backgroundColor: 'rgba(217, 183, 122, 0.06)',
                    }}
                  >
                    Pro Candidate ★
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Elite Executive
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: '1rem 0.85rem 0.4rem 0.85rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--accent-gold)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((feat, fIdx) => (
                      <tr
                        key={fIdx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-secondary)' }}>
                          {feat.name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '0.75rem 0.85rem', color: 'var(--text-secondary)' }}>
                          {typeof feat.starter === 'boolean' ? (
                            feat.starter ? (
                              <Check size={15} color="#22C55E" style={{ margin: '0 auto' }} />
                            ) : (
                              <X size={15} color="rgba(255, 255, 255, 0.25)" style={{ margin: '0 auto' }} />
                            )
                          ) : (
                            feat.starter
                          )}
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            padding: '0.75rem 0.85rem',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            backgroundColor: 'rgba(217, 183, 122, 0.06)',
                          }}
                        >
                          {typeof feat.pro === 'boolean' ? (
                            feat.pro ? (
                              <Check size={15} color="var(--accent-gold)" style={{ margin: '0 auto' }} />
                            ) : (
                              <X size={15} color="rgba(255, 255, 255, 0.25)" style={{ margin: '0 auto' }} />
                            )
                          ) : (
                            feat.pro
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '0.75rem 0.85rem', color: 'var(--text-secondary)' }}>
                          {typeof feat.elite === 'boolean' ? (
                            feat.elite ? (
                              <Check size={15} color="#22C55E" style={{ margin: '0 auto' }} />
                            ) : (
                              <X size={15} color="rgba(255, 255, 255, 0.25)" style={{ margin: '0 auto' }} />
                            )
                          ) : (
                            feat.elite
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
