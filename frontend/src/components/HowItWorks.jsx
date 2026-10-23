import React from 'react';
import {
  User,
  Mic,
  BarChart3,
  ArrowRight,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      tag: 'CUSTOM CONFIG',
      title: 'Choose your role',
      desc: 'Select your target role, focus domain, and seniority level.',
      meta: 'Role & Seniority Track',
      icon: User,
    },
    {
      num: '02',
      tag: 'VOICE SIMULATION',
      title: 'Take the interview',
      desc: 'Engage in a voice-first simulation with adaptive AI follow-ups.',
      meta: 'Real-Time Conversational AI',
      icon: Mic,
    },
    {
      num: '03',
      tag: 'INSTANT AUDIT',
      title: 'Get your feedback',
      desc: 'Receive detailed rubric scores, STAR analysis, and clear takeaways.',
      meta: 'Scores & Actionable Report',
      icon: BarChart3,
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      {/* Background ambient lighting */}
      <div className="hiw-ambient-glow" />

      <div className="container hiw-container">
        {/* Section Header */}
        <div className="section-header hiw-header">
          <div className="eyebrow-container">
            <span className="eyebrow-tag">
              <Sparkles size={12} />
              THREE SIMPLE STEPS
            </span>
          </div>

          <h2 className="serif-heading hiw-title">
            How it works — <span className="gold-italic">From setup to mastery.</span>
          </h2>
          <p className="section-subtitle hiw-subtitle">
            A high-fidelity simulation designed to replicate real tech and behavioural interview loops.
          </p>
        </div>

        {/* Static Signboard Flexbox */}
        <div className="signboards-flexbox">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              {/* Individual Static Signboard */}
              <div className="signboard-card">
                {/* Signboard Header Strip with Mounting Rivets */}
                <div className="signboard-header">
                  <span className="signboard-rivet" />
                  <div className="signboard-badge-wrap">
                    <span className="signboard-num">{step.num}</span>
                    <span className="signboard-tag">{step.tag}</span>
                  </div>
                  <span className="signboard-rivet" />
                </div>

                {/* Signboard Body */}
                <div className="signboard-body">
                  <div className="signboard-icon-box">
                    <step.icon size={20} color="var(--accent-gold)" />
                  </div>
                  <h3 className="signboard-title">{step.title}</h3>
                  <p className="signboard-desc">{step.desc}</p>
                </div>

                {/* Signboard Bottom Minimal Tag */}
                <div className="signboard-footer">
                  <span className="signboard-meta">✦ {step.meta}</span>
                </div>
              </div>

              {/* Arrow Connector between boards */}
              {idx < steps.length - 1 && (
                <div className="signboard-connector" aria-hidden="true">
                  <div className="connector-line" />
                  <div className="connector-arrow-dot">
                    <ArrowRight size={15} className="desktop-arrow" />
                    <ArrowDown size={15} className="mobile-arrow" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        .how-it-works-section {
          padding: 6rem 0;
          position: relative;
          background-color: var(--bg-base);
          overflow: hidden;
        }

        .hiw-ambient-glow {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          width: 750px;
          height: 350px;
          background: radial-gradient(circle, rgba(217, 183, 122, 0.07) 0%, transparent 70%);
          filter: blur(75px);
          pointer-events: none;
          z-index: 0;
        }

        .hiw-container {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .hiw-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .eyebrow-container {
          display: inline-flex;
          align-items: center;
          margin-bottom: 0.85rem;
        }

        .eyebrow-tag {
          color: var(--accent-gold);
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(217, 183, 122, 0.09);
          border: 1px solid rgba(217, 183, 122, 0.22);
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.74rem;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .hiw-title {
          font-size: clamp(2.2rem, 4.5vw, 3.4rem);
          line-height: 1.15;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .gold-italic {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--accent-gold);
          font-weight: 400;
        }

        .hiw-subtitle {
          max-width: 580px;
          margin: 0 auto;
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.6;
        }

        /* Signboards Flexbox Container */
        .signboards-flexbox {
          display: flex;
          align-items: stretch;
          justify-content: center;
          gap: 1rem;
          position: relative;
        }

        /* Individual Signboard (3D Shiny Gold Plate - Completely Static) */
        .signboard-card {
          flex: 1;
          max-width: 350px;
          background: linear-gradient(145deg, #FFECA3 0%, #E3B753 22%, #BD8926 44%, #F9E292 64%, #9E7013 82%, #DFB44F 100%);
          border: 1px solid rgba(255, 245, 210, 0.85);
          border-radius: 16px;
          padding: 1.45rem 1.45rem;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 
            0 22px 50px rgba(0, 0, 0, 0.8),
            0 6px 18px rgba(212, 175, 55, 0.35),
            inset 0 2px 3px rgba(255, 255, 255, 0.85),
            inset 0 -3px 6px rgba(0, 0, 0, 0.45);
          cursor: default;
          user-select: text;
          overflow: hidden;
          transition: none;
        }

        /* Subtle engraved inner bevel outline */
        .signboard-card::before {
          content: '';
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(85, 55, 10, 0.28);
          border-radius: 10px;
          pointer-events: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }

        /* Signboard Header with Mounting Rivets */
        .signboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(75, 50, 10, 0.25);
          margin-bottom: 1.15rem;
          position: relative;
          z-index: 1;
        }

        .signboard-rivet {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: radial-gradient(circle, #48320a 35%, #1f1402 85%);
          box-shadow: 0 1px 1px rgba(255, 255, 255, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 240, 180, 0.5);
        }

        .signboard-badge-wrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .signboard-num {
          font-size: 0.72rem;
          font-weight: 800;
          color: #FFECA8;
          letter-spacing: 0.08em;
          background: #201503;
          border: 1px solid rgba(255, 235, 170, 0.4);
          padding: 2px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(32, 21, 3, 0.5);
        }

        .signboard-tag {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          color: #3b2807;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
        }

        /* Signboard Body */
        .signboard-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .signboard-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #1c1303;
          border: 1px solid rgba(255, 235, 170, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px rgba(30, 20, 5, 0.45);
        }

        .signboard-icon-box svg {
          stroke: #FFE594 !important;
        }

        .signboard-title {
          font-size: 1.68rem;
          font-weight: 900;
          color: #120b01;
          margin-bottom: 0.6rem;
          line-height: 1.2;
          letter-spacing: -0.015em;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
          text-wrap: balance;
        }

        .signboard-desc {
          font-size: 0.9rem;
          color: #332306;
          font-weight: 600;
          line-height: 1.55;
          margin-bottom: 1.25rem;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
          text-wrap: balance;
        }

        /* Signboard Footer Tag */
        .signboard-footer {
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(75, 50, 10, 0.25);
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .signboard-meta {
          font-size: 0.74rem;
          font-weight: 800;
          color: #241804;
          letter-spacing: 0.04em;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
          text-align: center;
        }

        /* Connector between signboards */
        .signboard-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 32px;
          position: relative;
        }

        .connector-line {
          position: absolute;
          width: 100%;
          height: 1px;
          background: rgba(217, 183, 122, 0.25);
        }

        .connector-arrow-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #181818;
          border: 1px solid rgba(217, 183, 122, 0.35);
          color: var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .desktop-arrow { display: block; }
        .mobile-arrow { display: none; }

        @media (max-width: 900px) {
          .signboards-flexbox {
            flex-direction: column;
            align-items: center;
            gap: 1.25rem;
          }

          .signboard-card {
            width: 100%;
            max-width: 480px;
          }

          .signboard-connector {
            width: 100%;
            height: 24px;
          }

          .connector-line {
            width: 1px;
            height: 100%;
          }

          .desktop-arrow { display: none; }
          .mobile-arrow { display: block; }
        }
      `}</style>
    </section>
  );
}
