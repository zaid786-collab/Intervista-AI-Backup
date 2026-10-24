import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Mic,
  Clock,
  Trophy,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Settings,
  Edit3,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
  AlertOctagon,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import {
  apiGetMe,
  apiUpdateProfile,
  fetchDashboardData,
  apiGetReports,
  hasTerminatedInterviewOnRecord,
  getLatestTerminatedSession,
} from '../utils/api';

export default function ProfilePage({
  currentUser,
  onStartInterview,
  onNavigate,
  onViewReport,
  onLogout,
  onBackToOverview,
}) {
  const [profileUser, setProfileUser] = useState(currentUser || getCurrentUser() || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dbReports, setDbReports] = useState([]);

  const user = profileUser || currentUser || getCurrentUser() || {
    name: 'Interview Candidate',
    email: 'candidate@example.com',
  };

  const name = user?.name || 'Interview Candidate';
  const email = user?.email || 'candidate@example.com';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Oct 2026';

  // Load custom skills from user profile or defaults
  const [skills, setSkills] = useState(() => {
    if (user?.skills) {
      if (Array.isArray(user.skills) && user.skills.length > 0) return user.skills;
      if (typeof user.skills === 'string') {
        const parsed = user.skills.split(',').map((s) => s.trim()).filter(Boolean);
        if (parsed.length > 0) return parsed;
      }
    }
    try {
      const saved = localStorage.getItem('intervista_user_skills');
      return saved
        ? JSON.parse(saved)
        : ['DSA & Algorithms', 'System Design', 'React.js', 'Node.js', 'Python', 'AI / ML', 'Problem Solving', 'Behavioral'];
    } catch {
      return ['DSA & Algorithms', 'System Design', 'React.js', 'Node.js', 'Python', 'AI / ML', 'Problem Solving', 'Behavioral'];
    }
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [nameSaveNotice, setNameSaveNotice] = useState('');

  // Performance metrics dynamically populated from real database records
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: '0%',
    bestScore: '0%',
    practiceTime: '0 mins',
    readiness: 75,
  });

  // Fetch real profile and dashboard metrics from backend on mount
  useEffect(() => {
    let active = true;
    async function loadLatestProfile() {
      try {
        setLoadingProfile(true);
        const [meResult, dashResult, reportsResult] = await Promise.allSettled([
          apiGetMe(),
          fetchDashboardData(),
          apiGetReports(),
        ]);

        if (!active) return;

        if (meResult.status === 'fulfilled' && meResult.value) {
          const me = meResult.value;
          setProfileUser(me);
          if (me.name) setEditedName(me.name);
          if (me.skills) {
            const parsed = Array.isArray(me.skills)
              ? me.skills
              : typeof me.skills === 'string'
              ? me.skills.split(',').map((s) => s.trim()).filter(Boolean)
              : [];
            if (parsed.length > 0) {
              setSkills(parsed);
            }
          }
        }

        if (dashResult.status === 'fulfilled' && dashResult.value?.metrics) {
          const m = dashResult.value.metrics;
          const avgNum = parseInt(m.avg_score, 10) || 0;
          setStats({
            totalInterviews: m.total_interviews ?? 0,
            avgScore: m.avg_score || '0%',
            bestScore: m.best_score || '0%',
            practiceTime: m.practice_time || '0 mins',
            readiness: avgNum > 0 ? Math.min(100, Math.round(avgNum * 0.95)) : 75,
          });
        }

        if (reportsResult.status === 'fulfilled' && Array.isArray(reportsResult.value)) {
          setDbReports(reportsResult.value);
        }
      } catch (err) {
        console.warn('Profile load exception:', err);
      } finally {
        if (active) setLoadingProfile(false);
      }
    }
    loadLatestProfile();

    const handleSync = () => {
      loadLatestProfile();
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      active = false;
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Check if candidate profile has any proctoring termination or disqualification on record
  const isDisqualified = useMemo(() => {
    if (hasTerminatedInterviewOnRecord()) return true;
    if (dbReports && Array.isArray(dbReports)) {
      return dbReports.some(
        (r) =>
          r.isTerminated ||
          r.status?.toString().toUpperCase().includes('TERMINAT') ||
          r.efficiencyGrade?.toString().toLowerCase().includes('disqualified')
      );
    }
    return false;
  }, [dbReports]);

  // Retrieve the latest terminated session details for incident reporting
  const latestTerminatedSession = useMemo(() => {
    return (
      getLatestTerminatedSession() ||
      (dbReports && Array.isArray(dbReports)
        ? dbReports.find(
            (r) =>
              r.isTerminated ||
              r.status?.toString().toUpperCase().includes('TERMINAT') ||
              r.efficiencyGrade?.toString().toLowerCase().includes('disqualified')
          )
        : null)
    );
  }, [dbReports]);

  // Recent Mock Sessions bound to actual database reports with authentic proctoring statuses
  const recentSessions = useMemo(() => {
    if (dbReports && dbReports.length > 0) {
      return dbReports.slice(0, 5).map((r) => {
        const term = Boolean(
          r.isTerminated ||
          r.status?.toString().toUpperCase().includes('TERMINAT') ||
          r.efficiencyGrade?.toString().toLowerCase().includes('disqualified')
        );
        const isPhone =
          (r.terminationReason || r.status || '').toLowerCase().includes('phone') ||
          (r.terminationReason || '').toLowerCase().includes('mobile');
        return {
          id: r.id,
          company: r.company || 'Intervista AI',
          role: r.role || 'Software Engineer',
          date: r.createdAt
            ? typeof r.createdAt === 'string' && r.createdAt.includes('T')
              ? new Date(r.createdAt).toLocaleDateString()
              : r.createdAt
            : 'Recently',
          score: term ? 0 : (r.overallScore ?? r.score ?? 80),
          level: r.level || 'Mid Level',
          isTerminated: term,
          terminationReason:
            r.terminationReason ||
            (isPhone
              ? 'Unauthorized mobile phone usage detected during technical assessment.'
              : 'Proctoring security limit exceeded during technical session.'),
          status: term
            ? 'Terminated (Disqualified)'
            : (r.overallScore ?? r.score ?? 80) >= 80
            ? 'Outstanding'
            : 'Evaluated',
          rawReport: r,
        };
      });
    }
    return [];
  }, [dbReports]);

  // Save skills to MongoDB & local state
  const handleAddSkill = async (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !skills.includes(clean)) {
      const updated = [...skills, clean];
      setSkills(updated);
      localStorage.setItem('intervista_user_skills', JSON.stringify(updated));
      setNewSkillInput('');
      setShowAddSkill(false);

      try {
        const res = await apiUpdateProfile({ skills: updated });
        if (res) setProfileUser(res);
      } catch (err) {
        console.warn('Failed to sync skill to backend:', err.message);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    localStorage.setItem('intervista_user_skills', JSON.stringify(updated));

    try {
      const res = await apiUpdateProfile({ skills: updated });
      if (res) setProfileUser(res);
    } catch (err) {
      console.warn('Failed to sync skill deletion to backend:', err.message);
    }
  };

  // Save profile name to database
  const handleSaveName = async (e) => {
    e.preventDefault();
    const cleanName = editedName.trim();
    if (!cleanName || cleanName.length < 2) return;

    try {
      const updatedUser = await apiUpdateProfile({ name: cleanName });
      setProfileUser(updatedUser);
      setIsEditingName(false);
      setNameSaveNotice('Profile updated successfully!');
      setTimeout(() => setNameSaveNotice(''), 3000);

      // Trigger re-render across navbar
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('[save name error]', err);
      // Fallback local persistence if offline
      const current = getCurrentUser() || {};
      const fallbackUser = { ...current, name: cleanName };
      localStorage.setItem('intervista_current_user', JSON.stringify(fallbackUser));
      setIsEditingName(false);
      setNameSaveNotice(err.message || 'Saved locally.');
      setTimeout(() => setNameSaveNotice(''), 3000);
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <main
      className="profile-page"
      style={{
        minHeight: onBackToOverview ? 'auto' : '100vh',
        padding: onBackToOverview ? '0 0 4rem 0' : 'calc(var(--nav-height) + 2rem) 1.5rem 5rem 1.5rem',
        backgroundColor: onBackToOverview ? 'transparent' : 'var(--bg-base)',
        color: 'var(--text-primary)',
        overflowX: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Navigation Breadcrumb Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => {
              if (onBackToOverview) onBackToOverview();
              else if (onNavigate) onNavigate('dashboard');
              else window.location.href = '/dashboard';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s',
              padding: '0.2rem 0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            ← Back to Dashboard
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(217, 183, 122, 0.08)',
              border: '1px solid rgba(217, 183, 122, 0.2)',
              color: 'var(--accent-gold)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} />
            <span>Candidate Space</span>
          </div>
        </div>

        {/* ================= 1. HERO PROFILE CARD ================= */}
        <section
          id="profile-hero-card"
          style={{
            backgroundColor: isDisqualified ? '#160909' : '#121212',
            border: isDisqualified ? '2px solid rgba(239, 68, 68, 0.85)' : '1px solid var(--border-card)',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: isDisqualified ? '1.25rem' : '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            boxShadow: isDisqualified
              ? '0 20px 50px rgba(239, 68, 68, 0.28), 0 0 35px rgba(239, 68, 68, 0.2)'
              : '0 20px 50px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle gold or red ambient backdrop glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: isDisqualified
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(217, 183, 122, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.75rem',
              flexWrap: 'wrap',
              zIndex: 1,
              minWidth: 0,
              flex: '1 1 320px',
            }}
          >
            {/* Avatar Circle - Glowing Red Marked if Disqualified */}
            <div
              id="profile-avatar-circle"
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: isDisqualified
                  ? 'linear-gradient(135deg, #2B1111, #180808)'
                  : 'linear-gradient(135deg, #242424, #151515)',
                border: isDisqualified ? '3px solid #EF4444' : '2px solid var(--accent-gold)',
                boxShadow: isDisqualified
                  ? '0 0 35px rgba(239, 68, 68, 0.85), inset 0 0 15px rgba(239, 68, 68, 0.4)'
                  : '0 0 25px rgba(217, 183, 122, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDisqualified ? '#EF4444' : 'var(--accent-gold)',
                fontSize: '2.4rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}

              {/* Red Disqualification Pin Badge */}
              {isDisqualified && (
                <div
                  id="profile-avatar-disqualification-badge"
                  title="Integrity Disqualification Flag"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    backgroundColor: '#EF4444',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #000',
                    color: '#FFF',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.95)',
                    zIndex: 5,
                  }}
                >
                  <AlertOctagon size={14} />
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div style={{ minWidth: 0, flex: '1 1 240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isDisqualified ? '#EF4444' : 'var(--accent-gold)',
                  }}
                >
                  {isDisqualified ? '⚠ INTEGRITY AUDITED PROFILE' : '✦ CANDIDATE PROFILE'}
                </span>
                {isDisqualified ? (
                  <span
                    id="profile-disqualified-status-pill"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.65)',
                      color: '#F87171',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      letterSpacing: '0.04em',
                      boxShadow: '0 0 12px rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    <AlertOctagon size={12} color="#EF4444" />
                    DISQUALIFICATION ON RECORD
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#4ADE80',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
                    ACTIVE MEMBER
                  </span>
                )}
              </div>

              <h1
                className="serif-heading"
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 400,
                  margin: '0 0 0.4rem 0',
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                Welcome, <span style={{ color: isDisqualified ? '#F87171' : 'var(--accent-gold)' }}>{name}</span>
              </h1>
              <p
                style={{
                  color: isDisqualified ? '#FFA4A4' : 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  margin: 0,
                  maxWidth: '540px',
                  lineHeight: 1.5,
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {isDisqualified
                  ? 'Your profile reflects an active proctoring integrity disqualification from a recent technical interview session.'
                  : 'Manage your credentials, track technical milestones, and build your AI-evaluated interview portfolio.'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', zIndex: 1, flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsEditingName(true)}
              className="btn-ghost-outline"
              style={{
                padding: '0.6rem 1.15rem',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Edit3 size={15} />
              <span>Edit Name</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="btn-primary"
              style={{
                padding: '0.62rem 1.35rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Settings size={15} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </section>

        {/* ================= RED INTEGRITY DISQUALIFICATION BANNER ================= */}
        {isDisqualified && (
          <div
            id="profile-integrity-warning-banner"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid rgba(239, 68, 68, 0.65)',
              borderRadius: '16px',
              padding: '1.35rem 1.75rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.22)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.22)',
                border: '1px solid rgba(239, 68, 68, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <strong style={{ color: '#F87171', fontSize: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Proctoring Integrity Disqualification Flagged
                </strong>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 9px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#FFA4A4',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  AUDIT SCORE: 0%
                </span>
              </div>
              <p style={{ margin: '0 0 0.65rem 0', color: '#FCA5A5', fontSize: '0.86rem', lineHeight: 1.55 }}>
                A recent technical mock interview was terminated immediately due to an automated proctoring security violation (
                <strong>{latestTerminatedSession?.terminationReason || 'Unauthorized mobile device or multi-candidate presence'}</strong>
                ). In accordance with Intervista AI integrity protocols, this session resulted in an instant disqualification with an audit score of 0 and has been permanently recorded on your candidate profile audit.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('history');
                    else window.location.href = '/history';
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(239, 68, 68, 0.55)',
                    color: '#FFA4A4',
                    padding: '0.4rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Review Incident in History →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notice upon Name Save */}
        {nameSaveNotice && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#4ADE80',
              fontSize: '0.85rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={16} />
            <span>{nameSaveNotice}</span>
          </div>
        )}

        {/* Modal / Inline Edit for Name */}
        {isEditingName && (
          <div
            style={{
              backgroundColor: '#161616',
              border: '1px solid var(--accent-gold)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Change Display Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter full name"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  backgroundColor: '#1E1E1E',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', paddingTop: '1.4rem' }}>
              <button onClick={handleSaveName} className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                Save Name
              </button>
              <button onClick={() => setIsEditingName(false)} className="btn-ghost-outline" style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================= 2. PERSONAL INFORMATION & MEMBERSHIP ================= */}
        <section
          style={{
            backgroundColor: '#121212',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              ACCOUNT & MEMBERSHIP
            </span>
            <h2 className="serif-heading" style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem 0' }}>
              Personal Information & Plan Tier
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Your verified credentials and currently activated Intervista plan.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Field: Full Name */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '1.25rem',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>
                <User size={15} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Full Name
                </span>
              </div>
              <strong
                style={{
                  fontSize: '1.02rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  display: 'block',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {name}
              </strong>
            </div>

            {/* Field: Email Address (Overflow Fixed with anywhere wrap) */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '1.25rem',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>
                <Mail size={15} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Email Address
                </span>
              </div>
              <strong
                title={email}
                style={{
                  fontSize: '0.98rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  display: 'block',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {email}
              </strong>
            </div>

            {/* Field: Subscription Tier */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '1.25rem',
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: '1 1 120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>
                  <Award size={15} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Subscription Tier
                  </span>
                </div>
                <strong style={{ fontSize: '1.02rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'block' }}>
                  Pro Member ✦
                </strong>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('plans')}
                className="btn-ghost-outline"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.76rem', flexShrink: 0 }}
              >
                Change Plan
              </button>
            </div>

            {/* Field: Member Since */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '1.25rem',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>
                <Calendar size={15} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Member Since
                </span>
              </div>
              <strong style={{ fontSize: '1.02rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>
                {memberSince}
              </strong>
            </div>
          </div>
        </section>

        {/* ================= 3. OVERALL READINESS PROGRESS ================= */}
        <section
          style={{
            backgroundColor: '#121212',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ minWidth: 0, flex: '1 1 260px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-gold)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                CAREER READINESS
              </span>
              <h2 className="serif-heading" style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem 0' }}>
                Overall Interview Readiness
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                Aggregated progress across technical coding, system design, and audio fluency.
              </p>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Candidate Readiness</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', lineHeight: 1.2 }}>
                {stats.readiness}%
              </strong>
            </div>
          </div>

          {/* Progress Bar with Gold Gradient */}
          <div
            style={{
              width: '100%',
              height: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2px',
              boxSizing: 'border-box',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: `${stats.readiness}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #B89252, #D9B77A, #F6F0E7)',
                boxShadow: '0 0 14px rgba(217, 183, 122, 0.55)',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Readiness Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Technical Depth</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>88%</strong>
                <span style={{ color: '#4ADE80', fontSize: '0.75rem', fontWeight: 600 }}>✓ Advanced</span>
              </div>
            </div>

            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Audio Telemetry</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>92%</strong>
                <span style={{ color: '#4ADE80', fontSize: '0.75rem', fontWeight: 600 }}>✓ Fluent</span>
              </div>
            </div>

            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Behavioral (STAR)</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>82%</strong>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600 }}>● In Progress</span>
              </div>
            </div>

            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>System Architecture</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>78%</strong>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600 }}>● In Progress</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. PERFORMANCE STATISTICS ================= */}
        <section
          style={{
            backgroundColor: '#121212',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              PERFORMANCE ANALYTICS
            </span>
            <h2 className="serif-heading" style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem 0' }}>
              Interview Statistics
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Live telemetry and scoring metrics aggregated from your mock simulations.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Stat: Total Interviews */}
            <div
              style={{
                backgroundColor: 'rgba(217, 183, 122, 0.03)',
                border: '1px solid rgba(217, 183, 122, 0.18)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem auto',
                }}
              >
                <Mic size={20} />
              </div>
              <strong style={{ display: 'block', fontSize: '1.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {stats.totalInterviews}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interviews Completed</span>
            </div>

            {/* Stat: Average Score */}
            <div
              style={{
                backgroundColor: 'rgba(217, 183, 122, 0.03)',
                border: '1px solid rgba(217, 183, 122, 0.18)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem auto',
                }}
              >
                <TrendingUp size={20} />
              </div>
              <strong style={{ display: 'block', fontSize: '1.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {stats.avgScore}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average Score</span>
            </div>

            {/* Stat: Best Score */}
            <div
              style={{
                backgroundColor: 'rgba(217, 183, 122, 0.03)',
                border: '1px solid rgba(217, 183, 122, 0.18)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem auto',
                }}
              >
                <Trophy size={20} />
              </div>
              <strong style={{ display: 'block', fontSize: '1.85rem', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                {stats.bestScore}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Peak Assessment</span>
            </div>

            {/* Stat: Practice Time */}
            <div
              style={{
                backgroundColor: 'rgba(217, 183, 122, 0.03)',
                border: '1px solid rgba(217, 183, 122, 0.18)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem auto',
                }}
              >
                <Clock size={20} />
              </div>
              <strong style={{ display: 'block', fontSize: '1.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {stats.practiceTime}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Practice Time</span>
            </div>
          </div>
        </section>

        {/* ================= 5. SKILLS & TARGET DOMAINS ================= */}
        <section
          style={{
            backgroundColor: '#121212',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: 0, flex: '1 1 260px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-gold)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                CAREER PROFILE
              </span>
              <h2 className="serif-heading" style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem 0' }}>
                Skills & Target Domains
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Areas and technical competencies you are currently honing for mock interviews.
              </p>
            </div>

            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="btn-ghost-outline"
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
              <span>Add Custom Skill</span>
            </button>
          </div>

          {/* Add Skill Form */}
          {showAddSkill && (
            <form
              onSubmit={handleAddSkill}
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                padding: '0.85rem',
                borderRadius: '12px',
                border: '1px dashed var(--accent-gold)',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="text"
                autoFocus
                placeholder="e.g. Distributed Systems, Kubernetes, GraphQL"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  backgroundColor: '#191919',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.85rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="btn-ghost-outline"
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Skill Tag Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(217, 183, 122, 0.07)',
                  border: '1px solid rgba(217, 183, 122, 0.22)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  maxWidth: '100%',
                  overflowWrap: 'anywhere',
                }}
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  title={`Remove ${skill}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* ================= 6. RECENT SESSIONS HISTORY ================= */}
        <section
          style={{
            backgroundColor: '#121212',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: 0, flex: '1 1 240px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-gold)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                SESSION ARCHIVE
              </span>
              <h2 className="serif-heading" style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem 0' }}>
                Recent Mock Interviews
              </h2>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="btn-ghost-outline"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', flexShrink: 0 }}
            >
              View Full History →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentSessions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '14px',
                  border: '1px dashed var(--border-card)',
                }}
              >
                <Sparkles size={24} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-primary)', fontSize: '1rem' }}>No Mock Interviews Yet</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem', maxWidth: '380px', marginInline: 'auto' }}>
                  Take your first AI mock interview to generate personalized scorecards, delivery insights, and study roadmaps.
                </p>
                <button
                  onClick={() => onStartInterview && onStartInterview()}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Start Mock Interview
                </button>
              </div>
            ) : (
              recentSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: session.isTerminated ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: session.isTerminated ? '1.5px solid rgba(239, 68, 68, 0.6)' : '1px solid var(--border-card)',
                    borderRadius: '14px',
                    padding: '1.15rem 1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    boxShadow: session.isTerminated ? '0 0 16px rgba(239, 68, 68, 0.15)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.02rem', color: session.isTerminated ? '#FCA5A5' : 'var(--text-primary)' }}>
                        {session.company}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>•</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>
                        {session.role}
                      </span>
                      {session.isTerminated && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.25)',
                            color: '#EF4444',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          DISQUALIFIED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{session.date}</span>
                    {session.isTerminated && (
                      <div
                        style={{
                          marginTop: '0.35rem',
                          fontSize: '0.76rem',
                          color: '#F87171',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <AlertOctagon size={13} color="#EF4444" />
                        <span>{session.terminationReason}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <strong
                        style={{
                          fontSize: '1.25rem',
                          color: session.isTerminated
                            ? '#EF4444'
                            : session.score >= 90
                            ? '#4ADE80'
                            : 'var(--accent-gold)',
                          display: 'block',
                          lineHeight: 1.2,
                        }}
                      >
                        {session.score}%
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: session.isTerminated ? '#F87171' : 'var(--text-tertiary)',
                          fontWeight: session.isTerminated ? 600 : 400,
                        }}
                      >
                        {session.status}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (onViewReport) {
                          onViewReport(
                            session.rawReport || {
                              id: session.id,
                              role: session.role,
                              company: session.company,
                              level: session.level,
                              overallScore: session.score,
                            }
                          );
                        }
                      }}
                      className="btn-ghost-outline"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        borderColor: session.isTerminated ? 'rgba(239, 68, 68, 0.5)' : undefined,
                        color: session.isTerminated ? '#FFA4A4' : undefined,
                      }}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ================= 7. ACCOUNT ACTIONS & SECURITY ================= */}
        <section
          style={{
            backgroundColor: '#121212',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 260px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              SECURITY & PREFERENCES
            </span>
            <h2 className="serif-heading" style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem 0' }}>
              Account Settings & Preferences
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              Manage password updates, audio telemetry storage, or sign out from this device.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="btn-ghost-outline"
              style={{ padding: '0.6rem 1.15rem', fontSize: '0.84rem' }}
            >
              ⚙ Dashboard Settings
            </button>
            <button
              onClick={() => {
                if (onLogout) onLogout();
              }}
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: '9999px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#F87171',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* ================= 8. INSPIRING FINAL CTA ================= */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#121212',
            border: '1px solid rgba(217, 183, 122, 0.35)',
            borderRadius: '24px',
            padding: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            background:
              'radial-gradient(circle at 90% 50%, rgba(217, 183, 122, 0.12) 0%, transparent 50%), linear-gradient(135deg, #151515 0%, #0F0F0F 100%)',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              READY FOR YOUR NEXT INTERVIEW?
            </span>
            <h2
              className="serif-heading"
              style={{
                fontSize: '1.9rem',
                fontWeight: 400,
                margin: '0 0 0.5rem 0',
                lineHeight: 1.25,
                overflowWrap: 'anywhere',
              }}
            >
              Keep practicing.{' '}
              <span style={{ color: 'var(--accent-gold)' }}>Your next offer is closer.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
              Simulate high-pressure voice rounds with instant diagnostic evaluations tailored to top companies.
            </p>
          </div>

          <button
            onClick={() => onStartInterview && onStartInterview()}
            className="btn-primary"
            style={{
              padding: '0.85rem 1.85rem',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              flexShrink: 0,
            }}
          >
            <span>Start New Interview</span>
            <ArrowRight size={16} />
          </button>
        </section>
      </div>

      {/* Responsive media rules for Profile Page */}
      <style>{`
        @media (max-width: 640px) {
          .profile-page section {
            padding: 1.5rem !important;
          }
          .profile-page h1 {
            font-size: 1.65rem !important;
          }
        }
      `}</style>
    </main>
  );
}
