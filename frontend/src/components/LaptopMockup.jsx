import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Video, 
  FileText, 
  Target, 
  BookOpen, 
  Settings, 
  Mic, 
  SkipBack, 
  SkipForward, 
  MessageSquare, 
  Code2, 
  Lightbulb, 
  BarChart3,
  Volume2
} from 'lucide-react';

export default function LaptopMockup({ onTryDemo }) {
  const [activeTab, setActiveTab] = useState('feedback');
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [seconds, setSeconds] = useState(154); // 02:34

  // Tick the timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="laptop-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* Ambient warm glow behind laptop mimicking the desk lamp in reference screenshot */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '5%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(217, 183, 122, 0.18) 0%, rgba(217, 183, 122, 0.05) 50%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Desk lamp light flare */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '30%',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255, 230, 180, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 3D Laptop Container */}
      <div
        className="laptop-perspective"
        style={{
          position: 'relative',
          zIndex: 1,
          transform: 'perspective(1400px) rotateY(-4deg) rotateX(4deg)',
          transition: 'transform 0.5s ease',
        }}
      >
        {/* Laptop Screen Bezel */}
        <div
          style={{
            backgroundColor: '#0c0c0c',
            border: '2px solid #2a2a2a',
            borderRadius: '16px 16px 4px 4px',
            padding: '10px 10px 14px 10px',
            boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 40px rgba(217, 183, 122, 0.06)',
            position: 'relative',
          }}
        >
          {/* Top camera notch/dot */}
          <div
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: '#1b1b1b',
              borderRadius: '50%',
              margin: '0 auto 8px auto',
              border: '1px solid #333',
            }}
          />

          {/* Screen Content Window */}
          <div
            style={{
              backgroundColor: '#0E0E0E',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '70px 1fr 180px',
              height: '380px',
              fontSize: '12px',
              userSelect: 'none',
            }}
          >
            {/* Sidebar */}
            <div
              style={{
                backgroundColor: '#0A0A0A',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '14px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {[
                { icon: Home, label: 'Dashboard', active: true },
                { icon: Video, label: 'Interviews' },
                { icon: FileText, label: 'Reports' },
                { icon: Target, label: 'Practice' },
                { icon: BookOpen, label: 'Resources' },
                { icon: Settings, label: 'Settings', mt: 'auto' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    title={item.label}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: item.active ? '#1A1A1A' : 'transparent',
                      color: item.active ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                      border: item.active ? '1px solid rgba(217, 183, 122, 0.25)' : 'none',
                      marginTop: item.mt ? 'auto' : 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                );
              })}
            </div>

            {/* Main Center Area */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 18px',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: '#0F0F0F',
                position: 'relative',
              }}
            >
              {/* Header inside dashboard */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                    Software Engineer
                  </h4>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#1A1A1A', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      Technical
                    </span>
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#1A1A1A', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      Mid Level
                    </span>
                  </div>
                </div>

                {/* Live Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span style={{ color: '#F87171', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                    {formatTime(seconds)}
                  </span>
                </div>
              </div>

              {/* Question Card */}
              <div
                style={{
                  backgroundColor: '#161616',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(217, 183, 122, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                    flexShrink: 0,
                  }}
                >
                  <Volume2 size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                    Interviewer Question
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.78rem', lineHeight: 1.45, fontWeight: 400 }}>
                    "Can you explain how you would optimize a slow database query?"
                  </p>
                </div>
              </div>

              {/* Animated Waveform */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  padding: '10px 0',
                }}
              >
                {[
                  12, 18, 30, 48, 65, 80, 52, 90, 75, 40, 60, 85, 95, 70, 50, 85,
                  95, 60, 42, 78, 55, 32, 22, 14
                ].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3.5px',
                      height: `${height * 0.7}%`,
                      backgroundColor: i % 2 === 0 ? 'var(--accent-gold)' : '#F6F0E7',
                      borderRadius: '3px',
                      opacity: 0.85,
                      animation: `waveMotion 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: 'auto',
                }}
              >
                <button
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <SkipBack size={12} />
                </button>

                {/* Main Mic button */}
                <button
                  onClick={onTryDemo}
                  title="Click to launch interactive interview demo"
                  style={{
                    background: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#090909',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(217, 183, 122, 0.4)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Mic size={18} />
                </button>

                <button
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <SkipForward size={12} />
                </button>
              </div>
            </div>

            {/* Right Side Panel: Scores & Metrics */}
            <div
              style={{
                backgroundColor: '#0C0C0C',
                padding: '14px 12px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '14px',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => setActiveTab('feedback')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'feedback' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    color: activeTab === 'feedback' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    paddingBottom: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Feedback
                </button>
                <button
                  onClick={() => setActiveTab('transcript')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'transcript' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    color: activeTab === 'transcript' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    paddingBottom: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Transcript
                </button>
              </div>

              {activeTab === 'feedback' ? (
                <>
                  {/* Score Ring */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="none"
                          stroke="#1A1A1A"
                          strokeWidth="4"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="none"
                          stroke="var(--accent-gold)"
                          strokeWidth="4"
                          strokeDasharray="163.3"
                          strokeDashoffset="13"
                          strokeLinecap="round"
                          transform="rotate(-90 32 32)"
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
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          92%
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Overall Score
                    </span>
                  </div>

                  {/* Metrics Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { icon: MessageSquare, label: 'Communication', val: 92 },
                      { icon: Code2, label: 'Technical Depth', val: 86 },
                      { icon: Lightbulb, label: 'Problem Solving', val: 89 },
                      { icon: BarChart3, label: 'Confidence', val: 84 },
                    ].map((m, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', marginBottom: '2px' }}>
                          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <m.icon size={11} color="var(--accent-gold)" />
                            {m.label}
                          </span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.val}%</span>
                        </div>
                        <div style={{ height: '3px', backgroundColor: '#1A1A1A', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${m.val}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #B89252, #EAD6AF)',
                              borderRadius: '2px',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflowY: 'auto' }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>AI:</strong> Explain how you would optimize a slow query.
                  </p>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>Candidate:</strong> First, I inspect execution plans using EXPLAIN ANALYZE to identify sequential scans...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Laptop Bottom Base / Deck */}
        <div
          style={{
            height: '14px',
            background: 'linear-gradient(180deg, #1C1C1C 0%, #121212 100%)',
            border: '1px solid #282828',
            borderRadius: '0 0 16px 16px',
            position: 'relative',
            marginTop: '-2px',
            boxShadow: '0 12px 28px rgba(0,0,0,0.8)',
          }}
        >
          {/* Trackpad notch indentation */}
          <div
            style={{
              width: '60px',
              height: '4px',
              backgroundColor: '#0a0a0a',
              borderRadius: '0 0 4px 4px',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Base reflection shadow */}
        <div
          style={{
            width: '90%',
            height: '12px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 75%)',
            margin: '4px auto 0 auto',
            filter: 'blur(4px)',
          }}
        />
      </div>

      <style>{`
        @media (max-width: 992px) {
          .laptop-perspective {
            transform: none !important;
          }
        }
        @media (max-width: 540px) {
          .laptop-perspective > div:first-child > div:last-child {
            grid-template-columns: 50px 1fr !important;
          }
          .laptop-perspective > div:first-child > div:last-child > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
