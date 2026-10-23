import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner({ onStartInterview }) {
  return (
    <section style={{ padding: '7rem 0 9rem 0', position: 'relative' }}>
      <div className="container">
        {/* Wide Premium Banner Container */}
        <div
          style={{
            position: 'relative',
            borderRadius: '26px',
            backgroundColor: '#12100E',
            border: '1px solid rgba(217, 183, 122, 0.22)',
            padding: '4.5rem 4.5rem',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(217, 183, 122, 0.08)',
          }}
          className="cta-banner"
        >
          {/* Subtle flowing gold waves SVG background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.35,
              zIndex: 0,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M-50,220 C200,320 350,140 600,240 C850,340 950,150 1050,200"
                stroke="url(#goldGradient1)"
                strokeWidth="1.5"
              />
              <path
                d="M-50,250 C180,350 380,160 620,260 C860,360 980,180 1050,230"
                stroke="url(#goldGradient2)"
                strokeWidth="2"
              />
              <path
                d="M-50,180 C220,270 320,110 580,210 C840,310 920,130 1050,170"
                stroke="url(#goldGradient1)"
                strokeWidth="1"
              />
              <path
                d="M-50,290 C250,370 420,210 650,290 C880,370 1000,230 1050,270"
                stroke="url(#goldGradient2)"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="goldGradient1" x1="0" y1="0" x2="1000" y2="300" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D9B77A" stopOpacity="0.1" />
                  <stop offset="0.5" stopColor="#E8D2A7" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#B59355" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="goldGradient2" x1="0" y1="0" x2="1000" y2="300" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#B59355" stopOpacity="0.05" />
                  <stop offset="0.5" stopColor="#D9B77A" stopOpacity="0.65" />
                  <stop offset="1" stopColor="#E8D2A7" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Ambient Warm Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-30%',
              left: '40%',
              width: '400px',
              height: '250px',
              background: 'radial-gradient(ellipse, rgba(217, 183, 122, 0.16) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Banner Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '3rem',
              flexWrap: 'wrap',
            }}
            className="cta-content"
          >
            {/* Left Column: Heading & Description */}
            <div style={{ maxWidth: '580px' }}>
              <h2
                className="serif-heading"
                style={{
                  fontSize: 'clamp(2.1rem, 3.8vw, 2.9rem)',
                  lineHeight: 1.16,
                  marginBottom: '1rem',
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)',
                }}
              >
                Be interview ready, <br />
                for every opportunity.
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1.02rem',
                  lineHeight: 1.6,
                }}
              >
                Start your journey today and build the skills to land your dream job.
              </p>
            </div>

            {/* Right Column: CTA & Subtext */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <button
                onClick={() => onStartInterview()}
                className="btn-primary"
                style={{
                  padding: '0.88rem 1.85rem',
                  fontSize: '0.96rem',
                  boxShadow: '0 8px 24px rgba(217, 183, 122, 0.25)',
                }}
              >
                <span>Start Interview</span>
                <ArrowRight size={16} />
              </button>

              <span
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.78rem',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                }}
              >
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 868px) {
          .cta-banner {
            padding: 2.75rem 2rem !important;
          }
          .cta-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
