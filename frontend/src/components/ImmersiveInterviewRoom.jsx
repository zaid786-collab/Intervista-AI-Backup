import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  FileText,
  MessageSquare,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Maximize2,
  Minimize2,
  Zap,
  Languages,
  Trash2,
  Square,
  Loader2,
  Radio,
  Smartphone,
} from 'lucide-react';

import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { apiStartInterview, apiSendMessage, apiEndInterview, apiSaveReport } from '../utils/api';
import { evaluateSingleQuestion } from '../utils/evaluator';
import { getCurrentUser } from '../utils/auth';
import { ProctoringManager } from '../utils/ProctoringManager';
import ThreeInterviewScene from './ThreeInterviewScene';
import DeskCodingLaptop from './DeskCodingLaptop';
import CandidatePOVHands from './CandidatePOVHands';
import { MultimodalTracker } from '../utils/multimodalTracker';
import { useComputerVision } from '../computerVision/useComputerVision';
import { VisionStatusBadge } from '../computerVision/VisionStatusBadge';

const ROLE_OPTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'AI / ML Engineer',
  'System Architect',
  'DevOps / SRE Engineer',
  'Product Manager',
  'Engineering Manager',
  'Data Analyst',
];

export default function ImmersiveInterviewRoom({
  config,
  onFinishInterview,
  onExitRoom,
}) {
  // ─── Persona & Role Settings ────────────────────────────────────────────────
  const interviewerPersona = config?.interviewerPersona || 'chen';
  const isChen = interviewerPersona === 'chen' || interviewerPersona === 'david';
  const interviewerName = config?.interviewerName || (isChen ? 'Mr. J. Chen' : 'Sophia Sterling');
  const interviewerTitle = config?.interviewerTitle || (isChen ? 'Hiring Manager' : 'VP of Engineering');
  const targetCompany = config?.company || 'Google';
  const [selectedRole, setSelectedRole] = useState(config?.role || 'Software Engineer');
  const targetRole = selectedRole;
  const experienceLevel = config?.level || 'Mid Level';
  const interviewType = config?.interviewType || 'Technical Interview';
  const backgroundImage = isChen
    ? '/assets/interview/room-chen.jpg'
    : '/assets/interview/room-sophia.jpg';

  // ─── Session & Conversation State ───────────────────────────────────────────
  const [sessionId, setSessionId] = useState(null);
  const [geminiInteractionId, setGeminiInteractionId] = useState(null);
  const [sessionPhase, setSessionPhase] = useState('initializing'); // 'initializing' | 'active' | 'ending' | 'ended'
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Messages array: [{ role: 'interviewer' | 'candidate', text: string, timestamp: number }]
  const [messages, setMessages] = useState([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Candidate Answer State & Voice Input Transcriptions
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [selectedSpeechLang, setSelectedSpeechLang] = useState('en-IN');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [evaluatedAnswers, setEvaluatedAnswers] = useState([]);
  const [lastEvaluatedTurn, setLastEvaluatedTurn] = useState(null);

  // ─── Domain Questions & Proctoring State ────────────────────────────────────
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionObj, setCurrentQuestionObj] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState(null);
  const [terminatedModalData, setTerminatedModalData] = useState(null);
  const warningTimerRef = useRef(null);

  // Adaptive Difficulty Engine Live HUD State
  const [adaptiveState, setAdaptiveState] = useState({
    level: 2,
    levelName: 'Level 2: Practical Scenario',
    note: 'Evaluating baseline architectural and coding competence.',
    action: 'maintain',
  });

  // ─── Hardware & Device Controls ─────────────────────────────────────────────
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState(null);
  const [isCameraOff, setIsCameraOff] = useState(config?.isCameraActive === false);
  const [isScreenSharing, setIsScreenSharing] = useState(!!config?.isScreenShareActive);
  const [micVolume, setMicVolume] = useState(0);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // ─── UI Drawers & Overlays ──────────────────────────────────────────────────
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(false);
  const [confirmEndModalOpen, setConfirmEndModalOpen] = useState(false);
  const [pipMinimized, setPipMinimized] = useState(false);
  const [pipSize, setPipSize] = useState('normal'); // 'compact' | 'normal' | 'expanded'
  const [showPipTelemetry, setShowPipTelemetry] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: null, y: null });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [showDeskResume, setShowDeskResume] = useState(false);
  const [laptopExpanded, setLaptopExpanded] = useState(false);
  const user = getCurrentUser();
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [telemetryHud, setTelemetryHud] = useState({
    posture: 'Upright & Centered',
    gaze: 'Direct Lens Focus',
    gazeDirection: 'center',
    eyeContactPct: 86,
    lookingDownPct: 8,
    lookingAwayPct: 6,
    anxietyState: 'Calm & Composed',
    anxietyScore: 88,
    fidgetLevel: 'Low (Steady)',
    expression: 'Engaged & Attentive',
    headStability: 'Steady & Poised',
    wpm: 138,
    fillerCount: 0,
    pausesOver3s: 0,
    speakingSeconds: 0,
  });

  // ─── Media Stream & Audio Refs ──────────────────────────────────────────────
  const candidateVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const transcriptScrollRef = useRef(null);
  const interviewerFinishedSpeakingAtRef = useRef(Date.now());
  const isMicMutedRef = useRef(false);
  const sessionPhaseRef = useRef(sessionPhase);
  const textareaRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const pipContainerRef = useRef(null);
  const trackerRef = useRef(null);
  const proctorRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // ─── Production-Grade Speech Recognition & Microphone Hook ─────────────────
  const speech = useSpeechRecognition({
    initialLanguage: selectedSpeechLang,
    selectedMicId: config?.selectedMicId,
    sessionId: sessionId,
    questionId: questionIndex + 1,
    onAudioData: (analyser) => {
      trackerRef.current?.startAudio(analyser);
    },
  });

  // Real-time Computer Vision analysis hook
  const visionCV = useComputerVision({
    isInterviewActive: sessionPhase === 'active',
    isCameraActive: !isCameraOff,
    videoRef: candidateVideoRef,
    onMultipleUsersDetected: (count) => {
      if (proctorRef.current && sessionPhaseRef.current === 'active') {
        proctorRef.current.handleMultipleUsers(count);
      }
    },
    onMobilePhoneDetected: (details) => {
      console.warn('[ROOM] Mobile phone detected! Immediately terminating interview with Red Screen.');
      stopAllMedia();
      stopSpeechSynthesis();
      if (speech && typeof speech.stopRecording === 'function') {
        speech.stopRecording();
      }

      if (proctorRef.current) {
        proctorRef.current.handleMobilePhoneDetected(details);
      }

      setTerminatedModalData({
        reason: 'Unauthorized mobile phone detected in camera view.',
        warningCount: 0,
        maxWarnings: 3,
        isPhoneViolation: true,
        violations: [{ type: 'MOBILE_PHONE_DETECTED', message: 'Mobile phone detected in camera view.' }],
      });
    },
  });

  // Developer/Examiner testing shortcut: Alt+P triggers immediate mobile phone termination
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sessionPhase === 'active' && ((e.altKey && e.key.toLowerCase() === 'p') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p'))) {
        e.preventDefault();
        console.warn('[TEST] Manually triggering mobile phone termination (Alt+P)');
        visionCV.triggerMobilePhoneSimulation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionPhase, visionCV]);

  // ─── Dragging handler for Candidate Video PIP ───────────────────────────────
  const handlePipMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDraggingPip(true);
    const rect = pipContainerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // ─── Effects in strict fixed order ──────────────────────────────────────────
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    sessionPhaseRef.current = sessionPhase;
  }, [sessionPhase]);

  // Live synchronization of candidate answer with real-time speech recognition
  useEffect(() => {
    if (speech.transcript !== undefined) {
      setCandidateAnswer(speech.transcript);
    }
  }, [speech.transcript]);

  // Sync micVolume & candidate speaking reactivity
  useEffect(() => {
    setMicVolume(speech.volume);
    setIsCandidateSpeaking(speech.isCandidateSpeaking || speech.volume > 15);
  }, [speech.volume, speech.isCandidateSpeaking]);

  // Keep isMicMuted and isMicMutedRef synchronized with speech.isListening
  useEffect(() => {
    setIsMicMuted(!speech.isListening);
    isMicMutedRef.current = !speech.isListening;
  }, [speech.isListening]);

  // Auto-scroll textarea as transcript grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [candidateAnswer, speech.interimTranscript]);

  useEffect(() => {
    if (!isDraggingPip) return;
    const handleMouseMove = (e) => {
      const newX = Math.max(12, Math.min(window.innerWidth - 220, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(64, Math.min(window.innerHeight - 140, e.clientY - dragOffsetRef.current.y));
      setPipPosition({ x: newX, y: newY });
    };
    const handleMouseUp = () => {
      setIsDraggingPip(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPip]);

  // Keep candidate video element synced with camera stream
  useEffect(() => {
    if (!isCameraOff && cameraStreamRef.current && candidateVideoRef.current) {
      if (candidateVideoRef.current.srcObject !== cameraStreamRef.current) {
        candidateVideoRef.current.srcObject = cameraStreamRef.current;
      }
      candidateVideoRef.current.play().catch(() => {});
    }
  }, [isCameraOff, pipMinimized]);

  // Auto-resume AudioContext on first user interaction if browser suspended it
  useEffect(() => {
    const resumeAudioCtx = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('click', resumeAudioCtx);
    window.addEventListener('keydown', resumeAudioCtx);
    window.addEventListener('touchstart', resumeAudioCtx);
    return () => {
      window.removeEventListener('click', resumeAudioCtx);
      window.removeEventListener('keydown', resumeAudioCtx);
      window.removeEventListener('touchstart', resumeAudioCtx);
    };
  }, []);

  // Format Elapsed Time MM:SS
  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ─── 1. Initialize Media Hardware Streams ───────────────────────────────────
  const startLocalMedia = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        // Start Video Stream
        if (!isCameraOff) {
          const videoConstraints = config?.selectedCameraId
            ? { video: { deviceId: { exact: config.selectedCameraId } } }
            : { video: { width: { ideal: 1280 }, height: { ideal: 720 } } };

          const vidStream = await navigator.mediaDevices.getUserMedia(videoConstraints).catch(() => null);
          if (vidStream) {
            cameraStreamRef.current = vidStream;
            if (candidateVideoRef.current) {
              candidateVideoRef.current.srcObject = vidStream;
              candidateVideoRef.current.play().catch(() => {});
              if (trackerRef.current) {
                trackerRef.current.startVision(candidateVideoRef.current);
              }
            }
          }
        }

        // Audio stream is cleanly managed by useSpeechRecognition hook to prevent hardware device contention
        if (!isMicMutedRef.current) {
          speech.startRecording().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Failed to start camera or media hardware:', err);
    }
  };

  // ─── 2. Stop All Media Hardware Streams ─────────────────────────────────────
  const stopAllMedia = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.stopVision();
      trackerRef.current.stopAudio();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    stopSpeechSynthesis();
    stopSpeechRecognition();
  }, []);

  const stopSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsInterviewerSpeaking(false);
  };

  // ─── 3. Speech Recognition (Unified through useSpeechRecognition) ───────────
  const startSpeechRecognition = useCallback(() => {
    speech.startRecording();
  }, [speech]);

  const stopSpeechRecognition = useCallback(() => {
    speech.stopRecording();
  }, [speech]);

  // ─── Helper: Turn Microphone ON automatically ──────────────────────────────
  const activateMic = useCallback(() => {
    isMicMutedRef.current = false;
    setIsMicMuted(false);
    speech.startRecording();
  }, [speech]);

  // ─── Voice Action Helpers ──────────────────────────────────────────────────
  const handleClearAnswer = useCallback(() => {
    speech.clearTranscript();
    setCandidateAnswer('');
  }, [speech]);

  const handleSwitchLanguage = useCallback((langCode) => {
    setSelectedSpeechLang(langCode);
    speech.switchLanguage(langCode);
  }, [speech]);

  // ─── 4. Speech Synthesis (Interviewer Voice Out Loud) ────────────────────────
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      activateMic();
      return;
    }
    window.speechSynthesis.cancel();

    // Clean text of intro metadata for speech
    const cleanSpeech = text
      .replace(/Hello!.*?To begin: /s, "Hello! Welcome to your interview. Let's begin. ")
      .replace(/[*#_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.98;
    utterance.pitch = isChen ? 0.92 : 1.05;

    const voices = window.speechSynthesis.getVoices();
    if (isChen) {
      const maleVoice = voices.find(v =>
        (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Alex')) &&
        v.lang.startsWith('en')
      );
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      const femaleVoice = voices.find(v =>
        (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google UK English Female') || v.name.includes('Victoria')) &&
        v.lang.startsWith('en')
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    let safetyTimer = null;

    // Fallback timer: ensure mic is activated even if browser speech ends unexpectedly, hangs, or is blocked
    safetyTimer = setTimeout(() => {
      setIsInterviewerSpeaking(false);
      interviewerFinishedSpeakingAtRef.current = Date.now();
      activateMic();
    }, 4500);

    utterance.onstart = () => {
      setIsInterviewerSpeaking(true);
    };

    utterance.onend = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      setIsInterviewerSpeaking(false);
      interviewerFinishedSpeakingAtRef.current = Date.now();
      // Auto-turn mic ON when interviewer finishes asking the question
      activateMic();
    };

    utterance.onerror = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      setIsInterviewerSpeaking(false);
      interviewerFinishedSpeakingAtRef.current = Date.now();
      activateMic();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (safetyTimer) clearTimeout(safetyTimer);
      setIsInterviewerSpeaking(false);
      activateMic();
    }
  };

  // ─── 5. Start Session Lifecycle ─────────────────────────────────────────────
  useEffect(() => {
    trackerRef.current = new MultimodalTracker({
      onUpdate: (stats) => {
        setTelemetryHud(prev => ({ ...prev, ...stats }));
      }
    });

    startLocalMedia();
    initializeSession();

    return () => {
      stopAllMedia();
      if (trackerRef.current) {
        trackerRef.current.destroy();
        trackerRef.current = null;
      }
    };
  }, []);

  // Timer interval (runs only when session is active and camera/mic are both on)
  useEffect(() => {
    if (sessionPhase !== 'active' || isCameraOff || isMicMuted) return;
    const interval = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionPhase, isCameraOff, isMicMuted]);

  // Proctoring lifecycle & anti-cheating warning system
  useEffect(() => {
    if (sessionPhase !== 'active') return;

    const proctor = new ProctoringManager({
      sessionId: sessionId || `intv_${Date.now()}`,
      company: targetCompany,
      role: targetRole,
      config: {
        maxWarnings: 3,
        detectTabSwitch: true,
        detectWindowBlur: false,
        incidentDebounceMs: 2500,
      },
      onWarning: (data, maybeCount, maybeMax) => {
        const currentCount = (typeof data === 'object' && data.warningNumber !== undefined)
          ? data.warningNumber
          : (maybeCount ?? (typeof data === 'number' ? data : 1));
        const maxAllowed = (typeof data === 'object' && data.maxWarnings !== undefined)
          ? data.maxWarnings
          : (maybeMax ?? 3);
        const type = (typeof data === 'object' && data.type) || 'PROCTORING_VIOLATION';
        const message = (typeof data === 'object' && data.message) || 'Proctoring violation detected.';

        setWarningCount(currentCount);
        setActiveWarning({
          type,
          message,
          count: currentCount,
          max: maxAllowed,
        });

        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        // Toast stays visible for 8s of active user attention or until acknowledged
        warningTimerRef.current = setTimeout(() => {
          setActiveWarning(null);
        }, 8000);
      },
      onTerminate: (data) => {
        console.warn('[PROCTORING] Terminated by proctoring engine:', data);
        const isPhone = (typeof data === 'object' && (data.violationType === 'MOBILE_PHONE_DETECTED' || data.isImmediateTermination));
        const termReason = (typeof data === 'object' && data.terminationReason)
          ? data.terminationReason
          : (typeof data === 'string'
              ? data
              : (isPhone
                  ? 'Interview terminated immediately due to unauthorized mobile phone usage.'
                  : 'Maximum proctoring warnings reached (3/3).'));
        
        stopAllMedia();
        setTerminatedModalData({
          reason: termReason,
          warningCount: isPhone ? 0 : 3,
          maxWarnings: 3,
          isPhoneViolation: isPhone,
          violations: data?.violations || [],
        });
      },
    });

    proctor.start();
    // Synchronize warning count from session storage state in case of reload
    setWarningCount(proctor.getWarningCount());
    proctorRef.current = proctor;

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (proctorRef.current) {
        proctorRef.current.stop();
        proctorRef.current = null;
      }
    };
  }, [sessionPhase, sessionId, targetCompany, targetRole]);

  // Keep warning visible upon candidate returning to tab
  useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === 'visible' && activeWarning) {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        warningTimerRef.current = setTimeout(() => {
          setActiveWarning(null);
        }, 8000);
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, [activeWarning]);

  // Handle Mute/Unmute toggle
  const toggleMicrophone = useCallback(() => {
    if (speech.isListening) {
      speech.stopRecording();
      setIsMicMuted(true);
      isMicMutedRef.current = true;
    } else {
      speech.startRecording();
      setIsMicMuted(false);
      isMicMutedRef.current = false;
    }
  }, [speech]);

  // Handle Camera toggle
  const toggleCamera = async () => {
    const newOff = !isCameraOff;
    setIsCameraOff(newOff);

    if (newOff) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getVideoTracks().forEach(t => {
          t.enabled = false;
        });
      }
      trackerRef.current?.stopVision();
    } else {
      let stream = cameraStreamRef.current;
      const hasLiveTracks = stream && stream.getVideoTracks().some(t => t.readyState === 'live');

      if (!hasLiveTracks) {
        try {
          const videoConstraints = config?.selectedCameraId
            ? { video: { deviceId: { exact: config.selectedCameraId } } }
            : { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } };
          stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
          cameraStreamRef.current = stream;
        } catch (err) {
          console.warn('Failed to start camera on toggle:', err);
          setIsCameraOff(true);
          return;
        }
      } else {
        stream.getVideoTracks().forEach(t => {
          t.enabled = true;
        });
      }

      if (candidateVideoRef.current && stream) {
        candidateVideoRef.current.srcObject = stream;
        candidateVideoRef.current.play().catch(() => {});
      }

      if (candidateVideoRef.current && trackerRef.current) {
        trackerRef.current.startVision(candidateVideoRef.current);
      }
    }
  };

  // Handle Screen Sharing toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) return;
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setIsScreenSharing(true);

      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
      };
    } catch (err) {
      console.warn('Screen sharing cancelled:', err);
      setIsScreenSharing(false);
    }
  };

  // ─── 6. Initialize Interview Session ────────────────────────────────────────
  const initializeSession = async () => {
    setSessionPhase('initializing');
    try {
      const response = await apiStartInterview({
        role: targetRole,
        company: targetCompany,
        interviewType,
        experience: experienceLevel,
        duration: config?.duration ? parseInt(config.duration) : 30,
        focusTopic: config?.topic || config?.language || null,
        interviewerName,
      });

      setSessionId(response.sessionId);
      setGeminiInteractionId(response.geminiInteractionId);
      setIsDemoMode(!!response.isDemoMode);

      if (response?.questions && Array.isArray(response.questions)) {
        setInterviewQuestions(response.questions);
        if (response.questions.length > 0) {
          setCurrentQuestionObj(response.questions[0]);
          setTotalQuestions(response.questions.length);
        }
      }

      const openingMsg = response?.message || response?.welcomeMessage || 'Welcome to your interview!';
      setMessages([{ role: 'interviewer', text: openingMsg, timestamp: Date.now() }]);

      // Extract question part for the floating question card
      const questionClean = typeof openingMsg === 'string'
        ? openingMsg
            .replace(/Hello!.*?\n\n/s, '')
            .replace(/^To begin:\s*/i, '')
            .trim()
        : response?.currentQuestion || '';
      setCurrentQuestionText(questionClean || response?.currentQuestion || openingMsg);
      setQuestionIndex(1);

      setSessionPhase('active');

      // Ensure Candidate Mic & speech recognition run actively from session start
      activateMic();

      // Speak opening message out loud
      speakText(openingMsg);
    } catch (err) {
      console.warn('[interview room] API start error, utilizing direct simulation fallback:', err);
      // Graceful local fallback if network or backend offline
      const fallbackId = 's_' + Date.now().toString(36);
      const greeting = `Hello! Welcome to your ${targetRole} interview at ${targetCompany}. I'm ${interviewerName}, and I'll be conducting your session today.`;
      const firstQ = `Tell me about a time you led a project.`;
      const fullText = `${greeting}\n\nTo begin: ${firstQ}`;

      setSessionId(fallbackId);
      setIsDemoMode(true);
      setMessages([{ role: 'interviewer', text: fullText, timestamp: Date.now() }]);
      setCurrentQuestionText(firstQ);
      setSessionPhase('active');
      activateMic();
      speakText(fullText);
    }
  };

  // ─── 6b. Role Dropdown Change Handler ───────────────────────────────────────
  const handleRoleChange = async (newRole) => {
    if (newRole === selectedRole) return;
    setSelectedRole(newRole);
    stopSpeechSynthesis();
    stopSpeechRecognition();
    setSessionPhase('initializing');
    setQuestionIndex(1);
    setCandidateAnswer('');

    try {
      const response = await apiStartInterview({
        role: newRole,
        company: targetCompany,
        interviewType,
        experience: experienceLevel,
        duration: config?.duration ? parseInt(config.duration) : 30,
        focusTopic: config?.topic || config?.language || null,
        interviewerName,
      });

      setSessionId(response.sessionId);
      setGeminiInteractionId(response.geminiInteractionId);
      setIsDemoMode(!!response.isDemoMode);

      if (response.questions && Array.isArray(response.questions)) {
        setInterviewQuestions(response.questions);
        if (response.questions.length > 0) {
          setCurrentQuestionObj(response.questions[0]);
          setTotalQuestions(response.questions.length);
        }
      }

      const openingMsg = response.message || response.welcomeMessage || 'Welcome to your interview!';
      setMessages([{ role: 'interviewer', text: openingMsg, timestamp: Date.now() }]);

      const questionClean = (openingMsg || '')
        .replace(/Hello!.*?\n\n/s, '')
        .replace(/^To begin:\s*/i, '')
        .trim();
      setCurrentQuestionText(questionClean || openingMsg);
      setSessionPhase('active');
      speakText(openingMsg);
    } catch (err) {
      console.warn('[interview room] Role switch API error, utilizing role fallback:', err);
      const fallbackId = 's_' + Date.now().toString(36);
      const roleQuestions = {
        'Frontend Developer': 'How do you profile, diagnose, and optimize Core Web Vitals—specifically Largest Contentful Paint (LCP) and Interaction to Next Paint (INP)—in a modern Single Page Application?',
        'Backend Developer': 'Can you describe the architecture of a high-throughput backend service you designed or maintained? How did you handle data consistency and database load during peak traffic spikes?',
        'Full Stack Engineer': 'When designing an end-to-end fullstack system with real-time updates, how do you handle state synchronization between client cache and distributed backend databases?',
        'AI / ML Engineer': 'When deploying a classification model in production where False Positives are 10x costlier than False Negatives, how do you tune decision thresholds and detect feature drift?',
        'System Architect': 'When multiple microservices update shared state across independent databases, what transaction management pattern would you select (e.g. 2PC vs Saga), and how do you handle compensations?',
        'DevOps / SRE Engineer': 'Imagine your production API p99 latency suddenly jumps from 45ms to 2.4 seconds, but CPU utilization remains low at 15%. How do you systematically diagnose the root cause?',
        'Product Manager': 'How would you measure the product health and north-star retention of an AI-assisted developer tool? If an A/B test shows conflicting metric trade-offs, how do you decide rollout?',
        'Engineering Manager': 'Tell me about a project where you had a strong technical disagreement with senior stakeholders. How did you resolve the conflict, and what was the outcome?',
        'Data Analyst': 'How do you design analytical SQL queries and data models for high-frequency business event streams while ensuring query latency remains under a second?',
        'Software Engineer': 'Can you describe the architecture of a high-throughput backend service you designed or maintained? How did you handle data consistency and database load during peak traffic spikes?',
      };
      const firstQ = roleQuestions[newRole] || roleQuestions['Software Engineer'];
      const greeting = `Hello! Welcome to your ${newRole} interview at ${targetCompany}. I'm ${interviewerName}, and I'll be conducting your technical interview today.`;
      const fullText = `${greeting}\n\nTo begin: ${firstQ}`;

      setSessionId(fallbackId);
      setIsDemoMode(true);
      setMessages([{ role: 'interviewer', text: fullText, timestamp: Date.now() }]);
      setCurrentQuestionText(firstQ);
      setSessionPhase('active');
      speakText(fullText);
    }
  };

  // ─── 7. Submit Candidate Answer ─────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || isSubmittingAnswer) return;

    const answerText = candidateAnswer.trim();
    setIsSubmittingAnswer(true);
    speech.stopRecording();
    speech.setMicState('analyzing');
    stopSpeechSynthesis();

    // Feed speech chunk to MultimodalTracker
    trackerRef.current?.recordSpeechChunk(answerText);

    const currentQText = currentQuestionText || (currentQuestionObj?.question) || `Technical Question #${questionIndex}`;
    const currentQId = currentQuestionObj?.id || questionIndex;

    // Append candidate message to transcript
    const updatedMessages = [
      ...messages,
      { role: 'candidate', text: answerText, timestamp: Date.now(), questionId: currentQId },
    ];
    setMessages(updatedMessages);
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setCandidateAnswer('');
    speech.clearTranscript();
    setIsCandidateSpeaking(false);

    try {
      const latencyMs = Math.max(300, Date.now() - (interviewerFinishedSpeakingAtRef.current || Date.now()));
      const wordCount = answerText.split(/\s+/).filter(Boolean).length;
      const audioDurationMs = Math.round((wordCount / 135) * 60000);

      const res = await apiSendMessage({
        sessionId,
        content: answerText,
        latencyMs,
        audioDurationMs,
        questionIndex,
        questionId: currentQId,
      });

      // ─── Real-Time Answer Evaluation & Scoring ──────────────────────────
      let evalData = null;
      if (res?.score !== undefined && res?.score !== null) {
        const ev = res.evaluation || {};
        evalData = {
          score: res.score,
          marks: res.marks ?? res.score,
          status: res.status || (res.score >= 70 ? 'CORRECT' : res.score >= 35 ? 'PARTIAL' : 'INCORRECT'),
          feedback: res.feedback_summary || ev.feedback || res.aiFeedback || 'Answer checked and evaluated.',
          relevance: ev.relevance ?? 90,
          technical_accuracy: ev.technical_accuracy ?? res.technicalScore ?? res.technical_score ?? res.score,
          completeness: ev.completeness ?? 80,
          communication_clarity: ev.communication_clarity ?? res.communicationScore ?? res.communication_score ?? 85,
          problem_solving: ev.technical_depth ?? res.score,
          strengths: ev.strengths || [],
          weaknesses: ev.weaknesses || [],
          missing_concepts: ev.missing_concepts || [],
          suggested_answer_points: ev.suggested_answer_points || [],
          ideal_answer: ev.ideal_answer || '',
        };
      } else {
        const localCheck = evaluateSingleQuestion(
          {
            question_id: currentQId,
            question: currentQText,
            answer: answerText,
            expected_key_points: currentQuestionObj?.expected_key_points || [],
            domain: currentQuestionObj?.domain || config?.topic,
          },
          targetCompany,
          targetRole,
          experienceLevel
        );
        evalData = {
          score: localCheck.score,
          marks: localCheck.score,
          status: localCheck.status,
          feedback: localCheck.feedback,
          relevance: localCheck.relevance ?? 85,
          technical_accuracy: localCheck.technical_accuracy,
          completeness: localCheck.completeness ?? 80,
          communication_clarity: localCheck.communication_clarity,
          problem_solving: localCheck.problem_solving ?? localCheck.technical_depth ?? localCheck.score,
          strengths: localCheck.strengths || [],
          weaknesses: localCheck.weaknesses || [],
          missing_concepts: localCheck.missing_concepts || [],
          suggested_answer_points: localCheck.suggested_answer_points || [],
          ideal_answer: localCheck.ideal_answer || '',
        };
      }

      const evaluatedItem = {
        questionId: currentQId,
        question_id: currentQId,
        question: currentQText,
        candidateAnswer: answerText,
        answer: answerText,
        ...evalData,
      };

      setEvaluatedAnswers(prev => {
        const nextList = [...prev.filter(p => p.questionId !== currentQId), evaluatedItem];
        return nextList;
      });

      setLastEvaluatedTurn(evaluatedItem);

      const reply = res.message || res.reply || res.nextQuestion || 'Thank you for your response.';

      setMessages([
        ...updatedMessages,
        { role: 'interviewer', text: reply, timestamp: Date.now(), evaluatedAnswer: evaluatedItem },
      ]);

      const replyClean = (reply || '')
        .replace(/^Thank you.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^Understood.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^That's a very clear.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^Great insights.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^Appreciate the concrete.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .trim();
      setCurrentQuestionText(replyClean || reply);
      setQuestionIndex(prev => prev + 1);

      if (res.adaptiveLevel) {
        setAdaptiveState({
          level: res.adaptiveLevel,
          levelName: res.adaptiveLevelName || `Level ${res.adaptiveLevel}`,
          note: res.adaptiveNote || 'Adaptive engine adjusted to demonstrated answer depth.',
          action: res.adaptiveAction || 'maintain',
        });
      }

      if (res.nextQuestionData) {
        setCurrentQuestionObj(res.nextQuestionData);
      } else if (interviewQuestions && interviewQuestions[questionIndex]) {
        setCurrentQuestionObj(interviewQuestions[questionIndex]);
      }

      // Speak out response
      speakText(reply);
    } catch (err) {
      console.warn('[interview room] Send message error, providing realistic follow-up:', err);

      // Evaluate answer locally on error so score is always preserved
      const localCheck = evaluateSingleQuestion(
        {
          question_id: currentQId,
          question: currentQText,
          answer: answerText,
          expected_key_points: currentQuestionObj?.expected_key_points || [],
          domain: currentQuestionObj?.domain || config?.topic,
        },
        targetCompany,
        targetRole,
        experienceLevel
      );
      const evaluatedItem = {
        questionId: currentQId,
        question_id: currentQId,
        question: currentQText,
        candidateAnswer: answerText,
        answer: answerText,
        score: localCheck.score,
        marks: localCheck.score,
        status: localCheck.status,
        feedback: localCheck.feedback,
        relevance: localCheck.relevance ?? 85,
        technical_accuracy: localCheck.technical_accuracy,
        completeness: localCheck.completeness ?? 80,
        communication_clarity: localCheck.communication_clarity,
        problem_solving: localCheck.problem_solving ?? localCheck.technical_depth ?? localCheck.score,
        strengths: localCheck.strengths || [],
        weaknesses: localCheck.weaknesses || [],
        missing_concepts: localCheck.missing_concepts || [],
        suggested_answer_points: localCheck.suggested_answer_points || [],
        ideal_answer: localCheck.ideal_answer || '',
      };
      setEvaluatedAnswers(prev => [...prev.filter(p => p.questionId !== currentQId), evaluatedItem]);
      setLastEvaluatedTurn(evaluatedItem);

      // Local fallback follow-up
      const followUps = [
        "How would you handle unexpected data spikes or high concurrent write throughput in that setup?",
        "When you reflect on that system design, what failure modes or edge cases required the most defensive engineering?",
        "How did you align the team and communicate trade-offs to non-technical stakeholders during delivery?",
        "Thank you for that thorough explanation. That covers all our primary discussion topics for this round!"
      ];
      const nextFollowUp = followUps[Math.min(questionIndex - 1, followUps.length - 1)];

      setMessages([
        ...updatedMessages,
        { role: 'interviewer', text: nextFollowUp, timestamp: Date.now(), evaluatedAnswer: evaluatedItem },
      ]);
      setCurrentQuestionText(nextFollowUp);
      setQuestionIndex(prev => prev + 1);
      speakText(nextFollowUp);
    } finally {
      setIsSubmittingAnswer(false);
      // If speech synthesis is not speaking, reactivate candidate mic
      if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
        activateMic();
      }
    }
  };

  // ─── 8. Conclude Interview & Generate Report ─────────────────────────────────
  const handleEndInterview = async (endOptions = {}) => {
    const isCheating = endOptions?.isCheating || proctorRef.current?.isCheating || false;
    const isProctoringTerminated = endOptions?.isTerminated || proctorRef.current?.isTerminated || isCheating || false;
    const terminationReason = endOptions?.terminationReason || (isCheating ? "Interview session was terminated directly due to unauthorized mobile phone usage." : "Interview terminated due to exceeding 3 proctoring warnings.");
    setConfirmEndModalOpen(false);
    setTerminatedModalData(null);
    setSessionPhase('ending');
    stopAllMedia();

    const finalTelemetry = trackerRef.current?.getFinalTelemetry({ isCameraOff, isMicMuted }) || {};
    const cvSummary = visionCV.getFinalSummary();

    // 1. Gather genuine metrics by checking all candidate answers
    const candidateMsgs = messages.filter(m => m.role === 'candidate');
    const totalWords = candidateMsgs.reduce((acc, m) => acc + (m.text ? m.text.split(/\s+/).length : 0), 0);

    let answersToScore = [...evaluatedAnswers];
    if (answersToScore.length === 0 && candidateMsgs.length > 0) {
      answersToScore = candidateMsgs.map((m, idx) => {
        const ev = evaluateSingleQuestion(
          { question_id: idx + 1, question: `Technical Discussion Topic #${idx + 1}`, answer: m.text },
          targetCompany,
          targetRole,
          experienceLevel
        );
        return {
          questionId: idx + 1,
          question_id: idx + 1,
          question: `Technical Discussion Topic #${idx + 1}`,
          candidateAnswer: m.text,
          answer: m.text,
          score: ev.score,
          marks: ev.score,
          status: ev.status,
          feedback: ev.feedback,
          technical_accuracy: ev.technical_accuracy,
          communication_clarity: ev.communication_clarity,
          problem_solving: ev.problem_solving,
          missing_concepts: ev.missing_concepts || [],
          suggested_answer_points: ev.suggested_answer_points || [],
        };
      });
    }

    // Authentic calculated marks
    const scoresArr = answersToScore.map(a => a.score ?? 0);
    const overall = scoresArr.length > 0
      ? Math.round(scoresArr.reduce((acc, s) => acc + s, 0) / scoresArr.length)
      : (candidateMsgs.length === 0 ? 0 : 50);

    const tech = answersToScore.length > 0
      ? Math.round(answersToScore.reduce((acc, a) => acc + (a.technical_accuracy ?? overall), 0) / answersToScore.length)
      : overall;

    const comm = answersToScore.length > 0
      ? Math.round(answersToScore.reduce((acc, a) => acc + (a.communication_clarity ?? 80), 0) / answersToScore.length)
      : 80;

    const prob = answersToScore.length > 0
      ? Math.round(answersToScore.reduce((acc, a) => acc + (a.problem_solving ?? overall), 0) / answersToScore.length)
      : overall;

    const conf = Math.min(100, Math.max(50, comm - (isMicMuted ? 8 : 0)));

    const verbalDelivery = !isMicMuted ? {
      speakingPaceWpm: telemetryHud.wpm || 138,
      paceAssessment: (telemetryHud.wpm < 115 ? 'Deliberate Cadence (< 115 WPM)' : (telemetryHud.wpm > 170 ? 'Rapid Cadence (> 170 WPM)' : 'Optimal Cadence (125-165 WPM)')),
      voiceDynamicEnergy: telemetryHud.speakingSeconds > 15 ? 'Engaging Dynamic Range' : 'Standard Modulation',
      fillerWordsCount: telemetryHud.fillerCount || Math.max(0, Math.round(totalWords * 0.015)),
      fillerRatioPercent: totalWords > 0 ? Math.round(((telemetryHud.fillerCount || 1) / totalWords) * 1000) / 10 : 1.1,
      pausesOver3s: telemetryHud.pausesOver3s || 0,
      clarityScore: Math.min(96, Math.max(75, 92 - (telemetryHud.fillerCount > 3 ? 6 : 0))),
      suggestions: [
        'Speaking cadence was well-paced and articulate throughout the technical explanations.',
        'Continue using deliberate 1-second silent pauses to structure architectural thoughts.'
      ]
    } : {
      speakingPaceWpm: null,
      paceAssessment: 'Not assessed (Microphone was muted during session)',
      fillerWordsCount: null,
      clarityScore: null,
      suggestions: ['Enable microphone for live speech rhythm, pause detection, and clarity telemetry.']
    };

    const behavioralDossier = trackerRef.current?.getBehavioralReport({ isCameraOff }) || {};

    const visualObservations = !isCameraOff ? {
      ...(cvSummary?.available ? cvSummary : {}),
      enabled: true,
      postureScore: cvSummary?.presentationConfidence || (telemetryHud.posture?.includes('Slouch') ? 72 : 88),
      postureStatus: cvSummary?.presentationStyle?.overallPresentation || telemetryHud.posture || 'Upright & Centered',
      gazeCenteredRatio: cvSummary?.cameraFacingPercentage || behavioralDossier.eyeContactPercentage || telemetryHud.eyeContactPct || 86,
      gazeStatus: cvSummary?.presentationStyle?.cameraEngagement ? `${cvSummary.presentationStyle.cameraEngagement} Camera Focus` : (telemetryHud.gaze || 'Direct Lens Focus'),
      gazeDirection: cvSummary?.lastDirection || telemetryHud.gazeDirection || 'center',
      headMovementStability: cvSummary?.presentationStyle?.visualAttentiveness || telemetryHud.headStability || 'Steady & Poised',
      facialExpression: cvSummary?.presentationStyle?.expressiveness || telemetryHud.expression || 'Engaged & Attentive',
      anxietyScore: behavioralDossier.overallComposureScore || telemetryHud.anxietyScore || 88,
      anxietyLevel: behavioralDossier.anxietyLevel || telemetryHud.anxietyState || 'Calm & Composed',
      fidgetIndex: behavioralDossier.fidgetingIndex || telemetryHud.fidgetLevel || 'Low (Composed)',
      suggestions: cvSummary?.improvements?.length ? cvSummary.improvements : (behavioralDossier.anxietyManagementTips || [
        'Maintained consistent direct eye contact with the camera lens during core explanations.',
        'Camera framing and posture remained upright and stable throughout.'
      ])
    } : {
      enabled: false,
      available: false,
      postureStatus: 'Not assessed (Camera disabled by user)',
      gazeStatus: 'Not assessed',
      headMovementStability: 'Not assessed',
      suggestions: ['Camera was turned off during session. Enable camera for posture feedback.']
    };

    const questionFeedback = answersToScore.length > 0
      ? answersToScore.map((a, idx) => ({
          question: a.question || `Round ${idx + 1} Prompt`,
          candidateAnswer: a.candidateAnswer || a.answer || '',
          feedback: a.feedback || "Answer evaluated based on technical trade-offs and foundational principles.",
          score: a.score ?? 0,
          status: a.status || (a.score >= 70 ? 'CORRECT' : a.score >= 35 ? 'PARTIAL' : 'INCORRECT'),
          missing_concepts: a.missing_concepts || [],
          suggested_answer_points: a.suggested_answer_points || [],
        }))
      : [
          {
            question: "System Architecture & Algorithmic Design",
            candidateAnswer: "No answers submitted.",
            feedback: "Candidate did not submit responses during this interview round.",
            score: 0,
            status: "NO_ANSWER",
          }
        ];

    let reportPayload = {
      sessionId: sessionId || `sess_${Date.now()}`,
      role: targetRole,
      company: targetCompany,
      level: experienceLevel,
      overallScore: isProctoringTerminated ? 0 : overall,
      status: isCheating ? 'TERMINATED_FOR_CHEATING' : (isProctoringTerminated ? 'TERMINATED_FOR_PROCTORING' : 'COMPLETED'),
      terminationReason: isProctoringTerminated ? terminationReason : null,
      warning_count: isCheating ? 0 : (proctorRef.current?.getWarningCount() || warningCount),
      scores: {
        communication: isProctoringTerminated ? 0 : comm,
        technicalDepth: isProctoringTerminated ? 0 : tech,
        problemSolving: isProctoringTerminated ? 0 : prob,
        confidence: isProctoringTerminated ? 0 : conf,
      },
      criterionScores: {
        technicalKnowledge: tech,
        problemSolving: prob,
        communication: comm,
        confidence: conf,
      },
      criterionWeights: {
        technicalKnowledge: 35,
        problemSolving: 30,
        communication: 20,
        confidence: 15,
      },
      strengths: overall >= 70
        ? [
            `Clear, articulate communication when breaking down ${targetRole} challenges.`,
            `Thoughtful architectural trade-off consideration and clean reasoning.`,
            `Maintained steady professional composure under live interview simulation.`
          ]
        : [
            `Attempted interview questions under simulation conditions.`,
            `Foundational awareness of ${targetRole} topics.`
          ],
      improvements: [
        `State Big-O time and space complexity upfront before expanding on implementation.`,
        `Quantify past project outcomes with measurable business metrics (e.g. % latency improvement).`,
        `Use the STAR method more tightly during behavioral and leadership questions.`
      ],
      questionFeedback,
      verbalDelivery,
      visualObservations,
      vision_data: cvSummary,
      behavioralAnalysis: behavioralDossier,
      multimodalAnalysis: {
        behavioralReport: behavioralDossier,
        facialAnalysis: {
          assessed: !isCameraOff,
          score: behavioralDossier.overallComposureScore || 88,
          gazeCenteredRatio: behavioralDossier.eyeContactPercentage || 86,
          gazeStatus: telemetryHud.gaze || 'Direct Lens Focus (Optimal)',
          expressionState: telemetryHud.expression || 'Engaged & Attentive',
          anxietyState: behavioralDossier.anxietyLevel || 'Calm & Composed',
          actionableTips: behavioralDossier.anxietyManagementTips,
        },
        bodyLanguageAnalysis: {
          assessed: !isCameraOff,
          score: telemetryHud.posture?.includes('Slouch') ? 72 : 88,
          postureStatus: telemetryHud.posture || 'Upright & Centered',
          uprightPercentage: 88,
          fidgetIndex: behavioralDossier.fidgetingIndex || 'Low (Composed)',
        },
        vocalAnalysis: verbalDelivery,
      },
      multimodalTelemetry: finalTelemetry,
      summary: overall >= 70
        ? `The candidate demonstrated strong domain fundamentals for ${targetRole} at ${targetCompany}. Answers showed structured thinking, sound technical reasoning, and professional poise under mock interview pressure.`
        : `The candidate completed the mock interview for ${targetRole} at ${targetCompany}. Strengthen technical depth and provide concrete production trade-offs to boost marks.`,
    };

    try {
      if (sessionId) {
        try {
          const backendSubmission = await apiEndInterview(sessionId, {
            company: targetCompany,
            role: targetRole,
            difficulty: experienceLevel,
            answers: answersToScore.map(a => ({
              question_id: a.questionId || a.question_id || 1,
              question: a.question,
              answer: a.candidateAnswer || a.answer || '',
              status: a.status || 'SUBMITTED',
              score: a.score,
            })),
            durationSeconds: typeof secondsElapsed !== 'undefined' ? secondsElapsed : 0,
            vision_data: cvSummary,
            visualObservations: reportPayload.visualObservations,
            audioTelemetry: reportPayload.verbalDelivery,
            multimodalTelemetry: finalTelemetry,
          });

          if (backendSubmission && (backendSubmission.overallScore !== undefined || backendSubmission.score !== undefined)) {
            reportPayload = {
              ...reportPayload,
              overallScore: backendSubmission.overallScore ?? backendSubmission.score ?? overall,
              score: backendSubmission.overallScore ?? backendSubmission.score ?? overall,
              scores: backendSubmission.scores || reportPayload.scores,
              criterionScores: backendSubmission.criterionScores || reportPayload.criterionScores,
              questionFeedback: backendSubmission.questionFeedback && backendSubmission.questionFeedback.length > 0
                ? backendSubmission.questionFeedback
                : reportPayload.questionFeedback,
              strengths: backendSubmission.strengths && backendSubmission.strengths.length > 0 ? backendSubmission.strengths : reportPayload.strengths,
              improvements: backendSubmission.improvements && backendSubmission.improvements.length > 0 ? backendSubmission.improvements : reportPayload.improvements,
              summary: backendSubmission.summary || reportPayload.summary,
            };
          }
        } catch (subErr) {
          console.warn('[interview room] apiEndInterview error:', subErr);
        }
      }
      const savedReportResponse = await apiSaveReport(reportPayload);
      const savedReport = savedReportResponse?.report || { ...reportPayload, id: `rep_${Date.now()}` };
      if (onFinishInterview) {
        onFinishInterview(savedReport);
      }
    } catch (saveErr) {
      console.warn('Backend saveReport error, using calculated report:', saveErr);
      if (onFinishInterview) {
        onFinishInterview({ ...reportPayload, id: `rep_${Date.now()}` });
      }
    }
  };

  // Keyboard shortcut: Enter or Ctrl+Enter to send answer
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#05070A',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-primary)',
        userSelect: 'none',
      }}
    >
      {/* =========================================================================
          LAYER 1: REAL 3D PROCEDURAL INTERVIEWER & CORPORATE OFFICE SCENE (THREE.JS)
          ========================================================================= */}
      <ThreeInterviewScene
        isInterviewerSpeaking={isInterviewerSpeaking}
        isCandidateSpeaking={isCandidateSpeaking}
        interviewerName={interviewerName}
        interviewerTitle={interviewerTitle}
        candidateRole={targetRole}
        targetCompany={targetCompany}
      />

      {/* =========================================================================
          LAYER 2: TOP FLOATING BAR (BRAND, INTERVIEWER IDENTITY & EXIT)
          ========================================================================= */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
        }}
      >
        {/* Left: Intervista Emblem & Active Company Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'rgba(10, 12, 16, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-gold)',
                boxShadow: '0 0 10px var(--accent-gold)',
              }}
            />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.04em', color: '#FFFFFF' }}>
              INTERVISTA
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>|</span>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.84rem', fontWeight: 600 }}>
              {targetCompany}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              · {targetRole}
            </span>
          </div>

          {/* Demo Mode Badge if Gemini key is unconfigured */}
          {isDemoMode && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(217, 183, 122, 0.12)',
                border: '1px solid rgba(217, 183, 122, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                color: 'var(--accent-gold)',
                fontSize: '0.72rem',
                fontWeight: 600,
                backdropFilter: 'blur(12px)',
              }}
            >
              <Sparkles size={11} />
              Demo Simulation Mode
            </span>
          )}

          {/* Screen Share Active Badge */}
          {isScreenSharing && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                color: '#4ADE80',
                fontSize: '0.72rem',
                fontWeight: 600,
                backdropFilter: 'blur(12px)',
              }}
            >
              <Monitor size={12} />
              Screen Sharing Active
            </span>
          )}

          {/* Proctoring Status Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: warningCount > 0 ? 'rgba(239, 68, 68, 0.22)' : 'rgba(56, 189, 248, 0.12)',
              border: warningCount > 0 ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(56, 189, 248, 0.28)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              color: warningCount > 0 ? '#EF4444' : '#38BDF8',
              fontSize: '0.74rem',
              fontWeight: 700,
              backdropFilter: 'blur(12px)',
              boxShadow: warningCount > 0 ? '0 0 10px rgba(239, 68, 68, 0.35)' : 'none',
              animation: warningCount > 0 ? 'pulseGlow 2s infinite' : 'none',
            }}
          >
            {warningCount > 0 ? (
              <ShieldAlert size={14} color="#EF4444" />
            ) : (
              <ShieldCheck size={13} color="#38BDF8" />
            )}
            <span>
              {warningCount > 0 ? `⚠️ Proctoring: Warning ${warningCount}/3` : 'Proctoring Active'}
            </span>
          </span>

          {/* Adaptive Difficulty Engine Live HUD */}
          <div
            title={`Adaptive Engine: ${adaptiveState.note}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor:
                adaptiveState.level === 3
                  ? 'rgba(217, 183, 122, 0.18)'
                  : adaptiveState.level === 1
                  ? 'rgba(56, 189, 248, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)',
              border:
                adaptiveState.level === 3
                  ? '1px solid rgba(217, 183, 122, 0.5)'
                  : adaptiveState.level === 1
                  ? '1px solid rgba(56, 189, 248, 0.4)'
                  : '1px solid rgba(16, 185, 129, 0.4)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              color:
                adaptiveState.level === 3
                  ? 'var(--accent-gold)'
                  : adaptiveState.level === 1
                  ? '#38BDF8'
                  : '#10B981',
              fontSize: '0.72rem',
              fontWeight: 700,
              backdropFilter: 'blur(12px)',
              cursor: 'help',
            }}
          >
            <Zap size={12} fill="currentColor" />
            <span>Adaptive Engine: {adaptiveState.levelName}</span>
            {adaptiveState.action === 'escalate' && (
              <span style={{ fontSize: '0.62rem', background: 'rgba(217, 183, 122, 0.3)', padding: '1px 5px', borderRadius: '4px' }}>
                ▲ Escalated
              </span>
            )}
            {adaptiveState.action === 'scaffold' && (
              <span style={{ fontSize: '0.62rem', background: 'rgba(56, 189, 248, 0.3)', padding: '1px 5px', borderRadius: '4px' }}>
                ▼ Scaffolding
              </span>
            )}
          </div>
        </div>


        {/* Right: Interviewer Badge & Quick Exit Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Interviewer Identity Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'rgba(10, 12, 16, 0.75)',
              border: isInterviewerSpeaking ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              transition: 'border-color 0.3s ease',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: isInterviewerSpeaking ? 'var(--accent-gold)' : 'rgba(217, 183, 122, 0.2)',
                color: isInterviewerSpeaking ? '#080808' : 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {interviewerName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.1 }}>
                {interviewerName}
              </div>
              <div style={{ fontSize: '0.68rem', color: isInterviewerSpeaking ? 'var(--accent-gold)' : 'var(--text-tertiary)' }}>
                {isInterviewerSpeaking ? 'Speaking...' : interviewerTitle}
              </div>
            </div>

            {/* Speaking audio wave micro-indicator */}
            {isInterviewerSpeaking && (
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '14px', marginLeft: '4px' }}>
                {[12, 20, 14, 24, 16].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '2px',
                      height: `${h}px`,
                      backgroundColor: 'var(--accent-gold)',
                      borderRadius: '1px',
                      animation: 'speechWave 0.6s ease-in-out infinite alternate',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* End Interview button */}
          <button
            type="button"
            onClick={() => setConfirmEndModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.borderColor = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
            }}
          >
            <PhoneOff size={14} />
            <span>End Interview</span>
          </button>
        </div>
      </header>

      {/* Proctoring Warning Notification Banner */}
      {activeWarning && (
        <div
          id="proctoring-warning-toast"
          style={{
            position: 'fixed',
            top: '5.2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'rgba(20, 8, 8, 0.97)',
            border: '2px solid #EF4444',
            boxShadow: '0 16px 48px rgba(239, 68, 68, 0.5), 0 0 24px rgba(239, 68, 68, 0.25)',
            backdropFilter: 'blur(20px)',
            padding: '1rem 1.6rem',
            borderRadius: '16px',
            color: '#FFFFFF',
            maxWidth: '92vw',
            animation: 'fadeInSlideDown 0.3s ease-out',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(239, 68, 68, 0.45)',
          }}>
            <AlertTriangle size={24} color="#EF4444" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>PROCTORING WARNING</span>
              <span style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                {activeWarning.count}/{activeWarning.max || 3}
              </span>
              {activeWarning.count === 2 && (
                <span style={{
                  color: '#FCD34D',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '6px',
                }}>
                  FINAL WARNING BEFORE TERMINATION
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.86rem', color: '#F1F5F9', marginTop: '4px', fontWeight: 600 }}>
              {activeWarning.message || 'Window blur or tab switch detected. Please remain focused on the interview room.'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '3px' }}>
              {activeWarning.count >= (activeWarning.max || 3)
                ? 'Maximum violations reached. Interview session will terminate immediately.'
                : 'Notice: A total of 3 warnings will terminate and end this interview session.'}
            </div>
          </div>
          <button
            onClick={() => setActiveWarning(null)}
            style={{
              marginLeft: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid #EF4444',
              color: '#FFFFFF',
              padding: '0.45rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'; }}
          >
            I Understand
          </button>
        </div>
      )}

      {/* =========================================================================
          LAYER 3: TOP-LEFT FLOATING SPEECH BUBBLE (MATCHING REFERENCE IMAGE)
          ========================================================================= */}
      <div
        id="interview-question-bubble"
        style={{
          position: 'absolute',
          top: 'clamp(4.8rem, 10vh, 6.2rem)',
          left: 'clamp(1.5rem, 4.5vw, 4.5rem)',
          zIndex: 22,
          maxWidth: isQuestionCollapsed ? '320px' : 'clamp(360px, 32vw, 480px)',
          width: '90%',
          backgroundColor: 'rgba(16, 26, 44, 0.82)',
          border: '1.5px solid rgba(56, 189, 248, 0.55)',
          borderRadius: '16px',
          padding: '0.9rem 1.35rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.65), 0 0 25px rgba(56, 189, 248, 0.28), inset 0 0 16px rgba(56, 189, 248, 0.1)',
          animation: 'speechBubbleGlow 4s ease-in-out infinite, fadeInSlideDown 0.4s ease',
          pointerEvents: 'auto',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Speech Bubble Header: Question index, Role Selector & Audio replay */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isQuestionCollapsed ? 0 : '0.65rem',
            borderBottom: isQuestionCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: isQuestionCollapsed ? 0 : '0.45rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={11} />
              Question {questionIndex} of {totalQuestions}
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.7rem' }}>•</span>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                id="interview-role-select"
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '6px',
                  padding: '0.18rem 1.4rem 0.18rem 0.5rem',
                  color: '#BAE6FD',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                title="Choose job role to test"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r} style={{ backgroundColor: '#0B1220', color: '#FFFFFF' }}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                style={{
                  position: 'absolute',
                  right: '5px',
                  color: '#38BDF8',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {/* Replay Question Audio Button */}
            <button
              type="button"
              onClick={() => speakText(currentQuestionText || 'Tell me about a time you led a project.')}
              title="Listen to question again"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                color: isInterviewerSpeaking ? '#38BDF8' : 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.68rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Volume2 size={12} />
              <span>{isInterviewerSpeaking ? 'Speaking...' : 'Replay'}</span>
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsQuestionCollapsed(!isQuestionCollapsed)}
              title={isQuestionCollapsed ? 'Expand Question' : 'Minimize Question'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '0.2rem 0.4rem',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
              }}
            >
              {isQuestionCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>
        </div>

        {/* Current Question Text (Bold Uppercase matching Reference Image) */}
        {!isQuestionCollapsed && (
          <div
            style={{
              fontSize: 'clamp(0.92rem, 1.2vw, 1.12rem)',
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#FFFFFF',
              letterSpacing: '0.035em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {currentQuestionText ? currentQuestionText.toUpperCase() : 'TELL ME ABOUT A TIME YOU LED A PROJECT.'}
          </div>
        )}

        {/* Real-time Answer Evaluation & Marks Badge */}
        {!isQuestionCollapsed && lastEvaluatedTurn && (
          <div
            style={{
              marginTop: '0.65rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: lastEvaluatedTurn.score >= 70 ? 'rgba(34, 197, 94, 0.12)' : lastEvaluatedTurn.score >= 35 ? 'rgba(234, 179, 8, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${lastEvaluatedTurn.score >= 70 ? 'rgba(34, 197, 94, 0.35)' : lastEvaluatedTurn.score >= 35 ? 'rgba(234, 179, 8, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem' }}>
              <CheckCircle2 size={13} color={lastEvaluatedTurn.score >= 70 ? '#4ADE80' : lastEvaluatedTurn.score >= 35 ? '#FACC15' : '#F87171'} />
              <span style={{ color: '#E2E8F0' }}>Previous Answer Checked:</span>
              <strong style={{ color: lastEvaluatedTurn.score >= 70 ? '#4ADE80' : lastEvaluatedTurn.score >= 35 ? '#FACC15' : '#F87171' }}>
                {lastEvaluatedTurn.score}/100 Marks ({lastEvaluatedTurn.status})
              </strong>
            </div>
            {lastEvaluatedTurn.feedback && (
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'none' }}>
                {lastEvaluatedTurn.feedback.slice(0, 75)}{lastEvaluatedTurn.feedback.length > 75 ? '...' : ''}
              </span>
            )}
          </div>
        )}

        {/* Subtle Progress Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (questionIndex / totalQuestions) * 100)}%`,
              background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Attentive Listening Indicator below Speech Bubble */}
      {isCandidateSpeaking && (
        <div
          style={{
            position: 'absolute',
            top: 'clamp(11.5rem, 21vh, 13.5rem)',
            left: 'clamp(1.5rem, 4.5vw, 4.5rem)',
            zIndex: 22,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.45rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(10, 14, 20, 0.85)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.2)',
            animation: 'fadeIn 0.2s ease',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              boxShadow: '0 0 8px #22C55E',
            }}
          />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4ADE80' }}>
            {interviewerName} is listening attentively...
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '12px', marginLeft: '3px' }}>
            {[10, 18, 24, 14, 20, 12].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '2px',
                  height: `${Math.max(3, Math.round((h * micVolume) / 50))}px`,
                  backgroundColor: '#4ADE80',
                  borderRadius: '1px',
                  transition: 'height 0.08s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          LAYER 4: DESK PROPS & CODING LAPTOP (MATCHING REFERENCE IMAGE)
          ========================================================================= */}
      {/* 4A. Left Desk: Acrylic Vertical Resume Stand & Printed Resume Sheets */}
      <div
        onClick={() => setShowDeskResume(true)}
        title="Click to view candidate's printed resume"
        style={{
          position: 'absolute',
          bottom: 'clamp(4.2rem, 9vh, 7.5rem)',
          left: 'clamp(1rem, 3.5vw, 3.8rem)',
          zIndex: 16,
          width: 'clamp(120px, 13vw, 175px)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          perspective: '900px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
          e.currentTarget.style.filter = 'drop-shadow(0 14px 28px rgba(56, 189, 248, 0.35))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.filter = 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6))';
        }}
      >
        {/* Upright Transparent Acrylic Frame */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            borderRadius: '6px',
            padding: '0.6rem 0.65rem',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45), inset 0 0 10px rgba(255, 255, 255, 0.9)',
            color: '#1E293B',
            transform: 'rotateY(4deg)',
          }}
        >
          {/* Resume Header with Candidate Avatar Photo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '0.35rem',
              marginBottom: '0.35rem',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.62rem',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0) : 'C'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '0.65rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                Resume
              </div>
              <div style={{ fontSize: '0.5rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Applicant Profile'}
              </div>
            </div>
          </div>

          {/* Mini Resume Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.52rem' }}>
            <div style={{ fontWeight: 700, color: '#0284C7', fontSize: '0.52rem', textTransform: 'uppercase' }}>
              Experience
            </div>
            <div style={{ color: '#334155', lineHeight: 1.2 }}>
              • {targetRole} ({experienceLevel})
            </div>
            <div style={{ color: '#64748B', lineHeight: 1.2 }}>
              • Systems architecture & scaling
            </div>

            <div style={{ fontWeight: 700, color: '#0284C7', fontSize: '0.52rem', textTransform: 'uppercase', marginTop: '2px' }}>
              Skills
            </div>
            <div style={{ color: '#475569', lineHeight: 1.2 }}>
              React · Node · Python · DSA
            </div>
          </div>

          <div
            style={{
              marginTop: '0.45rem',
              paddingTop: '0.25rem',
              borderTop: '1px dashed #CBD5E1',
              textAlign: 'center',
              fontSize: '0.48rem',
              fontWeight: 700,
              color: '#0284C7',
            }}
          >
            Click to View Resume ↗
          </div>
        </div>

        {/* Clear Acrylic Stand Foot on Desk */}
        <div
          style={{
            width: '108%',
            height: '7px',
            marginLeft: '-4%',
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            borderRadius: '2px 2px 4px 4px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.35)',
          }}
        />

        {/* Flat Printed Resume Sheets Lying on Desk */}
        <div
          style={{
            marginTop: '8px',
            width: '95px',
            height: '42px',
            backgroundColor: '#F8FAFC',
            borderRadius: '2px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            padding: '4px',
            transform: 'rotate(-4deg)',
          }}
        >
          <div style={{ width: '40px', height: '3px', backgroundColor: '#94A3B8', marginBottom: '2px' }} />
          <div style={{ width: '70px', height: '2px', backgroundColor: '#CBD5E1', marginBottom: '2px' }} />
          <div style={{ width: '55px', height: '2px', backgroundColor: '#CBD5E1' }} />
        </div>
      </div>

      {/* 4D. Candidate POV Hands in Foreground */}
      <CandidatePOVHands isCandidateSpeaking={isCandidateSpeaking} />

      {/* 4E. Live Coding Laptop on Right Desk */}
      <DeskCodingLaptop
        timer={formatTimer(secondsElapsed)}
        isExpanded={laptopExpanded}
        onToggleExpand={() => setLaptopExpanded(!laptopExpanded)}
        currentQuestion={currentQuestionObj}
      />

      {/* =========================================================================
          LAYER 5: CANDIDATE PIP WEBCAM FEED (FLOATING & DRAGGABLE)
          ========================================================================= */}
      <div
        ref={pipContainerRef}
        id="candidate-pip-window"
        style={{
          position: 'absolute',
          ...(pipPosition.x !== null ? {
            left: `${pipPosition.x}px`,
            top: `${pipPosition.y}px`,
          } : {
            top: 'clamp(4.8rem, 10vh, 6.2rem)',
            right: 'clamp(1.5rem, 4vw, 4rem)',
          }),
          zIndex: 25,
          width: pipMinimized
            ? '175px'
            : pipSize === 'compact'
              ? '230px'
              : pipSize === 'expanded'
                ? '370px'
                : '295px',
          backgroundColor: '#090C12',
          borderRadius: '16px',
          border: isCandidateSpeaking
            ? '2px solid rgba(34, 197, 94, 0.85)'
            : '1px solid rgba(255, 255, 255, 0.16)',
          overflow: 'hidden',
          boxShadow: isCandidateSpeaking
            ? '0 0 24px rgba(34, 197, 94, 0.35), 0 16px 40px rgba(0, 0, 0, 0.75)'
            : '0 16px 40px rgba(0, 0, 0, 0.75)',
          transition: isDraggingPip ? 'none' : 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border 0.2s ease',
          userSelect: 'none',
        }}
      >
        {/* PIP Header Bar (Drag Handle & Quick Controls) */}
        <div
          onMouseDown={handlePipMouseDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            backgroundColor: 'rgba(7, 10, 16, 0.94)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: isDraggingPip ? 'grabbing' : 'grab',
          }}
        >
          {/* Status Dot, Label & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isCameraOff ? '#EF4444' : '#22C55E',
                boxShadow: isCameraOff ? '0 0 6px rgba(239, 68, 68, 0.6)' : '0 0 8px #22C55E',
              }}
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>
              {user?.name ? `${user.name.split(' ')[0]} (You)` : 'You (Candidate)'}
            </span>
            <span
              style={{
                fontSize: '0.58rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: isCameraOff ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                color: isCameraOff ? '#F87171' : '#4ADE80',
                border: `1px solid ${isCameraOff ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
              }}
            >
              {isCameraOff ? 'CAM OFF' : 'LIVE'}
            </span>
          </div>

          {/* Quick Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Camera Quick Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
              style={{
                background: isCameraOff ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${isCameraOff ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '5px',
                color: isCameraOff ? '#EF4444' : '#E2E8F0',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isCameraOff ? <CameraOff size={11} /> : <Camera size={11} />}
            </button>

            {/* Mic Quick Toggle */}
            <button
              type="button"
              onClick={toggleMicrophone}
              title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              style={{
                background: isMicMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${isMicMuted ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '5px',
                color: isMicMuted ? '#EF4444' : '#E2E8F0',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isMicMuted ? <MicOff size={11} /> : <Mic size={11} />}
            </button>

            {/* Size Toggle (S / M / L) */}
            {!pipMinimized && (
              <button
                type="button"
                onClick={() => {
                  setPipSize(curr => curr === 'compact' ? 'normal' : curr === 'normal' ? 'expanded' : 'compact');
                }}
                title={`Window size: ${pipSize}. Click to resize`}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '5px',
                  color: 'var(--accent-gold)',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                }}
              >
                {pipSize === 'compact' ? 'S' : pipSize === 'normal' ? 'M' : 'L'}
              </button>
            )}

            {/* Minimize / Expand Toggle */}
            <button
              type="button"
              onClick={() => setPipMinimized(!pipMinimized)}
              title={pipMinimized ? 'Restore window' : 'Minimize window'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '5px',
                color: '#E2E8F0',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {pipMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        {!pipMinimized && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#04060A',
              overflow: 'hidden',
            }}
          >
            {/* Live Mirrored Webcam Video Feed */}
            <video
              ref={candidateVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirrored view like standard video calls
                display: isCameraOff ? 'none' : 'block',
              }}
            />

            {/* Live Computer Vision Gaze Tracker HUD Badge */}
            <VisionStatusBadge
              isModelReady={visionCV.isModelReady}
              isModelLoading={visionCV.isModelLoading}
              faceDetected={visionCV.faceDetected}
              faceCount={visionCV.faceCount}
              phoneDetected={visionCV.phoneDetected}
              direction={visionCV.direction}
              expression={visionCV.expression}
              activeTip={visionCV.activeTip}
              lighting={visionCV.lighting}
              isCameraOff={isCameraOff}
            />

            {/* Camera Off Placeholder Screen */}
            {isCameraOff && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(8, 11, 19, 0.98))',
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <CameraOff size={18} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Camera is Paused
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#94A3B8', marginTop: '1px' }}>
                    Click below to start video stream
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleCamera}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    borderRadius: '7px',
                    backgroundColor: 'var(--accent-gold)',
                    border: 'none',
                    color: '#080808',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(217, 183, 122, 0.35)',
                    marginTop: '2px',
                  }}
                >
                  <Camera size={12} />
                  <span>Turn On Camera</span>
                </button>
              </div>
            )}

            {/* Audio Volume Bar at Bottom of Video */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${isMicMuted ? 0 : micVolume}%`,
                  backgroundColor: micVolume > 50 ? '#22C55E' : 'var(--accent-gold)',
                  boxShadow: micVolume > 20 ? '0 0 6px rgba(34, 197, 94, 0.8)' : 'none',
                  transition: 'width 0.08s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Telemetry Bar (Collapsible, placed neatly below video so face is never blocked) */}
        {!pipMinimized && (
          <div
            style={{
              padding: '7px 10px',
              backgroundColor: 'rgba(6, 8, 14, 0.96)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.64rem', color: '#E2E8F0' }}>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isCameraOff
                      ? '#9CA3AF'
                      : visionCV.faceDetected
                      ? visionCV.direction === 'camera_facing'
                        ? '#22C55E'
                        : '#F59E0B'
                      : telemetryHud.gazeDirection === 'center'
                        ? '#22C55E'
                        : '#F59E0B',
                    boxShadow: isCameraOff
                      ? 'none'
                      : (visionCV.faceDetected ? visionCV.direction === 'camera_facing' : telemetryHud.gazeDirection === 'center')
                        ? '0 0 6px #22C55E'
                        : '0 0 6px #F59E0B',
                  }}
                />
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {isCameraOff
                    ? 'Vision: Paused'
                    : !visionCV.faceDetected
                    ? (telemetryHud.gaze || 'Looking for face...')
                    : visionCV.direction === 'camera_facing'
                    ? 'Looking at screen'
                    : visionCV.direction === 'looking_left'
                    ? 'Looking left'
                    : visionCV.direction === 'looking_right'
                    ? 'Looking right'
                    : visionCV.direction === 'looking_up'
                    ? 'Looking up'
                    : visionCV.direction === 'looking_down'
                    ? 'Looking down'
                    : 'Looking away'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor:
                      telemetryHud.anxietyState === 'Elevated Anxiety'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : telemetryHud.anxietyState === 'Mild Nervousness'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(34, 197, 94, 0.2)',
                    color:
                      telemetryHud.anxietyState === 'Elevated Anxiety'
                        ? '#F87171'
                        : telemetryHud.anxietyState === 'Mild Nervousness'
                          ? '#FBBF24'
                          : '#4ADE80',
                    border: `1px solid ${
                      telemetryHud.anxietyState === 'Elevated Anxiety'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : telemetryHud.anxietyState === 'Mild Nervousness'
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(34, 197, 94, 0.3)'
                    }`,
                  }}
                >
                  {isCameraOff ? 'Vision Off' : (telemetryHud.anxietyState || 'Calm')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowPipTelemetry(!showPipTelemetry)}
                title={showPipTelemetry ? 'Hide detailed metrics' : 'Show live vision & composure metrics'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.62rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                <span>{showPipTelemetry ? 'Less' : 'Vision HUD'}</span>
                {showPipTelemetry ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>

            {showPipTelemetry && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.62rem',
                }}
              >
                {/* Gaze Direction */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8' }}>Gaze Direction:</span>
                  <span style={{ color: 'var(--accent-champagne)', fontWeight: 700 }}>
                    {isCameraOff
                      ? 'Cam Off'
                      : !visionCV.faceDetected
                      ? (telemetryHud.gaze || 'Searching')
                      : visionCV.direction === 'camera_facing'
                      ? 'Looking at screen'
                      : visionCV.direction === 'looking_left'
                      ? 'Looking left'
                      : visionCV.direction === 'looking_right'
                      ? 'Looking right'
                      : visionCV.direction === 'looking_up'
                      ? 'Looking up'
                      : visionCV.direction === 'looking_down'
                      ? 'Looking down'
                      : 'Looking away'}
                  </span>
                </div>

                {/* Head Pose & Lighting */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8' }}>Head / Lighting:</span>
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
                    {isCameraOff ? 'N/A' : `Yaw: ${visionCV.headPose?.yaw || 0}° • ${visionCV.lighting === 'low_light' ? 'Low Light' : 'Optimal'}`}
                  </span>
                </div>

                {/* Composure & Anxiety */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8' }}>Composure Index:</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        telemetryHud.anxietyState === 'Elevated Anxiety'
                          ? '#EF4444'
                          : telemetryHud.anxietyState === 'Mild Nervousness'
                            ? '#F59E0B'
                            : '#22C55E',
                    }}
                  >
                    {isCameraOff ? 'N/A' : `${telemetryHud.anxietyScore || 88}/100 (${telemetryHud.anxietyState})`}
                  </span>
                </div>

                {/* Restlessness & Fidgeting */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8' }}>Fidget / Restlessness:</span>
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
                    {isCameraOff ? 'N/A' : (telemetryHud.fidgetLevel || 'Low (Steady)')}
                  </span>
                </div>

                {/* Speech & Cadence */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8' }}>Speech Cadence:</span>
                  <span style={{ color: '#4ADE80', fontWeight: 600 }}>
                    {isMicMuted ? 'Muted' : `${telemetryHud.wpm || 138} WPM (${telemetryHud.fillerCount || 0} fillers)`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          LAYER 6: CANDIDATE ANSWERING FIELD & COMPACT CONTROL BAR (BOTTOM ANCHORED)
          ========================================================================= */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: '0 2rem 1.15rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
          pointerEvents: 'none',
        }}
      >
        {/* Candidate Live Voice-to-Text & Response Input Console */}
        <div
          style={{
            maxWidth: '820px',
            width: '100%',
            backgroundColor: 'rgba(9, 12, 19, 0.95)',
            border: !isMicMuted
              ? '1px solid rgba(217, 183, 122, 0.45)'
              : '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '18px',
            padding: '0.75rem 1rem 0.65rem 1rem',
            backdropFilter: 'blur(24px)',
            boxShadow: !isMicMuted
              ? '0 12px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(217, 183, 122, 0.15)'
              : '0 12px 36px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
            pointerEvents: 'auto',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {/* Top Voice Telemetry & Status Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              paddingBottom: '0.45rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.76rem',
            }}
          >
            {/* Left: Active Voice / Speaker Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {isInterviewerSpeaking ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#60A5FA',
                    fontWeight: 600,
                  }}
                >
                  <Volume2 size={14} />
                  <span>Interviewer is speaking... Listen carefully.</span>
                </div>
              ) : speech.micState === 'requesting_permission' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#FBBF24',
                    fontWeight: 600,
                  }}
                >
                  <Loader2 size={13} className="spin" />
                  <span>Requesting microphone permission...</span>
                </div>
              ) : speech.micState === 'submitting' || speech.micState === 'analyzing' || isSubmittingAnswer ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#A78BFA',
                    fontWeight: 600,
                  }}
                >
                  <Loader2 size={13} className="spin" />
                  <span>Evaluating answer with AI Interviewer...</span>
                </div>
              ) : speech.isListening ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.16)',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      padding: '2px 9px',
                      borderRadius: '9999px',
                      color: '#F87171',
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        boxShadow: '0 0 10px #EF4444',
                        animation: 'pulse 1s infinite',
                      }}
                    />
                    <span>Recording ({speech.recordingDurationFormatted}) · Listening...</span>
                  </div>

                  {/* Dynamic Equalizer Bars */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2.5px',
                      height: '16px',
                      padding: '0 4px',
                    }}
                    title={`Microphone Volume: ${speech.volume}%`}
                  >
                    {[0.6, 1.0, 1.4, 0.8, 1.2, 0.9, 1.5, 0.7].map((factor, idx) => {
                      const computedHeight = Math.max(
                        3,
                        Math.min(16, Math.round((speech.volume / 100) * 16 * factor))
                      );
                      return (
                        <div
                          key={idx}
                          style={{
                            width: '2.5px',
                            height: `${computedHeight}px`,
                            borderRadius: '1px',
                            backgroundColor:
                              speech.volume > 15
                                ? '#22C55E'
                                : 'rgba(217, 183, 122, 0.7)',
                            transition: 'height 0.08s ease',
                          }}
                        />
                      );
                    })}
                  </div>

                  {speech.isCandidateSpeaking && (
                    <span
                      style={{
                        color: '#FBBF24',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                      }}
                    >
                      Hearing your voice...
                    </span>
                  )}
                </div>
              ) : speech.micState === 'processing' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#38BDF8',
                    fontWeight: 600,
                  }}
                >
                  <Loader2 size={13} className="spin" />
                  <span>Finalizing speech transcript...</span>
                </div>
              ) : speech.micState === 'transcript_ready' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'rgba(34, 197, 94, 0.16)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      color: '#4ADE80',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Transcript Ready · Click Send or Speak More</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'rgba(239, 68, 68, 0.16)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      color: '#F87171',
                      fontWeight: 700,
                    }}
                  >
                    <MicOff size={12} />
                    <span>Mic Paused</span>
                  </div>
                  <button
                    type="button"
                    onClick={speech.startRecording}
                    style={{
                      background: 'rgba(217, 183, 122, 0.15)',
                      border: '1px solid rgba(217, 183, 122, 0.35)',
                      color: '#E5C478',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Start Speaking (Mic)
                  </button>
                </div>
              )}
            </div>

            {/* Right: Word Count & Speech Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                {candidateAnswer.trim()
                  ? `${candidateAnswer.trim().split(/\s+/).length} words spoken`
                  : '0 words'}
              </span>

              {/* Speech Language Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '1px',
                }}
              >
                {[
                  { code: 'en-IN', label: 'EN (IN)' },
                  { code: 'en-US', label: 'EN (US)' },
                  { code: 'hi-IN', label: 'HI (हिंदी)' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSwitchLanguage(l.code)}
                    title={`Speech recognition language: ${l.label}`}
                    style={{
                      background:
                        selectedSpeechLang === l.code
                          ? 'rgba(217, 183, 122, 0.25)'
                          : 'transparent',
                      border: 'none',
                      color:
                        selectedSpeechLang === l.code ? '#F2D795' : '#94A3B8',
                      fontSize: '0.65rem',
                      fontWeight: selectedSpeechLang === l.code ? 700 : 500,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permission / Device Warning Banner */}
          {(speech.error || micPermissionError) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.74rem',
                color: '#FCA5A5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} color="#EF4444" />
                <span>{speech.error || micPermissionError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMicPermissionError(null);
                  speech.startRecording();
                }}
                style={{
                  backgroundColor: '#EF4444',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Allow Mic Access
              </button>
            </div>
          )}

          {/* Speech Service Latency / Network Fallback Notice */}
          {speech.isNetworkRestricted && !candidateAnswer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                borderRadius: '8px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.72rem',
                color: '#FDE047',
              }}
            >
              <span>🎙️ Browser cloud speech service latency detected. Audio is recorded directly; you can also type your answer anytime.</span>
            </div>
          )}

          {/* Response Textarea (Auto-syncs with speech recognition & manual edits) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <textarea
              id="candidate-answer-input"
              ref={textareaRef}
              rows={2}
              placeholder={
                speech.isListening
                  ? '🎙️ Listening... Speak naturally into your microphone. Words will appear here in real-time. (You can also type or edit anytime)'
                  : 'Microphone is paused. Click "Start Speaking (Mic)" or type your response here...'
              }
              value={candidateAnswer}
              onChange={(e) => {
                setCandidateAnswer(e.target.value);
                speech.setManualTranscript(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              disabled={isSubmittingAnswer}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.94rem',
                lineHeight: 1.45,
                outline: 'none',
                resize: 'none',
                padding: '0.2rem 0',
                fontFamily: 'inherit',
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />

            {/* Live Interim Speech Preview */}
            {speech.interimTranscript && (
              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'rgba(217, 183, 122, 0.9)',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  paddingTop: '2px',
                }}
              >
                <Radio size={11} color="#E5C478" />
                <span>Transcribing: "{speech.interimTranscript}..."</span>
              </div>
            )}
          </div>

          {/* Action Row inside Console: Quick Mic, Clear Voice, Submit Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.35rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Left Controls: Mic toggle & Clear Answer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={speech.toggleRecording}
                title={speech.isListening ? 'Stop microphone recording' : 'Start microphone recording'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: speech.isListening
                    ? 'rgba(239, 68, 68, 0.16)'
                    : 'rgba(34, 197, 94, 0.14)',
                  border: speech.isListening
                    ? '1px solid rgba(239, 68, 68, 0.45)'
                    : '1px solid rgba(34, 197, 94, 0.4)',
                  color: speech.isListening ? '#F87171' : '#4ADE80',
                  borderRadius: '8px',
                  padding: '4px 11px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {speech.isListening ? (
                  <>
                    <Square size={11} fill="#EF4444" />
                    <span>Stop Recording ({speech.recordingDurationFormatted})</span>
                  </>
                ) : (
                  <>
                    <Mic size={13} />
                    <span>Start Speaking (Mic)</span>
                  </>
                )}
              </button>

              {candidateAnswer.trim() && (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  title="Clear transcribed answer and speak again"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94A3B8',
                    borderRadius: '8px',
                    padding: '4px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                  <span>Clear & Re-speak</span>
                </button>
              )}

              <span style={{ fontSize: '0.7rem', color: '#64748B', marginLeft: '4px' }}>
                Press Enter ↵ to send (Shift+Enter for newline)
              </span>
            </div>

            {/* Right: Submit Button */}
            <button
              id="send-answer-btn"
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!candidateAnswer.trim() || isSubmittingAnswer}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.48rem 1.35rem',
                borderRadius: '10px',
                backgroundColor: candidateAnswer.trim()
                  ? 'var(--accent-gold)'
                  : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: candidateAnswer.trim() ? '#080808' : 'var(--text-tertiary)',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: candidateAnswer.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                boxShadow: candidateAnswer.trim()
                  ? '0 4px 16px rgba(217, 183, 122, 0.35)'
                  : 'none',
                flexShrink: 0,
              }}
            >
              {isSubmittingAnswer ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Send Answer</span>
                  <Send size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compact Bottom Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(8, 10, 15, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '9999px',
            padding: '0.45rem 1.25rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
          }}
        >
          {/* 1. Mic Mute / Unmute */}
          <button
            type="button"
            onClick={toggleMicrophone}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isMicMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isMicMuted ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isMicMuted ? '#EF4444' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* 2. Camera On / Off */}
          <button
            type="button"
            onClick={toggleCamera}
            title={isCameraOff ? 'Start Camera' : 'Stop Camera'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isCameraOff ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isCameraOff ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isCameraOff ? '#EF4444' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isCameraOff ? <CameraOff size={18} /> : <Camera size={18} />}
          </button>

          {/* 3. Screen Sharing */}
          <button
            type="button"
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isScreenSharing ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isScreenSharing ? '1px solid #22C55E' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isScreenSharing ? '#4ADE80' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isScreenSharing ? <Monitor size={18} /> : <MonitorOff size={18} />}
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

          {/* 4. Live Session Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0 0.5rem',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                animation: 'pulseGlow 1.8s infinite',
              }}
            />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

          {/* 5. Notes Drawer Button */}
          <button
            type="button"
            onClick={() => setNotesDrawerOpen(!notesDrawerOpen)}
            title="Open Notes Pad"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: notesDrawerOpen ? 'rgba(217, 183, 122, 0.18)' : 'transparent',
              border: notesDrawerOpen ? '1px solid var(--accent-gold)' : '1px solid transparent',
              color: notesDrawerOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Edit3 size={15} />
            <span>Notes</span>
          </button>

          {/* 6. Transcript Drawer Button */}
          <button
            type="button"
            onClick={() => setTranscriptDrawerOpen(!transcriptDrawerOpen)}
            title="View Full Interview Transcript"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: transcriptDrawerOpen ? 'rgba(217, 183, 122, 0.18)' : 'transparent',
              border: transcriptDrawerOpen ? '1px solid var(--accent-gold)' : '1px solid transparent',
              color: transcriptDrawerOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <MessageSquare size={15} />
            <span>Transcript ({messages.length})</span>
          </button>
        </div>
      </footer>

      {/* =========================================================================
          LAYER 7: SLIDE-OUT NOTES DRAWER
          ========================================================================= */}
      {notesDrawerOpen && (
        <aside
          style={{
            position: 'absolute',
            top: '80px',
            right: '2rem',
            width: '320px',
            backgroundColor: 'rgba(12, 14, 20, 0.94)',
            border: '1px solid rgba(217, 183, 122, 0.3)',
            borderRadius: '16px',
            padding: '1.25rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            zIndex: 40,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Edit3 size={15} color="var(--accent-gold)" />
              Candidate Scratchpad
            </span>
            <button
              onClick={() => setNotesDrawerOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            rows={8}
            placeholder="Jot down architectural notes, algorithmic complexities, STAR points..."
            value={notesContent}
            onChange={(e) => setNotesContent(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#07090E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </aside>
      )}

      {/* =========================================================================
          LAYER 8: SLIDE-OUT TRANSCRIPT DRAWER
          ========================================================================= */}
      {transcriptDrawerOpen && (
        <aside
          style={{
            position: 'absolute',
            top: '80px',
            left: '2rem',
            width: '380px',
            maxHeight: '70vh',
            backgroundColor: 'rgba(12, 14, 20, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '1.25rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={15} color="var(--accent-gold)" />
              Live Interview Log
            </span>
            <button
              onClick={() => setTranscriptDrawerOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            ref={transcriptScrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              paddingRight: '0.4rem',
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: m.role === 'interviewer' ? 'rgba(217, 183, 122, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: m.role === 'interviewer' ? '1px solid rgba(217, 183, 122, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: m.role === 'interviewer' ? 'var(--accent-gold)' : '#38BDF8', marginBottom: '3px' }}>
                  {m.role === 'interviewer' ? interviewerName : 'You (Candidate)'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFFFFF', lineHeight: 1.45 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* =========================================================================
          LAYER 8.5: INTERACTIVE DESK RESUME INSPECTOR MODAL
          ========================================================================= */}
      {showDeskResume && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowDeskResume(false)}
        >
          <div
            style={{
              backgroundColor: '#0E131F',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(56, 189, 248, 0.15)',
              color: '#F1F5F9',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {user?.name ? user.name.charAt(0) : 'C'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                    {user?.name || 'Candidate Resume'}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#38BDF8', fontWeight: 600 }}>
                    {targetRole} · {experienceLevel} · Applying to {targetCompany}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeskResume(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Resume Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                Professional Summary
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                Results-driven {targetRole} with a strong foundation in scalable distributed systems, algorithms, and full-stack architecture. Demonstrated track record delivering high-impact solutions, collaborating across cross-functional engineering teams, and optimizing production latency.
              </p>
            </div>

            {/* Core Competencies */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
                Technical Competencies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['Python', 'JavaScript (ES6+)', 'React / Next.js', 'Node.js', 'Data Structures & Algorithms', 'System Architecture', 'PostgreSQL / MongoDB', 'Docker / Kubernetes', 'REST / GraphQL APIs'].map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#E0F2FE',
                      fontSize: '0.76rem',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
                Relevant Experience
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>Lead Software Engineer — High Scale Cloud Tech</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>2022 – Present</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <li>Designed and executed high-throughput data processing services handling over 100K queries/second.</li>
                  <li>Spearheaded architectural refactoring that cut API response latency by 38% and reduced operational costs.</li>
                </ul>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>Software Engineer — Enterprise Systems</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>2020 – 2022</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <li>Built resilient client-facing web applications with interactive state management and automated CI/CD tests.</li>
                  <li>Partnered with product managers and UX designers to deliver enterprise features with 99.98% crash-free sessions.</li>
                </ul>
              </div>
            </div>

            {/* Education */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                Education & Credentials
              </div>
              <div style={{ fontSize: '0.84rem', color: '#CBD5E1' }}>
                <strong>B.S. in Computer Science & Engineering</strong> · Top Tier Technical University
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LAYER 9: CONFIRMATION MODAL TO END INTERVIEW
          ========================================================================= */}
      {confirmEndModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setConfirmEndModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#0D1017',
              border: '1px solid rgba(217, 183, 122, 0.35)',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <PhoneOff size={22} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
              Conclude Mock Interview?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.75rem 0', lineHeight: 1.5 }}>
              Your session answers, technical depth, and communication cadence will be analyzed to generate your comprehensive performance evaluation report.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setConfirmEndModalOpen(false)}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={handleEndInterview}
                style={{
                  padding: '0.7rem 1.6rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-gold)',
                  border: 'none',
                  color: '#080808',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(217, 183, 122, 0.35)',
                }}
              >
                End & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MANDATORY CAMERA & MICROPHONE REQUIREMENT SHIELD
          Interview cannot proceed or start while camera or microphone is off
          ========================================================================= */}
      {(isCameraOff || isMicMuted) && sessionPhase !== 'ending' && sessionPhase !== 'ended' && !terminatedModalData && (
        <div
          id="mandatory-hardware-shield"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(8, 9, 12, 0.93)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#10121A',
              border: '1.5px solid rgba(239, 68, 68, 0.55)',
              borderRadius: '24px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(239, 68, 68, 0.18)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.16)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldAlert size={32} />
            </div>

            <h2
              className="serif-heading"
              style={{
                fontSize: '1.65rem',
                color: '#FFFFFF',
                margin: '0 0 0.75rem 0',
                letterSpacing: '-0.01em',
              }}
            >
              Camera & Microphone Required
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
              Intervista AI proctoring and real-time speech evaluation require active video camera and microphone feeds. <strong>The interview is paused and cannot proceed</strong> until both devices are enabled.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {isCameraOff && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#FCA5A5', fontSize: '0.86rem', fontWeight: 600 }}>
                    <CameraOff size={18} color="#EF4444" />
                    <span>Camera is currently OFF</span>
                  </div>
                  <button
                    onClick={toggleCamera}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent-gold)',
                      border: 'none',
                      color: '#080808',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Turn On Camera
                  </button>
                </div>
              )}

              {isMicMuted && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#FCA5A5', fontSize: '0.86rem', fontWeight: 600 }}>
                    <MicOff size={18} color="#EF4444" />
                    <span>Microphone is currently MUTED / OFF</span>
                  </div>
                  <button
                    onClick={activateMic}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent-gold)',
                      border: 'none',
                      color: '#080808',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Turn On Microphone
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={onExitRoom}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZERO-TOLERANCE MOBILE PHONE IMMEDIATE DISQUALIFICATION RED SCREEN
          ========================================================================= */}
      {terminatedModalData && terminatedModalData.isPhoneViolation && (
        <div
          id="proctoring-phone-red-screen"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            background: 'radial-gradient(circle at 50% 36%, #B91C1C 0%, #881337 38%, #4C0519 72%, #1C0106 100%)',
            zIndex: 9999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'inset 0 0 160px rgba(239, 68, 68, 0.95), inset 0 0 50px rgba(255, 255, 255, 0.25)',
            animation: 'redAlertPulse 2s infinite ease-in-out',
            overflowY: 'auto',
          }}
        >
          {/* Emergency Siren Beacon Icon */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              border: '3px solid #FFFFFF',
              boxShadow: '0 0 50px rgba(255, 255, 255, 0.7), 0 0 100px rgba(239, 68, 68, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '1.5rem',
              animation: 'sirenBeacon 1.8s infinite ease-in-out',
            }}
          >
            <Smartphone size={50} strokeWidth={2.4} />
          </div>

          {/* Pill Tag */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#991B1B',
              padding: '0.4rem 1.3rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
              marginBottom: '1.1rem',
            }}
          >
            🚨 ZERO TOLERANCE • IMMEDIATE DISQUALIFICATION
          </div>

          {/* Main Emergency Headers */}
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4.8vw, 3.4rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 30px rgba(0, 0, 0, 0.85), 0 0 40px rgba(239, 68, 68, 0.9)',
            }}
          >
            INTERVIEW TERMINATED
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)',
              fontWeight: 700,
              color: '#FECDD3',
              maxWidth: '680px',
              margin: '0 0 1.85rem 0',
              lineHeight: 1.5,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
            }}
          >
            Unauthorized mobile phone was detected in view. Your interview has been ended right here.
          </p>

          {/* Incident Dossier Card */}
          <div
            style={{
              backgroundColor: 'rgba(15, 2, 5, 0.8)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(254, 202, 202, 0.45)',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              padding: '1.75rem',
              marginBottom: '2rem',
              textAlign: 'left',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#FDA4AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Violation Detected
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: '3px' }}>
                  Mobile Phone in Camera View
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#FDA4AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Action Enforced
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F87171', marginTop: '3px' }}>
                  Immediate Disqualification
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#FDA4AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Warning Policy
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: '3px' }}>
                  0 Warnings Permitted (Zero Tolerance)
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#FDA4AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Candidate Status
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#EF4444', marginTop: '3px' }}>
                  DISQUALIFIED / REMOVED
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '0.85rem',
                fontSize: '0.84rem',
                color: '#FECDD3',
                lineHeight: 1.5,
              }}
            >
              All video and microphone communication channels were severed immediately upon detection. This disqualification has been logged in your official evaluation record.
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => {
              const termReason = terminatedModalData.reason;
              setTerminatedModalData(null);
              handleEndInterview({ isTerminated: true, terminationReason: termReason, isCheating: true });
            }}
            style={{
              padding: '1.05rem 2.8rem',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: 'none',
              color: '#991B1B',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 255, 255, 0.6)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Acknowledge Disqualification & Exit Room
          </button>
        </div>
      )}

      {/* Proctoring Standard 3-Warnings Terminated Modal (when not a mobile phone violation) */}
      {terminatedModalData && !terminatedModalData.isPhoneViolation && (
        <div
          id="proctoring-terminated-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 4, 4, 0.94)',
            backdropFilter: 'blur(16px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0F0909',
              border: '2px solid #EF4444',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2.5rem 2rem',
              boxShadow: '0 24px 80px rgba(239, 68, 68, 0.4), 0 0 40px rgba(0, 0, 0, 0.9)',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
              }}
            >
              <AlertOctagon size={34} />
            </div>

            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid #EF4444',
              color: '#FCA5A5',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              INTEGRITY POLICY ENFORCED
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: '#FFFFFF' }}>
              Interview Terminated
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#E2E8F0', margin: '0 0 1.25rem 0', lineHeight: 1.55 }}>
              The interview session was automatically terminated because <strong>3 proctoring warnings</strong> were accumulated (e.g. tab switching or multiple persons detected).
            </p>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.75rem',
              fontSize: '0.82rem',
              color: '#F87171',
              textAlign: 'left',
            }}>
              <strong>Reason:</strong> {terminatedModalData.reason}
            </div>

            <button
              type="button"
              onClick={() => {
                const termReason = terminatedModalData.reason;
                setTerminatedModalData(null);
                handleEndInterview({ isTerminated: true, terminationReason: termReason });
              }}
              style={{
                width: '100%',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                backgroundColor: '#EF4444',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.45)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DC2626'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; }}
            >
              Finalize Evaluation & View Report
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          KEYFRAME ANIMATIONS
          ========================================================================= */}
      <style>{`
        @keyframes subtleAmbientDrift {
          0% {
            transform: scale(1.02) translate(0px, 0px);
          }
          100% {
            transform: scale(1.04) translate(-4px, -2px);
          }
        }

        @keyframes fadeInSlideDown {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes speechWave {
          0% { height: 4px; }
          100% { height: 18px; }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 6px #EF4444;
          }
          50% {
            opacity: 0.3;
            box-shadow: none;
          }
        }

        @keyframes redAlertPulse {
          0%, 100% {
            box-shadow: inset 0 0 100px rgba(220, 38, 38, 0.8), inset 0 0 40px rgba(239, 68, 68, 0.85);
          }
          50% {
            box-shadow: inset 0 0 200px rgba(220, 38, 38, 1), inset 0 0 80px rgba(254, 202, 202, 0.95);
          }
        }

        @keyframes sirenBeacon {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.6), 0 0 80px rgba(239, 68, 68, 0.8);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 70px rgba(255, 255, 255, 0.9), 0 0 130px rgba(239, 68, 68, 1);
          }
        }
      `}</style>
    </div>
  );
}
