import React, { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar fill timed for ~2.6s
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Trigger fade out after 3.0s (+1 sec longer)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 3000);

    // Complete and unmount after 3.5s (+1.1 sec longer)
    const doneTimer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  // Click to skip
  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 350);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`intro-loading-overlay ${fading ? 'overlay-fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#070707',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(217, 183, 122, 0.16) 0%, rgba(217, 183, 122, 0.04) 45%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Logo Showcase Container */}
      <div
        className="intro-logo-container"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Emblem Wrapper - Transparent, no black box */}
        <div
          style={{
            position: 'relative',
            width: '65px',
            height: '160px',
            marginBottom: '1.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pulsing ambient ring behind emblem */}
          <div className="emblem-aura-ring" />

          {/* Official Intervista Transparent Emblem ('i' with star) */}
          <img
            src="/logo-emblem.png"
            alt="Intervista Emblem"
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 0 25px rgba(217, 183, 122, 0.6))',
            }}
          />

          {/* THE STAR BLINK ANIMATION OVERLAY (located at star center ~50%, ~19%) */}
          <div
            className="logo-star-blink-container"
            style={{
              position: 'absolute',
              left: '50%',
              top: '19%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Core 4-Point Golden Star Flare */}
            <svg
              className="blinking-star-element"
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Glow Star */}
              <path
                d="M18 0L20.8 14.5L36 18L20.8 21.5L18 36L15.2 21.5L0 18L15.2 14.5L18 0Z"
                fill="url(#goldStarGrad)"
              />
              {/* Inner Bright Center */}
              <circle cx="18" cy="18" r="3.5" fill="#FFFFFF" />
              <defs>
                <radialGradient id="goldStarGrad" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#FFDF85" />
                  <stop offset="100%" stopColor="#B88A35" />
                </radialGradient>
              </defs>
            </svg>

            {/* Cross Laser Light Ray Beams */}
            <div className="horizontal-light-flare" />
            <div className="vertical-light-flare" />

            {/* Expanding sparkle ripple ring */}
            <div className="star-light-ripple" />
          </div>
        </div>

        {/* Brand Typography */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.1rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
            textShadow: '0 0 25px rgba(217, 183, 122, 0.4)',
          }}
          className="brand-text-reveal"
        >
          Intervista
        </h1>

        <p
          style={{
            color: 'var(--accent-gold)',
            fontSize: '0.82rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
            opacity: 0.85,
            marginBottom: '1.75rem',
          }}
          className="subtext-reveal"
        >
          AI-Powered Mock Interview Platform
        </p>

        {/* Hairline Luxury Progress Bar */}
        <div
          style={{
            width: '200px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #B89252, #F6F0E7, #D9B77A)',
              boxShadow: '0 0 10px rgba(217, 183, 122, 0.7)',
              transition: 'width 0.08s linear',
            }}
          />
        </div>

        <span
          style={{
            marginTop: '1.25rem',
            fontSize: '0.68rem',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.08em',
          }}
        >
          Click anywhere to skip
        </span>
      </div>

      {/* Animation Styles */}
      <style>{`
        .intro-loading-overlay {
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s ease;
        }

        .overlay-fade-out {
          opacity: 0;
          transform: scale(1.02);
          pointer-events: none;
        }

        .emblem-aura-ring {
          position: absolute;
          inset: -30px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(217, 183, 122, 0.28) 0%, transparent 70%);
          animation: auraBreathe 2.4s infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes auraBreathe {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.12); opacity: 0.9; }
        }

        /* The Blinking Star Animation */
        .blinking-star-element {
          animation: blinkShine 2s infinite ease-in-out;
          transform-origin: center center;
          filter: drop-shadow(0 0 12px rgba(255, 223, 133, 0.9));
        }

        @keyframes blinkShine {
          0% {
            transform: scale(0.3) rotate(0deg);
            opacity: 0.2;
          }
          20% {
            transform: scale(1.6) rotate(45deg);
            opacity: 1;
            filter: drop-shadow(0 0 20px rgba(255, 240, 200, 1)) drop-shadow(0 0 35px rgba(217, 183, 122, 0.8));
          }
          40% {
            transform: scale(0.7) rotate(90deg);
            opacity: 0.5;
          }
          65% {
            transform: scale(2.2) rotate(135deg);
            opacity: 1;
            filter: drop-shadow(0 0 25px rgba(255, 255, 255, 1)) drop-shadow(0 0 45px rgba(217, 183, 122, 0.9));
          }
          85% {
            transform: scale(1.1) rotate(180deg);
            opacity: 0.7;
          }
          100% {
            transform: scale(0.3) rotate(225deg);
            opacity: 0.2;
          }
        }

        /* Cross Flairs */
        .horizontal-light-flare {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #FFFFFF, rgba(217, 183, 122, 0.9), transparent);
          animation: flarePulse 1.8s infinite ease-in-out;
        }

        .vertical-light-flare {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 1.5px;
          height: 80px;
          background: linear-gradient(180deg, transparent, #FFFFFF, rgba(217, 183, 122, 0.9), transparent);
          animation: flarePulse 1.8s infinite ease-in-out;
        }

        @keyframes flarePulse {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          20%, 65% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          40%, 85% { opacity: 0.2; transform: translate(-50%, -50%) scale(0.6); }
        }

        .star-light-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1px solid rgba(217, 183, 122, 0.5);
          animation: rippleExpand 1.8s infinite cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes rippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }

        .brand-text-reveal {
          animation: textFadeIn 1.2s ease-out;
        }

        @keyframes textFadeIn {
          0% { opacity: 0; transform: translateY(8px); letter-spacing: 0.15em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.22em; }
        }
      `}</style>
    </div>
  );
}
