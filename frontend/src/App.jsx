import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Companies from './pages/Companies';
import Pricing from './pages/Pricing';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Analysis from './pages/Analysis';
import AdminPortal from './pages/AdminPortal';
import FAQ from './pages/FAQ';
import AuthPage from './pages/AuthPage';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './components/Dashboard';
import CareerPrepDSAPage from './components/CareerPrepDSAPage';
import ImmersiveInterviewRoom from './components/ImmersiveInterviewRoom';

// Interactive Global Modals matching new Intervista
import LoadingScreen from './components/LoadingScreen';
import SetupModal from './components/SetupModal';
import DeviceSetupModal from './components/DeviceSetupModal';
import SampleReportModal from './components/SampleReportModal';
import AuthModal from './components/AuthModal';
import LegalModal from './components/LegalModal';
import ContactModal from './components/ContactModal';
import LiveDemoModal from './components/LiveDemoModal';
import FeedbackModal from './components/FeedbackModal';

import { apiLogout, recordLocalInterviewSession } from './utils/api';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Global Interactive Modals State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [selectedRoleForSetup, setSelectedRoleForSetup] = useState('Software Engineer');
  const [deviceSetupOpen, setDeviceSetupOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTopic, setLegalTopic] = useState('terms');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Active Interview Configuration
  const [interviewConfig, setInterviewConfig] = useState({
    role: 'Software Engineer',
    company: 'Google',
    level: 'Mid Level',
    interviewType: 'Technical Interview',
    duration: '30 min',
    interviewerPersona: 'chen',
  });

  const isInterviewRoom = path === '/interview';
  const hideFooter = [
    '/login',
    '/signup',
    '/oauth/callback',
    '/oauth/github/callback',
    '/interview',
    '/admin',
  ].includes(path);

  // Handlers for starting interview steps
  const handleStartInterview = (roleOrCompany) => {
    if (roleOrCompany && typeof roleOrCompany === 'string') {
      const knownCompanies = ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Netflix', 'Uber', 'Stripe'];
      if (knownCompanies.map((c) => c.toLowerCase()).includes(roleOrCompany.toLowerCase())) {
        setInterviewConfig((prev) => ({
          ...prev,
          company: roleOrCompany,
          role: 'Software Engineer',
        }));
        setSelectedRoleForSetup('Software Engineer');
      } else {
        setSelectedRoleForSetup(roleOrCompany);
        setInterviewConfig((prev) => ({
          ...prev,
          role: roleOrCompany,
        }));
      }
    }
    setSetupModalOpen(true);
  };

  const handleLaunchSession = (config) => {
    setInterviewConfig(config);
    setSetupModalOpen(false);
    setDeviceSetupOpen(true);
  };

  const handleEnterInterviewRoom = () => {
    setDeviceSetupOpen(false);
    navigate('/interview');
  };

  const handleFinishInterview = (finalReport) => {
    const scoreNum = finalReport?.overallScore ?? finalReport?.score ?? 88;
    const generatedReport = {
      ...finalReport,
      id: finalReport?.id || 'int_' + Date.now(),
      role: finalReport?.role || interviewConfig.role,
      company: finalReport?.company || interviewConfig.company,
      level: finalReport?.level || interviewConfig.level,
      overallScore: scoreNum,
      score: scoreNum,
      scores: finalReport?.scores || {
        communication: 90,
        technicalDepth: 86,
        problemSolving: 88,
        confidence: 84,
      },
      strengths: finalReport?.strengths || [
        'Strong grasp of modular system decomposition and clean API design.',
        'Structured and articulate approach to problem decomposition.',
      ],
      improvements: finalReport?.improvements || [
        'Explicitly state asymptotic Big-O runtime and space complexity early in responses.',
        'Discuss failure recovery strategies and automated rollback flags.',
      ],
      studyRoadmap: finalReport?.studyRoadmap || [
        { step: 1, title: 'Distributed Systems & Consistency Models', focus: 'Study Raft consensus, idempotency patterns, and event-driven architecture.' },
        { step: 2, title: 'Performance Profiling & Bottlenecks', focus: 'Deep dive into database indexing, memory leaks, and network latency optimization.' },
      ],
    };

    // Record session to local dashboard
    recordLocalInterviewSession({
      id: generatedReport.id,
      role: generatedReport.role,
      company: generatedReport.company,
      score: scoreNum,
      duration_minutes: 25,
      status: 'Completed',
      technical_score: generatedReport.scores?.technicalDepth || 86,
      communication_score: generatedReport.scores?.communication || 90,
      problem_solving_score: generatedReport.scores?.problemSolving || 88,
      feedback: `Completed interview for ${generatedReport.company}. Overall evaluation score: ${scoreNum}%.`,
    });

    setReportData(generatedReport);
    navigate('/dashboard');
    setTimeout(() => {
      setReportModalOpen(true);
    }, 400);
  };

  const handleExitInterviewRoom = () => {
    navigate('/dashboard');
  };

  const handleViewSampleReport = (customData = null) => {
    if (customData) {
      setReportData({
        ...customData,
        role: customData.role || 'Software Engineer',
        level: customData.level || 'Mid Level',
        overallScore: customData.overallScore ?? customData.score ?? 86,
        scores: customData.scores || {
          communication: customData.communication || 90,
          technicalDepth: customData.technicalDepth || 86,
          problemSolving: customData.problemSolving || 88,
          confidence: customData.confidence || 82,
        },
        strengths: customData.strengths || [],
        improvements: customData.improvements || [],
        questionFeedback: customData.questionFeedback || [],
        studyRoadmap: customData.studyRoadmap || [],
      });
    } else {
      setReportData({
        role: 'Software Engineer',
        company: 'Google',
        level: 'Mid Level',
        overallScore: 88,
        scores: {
          communication: 92,
          technicalDepth: 86,
          problemSolving: 89,
          confidence: 84,
        },
        strengths: [
          'Excellent structural decomposition of complex questions.',
          'Proactive mention of latency bottlenecks and caching strategies.',
        ],
        improvements: [
          'Explicitly quantify Big-O auxiliary space complexity in algorithmic problems.',
        ],
      });
    }
    setReportModalOpen(true);
  };

  const handleOpenLegal = (topic) => {
    setLegalTopic(topic);
    setLegalModalOpen(true);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    updateUser(authenticatedUser);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="intervista-app">
      <ScrollToTop />

      {/* Cinematic Star Intro Loading Screen */}
      <LoadingScreen />

      {/* GSAP PillNav Global Navbar - hidden inside the immersive 3D interview room */}
      {!isInterviewRoom && (
        <Navbar
          currentUser={user}
          onLogout={handleLogout}
          onStartInterview={handleStartInterview}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenSignup={() => handleOpenAuth('signup')}
          onOpenContact={() => setContactModalOpen(true)}
        />
      )}

      {/* Route Views */}
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route
          path="/"
          element={
            <Home
              onStartInterview={handleStartInterview}
              onOpenDemo={() => setDemoModalOpen(true)}
              onOpenContact={() => setContactModalOpen(true)}
            />
          }
        />
        <Route
          path="/companies"
          element={<Companies onStartInterview={handleStartInterview} />}
        />
        <Route
          path="/plans"
          element={<Pricing onStartInterview={handleStartInterview} />}
        />
        <Route
          path="/pricing"
          element={<Pricing onStartInterview={handleStartInterview} />}
        />
        <Route
          path="/dsa"
          element={
            <div style={{ paddingTop: 'var(--nav-height, 76px)', backgroundColor: 'var(--bg-base, #090909)', minHeight: '100vh' }}>
              <CareerPrepDSAPage onStartInterview={handleStartInterview} />
            </div>
          }
        />
        <Route
          path="/practice"
          element={
            <div style={{ paddingTop: 'var(--nav-height, 76px)', backgroundColor: 'var(--bg-base, #090909)', minHeight: '100vh' }}>
              <CareerPrepDSAPage onStartInterview={handleStartInterview} />
            </div>
          }
        />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/oauth/github/callback" element={<OAuthCallback providerOverride="github" />} />

        {/* First-Person Immersive 3D Interview Room */}
        <Route
          path="/interview"
          element={
            <ImmersiveInterviewRoom
              config={interviewConfig}
              onFinishInterview={handleFinishInterview}
              onExitRoom={handleExitInterviewRoom}
            />
          }
        />

        {/* Global Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                onStartInterview={handleStartInterview}
                onLaunchSession={handleLaunchSession}
                onViewReport={handleViewSampleReport}
                onBackToHome={() => navigate('/')}
                onNavigateToCompanies={() => navigate('/companies')}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile
                onStartInterview={handleStartInterview}
                onViewReport={handleViewSampleReport}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Minimalist Footer */}
      {!hideFooter && (
        <Footer
          onOpenLegal={handleOpenLegal}
          onSelectRole={handleStartInterview}
          onOpenContact={() => setContactModalOpen(true)}
        />
      )}

      {/* Step 1: Configuration Modal */}
      <SetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        initialRole={selectedRoleForSetup}
        onStartSession={handleLaunchSession}
      />

      {/* Step 2: Device & Hardware Permission Setup Modal */}
      <DeviceSetupModal
        isOpen={deviceSetupOpen}
        onClose={() => setDeviceSetupOpen(false)}
        config={interviewConfig}
        onEnterRoom={handleEnterInterviewRoom}
      />

      {/* Step 3: Official Performance Report Modal */}
      <SampleReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportData={reportData}
        onRetake={() => handleStartInterview(reportData?.role || 'Software Engineer')}
      />

      {/* Global Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <LiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        config={interviewConfig}
        onFinishInterview={handleFinishInterview}
      />

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        topic={legalTopic}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
