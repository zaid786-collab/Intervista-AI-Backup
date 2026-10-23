import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Home, 
  Video, 
  FileText, 
  Target, 
  BookOpen, 
  Settings, 
  Mic, 
  MessageSquare, 
  Lightbulb, 
  BarChart3, 
  Compass,
  Volume2
} from 'lucide-react';

export default function InterviewShowcase({ onTryDemo }) {
  const [activeTab, setActiveTab] = useState('feedback');
  const [seconds, setSeconds] = useState(108); // 01:48
  const [isListening, setIsListening] = useState(true);

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
    <section id="features" className="section-wrapper" style={{ paddingTop: '3rem' }}>
      <div className="container">
        {/* Wide Bordered Feature Container */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-card)',
            borderRadius: '28px',
            padding: '3.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="showcase-container"
        >
          {/* Ambient Gold Aura in Background */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(217, 183, 122, 0.08) 0%, transparent 65%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '0.9fr 1.25fr',
              gap: '3.5rem',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
            className="showcase-grid"
          >
            {/* Left Column */}
            <div>
              {/* Eyebrow Label */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  marginBottom: '1.5rem',
                }}
              >
                <span className="eyebrow-tag">
                  INTERVIEW EXPERIENCE
                </span>
              </div>

              {/* Heading */}
              <h2
                className="serif-heading"
                style={{
                  fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                }}
              >
                Real interviews. <br />
                Real feedback.
              </h2>

              {/* Description */}
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1.02rem',
                  lineHeight: 1.65,
                  marginBottom: '2.4rem',
                  maxWidth: '440px',
                }}
              >
                Experience realistic mock interviews with role-specific questions,
                voice-based interaction, and detailed performance analysis.
              </p>

              {/* CTA Button */}
              <button
                onClick={onTryDemo}
                className="btn-primary"
                style={{
                  padding: '0.78rem 1.6rem',
                  fontSize: '0.92rem',
                }}
              >
                <span>Try a Demo Interview</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Column: Realistic Dashboard Preview Card */}
            <div>
              <div
                style={{
                  backgroundColor: '#0C0C0C',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(217, 183, 122, 0.05)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr 185px',
                  minHeight: '370px',
                  userSelect: 'none',
                }}
                className="showcase-dashboard"
              >
                {/* Mini Sidebar */}
                <div
                  style={{
                    backgroundColor: '#090909',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '14px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {[
                    { icon: Home, label: 'Dashboard' },
                    { icon: Video, label: 'Interviews', active: true },
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
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: item.active ? '#1A1A1A' : 'transparent',
                          color: item.active ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                          border: item.active ? '1px solid rgba(217, 183, 122, 0.25)' : 'none',
                          marginTop: item.mt ? 'auto' : 0,
                          cursor: 'pointer',
                        }}
                      >
                        <Icon size={15} />
                      </div>
                    );
                  })}
                </div>

                {/* Center Content */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '18px 20px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: '#0F0F0F',
                  }}
                >
                  {/* Dashboard Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '3px',
                        }}
                      >
                        Product Manager
                      </h4>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            backgroundColor: '#191919',
                            color: 'var(--text-secondary)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          Product
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            backgroundColor: '#191919',
                            color: 'var(--text-secondary)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          Mid Level
                        </span>
                      </div>
                    </div>

                    {/* Timer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                      }}
                    >
                      <span
                        style={{
                          color: '#F87171',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {formatTime(seconds)}
                      </span>
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#EF4444',
                        }}
                      />
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
                      marginBottom: '18px',
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
                      <p
                        style={{
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          lineHeight: 1.45,
                          fontWeight: 400,
                        }}
                      >
                        "How would you prioritize features for a new product?"
                      </p>
                    </div>
                  </div>

                  {/* Audio Waveform */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      padding: '8px 0',
                    }}
                  >
                    {[18, 30, 52, 74, 90, 62, 85, 96, 70, 45, 68, 92, 80, 55, 38, 24].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: '3.5px',
                          height: `${h * 0.65}%`,
                          backgroundColor: i % 2 === 0 ? 'var(--accent-gold)' : '#F6F0E7',
                          borderRadius: '3px',
                          opacity: 0.85,
                          animation: 'waveMotion 1.4s ease-in-out infinite',
                          animationDelay: `${i * 0.06}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Listening state indicator */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: 'auto',
                    }}
                  >
                    <button
                      onClick={() => setIsListening(!isListening)}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--text-primary)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#090909',
                        cursor: 'pointer',
                        boxShadow: '0 0 18px rgba(217, 183, 122, 0.35)',
                      }}
                    >
                      <Mic size={18} />
                    </button>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Listening...
                    </span>
                  </div>
                </div>

                {/* Right Panel: Scores */}
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
                      {/* 88% Score ring */}
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
                              strokeDashoffset="19.5"
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
                            }}
                          >
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              88%
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Overall Score
                        </span>
                      </div>

                      {/* Performance indicators */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { icon: MessageSquare, label: 'Communication', val: 90 },
                          { icon: Compass, label: 'Strategic Thinking', val: 86 },
                          { icon: Lightbulb, label: 'Problem Solving', val: 89 },
                          { icon: BarChart3, label: 'Confidence', val: 82 },
                        ].map((m, i) => (
                          <div key={i}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.65rem',
                                marginBottom: '2px',
                              }}
                            >
                              <span
                                style={{
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <m.icon size={11} color="var(--accent-gold)" />
                                {m.label}
                              </span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                {m.val}%
                              </span>
                            </div>
                            <div
                              style={{
                                height: '3px',
                                backgroundColor: '#1A1A1A',
                                borderRadius: '2px',
                                overflow: 'hidden',
                              }}
                            >
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
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <p style={{ marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--accent-gold)' }}>Interviewer:</strong> How do you prioritize features?
                      </p>
                      <p>
                        <strong style={{ color: 'var(--text-primary)' }}>Candidate:</strong> I evaluate impact vs. effort using RICE framework, customer retention metrics, and strategic goals...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .showcase-grid {
            grid-template-columns: 1fr !important;
          }
          .showcase-container {
            padding: 2.25rem !important;
          }
        }
        @media (max-width: 580px) {
          .showcase-dashboard {
            grid-template-columns: 1fr !important;
          }
          .showcase-dashboard > div:first-child,
          .showcase-dashboard > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
