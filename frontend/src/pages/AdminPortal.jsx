import { useEffect, useState, useMemo } from "react";
import {
  adminDeleteUser,
  adminGetUser,
  adminListUsers,
  adminUpdateUser,
  adminGetMetrics,
  adminListInterviews,
} from "../api";
import { useAuth } from "../context/useAuth";
import "./AdminPortal.css";

function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users"); // "users" | "interviews" | "analytics"
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(user?.is_admin));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Platform Metrics State
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Platform Interviews State
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [interviewStatusFilter, setInterviewStatusFilter] = useState("all");
  const [interviewSearch, setInterviewSearch] = useState("");

  const isAdmin = Boolean(user?.is_admin);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminListUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      setMetricsLoading(true);
      const data = await adminGetMetrics();
      if (data && data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.warn("Failed to load admin metrics:", err.message);
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadInterviews = async (status = "all") => {
    try {
      setInterviewsLoading(true);
      const data = await adminListInterviews({ status: status === "all" ? undefined : status });
      if (data && data.interviews) {
        setInterviews(data.interviews);
      }
    } catch (err) {
      console.warn("Failed to load admin interviews:", err.message);
    } finally {
      setInterviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
    loadMetrics();
    loadInterviews(interviewStatusFilter);
  }, [isAdmin]);

  const handleStatusFilterChange = (newStatus) => {
    setInterviewStatusFilter(newStatus);
    loadInterviews(newStatus);
  };

  const runAction = async (userId, updates) => {
    if (busyUserId) return;
    setBusyUserId(userId);
    setError("");
    setSuccess("");
    try {
      const updated = await adminUpdateUser(userId, updates);
      setUsers((current) => current.map((item) => (item.id === userId ? updated : item)));
      if (selectedUser?.id === userId) {
        setSelectedUser((current) => (current ? { ...current, ...updated } : current));
      }
      if (updates.is_admin !== undefined) {
        setSuccess(
          updates.is_admin
            ? `Successfully promoted ${updated.name || "user"} to administrator.`
            : `Successfully revoked admin privileges from ${updated.name || "user"}.`
        );
      } else if (updates.is_active !== undefined) {
        setSuccess(
          updates.is_active
            ? `Successfully enabled ${updated.name || "user"}'s account.`
            : `Successfully disabled ${updated.name || "user"}'s account.`
        );
      }
      loadMetrics();
    } catch (err) {
      setError(err.message || "Could not update that user.");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (busyUserId) return;
    if (!window.confirm("Delete this user permanently? This will remove all their records.")) return;
    setBusyUserId(userId);
    setError("");
    setSuccess("");
    try {
      await adminDeleteUser(userId);
      setUsers((current) => current.filter((item) => item.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      setSuccess("User and associated records deleted successfully.");
      loadMetrics();
    } catch (err) {
      setError(err.message || "Could not delete that user.");
    } finally {
      setBusyUserId(null);
    }
  };

  const showUserDetails = async (userId) => {
    setDetailsLoading(true);
    setError("");
    try {
      setSelectedUser(await adminGetUser(userId));
    } catch (err) {
      setError(err.message || "Could not load user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "Not available");
  const formatPracticeTime = (minutes) => {
    if (!minutes) return "0 mins";
    return minutes < 60 ? `${minutes} mins` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.target_role && u.target_role.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  const filteredInterviews = useMemo(() => {
    if (!interviewSearch.trim()) return interviews;
    const q = interviewSearch.toLowerCase().trim();
    return interviews.filter(
      (i) =>
        (i.candidate_name && i.candidate_name.toLowerCase().includes(q)) ||
        (i.candidate_email && i.candidate_email.toLowerCase().includes(q)) ||
        (i.company && i.company.toLowerCase().includes(q)) ||
        (i.role && i.role.toLowerCase().includes(q))
    );
  }, [interviews, interviewSearch]);

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <section className="admin-hero admin-denied">
            <h1>Admin access required</h1>
            <p>You need an administrator account to view this control plane.</p>
          </section>
        </div>
      </main>
    );
  }

  const totalUsers = metrics?.total_users ?? users.length;
  const adminCount = metrics?.admin_count ?? users.filter((item) => item.is_admin).length;
  const activeCount = metrics?.active_users ?? users.filter((item) => item.is_active).length;
  const totalInterviews = metrics?.total_interviews ?? 0;
  const completedInterviews = metrics?.completed_interviews ?? 0;
  const avgScore = metrics?.average_score ?? 0;
  const practiceHours = metrics?.practice_hours ?? 0;

  return (
    <main className="admin-page">
      <div className="admin-container">

        <section className="admin-hero">
          <span className="eyebrow">✦ INTERVISTA AI CONTROL PLANE</span>
          <h1>Platform Administration</h1>
          <p>Real-time database operations, user lifecycle controls, interview telemetry, and system health.</p>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: activeTab === 'users' ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                background: activeTab === 'users' ? 'rgba(217, 183, 122, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'users' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              👤 User Accounts ({users.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("interviews");
                loadInterviews(interviewStatusFilter);
              }}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: activeTab === 'interviews' ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                background: activeTab === 'interviews' ? 'rgba(217, 183, 122, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'interviews' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🎙️ Candidate Interviews ({totalInterviews})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("analytics");
                loadMetrics();
              }}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: activeTab === 'analytics' ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                background: activeTab === 'analytics' ? 'rgba(217, 183, 122, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'analytics' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📊 System Health & Analytics
            </button>
          </div>
        </section>

        {/* Top Summary Cards (Always dynamically bound to DB queries) */}
        <div className="admin-summary">
          <div className="admin-summary-card">
            <span>REGISTERED USERS</span>
            <strong>{totalUsers}</strong>
            <span style={{ fontSize: '0.75rem', marginTop: '4px', color: '#10B981' }}>{activeCount} active accounts</span>
          </div>
          <div className="admin-summary-card">
            <span>PLATFORM INTERVIEWS</span>
            <strong>{totalInterviews}</strong>
            <span style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--accent-gold)' }}>{completedInterviews} completed sessions</span>
          </div>
          <div className="admin-summary-card">
            <span>AVERAGE PLATFORM SCORE</span>
            <strong>{avgScore}%</strong>
            <span style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-secondary)' }}>{practiceHours} total practice hrs</span>
          </div>
        </div>

        {error && <p className="admin-error" role="alert" style={{ marginBottom: '1.5rem' }}>{error}</p>}
        {success && <p className="admin-success" role="status" style={{ marginBottom: '1.5rem' }}>{success}</p>}

        {/* ─── TAB 1: USERS & ROLES ────────────────────────────────────── */}
        {activeTab === "users" && (
          <section className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0 }}>Registered User Accounts</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.85rem',
                    minWidth: '240px',
                  }}
                />
                <button
                  type="button"
                  onClick={loadUsers}
                  className="admin-action-btn"
                  title="Reload users from database"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading && <p className="admin-loading">Loading users from SQLite database...</p>}

            {!loading && filteredUsers.length === 0 && (
              <p className="admin-empty">{userSearch ? "No users matching your search." : "No users registered yet."}</p>
            )}

            {!loading && filteredUsers.length > 0 && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Target Role</th>
                    <th>Progress</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => {
                    const isSelf = item.id === user?.id;
                    const isBusy = busyUserId === item.id;
                    const isAnyBusy = Boolean(busyUserId);

                    return (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.email}</td>
                        <td>
                          <span className={`admin-badge ${item.is_admin ? "admin" : "member"}`}>
                            {item.is_admin ? "Admin" : "Member"}
                          </span>
                        </td>
                        <td>
                          {item.is_active ? (
                            <span className="admin-badge member">Active</span>
                          ) : (
                            <span className="admin-badge disabled">Disabled</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {item.target_role || "Software Engineer"}
                        </td>
                        <td>
                          <div className="admin-mini-progress">
                            <div className="admin-mini-track">
                              <div className="admin-mini-fill" style={{ width: `${item.progress}%` }} />
                            </div>
                            <span>{item.progress}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-action-btn"
                              disabled={isAnyBusy}
                              onClick={() => showUserDetails(item.id)}
                            >
                              Inspect
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn"
                              disabled={isAnyBusy || isSelf}
                              onClick={() => runAction(item.id, { is_admin: !item.is_admin })}
                              title={isSelf ? "You cannot modify your own administrator role" : undefined}
                            >
                              {isBusy ? "Updating..." : item.is_admin ? "Revoke admin" : "Make admin"}
                            </button>

                            <button
                              type="button"
                              className="admin-action-btn"
                              disabled={isAnyBusy || isSelf}
                              onClick={() => runAction(item.id, { is_active: !item.is_active })}
                              title={isSelf ? "You cannot modify your own account status" : undefined}
                            >
                              {isBusy ? "Updating..." : item.is_active ? "Disable" : "Enable"}
                            </button>

                            <button
                              type="button"
                              className="admin-action-btn danger"
                              disabled={isAnyBusy || isSelf}
                              onClick={() => handleDelete(item.id)}
                              title={isSelf ? "You cannot delete your own account" : undefined}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── TAB 2: CANDIDATE INTERVIEWS ─────────────────────────────── */}
        {activeTab === "interviews" && (
          <section className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Candidate Interviews & Proctoring Telemetry</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Audited interview sessions across all candidates with verified scores and completion state.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={interviewStatusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Failed">Failed / Terminated</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by candidate, company, role..."
                  value={interviewSearch}
                  onChange={(e) => setInterviewSearch(e.target.value)}
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.85rem',
                    minWidth: '220px',
                  }}
                />

                <button
                  type="button"
                  onClick={() => loadInterviews(interviewStatusFilter)}
                  className="admin-action-btn"
                >
                  Refresh
                </button>
              </div>
            </div>

            {interviewsLoading && <p className="admin-loading">Loading candidate interview records...</p>}

            {!interviewsLoading && filteredInterviews.length === 0 && (
              <p className="admin-empty">No interview sessions found for the current filter.</p>
            )}

            {!interviewsLoading && filteredInterviews.length > 0 && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Candidate</th>
                    <th>Target Role & Company</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Date</th>
                    <th>Feedback Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((item) => {
                    const scoreVal = item.score_num ?? (parseInt(item.score, 10) || 0);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>#{item.id}</td>
                        <td>
                          <div><strong>{item.candidate_name}</strong></div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.candidate_email}</div>
                        </td>
                        <td>
                          <div>{item.company}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.role}</div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: scoreVal >= 80 ? '#10B981' : scoreVal >= 60 ? 'var(--accent-gold)' : '#EF4444',
                            }}
                          >
                            {scoreVal}%
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${
                              item.status === "Completed" ? "member" : item.status === "Scheduled" ? "admin" : "disabled"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.duration_minutes}m</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.date}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.feedback || "Automated evaluation completed."}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── TAB 3: SYSTEM HEALTH & OPERATIONAL ANALYTICS ─────────────── */}
        {activeTab === "analytics" && (
          <section className="admin-card">
            <h2>Operational Infrastructure & AI Telemetry</h2>

            {metricsLoading && <p className="admin-loading">Probing system health metrics...</p>}

            {metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', margin: '0 0 1rem' }}>System Services</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Core API:</span>
                      <strong style={{ color: '#10B981' }}>Operational (FastAPI)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Database:</span>
                      <strong style={{ color: '#10B981' }}>{metrics.system_health?.database || 'SQLite / Connected'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>AI Evaluation Engine:</span>
                      <strong style={{ color: 'var(--accent-gold)' }}>Active (Dual LLM Rubric)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Speech-To-Text:</span>
                      <strong style={{ color: '#10B981' }}>Ready (Web Speech API + Cloud STT)</strong>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', margin: '0 0 1rem' }}>Candidate Engagement</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Solved DSA Resources:</span>
                      <strong>{metrics.total_solved_resources ?? 0} problems</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Solved Challenges:</span>
                      <strong>{metrics.total_solved_challenges ?? 0} challenges</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Failed Sessions:</span>
                      <strong style={{ color: metrics.failed_interviews > 0 ? '#EF4444' : '#10B981' }}>
                        {metrics.failed_interviews ?? 0} sessions
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Scheduled Queue:</span>
                      <strong>{metrics.scheduled_interviews ?? 0} upcoming</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── USER DETAILS INSPECTOR MODAL/DRAWER ─────────────────────── */}
        {(detailsLoading || selectedUser) && (
          <section className="admin-card admin-details" aria-live="polite">
            {detailsLoading && <p className="admin-loading">Loading full user details...</p>}
            {selectedUser && !detailsLoading && (
              <>
                <div className="admin-details-header">
                  <div>
                    <span className="eyebrow">USER INSPECTOR</span>
                    <h2>{selectedUser.name}</h2>
                    <p>{selectedUser.email} · Joined {formatDate(selectedUser.created_at)}</p>
                  </div>
                  <button type="button" className="admin-action-btn" onClick={() => setSelectedUser(null)}>Close</button>
                </div>

                <div className="admin-detail-grid">
                  <div><span>Account status</span><strong>{selectedUser.is_active ? "Active" : "Disabled"}</strong></div>
                  <div><span>Role</span><strong>{selectedUser.is_admin ? "Admin" : "Member"}</strong></div>
                  <div><span>Target role</span><strong>{selectedUser.target_role || "Not set"}</strong></div>
                  <div><span>Progress</span><strong>{selectedUser.progress}%</strong></div>
                  <div><span>XP</span><strong>{selectedUser.xp ?? 0}</strong></div>
                  <div><span>Practice time</span><strong>{formatPracticeTime(selectedUser.practice_minutes)}</strong></div>
                  <div><span>Completed interviews</span><strong>{selectedUser.completed_interviews}</strong></div>
                  <div><span>Scheduled interviews</span><strong>{selectedUser.scheduled_interviews}</strong></div>
                  <div><span>Average score</span><strong>{selectedUser.average_interview_score ?? "—"}{selectedUser.average_interview_score !== null && "%"}</strong></div>
                  <div><span>Best score</span><strong>{selectedUser.best_interview_score ?? "—"}{selectedUser.best_interview_score !== null && "%"}</strong></div>
                  <div><span>Resources solved</span><strong>{selectedUser.solved_resources}</strong></div>
                  <div><span>Challenges solved</span><strong>{selectedUser.solved_challenges}</strong></div>
                  <div><span>Unread alerts</span><strong>{selectedUser.unread_notifications}</strong></div>
                  <div><span>Last active</span><strong>{formatDate(selectedUser.last_active_at)}</strong></div>
                  <div><span>Last login</span><strong>{formatDate(selectedUser.last_login_at)}</strong></div>
                </div>

                <div className="admin-detail-copy">
                  <div><span>Bio</span><p>{selectedUser.bio || "No bio added."}</p></div>
                  <div><span>Skills</span><p>{selectedUser.skills || "No skills added."}</p></div>
                </div>

                <h3>Recent interviews</h3>
                {selectedUser.recent_interviews.length === 0 ? (
                  <p className="admin-empty">No interview activity yet.</p>
                ) : (
                  <div className="admin-interview-list">
                    {selectedUser.recent_interviews.map((interview) => (
                      <div key={interview.id} className="admin-interview-row">
                        <strong>{interview.company} · {interview.role}</strong>
                        <span>{interview.status} · {interview.score || "No score"} · {interview.date || "No date"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

      </div>
    </main>
  );
}

export default AdminPortal;
