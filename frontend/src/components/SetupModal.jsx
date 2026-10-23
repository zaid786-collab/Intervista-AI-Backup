import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight, 
  Mic, 
  Video, 
  Monitor, 
  Check, 
  AlertCircle, 
  Sparkles,
  Volume2
} from 'lucide-react';

export default function SetupModal({ isOpen, onClose, initialRole, onStartSession }) {
  const [role, setRole] = useState('Software Engineer');
  const [level, setLevel] = useState('Mid Level');
  const [interviewType, setInterviewType] = useState('Technical & Coding');
  const [duration, setDuration] = useState('30 min');

  // Hardware states
  const [micTested, setMicTested] = useState(false);
  const [micTesting, setMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (initialRole && initialRole !== 'all') {
      setRole(initialRole);
    }
  }, [initialRole]);

  // Clean up mic streams on modal close
  useEffect(() => {
    if (!isOpen) {
      stopMicTest();
    }
  }, [isOpen]);

  const testMicrophone = async () => {
    setPermissionError(null);
    setMicTesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
      setMicTested(true);
    } catch (err) {
      console.warn('Microphone permission not granted or device not available:', err);
      setPermissionError('Microphone access was denied or no input device found. You can still test with text input.');
      setMicTesting(false);
    }
  };

  const stopMicTest = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicTesting(false);
    setMicVolume(0);
  };

  const handleLaunch = () => {
    stopMicTest();
    onStartSession({
      role,
      level,
      interviewType,
      duration,
      micEnabled: micTested,
      cameraEnabled,
      screenShareEnabled,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 183, 122, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
              }}
            >
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Interview Setup
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '50%',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Role Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1A1A1A',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              <option value="Software Engineer">Software Engineer (Frontend / Backend / Fullstack)</option>
              <option value="Product Manager">Product Manager (Sense, Execution, Metrics)</option>
              <option value="Data Analyst">Data Analyst (SQL, Analytics, Business)</option>
              <option value="UX Designer">UX Designer (Design Thinking, Case Studies)</option>
              <option value="System Design Lead">System Design & Distributed Architecture</option>
              <option value="Behavioral & Leadership">Behavioral & Executive Leadership (STAR)</option>
            </select>
          </div>

          {/* Level & Interview Type Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seniority Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="Junior / Entry">Junior / Entry Level (0-2 yrs)</option>
                <option value="Mid Level">Mid Level (3-5 yrs)</option>
                <option value="Senior Level">Senior Level (6-9 yrs)</option>
                <option value="Staff / Principal">Staff / Principal (10+ yrs)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="15 min">15 minutes (Quick Warmup)</option>
                <option value="30 min">30 minutes (Standard Interview)</option>
                <option value="45 min">45 minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* Device Permissions & Hardware Check */}
          <div
            style={{
              backgroundColor: '#161616',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Hardware & Audio Permissions
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Intervista uses voice to create a live, natural mock interview.
                </p>
              </div>

              {/* Mic Test Button */}
              {!micTesting ? (
                <button
                  type="button"
                  onClick={testMicrophone}
                  className="btn-secondary"
                  style={{
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Mic size={14} />
                  <span>{micTested ? 'Retest Mic' : 'Test Microphone'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopMicTest}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#F87171',
                    borderRadius: '9999px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Stop Test
                </button>
              )}
            </div>

            {/* Mic Meter when testing */}
            {micTesting && (
              <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Speak into your mic to test input level:</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{micVolume}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${micVolume}%`,
                      backgroundColor: micVolume > 15 ? 'var(--status-live)' : 'var(--accent-gold)',
                      transition: 'width 0.08s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {permissionError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FCA5A5', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <AlertCircle size={14} />
                <span>{permissionError}</span>
              </div>
            )}

            {/* Optional Toggles */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={cameraEnabled}
                  onChange={(e) => setCameraEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <Video size={14} />
                <span>Enable Camera (Body language feedback)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={screenShareEnabled}
                  onChange={(e) => setScreenShareEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <Monitor size={14} />
                <span>Screen Sharing (Code / Diagram)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '2rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.7rem 1.4rem' }}>
            Cancel
          </button>
          <button onClick={handleLaunch} className="btn-primary" style={{ padding: '0.7rem 1.6rem' }}>
            <span>Proceed to Device Setup</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
