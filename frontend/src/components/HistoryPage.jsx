import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

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

// ─── Practice Mock Interviews Data ─────────────────────────────────────────────
const MOCK_INTERVIEWS_HISTORY = [
  {
    id: 'mock-1',
    type: 'mock',
    company: 'Google',
    role: 'Software Engineer',
    track: 'Algorithmic Rigor & System Design',
    date: '16 Oct 2026',
    duration: '42 mins',
    score: 86,
    efficiency: 92,
    efficiencyGrade: 'High Speed & Precision',
    status: 'Mastered',
    details: {
      scores: { communication: 90, technicalDepth: 88, problemSolving: 89, confidence: 82 },
      strengths: ['Strong algorithmic optimization with EXPLAIN ANALYZE', 'System design trade-off explanation', 'Zero hesitation during graph traversal prompt'],
      improvements: ['State Big-O time and space complexity upfront before pseudocode'],
      efficiencyNotes: 'Solved 3/3 algorithmic prompts in 38m vs 45m expected benchmark. Speech clarity index 94% with minimal pauses.',
    },
  },
  {
    id: 'mock-2',
    type: 'mock',
    company: 'Meta',
    role: 'Frontend Engineer',
    track: 'React Composition, State & DOM Performance',
    date: '14 Oct 2026',
    duration: '38 mins',
    score: 88,
    efficiency: 94,
    efficiencyGrade: 'Exceptional Execution',
    status: 'Mastered',
    details: {
      scores: { communication: 91, technicalDepth: 89, problemSolving: 92, confidence: 85 },
      strengths: ['Flawless explanation of React Fiber reconciler', 'Accurate LCP/FID web vitals bottleneck analysis', 'Modular component composition'],
      improvements: ['Expand more on server-side streaming cache invalidation patterns'],
      efficiencyNotes: 'Completed live interactive DOM state exercise in 14m (average candidate takes 24m). Code clean with zero redundant re-renders.',
    },
  },
  {
    id: 'mock-3',
    type: 'mock',
    company: 'Microsoft',
    role: 'Full Stack Engineer',
    track: 'Azure Microservices & Resilient APIs',
    date: '12 Oct 2026',
    duration: '35 mins',
    score: 78,
    efficiency: 85,
    efficiencyGrade: 'Strong Delivery',
    status: 'Passed',
    details: {
      scores: { communication: 82, technicalDepth: 76, problemSolving: 80, confidence: 75 },
      strengths: ['Clean RESTful API contracts', 'Circuit breaker pattern explanation', 'Good database index reasoning'],
      improvements: ['Elaborate more on distributed saga transactions across asynchronous message brokers'],
      efficiencyNotes: 'Covered 4 architecture scenarios in 35m. Answered follow-ups with concise 90-second structured summaries.',
    },
  },
  {
    id: 'mock-4',
    type: 'mock',
    company: 'Amazon',
    role: 'Senior SDE',
    track: '14 Leadership Principles & Scalability',
    date: '08 Oct 2026',
    duration: '45 mins',
    score: 82,
    efficiency: 89,
    efficiencyGrade: 'High Data Density',
    status: 'Passed',
    details: {
      scores: { communication: 86, technicalDepth: 80, problemSolving: 84, confidence: 80 },
      strengths: ['Tight adherence to STAR framework', 'Clear Customer Obsession and Bias for Action metrics', 'Quantified revenue impacts'],
      improvements: ['Deepen quantitative analysis on cost-optimization tradeoffs in DynamoDB hot partition scenarios'],
      efficiencyNotes: 'Structured STAR delivery with 89% content efficiency. Zero rambling; clear Situation, Task, Action, and verifiable Results.',
    },
  },
  {
    id: 'mock-5',
    type: 'mock',
    company: 'Tesla',
    role: 'Product & Systems Manager',
    track: 'Autonomous Telemetry & Hardware Integration',
    date: '04 Oct 2026',
    duration: '50 mins',
    score: 76,
    efficiency: 81,
    efficiencyGrade: 'Pragmatic & Structured',
    status: 'Passed',
    details: {
      scores: { communication: 78, technicalDepth: 74, problemSolving: 77, confidence: 75 },
      strengths: ['Autonomous feature prioritization vision', 'Solid safety-critical risk mitigation'],
      improvements: ['Deepen telemetry failure mode recovery protocols and hardware sensor calibration delays'],
      efficiencyNotes: 'Addressed complex regulatory and safety tradeoffs systematically in 48m vs 50m target time.',
    },
  },
];

// ─── Company Resources Practiced Data ──────────────────────────────────────────
const COMPANY_RESOURCES_HISTORY = [
  {
    id: 'res-1',
    type: 'resource',
    company: 'Google',
    title: 'Google Technical Interview Architecture & OpenLeet Guide',
    sourceType: 'Official & Candidate Synthesis',
    category: 'System Design & Distributed Data',
    topics: ['Distributed Graph Traversal', 'Big-O Optimization', 'MapReduce Fundamentals', 'Load Balancing'],
    date: '15 Oct 2026',
    duration: '45 mins drill',
    score: 91,
    efficiency: 95,
    efficiencyGrade: 'Optimal Throughput',
    completionRate: '100% Completed',
    stats: '12/12 Concepts Validated • 0 Critical Flaws',
    notes: 'Covered Google core evaluation criteria: systematic problem decomposition, clean edge-case testing, and computational complexity clarity.',
  },
  {
    id: 'res-2',
    type: 'resource',
    company: 'Amazon',
    title: 'Amazon 14 Leadership Principles Playbook & STAR Story Bank',
    sourceType: 'Official Bar Raiser Standard',
    category: 'Executive Behavioral & Bar Raiser',
    topics: ['Customer Obsession', 'Ownership', 'Bias for Action', 'Have Backbone; Disagree & Commit'],
    date: '11 Oct 2026',
    duration: '35 mins drill',
    score: 86,
    efficiency: 88,
    efficiencyGrade: 'Crisp STAR Framework',
    completionRate: '100% Completed',
    stats: '14/14 Scenarios Simulated • 92% Situation-to-Result clarity',
    notes: 'Validated metric-backed STAR storytelling. Eliminated passive language ("we built" replaced with "I architected and led").',
  },
  {
    id: 'res-3',
    type: 'resource',
    company: 'Microsoft',
    title: 'Microsoft Azure Cloud Architecture & Resilient Specs',
    sourceType: 'Official Technical Whitepapers',
    category: 'Cloud Infrastructure & High Availability',
    topics: ['Event-Driven Architecture', 'CosmosDB Partitioning', 'Azure Service Bus', 'Fault Tolerance'],
    date: '09 Oct 2026',
    duration: '40 mins drill',
    score: 82,
    efficiency: 87,
    efficiencyGrade: 'Solid Architecture',
    completionRate: '90% Completed',
    stats: '8/10 Scenarios Mastered • 1 Needs Review',
    notes: 'Practiced system trade-offs: multi-region replication vs eventual consistency latency penalties in mission-critical workflows.',
  },
  {
    id: 'res-4',
    type: 'resource',
    company: 'Meta',
    title: 'Meta Front-End Architecture & DOM Performance Checklist',
    sourceType: 'Engineering Standards Guide',
    category: 'Frontend Scale & Core Web Vitals',
    topics: ['Virtual DOM Internals', 'React 19 Server Components', 'INP / LCP Optimization', 'Client Cache Synchronization'],
    date: '06 Oct 2026',
    duration: '30 mins drill',
    score: 94,
    efficiency: 96,
    efficiencyGrade: 'Peak Efficiency',
    completionRate: '100% Completed',
    stats: '15/15 Performance Checks Passed • 0 Memory Leaks',
    notes: 'Simulated profiling large component trees under 6x CPU throttling. Identified 4 unnecessary render cascades within 10 minutes.',
  },
];

// ─── Company FAQs Solved Data ─────────────────────────────────────────────────
const SOLVED_FAQS_HISTORY = [
  {
    id: 'faq-1',
    type: 'faq',
    company: 'Google',
    question: 'How do you systematically handle ambiguous requirements when designing an exabyte-scale system?',
    category: 'System Design & Distributed Systems FAQ',
    date: '16 Oct 2026',
    timeSpent: '4m 12s',
    benchmarkTime: '5m 00s',
    score: 93,
    efficiency: 96,
    efficiencyGrade: 'Structured Analytical Framing',
    userAnswerSummary: 'Directly scoped read/write ratios (100:1), estimated 500M DAU with 50K QPS peak, determined 99.99% availability SLA, and framed multi-region storage partitioning before diving into API contracts.',
    aiFeedback: 'Exemplary requirements clarification; established back-of-the-envelope calculations before proposing storage layers. Did not rush into technology brand-name picking.',
    rubrics: {
      clarity: 95,
      technicalDepth: 94,
      structure: 96,
      conciseness: 98,
    },
  },
  {
    id: 'faq-2',
    type: 'faq',
    company: 'Amazon',
    question: 'Tell me about a time you made a critical product decision without complete data (Bias for Action).',
    category: 'Leadership Principles & Behavioral FAQ',
    date: '13 Oct 2026',
    timeSpent: '3m 45s',
    benchmarkTime: '4m 00s',
    score: 89,
    efficiency: 91,
    efficiencyGrade: 'High Impact STAR Delivery',
    userAnswerSummary: 'Situation: Payment gateway failure causing 14% drop-off. Action: Implemented instant fallback provider within 45 minutes using cached tokenization, accepting slight surcharge. Result: Recovered $140K daily GMV.',
    aiFeedback: 'High ownership displayed; explicitly addressed calculated risk and reversibility (two-way door decision). Quantifiable revenue metric outcome made the story undeniable.',
    rubrics: {
      clarity: 92,
      technicalDepth: 88,
      structure: 93,
      conciseness: 90,
    },
  },
  {
    id: 'faq-3',
    type: 'faq',
    company: 'Microsoft',
    question: 'Explain how you test boundary conditions, prevent deadlocks, and ensure thread safety in concurrent services.',
    category: 'Concurrency & Core Engineering FAQ',
    date: '10 Oct 2026',
    timeSpent: '5m 02s',
    benchmarkTime: '6m 00s',
    score: 87,
    efficiency: 90,
    efficiencyGrade: 'Precise CS Rigor',
    userAnswerSummary: 'Distinguished mutex vs read-write locks, outlined strict lock ordering hierarchies to break circular wait conditions, and demonstrated atomic CAS (Compare-And-Swap) operations for lock-free counters.',
    aiFeedback: 'Strong depth on starvation avoidance and thread pool sizing; clear mention of idempotency and jittered exponential backoffs.',
    rubrics: {
      clarity: 89,
      technicalDepth: 90,
      structure: 88,
      conciseness: 92,
    },
  },
  {
    id: 'faq-4',
    type: 'faq',
    company: 'Meta',
    question: 'How do you architect a client-side offline-first cache with conflict resolution for dynamic feed data?',
    category: 'Frontend Systems & Data Flow FAQ',
    date: '07 Oct 2026',
    timeSpent: '4m 30s',
    benchmarkTime: '5m 00s',
    score: 91,
    efficiency: 94,
    efficiencyGrade: 'Architectural Elegance',
    userAnswerSummary: 'Outlined IndexedDB persistent layer, optimistic mutation queue with rollback snapshots, and Last-Write-Wins (LWW) with client-timestamp vector clocks for server synchronization.',
    aiFeedback: 'Exceptional knowledge of optimistic UI updates and background synchronization queues. Handled edge cases of network flakiness smoothly.',
    rubrics: {
      clarity: 94,
      technicalDepth: 92,
      structure: 93,
      conciseness: 95,
    },
  },
  {
    id: 'faq-5',
    type: 'faq',
    company: 'Tesla',
    question: 'How do you resolve architectural trade-offs between ultra-low-latency sensor throughput and safety redundancy?',
    category: 'Embedded & Systems Reliability FAQ',
    date: '03 Oct 2026',
    timeSpent: '5m 18s',
    benchmarkTime: '6m 00s',
    score: 83,
    efficiency: 85,
    efficiencyGrade: 'Pragmatic Engineering',
    userAnswerSummary: 'Proposed zero-copy ring buffers with lockless atomic memory barriers for sensor telemetry streams, paired with a dual-channel watchdog subsystem that triggers degraded-mode safe stops upon checksum drift.',
    aiFeedback: 'Solid safety-critical reasoning and understanding of hard real-time latency ceilings; suggested adding explicit hardware telemetry fallback modes.',
    rubrics: {
      clarity: 84,
      technicalDepth: 86,
      structure: 85,
      conciseness: 87,
    },
  },
];

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

  const toggleFaq = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  // Combine data items
  const allItems = useMemo(() => {
    return [
      ...MOCK_INTERVIEWS_HISTORY,
      ...COMPANY_RESOURCES_HISTORY,
      ...SOLVED_FAQS_HISTORY,
    ];
  }, []);

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
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'efficiency') return b.efficiency - a.efficiency;
      return 0; // Default order
    });
  }, [allItems, activeTab, selectedCompany, searchQuery, sortBy]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const totalCount = allItems.length;
    const avgScore = Math.round(allItems.reduce((acc, i) => acc + i.score, 0) / (totalCount || 1));
    const avgEfficiency = Math.round(allItems.reduce((acc, i) => acc + i.efficiency, 0) / (totalCount || 1));
    const mockCount = MOCK_INTERVIEWS_HISTORY.length;
    const resCount = COMPANY_RESOURCES_HISTORY.length;
    const faqCount = SOLVED_FAQS_HISTORY.length;

    return { totalCount, avgScore, avgEfficiency, mockCount, resCount, faqCount };
  }, [allItems]);

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
              <span className="kpi-value">5 Companies</span>
            </div>
            <div className="company-micro-strip">
              <span className="micro-badge">Google 86%</span>
              <span className="micro-badge">Meta 88%</span>
              <span className="micro-badge">MSFT 78%</span>
              <span className="micro-badge">Amazon 82%</span>
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
            {['all', 'google', 'meta', 'microsoft', 'amazon', 'tesla'].map((c) => (
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
        {filteredItems.length === 0 ? (
          <div className="history-empty-card">
            <History size={40} color="var(--text-tertiary)" />
            <h3>No practice history found</h3>
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
              return (
                <div key={item.id} className="history-item-card mock-card">
                  <div className="item-header-strip">
                    <div className="item-badge-left">
                      <span className="item-type-badge mock">
                        <Mic size={12} />
                        MOCK INTERVIEW SESSION
                      </span>
                      <span className="item-date">
                        <Calendar size={12} />
                        {item.date} • {item.duration}
                      </span>
                    </div>

                    <div className="item-status-badge">
                      <CheckCircle2 size={13} color="#10B981" />
                      <span>{item.status}</span>
                    </div>
                  </div>

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
                        <div className="cell-score" style={{ color: getScoreBadgeColor(item.score) }}>
                          {item.score}
                          <span className="cell-denom">/100</span>
                        </div>
                      </div>

                      {/* Efficiency Rating */}
                      <div className="metric-cell">
                        <span className="cell-label">EFFICIENCY</span>
                        <div className="cell-score" style={{ color: getEfficiencyColor(item.efficiency) }}>
                          {item.efficiency}%
                        </div>
                      </div>

                      {/* Efficiency Grade Pill */}
                      <div className="efficiency-grade-pill">
                        <Zap size={13} color="var(--accent-gold)" />
                        <span>{item.efficiencyGrade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rubric Progress Bars */}
                  <div className="item-rubrics-grid">
                    <div className="rubric-stat">
                      <span className="rubric-name">Communication</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${item.details.scores.communication}%`, backgroundColor: '#10B981' }} />
                      </div>
                      <span className="rubric-num">{item.details.scores.communication}%</span>
                    </div>

                    <div className="rubric-stat">
                      <span className="rubric-name">Technical Depth</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${item.details.scores.technicalDepth}%`, backgroundColor: 'var(--accent-gold)' }} />
                      </div>
                      <span className="rubric-num">{item.details.scores.technicalDepth}%</span>
                    </div>

                    <div className="rubric-stat">
                      <span className="rubric-name">Problem Solving</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${item.details.scores.problemSolving}%`, backgroundColor: '#60A5FA' }} />
                      </div>
                      <span className="rubric-num">{item.details.scores.problemSolving}%</span>
                    </div>

                    <div className="rubric-stat">
                      <span className="rubric-name">Confidence</span>
                      <div className="rubric-track">
                        <div className="rubric-fill" style={{ width: `${item.details.scores.confidence}%`, backgroundColor: '#FBBF24' }} />
                      </div>
                      <span className="rubric-num">{item.details.scores.confidence}%</span>
                    </div>
                  </div>

                  {/* Efficiency Takeaway Notes */}
                  <div className="item-efficiency-notes">
                    <Zap size={14} color="var(--accent-gold)" className="flex-shrink-0" />
                    <span><strong>Efficiency Analysis:</strong> {item.details.efficiencyNotes}</span>
                  </div>

                  {/* Card Action Footer */}
                  <div className="item-actions-footer">
                    <div className="strengths-preview">
                      <span className="strength-dot" />
                      <span>{item.details.strengths[0]}</span>
                    </div>

                    <button
                      onClick={() => onViewReport && onViewReport(item)}
                      className="view-audit-btn"
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
