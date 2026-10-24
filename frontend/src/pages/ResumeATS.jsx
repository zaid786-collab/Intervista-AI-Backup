import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Download,
  ArrowRight,
  ShieldCheck,
  Layers,
  Briefcase,
  Award,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck,
  HelpCircle,
  Clock,
  Printer,
  Trash2,
} from 'lucide-react';
import { apiParseResumeFile, apiCalculateATS, apiGetATSHistory } from '../utils/api';
import { useAuth } from '../context/useAuth';

const SAMPLE_DEMO_RESUME = `Alex Chen
San Francisco, CA • alex.chen@example.com • (555) 234-5678 • linkedin.com/in/alexchen • github.com/alexchen

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years of experience designing high-throughput distributed systems and responsive web applications. Proven track record of reducing latency by 42% and scaling microservices on AWS and Kubernetes.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript (ES6+), Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, FastAPI, Django, Express, TailwindCSS, Redux
Databases & Caching: PostgreSQL, Redis, MongoDB, SQLAlchemy
DevOps & Cloud: AWS (ECS, Lambda, S3), Docker, Kubernetes, CI/CD (GitHub Actions), Terraform
Architecture: Microservices, RESTful APIs, GraphQL, System Design, Event-Driven Architecture

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudScale Systems | 2022 - Present
- Architected and deployed real-time data streaming platform using Node.js, React, and Redis, serving 120k daily active users.
- Optimized PostgreSQL database indexing and query execution plans, reducing P99 API latency from 340ms to 45ms.
- Spearheaded migration of legacy monolith to containerized Docker microservices orchestrated via Kubernetes on AWS ECS.
- Automated CI/CD deployment pipelines using GitHub Actions, cutting release deployment cycle times by 65%.

Software Engineer | FinTech Innovations | 2020 - 2022
- Engineered secure RESTful APIs and payment processing flows with FastAPI and PostgreSQL, processing over $12M in transactions.
- Designed reusable React and TypeScript component design system, increasing frontend development velocity across 4 cross-functional teams.
- Implemented JWT authentication and role-based access control (RBAC) ensuring SOC2 compliance.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2016 - 2020

PROJECTS
Distributed Cache-Aside Engine (Go, Redis, Docker)
- Engineered high-performance in-memory cache engine with LRU eviction and consistent hashing.
- Achieved 99.98% cache hit ratio under synthetic benchmark load of 25,000 requests/sec.`;

const SAMPLE_DEMO_JD = `Senior Full Stack Engineer (Cloud Platforms)

About the Role:
We are seeking an experienced Senior Full Stack Engineer to lead the design and development of our next-generation cloud services. You will architect distributed systems, build customer-facing React web applications, and optimize scalable backend microservices.

Key Responsibilities:
- Design, build, and maintain high-performance microservices and RESTful APIs using Python, TypeScript, or Node.js.
- Develop interactive, accessible web applications using React, Next.js, and modern CSS/Tailwind.
- Deploy and monitor scalable distributed applications using AWS, Docker, Kubernetes, and CI/CD pipelines.
- Collaborate with product and design teams to translate business requirements into robust technical architectures.
- Optimize database queries and caching strategies using PostgreSQL and Redis.

Required Qualifications:
- 4+ years of professional software engineering experience.
- Strong proficiency in modern JavaScript/TypeScript, React, and Python or Node.js.
- Hands-on experience with cloud infrastructure (AWS or GCP) and containerization (Docker, Kubernetes).
- Demonstrated experience with relational databases (PostgreSQL or MySQL) and caching systems (Redis).
- Experience with microservices architecture, system design, and automated testing.`;

export default function ResumeATS({ onStartInterview }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Input states
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parseMetadata, setParseMetadata] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  // Job description & role
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);

  // Scoring states
  const [isCalculating, setIsCalculating] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [calcError, setCalcError] = useState(null);

  // Past history
  const [pastScans, setPastScans] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const rolePills = [
    'Full Stack Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Software Engineer',
    'AI / ML Engineer',
    'Cloud & DevOps',
    'Product Manager',
  ];

  // Load history if logged in
  useEffect(() => {
    if (user) {
      apiGetATSHistory()
        .then((res) => {
          if (res?.history) setPastScans(res.history);
        })
        .catch(() => {});
    }
  }, [user]);

  // File size formatter
  const formatBytes = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Process File Upload
  const processUploadedFile = async (selectedFile) => {
    if (!selectedFile) return;

    setParseError(null);
    setCalcError(null);
    setAnalysisReport(null);

    // Client-side extension validation
    const lowerName = selectedFile.name.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');
    const isDocx = lowerName.endsWith('.docx');

    if (!isPdf && !isDocx) {
      setParseError('Unsupported format. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    // Client-side size check (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setParseError('File size exceeds 10 MB limit. Please compress or select a smaller document.');
      return;
    }

    if (selectedFile.size < 50) {
      setParseError('File is empty or corrupted (under 50 bytes). Please upload a valid resume.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(formatBytes(selectedFile.size));
    setIsParsingFile(true);

    try {
      const result = await apiParseResumeFile(selectedFile);

      if (!result.success) {
        if (result.is_scanned) {
          setParseError(
            'Scanned or image-only PDF detected. This document does not contain machine-readable text layers. ' +
            'ATS scanners require digital text; please export your resume as a text-based PDF or run OCR before uploading.'
          );
        } else if (result.is_encrypted) {
          setParseError(
            'This PDF is password-protected. Please remove password encryption from the file before uploading.'
          );
        } else {
          setParseError(result.error || 'Failed to extract text from document. Please ensure it is a valid PDF or DOCX.');
        }
        setExtractedText('');
        setParseMetadata(null);
      } else {
        setExtractedText(result.text);
        setParseMetadata({
          pageCount: result.page_count,
          wordCount: result.word_count,
          fileType: result.file_type,
        });
        setParseError(null);
      }
    } catch (err) {
      setParseError(err.message || 'Error communicating with server parser. Please try again.');
      setExtractedText('');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setFileSize('');
    setExtractedText('');
    setParseMetadata(null);
    setParseError(null);
    setAnalysisReport(null);
    setCalcError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Use Demo Resume
  const handleUseDemo = () => {
    setFile(null);
    setFileName('Alex_Chen_FullStack_Resume.pdf');
    setFileSize('184 KB');
    setExtractedText(SAMPLE_DEMO_RESUME);
    setParseMetadata({
      pageCount: 1,
      wordCount: SAMPLE_DEMO_RESUME.split(/\s+/).length,
      fileType: 'pdf',
    });
    setJobDescription(SAMPLE_DEMO_JD);
    setShowJdInput(true);
    setTargetRole('Full Stack Engineer');
    setParseError(null);
    setCalcError(null);
  };

  // Calculate ATS Score
  const handleCalculateScore = async () => {
    if (!extractedText.trim() || extractedText.trim().length < 20) {
      setCalcError('Please upload a readable resume or use the demo resume before calculating.');
      return;
    }

    setIsCalculating(true);
    setCalcError(null);

    try {
      const res = await apiCalculateATS({
        resume_text: extractedText,
        job_description: showJdInput && jobDescription.trim() ? jobDescription.trim() : null,
        target_role: targetRole,
        file_name: fileName || 'Uploaded_Resume.pdf',
      });

      setAnalysisReport(res);

      // Refresh history if available
      if (user) {
        apiGetATSHistory()
          .then((hist) => {
            if (hist?.history) setPastScans(hist.history);
          })
          .catch(() => {});
      }

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('ats-results-dashboard');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setCalcError(err.message || 'Failed to calculate ATS score. Please check your network or try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Score tier color helper
  const getScoreColor = (score) => {
    if (score >= 85) return '#10B981'; // Green
    if (score >= 70) return '#D9B77A'; // Gold
    return '#EF4444'; // Red
  };

  return (
    <div
      style={{
        paddingTop: 'var(--nav-height, 76px)',
        backgroundColor: '#080808',
        minHeight: '100vh',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
        {/* Header Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(217, 183, 122, 0.12) 0%, rgba(17, 17, 17, 0.95) 100%)',
            border: '1px solid rgba(217, 183, 122, 0.28)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(217, 183, 122, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '100px', background: 'rgba(217, 183, 122, 0.15)', border: '1px solid rgba(217, 183, 122, 0.3)', marginBottom: '1rem' }}>
            <Sparkles size={15} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-gold)', letterSpacing: '0.06em' }}>
              INTERVISTA PRODUCTION ATS ENGINE • GROQ AI POWERED
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Resume ATS Score &amp; Keyword Match Calculator
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '820px', margin: '0 0 1.5rem 0' }}>
            Upload your resume in PDF or DOCX format to receive an evidence-based ATS diagnostic. Evaluate your resume against a specific target job description, or calculate general quality across our transparent 100-point rubric powered by Groq LLaMA-3.3-70B.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleUseDemo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'rgba(217, 183, 122, 0.15)',
                border: '1px solid rgba(217, 183, 122, 0.4)',
                borderRadius: '10px',
                color: 'var(--accent-gold)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={16} />
              <span>Load Full-Stack Demo Resume &amp; JD</span>
            </button>

            {pastScans.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.15rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                <Clock size={16} />
                <span>Past Scans ({pastScans.length})</span>
                {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Past Scans Dropdown Bar */}
          {showHistory && pastScans.length > 0 && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                RECENT SCANS HISTORY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.65rem' }}>
                {pastScans.map((scan) => (
                  <div
                    key={scan.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {scan.target_role}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {scan.created_at ? new Date(scan.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: getScoreColor(scan.ats_score) }}>
                      {scan.ats_score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Work Area: Upload Card & Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
          {/* Card 1: Resume Upload Box */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>1. Upload Resume Document</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                PDF or DOCX • Max 10MB
              </span>
            </div>

            {/* Dropzone */}
            {!fileName ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed var(--accent-gold)' : '2px dashed rgba(255, 255, 255, 0.15)',
                  backgroundColor: isDragging ? 'rgba(217, 183, 122, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '14px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && processUploadedFile(e.target.files[0])}
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(217, 183, 122, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Drag &amp; drop your resume here, or <span style={{ color: 'var(--accent-gold)' }}>browse files</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Extracts readable text in-memory. Never stores sensitive files publicly.
                  </div>
                </div>
              </div>
            ) : (
              /* Uploaded File Info Card */
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(217, 183, 122, 0.3)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(217, 183, 122, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-gold)',
                        flexShrink: 0,
                      }}
                    >
                      <FileCheck size={22} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fileName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.65rem' }}>
                        <span>{fileSize}</span>
                        {parseMetadata && (
                          <>
                            <span>•</span>
                            <span>{parseMetadata.wordCount} words</span>
                            <span>•</span>
                            <span>{parseMetadata.pageCount} page(s)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveFile}
                    title="Remove file"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </button>
                </div>

                {isParsingFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontSize: '0.82rem' }}>
                    <RefreshCw size={14} className="spin-animate" />
                    <span>Parsing text and checking ATS layout compatibility...</span>
                  </div>
                )}

                {/* Collapsible Extracted Text Preview */}
                {extractedText && !isParsingFile && (
                  <div>
                    <button
                      onClick={() => setShowExtractedText(!showExtractedText)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>{showExtractedText ? 'Hide extracted text' : 'View extracted text'}</span>
                      {showExtractedText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showExtractedText && (
                      <textarea
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        rows={8}
                        style={{
                          width: '100%',
                          marginTop: '0.65rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.45)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          padding: '0.65rem',
                          lineHeight: 1.45,
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Parse Error Display */}
            {parseError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  color: '#F87171',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Upload Notice</strong>
                  {parseError}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Target Role & Job Description */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Target Role Selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
                <Briefcase size={18} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>2. Select Target Engineering Role</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {rolePills.map((role) => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: targetRole === role ? 600 : 500,
                      backgroundColor: targetRole === role ? 'rgba(217, 183, 122, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: targetRole === role ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: targetRole === role ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Job Description (Optional Toggle) */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={17} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Target Job Description (Optional)
                  </span>
                </div>
                <button
                  onClick={() => setShowJdInput(!showJdInput)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-gold)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {showJdInput ? 'Collapse JD' : '+ Add Job Description'}
                </button>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
                {showJdInput
                  ? 'Calculating with a JD provides an exact keyword alignment and role-specific ATS match score.'
                  : 'Optional. If left blank, a general technical resume quality score is calculated.'}
              </p>

              {showJdInput && (
                <div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job requirements, required qualifications, and competencies here..."
                    rows={6}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      padding: '0.75rem',
                      lineHeight: 1.5,
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    <span>{jobDescription.split(/\s+/).filter(Boolean).length} words</span>
                    {jobDescription && (
                      <button
                        onClick={() => setJobDescription('')}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                      >
                        Clear JD
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <button
                onClick={handleCalculateScore}
                disabled={isCalculating || isParsingFile || !extractedText}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.5rem',
                  borderRadius: '12px',
                  backgroundColor: !extractedText || isCalculating ? 'rgba(217, 183, 122, 0.3)' : 'var(--accent-gold)',
                  color: !extractedText || isCalculating ? 'rgba(255, 255, 255, 0.5)' : '#080808',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: !extractedText || isCalculating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  boxShadow: extractedText && !isCalculating ? '0 4px 20px rgba(217, 183, 122, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isCalculating ? (
                  <>
                    <RefreshCw size={18} className="spin-animate" />
                    <span>Analyzing ATS Rubric &amp; Groq LLaMA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Calculate ATS Compatibility Score</span>
                  </>
                )}
              </button>

              {calcError && (
                <div style={{ marginTop: '0.65rem', color: '#EF4444', fontSize: '0.8rem', textAlign: 'center' }}>
                  {calcError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: RESULTS DASHBOARD */}
        {analysisReport && (
          <div
            id="ats-results-dashboard"
            style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(217, 183, 122, 0.35)',
              borderRadius: '24px',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Top Score Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '2rem',
              }}
            >
              {/* Score Gauge Circle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={getScoreColor(analysisReport.overall_score)}
                      strokeWidth="10"
                      strokeDasharray={326.7}
                      strokeDashoffset={326.7 - (326.7 * (analysisReport.overall_score || 0)) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {analysisReport.overall_score}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      / 100 ATS
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: analysisReport.is_job_specific ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 183, 122, 0.15)',
                        color: analysisReport.is_job_specific ? '#10B981' : 'var(--accent-gold)',
                        border: `1px solid ${analysisReport.is_job_specific ? 'rgba(16, 185, 129, 0.3)' : 'rgba(217, 183, 122, 0.3)'}`,
                      }}
                    >
                      {analysisReport.is_job_specific ? 'JOB-SPECIFIC ATS MATCH' : 'GENERAL RESUME QUALITY'}
                    </span>
                    {analysisReport.ai_powered && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Groq LLaMA 3.3 Verified
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                    {analysisReport.verdict}
                  </h2>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Target Role: <strong style={{ color: 'var(--text-primary)' }}>{analysisReport.target_role}</strong> • File: {analysisReport.file_name}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Practice & Print */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.15rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={16} />
                  <span>Print Report</span>
                </button>

                {onStartInterview && (
                  <button
                    onClick={() => onStartInterview(analysisReport.target_role || targetRole)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 1.25rem',
                      backgroundColor: 'var(--accent-gold)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#080808',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <span>Practice Mock Interview</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Rubric Category Progress Bars */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                  Transparent 100-Point Scoring Breakdown
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configurable ATS Scoring Rubric
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {Object.entries(analysisReport.breakdown || {}).map(([key, item]) => {
                  const label = key
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  const pct = Math.round((item.score / item.max) * 100);

                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '14px',
                        padding: '1.15rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.86rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: getScoreColor(pct) }}>
                          {item.score} / {item.max} pts
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: getScoreColor(pct),
                            borderRadius: '4px',
                            transition: 'width 0.8s ease',
                          }}
                        />
                      </div>
                      <div style={{ marginTop: '0.35rem', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {pct >= 85 ? 'Strong alignment' : pct >= 70 ? 'Satisfactory baseline' : 'Opportunity for improvement'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keyword Match Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {/* Matched Keywords */}
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.03)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#10B981' }}>
                    Matched Keywords ({analysisReport.keywords?.matched?.length || 0})
                  </h4>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {(analysisReport.keywords?.matched || []).map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.3rem 0.7rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#6EE7B7',
                      }}
                    >
                      ✓ {kw}
                    </span>
                  ))}
                  {(!analysisReport.keywords?.matched || analysisReport.keywords.matched.length === 0) && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      No direct domain keywords detected.
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.03)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <AlertCircle size={18} color="#F87171" />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#F87171' }}>
                    Missing Keywords ({analysisReport.keywords?.missing?.length || 0})
                  </h4>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {(analysisReport.keywords?.missing || []).map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.3rem 0.7rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#FCA5A5',
                      }}
                    >
                      + {kw}
                    </span>
                  ))}
                  {(!analysisReport.keywords?.missing || analysisReport.keywords.missing.length === 0) && (
                    <span style={{ fontSize: '0.84rem', color: '#10B981' }}>
                      Comprehensive keyword coverage! No high-priority gaps found.
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <strong>Anti-Stuffing Guidance:</strong> Only add missing skills you have genuinely used. Weave them into descriptive work experience bullets rather than pasting a raw keyword list.
                </div>
              </div>
            </div>

            {/* Section Analysis Checklist */}
            {analysisReport.sections && (
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                  Resume Section Completeness Audit
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  {Object.entries(analysisReport.sections.sections || {}).map(([secKey, sec]) => {
                    const secTitle = secKey
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');

                    return (
                      <div
                        key={secKey}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${sec.found ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                          borderRadius: '12px',
                          padding: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {secTitle}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: sec.found ? '#10B981' : '#EF4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            {sec.found ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {sec.found ? 'Detected' : 'Missing'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {sec.feedback}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formatting & Readability Diagnostic */}
            {analysisReport.formatting && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                  Formatting, Action Verbs &amp; Metric Diagnostics
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Word Count</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {analysisReport.formatting.word_count}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Target: 450 - 900 words</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Power Action Verbs</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>
                      {analysisReport.formatting.power_verbs_count}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Architected, Spearheaded, Scaled</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Metric Indicators</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      {analysisReport.formatting.metric_indicators_count}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Percentages, Latency, Scale</div>
                  </div>
                </div>

                {/* Weak Verbs Suggestions */}
                {analysisReport.formatting.weak_verbs_found && analysisReport.formatting.weak_verbs_found.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#F87171', marginBottom: '0.5rem' }}>
                      Weak / Passive Phrasing Detected (Replace with Power Verbs):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                      {analysisReport.formatting.weak_verbs_found.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.55rem 0.85rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          <span style={{ textDecoration: 'line-through', color: '#FCA5A5' }}>"{item.weak}"</span>
                          <span style={{ margin: '0 0.5rem', color: 'var(--text-secondary)' }}>→</span>
                          <strong style={{ color: '#10B981' }}>{item.better}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prioritized Actionable Recommendations */}
            {analysisReport.recommendations && analysisReport.recommendations.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.25rem 0' }}>
                  Prioritized Actionable Recommendations
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analysisReport.recommendations.map((rec, i) => {
                    const priorityColor =
                      rec.priority === 'High' ? '#EF4444' : rec.priority === 'Medium' ? 'var(--accent-gold)' : '#10B981';

                    return (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderLeft: `4px solid ${priorityColor}`,
                          borderRadius: '12px',
                          padding: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: `${priorityColor}22`,
                              color: priorityColor,
                            }}
                          >
                            {rec.priority} Priority
                          </span>
                          <h5 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {rec.title}
                          </h5>
                        </div>

                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                          <strong>Issue:</strong> {rec.issue}
                        </div>

                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                          <strong>Why It Matters:</strong> {rec.impact}
                        </div>

                        <div
                          style={{
                            fontSize: '0.84rem',
                            color: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          <strong>How To Fix:</strong> {rec.how_to_fix}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Reset & Scan Another Button */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <button
                onClick={handleRemoveFile}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                <span>Clear &amp; Scan Another Resume</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
