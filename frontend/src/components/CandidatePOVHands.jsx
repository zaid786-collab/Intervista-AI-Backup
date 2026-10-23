import React from 'react';

/**
 * CandidatePOVHands
 * First-person perspective candidate hands in the foreground.
 * Exactly matches the candidate's hands in the reference image:
 * - Positioned at the bottom center of the desk
 * - Animated conversational gesturing when candidate speaks (isCandidateSpeaking)
 */
export default function CandidatePOVHands({ isCandidateSpeaking = false }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 18,
        width: 'clamp(360px, 45vw, 600px)',
        height: '180px',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 2rem',
        overflow: 'visible',
      }}
    >
      {/* Left Hand */}
      <div
        style={{
          width: '130px',
          height: '160px',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isCandidateSpeaking
            ? 'translateY(-14px) rotate(4deg) scale(1.04)'
            : 'translateY(0) rotate(0deg) scale(1)',
          transformOrigin: 'bottom left',
          filter: 'drop-shadow(0 14px 24px rgba(0, 0, 0, 0.65))',
        }}
      >
        <svg viewBox="0 0 160 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="skinGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F2BAA0" />
              <stop offset="45%" stopColor="#DE9E82" />
              <stop offset="100%" stopColor="#B87355" />
            </linearGradient>
            <linearGradient id="palmShadowLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(80,30,15,0.35)" />
            </linearGradient>
          </defs>

          {/* Forearm & Wrist */}
          <path
            d="M 20 200 C 25 150, 40 120, 55 95 C 65 80, 85 75, 95 85 C 105 105, 110 160, 115 200 Z"
            fill="url(#skinGradLeft)"
          />

          {/* Palm Base */}
          <ellipse cx="85" cy="90" rx="36" ry="42" fill="url(#skinGradLeft)" />

          {/* Thumb */}
          <path
            d="M 98 90 C 120 78, 140 70, 145 82 C 148 92, 130 102, 108 106 Z"
            fill="url(#skinGradLeft)"
          />

          {/* Index Finger */}
          <path
            d="M 85 65 C 95 38, 105 22, 116 26 C 125 32, 112 55, 96 74 Z"
            fill="url(#skinGradLeft)"
          />

          {/* Middle Finger */}
          <path
            d="M 68 62 C 72 28, 80 12, 92 15 C 102 20, 94 48, 82 72 Z"
            fill="url(#skinGradLeft)"
          />

          {/* Ring Finger */}
          <path
            d="M 50 68 C 50 38, 56 24, 67 27 C 76 32, 70 54, 62 76 Z"
            fill="url(#skinGradLeft)"
          />

          {/* Pinky Finger */}
          <path
            d="M 38 78 C 30 54, 34 40, 44 42 C 52 46, 50 64, 48 85 Z"
            fill="url(#skinGradLeft)"
          />

          {/* Subtle Palm Creases & Highlights */}
          <path
            d="M 60 95 Q 80 105 100 95"
            stroke="rgba(120, 50, 25, 0.28)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 70 110 Q 85 118 95 112"
            stroke="rgba(120, 50, 25, 0.2)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Right Hand */}
      <div
        style={{
          width: '130px',
          height: '160px',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isCandidateSpeaking
            ? 'translateY(-14px) rotate(-4deg) scale(1.04)'
            : 'translateY(0) rotate(0deg) scale(1)',
          transformOrigin: 'bottom right',
          filter: 'drop-shadow(0 14px 24px rgba(0, 0, 0, 0.65))',
        }}
      >
        <svg viewBox="0 0 160 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="skinGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F2BAA0" />
              <stop offset="45%" stopColor="#DE9E82" />
              <stop offset="100%" stopColor="#B87355" />
            </linearGradient>
          </defs>

          {/* Forearm & Wrist */}
          <path
            d="M 140 200 C 135 150, 120 120, 105 95 C 95 80, 75 75, 65 85 C 55 105, 50 160, 45 200 Z"
            fill="url(#skinGradRight)"
          />

          {/* Palm Base */}
          <ellipse cx="75" cy="90" rx="36" ry="42" fill="url(#skinGradRight)" />

          {/* Thumb */}
          <path
            d="M 62 90 C 40 78, 20 70, 15 82 C 12 92, 30 102, 52 106 Z"
            fill="url(#skinGradRight)"
          />

          {/* Index Finger */}
          <path
            d="M 75 65 C 65 38, 55 22, 44 26 C 35 32, 48 55, 64 74 Z"
            fill="url(#skinGradRight)"
          />

          {/* Middle Finger */}
          <path
            d="M 92 62 C 88 28, 80 12, 68 15 C 58 20, 66 48, 78 72 Z"
            fill="url(#skinGradRight)"
          />

          {/* Ring Finger */}
          <path
            d="M 110 68 C 110 38, 104 24, 93 27 C 84 32, 90 54, 98 76 Z"
            fill="url(#skinGradRight)"
          />

          {/* Pinky Finger */}
          <path
            d="M 122 78 C 130 54, 126 40, 116 42 C 108 46, 110 64, 112 85 Z"
            fill="url(#skinGradRight)"
          />

          {/* Creases */}
          <path
            d="M 100 95 Q 80 105 60 95"
            stroke="rgba(120, 50, 25, 0.28)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 90 110 Q 75 118 65 112"
            stroke="rgba(120, 50, 25, 0.2)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
