import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Mic,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Layers,
  Award,
  FileText,
  Upload,
  X,
  FileCheck,
} from 'lucide-react';

const COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Netflix',
  'Uber',
  'Stripe',
  'Tesla',
  'Adobe',
  'Salesforce',
  'OpenAI',
  'Other / Custom Startup',
];

const INTERVIEW_TYPES = [
  'Technical Interview',
  'System Design Interview',
  'Behavioral & Leadership',
  'DSA & Problem Solving',
  'Full Comprehensive Loop',
];

const DOMAINS_AND_TOPICS = [
  'C++',
  'Python',
  'Java',
  'JavaScript / TypeScript',
  'Go (Golang)',
  'Rust',
  'Data Structures & Algorithms',
  'System Design & Architecture',
  'Frontend Architecture',
  'Backend & Microservices',
  'Database & SQL Performance',
  'Machine Learning & AI',
];

const JOB_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'AI / ML Engineer',
  'System Architect',
  'DevOps / SRE Engineer',
  'Product Manager',
  'Engineering Manager',
];

const EXPERIENCE_LEVELS = ['Junior (0-2 yrs)', 'Mid Level (2-5 yrs)', 'Senior (5-8 yrs)', 'Staff / Lead (8+ yrs)'];

const DURATIONS = ['15 min', '30 min', '45 min'];

export default function MockInterviewSetupPage({ onLaunchSession, onBackToOverview }) {
  // Primary 4 Card Selectors (matching user reference image)
  const [targetCompany, setTargetCompany] = useState('Google');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [domainTopic, setDomainTopic] = useState('C++');
  const [jobRole, setJobRole] = useState('Software Engineer');

  // Secondary Settings
  const [experienceLevel, setExperienceLevel] = useState('Mid Level (2-5 yrs)');
  const [duration, setDuration] = useState('30 min');
  const [customNotes, setCustomNotes] = useState('');

  // Resume-Based Interview state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeRole, setResumeRole] = useState('Software Engineer');
  const [resumeCompany, setResumeCompany] = useState('Google');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);

  // Audio testing hardware state
  const [micTesting, setMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micTested, setMicTested] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleToggleMicTest = async () => {
    if (micTesting) {
      stopMicTest();
      return;
    }

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
      console.warn('Microphone permission error:', err);
      setPermissionError('Microphone permission not granted. You can still test with text input.');
      setMicTesting(false);
    }
  };

  const stopMicTest = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicTesting(false);
    setMicVolume(0);
  };

  useEffect(() => {
    return () => stopMicTest();
  }, []);

  const handleStart = () => {
    stopMicTest();
    if (onLaunchSession) {
      onLaunchSession({
        role: jobRole,
        company: targetCompany,
        level: experienceLevel.split(' ')[0],
        language: domainTopic,
        topic: domainTopic,
        interviewType,
        duration,
        notes: customNotes,
        micEnabled: micTested || micTesting,
      });
    }
  };

  const handleResumeFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setResumeFileName(file.name);
      setIsAnalyzingResume(true);
      setTimeout(() => {
        setIsAnalyzingResume(false);
        setResumeParsed(true);
      }, 700);
    }
  };

  const handleResumeLaunch = () => {
    stopMicTest();
    setResumeModalOpen(false);
    if (onLaunchSession) {
      onLaunchSession({
        role: resumeRole || jobRole,
        company: resumeCompany || targetCompany,
        level: experienceLevel.split(' ')[0],
        language: domainTopic,
        topic: 'Resume Deep Dive',
        interviewType: 'Resume-Based Technical Interview',
        duration,
        notes: resumeText || (resumeFileName ? `Resume attached: ${resumeFileName}` : 'Comprehensive resume projects evaluation'),
        isResumeBased: true,
        resumeName: resumeFileName || 'Candidate Resume',
        micEnabled: micTested || micTesting,
      });
    }
  };

  return (
    <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Top Navigation & Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <button
            onClick={onBackToOverview}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              padding: '0.2rem 0',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <ArrowLeft size={14} />
            <span>Overview</span>
          </button>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
            Mock Interview Setup
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              className="serif-heading"
              style={{
                fontSize: 'clamp(2.1rem, 3.5vw, 2.75rem)',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Mock Interview <span style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Setup</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0, maxWidth: '640px' }}>
              Select your target company, interview format, domain topic, and role to generate a tailored simulation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Resume Based Interview Button */}
            <button
              onClick={() => setResumeModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.7rem',
                padding: '0.78rem 1.65rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.18) 0%, rgba(217, 183, 122, 0.08) 100%)',
                border: '1.5px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                fontSize: '0.96rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(217, 183, 122, 0.25)',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #EAD6AF 0%, #D9B77A 100%)';
                e.currentTarget.style.color = '#080808';
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(217, 183, 122, 0.45), 0 0 22px rgba(217, 183, 122, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(217, 183, 122, 0.18) 0%, rgba(217, 183, 122, 0.08) 100%)';
                e.currentTarget.style.color = 'var(--accent-gold)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(217, 183, 122, 0.25)';
              }}
            >
              <FileText size={18} />
              <span>Resume Based Interview</span>
              <Sparkles size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THE 4 CARDS ROW (Exact match to reference UI screenshot)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
        className="selector-cards-row"
      >
        {/* Card 1: Target Company */}
        <div
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '16px',
            padding: '1.6rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'border-color 0.2s',
          }}
          className="filter-card"
        >
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '1.1rem',
              textAlign: 'center',
            }}
          >
            Target Company
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#080c14',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.94rem',
                padding: '0.75rem 2.25rem 0.75rem 1rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            >
              {COMPANIES.map((c) => (
                <option key={c} value={c} style={{ backgroundColor: '#0e131d', color: '#FFF' }}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="var(--text-secondary)"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Card 2: Interview Type */}
        <div
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '16px',
            padding: '1.6rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'border-color 0.2s',
          }}
          className="filter-card"
        >
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '1.1rem',
              textAlign: 'center',
            }}
          >
            Interview Type
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#080c14',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.94rem',
                padding: '0.75rem 2.25rem 0.75rem 1rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            >
              {INTERVIEW_TYPES.map((t) => (
                <option key={t} value={t} style={{ backgroundColor: '#0e131d', color: '#FFF' }}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="var(--text-secondary)"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Card 3: Domain / Topic */}
        <div
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '16px',
            padding: '1.6rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'border-color 0.2s',
          }}
          className="filter-card"
        >
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '1.1rem',
              textAlign: 'center',
            }}
          >
            Domain / Topic
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={domainTopic}
              onChange={(e) => setDomainTopic(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#080c14',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.94rem',
                padding: '0.75rem 2.25rem 0.75rem 1rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            >
              {DOMAINS_AND_TOPICS.map((d) => (
                <option key={d} value={d} style={{ backgroundColor: '#0e131d', color: '#FFF' }}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="var(--text-secondary)"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Card 4: Job Role */}
        <div
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '16px',
            padding: '1.6rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'border-color 0.2s',
          }}
          className="filter-card"
        >
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '1.1rem',
              textAlign: 'center',
            }}
          >
            Job Role
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#080c14',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.94rem',
                padding: '0.75rem 2.25rem 0.75rem 1rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            >
              {JOB_ROLES.map((r) => (
                <option key={r} value={r} style={{ backgroundColor: '#0e131d', color: '#FFF' }}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="var(--text-secondary)"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          LOWER PANEL: SIMULATION DETAILS & START BUTTON
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#0d1117',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '20px',
          padding: '2.25rem 2.5rem',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-gold)',
                  boxShadow: '0 0 10px var(--accent-gold)',
                }}
              />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, color: '#FFFFFF' }}>
                Simulation Profile: <span style={{ color: 'var(--accent-gold)' }}>{targetCompany}</span> · {jobRole}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Live evaluation on <strong style={{ color: '#FFFFFF' }}>{domainTopic}</strong> within a <strong style={{ color: '#FFFFFF' }}>{interviewType}</strong> round.
            </p>
          </div>

          {/* Seniority & Duration Quick Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Level:</span>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                style={{
                  backgroundColor: '#080c14',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} style={{ backgroundColor: '#0e131d' }}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Duration:</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      backgroundColor: duration === d ? 'rgba(217, 183, 122, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: duration === d ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: duration === d ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Optional Focus Notes Input */}
        <div style={{ marginTop: '1.75rem', marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Target Focus or Custom Topics (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Focus heavily on Concurrency, Dynamic Programming, and System Scalability..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '0.85rem 1.15rem',
              backgroundColor: '#080c14',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
          />
        </div>

        {/* Resume Based Interview Banner */}
        <div
          style={{
            marginTop: '1.5rem',
            marginBottom: '1.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(217, 183, 122, 0.05)',
            border: '1px dashed rgba(217, 183, 122, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 183, 122, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                flexShrink: 0,
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>
                Want interview questions based directly on your resume?
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Upload your resume to let the AI drill you on your exact past projects, architectures, and metrics.
              </div>
            </div>
          </div>

          <button
            onClick={() => setResumeModalOpen(true)}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(217, 183, 122, 0.15)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
              e.currentTarget.style.color = '#080808';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.15)';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
          >
            <FileText size={14} />
            <span>Resume Based Interview</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Footer Row: Mic Check & Big Launch Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Audio hardware status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: micTested ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                border: micTested ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: micTested ? '#22C55E' : 'var(--text-secondary)',
              }}
            >
              <Mic size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Microphone Status</span>
                <button
                  type="button"
                  onClick={handleToggleMicTest}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: micTesting ? '#EF4444' : 'var(--accent-gold)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  {micTesting ? 'Stop Test' : micTested ? 'Tested (Re-check)' : 'Check Mic'}
                </button>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {micTesting ? (
                  <span style={{ color: 'var(--accent-gold)' }}>Listening... Speak now ({micVolume}%)</span>
                ) : (
                  'AI voice synthesis & speech-to-text active'
                )}
              </div>
            </div>
          </div>

          {/* Action Launch Button */}
          <button
            onClick={handleStart}
            className="btn-primary"
            style={{
              padding: '0.95rem 2.25rem',
              fontSize: '1.02rem',
              fontWeight: 700,
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              backgroundColor: 'var(--accent-gold)',
              color: '#080808',
              boxShadow: '0 4px 24px rgba(217, 183, 122, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Start Mock Interview</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Resume Based Interview Modal */}
      {resumeModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setResumeModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0d1117',
              border: '1px solid rgba(217, 183, 122, 0.35)',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(217, 183, 122, 0.1)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(217, 183, 122, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                    Resume Based Interview
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                    Personalized AI simulation calibrated to your resume & projects
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResumeModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Role & Company for resume */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Target Company
                </label>
                <select
                  value={resumeCompany}
                  onChange={(e) => setResumeCompany(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#080c14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {COMPANIES.map((c) => (
                    <option key={c} value={c} style={{ backgroundColor: '#0e131d' }}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Target Role
                </label>
                <select
                  value={resumeRole}
                  onChange={(e) => setResumeRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#080c14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {JOB_ROLES.map((r) => (
                    <option key={r} value={r} style={{ backgroundColor: '#0e131d' }}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload Zone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Upload Resume (PDF, DOCX, TXT)
              </label>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.75rem',
                  border: resumeFileName ? '1px solid #22C55E' : '1px dashed rgba(217, 183, 122, 0.4)',
                  borderRadius: '12px',
                  backgroundColor: resumeFileName ? 'rgba(34, 197, 94, 0.05)' : '#080c14',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleResumeFileUpload}
                  style={{ display: 'none' }}
                />
                {resumeFileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22C55E' }}>
                    <CheckCircle2 size={20} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{resumeFileName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(Click to change)</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>
                      Click or drag & drop your resume file
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Supports PDF, Word, or plain text
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Paste Text / Key Highlights Area */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Or Paste Resume Text / Project Summary
              </label>
              <textarea
                rows={4}
                placeholder="Paste key achievements, tech stack, and project bullet points here (e.g. Built microservices in Go & Kafka handling 10k RPS, migrated DB to Postgres)..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.95rem',
                  backgroundColor: '#080c14',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* AI Analysis Preview Tag */}
            {(resumeFileName || resumeText.length > 20) && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(217, 183, 122, 0.08)',
                  border: '1px solid rgba(217, 183, 122, 0.25)',
                  fontSize: '0.8rem',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={16} />
                <span>
                  AI Resume Parser Ready: Questions will probe your listed architecture decisions, technical trade-offs, and project impact.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setResumeModalOpen(false)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResumeLaunch}
                style={{
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-gold)',
                  border: 'none',
                  color: '#080808',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 18px rgba(217, 183, 122, 0.35)',
                }}
              >
                <span>Start Resume-Based Interview</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Breakpoints Style */}
      <style>{`
        @media (max-width: 1024px) {
          .selector-cards-row {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .selector-cards-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
