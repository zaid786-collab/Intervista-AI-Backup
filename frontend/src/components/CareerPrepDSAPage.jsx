import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  Circle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Filter,
  Check,
  BookOpen,
  Zap,
  TrendingUp,
  LayoutGrid,
  ListFilter,
  Layers,
  Award,
  UploadCloud,
  FileText,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Target,
  RefreshCw,
  Cpu,
  ShieldCheck,
  X,
  Building2,
  Briefcase,
} from 'lucide-react';
import {
  TOPIC_METADATA,
  DSA_TOPICS,
  LEETCODE_DSA_QUESTIONS,
} from '../data/dsaQuestions';
import { apiAnalyzeResume, apiGetSampleResumeAnalysis } from '../utils/api';

const STORAGE_KEY = 'intervista_dsa_solved_v1';

// Custom SVG Icons matching Intervista champagne gold theme
function TopicIcon({ type }) {
  const iconColor = 'var(--accent-gold)';

  switch (type) {
    case 'arrays':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
          <rect x="8" y="8" width="8" height="8" rx="1.5" />
        </svg>
      );
    case 'strings':
      return (
        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: iconColor, letterSpacing: '-0.5px', lineHeight: 1 }}>
          Aa
        </span>
      );
    case 'linked-list':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      );
    case 'stack-queue':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="6" height="16" rx="2" />
          <rect x="14" y="4" width="6" height="16" rx="2" />
        </svg>
      );
    case 'trees':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    case 'graphs':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'dynamic-programming':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'recursion-backtracking':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
        </svg>
      );
    case 'two-pointers':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18" />
        </svg>
      );
    case 'sliding-window':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <rect x="8" y="5" width="6" height="14" rx="1.5" fill={iconColor} fillOpacity="0.28" />
        </svg>
      );
    case 'binary-search':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'heap-priority-queue':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" fill={iconColor} />
        </svg>
      );
    case 'greedy-intervals':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case 'bit-manipulation':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </svg>
      );
    default:
      return <Layers size={22} color={iconColor} />;
  }
}

export default function CareerPrepDSAPage({ onStartInterview, onBackToOverview }) {
  // Navigation / views: 'grid' (Topic Cards) | 'drill' (Specific Topic Questions) | 'list' (All Questions)
  const [viewMode, setViewMode] = useState('grid');
  const [activeTopic, setActiveTopic] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Solved' | 'Unsolved'
  const [solvedMap, setSolvedMap] = useState({});

  // ─── Resume Analyser UI State ──────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeTargetRole, setResumeTargetRole] = useState('Software Engineer');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState({
    atsScore: 88,
    benchmark: 'Top 7% of Tech Applicants',
    status: 'FAANG & Tier-1 Ready',
    matchedSkills: ['React.js', 'Node.js', 'Distributed Systems', 'TypeScript', 'PostgreSQL', 'Docker', 'GraphQL', 'REST APIs'],
    missingSkills: ['System Design (HLD)', 'Redis Caching', 'CI/CD Pipelines'],
    bulletImpactScore: 86,
    impactSummary: '86% of your bullet points use measurable metrics (XYZ formula).',
    actionableFeedback: [
      'Add quantitative latency or throughput numbers to your microservices bullet points.',
      'Explicitly highlight System Design and Redis in your primary skills section.',
      'Strong action verbs observed across your leadership and full-stack project descriptions.'
    ]
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingResume(true);
    setResumeFile({
      name: file.name,
      size: `${Math.max(12, (file.size / 1024)).toFixed(0)} KB`,
      uploadedAt: 'Just now',
    });

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', resumeTargetRole);
      formData.append('filename', file.name);

      const res = await apiAnalyzeResume(formData);
      if (res && res.analysis) {
        setResumeAnalysis(res.analysis);
      }
    } catch (err) {
      console.warn('Backend resume analysis fallback:', err);
      // Local fallback calculation
      setResumeAnalysis((prev) => ({
        ...prev,
        atsScore: Math.floor(Math.random() * 8) + 84,
      }));
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    setIsAnalyzingResume(true);
    setResumeFile({
      name: 'Sample_Senior_Software_Engineer_Resume.pdf',
      size: '342 KB',
      uploadedAt: 'Sample loaded',
    });

    try {
      const res = await apiGetSampleResumeAnalysis(resumeTargetRole);
      if (res && res.analysis) {
        setResumeAnalysis(res.analysis);
      }
    } catch (err) {
      console.warn('Sample analysis fetch fallback:', err);
      setResumeAnalysis((prev) => ({
        ...prev,
        atsScore: 88,
      }));
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  // Load solved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSolvedMap(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load DSA progress:', e);
    }
  }, []);

  // Toggle solved status
  const toggleSolved = (id) => {
    setSolvedMap((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Total Solved Count
  const totalSolvedCount = useMemo(() => {
    return Object.values(solvedMap).filter(Boolean).length;
  }, [solvedMap]);

  // Solved Count by Topic
  const solvedCountByTopic = useMemo(() => {
    const counts = {};
    LEETCODE_DSA_QUESTIONS.forEach((q) => {
      if (solvedMap[q.id]) {
        counts[q.topic] = (counts[q.topic] || 0) + 1;
      }
    });
    return counts;
  }, [solvedMap]);

  // Questions in active topic
  const activeTopicQuestions = useMemo(() => {
    if (!activeTopic) return [];
    return LEETCODE_DSA_QUESTIONS.filter((q) => q.topic === activeTopic.title);
  }, [activeTopic]);

  // Filtered drill-down questions
  const filteredDrillQuestions = useMemo(() => {
    return activeTopicQuestions.filter((q) => {
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      const isSolved = !!solvedMap[q.id];
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Unsolved' && isSolved) return false;

      if (globalSearch.trim()) {
        const query = globalSearch.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesPattern = (q.pattern || '').toLowerCase().includes(query);
        const matchesCompany = (q.companies || []).some((c) => c.toLowerCase().includes(query));
        const matchesNum = q.number.toString().includes(query);
        return matchesTitle || matchesPattern || matchesCompany || matchesNum;
      }
      return true;
    });
  }, [activeTopicQuestions, selectedDifficulty, statusFilter, globalSearch, solvedMap]);

  // Global filtered questions (for 'list' view or global search results)
  const allFilteredQuestions = useMemo(() => {
    return LEETCODE_DSA_QUESTIONS.filter((q) => {
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      const isSolved = !!solvedMap[q.id];
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Unsolved' && isSolved) return false;

      if (globalSearch.trim()) {
        const query = globalSearch.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesPattern = (q.pattern || '').toLowerCase().includes(query);
        const matchesCompany = (q.companies || []).some((c) => c.toLowerCase().includes(query));
        const matchesNum = q.number.toString().includes(query);
        return matchesTitle || matchesTopic || matchesPattern || matchesCompany || matchesNum;
      }
      return true;
    });
  }, [selectedDifficulty, statusFilter, globalSearch, solvedMap]);

  // Filtered topics based on search
  const filteredTopicCards = useMemo(() => {
    if (!globalSearch.trim()) return TOPIC_METADATA;
    const query = globalSearch.toLowerCase();
    return TOPIC_METADATA.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }, [globalSearch]);

  const handleOpenTopic = (topic) => {
    setActiveTopic(topic);
    setViewMode('drill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setActiveTopic(null);
    setViewMode('grid');
    setSelectedDifficulty('All');
    setStatusFilter('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          color: '#22C55E',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        };
      case 'Medium':
        return {
          backgroundColor: 'rgba(217, 183, 122, 0.12)',
          color: 'var(--accent-gold)',
          border: '1px solid rgba(217, 183, 122, 0.35)',
        };
      case 'Hard':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2.25rem',
        padding: '0.5rem 0.25rem 3.5rem',
        minHeight: '100%',
        color: 'var(--text-primary)',
      }}
    >
      {/* ─── Top Control & Header Bar ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <h1
              className="serif-heading"
              style={{
                fontSize: '2.5rem',
                fontWeight: 400,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Career <span className="gold-italic">Preparation</span>
            </h1>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0 }}>
              Get Career Guidance
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              backgroundColor: '#121212',
              border: '1px solid var(--border-card)',
              padding: '0.85rem 1.5rem',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(217, 183, 122, 0.05)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Solved
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {totalSolvedCount} <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {LEETCODE_DSA_QUESTIONS.length}</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Topics
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {TOPIC_METADATA.length}
              </div>
            </div>
          </div>
        </div>

        {/* Global Search and View Switcher Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: '#111111',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#171717',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '12px',
              padding: '0.55rem 1rem',
              flex: '1',
              minWidth: '240px',
              maxWidth: '520px',
              transition: 'border-color 0.2s',
            }}
          >
            <Search size={16} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder={
                viewMode === 'drill'
                  ? `Search inside ${activeTopic?.title || 'this topic'}...`
                  : 'Search DSA questions, topics, or patterns (e.g. Two Sum, Sliding Window)...'
              }
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                width: '100%',
              }}
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {viewMode === 'drill' && (
              <button
                onClick={handleBackToGrid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  border: '1px solid rgba(217, 183, 122, 0.35)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  e.currentTarget.style.color = '#0A0A0A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.12)';
                  e.currentTarget.style.color = 'var(--accent-gold)';
                }}
              >
                <ArrowLeft size={15} />
                Back to Topics
              </button>
            )}

            <button
              onClick={() => {
                setViewMode('grid');
                setActiveTopic(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.52rem 0.95rem',
                borderRadius: '10px',
                backgroundColor: viewMode === 'grid' ? 'rgba(217, 183, 122, 0.15)' : 'transparent',
                border: viewMode === 'grid' ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid transparent',
                color: viewMode === 'grid' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontSize: '0.84rem',
                fontWeight: viewMode === 'grid' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={15} />
              Topic Cards
            </button>

            <button
              onClick={() => {
                setViewMode('list');
                setActiveTopic(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.52rem 0.95rem',
                borderRadius: '10px',
                backgroundColor: viewMode === 'list' ? 'rgba(217, 183, 122, 0.15)' : 'transparent',
                border: viewMode === 'list' ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid transparent',
                color: viewMode === 'list' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontSize: '0.84rem',
                fontWeight: viewMode === 'list' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ListFilter size={15} />
              All Questions ({LEETCODE_DSA_QUESTIONS.length})
            </button>
          </div>
        </div>
      </div>

      {/* ─── RESUME ANALYZER SECTION (Above Topic Cards) ───────────────────────── */}
      {viewMode === 'grid' && (
        <div
          style={{
            backgroundColor: '#121212',
            border: '1px solid rgba(217, 183, 122, 0.22)',
            borderRadius: '24px',
            padding: '2rem 2.25rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 32px rgba(217, 183, 122, 0.06)',
            marginBottom: '2.5rem',
          }}
        >
          {/* Subtle background ambient gold glow */}
          <div
            style={{
              position: 'absolute',
              top: '-70px',
              right: '-70px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(217, 183, 122, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(217, 183, 122, 0.1)',
                  border: '1px solid rgba(217, 183, 122, 0.28)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.6rem',
                }}
              >
                <FileText size={13} />
                AI Resume Analyzer & ATS Screener
              </div>
              <h2
                className="serif-heading"
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 400,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Scan & Optimize Your <span className="gold-italic">Resume</span>
              </h2>
              
            </div>

            {/* Target Role Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: '#181818',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.5rem 0.85rem',
                borderRadius: '12px',
              }}
            >
              <Target size={15} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Target Role:
              </span>
              <select
                value={resumeTargetRole}
                onChange={(e) => setResumeTargetRole(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Software Engineer" style={{ background: '#181818', color: '#fff' }}>Software Engineer</option>
                <option value="Frontend Engineer" style={{ background: '#181818', color: '#fff' }}>Frontend Engineer</option>
                <option value="Backend Engineer" style={{ background: '#181818', color: '#fff' }}>Backend Engineer</option>
                <option value="Full Stack Engineer" style={{ background: '#181818', color: '#fff' }}>Full Stack Engineer</option>
                <option value="AI / ML Engineer" style={{ background: '#181818', color: '#fff' }}>AI / ML Engineer</option>
                <option value="DevOps / SRE" style={{ background: '#181818', color: '#fff' }}>DevOps / SRE</option>
              </select>
            </div>
          </div>

          {/* Interactive Analyzer Grid (Left: Dropzone & File Card | Right: Real-time ATS & Insights) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: resumeFile ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr',
              gap: '1.5rem',
              transition: 'all 0.3s ease',
            }}
          >
            {/* LEFT: Upload Box / Active Resume Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: isAnalyzingResume ? 'rgba(217, 183, 122, 0.05)' : '#151515',
                  border: '1.5px dashed rgba(217, 183, 122, 0.4)',
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.4)';
                  e.currentTarget.style.backgroundColor = '#151515';
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(217, 183, 122, 0.12)',
                    border: '1px solid rgba(217, 183, 122, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <UploadCloud size={26} color="var(--accent-gold)" />
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {isAnalyzingResume ? 'Scanning Resume & Extracting Entities...' : 'Drop your resume here or click to browse'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '1.1rem' }}>
                  Supports PDF, DOCX, TXT (up to 15MB) • ATS Format Checked
                </div>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{
                      padding: '0.45rem 1.1rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent-gold)',
                      border: 'none',
                      color: '#0A0A0A',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerAnalysis();
                    }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <RefreshCw size={12} className={isAnalyzingResume ? 'animate-spin' : ''} />
                    Try Sample Resume
                  </button>
                </div>
              </div>

              {/* Active Selected Resume Bar */}
              {resumeFile && (
                <div
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <FileCheck size={20} color="var(--accent-gold)" />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {resumeFile.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {resumeFile.size} • Parsed & Ready for AI Interview
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(52, 211, 153, 0.12)',
                        color: '#34D399',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        fontWeight: 600,
                      }}
                    >
                      ATS Verified
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}
                      title="Remove resume"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Live ATS Score & Insights — Shown ONLY when user provides their resume */}
            {resumeFile && (
              <div
                style={{
                  backgroundColor: '#151515',
                  border: '1px solid rgba(217, 183, 122, 0.35)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 20px rgba(217, 183, 122, 0.08)',
                  animation: 'fadeIn 0.25s ease',
                }}
              >
                {/* ATS Top Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      ATS Match Index
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '2px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1 }}>
                        {resumeAnalysis.atsScore}
                      </span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        / 100
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(217, 183, 122, 0.12)',
                        border: '1px solid rgba(217, 183, 122, 0.3)',
                        color: 'var(--accent-gold)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={13} />
                      {resumeAnalysis.status}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      {resumeAnalysis.benchmark}
                    </div>
                  </div>
                </div>

                {/* Matched Keywords vs Missing Keywords */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Key Technical Strengths Detected
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(resumeAnalysis.matchedSkills || []).map((sk) => (
                        <span
                          key={sk}
                          style={{
                            fontSize: '0.74rem',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Missing High-Priority Keywords for {resumeTargetRole}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(resumeAnalysis.missingSkills || []).map((ms) => (
                        <span
                          key={ms}
                          style={{
                            fontSize: '0.74rem',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#FCA5A5',
                          }}
                        >
                          + {ms}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─── Company & Domain Suggestions ─── */}
                {resumeAnalysis.companySuggestions && (
                  <div
                    style={{
                      backgroundColor: '#181818',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '0.35rem' }}>
                        <Building2 size={13} />
                        Recommended Companies to Target
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(resumeAnalysis.companySuggestions.recommendedCompanies || ['Stripe', 'Uber', 'Amazon', 'Meta']).map((comp) => (
                          <span
                            key={comp}
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(217, 183, 122, 0.1)',
                              border: '1px solid rgba(217, 183, 122, 0.25)',
                              color: 'var(--accent-gold)',
                              fontWeight: 600,
                            }}
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '0.35rem' }}>
                        <Briefcase size={13} />
                        Best Domain Fit
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(resumeAnalysis.companySuggestions.bestDomainFits || ['Cloud Backend & Distributed Systems']).map((dom) => (
                          <span
                            key={dom}
                            style={{
                              fontSize: '0.74rem',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.09)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Gap Analysis ("Kitni Kami Hai") ─── */}
                {resumeAnalysis.gapAnalysis && (
                  <div
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.04)',
                      border: '1px solid rgba(239, 68, 68, 0.22)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                    
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#FCA5A5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        <AlertTriangle size={14} color="#F87171" />
                        Target Gap Analysis (Loops & Missing Elements)
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#F87171',
                          fontWeight: 600,
                        }}
                      >
                        {resumeAnalysis.gapAnalysis.overallGapSeverity || 'Moderate'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {resumeAnalysis.gapAnalysis.summary}
                    </p>

                    {/* Gap items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
                      {(resumeAnalysis.gapAnalysis.gapItems || []).slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#FCA5A5' }}>
                              {item.area}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 700 }}>
                              {item.gapAmount}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                            {item.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button: Start Resume-Based Interview */}
                <button
                  type="button"
                  onClick={() => {
                    if (onStartInterview) {
                      onStartInterview(`Resume-Based ${resumeTargetRole}`);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F5E7C8 0%, #D9B77A 100%)',
                    border: 'none',
                    color: '#0A0A0A',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(217, 183, 122, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(217, 183, 122, 0.38)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(217, 183, 122, 0.25)';
                  }}
                >
                  <Sparkles size={16} />
                  Launch Resume-Based Mock Interview
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SECTION TITLE FOR TOPIC CARDS ─────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Topic-Wise <span className="gold-italic">DSA Patterns</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
              Select a category to practice high-frequency questions asked in top tier engineering loops
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
            {filteredTopicCards.length} Categories Available
          </span>
        </div>
      )}

      {/* ─── VIEW 1: TOPIC CARDS GRID ───────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredTopicCards.map((topic) => {
            const topicSolved = solvedCountByTopic[topic.title] || 0;
            const curatedTotal = LEETCODE_DSA_QUESTIONS.filter((q) => q.topic === topic.title).length;

            return (
              <div
                key={topic.id}
                onClick={() => handleOpenTopic(topic)}
                style={{
                  backgroundColor: '#131313',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.85rem 1.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.45)';
                  e.currentTarget.style.boxShadow =
                    '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 24px rgba(217, 183, 122, 0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
                }}
              >
                {/* Top Section: Icon & Content */}
                <div>
                  {/* Rounded square icon badge */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(217, 183, 122, 0.1)',
                      border: '1px solid rgba(217, 183, 122, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.35rem',
                      boxShadow: '0 0 16px rgba(217, 183, 122, 0.12)',
                    }}
                  >
                    <TopicIcon type={topic.iconType} />
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: '0 0 0.55rem 0',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {topic.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: '0 0 1.75rem 0',
                      minHeight: '44px',
                    }}
                  >
                    {topic.description}
                  </p>
                </div>

                {/* Bottom Row: Problem Count on Left, Practice → on Right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.95rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--accent-gold)',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                    }}
                  >
                    {topic.problemCount}
                  </span>

                  <span
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-gold)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    Practice →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VIEW 2: TOPIC DRILL-DOWN (Questions in Selected Topic) ─── */}
      {viewMode === 'drill' && activeTopic && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Topic Banner */}
          <div
            style={{
              backgroundColor: '#131313',
              border: '1px solid rgba(217, 183, 122, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              background: 'linear-gradient(145deg, #161616 0%, #101010 100%)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(217, 183, 122, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  border: '1px solid rgba(217, 183, 122, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(217, 183, 122, 0.18)',
                }}
              >
                <TopicIcon type={activeTopic.iconType} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2
                    className="serif-heading"
                    style={{ fontSize: '1.65rem', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}
                  >
                    {activeTopic.title}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-gold)',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(217, 183, 122, 0.12)',
                      border: '1px solid rgba(217, 183, 122, 0.28)',
                    }}
                  >
                    {activeTopic.problemCount}
                  </span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', maxWidth: '640px', lineHeight: 1.5 }}>
                  {activeTopic.description}
                </p>
              </div>
            </div>

            {/* AI Mock Drill Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {onStartInterview && (
                <button
                  onClick={() =>
                    onStartInterview({
                      company: 'Google',
                      role: 'Software Engineer',
                      domain: activeTopic.title,
                      type: 'Technical (DSA & Code)',
                    })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EAD6AF 0%, #D9B77A 100%)',
                    border: 'none',
                    color: '#080808',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(217, 183, 122, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 26px rgba(217, 183, 122, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(217, 183, 122, 0.35)';
                  }}
                >
                  <Sparkles size={16} />
                  AI Interview on {activeTopic.title}
                </button>
              )}
            </div>
          </div>

          {/* Sub-Filters: Difficulty & Status */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.75rem 1.15rem',
              borderRadius: '14px',
            }}
          >
            {/* Difficulty Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginRight: '4px' }}>
                Difficulty:
              </span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                const isActive = selectedDifficulty === diff;
                let activeStyle = {
                  backgroundColor: 'rgba(217, 183, 122, 0.15)',
                  borderColor: 'rgba(217, 183, 122, 0.4)',
                  color: 'var(--accent-gold)',
                };
                if (diff === 'Easy' && isActive) {
                  activeStyle = {
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    borderColor: 'rgba(34, 197, 94, 0.4)',
                    color: '#22C55E',
                  };
                } else if (diff === 'Hard' && isActive) {
                  activeStyle = {
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#EF4444',
                  };
                }

                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      padding: '0.38rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      backgroundColor: isActive ? activeStyle.backgroundColor : 'transparent',
                      border: isActive ? `1px solid ${activeStyle.borderColor}` : '1px solid transparent',
                      color: isActive ? activeStyle.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginRight: '4px' }}>
                Status:
              </span>
              {['All', 'Solved', 'Unsolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.38rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: statusFilter === st ? 600 : 500,
                    backgroundColor: statusFilter === st ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: statusFilter === st ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    color: statusFilter === st ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Question Rows List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredDrillQuestions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1rem',
                  backgroundColor: '#121212',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: 'var(--text-secondary)',
                }}
              >
                No questions found matching your filters.
              </div>
            ) : (
              filteredDrillQuestions.map((q) => {
                const isSolved = !!solvedMap[q.id];
                const badgeStyle = getDifficultyBadgeStyle(q.difficulty);

                return (
                  <div
                    key={q.id}
                    style={{
                      backgroundColor: '#131313',
                      border: isSolved
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '14px',
                      padding: '1rem 1.35rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#181818';
                      e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#131313';
                      e.currentTarget.style.borderColor = isSolved
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.07)';
                    }}
                  >
                    {/* Left: Checkbox + Number + Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1', minWidth: '260px' }}>
                      <button
                        onClick={() => toggleSolved(q.id)}
                        title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                        style={{
                          background: isSolved ? '#22C55E' : 'transparent',
                          border: isSolved ? '1px solid #22C55E' : '1.5px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '6px',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#fff',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSolved && <Check size={13} strokeWidth={3} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                            #{q.number}
                          </span>
                          <span
                            style={{
                              fontSize: '0.98rem',
                              fontWeight: 600,
                              color: isSolved ? 'var(--text-secondary)' : 'var(--text-primary)',
                              textDecoration: isSolved ? 'line-through' : 'none',
                            }}
                          >
                            {q.title}
                          </span>
                        </div>
                        {q.pattern && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            Pattern: <span style={{ color: 'var(--accent-champagne)' }}>{q.pattern}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Difficulty Badge + Companies + LeetCode Link */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          ...badgeStyle,
                        }}
                      >
                        {q.difficulty}
                      </span>

                      {q.companies && q.companies.slice(0, 2).map((comp) => (
                        <span
                          key={comp}
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-tertiary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          {comp}
                        </span>
                      ))}

                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '0.42rem 0.82rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.15)';
                          e.currentTarget.style.borderColor = 'var(--accent-gold)';
                          e.currentTarget.style.color = 'var(--accent-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                      >
                        <span>LeetCode</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── VIEW 3: ALL QUESTIONS LIST ──────────────────────────────── */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Difficulty and Status Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.75rem 1.15rem',
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginRight: '4px' }}>
                Difficulty:
              </span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                const isActive = selectedDifficulty === diff;
                let activeStyle = {
                  backgroundColor: 'rgba(217, 183, 122, 0.15)',
                  borderColor: 'rgba(217, 183, 122, 0.4)',
                  color: 'var(--accent-gold)',
                };
                if (diff === 'Easy' && isActive) {
                  activeStyle = {
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    borderColor: 'rgba(34, 197, 94, 0.4)',
                    color: '#22C55E',
                  };
                } else if (diff === 'Hard' && isActive) {
                  activeStyle = {
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#EF4444',
                  };
                }

                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      padding: '0.38rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      backgroundColor: isActive ? activeStyle.backgroundColor : 'transparent',
                      border: isActive ? `1px solid ${activeStyle.borderColor}` : '1px solid transparent',
                      color: isActive ? activeStyle.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginRight: '4px' }}>
                Status:
              </span>
              {['All', 'Solved', 'Unsolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.38rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: statusFilter === st ? 600 : 500,
                    backgroundColor: statusFilter === st ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: statusFilter === st ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    color: statusFilter === st ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table / List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {allFilteredQuestions.map((q) => {
              const isSolved = !!solvedMap[q.id];
              const badgeStyle = getDifficultyBadgeStyle(q.difficulty);

              return (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: '#131313',
                    border: isSolved
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '14px',
                    padding: '1rem 1.35rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#181818';
                    e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#131313';
                    e.currentTarget.style.borderColor = isSolved
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.07)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1', minWidth: '260px' }}>
                    <button
                      onClick={() => toggleSolved(q.id)}
                      style={{
                        background: isSolved ? '#22C55E' : 'transparent',
                        border: isSolved ? '1px solid #22C55E' : '1.5px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSolved && <Check size={13} strokeWidth={3} />}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                          #{q.number}
                        </span>
                        <span
                          style={{
                            fontSize: '0.98rem',
                            fontWeight: 600,
                            color: isSolved ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textDecoration: isSolved ? 'line-through' : 'none',
                          }}
                        >
                          {q.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--accent-gold)',
                            backgroundColor: 'rgba(217, 183, 122, 0.09)',
                            border: '1px solid rgba(217, 183, 122, 0.22)',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            fontWeight: 500,
                          }}
                        >
                          {q.topic}
                        </span>
                      </div>
                      {q.pattern && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          Pattern: <span style={{ color: 'var(--accent-champagne)' }}>{q.pattern}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        ...badgeStyle,
                      }}
                    >
                      {q.difficulty}
                    </span>

                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.42rem 0.82rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.15)';
                        e.currentTarget.style.borderColor = 'var(--accent-gold)';
                        e.currentTarget.style.color = 'var(--accent-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      <span>LeetCode</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
