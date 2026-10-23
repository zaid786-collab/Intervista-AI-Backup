/**
 * CompaniesSection — Full Companies interview preparation tab for Intervista AI.
 * Replaces the simple CompanyLogos strip when navigating to Companies.
 * Includes: CardSwap showcase, searchable company browser, sidebar, and
 * complete preparation content for each selected company.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ChevronDown, ChevronRight, ExternalLink, Check,
  BookOpen, Code, Brain, Users, Target, Layers, Award,
  ArrowRight, X, Filter, CheckCircle2, Circle, Star,
  Building2, Sparkles, GraduationCap, Globe,
} from 'lucide-react';
import CardSwap, { Card } from './CardSwap';
import COMPANIES, {
  BEHAVIORAL_QUESTIONS,
  PREPARATION_PHASES,
  SOURCE_LABELS,
  GENERAL_RESOURCES,
} from '../data/companyData';

// ─── Local Storage persistence ──────────────────────────────────────────────
const STORAGE_KEY = 'intervista-company-progress';

function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* silent */ }
}

// ─── Difficulty badge colors ────────────────────────────────────────────────
const difficultyColors = {
  Easy: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
  Medium: { bg: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  Hard: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
};

// ─── Source type badge ──────────────────────────────────────────────────────
const sourceColors = {
  official: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22C55E' },
  candidate: { bg: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' },
  community: { bg: 'rgba(96, 165, 250, 0.12)', color: '#60A5FA' },
  editorial: { bg: 'rgba(167, 139, 250, 0.12)', color: '#A78BFA' },
};

// ─── Featured cards for CardSwap (top 5 FAANG companies) ────────────────────
const FEATURED_COMPANY_IDS = ['google', 'microsoft', 'amazon', 'meta', 'apple'];

// ─── Component ──────────────────────────────────────────────────────────────
export default function CompaniesSection({
  activeCompanyId,
  onCompanyChange,
  onStartInterview,
  onBackToHome,
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompanyId || 'google');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [topicFilter, setTopicFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [progress, setProgress] = useState(loadProgress);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const contentRef = useRef(null);
  const cardSwapWrapperRef = useRef(null);

  // Sync with prop if it changes
  useEffect(() => {
    if (activeCompanyId && activeCompanyId !== selectedCompanyId) {
      setSelectedCompanyId(activeCompanyId);
      setActiveSection('overview');
      setTopicFilter('All');
      setDifficultyFilter('All');
      setExpandedQuestions({});
    }
  }, [activeCompanyId]);

  // Global custom event listener so any button on the page can trigger company selection
  useEffect(() => {
    const handleCustomSelect = (e) => {
      if (e.detail) {
        selectCompany(e.detail);
      }
    };
    window.addEventListener('intervista:selectCompany', handleCustomSelect);
    return () => window.removeEventListener('intervista:selectCompany', handleCustomSelect);
  }, []);

  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) || COMPANIES[0];

  // Persist progress
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Select company handler: animates to the selected company's card and scrolls to the card deck
  const selectCompany = useCallback((id, shouldScrollToCards = true) => {
    setSelectedCompanyId(id);
    onCompanyChange?.(id);
    setActiveSection('overview');
    setTopicFilter('All');
    setDifficultyFilter('All');
    setExpandedQuestions({});
    setShowMobileSidebar(false);

    if (shouldScrollToCards) {
      setTimeout(() => {
        cardSwapWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [onCompanyChange]);

  // Toggle question solved state
  const toggleSolved = useCallback((questionId) => {
    setProgress(prev => {
      const next = { ...prev };
      if (next[questionId]) {
        delete next[questionId];
      } else {
        next[questionId] = { solved: true, date: new Date().toISOString() };
      }
      return next;
    });
  }, []);

  // Toggle question expanded
  const toggleExpanded = useCallback((questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  // Filter companies by search
  const filteredCompanies = COMPANIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get all questions for current company
  const allQuestions = [
    ...selectedCompany.reportedQuestions,
    ...selectedCompany.practiceQuestions,
  ];

  // Get unique topics for current company
  const companyTopics = [...new Set(allQuestions.map(q => q.topic).filter(Boolean))];

  // Filter questions
  const filterQuestions = (questions) => {
    return questions.filter(q => {
      if (topicFilter !== 'All' && q.topic !== topicFilter) return false;
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  };

  // Calculate progress stats
  const totalQuestions = allQuestions.length;
  const solvedCount = allQuestions.filter(q => progress[q.id]?.solved).length;
  const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

  // Sections for navigation
  const sections = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'questions', label: 'Interview Questions', icon: Brain },
    { id: 'practice', label: 'Practice Problems', icon: Code },
    { id: 'resources', label: 'Resources', icon: ExternalLink },
    { id: 'corecs', label: 'Core CS & Tech', icon: Layers },
    ...(selectedCompany.hasAptitude ? [{ id: 'aptitude', label: 'Aptitude', icon: GraduationCap }] : []),
    { id: 'behavioral', label: 'Behavioral', icon: Users },
    { id: 'roadmap', label: 'Preparation Guide', icon: Target },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <section
      id="companies"
      style={{
        padding: 'calc(var(--nav-height) + 2.5rem) 0 5rem',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      <div className="container">
        {/* Navigation Breadcrumb */}
        {onBackToHome && (
          <div style={{ marginBottom: '1.75rem' }}>
            <button
              onClick={onBackToHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '0.35rem 0',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <span>← Back to Home</span>
              <span>/</span>
              <span style={{ color: 'var(--text-secondary)' }}>Companies</span>
              <span>/</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{selectedCompany.name}</span>
            </button>
          </div>
        )}

        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto 4.5rem',
          position: 'relative',
          zIndex: 10,
        }}>
          <span className="eyebrow-tag" style={{ marginBottom: '0.75rem', display: 'block' }}>
            COMPANY PREPARATION
          </span>
          <h2 className="section-title">
            Prepare for <span className="gold-italic">Every Company</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 0.75rem' }}>
            Curated interview preparation guides, practice problems, and resources for 15 leading companies.
          </p>
          <p style={{
            color: 'var(--text-tertiary)',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}>
            Research snapshot: October 2026 · Questions are high-priority practice prompts, not guaranteed interview questions
          </p>
        </div>

        {/* CardSwap Showcase */}
        <div
          ref={cardSwapWrapperRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '4.5rem',
            position: 'relative',
            minHeight: '340px',
            paddingTop: '2.5rem',
            zIndex: 1,
          }}
          className="cardswap-wrapper"
        >
          <CardSwap
            width={350}
            height={220}
            cardDistance={28}
            verticalDistance={14}
            autoPlay={false}
            activeId={selectedCompanyId}
            skewAmount={3}
            onCardClick={(cId) => selectCompany(cId, false)}
          >
            {COMPANIES.map((company) => {
              const cId = company.id;
              const isSelected = cId === selectedCompanyId;
              const companyQs = [...company.reportedQuestions, ...company.practiceQuestions];
              const companySolved = companyQs.filter(q => progress[q.id]?.solved).length;
              return (
                <Card key={cId} id={cId} data-company-id={cId}>
                  <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.4rem',
                    background: `linear-gradient(135deg, rgba(${hexToRgb(company.brandColor)}, ${isSelected ? 0.22 : 0.12}) 0%, var(--bg-card) 65%)`,
                    position: 'relative',
                    border: isSelected ? `1.5px solid ${company.brandColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected ? `0 12px 35px rgba(${hexToRgb(company.brandColor)}, 0.25)` : '0 8px 25px rgba(0, 0, 0, 0.4)',
                    borderRadius: '16px',
                    transition: 'border 0.3s ease, box-shadow 0.3s ease',
                  }}>
                    {/* Brand accent bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3.5px',
                      background: `linear-gradient(90deg, ${company.brandColor}, transparent)`,
                    }} />

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem',
                      }}>
                        <div style={{
                          fontSize: '1.45rem',
                          fontWeight: 700,
                          color: company.brandColor,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {company.name}
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}>
                          {companySolved}/{companyQs.length} solved
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {company.description}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.65rem',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.45rem',
                        flexWrap: 'wrap',
                      }}>
                        {company.preparationFocus.slice(0, 3).map((f, i) => (
                          <span key={i} style={{
                            fontSize: '0.64rem',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-tertiary)',
                          }}>
                            {f}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCompany(cId, false);
                          setTimeout(() => {
                            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 60);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'none',
                          border: 'none',
                          color: company.brandColor,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '0.25rem 0.4rem',
                        }}
                      >
                        <span>View Prep</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </CardSwap>
        </div>

        {/* Company Browser Grid */}
        <div style={{ marginBottom: '2.5rem' }}>
          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            maxWidth: '400px',
            margin: '0 auto 1.25rem',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
            }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search companies"
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-sans)',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Company Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
            className="company-grid"
          >
            {filteredCompanies.map((company) => {
              const isActive = company.id === selectedCompanyId;
              const companyQs = [...company.reportedQuestions, ...company.practiceQuestions];
              const companySolved = companyQs.filter(q => progress[q.id]?.solved).length;
              return (
                <button
                  key={company.id}
                  onClick={() => selectCompany(company.id)}
                  aria-label={`Select ${company.name}`}
                  aria-pressed={isActive}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: isActive ? 'rgba(217, 183, 122, 0.08)' : 'var(--bg-card)',
                    border: `1px solid ${isActive ? 'var(--border-gold)' : 'var(--border-card)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--border-card)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    }
                  }}
                >
                  {/* Brand dot */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: company.brandColor,
                    flexShrink: 0,
                    boxShadow: isActive ? `0 0 8px ${company.brandColor}60` : 'none',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {company.name}
                    </div>
                    {companyQs.length > 0 && (
                      <div style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-tertiary)',
                        marginTop: '0.15rem',
                      }}>
                        {companySolved}/{companyQs.length} solved
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      backgroundColor: 'var(--accent-gold)',
                      borderRadius: '0 2px 2px 0',
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {filteredCompanies.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-tertiary)',
              fontSize: '0.9rem',
            }}>
              No companies match "{searchQuery}"
            </div>
          )}
        </div>

        {/* ═══ Main Content Area ═══ */}
        <div ref={contentRef} style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
          className="companies-layout"
        >
          {/* Left: Companies Directory & Section Navigation */}
          <aside
            style={{
              position: 'sticky',
              top: 'calc(var(--nav-height) + 1.25rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: 'calc(100vh - var(--nav-height) - 2.5rem)',
              overflowY: 'auto',
              paddingRight: '0.4rem',
            }}
            className="companies-sidebar"
            aria-label="Company directory and page sections"
          >
            {/* Mobile sidebar toggle button */}
            <button
              className="mobile-sidebar-toggle"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              aria-label="Toggle directory & sections menu"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              <Building2 size={16} style={{ color: 'var(--accent-gold)' }} />
              <span>{selectedCompany.name} · {sections.find(s => s.id === activeSection)?.label}</span>
              <ChevronDown size={14} style={{ marginLeft: 'auto', transform: showMobileSidebar ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {/* Collapsible container on mobile */}
            <div
              className="sidebar-inner"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* 1. All 15 Companies Directory */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '0.85rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.6rem',
                  paddingBottom: '0.45rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}>
                    <Building2 size={12} style={{ color: 'var(--accent-gold)' }} />
                    Companies ({COMPANIES.length})
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    color: 'var(--accent-gold)',
                    backgroundColor: 'rgba(217, 183, 122, 0.1)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}>
                    15 Total
                  </span>
                </div>

                {/* Company list with scroll */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
                  }}
                  className="sidebar-company-list"
                >
                  {COMPANIES.map((c) => {
                    const isActive = c.id === selectedCompanyId;
                    const cQuestions = [...c.reportedQuestions, ...c.practiceQuestions];
                    const cSolved = cQuestions.filter(q => progress[q.id]?.solved).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => selectCompany(c.id)}
                        aria-label={`Select ${c.name}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.42rem 0.65rem',
                          borderRadius: '8px',
                          border: `1px solid ${isActive ? 'var(--border-gold)' : 'transparent'}`,
                          backgroundColor: isActive ? 'rgba(217, 183, 122, 0.1)' : 'transparent',
                          color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 600 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.18s ease',
                          fontFamily: 'var(--font-sans)',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: c.brandColor,
                              flexShrink: 0,
                              boxShadow: isActive ? `0 0 6px ${c.brandColor}` : 'none',
                            }}
                          />
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {c.name}
                          </span>
                        </div>
                        {cSolved > 0 && (
                          <span style={{
                            fontSize: '0.62rem',
                            color: '#22C55E',
                            backgroundColor: 'rgba(34, 197, 94, 0.12)',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                          }}>
                            {cSolved}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Section Navigation */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '0.85rem',
              }}>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  paddingBottom: '0.4rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}>
                  <Layers size={12} style={{ color: 'var(--accent-gold)' }} />
                  Sections
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }} className="section-nav-items">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSection(s.id);
                          setShowMobileSidebar(false);
                        }}
                        className="section-nav-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          padding: '0.45rem 0.65rem',
                          backgroundColor: isActive ? 'rgba(217, 183, 122, 0.08)' : 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 600 : 500,
                          transition: 'all 0.18s ease',
                          textAlign: 'left',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '2px',
                            height: '60%',
                            backgroundColor: 'var(--accent-gold)',
                            borderRadius: '0 2px 2px 0',
                          }} />
                        )}
                        <Icon size={14} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Right: Content */}
          <div style={{ minWidth: 0 }}>
            {/* Company Header */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Brand gradient accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${selectedCompany.brandColor}, transparent)`,
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem',
                  }}>
                    {selectedCompany.name}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                  }}>
                    {selectedCompany.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedCompany.preparationFocus.slice(0, 5).map((f, i) => (
                      <span key={i} style={{
                        fontSize: '0.68rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: `rgba(${hexToRgb(selectedCompany.brandColor)}, 0.1)`,
                        border: `1px solid rgba(${hexToRgb(selectedCompany.brandColor)}, 0.25)`,
                        color: selectedCompany.brandColor,
                        fontWeight: 500,
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Header Actions */}
                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {onStartInterview && (
                      <button
                        onClick={() => onStartInterview(`${selectedCompany.name} Candidate`)}
                        className="btn-primary"
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.45rem 1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={14} />
                        Start {selectedCompany.name} AI Mock
                      </button>
                    )}
                    {selectedCompany.resources.find(r => r.type === 'official') && (
                      <a
                        href={selectedCompany.resources.find(r => r.type === 'official').url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost-outline"
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.45rem 0.9rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <ExternalLink size={13} />
                        Official Guidance
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress Circle */}
                {totalQuestions > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                        <circle
                          cx="32" cy="32" r="28"
                          fill="none"
                          stroke="var(--accent-gold)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${progressPercent * 1.76} 176`}
                          transform="rotate(-90 32 32)"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--accent-gold)',
                      }}>
                        {progressPercent}%
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      {solvedCount}/{totalQuestions} solved
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Section Content ─── */}

            {/* OVERVIEW */}
            {activeSection === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Interview Focus */}
                <ContentCard title="Interview Focus" icon={Target}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {selectedCompany.interviewFocusNote}
                  </p>
                </ContentCard>

                {/* Core Topics */}
                <ContentCard title="Core Topics" icon={Layers}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedCompany.coreTopics.map((t, i) => (
                      <span key={i} style={{
                        fontSize: '0.78rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-card)',
                        color: 'var(--text-secondary)',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </ContentCard>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  <StatCard label="Reported Questions" value={selectedCompany.reportedQuestions.length} />
                  <StatCard label="Practice Problems" value={selectedCompany.practiceQuestions.length} />
                  <StatCard label="Resources" value={selectedCompany.resources.length} />
                  <StatCard label="Topics" value={selectedCompany.coreTopics.length} />
                </div>

                {/* Quick Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => setActiveSection('questions')}
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                  >
                    <Brain size={14} />
                    View Questions
                  </button>
                  <button
                    onClick={() => setActiveSection('practice')}
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                  >
                    <Code size={14} />
                    Practice Problems
                  </button>
                  <button
                    onClick={() => setActiveSection('resources')}
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                  >
                    <ExternalLink size={14} />
                    Resources
                  </button>
                </div>
              </div>
            )}

            {/* REPORTED INTERVIEW QUESTIONS */}
            {activeSection === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ContentCard title="Commonly Reported Interview Questions" icon={Brain}>
                  <p style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.78rem',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(251, 191, 36, 0.05)',
                    borderLeft: '3px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '0 8px 8px 0',
                  }}>
                    These are high-priority practice prompts from public sources and candidate reports — not guaranteed questions.
                    Interview loops vary by role, team, level, and hiring cycle.
                  </p>

                  {/* Filters */}
                  <FilterBar
                    topics={companyTopics}
                    topicFilter={topicFilter}
                    setTopicFilter={setTopicFilter}
                    difficultyFilter={difficultyFilter}
                    setDifficultyFilter={setDifficultyFilter}
                  />

                  {/* Questions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {filterQuestions(selectedCompany.reportedQuestions).map((q) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        solved={!!progress[q.id]?.solved}
                        expanded={!!expandedQuestions[q.id]}
                        onToggleSolved={() => toggleSolved(q.id)}
                        onToggleExpanded={() => toggleExpanded(q.id)}
                      />
                    ))}
                    {filterQuestions(selectedCompany.reportedQuestions).length === 0 && (
                      <EmptyState message="No questions match the current filters." />
                    )}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* PRACTICE PROBLEMS */}
            {activeSection === 'practice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ContentCard title="High-Priority Practice Problems" icon={Code}>
                  <p style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.78rem',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                  }}>
                    Curated practice set for pattern coverage. Solving these problems does not guarantee interview success,
                    but builds the foundational patterns commonly needed.
                  </p>

                  {selectedCompany.practiceQuestions.length > 0 ? (
                    <>
                      <FilterBar
                        topics={[...new Set(selectedCompany.practiceQuestions.map(q => q.topic).filter(Boolean))]}
                        topicFilter={topicFilter}
                        setTopicFilter={setTopicFilter}
                        difficultyFilter={difficultyFilter}
                        setDifficultyFilter={setDifficultyFilter}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {filterQuestions(selectedCompany.practiceQuestions).map((q) => (
                          <QuestionCard
                            key={q.id}
                            question={q}
                            solved={!!progress[q.id]?.solved}
                            expanded={!!expandedQuestions[q.id]}
                            onToggleSolved={() => toggleSolved(q.id)}
                            onToggleExpanded={() => toggleExpanded(q.id)}
                          />
                        ))}
                        {filterQuestions(selectedCompany.practiceQuestions).length === 0 && (
                          <EmptyState message="No problems match the current filters." />
                        )}
                      </div>
                    </>
                  ) : (
                    <EmptyState message={`No company-specific practice problems are listed for ${selectedCompany.name}. Use the Resources section to find practice materials.`} />
                  )}
                </ContentCard>
              </div>
            )}

            {/* RESOURCES */}
            {activeSection === 'resources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ContentCard title={`${selectedCompany.name} Resources`} icon={ExternalLink}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedCompany.resources.map((r, i) => (
                      <ResourceLink key={i} resource={r} />
                    ))}
                  </div>
                </ContentCard>

                <ContentCard title="General Practice Resources" icon={Globe}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {GENERAL_RESOURCES.map((r, i) => (
                      <ResourceLink key={i} resource={r} />
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* CORE CS & TECH FUNDAMENTALS */}
            {activeSection === 'corecs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ContentCard title="Core CS & Technical Fundamentals" icon={Layers}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                  }}>
                    Foundational engineering concepts synthesized for {selectedCompany.name} technical interviews.
                    Senior and entry-level engineering loops consistently probe these core principles.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem',
                  }}>
                    {/* OOP */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <Code size={16} style={{ color: 'var(--accent-gold)' }} />
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          Object-Oriented Programming (OOP)
                        </h4>
                      </div>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.65 }}>
                        <li><strong>4 Pillars:</strong> Encapsulation, Abstraction, Inheritance, Polymorphism.</li>
                        <li><strong>Polymorphism:</strong> Compile-time (overloading) vs Run-time (overriding/virtual methods).</li>
                        <li><strong>Contracts:</strong> Interfaces vs Abstract Classes; Default & static methods.</li>
                        <li><strong>Design Principles:</strong> SOLID design principles & Design Patterns (Singleton, Factory, Strategy).</li>
                      </ul>
                    </div>

                    {/* DBMS & SQL */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <Layers size={16} style={{ color: 'var(--accent-gold)' }} />
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          DBMS & SQL Essentials
                        </h4>
                      </div>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.65 }}>
                        <li><strong>ACID Properties:</strong> Atomicity, Consistency, Isolation levels, Durability.</li>
                        <li><strong>SQL Queries:</strong> Multi-table Joins (Inner, Left, Cross), GROUP BY, HAVING, Window functions.</li>
                        <li><strong>Indexing:</strong> Clustered vs Non-clustered, B+ Tree index scans vs lookups.</li>
                        <li><strong>Design:</strong> Normalization forms (1NF to 3NF/BCNF) vs intentional denormalization.</li>
                      </ul>
                    </div>

                    {/* Operating Systems */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <Brain size={16} style={{ color: 'var(--accent-gold)' }} />
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          Operating Systems
                        </h4>
                      </div>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.65 }}>
                        <li><strong>Execution:</strong> Process vs Thread, Process Control Block (PCB), Context Switch cost.</li>
                        <li><strong>Deadlocks:</strong> 4 Coffman conditions, Banker's algorithm, prevention & detection.</li>
                        <li><strong>Memory:</strong> Virtual Memory, Paging, Page Replacement algorithms (LRU), Thrashing.</li>
                        <li><strong>Concurrency:</strong> Mutex, Semaphores, Critical Sections, and Race Condition handling.</li>
                      </ul>
                    </div>

                    {/* Computer Networks */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <Globe size={16} style={{ color: 'var(--accent-gold)' }} />
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          Computer Networks
                        </h4>
                      </div>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.65 }}>
                        <li><strong>Layering:</strong> OSI 7-Layer Model vs TCP/IP protocol suite mapping.</li>
                        <li><strong>Transport:</strong> TCP vs UDP, TCP 3-way handshake, SYN/ACK, Flow & Congestion Control.</li>
                        <li><strong>Web Protocols:</strong> HTTP/1.1 vs HTTP/2 vs HTTP/3, HTTPS/TLS handshake.</li>
                        <li><strong>Infrastructure:</strong> DNS resolution walkthrough, CDN caching, WebSockets vs REST.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Company focus tag display */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                      Key {selectedCompany.name} Technical Focus Topics:
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {selectedCompany.coreTopics.map((t, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(217, 183, 122, 0.08)',
                          border: '1px solid rgba(217, 183, 122, 0.22)',
                          color: 'var(--accent-gold)',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </ContentCard>
              </div>
            )}

            {/* APTITUDE */}
            {activeSection === 'aptitude' && selectedCompany.hasAptitude && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ContentCard title="Aptitude & Logical Reasoning" icon={GraduationCap}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    lineHeight: 1.6,
                  }}>
                    {selectedCompany.name} interviews may include aptitude and reasoning components.
                    Practice under timed conditions and read the instructions for the specific assessment.
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedCompany.aptitudeTopics.map((t, i) => (
                      <span key={i} style={{
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(167, 139, 250, 0.08)',
                        border: '1px solid rgba(167, 139, 250, 0.2)',
                        color: '#A78BFA',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Aptitude Resources */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      Practice Resources
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {selectedCompany.resources
                        .filter(r => r.url.includes('indiabix') || r.url.includes('prepinsta'))
                        .map((r, i) => <ResourceLink key={i} resource={r} />)
                      }
                    </div>
                  </div>
                </ContentCard>
              </div>
            )}

            {/* BEHAVIORAL */}
            {activeSection === 'behavioral' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ContentCard title="Behavioral & HR Preparation" icon={Users}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    lineHeight: 1.6,
                  }}>
                    Prepare honest, specific examples using <strong style={{ color: 'var(--accent-gold)' }}>STAR-R</strong> — Situation, Task, Action, Result, Reflection. 
                    Be clear about your personal contribution, measurable outcome, and what you learned.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {BEHAVIORAL_QUESTIONS.map((q, i) => (
                      <div key={i} style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                      }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--accent-gold)',
                          minWidth: '22px',
                          textAlign: 'center',
                          marginTop: '0.1rem',
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {q}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Company-specific behavioral prompts */}
                  {selectedCompany.reportedQuestions.filter(q => q.topic === 'Behavioral' || q.topic === 'HR').length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                      }}>
                        {selectedCompany.name}-Specific Behavioral Prompts
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {selectedCompany.reportedQuestions
                          .filter(q => q.topic === 'Behavioral' || q.topic === 'HR')
                          .map((q, i) => (
                            <div key={q.id} style={{
                              padding: '0.6rem 0.85rem',
                              backgroundColor: `rgba(${hexToRgb(selectedCompany.brandColor)}, 0.06)`,
                              border: `1px solid rgba(${hexToRgb(selectedCompany.brandColor)}, 0.15)`,
                              borderRadius: '10px',
                              fontSize: '0.85rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                            }}>
                              {q.title}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </ContentCard>
              </div>
            )}

            {/* PREPARATION ROADMAP */}
            {activeSection === 'roadmap' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ContentCard title="Preparation Roadmap" icon={Target}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    lineHeight: 1.6,
                  }}>
                    A structured approach to preparing for your {selectedCompany.name} interview.
                    Adapt the timeline and focus areas to your target role and experience level.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {PREPARATION_PHASES.map((phase) => (
                      <div key={phase.phase} style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(217, 183, 122, 0.1)',
                          border: '1px solid rgba(217, 183, 122, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--accent-gold)',
                          flexShrink: 0,
                        }}>
                          {phase.phase}
                        </div>
                        <div>
                          <h4 style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem',
                          }}>
                            {phase.title}
                          </h4>
                          <p style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}>
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Responsive Styles ─── */}
      <style>{`
        @media (max-width: 868px) {
          .cardswap-wrapper {
            display: none !important;
          }
          .companies-layout {
            grid-template-columns: 1fr !important;
          }
          .companies-sidebar {
            position: relative !important;
            top: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding-right: 0 !important;
          }
          .mobile-sidebar-toggle {
            display: flex !important;
          }
          .sidebar-inner {
            display: ${showMobileSidebar ? 'flex' : 'none'} !important;
          }
          .sidebar-company-list {
            max-height: 180px !important;
          }
          .section-nav-item {
            font-size: 0.75rem !important;
            padding: 0.45rem 0.65rem !important;
          }
          .company-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
          }
        }
        @media (max-width: 480px) {
          .company-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ContentCard({ title, icon: Icon, children }) {
  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: '14px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <Icon size={16} style={{ color: 'var(--accent-gold)' }} />
        <h4 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: '12px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--accent-gold)',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.72rem',
        color: 'var(--text-tertiary)',
        marginTop: '0.25rem',
      }}>
        {label}
      </div>
    </div>
  );
}

function QuestionCard({ question, solved, expanded, onToggleSolved, onToggleExpanded }) {
  const diff = question.difficulty ? difficultyColors[question.difficulty] : null;
  const srcColor = question.sourceType ? sourceColors[question.sourceType] : null;

  return (
    <div style={{
      padding: '0.75rem 1rem',
      backgroundColor: solved ? 'rgba(34, 197, 94, 0.04)' : 'rgba(255, 255, 255, 0.02)',
      border: `1px solid ${solved ? 'rgba(34, 197, 94, 0.15)' : 'var(--border-subtle)'}`,
      borderRadius: '10px',
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
      }}>
        {/* Solved toggle */}
        <button
          onClick={onToggleSolved}
          aria-label={solved ? 'Mark as unsolved' : 'Mark as solved'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.1rem',
            color: solved ? '#22C55E' : 'var(--text-tertiary)',
            flexShrink: 0,
            marginTop: '0.1rem',
            transition: 'color 0.2s ease',
          }}
        >
          {solved ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={onToggleExpanded}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: solved ? 'var(--text-tertiary)' : 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                textAlign: 'left',
                textDecoration: solved ? 'line-through' : 'none',
                lineHeight: 1.4,
                flex: 1,
              }}
            >
              {question.title}
            </button>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap' }}>
              {diff && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: diff.bg,
                  color: diff.color,
                  border: `1px solid ${diff.border}`,
                  fontWeight: 600,
                }}>
                  {question.difficulty}
                </span>
              )}
              {question.topic && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-tertiary)',
                }}>
                  {question.topic}
                </span>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div style={{
              marginTop: '0.6rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}>
              {srcColor && question.sourceType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: srcColor.bg,
                    color: srcColor.color,
                    fontWeight: 500,
                  }}>
                    {question.sourceType === 'candidate' ? 'Candidate reported' :
                     question.sourceType === 'editorial' ? 'Editorial synthesis' :
                     question.sourceType === 'official' ? 'Official source' : 'Community list'}
                  </span>
                </div>
              )}
              {question.url && (
                <a
                  href={question.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--accent-gold)',
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  <ExternalLink size={12} />
                  Practice this problem
                </a>
              )}
              {progress[question.id]?.date && (
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                  Solved on {new Date(progress[question.id].date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <button
          onClick={onToggleExpanded}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            padding: '0.1rem',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(90deg)' : 'none',
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function FilterBar({ topics, topicFilter, setTopicFilter, difficultyFilter, setDifficultyFilter }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />

      {/* Topic Filter */}
      <select
        value={topicFilter}
        onChange={(e) => setTopicFilter(e.target.value)}
        aria-label="Filter by topic"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          padding: '0.35rem 0.6rem',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="All">All Topics</option>
        {topics.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Difficulty Filter */}
      <select
        value={difficultyFilter}
        onChange={(e) => setDifficultyFilter(e.target.value)}
        aria-label="Filter by difficulty"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          padding: '0.35rem 0.6rem',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="All">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
    </div>
  );
}

function ResourceLink({ resource }) {
  const srcColor = sourceColors[resource.type] || sourceColors.community;
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.65rem 0.85rem',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.3)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
      }}
    >
      <ExternalLink size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
      <span style={{
        flex: 1,
        fontSize: '0.82rem',
        color: 'var(--text-primary)',
        lineHeight: 1.4,
      }}>
        {resource.title}
      </span>
      <span style={{
        fontSize: '0.62rem',
        padding: '0.15rem 0.45rem',
        borderRadius: '9999px',
        backgroundColor: srcColor.bg,
        color: srcColor.color,
        fontWeight: 500,
        flexShrink: 0,
      }}>
        {resource.type}
      </span>
    </a>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      color: 'var(--text-tertiary)',
      fontSize: '0.85rem',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px dashed var(--border-subtle)',
    }}>
      {message}
    </div>
  );
}

// ─── Utility ────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}
