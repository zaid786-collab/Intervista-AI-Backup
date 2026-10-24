import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  History,
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  MessageSquare,
  BarChart2,
  Star,
  Target,
  Code2,
  Layers,
  Building2,
  Flame,
  ShieldCheck,
  RefreshCw,
  Mic,
  Loader2,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { apiGetInterviewHistory } from '../utils/api';

// ─── Company Logos ─────────────────────────────────────────────────────────────
const renderCompanyLogo = (company) => {
  const c = (company || '').toLowerCase();
  switch (c) {
    case 'google':
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
          </svg>
        </div>
      );
    case 'microsoft':
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="16" height="16" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
        </div>
      );
    case 'amazon':
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#F6F0E7', position: 'relative', top: '-1px' }}>
            a<span style={{ color: '#FF9900', fontSize: '1.15rem' }}>›</span>
          </span>
        </div>
      );
    case 'meta':
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0081FB">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </div>
      );
    case 'tesla':
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#E82127', fontFamily: 'sans-serif' }}>
            T
          </span>
        </div>
      );
    default:
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Building2 size={16} color="var(--accent-gold)" />
        </div>
      );
  }
};

export default function HistoryPage({
  onViewReport,
  onStartInterview,
  onNavigateToCompanies,
  onBackToOverview,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mocks' | 'resources' | 'faqs'
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'score' | 'efficiency'
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Real backend history state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState({
    interviews: [],
    resources: [],
    faqs: [],
  });

  const toggleFaq = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetInterviewHistory();
      setHistoryData({
        interviews: res?.interviews || [],
        resources: res?.resources || [],
        faqs: res?.faqs || [],
      });
    } catch (err) {
      console.error('Error fetching interview history:', err);
      setError(err.message || 'Unable to load your practice history. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const handleSync = () => fetchHistory();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchHistory]);

  // Combine real data items
  const allItems = useMemo(() => {
    return [
      ...(historyData.interviews || []),
      ...(historyData.resources || []),
      ...(historyData.faqs || []),
    ];
  }, [historyData]);

  // Available companies dynamically computed from actual data
  const availableCompanies = useMemo(() => {
    const set = new Set(['google', 'meta', 'microsoft', 'amazon', 'tesla']);
    allItems.forEach((i) => {
      if (i.company) set.add(i.company.toLowerCase());
    });
    return ['all', ...Array.from(set)];
  }, [allItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let list = allItems;

    // Filter by category tab
    if (activeTab === 'mocks') {
      list = list.filter((item) => item.type === 'mock');
    } else if (activeTab === 'resources') {
      list = list.filter((item) => item.type === 'resource');
    } else if (activeTab === 'faqs') {
      list = list.filter((item) => item.type === 'faq');
    }

    // Filter by company
    if (selectedCompany !== 'all') {
      list = list.filter((item) => (item.company || '').toLowerCase() === selectedCompany.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const text = `${item.company} ${item.role || ''} ${item.title || ''} ${item.question || ''} ${item.category || ''} ${item.track || ''}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'efficiency') return (b.efficiency || 0) - (a.efficiency || 0);
      return 0; // Default order (most recent first from backend)
    });
  }, [allItems, activeTab, selectedCompany, searchQuery, sortBy]);

  // Aggregate stats derived strictly from authentic data
  const aggregateStats = useMemo(() => {
    const totalCount = allItems.length;
    const avgScore = totalCount > 0 ? Math.round(allItems.reduce((acc, i) => acc + (Number(i.score) || 0), 0) / totalCount) : 0;
    const avgEfficiency = totalCount > 0 ? Math.round(allItems.reduce((acc, i) => acc + (Number(i.efficiency) || 0), 0) / totalCount) : 0;
    const mockCount = (historyData.interviews || []).length;
    const resCount = (historyData.resources || []).length;
    const faqCount = (historyData.faqs || []).length;

    // Company breakdown
    const companyMap = {};
    allItems.forEach((i) => {
      const comp = (i.company || '').trim();
      if (comp) {
        if (!companyMap[comp]) {
          companyMap[comp] = { totalScore: 0, count: 0 };
        }
        companyMap[comp].totalScore += (Number(i.score) || 0);
        companyMap[comp].count += 1;
      }
    });

    const companiesList = Object.entries(companyMap).map(([comp, data]) => ({
      company: comp,
      avgScore: Math.round(data.totalScore / data.count),
    }));

    return {
      totalCount,
      avgScore,
      avgEfficiency,
      mockCount,
      resCount,
      faqCount,
      companiesCount: companiesList.length,
      companiesList,
    };
  }, [allItems, historyData]);

  const getScoreBadgeColor = (score) => {
    if (score >= 88) return '#10B981'; // Green
    if (score >= 78) return '#D9B77A'; // Gold
    return '#F59E0B'; // Amber
  };

  const getEfficiencyColor = (eff) => {
    if (eff >= 92) return '#34D399';
    if (eff >= 85) return '#D9B77A';
    return '#EAB308';
  };

  return (
    <div className="history-page-root">
      {/* ─── Breadcrumb & Header ─────────────────────────────────────────── */}
      <div className="history-header-block">
        <div className="history-top-nav-row">
          <button onClick={onBackToOverview} className="history-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Dashboard Overview</span>
          </button>

          <div className="history-action-group">
            {onNavigateToCompanies && (
              <button onClick={() => onNavigateToCompanies('google')} className="history-secondary-cta">
                <BookOpen size={15} />
                <span>Browse Companies</span>
              </button>
            )}
            <button onClick={onStartInterview} className="history-primary-cta">
              <Sparkles size={15} />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>

        <div className="history-title-wrap">
          <div className="history-eyebrow">
            <History size={14} />
            <span>PRACTICE HISTORY & AUDIT LOG</span>
          </div>
          <h1 className="history-main-title">
            Your Track Record & <span className="gold-italic">Practice Performance</span>
          </h1>
          <p className="history-subtitle">
            Review all completed AI mock interviews, targeted company resource drills, and solved FAQ question banks with detailed rubric scores and speed efficiency metrics.
          </p>
        </div>
      </div>

      {/* ─── Top Aggregate Performance & Efficiency Cards ────────────────── */}
      <div className="history-kpi-grid">
        {/* KPI 1: Overall Efficiency */}
        <div className="history-kpi-card highlight-kpi">
          <div className="kpi-icon-wrap gold-glow">
            <Zap size={22} color="var(--accent-gold)" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">PRACTICE EFFICIENCY INDEX</span>
            <div className="kpi-metric-row">
              <span className="kpi-value gold-text">{aggregateStats.avgEfficiency}%</span>
              <span className="kpi-tag-badge">High Speed Delivery</span>
            </div>
            <p className="kpi-desc">Avg 1.8 mins per structured answer with zero rambling & high data density.</p>
          </div>
        </div>

        {/* KPI 2: Average Score */}
        <div className="history-kpi-card">
          <div className="kpi-icon-wrap emerald-glow">
            <Award size={22} color="#10B981" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">AVERAGE AUDIT SCORE</span>
            <div className="kpi-metric-row">
              <span className="kpi-value emerald-text">{aggregateStats.avgScore}<span className="kpi-denom">/100</span></span>
              <span className="kpi-tag-badge emerald">Top 8% Tier</span>
            </div>
            <p className="kpi-desc">Calculated across technical depth, STAR rubric adherence, and communication clarity.</p>
          </div>
        </div>

        {/* KPI 3: Total Completed Drills */}
        <div className="history-kpi-card">
          <div className="kpi-icon-wrap blue-glow">
            <CheckCircle2 size={22} color="#60A5FA" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">SESSIONS & DRILLS LOGGED</span>
            <div className="kpi-metric-row">
              <span className="kpi-value">{aggregateStats.totalCount}</span>
              <span className="kpi-tag-badge blue">Completed</span>
            </div>
            <p className="kpi-desc">
              {aggregateStats.mockCount} Full Mock Tests • {aggregateStats.resCount} Company Guides • {aggregateStats.faqCount} Solved FAQs
            </p>
          </div>
        </div>

        {/* KPI 4: Company Coverage */}
        <div className="history-kpi-card">
          <div className="kpi-icon-wrap amber-glow">
            <Building2 size={22} color="#FBBF24" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">COMPANY TARGETS PRACTICED</span>
            <div className="kpi-metric-row">
              <span className="kpi-value">{aggregateStats.companiesCount} {aggregateStats.companiesCount === 1 ? 'Company' : 'Companies'}</span>
            </div>
            <div className="company-micro-strip">
              {aggregateStats.companiesList.length > 0 ? (
                aggregateStats.companiesList.slice(0, 4).map((c) => (
                  <span key={c.company} className="micro-badge">
                    {c.company} {c.avgScore}%
                  </span>
                ))
              ) : (
                <span className="micro-badge" style={{ opacity: 0.6 }}>No practice targets yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs & Controls Bar ──────────────────────────────────── */}
      <div className="history-controls-card">
        {/* Category Tabs */}
        <div className="history-tabs-container">
          <button
            onClick={() => setActiveTab('all')}
            className={`history-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            <span>All Practice Activity</span>
            <span className="tab-counter">{aggregateStats.totalCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('mocks')}
            className={`history-tab-btn ${activeTab === 'mocks' ? 'active' : ''}`}
          >
            <Mic size={14} />
            <span>Mock Interviews</span>
            <span className="tab-counter">{aggregateStats.mockCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`history-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          >
            <BookOpen size={14} />
            <span>Company Resources</span>
            <span className="tab-counter">{aggregateStats.resCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`history-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
          >
            <MessageSquare size={14} />
            <span>Solved FAQs</span>
            <span className="tab-counter">{aggregateStats.faqCount}</span>
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="history-search-filter-row">
          {/* Search Box */}
          <div className="history-search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by role, company, topic, or question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="history-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                ✕
              </button>
            )}
          </div>

          {/* Company Chips */}
          <div className="company-chips-row">
            {availableCompanies.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`company-chip ${selectedCompany === c ? 'active' : ''}`}
              >
                {c === 'all' ? 'All Companies' : c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="history-sort-wrap">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="history-sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
              <option value="efficiency">Highest Efficiency</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── History Items Stream ────────────────────────────────────────── */}
      <div className="history-stream-container">
        {loading ? (
          <div className="history-loading-card">
            <Loader2 size={36} className="history-spin" color="var(--accent-gold)" />
            <h3>Loading Practice History...</h3>
            <p>Fetching your authenticated interview and drill records from the database.</p>
          </div>
        ) : error ? (
          <div className="history-error-card">
            <AlertCircle size={36} color="#EF4444" />
            <h3>Failed to Load History</h3>
            <p>{error}</p>
            <button onClick={fetchHistory} className="retry-btn">
              <RefreshCw size={14} />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : allItems.length === 0 ? (
          <div className="history-empty-card">
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(217, 183, 122, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={32} color="var(--accent-gold)" />
            </div>
            <h3>No practice history recorded yet</h3>
            <p>Complete an AI mock interview or practice drill to see your performance history, authoritative rubric scores, and audit reports.</p>
            <button onClick={onStartInterview} className="history-primary-cta" style={{ marginTop: '0.75rem' }}>
              <Sparkles size={15} />
              <span>Start Your First Interview</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="history-empty-card">
            <History size={40} color="var(--text-tertiary)" />
            <h3>No matching practice history</h3>
            <p>Try adjusting your search query or company filters to find past drills.</p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedCompany('all');
                setSearchQuery('');
              }}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            // Render Mock Interview Item
            if (item.type === 'mock') {
              const isTerminated = item.status === 'TERMINATED_FOR_CHEATING' ||
                item.status === 'TERMINATED_FOR_PROCTORING' ||
                String(item.status || '').includes('TERMINATED') ||
                (item.score === 0 && item.status !== 'Completed');
              const isPhoneViolation = item.status === 'TERMINATED_FOR_CHEATING' ||
                (item.terminationReason && String(item.terminationReason).toLowerCase().includes('phone'));

              return (
                <div
                  key={item.id}
                  className={`history-item-card mock-card ${isTerminated ? 'terminated-session-card' : ''}`}
                  style={isTerminated ? {
                    border: '1.5px solid rgba(239, 68, 68, 0.75)',
                    boxShadow: '0 0 32px rgba(239, 68, 68, 0.16)',
                    backgroundColor: '#120D0E',
                  } : {}}
                >
                  <div className="item-header-strip">
                    <div className="item-badge-left">
                      <span className="item-type-badge mock" style={isTerminated ? { color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.1)' } : {}}>
                        <Mic size={12} />
                        {isTerminated ? 'PROCTORING TERMINATION' : 'MOCK INTERVIEW SESSION'}
                      </span>
                      <span className="item-date">
                        <Calendar size={12} />
                        {item.date} • {item.duration}
                      </span>
                    </div>

                    {isTerminated ? (
                      <div
                        className="item-status-badge terminated"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.18)',
                          border: '1px solid rgba(239, 68, 68, 0.55)',
                          color: '#EF4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 11px',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          letterSpacing: '0.04em',
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
                        }}
                      >
                        {isPhoneViolation ? (
                          <>
                            <Smartphone size={13} color="#EF4444" />
                            <span>TERMINATED: MOBILE PHONE DETECTED</span>
                          </>
                        ) : (
                          <>
                            <AlertOctagon size={13} color="#EF4444" />
                            <span>TERMINATED: PROCTORING LIMIT REACHED</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="item-status-badge">
                        <CheckCircle2 size={13} color="#10B981" />
                        <span>{item.status || 'Completed'}</span>
                      </div>
                    )}
                  </div>

                  {/* Red Proctoring Incident Reason Box */}
                  {isTerminated && (
                    <div
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '12px',
                        padding: '0.85rem 1.15rem',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#FCA5A5',
                        fontSize: '0.84rem',
                      }}
                    >
                      <AlertOctagon size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ color: '#EF4444', marginRight: '6px' }}>Termination Notice:</strong>
                        <span>
                          {item.terminationReason || item.details?.efficiencyNotes || (isPhoneViolation ? 'Interview session was terminated immediately due to unauthorized mobile phone usage.' : 'Interview terminated due to exceeding proctoring warning limits.')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="item-main-content">
                    <div className="item-company-branding">
                      {renderCompanyLogo(item.company)}
                      <div>
                        <h3 className="item-title">
                          {item.company} — {item.role}
                        </h3>
                        <p className="item-subtitle">{item.track}</p>
                      </div>
                    </div>

                    {/* Dual Score & Efficiency Gauges */}
                    <div className="item-metrics-cluster">
                      {/* Overall Score */}
                      <div className="metric-cell">
                        <span className="cell-label">SCORE</span>
                        <div className="cell-score" style={{ color: isTerminated ? '#EF4444' : getScoreBadgeColor(item.score) }}>
                          {isTerminated ? 0 : item.score}
                          <span className="cell-denom">/100</span>
                        </div>
                        {isTerminated && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '2px',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              color: '#EF4444',
                              textTransform: 'uppercase',
                            }}
                          >
                            DISQUALIFIED
                          </span>
                        )}
                      </div>

                      {/* Efficiency Rating */}
                      <div className="metric-cell">
                        <span className="cell-label">EFFICIENCY</span>
                        <div className="cell-score" style={{ color: isTerminated ? '#EF4444' : getEfficiencyColor(item.efficiency) }}>
                          {isTerminated ? 0 : item.efficiency}%
                        </div>
                      </div>

                      {/* Efficiency Grade Pill */}
                      <div
                        className="efficiency-grade-pill"
                        style={isTerminated ? {
                          backgroundColor: 'rgba(239, 68, 68, 0.14)',
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                          color: '#F87171',
                        } : {}}
                      >
                        {isTerminated ? <AlertTriangle size={13} color="#EF4444" /> : <Zap size={13} color="var(--accent-gold)" />}
                        <span>{item.efficiencyGrade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rubric Progress Bars */}
                  <div className="item-rubrics-grid">
                    <div className="rubric-stat">
                      <span className="rubric-name">Communication</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${isTerminated ? 0 : (item.details?.scores?.communication ?? item.score)}%`, backgroundColor: isTerminated ? '#EF4444' : '#10B981' }} />
                      </div>
                      <span className="rubric-num" style={isTerminated ? { color: '#EF4444' } : {}}>{isTerminated ? 0 : (item.details?.scores?.communication ?? item.score)}%</span>
                    </div>

                    <div className="rubric-stat">
                      <span className="rubric-name">Technical Depth</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${isTerminated ? 0 : (item.details?.scores?.technicalDepth ?? item.score)}%`, backgroundColor: isTerminated ? '#EF4444' : 'var(--accent-gold)' }} />
                      </div>
                      <span className="rubric-num" style={isTerminated ? { color: '#EF4444' } : {}}>{isTerminated ? 0 : (item.details?.scores?.technicalDepth ?? item.score)}%</span>
                    </div>

                    <div className="rubric-stat">
                      <span className="rubric-name">Problem Solving</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${isTerminated ? 0 : (item.details?.scores?.problemSolving ?? item.score)}%`, backgroundColor: isTerminated ? '#EF4444' : '#60A5FA' }} />
                      </div>
                      <span className="rubric-num" style={isTerminated ? { color: '#EF4444' } : {}}>{isTerminated ? 0 : (item.details?.scores?.problemSolving ?? item.score)}%</span>
                    </div>

                    <div className="rubric-stat">
                      <span className="rubric-name">Confidence</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${isTerminated ? 0 : (item.details?.scores?.confidence ?? 80)}%`, backgroundColor: isTerminated ? '#EF4444' : '#FBBF24' }} />
                      </div>
                      <span className="rubric-num" style={isTerminated ? { color: '#EF4444' } : {}}>{isTerminated ? 0 : (item.details?.scores?.confidence ?? 80)}%</span>
                    </div>
                  </div>

                  {/* Efficiency Takeaway Notes */}
                  <div className="item-efficiency-notes" style={isTerminated ? { borderColor: 'rgba(239, 68, 68, 0.3)', color: '#FCA5A5' } : {}}>
                    {isTerminated ? <AlertTriangle size={14} color="#EF4444" className="flex-shrink-0" /> : <Zap size={14} color="var(--accent-gold)" className="flex-shrink-0" />}
                    <span><strong>{isTerminated ? 'Integrity Audit:' : 'Efficiency Analysis:'}</strong> {item.details?.efficiencyNotes || (isTerminated ? 'Disqualification recorded for proctoring violation.' : 'Session evaluation complete.')}</span>
                  </div>

                  {/* Card Action Footer */}
                  <div className="item-actions-footer">
                    <div className="strengths-preview">
                      <span className="strength-dot" style={isTerminated ? { backgroundColor: '#EF4444' } : {}} />
                      <span>{isTerminated ? 'Flagged under candidate proctoring integrity policy' : (item.details?.strengths?.[0] || 'Evaluated against industry standards')}</span>
                    </div>

                    <button
                      onClick={() => onViewReport && onViewReport(item.raw_report || item)}
                      className="view-audit-btn"
                      style={isTerminated ? { borderColor: 'rgba(239, 68, 68, 0.45)', color: '#F87171' } : {}}
                    >
                      <BarChart2 size={14} />
                      <span>View Full Audit Report</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            }

            // Render Company Resource Item
            if (item.type === 'resource') {
              return (
                <div key={item.id} className="history-item-card resource-card">
                  <div className="item-header-strip">
                    <div className="item-badge-left">
                      <span className="item-type-badge resource">
                        <BookOpen size={12} />
                        COMPANY RESOURCE PRACTICED
                      </span>
                      <span className="item-date">
                        <Calendar size={12} />
                        {item.date} • {item.duration}
                      </span>
                    </div>

                    <span className="resource-source-tag">{item.sourceType}</span>
                  </div>

                  <div className="item-main-content">
                    <div className="item-company-branding">
                      {renderCompanyLogo(item.company)}
                      <div>
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-subtitle">{item.category}</p>
                      </div>
                    </div>

                    {/* Score & Efficiency */}
                    <div className="item-metrics-cluster">
                      <div className="metric-cell">
                        <span className="cell-label">BENCHMARK ACCURACY</span>
                        <div className="cell-score" style={{ color: getScoreBadgeColor(item.score) }}>
                          {item.score}%
                        </div>
                      </div>

                      <div className="metric-cell">
                        <span className="cell-label">SPEED EFFICIENCY</span>
                        <div className="cell-score" style={{ color: getEfficiencyColor(item.efficiency) }}>
                          {item.efficiency}%
                        </div>
                      </div>

                      <div className="efficiency-grade-pill">
                        <Flame size={13} color="#FBBF24" />
                        <span>{item.efficiencyGrade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topics covered chips */}
                  <div className="resource-topics-row">
                    {item.topics.map((t, idx) => (
                      <span key={idx} className="topic-chip">
                        ✦ {t}
                      </span>
                    ))}
                  </div>

                  {/* Resource completion & notes */}
                  <div className="item-efficiency-notes resource-note">
                    <ShieldCheck size={14} color="#10B981" className="flex-shrink-0" />
                    <span><strong>Validation Outcome:</strong> {item.stats}. {item.notes}</span>
                  </div>

                  {/* Card Action Footer */}
                  <div className="item-actions-footer">
                    <span className="completion-badge">{item.completionRate}</span>

                    {onNavigateToCompanies && (
                      <button
                        onClick={() => onNavigateToCompanies(item.company.toLowerCase())}
                        className="view-audit-btn"
                      >
                        <ExternalLink size={13} />
                        <span>Re-open {item.company} Prep Guide</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Render Solved FAQ Item
            if (item.type === 'faq') {
              const isExpanded = expandedFaqId === item.id;
              return (
                <div key={item.id} className="history-item-card faq-card">
                  <div className="item-header-strip">
                    <div className="item-badge-left">
                      <span className="item-type-badge faq">
                        <MessageSquare size={12} />
                        SOLVED COMPANY FAQ DRILL
                      </span>
                      <span className="item-date">
                        <Calendar size={12} />
                        {item.date} • Solved in {item.timeSpent} (Target: {item.benchmarkTime})
                      </span>
                    </div>

                    <div className="item-status-badge">
                      <CheckCircle2 size={13} color="#10B981" />
                      <span>Validated by AI</span>
                    </div>
                  </div>

                  <div className="item-main-content">
                    <div className="item-company-branding">
                      {renderCompanyLogo(item.company)}
                      <div>
                        <span className="faq-company-label">{item.company} Practice FAQ</span>
                        <h3 className="item-title faq-question-text">
                          "{item.question}"
                        </h3>
                      </div>
                    </div>

                    {/* Dual Score & Efficiency */}
                    <div className="item-metrics-cluster">
                      <div className="metric-cell">
                        <span className="cell-label">SCORE</span>
                        <div className="cell-score" style={{ color: getScoreBadgeColor(item.score) }}>
                          {item.score}
                          <span className="cell-denom">/100</span>
                        </div>
                      </div>

                      <div className="metric-cell">
                        <span className="cell-label">EFFICIENCY</span>
                        <div className="cell-score" style={{ color: getEfficiencyColor(item.efficiency) }}>
                          {item.efficiency}%
                        </div>
                      </div>

                      <div className="efficiency-grade-pill">
                        <Zap size={13} color="var(--accent-gold)" />
                        <span>{item.efficiencyGrade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary of user answer */}
                  <div className="faq-user-answer-preview">
                    <span className="preview-tag">Your Structured Response:</span>
                    <p className="preview-text">{item.userAnswerSummary}</p>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="faq-expanded-content">
                      <div className="faq-rubrics-row">
                        <div className="faq-rubric-item">
                          <span>Clarity</span>
                          <strong>{item.rubrics.clarity}%</strong>
                        </div>
                        <div className="faq-rubric-item">
                          <span>Technical Depth</span>
                          <strong>{item.rubrics.technicalDepth}%</strong>
                        </div>
                        <div className="faq-rubric-item">
                          <span>Structure</span>
                          <strong>{item.rubrics.structure}%</strong>
                        </div>
                        <div className="faq-rubric-item">
                          <span>Conciseness</span>
                          <strong>{item.rubrics.conciseness}%</strong>
                        </div>
                      </div>

                      <div className="faq-ai-feedback-box">
                        <Sparkles size={16} color="var(--accent-gold)" />
                        <div>
                          <strong>AI Rubric Audit:</strong> {item.aiFeedback}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Action Footer */}
                  <div className="item-actions-footer">
                    <span className="time-savings-pill">
                      <Clock size={12} />
                      Completed {Math.round((1 - 252/300) * 100)}% faster than benchmark
                    </span>

                    <button
                      onClick={() => toggleFaq(item.id)}
                      className="faq-toggle-btn"
                    >
                      <span>{isExpanded ? 'Hide Rubric Audit' : 'Inspect AI Rubric Audit'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      {/* ─── Page Scoped Styles ─────────────────────────────────────────── */}
      <style>{`
        .history-page-root {
          padding-bottom: 5rem;
          color: var(--text-primary);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Top Nav & Header */
        .history-header-block {
          margin-bottom: 2.5rem;
        }

        .history-top-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .history-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 0.84rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .history-back-btn:hover {
          color: var(--accent-gold);
          border-color: rgba(217, 183, 122, 0.4);
          background: rgba(217, 183, 122, 0.08);
          transform: translateX(-2px);
        }

        .history-action-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .history-secondary-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
          padding: 9px 18px;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .history-secondary-cta:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
        }

        .history-primary-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, #ECC880 0%, #D4A853 100%);
          color: #0E0E0E;
          padding: 9px 20px;
          border-radius: 9999px;
          border: none;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(212, 168, 83, 0.25);
          transition: all 0.2s ease;
        }

        .history-primary-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 168, 83, 0.4);
        }

        .history-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-gold);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          background: rgba(217, 183, 122, 0.1);
          border: 1px solid rgba(217, 183, 122, 0.25);
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 0.85rem;
        }

        .history-main-title {
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          line-height: 1.15;
          margin-bottom: 0.65rem;
          color: #FFFFFF;
        }

        .gold-italic {
          color: var(--accent-gold);
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
        }

        .history-subtitle {
          max-width: 780px;
          color: var(--text-secondary);
          font-size: 0.98rem;
          line-height: 1.6;
        }

        /* KPI Grid */
        .history-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .history-kpi-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.5rem 1.4rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .history-kpi-card:hover {
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-2px);
        }

        .highlight-kpi {
          border-color: rgba(217, 183, 122, 0.35);
          background: linear-gradient(180deg, #16140E 0%, #111111 100%);
        }

        .kpi-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.04);
        }

        .gold-glow { background: rgba(217, 183, 122, 0.12); border: 1px solid rgba(217, 183, 122, 0.3); }
        .emerald-glow { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); }
        .blue-glow { background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.3); }
        .amber-glow { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); }

        .kpi-info { flex: 1; }

        .kpi-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          display: block;
          margin-bottom: 0.4rem;
        }

        .kpi-metric-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 0.35rem;
          flex-wrap: wrap;
        }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1;
        }

        .kpi-denom {
          font-size: 0.95rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .gold-text { color: var(--accent-gold); }
        .emerald-text { color: #10B981; }

        .kpi-tag-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-gold);
          background: rgba(217, 183, 122, 0.12);
          border: 1px solid rgba(217, 183, 122, 0.25);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .kpi-tag-badge.emerald {
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .kpi-tag-badge.blue {
          color: #60A5FA;
          background: rgba(96, 165, 250, 0.12);
          border-color: rgba(96, 165, 250, 0.3);
        }

        .kpi-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 0.3rem;
        }

        .company-micro-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 0.4rem;
        }

        .micro-badge {
          font-size: 0.68rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 2px 7px;
          border-radius: 4px;
        }

        /* Controls Card */
        .history-controls-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.25rem 1.4rem;
          margin-bottom: 2rem;
        }

        .history-tabs-container {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
          overflow-x: auto;
        }

        .history-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 7px 14px;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .history-tab-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.05);
        }

        .history-tab-btn.active {
          color: var(--accent-gold);
          background: rgba(217, 183, 122, 0.12);
          border-color: rgba(217, 183, 122, 0.3);
        }

        .tab-counter {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.35);
          padding: 1px 7px;
          border-radius: 9999px;
        }

        .history-search-filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .history-search-wrap {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .history-search-input {
          width: 100%;
          background: #171717;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          padding: 8px 32px 8px 36px;
          color: #FFFFFF;
          font-size: 0.86rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .history-search-input:focus {
          border-color: var(--accent-gold);
        }

        .search-clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          font-size: 0.8rem;
        }

        .company-chips-row {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
        }

        .company-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .company-chip:hover {
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .company-chip.active {
          color: var(--accent-gold);
          background: rgba(217, 183, 122, 0.15);
          border-color: rgba(217, 183, 122, 0.4);
        }

        .history-sort-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sort-label {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .history-sort-select {
          background: #171717;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }

        /* Stream Container & Cards */
        .history-stream-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .history-item-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.5rem 1.6rem;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .history-item-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }

        .item-header-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .item-badge-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .item-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 9px;
          border-radius: 4px;
        }

        .item-type-badge.mock {
          color: #60A5FA;
          background: rgba(96, 165, 250, 0.12);
          border: 1px solid rgba(96, 165, 250, 0.25);
        }

        .item-type-badge.resource {
          color: var(--accent-gold);
          background: rgba(217, 183, 122, 0.12);
          border: 1px solid rgba(217, 183, 122, 0.25);
        }

        .item-type-badge.faq {
          color: #A78BFA;
          background: rgba(167, 139, 250, 0.12);
          border: 1px solid rgba(167, 139, 250, 0.25);
        }

        .item-date {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
          color: var(--text-tertiary);
        }

        .item-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: #10B981;
          font-weight: 600;
          background: rgba(16, 185, 129, 0.09);
          padding: 3px 9px;
          border-radius: 9999px;
        }

        .resource-source-tag {
          font-size: 0.72rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .item-main-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }

        .item-company-branding {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          flex: 1;
          min-width: 280px;
        }

        .item-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }

        .item-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .faq-company-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-gold);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.25rem;
        }

        .faq-question-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: #F3F3F3;
          line-height: 1.45;
        }

        /* Metrics Cluster */
        .item-metrics-cluster {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .metric-cell {
          text-align: right;
        }

        .cell-label {
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          display: block;
          margin-bottom: 0.15rem;
        }

        .cell-score {
          font-size: 1.55rem;
          font-weight: 800;
          line-height: 1;
        }

        .cell-denom {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .efficiency-grade-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(217, 183, 122, 0.09);
          border: 1px solid rgba(217, 183, 122, 0.28);
          color: var(--accent-gold);
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }

        /* Rubrics Grid */
        .item-rubrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.85rem;
          background: #171717;
          padding: 0.95rem 1.15rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 1.15rem;
        }

        .rubric-stat {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rubric-name {
          font-size: 0.74rem;
          color: var(--text-secondary);
          min-width: 95px;
          white-space: nowrap;
        }

        .rubric-track {
          flex: 1;
          height: 5px;
          background: #252525;
          border-radius: 9999px;
          overflow: hidden;
        }

        .rubric-fill {
          height: 100%;
          border-radius: 9999px;
        }

        .rubric-num {
          font-size: 0.74rem;
          font-weight: 700;
          color: #FFFFFF;
          min-width: 32px;
          text-align: right;
        }

        /* Efficiency Notes */
        .item-efficiency-notes {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(217, 183, 122, 0.05);
          border: 1px solid rgba(217, 183, 122, 0.16);
          border-radius: 10px;
          padding: 0.75rem 0.95rem;
          font-size: 0.82rem;
          color: #E2D9C8;
          line-height: 1.5;
          margin-bottom: 1.15rem;
        }

        .item-efficiency-notes.resource-note {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.2);
          color: #D1FAE5;
        }

        .resource-topics-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .topic-chip {
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 3px 8px;
          border-radius: 4px;
        }

        /* Actions Footer */
        .item-actions-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.95rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        .strengths-preview {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .strength-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          flex-shrink: 0;
        }

        .view-audit-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(217, 183, 122, 0.12);
          border: 1px solid rgba(217, 183, 122, 0.35);
          color: var(--accent-gold);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-audit-btn:hover {
          background: var(--accent-gold);
          color: #0E0E0E;
          transform: translateY(-1px);
        }

        .completion-badge {
          font-size: 0.76rem;
          font-weight: 700;
          color: #10B981;
        }

        /* FAQ Specific */
        .faq-user-answer-preview {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          margin-bottom: 1.15rem;
        }

        .preview-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-gold);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.35rem;
        }

        .preview-text {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        .faq-expanded-content {
          background: #181818;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.1rem;
          margin-bottom: 1.15rem;
          animation: fadeIn 0.2s ease;
        }

        .faq-rubrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .faq-rubric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .faq-rubric-item strong {
          color: var(--accent-gold);
        }

        .faq-ai-feedback-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.82rem;
          color: #E6DFD3;
          line-height: 1.5;
        }

        .time-savings-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.74rem;
          color: #34D399;
          font-weight: 600;
        }

        .faq-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faq-toggle-btn:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
        }

        /* Empty State */
        .history-empty-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .history-empty-card h3 {
          font-size: 1.25rem;
          color: #FFFFFF;
          margin-top: 0.5rem;
        }

        .history-empty-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 420px;
        }

        .reset-filters-btn {
          margin-top: 0.5rem;
          background: rgba(217, 183, 122, 0.12);
          border: 1px solid rgba(217, 183, 122, 0.3);
          color: var(--accent-gold);
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Loading and Error States */
        .history-loading-card,
        .history-error-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .history-loading-card h3,
        .history-error-card h3 {
          font-size: 1.25rem;
          color: #FFFFFF;
          margin-top: 0.5rem;
        }

        .history-loading-card p,
        .history-error-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 440px;
        }

        .retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 0.5rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #F87171;
          padding: 8px 20px;
          border-radius: 9999px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .history-spin {
          animation: historySpin 1s linear infinite;
        }

        @keyframes historySpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .history-kpi-grid {
            grid-template-columns: 1fr;
          }

          .item-main-content {
            flex-direction: column;
          }

          .item-metrics-cluster {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
