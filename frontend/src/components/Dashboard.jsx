import React, { useState, useMemo, useEffect } from 'react';
import MockInterviewSetupPage from './MockInterviewSetupPage';
import CareerPrepDSAPage from './CareerPrepDSAPage';
import HistoryPage from './HistoryPage';
import ProfilePage from './ProfilePage';
import ResumeATS from '../pages/ResumeATS';
import { useAuth } from '../context/useAuth';
import { apiGetSessions, apiGetReport } from '../utils/api';
import {
  Home,
  User,
  Mic,
  BarChart2,
  Calendar,
  Briefcase,
  Settings,

  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Sparkles,
  FileText,
  Code2,
  Lightbulb,
  MessageSquare,
  ArrowLeft,
  Menu,
  X,
  CheckCircle2,
  History,
  Download,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { apiGetReports, apiDownloadReportPdf, apiGetInterviewHistory } from '../utils/api';

// Preset active practice days for 2026 (matching the ~18 practice days in screenshot)
const PRACTICE_DAYS_2026 = {
  '2026-02-10': { count: 1, level: 2 },
  '2026-03-03': { count: 2, level: 3 },
  '2026-03-24': { count: 1, level: 1 },
  '2026-04-14': { count: 1, level: 2 },
  '2026-05-05': { count: 2, level: 3 },
  '2026-05-19': { count: 1, level: 2 },
  '2026-06-02': { count: 1, level: 1 },
  '2026-06-16': { count: 2, level: 3 },
  '2026-07-07': { count: 1, level: 2 },
  '2026-07-21': { count: 2, level: 3 },
  '2026-08-11': { count: 1, level: 1 },
  '2026-08-25': { count: 2, level: 2 },
  '2026-09-08': { count: 2, level: 3 },
  '2026-09-22': { count: 1, level: 2 },
  '2026-10-04': { count: 1, level: 2 },
  '2026-10-08': { count: 2, level: 3 },
  '2026-10-12': { count: 1, level: 2 },
  '2026-10-16': { count: 3, level: 4 },
  '2026-11-03': { count: 1, level: 2 },
  '2026-11-10': { count: 2, level: 3 },
  '2026-11-17': { count: 1, level: 2 },
};

// Recent interviews data matching screenshot
const RECENT_INTERVIEWS = [
  {
    id: 'int-1',
    company: 'Google',
    role: 'Software Engineer',
    score: 86,
    date: '16 Oct 2026',
    scoreColor: '#10B981',
    logoType: 'google',
    details: {
      scores: { communication: 90, technicalDepth: 88, problemSolving: 89, confidence: 82 },
      strengths: ['Strong algorithmic optimization with EXPLAIN ANALYZE', 'System design trade-off explanation'],
      improvements: ['State Big-O time and space complexity upfront']
    }
  },
  {
    id: 'int-2',
    company: 'Microsoft',
    role: 'Frontend Developer',
    score: 78,
    date: '12 Oct 2026',
    scoreColor: '#10B981',
    logoType: 'microsoft',
    details: {
      scores: { communication: 82, technicalDepth: 76, problemSolving: 80, confidence: 75 },
      strengths: ['Clean React component composition', 'State management reasoning'],
      improvements: ['Elaborate more on browser rendering pipelines & LCP/FID metrics']
    }
  },
  {
    id: 'int-3',
    company: 'Amazon',
    role: 'Behavioral Interview',
    score: 72,
    date: '08 Oct 2026',
    scoreColor: '#E2C99A',
    logoType: 'amazon',
    details: {
      scores: { communication: 75, technicalDepth: 70, problemSolving: 74, confidence: 68 },
      strengths: ['STAR framework adherence', 'Customer Obsession examples'],
      improvements: ['Quantify business metric outcomes more precisely']
    }
  },
  {
    id: 'int-4',
    company: 'Tesla',
    role: 'Product Manager',
    score: 65,
    date: '04 Oct 2026',
    scoreColor: '#D4A373',
    logoType: 'tesla',
    details: {
      scores: { communication: 70, technicalDepth: 62, problemSolving: 66, confidence: 64 },
      strengths: ['Autonomous feature prioritization vision'],
      improvements: ['Deepen hardware-software dependency risk management']
    }
  },
];

// Topics to work on matching screenshot
const TOPICS_TO_WORK_ON = [
  {
    id: 'tech-depth',
    title: 'Technical depth',
    percentage: 62,
    description: 'Focus on system design and in-depth concepts.',
    icon: Code2
  },
  {
    id: 'prob-solving',
    title: 'Problem solving',
    percentage: 71,
    description: 'Practice structured problem solving approaches.',
    icon: Lightbulb
  },
  {
    id: 'communication',
    title: 'Communication',
    percentage: 78,
    description: 'Work on clarity, confidence and structured answers.',
    icon: MessageSquare
  }
];

export default function Dashboard({
  onStartInterview,
  onLaunchSession,
  onViewReport,
  onBackToHome,
  onNavigateToCompanies,
}) {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Candidate';
  const [selectedYear, setSelectedYear] = useState(2026);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      if (h.includes('resume') || h.includes('ats')) return 'Resume ATS';
      if (h.includes('profile')) return 'My Profile';
      if (h.includes('history')) return 'History';
      if (h.includes('mock')) return 'Mock Interview';
      if (h.includes('prep') || h.includes('career')) return 'Career Prep';
    }
    return 'Overview';
  });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [dbSessions, setDbSessions] = useState([]);

  useEffect(() => {
    apiGetSessions()
      .then((res) => {
        if (res?.sessions && res.sessions.length > 0) {
          setDbSessions(res.sessions);
        }
      })
      .catch((err) => {
        console.warn('Failed to load past sessions:', err);
      });
  }, []);

  const displayedInterviews = useMemo(() => {
    if (dbSessions.length === 0) return RECENT_INTERVIEWS;
    const mappedDb = dbSessions.map((s) => ({
      id: s.id,
      company: s.company || 'Google',
      role: s.role || 'Software Engineer',
      score: s.score || 82,
      date: s.date || 'Today',
      scoreColor: (s.score || 82) >= 80 ? '#10B981' : '#E2C99A',
      logoType: (s.company || '').toLowerCase().includes('micro')
        ? 'microsoft'
        : (s.company || '').toLowerCase().includes('ama')
        ? 'amazon'
        : (s.company || '').toLowerCase().includes('tes')
        ? 'tesla'
        : 'google',
      isDbSession: true,
      details: {
        scores: s.details?.scores || { communication: 86, technicalDepth: 82, problemSolving: 84, confidence: 80 },
        strengths: s.details?.strengths || ['Articulate structured explanation'],
        improvements: s.details?.improvements || ['State time and space complexity upfront'],
        rubricScores: s.details?.rubricScores || [],
      },
    }));
    return [...mappedDb, ...RECENT_INTERVIEWS.slice(mappedDb.length)];
  }, [dbSessions]);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h.includes('profile')) {
        setActiveNav('My Profile');
      } else if (h.includes('resume') || h.includes('ats')) {
        setActiveNav('Resume ATS');
      } else if (h.includes('history')) {
        setActiveNav('History');
      } else if (h.includes('mock')) {
        setActiveNav('Mock Interview');
      } else if (h.includes('career') || h.includes('prep')) {
        setActiveNav('Career Prep');
      } else if (h === '#dashboard') {
        setActiveNav('Overview');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ─── Task 4: Real Backend Reports & History State ─────────────────────────────
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  const loadReports = async () => {
    setLoadingReports(true);
    setReportsError(null);
    try {
      let list = [];
      try {
        const histRes = await apiGetInterviewHistory();
        if (histRes?.interviews && histRes.interviews.length > 0) {
          list = histRes.interviews;
        }
      } catch (_) {}

      if (list.length === 0) {
        const res = await apiGetReports();
        list = Array.isArray(res) ? res : (res?.reports || []);
      }
      setReports(list);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setReportsError(err.message || 'Failed to connect to backend reports server.');
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const topicsToWorkOn = useMemo(() => {
    if (!reports || reports.length === 0) return TOPICS_TO_WORK_ON;

    let totalTech = 0, totalProb = 0, totalComm = 0, count = 0;
    reports.forEach((r) => {
      const s = r.scores || {};
      const tech = s.technicalDepth || s.technicalKnowledge;
      const prob = s.problemSolving;
      const comm = s.communication;
      if (tech || prob || comm) {
        totalTech += (tech || r.overallScore || r.score || 75);
        totalProb += (prob || r.overallScore || r.score || 75);
        totalComm += (comm || r.overallScore || r.score || 75);
        count++;
      }
    });

    if (count === 0) return TOPICS_TO_WORK_ON;

    const avgTech = Math.round(totalTech / count);
    const avgProb = Math.round(totalProb / count);
    const avgComm = Math.round(totalComm / count);

    return [
      {
        id: 'tech-depth',
        title: 'Technical depth',
        percentage: avgTech,
        description: avgTech < 70 ? 'Focus on system design and in-depth concepts.' : 'Solid mastery; continue exploring edge cases.',
        icon: Code2,
      },
      {
        id: 'prob-solving',
        title: 'Problem solving',
        percentage: avgProb,
        description: avgProb < 70 ? 'Practice structured problem solving approaches.' : 'Strong algorithmic analysis demonstrated.',
        icon: Lightbulb,
      },
      {
        id: 'communication',
        title: 'Communication',
        percentage: avgComm,
        description: avgComm < 70 ? 'Work on clarity, confidence and structured answers.' : 'Excellent articulation and structured delivery.',
        icon: MessageSquare,
      },
    ];
  }, [reports]);

  const handleDirectPdfDownload = async (e, report) => {
    e.stopPropagation();
    if (!report.id) return;
    try {
      setDownloadingReportId(report.id);
      await apiDownloadReportPdf(report.id, `${report.company || 'Intervista'}_${report.role || 'Report'}.pdf`);
    } catch (err) {
      alert(`Could not download PDF: ${err.message}`);
    } finally {
      setDownloadingReportId(null);
    }
  };

  // Generate 53 weeks x 7 days for the selected year
  const heatmapData = useMemo(() => {
    const weeks = [];
    // Start from the first Monday of the year or last week of previous year
    const startDate = new Date(selectedYear, 0, 1);
    // Align to Monday (0 = Sun, 1 = Mon ... 6 = Sat)
    const dayOfWeek = startDate.getDay();
    const diff = (dayOfWeek + 6) % 7; // days since last Monday
    startDate.setDate(startDate.getDate() - diff);

    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7 + d));
        const dateKey = currentDate.toISOString().split('T')[0];
        const isCurrentYear = currentDate.getFullYear() === selectedYear;
        const practiceData = selectedYear === 2026 ? PRACTICE_DAYS_2026[dateKey] : null;

        days.push({
          date: dateKey,
          displayDate: currentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          isCurrentYear,
          level: practiceData ? practiceData.level : 0,
          count: practiceData ? practiceData.count : 0
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, [selectedYear]);

  // Months label positions (approximately placed across 53 weeks)
  const monthLabels = [
    { name: 'Jan', col: 0 },
    { name: 'Feb', col: 4 },
    { name: 'Mar', col: 8 },
    { name: 'Apr', col: 13 },
    { name: 'May', col: 17 },
    { name: 'Jun', col: 22 },
    { name: 'Jul', col: 26 },
    { name: 'Aug', col: 31 },
    { name: 'Sep', col: 35 },
    { name: 'Oct', col: 40 },
    { name: 'Nov', col: 44 },
    { name: 'Dec', col: 48 }
  ];

  // Helper for heatmap cell color
  const getCellColor = (level) => {
    switch (level) {
      case 1:
        return '#064e3b'; // dark emerald
      case 2:
        return '#047857'; // medium emerald
      case 3:
        return '#10B981'; // bright green
      case 4:
        return '#34D399'; // vibrant light emerald
      default:
        return '#1c1c1c'; // inactive dark gray
    }
  };

  // Helper for company logos in recent interviews
  const renderCompanyLogo = (companyName = '') => {
    const norm = String(companyName).toLowerCase();
    if (norm.includes('google')) {
      return (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
          </svg>
        </div>
      );
    }
    if (norm.includes('microsoft')) {
      return (
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
        </div>
      );
    }
    if (norm.includes('amazon')) {
      return (
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#F6F0E7', position: 'relative', top: '-1px' }}>
            a<span style={{ color: '#FF9900', fontSize: '1.1rem' }}>›</span>
          </span>
        </div>
      );
    }
    if (norm.includes('tesla')) {
      return (
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#E82127', fontFamily: 'sans-serif' }}>
            T
          </span>
        </div>
      );
    }
    const initial = (companyName || 'I').trim().charAt(0).toUpperCase() || 'I';
    return (
      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(217, 183, 122, 0.12)', border: '1px solid rgba(217, 183, 122, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-gold)' }}>
        {initial}
      </div>
    );
  };

  const navItems = [
    {
      label: 'Overview',
      icon: Home,
      id: 'overview',
      action: () => {
        setActiveNav('Overview');
        window.location.hash = '#dashboard';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'Mock Interview',
      icon: Mic,
      id: 'mock-interview',
      action: () => {
        setActiveNav('Mock Interview');
        window.location.hash = '#dashboard/mock-interview';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'Resume ATS',
      icon: FileText,
      id: 'resume-ats',
      action: () => {
        setActiveNav('Resume ATS');
        window.location.hash = '#dashboard/resume-ats';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'History',
      icon: History,
      id: 'history',
      action: () => {
        setActiveNav('History');
        window.location.hash = '#dashboard/history';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'Career Prep',
      icon: Briefcase,
      id: 'career-prep',
      action: () => {
        setActiveNav('Career Prep');
        window.location.hash = '#dashboard/career-prep';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'My Profile',
      icon: User,
      id: 'my-profile',
      action: () => {
        setActiveNav('My Profile');
        window.location.hash = '#dashboard/profile';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
  ];


  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#080808',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        paddingTop: 'var(--nav-height, 72px)',
      }}
      className="dashboard-root"
    >
      {/* =========================================================================
          LEFT SIDEBAR (Fixed/Sticky matching screenshot)
          ========================================================================= */}
      <aside
        style={{
          width: sidebarCollapsed ? '76px' : '260px',
          backgroundColor: '#0c0c0c',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: 'var(--nav-height, 72px)',
          height: 'calc(100vh - var(--nav-height, 72px))',
          zIndex: 40,
          padding: '1.5rem 1rem',
          flexShrink: 0,
        }}
        className="dashboard-sidebar"
      >
        {/* Top: Sidebar Collapse Toggle (No INTERVISTA logo text) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
            marginBottom: '1.75rem',
            padding: '0 0.25rem',
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;

            return (
              <button
                key={item.label}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  setActiveNav(item.label);
                  if (item.action) item.action();
                }}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'rgba(217, 183, 122, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(217, 183, 122, 0.28)' : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  width: '100%',
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
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(217, 183, 122, 0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? 'var(--accent-gold)' : 'inherit',
                  }}
                >
                  <Icon size={18} />
                </div>
                {!sidebarCollapsed && (
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--text-primary)' : 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Homepage Button at bottom of sidebar */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={onBackToHome}
            title="Back to Homepage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 0.9rem',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              width: '100%',
              fontSize: '0.82rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-gold)';
              e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <ArrowLeft size={16} />
            {!sidebarCollapsed && <span>Back to Website</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Horizontal Dashboard Nav Tabs */}
        <div
          className="dashboard-mobile-tabs"
          style={{
            display: 'none',
            overflowX: 'auto',
            padding: '0.75rem 1rem',
            backgroundColor: '#0c0c0c',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              id={`mobile-nav-item-${item.id}`}
              onClick={() => {
                setActiveNav(item.label);
                if (item.action) item.action();
              }}
              style={{
                background: activeNav === item.label ? 'rgba(217, 183, 122, 0.12)' : 'transparent',
                border: activeNav === item.label ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid transparent',
                borderRadius: '8px',
                color: activeNav === item.label ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: activeNav === item.label ? 600 : 500,
                padding: '0.4rem 0.85rem',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main style={{ padding: '2.5rem 3rem', maxWidth: '1360px', width: '100%', margin: '0 auto' }} className="dashboard-main-content">
          {activeNav === 'My Profile' ? (
            <ProfilePage
              currentUser={user}
              onBackToOverview={() => {
                setActiveNav('Overview');
                window.location.hash = '#dashboard';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartInterview={onStartInterview}
              onViewReport={onViewReport}
              onNavigateToCompanies={onNavigateToCompanies}
            />
          ) : activeNav === 'Mock Interview' ? (
            <MockInterviewSetupPage
              onLaunchSession={(config) => {
                if (onLaunchSession) onLaunchSession(config);
                else if (onStartInterview) onStartInterview(config?.role || 'Software Engineer');
              }}
              onBackToOverview={() => {
                setActiveNav('Overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : activeNav === 'Resume ATS' ? (
            <ResumeATS onStartInterview={onStartInterview} />
          ) : activeNav === 'Career Prep' ? (
            <CareerPrepDSAPage
              onStartInterview={(title) => {
                setActiveNav('Mock Interview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToOverview={() => {
                setActiveNav('Overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : activeNav === 'History' ? (
            <HistoryPage
              onViewReport={onViewReport}
              onStartInterview={() => {
                setActiveNav('Mock Interview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToCompanies={onNavigateToCompanies}
              onBackToOverview={() => {
                setActiveNav('Overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <>

              {/* =========================================================================
                  B. WELCOME HEADER & MOTIVATIONAL CARD
                  ========================================================================= */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '2rem',
                  marginBottom: '2.5rem',
                  flexWrap: 'wrap',
                }}
                className="welcome-header-row"
              >
                {/* Left: Greeting, status & Start New Interview CTA */}
                <div style={{ maxWidth: '620px' }}>
                  <h1
                    className="serif-heading"
                    style={{
                      fontSize: 'clamp(2.2rem, 3.8vw, 3rem)',
                      lineHeight: 1.15,
                      marginBottom: '0.75rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Welcome Back, <span style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>{displayName}</span>
                  </h1>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.96rem',
                      lineHeight: 1.55,
                      marginBottom: '1.6rem',
                    }}
                  >
                    You have completed {reports.length} mock interview session{reports.length === 1 ? '' : 's'}. {reports.length === 0 ? 'Start your first mock interview to get evaluated by AI!' : 'Keep pushing to improve your score!'}
                  </p>

                  {/* + Start New Interview Button */}
                  <button
                    onClick={() => {
                      setActiveNav('Mock Interview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="btn-primary"
                    style={{
                      padding: '0.75rem 1.6rem',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      backgroundColor: 'var(--text-primary)',
                      color: '#080808',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 18px rgba(246, 240, 231, 0.15)',
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Start New Interview</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>



          {/* =========================================================================
              C. YEARLY PRACTICE ACTIVITY HEATMAP
              ========================================================================= */}

          <section
            style={{
              backgroundColor: '#111111',
              border: '1px solid var(--border-card)',
              borderRadius: '20px',
              padding: '2rem 2.25rem',
              marginBottom: '2rem',
              position: 'relative',
            }}
            className="heatmap-card"
          >
            {/* Header: Title, Calendar Icon & Year Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.8rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Calendar size={18} />
                </div>

                <div>
                  <h2
                    className="serif-heading"
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: '2px',
                    }}
                  >
                    Your Practice Activity
                  </h2>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                    18 practice days this year
                  </p>
                </div>
              </div>

              {/* Year Navigation Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#161616',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '3px 6px',
                  gap: '6px',
                }}
              >
                <button
                  onClick={() => setSelectedYear(prev => prev - 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Previous Year"
                >
                  <ChevronLeft size={16} />
                </button>

                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    padding: '0 6px',
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedYear}
                </span>

                <button
                  onClick={() => setSelectedYear(prev => prev + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Next Year"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Heatmap Grid Wrapper (horizontally scrollable if viewport is narrow) */}
            <div
              style={{
                overflowX: 'auto',
                paddingBottom: '0.5rem',
              }}
              className="heatmap-scroll-area"
            >
              <div style={{ minWidth: '780px' }}>
                {/* Month labels row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px repeat(53, 1fr)',
                    gap: '4px',
                    marginBottom: '8px',
                    fontSize: '0.72rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <div /> {/* empty corner for day labels */}
                  {Array.from({ length: 53 }).map((_, colIdx) => {
                    const monthObj = monthLabels.find(m => m.col === colIdx);
                    return (
                      <div key={colIdx} style={{ textAlign: 'left' }}>
                        {monthObj ? monthObj.name : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Day labels + 7 rows of cells */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  {/* Left day labels (Mon, Wed, Fri) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '110px',
                      fontSize: '0.72rem',
                      color: 'var(--text-tertiary)',
                      padding: '2px 0',
                    }}
                  >
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* 53 Columns x 7 Rows Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(53, 1fr)',
                      gap: '4px',
                    }}
                  >
                    {heatmapData.map((week, wIdx) => (
                      <div
                        key={wIdx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        {week.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            onMouseEnter={() => setHoveredCell(day)}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              width: '100%',
                              paddingTop: '100%', // 1:1 aspect ratio square
                              position: 'relative',
                              borderRadius: '3px',
                              backgroundColor: getCellColor(day.level),
                              border: hoveredCell?.date === day.date
                                ? '1px solid #FFFFFF'
                                : '1px solid rgba(255, 255, 255, 0.03)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              transform: hoveredCell?.date === day.date ? 'scale(1.3)' : 'none',
                              zIndex: hoveredCell?.date === day.date ? 10 : 1,
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Heatmap Tooltip & Legend Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
              }}
            >
              {/* Tooltip info on hover */}
              <div>
                {hoveredCell ? (
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>{hoveredCell.displayDate}</strong>: {hoveredCell.count > 0 ? `${hoveredCell.count} mock interview practice sessions` : 'No practice sessions'}
                  </span>
                ) : (
                  <span>Hover over any cell to see practice session records</span>
                )}
              </div>

              {/* Less -> More intensity legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    style={{
                      width: '11px',
                      height: '11px',
                      borderRadius: '2px',
                      backgroundColor: getCellColor(lvl),
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </section>

          {/* =========================================================================
              LOWER 2-COLUMN SECTION: RECENT INTERVIEWS & TOPICS TO WORK ON
              ========================================================= */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.35fr 1fr',
              gap: '2rem',
              alignItems: 'stretch',
            }}
            className="dashboard-lower-grid"
          >
            {/* =====================================================================
                D. RECENT INTERVIEWS (LEFT COLUMN)
                ===================================================================== */}
            <section
              id="recent-interviews"
              style={{
                backgroundColor: '#111111',
                border: '1px solid var(--border-card)',
                borderRadius: '20px',
                padding: '1.8rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                scrollMarginTop: 'calc(var(--nav-height, 72px) + 24px)',
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <FileText size={17} />
                  </div>
                  <h3
                    className="serif-heading"
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    Recent Interviews
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={loadReports}
                    title="Refresh interview history"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <RefreshCw size={13} className={loadingReports ? 'spin' : ''} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav('History');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>View all</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Table Column Headers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.7fr 75px 105px 135px',
                  gap: '1rem',
                  padding: '0 0.5rem 0.75rem 0.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
                className="interviews-table-header"
              >
                <div>Company & Role</div>
                <div style={{ textAlign: 'center' }}>Score</div>
                <div>Date</div>
                <div style={{ textAlign: 'right' }}>Actions & PDF</div>
              </div>

              {/* Table Rows: Loading, Error, Empty, or Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.85rem', minHeight: '160px' }}>
                {loadingReports ? (
                  // Loading Skeleton Rows
                  [1, 2, 3].map((n) => (
                    <div
                      key={n}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.7fr 75px 105px 135px',
                        gap: '1rem',
                        alignItems: 'center',
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        animation: 'pulse 1.5s infinite ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#222' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '110px' }}>
                          <div style={{ height: '12px', backgroundColor: '#222', borderRadius: '4px' }} />
                          <div style={{ height: '10px', backgroundColor: '#1c1c1c', borderRadius: '4px', width: '70%' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#222' }} />
                      </div>
                      <div style={{ height: '12px', width: '70px', backgroundColor: '#222', borderRadius: '4px' }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <div style={{ height: '28px', width: '85px', backgroundColor: '#222', borderRadius: '8px' }} />
                      </div>
                    </div>
                  ))
                ) : reportsError ? (
                  // Error State with Retry
                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <AlertCircle size={24} color="#EF4444" />
                    <div style={{ fontSize: '0.85rem', color: '#FCA5A5' }}>
                      {reportsError}
                    </div>
                    <button
                      onClick={loadReports}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={12} />
                      <span>Retry Loading</span>
                    </button>
                  </div>
                ) : reports.length === 0 ? (
                  // Empty State
                  <div
                    style={{
                      padding: '2rem 1.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <Sparkles size={24} color="var(--accent-gold)" />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No Interview Reports Yet
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: 0 }}>
                      Complete your first mock interview session to unlock AI scorecards, verbal delivery analysis, and customized study roadmaps.
                    </p>
                    <button
                      onClick={() => setActiveNav('Mock Interview')}
                      className="btn-primary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', marginTop: '0.25rem' }}
                    >
                      + Start Mock Interview
                    </button>
                  </div>
                ) : (
                  // Real Reports Rows
                  reports.map((interview) => {
                    const scoreVal = interview.score ?? interview.overallScore ?? 80;
                    const scoreColor =
                      scoreVal >= 80 ? '#10B981' : scoreVal >= 70 ? 'var(--accent-gold)' : '#D4A373';
                    const isDownloading = downloadingReportId === interview.id;

                    return (
                      <div
                        key={interview.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.7fr 75px 105px 135px',
                          gap: '1rem',
                          alignItems: 'center',
                          padding: '0.65rem 0.5rem',
                          borderRadius: '12px',
                          transition: 'background-color 0.2s ease',
                        }}
                        className="interview-row-item"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161616')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Company & Role */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {renderCompanyLogo(interview.company || interview.role)}
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {interview.company || 'Intervista AI'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {interview.role}
                            </div>
                          </div>
                        </div>

                        {/* Circular Score Gauge */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                            <svg width="38" height="38" viewBox="0 0 38 38">
                              <circle cx="19" cy="19" r="15" fill="none" stroke="#222" strokeWidth="2.5" />
                              <circle
                                cx="19"
                                cy="19"
                                r="15"
                                fill="none"
                                stroke={scoreColor}
                                strokeWidth="2.5"
                                strokeDasharray="94.2"
                                strokeDashoffset={94.2 - (94.2 * scoreVal) / 100}
                                strokeLinecap="round"
                                transform="rotate(-90 19 19)"
                              />
                            </svg>
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                              }}
                            >
                              {scoreVal}%
                            </div>
                          </div>
                        </div>

                        {/* Date */}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {interview.date || (interview.created_at ? new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent')}
                        </div>

                        {/* Action Buttons: Download PDF & View Report */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {interview.status === 'failed' ? (
                            <button
                              onClick={() => loadReports()}
                              className="btn-secondary"
                              title="Report generation failed. Click to retry."
                              style={{
                                padding: '0.35rem 0.6rem',
                                fontSize: '0.72rem',
                                color: '#EF4444',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                borderRadius: '7px',
                              }}
                            >
                              <RefreshCw size={11} />
                              <span>Retry</span>
                            </button>
                          ) : (
                            <>
                              {/* Direct PDF Download button */}
                              <button
                                onClick={(e) => handleDirectPdfDownload(e, interview)}
                                disabled={isDownloading}
                                title="Download Official PDF Report"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: isDownloading ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                  padding: '0.38rem 0.45rem',
                                  borderRadius: '7px',
                                  cursor: isDownloading ? 'wait' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.18s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = 'var(--accent-gold)';
                                  e.currentTarget.style.borderColor = 'rgba(217, 183, 122, 0.35)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                              >
                                {isDownloading ? (
                                  <Loader2 size={13} className="spin" />
                                ) : (
                                  <Download size={13} />
                                )}
                              </button>

                              {/* View Report modal button */}
                              <button
                                onClick={() => {
                                  if (onViewReport) {
                                    onViewReport({
                                      id: interview.id,
                                      sessionId: interview.sessionId || interview.id,
                                      role: interview.role,
                                      company: interview.company,
                                      overallScore: scoreVal,
                                      scores: interview.details?.scores || interview.criterionScores || {
                                        communication: interview.communication || 88,
                                        technicalDepth: interview.technical_depth || 86,
                                        problemSolving: interview.problem_solving || 85,
                                        confidence: interview.confidence || 82,
                                      },
                                      criterionScores: interview.details?.criterionScores || interview.criterionScores,
                                      criterionWeights: interview.details?.criterionWeights || interview.criterionWeights,
                                      strengths: interview.details?.strengths || interview.strengths || [],
                                      improvements: interview.details?.improvements || interview.improvements || [],
                                      questionFeedback: interview.details?.questionFeedback || interview.questionFeedback || [],
                                      verbalDelivery: interview.details?.verbalDelivery || interview.verbalDelivery,
                                      visualObservations: interview.details?.visualObservations || interview.visualObservations,
                                      knowledgeGaps: interview.details?.knowledgeGaps || interview.knowledgeGaps || [],
                                      studyRoadmap: interview.details?.studyRoadmap || interview.studyRoadmap || [],
                                      summary: interview.details?.summary || interview.summary
                                    });
                                  }
                                }}
                                className="btn-secondary"
                                style={{
                                  padding: '0.38rem 0.65rem',
                                  fontSize: '0.73rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '7px',
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                <FileText size={11} color="var(--accent-gold)" />
                                <span>Report</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* =====================================================================
                E. TOPICS TO WORK ON (RIGHT COLUMN)
                ===================================================================== */}
            <section
              style={{
                backgroundColor: '#111111',
                border: '1px solid var(--border-card)',
                borderRadius: '20px',
                padding: '1.8rem 2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <BarChart2 size={17} />
                </div>
                <h3
                  className="serif-heading"
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  Topics to Work On
                </h3>
              </div>

              {/* 3 Skill Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-between' }}>
                {topicsToWorkOn.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={topic.id}
                      style={{
                        backgroundColor: '#161616',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      {/* Top: Icon + Title + Percentage */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-primary)',
                            }}
                          >
                            <Icon size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {topic.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {topic.description}
                            </div>
                          </div>
                        </div>

                        {/* Percentage */}
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace',
                            marginLeft: '0.5rem',
                          }}
                        >
                          {topic.percentage}%
                        </div>
                      </div>

                      {/* Slim Progress Bar */}
                      <div
                        style={{
                          height: '5px',
                          backgroundColor: '#222222',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${topic.percentage}%`,
                            background: 'linear-gradient(90deg, #E2C99A, #F5E7C8)',
                            borderRadius: '9999px',
                            boxShadow: '0 0 10px rgba(217, 183, 122, 0.3)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </main>
      </div>

      {/* Responsive Breakpoints Style */}
      <style>{`
        @media (max-width: 1024px) {
          .dashboard-lower-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-main-content {
            padding: 2rem 1.5rem !important;
          }
        }
        @media (max-width: 868px) {
          .dashboard-sidebar {
            display: none !important;
          }
          .dashboard-mobile-tabs {
            display: flex !important;
          }
          .welcome-header-right {
            align-items: flex-start !important;
            width: 100%;
          }
          .welcome-header-row {
            gap: 1.5rem !important;
          }
          .interviews-table-header {
            grid-template-columns: 1.5fr 60px 85px 95px !important;
          }
          .interview-row-item {
            grid-template-columns: 1.5fr 60px 85px 95px !important;
          }
        }
        @media (max-width: 580px) {
          .interviews-table-header {
            display: none !important;
          }
          .interview-row-item {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
            padding: 1rem !important;
            background-color: #141414 !important;
            margin-bottom: 0.5rem;
          }
          .dashboard-main-content {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
