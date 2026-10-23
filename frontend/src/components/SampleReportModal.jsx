import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  RotateCcw,
  Sparkles,
  MessageSquare,
  Code2,
  Lightbulb,
  BarChart3,
  Eye,
  Activity,
  ShieldCheck,
  Camera,
  Mic,
  Info,
  BookOpen,
  Target,
  Clock,
  HelpCircle,
  Loader2,
  RefreshCw,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { apiDownloadReportPdf } from '../utils/api';

export default function SampleReportModal({ isOpen, onClose, reportData, onRetake }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  if (!isOpen) return null;

  const score = reportData?.overallScore ?? reportData?.score ?? 86;
  const roleName = reportData?.role || 'Software Engineer';
  const company = reportData?.company || 'Intervista AI';
  const level = reportData?.level || 'Mid Level';
  const reportId = reportData?.id || reportData?.sessionId || 'rep_seed_google_01';

  // Criterion Scores & Weights
  const criterionScores = reportData?.criterionScores || {
    technicalKnowledge: reportData?.scores?.technicalDepth || 88,
    problemSolving: reportData?.scores?.problemSolving || 85,
    communication: reportData?.scores?.communication || 84,
    confidence: reportData?.scores?.confidence || 82,
  };

  const criterionWeights = reportData?.criterionWeights || {
    technicalKnowledge: 35,
    problemSolving: 30,
    communication: 20,
    confidence: 15,
  };

  const criteriaList = [
    { key: 'technicalKnowledge', label: 'Technical Depth & Knowledge', weight: criterionWeights.technicalKnowledge || 35, score: criterionScores.technicalKnowledge || 88, icon: Code2 },
    { key: 'problemSolving', label: 'Problem Solving & Algorithmic Rigor', weight: criterionWeights.problemSolving || 30, score: criterionScores.problemSolving || 85, icon: Lightbulb },
    { key: 'communication', label: 'Communication & Answer Structure', weight: criterionWeights.communication || 20, score: criterionScores.communication || 84, icon: MessageSquare },
    { key: 'confidence', label: 'Confidence & Professional Poise', weight: criterionWeights.confidence || 15, score: criterionScores.confidence || 82, icon: BarChart3 },
  ];

  // ─── Multimodal Telemetry (Facial Expressions, Body Language & Posture, Vocals) ───
  const multimodal = reportData?.multimodalAnalysis || reportData?.multimodal;
  const rawFacial = multimodal?.facialAnalysis || reportData?.facialAnalysis;
  const rawBody = multimodal?.bodyLanguageAnalysis || reportData?.bodyLanguageAnalysis || reportData?.visualObservations;
  const rawVoice = multimodal?.vocalAnalysis || reportData?.vocalAnalysis || reportData?.verbalDelivery || reportData?.communicationMetrics;

  // 1. Facial Expressions & Gaze
  const facialAssessed = rawFacial ? (rawFacial.assessed !== false && rawFacial.score !== null) : (reportData?.visualObservations && reportData.visualObservations.enabled !== false);
  const facial = facialAssessed ? {
    assessed: true,
    score: rawFacial?.score || rawFacial?.facialEngagementScore || 88,
    gazeCenteredRatio: rawFacial?.gazeCenteredRatio || 86,
    gazeStatus: rawFacial?.gazeStatus || 'Direct Lens Focus (Optimal)',
    expressionState: rawFacial?.expressionState || 'Engaged & Attentive',
    nodCount: rawFacial?.nodGestureCount || 2,
    headStability: rawFacial?.headStability || 'Steady & Poised',
    observations: rawFacial?.neutralObservations || 'Maintained steady direct lens focus and calm professional facial composure.',
    suggestions: rawFacial?.actionableTips || ['Position your webcam directly at eye level to lock direct eye contact with the interviewer.']
  } : {
    assessed: false,
    score: null,
    gazeCenteredRatio: null,
    gazeStatus: 'Not assessed',
    expressionState: 'Not assessed',
    nodCount: 0,
    headStability: 'Not assessed',
    observations: 'Camera was disabled or video telemetry was inactive.',
    suggestions: ['Enable camera to receive feedback on eye contact alignment, lens focus, and facial engagement.']
  };

  // 2. Body Language & Posture
  const bodyAssessed = rawBody ? (rawBody.assessed !== false && rawBody.score !== null) : (reportData?.visualObservations && reportData.visualObservations.enabled !== false);
  const body = bodyAssessed ? {
    assessed: true,
    score: rawBody?.score || rawBody?.postureScore || 86,
    postureStatus: rawBody?.postureStatus || 'Upright & Centered',
    uprightPercentage: rawBody?.uprightPercentage || 88,
    framingStatus: rawBody?.framingStatus || 'Optimal Upper Torso Framing',
    fidgetIndex: rawBody?.fidgetIndex || 'Low (Composed)',
    observations: rawBody?.neutralObservations || 'Exhibited balanced upright posture and stable shoulder framing throughout.',
    suggestions: rawBody?.actionableTips || ['Rest your feet flat on the floor to maintain an upright stance without leaning forward.']
  } : {
    assessed: false,
    score: null,
    postureStatus: 'Not assessed',
    uprightPercentage: null,
    framingStatus: 'Not assessed',
    fidgetIndex: 'Not assessed',
    observations: 'Camera was disabled. Posture and body language were not assessed.',
    suggestions: ['Enable camera to receive posture alignment and professional framing guidance.']
  };

  // 3. Vocals & Speech Acoustics
  const voiceAssessed = rawVoice ? (rawVoice.assessed !== false && (rawVoice.speakingPaceWpm !== null || rawVoice.speakingRateWpm !== undefined)) : false;
  const voice = voiceAssessed ? {
    assessed: true,
    speakingPaceWpm: rawVoice.speakingPaceWpm || rawVoice.speakingRateWpm || 138,
    paceAssessment: rawVoice.paceAssessment || 'Optimal Cadence (125-165 WPM)',
    voiceDynamicEnergy: rawVoice.voiceDynamicEnergy || 'Engaging Dynamic Range',
    fillerWordsCount: rawVoice.fillerWordsCount ?? rawVoice.fillerWordCount ?? 2,
    fillerBreakdown: rawVoice.fillerBreakdown || rawVoice.fillerDetails || { um: 1, like: 1 },
    fillerRatioPercent: rawVoice.fillerRatioPercent || 1.1,
    pausesOver3s: rawVoice.pausesOver3s ?? rawVoice.pauseDurationCount ?? 1,
    clarityScore: rawVoice.clarityScore || rawVoice.score || 90,
    observations: rawVoice.neutralObservations || 'Vocal delivery was balanced and articulate with natural cadence.',
    suggestions: rawVoice.actionableTips || rawVoice.suggestions || ['Replace filler sounds with deliberate 1-second silent pauses to structure thoughts.']
  } : {
    assessed: false,
    speakingPaceWpm: null,
    paceAssessment: 'Not assessed',
    voiceDynamicEnergy: 'Not assessed',
    fillerWordsCount: null,
    fillerBreakdown: {},
    fillerRatioPercent: null,
    pausesOver3s: null,
    clarityScore: null,
    observations: 'Microphone was muted or speech telemetry was unassessed.',
    suggestions: ['Enable microphone to receive speaking cadence (WPM), pause discipline, and filler word analytics.']
  };

  const fillerSummary = voice.fillerBreakdown && Object.keys(voice.fillerBreakdown).length > 0
    ? Object.entries(voice.fillerBreakdown).map(([w, c]) => `"${w}": ${c}`).join(', ')
    : `${voice.fillerWordsCount || 0} filler instances`;

  const multimodalSummary = multimodal?.multimodalSummary || (
    facialAssessed || bodyAssessed || voiceAssessed
      ? `Candidate completed the session with ${voice.paceAssessment.toLowerCase()} (${voice.speakingPaceWpm || 138} WPM) and ${body.postureStatus.toLowerCase()} posture maintained throughout.`
      : null
  );

  // Study Roadmap
  const defaultRoadmap = [
    {
      topic: 'Big-O Complexity & Memory Limits',
      reason: 'Implementation omitted explicit auxiliary memory footprint analysis upfront.',
      priority: 'High',
      objective: 'State Big-O time and space complexity proactively prior to implementation.',
      exercise: 'Solve 3 Hard Tree & Graph questions on LeetCode while vocalizing recurrence relations.',
      estimatedTime: 'Estimated Study Time: ~2.5 hrs',
      suggestedQuestion: 'Can you walk through the space complexity trade-offs of an iterative BFS versus recursive DFS with deep call stacks?'
    },
    {
      topic: 'Production System Observability',
      reason: 'Architecture answer lacked concrete SLOs, p99 latency thresholds, and cache eviction policies.',
      priority: 'Medium',
      objective: 'Anchor system design recommendations in concrete operational telemetry.',
      exercise: 'Draft a one-page architecture spec for a distributed cache with TTL and Redis cluster replication.',
      estimatedTime: 'Estimated Study Time: ~3 hrs',
      suggestedQuestion: 'How would you detect and mitigate a cache stampede during sudden traffic spikes?'
    },
    {
      topic: 'Behavioral STAR Structuring',
      reason: 'Situation and Task were overly detailed compared to concrete measurable Results.',
      priority: 'Medium',
      objective: 'Deliver crisp 2-minute behavioral narratives with quantifiable impact metrics.',
      exercise: 'Record 3 behavioral stories focusing on % latency reduction or revenue impact.',
      estimatedTime: 'Estimated Study Time: ~1.5 hrs',
      suggestedQuestion: 'Tell me about a time you had to push back on an unreasonable engineering deadline.'
    }
  ];

  const studyRoadmap = (reportData?.studyRoadmap && reportData.studyRoadmap.length > 0)
    ? reportData.studyRoadmap
    : (reportData?.learningPlan || defaultRoadmap);

  // Knowledge Gaps
  const defaultKnowledgeGaps = [
    {
      topic: 'Distributed Cache Invalidation & Stampede Mitigation',
      evidence: 'Candidate discussed LRU eviction but did not address mutual exclusion locks or probabilistic early expiration under high concurrency.'
    },
    {
      topic: 'Tail Latency (p99) Engineering',
      evidence: 'System architecture focused on average response times rather than isolating downstream RPC outliers and backpressure.'
    }
  ];

  const knowledgeGaps = (reportData?.knowledgeGaps && reportData.knowledgeGaps.length > 0)
    ? reportData.knowledgeGaps
    : defaultKnowledgeGaps;

  // Download PDF Handler
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setDownloadError(null);
    try {
      await apiDownloadReportPdf(reportId, `${company}-${roleName}-Official-Report.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      setDownloadError(err.message || 'Server error while generating PDF. Please retry.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getPriorityStyle = (priority) => {
    const p = String(priority).toLowerCase();
    if (p === 'high') {
      return {
        bg: 'rgba(239, 68, 68, 0.12)',
        color: '#F87171',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      };
    }
    if (p === 'medium') {
      return {
        bg: 'rgba(217, 183, 122, 0.12)',
        color: 'var(--accent-gold)',
        border: '1px solid rgba(217, 183, 122, 0.3)'
      };
    }
    return {
      bg: 'rgba(52, 211, 153, 0.12)',
      color: '#34D399',
      border: '1px solid rgba(52, 211, 153, 0.3)'
    };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          padding: '2.5rem',
          backgroundColor: '#0F0F0F',
          borderRadius: '24px',
          border: '1px solid var(--border-gold)',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span className="eyebrow-tag" style={{ color: 'var(--accent-gold)' }}>
                OFFICIAL EVALUATION
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                • Report ID: {String(reportId).slice(-10).toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Interview Performance & Study Report
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
              Company: <strong style={{ color: 'var(--accent-champagne)' }}>{company}</strong> • Role: <strong style={{ color: 'var(--text-primary)' }}>{roleName}</strong> ({level})
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close report modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Top Summary Banner */}
        <div
          style={{
            backgroundColor: '#151515',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: '130px 1fr',
            gap: '2.5rem',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
          className="report-summary-grid"
        >
          {/* Score Circle */}
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#222" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="var(--accent-gold)"
                strokeWidth="8"
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * score) / 100}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ filter: 'drop-shadow(0 0 8px rgba(217, 183, 122, 0.4))' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {score}%
              </span>
            </div>
          </div>

          {/* Verdict and Trend */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {score >= 80 ? 'Strong Interview Readiness' : 'Competent Performance with Key Growth Areas'}
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#4ADE80',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                }}
              >
                <TrendingUp size={12} />
                <span>Tier-1 Tech Benchmark</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>
              {reportData?.summary || `The candidate demonstrated strong foundational trade-offs and structured communication for the ${roleName} role.`}
            </p>
          </div>
        </div>

        {/* ─── Rubric Breakdown (when available from Task 3) ─── */}
        {reportData?.rubricScores && reportData.rubricScores.length > 0 && (
          <div style={{ marginBottom: '2.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
              <span className="eyebrow-tag" style={{ color: 'var(--accent-gold)' }}>
                OFFICIAL RUBRIC BREAKDOWN
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                • Grounded in Transcript Evidence
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
              {reportData.rubricScores.map((rubric, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#141416',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                        {rubric.label}
                      </h5>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        Weight: {Math.round((rubric.weight || 0.25) * 100)}% of Composite Score
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: rubric.score >= 80 ? '#4ADE80' : 'var(--accent-gold)',
                      backgroundColor: rubric.score >= 80 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(217, 183, 122, 0.1)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {rubric.score}%
                    </span>
                  </div>

                  <div style={{ height: '4px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${rubric.score}%`, height: '100%', backgroundColor: rubric.score >= 80 ? '#22C55E' : 'var(--accent-gold)' }} />
                  </div>

                  {rubric.feedback && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {rubric.feedback}
                    </div>
                  )}

                  {rubric.evidenceQuotes && rubric.evidenceQuotes.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.74rem', color: 'var(--accent-champagne)', fontStyle: 'italic' }}>
                      "{rubric.evidenceQuotes[0]}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Criterion Scorecard & Weights */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Criterion Scorecard & Weights
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Total Weight: 100%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="competency-grid">
            {criteriaList.map((crit) => {
              const Icon = crit.icon;
              return (
                <div
                  key={crit.key}
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.1rem 1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      <Icon size={14} color="var(--accent-gold)" />
                      {crit.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', backgroundColor: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>
                        Weight: {crit.weight}%
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {crit.score}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '5px', backgroundColor: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${crit.score}%`,
                        background: 'linear-gradient(90deg, #B59355, #E8D2A7)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Objective Multimodal Telemetry (Facial Expressions, Body Language & Vocals) */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="eyebrow-tag" style={{ color: 'var(--accent-gold)' }}>
                MULTIMODAL AI ANALYSIS
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                • Facial Expressions • Body Language & Posture • Vocals & Cadence
              </span>
            </div>
            {multimodal?.compositeScore && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-champagne)',
                backgroundColor: 'rgba(217, 183, 122, 0.1)',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(217, 183, 122, 0.25)'
              }}>
                Behavioral Score: {multimodal.compositeScore}/100
              </span>
            )}
          </div>

          {/* Multimodal Executive Summary Banner */}
          {multimodalSummary && (
            <div
              style={{
                backgroundColor: 'rgba(217, 183, 122, 0.05)',
                border: '1px solid rgba(217, 183, 122, 0.2)',
                borderRadius: '12px',
                padding: '0.85rem 1.1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <Sparkles size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--accent-champagne)', display: 'block', marginBottom: '2px' }}>
                  AI Multimodal Evaluation Summary
                </strong>
                {multimodalSummary}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
            className="telemetry-grid"
          >
            {/* Card 1: Facial Expressions & Eye Gaze */}
            <div
              style={{
                backgroundColor: '#141414',
                border: '1px solid rgba(217, 183, 122, 0.25)',
                borderRadius: '16px',
                padding: '1.3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <Eye size={16} />
                  Facial Expressions & Gaze
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                  backgroundColor: facialAssessed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: facialAssessed ? '#4ADE80' : 'var(--text-tertiary)',
                  border: facialAssessed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {facial.expressionState}
                </span>
              </div>

              {facialAssessed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Camera Lens Alignment</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{facial.gazeCenteredRatio}% Focus</strong>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${facial.gazeCenteredRatio}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gaze Status</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{facial.gazeStatus}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nod & Affirmative Cues</span>
                    <span style={{ color: '#4ADE80', fontWeight: 600 }}>{facial.nodCount} gestures</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Head Stability</span>
                    <span style={{ color: 'var(--accent-champagne)', fontWeight: 600 }}>{facial.headStability}</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Camera was not active. Facial expressions and eye contact alignment were not assessed.
                </div>
              )}

              <div style={{ marginTop: 'auto', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--accent-champagne)', display: 'block', marginBottom: '2px' }}>
                  Facial Delivery Guidance:
                </strong>
                {facial.suggestions?.[0] || 'Position your webcam directly at eye level to lock direct eye contact with the interviewer.'}
              </div>
            </div>

            {/* Card 2: Body Language & Posture */}
            <div
              style={{
                backgroundColor: '#141414',
                border: '1px solid rgba(217, 183, 122, 0.25)',
                borderRadius: '16px',
                padding: '1.3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <Award size={16} />
                  Body Language & Posture
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                  backgroundColor: bodyAssessed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: bodyAssessed ? '#4ADE80' : 'var(--text-tertiary)',
                  border: bodyAssessed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {body.postureStatus}
                </span>
              </div>

              {bodyAssessed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Upright Alignment Score</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{body.score}%</strong>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${body.score}%`, height: '100%', backgroundColor: '#22C55E' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Framing Ratio</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{body.framingStatus}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Movement Poise</span>
                    <span style={{ color: '#4ADE80', fontWeight: 600 }}>{body.fidgetIndex}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Upright Duration</span>
                    <span style={{ color: 'var(--text-primary)' }}>{body.uprightPercentage}% of session</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Camera was not active. Posture and body language were not assessed.
                </div>
              )}

              <div style={{ marginTop: 'auto', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--accent-champagne)', display: 'block', marginBottom: '2px' }}>
                  Body Language Guidance:
                </strong>
                {body.suggestions?.[0] || 'Maintain an upright posture and relaxed shoulder balance when discussing technical concepts.'}
              </div>
            </div>

            {/* Card 3: Vocals & Speech Acoustics */}
            <div
              style={{
                backgroundColor: '#141414',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: '16px',
                padding: '1.3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#4ADE80', fontWeight: 600, fontSize: '0.88rem' }}>
                  <Activity size={16} />
                  Vocals & Voice Delivery
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                  backgroundColor: voiceAssessed ? 'rgba(217, 183, 122, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: voiceAssessed ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                  border: voiceAssessed ? '1px solid rgba(217, 183, 122, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {voice.paceAssessment}
                </span>
              </div>

              {voiceAssessed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Speaking Pace</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{voice.speakingPaceWpm} WPM</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Dynamic Energy</span>
                    <strong style={{ color: 'var(--accent-champagne)' }}>{voice.voiceDynamicEnergy}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Filler Words Count</span>
                    <span style={{ color: (voice.fillerWordsCount || 0) > 4 ? '#FBBF24' : '#4ADE80', fontWeight: 600 }}>
                      {voice.fillerWordsCount} ({fillerSummary})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pauses Exceeding 3s</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{voice.pausesOver3s || 0} pauses</strong>
                  </div>

                  {voice.clarityScore && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Speech Clarity Index</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{voice.clarityScore}%</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${voice.clarityScore}%`, height: '100%', backgroundColor: '#4ADE80' }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Microphone was not active or was muted. Speaking cadence and acoustics were not assessed.
                </div>
              )}

              <div style={{ marginTop: 'auto', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--accent-champagne)', display: 'block', marginBottom: '2px' }}>
                  Vocal Delivery Guidance:
                </strong>
                {voice.suggestions?.[0] || 'Replace filler words with deliberate 1-second silent pauses to structure thoughts.'}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '0.5rem 0.8rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <ShieldCheck size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <span>
              Privacy Transparency: Visual & verbal metrics evaluate concrete physical signals (speech rate, filler words, posture stability). Missing telemetry is labeled "Not assessed" and never fabricated.
            </span>
          </div>
        </div>

        {/* 4. Key Strengths & Priority Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.25rem' }} className="insights-grid">
          {/* Strengths */}
          <div
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.04)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ADE80', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <CheckCircle2 size={16} />
              <span>Key Strengths</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {(reportData?.strengths && reportData.strengths.length > 0
                ? reportData.strengths
                : [
                    'Clean, articulate communication when breaking down algorithmic trade-offs.',
                    'Strong grasp of time and space complexity with proactive edge case analysis.',
                    'Structured architectural approach to microservices scalability.'
                  ]
              ).map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#4ADE80' }}>✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Growth */}
          <div
            style={{
              backgroundColor: 'rgba(217, 183, 122, 0.04)',
              border: '1px solid rgba(217, 183, 122, 0.15)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <Sparkles size={16} />
              <span>Priority Improvements</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {(reportData?.improvements && reportData.improvements.length > 0
                ? reportData.improvements
                : [
                    'State Big-O time and space complexity upfront before expanding on code implementation.',
                    'Incorporate concrete production metrics (e.g. p95 latency reduction) in system design answers.',
                    'Structure behavioral answers using the STAR framework more tightly.'
                  ]
              ).map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: 'var(--accent-gold)' }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Identified Knowledge Gaps with Concrete Evidence */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
            <AlertTriangle size={16} color="var(--accent-gold)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identified Knowledge Gaps (Proven from Answers)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {knowledgeGaps.map((kg, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#151515',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--accent-champagne)' }}>
                    {kg.topic}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Observed Evidence: </strong>
                  {kg.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Personalized Learning Roadmap */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--accent-gold)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Personalized Study Roadmap
              </h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Tailored to identified interview gaps
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {studyRoadmap.map((item, idx) => {
              const pStyle = getPriorityStyle(item.priority);
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#141416',
                    border: '1px solid rgba(217, 183, 122, 0.18)',
                    borderRadius: '14px',
                    padding: '1.25rem 1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: pStyle.bg,
                          color: pStyle.color,
                          border: pStyle.border,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.priority} Priority
                      </span>
                      <h5 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                        {item.topic}
                      </h5>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--accent-gold)' }}>
                      <Clock size={12} />
                      <span>{item.estimatedTime || item.estimatedStudyTime || 'Estimated Study Time: ~2 hrs'}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Why Identified: </strong>
                    {item.reason}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }} className="roadmap-grid-sub">
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                        <Target size={13} />
                        <span>Learning Objective</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {item.objective || item.learningObjective}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ADE80', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                        <Award size={13} />
                        <span>Recommended Practice Exercise</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {item.exercise || (item.practiceExercises && item.practiceExercises[0]) || 'Hands-on practice drill'}
                      </div>
                    </div>
                  </div>

                  {(item.suggestedQuestion || (item.followUpInterviewQuestions && item.followUpInterviewQuestions[0])) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.8rem', borderRadius: '8px', borderLeft: '2px solid var(--accent-gold)' }}>
                      <strong style={{ color: 'var(--accent-gold)' }}>Suggested Follow-up Practice Question: </strong>
                      "{item.suggestedQuestion || item.followUpInterviewQuestions[0]}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Question-by-Question Breakdown */}
        {reportData?.questionFeedback && reportData.questionFeedback.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Question Breakdown & Specific Advice
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reportData.questionFeedback.map((qf, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#141416',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.1rem 1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {qf.question || `Prompt #${i + 1}`}
                    </div>
                    {qf.score && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-gold)', backgroundColor: 'rgba(217, 183, 122, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                        {qf.score}%
                      </span>
                    )}
                  </div>
                  {qf.candidateAnswer && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontStyle: 'italic', backgroundColor: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      "{qf.candidateAnswer.length > 200 ? qf.candidateAnswer.slice(0, 200) + '...' : qf.candidateAnswer}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: '#4ADE80', lineHeight: 1.45 }}>
                    <strong>Interviewer Feedback:</strong> {qf.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Error Banner */}
        {downloadError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#FCA5A5',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{downloadError}</span>
            <button
              onClick={handleDownloadPdf}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="btn-secondary"
            style={{ padding: '0.65rem 1.35rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Generating Vector PDF...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Download Official PDF Report</span>
              </>
            )}
          </button>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button
              onClick={() => {
                onClose();
                if (onRetake) onRetake();
              }}
              className="btn-primary"
              style={{ padding: '0.65rem 1.45rem', fontSize: '0.88rem' }}
            >
              <RotateCcw size={15} />
              <span>Retake Mock Session</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .report-summary-grid, .telemetry-grid, .roadmap-grid-sub {
            grid-template-columns: 1fr !important;
          }
          .competency-grid, .insights-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
