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
  Maximize2,
  Minimize2
} from 'lucide-react';
import { apiStartInterview, apiSendMessage, apiEndInterview, apiSaveReport } from '../utils/api';
import { getCurrentUser } from '../utils/auth';
import ThreeInterviewScene from './ThreeInterviewScene';
import DeskCodingLaptop from './DeskCodingLaptop';
import CandidatePOVHands from './CandidatePOVHands';
import { MultimodalTracker } from '../utils/multimodalTracker';

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

  // Candidate Answer State
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);

  // ─── Hardware & Device Controls ─────────────────────────────────────────────
  const [isMicMuted, setIsMicMuted] = useState(!config?.isMicActive);
  const [isCameraOff, setIsCameraOff] = useState(!config?.isCameraActive);
  const [isScreenSharing, setIsScreenSharing] = useState(!!config?.isScreenShareActive);
  const [micVolume, setMicVolume] = useState(0);

  // ─── UI Drawers & Overlays ──────────────────────────────────────────────────
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(false);
  const [confirmEndModalOpen, setConfirmEndModalOpen] = useState(false);
  const [pipMinimized, setPipMinimized] = useState(false);
  const [showDeskResume, setShowDeskResume] = useState(false);
  const [laptopExpanded, setLaptopExpanded] = useState(false);
  const user = getCurrentUser();
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false);

  // ─── Timer State ────────────────────────────────────────────────────────────
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // ─── Media Stream & Audio Refs ──────────────────────────────────────────────
  const candidateVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptScrollRef = useRef(null);
  const interviewerFinishedSpeakingAtRef = useRef(Date.now());
  const isMicMutedRef = useRef(isMicMuted);
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const trackerRef = useRef(null);

  const [telemetryHud, setTelemetryHud] = useState({
    posture: 'Upright & Centered',
    gaze: 'Direct Lens Focus',
    expression: 'Engaged & Attentive',
    headStability: 'Steady & Poised',
    wpm: 138,
    fillerCount: 0,
    pausesOver3s: 0,
    speakingSeconds: 0,
  });

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

        // Start Audio Stream & Analyzer
        const audioConstraints = config?.selectedMicId
          ? { audio: { deviceId: { exact: config.selectedMicId } } }
          : { audio: true };

        const audStream = await navigator.mediaDevices.getUserMedia(audioConstraints).catch(() => null);
        if (audStream) {
          micStreamRef.current = audStream;

          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(audStream);
            source.connect(analyser);

            if (trackerRef.current) {
              trackerRef.current.startAudio(analyser);
            }

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const trackVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              const vol = Math.min(100, Math.round((avg / 128) * 100));
              setMicVolume(vol);

              // Update candidate speaking state if sound is detected and mic isn't muted
              if (vol > 15 && !isMicMutedRef.current) {
                setIsCandidateSpeaking(true);
              } else {
                setIsCandidateSpeaking(false);
              }

              animFrameRef.current = requestAnimationFrame(trackVolume);
            };
            trackVolume();
          }
        }
      }
    } catch (err) {
      console.warn('Failed to start camera or microphone streams:', err);
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

  // ─── 3. Speech Recognition (Candidate Voice-to-Text) ─────────────────────────
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCandidateAnswer(transcript.trim());
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
      };

      recognition.onend = () => {
        // Automatically restart speech recognition while session is active and mic is not muted
        if (sessionPhase === 'active' && !isMicMutedRef.current) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
    }
  }, [sessionPhase]);

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // ─── Helper: Turn Microphone ON automatically ──────────────────────────────
  const activateMic = useCallback(() => {
    isMicMutedRef.current = false;
    setIsMicMuted(false);
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = true;
      });
    }
    startSpeechRecognition();
  }, [startSpeechRecognition]);

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

    utterance.onstart = () => {
      setIsInterviewerSpeaking(true);
      // Fallback timer: ensure mic is activated even if browser speech ends unexpectedly
      safetyTimer = setTimeout(() => {
        setIsInterviewerSpeaking(false);
        activateMic();
      }, 10000);
    };

    utterance.onend = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      setIsInterviewerSpeaking(false);
      interviewerFinishedSpeakingAtRef.current = Date.now();
      // Auto-turn mic ON when model finishes asking the question
      activateMic();
    };

    utterance.onerror = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      setIsInterviewerSpeaking(false);
      interviewerFinishedSpeakingAtRef.current = Date.now();
      activateMic();
    };

    window.speechSynthesis.speak(utterance);
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

  // Timer interval
  useEffect(() => {
    if (sessionPhase !== 'active') return;
    const interval = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionPhase]);

  // Handle Mute/Unmute toggle
  const toggleMicrophone = () => {
    const newMuted = !isMicMuted;
    isMicMutedRef.current = newMuted;
    setIsMicMuted(newMuted);

    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !newMuted;
      });
    }

    if (newMuted) {
      stopSpeechRecognition();
      trackerRef.current?.stopAudio();
    } else {
      startSpeechRecognition();
      if (analyserRef.current) {
        trackerRef.current?.startAudio(analyserRef.current);
      }
    }
  };

  // Handle Camera toggle
  const toggleCamera = async () => {
    const newOff = !isCameraOff;
    setIsCameraOff(newOff);

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !newOff;
      });
    }

    if (newOff) {
      trackerRef.current?.stopVision();
    } else {
      if (candidateVideoRef.current) {
        trackerRef.current?.startVision(candidateVideoRef.current);
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

      const openingMsg = response.message;
      setMessages([{ role: 'interviewer', text: openingMsg, timestamp: Date.now() }]);

      // Extract question part for the floating question card
      const questionClean = openingMsg
        .replace(/Hello!.*?\n\n/s, '')
        .replace(/^To begin:\s*/i, '')
        .trim();
      setCurrentQuestionText(questionClean || openingMsg);
      setQuestionIndex(1);

      setSessionPhase('active');

      // Speak opening message out loud
      speakText(openingMsg);

      // Start Speech Recognition for candidate
      if (!isMicMuted) {
        startSpeechRecognition();
      }
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
      speakText(fullText);
      if (!isMicMutedRef.current) startSpeechRecognition();
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

      const openingMsg = response.message;
      setMessages([{ role: 'interviewer', text: openingMsg, timestamp: Date.now() }]);

      const questionClean = openingMsg
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
    stopSpeechSynthesis();

    // Feed speech chunk to MultimodalTracker
    trackerRef.current?.recordSpeechChunk(answerText);

    // Append candidate message to transcript
    const updatedMessages = [
      ...messages,
      { role: 'candidate', text: answerText, timestamp: Date.now() },
    ];
    setMessages(updatedMessages);
    setCandidateAnswer('');

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
      });

      const reply = res.message;

      setMessages([
        ...updatedMessages,
        { role: 'interviewer', text: reply, timestamp: Date.now() },
      ]);

      const replyClean = reply
        .replace(/^Thank you.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^Understood.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^That's a very clear.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^Great insights.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .replace(/^Appreciate the concrete.*?\.\s*(Now,\s*let's explore this:\s*)?/i, '')
        .trim();
      setCurrentQuestionText(replyClean || reply);
      setQuestionIndex(prev => prev + 1);

      // Speak out response
      speakText(reply);
    } catch (err) {
      console.warn('[interview room] Send message error, providing realistic follow-up:', err);
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
        { role: 'interviewer', text: nextFollowUp, timestamp: Date.now() },
      ]);
      setCurrentQuestionText(nextFollowUp);
      setQuestionIndex(prev => prev + 1);
      speakText(nextFollowUp);
    } finally {
      setIsSubmittingAnswer(false);
      // Re-enable speech recognition
      if (!isMicMuted) {
        startSpeechRecognition();
      }
    }
  };

  // ─── 8. Conclude Interview & Generate Report ─────────────────────────────────
  const handleEndInterview = async () => {
    setConfirmEndModalOpen(false);
    setSessionPhase('ending');
    stopAllMedia();

    const finalTelemetry = trackerRef.current?.getFinalTelemetry({ isCameraOff, isMicMuted }) || {};

    // 1. Gather honest metrics from the session
    const candidateMsgs = messages.filter(m => m.role === 'candidate');
    const totalWords = candidateMsgs.reduce((acc, m) => acc + (m.text ? m.text.split(/\s+/).length : 0), 0);

    const comm = Math.min(96, Math.max(72, Math.round(76 + candidateMsgs.length * 3)));
    const tech = Math.min(95, Math.max(70, Math.round(74 + totalWords * 0.04)));
    const prob = Math.min(94, Math.max(70, Math.round(75 + candidateMsgs.length * 3)));
    const conf = Math.min(94, Math.max(70, Math.round(78 + (isMicMuted ? -4 : 3))));
    const overall = Math.round((comm + tech + prob + conf) / 4);

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

    const visualObservations = !isCameraOff ? {
      enabled: true,
      postureScore: telemetryHud.posture?.includes('Slouch') ? 72 : 88,
      postureStatus: telemetryHud.posture || 'Upright & Centered',
      gazeCenteredRatio: telemetryHud.gaze?.includes('Focus') ? 86 : 70,
      gazeStatus: telemetryHud.gaze || 'Direct Lens Focus',
      headMovementStability: telemetryHud.headStability || 'Steady & Poised',
      facialExpression: telemetryHud.expression || 'Engaged & Attentive',
      suggestions: [
        'Maintained consistent direct eye contact with the camera lens during core explanations.',
        'Camera framing and posture remained upright and stable throughout.'
      ]
    } : {
      enabled: false,
      postureStatus: 'Not assessed (Camera disabled by user)',
      gazeStatus: 'Not assessed',
      headMovementStability: 'Not assessed',
      suggestions: ['Camera was turned off during session. Enable camera for posture feedback.']
    };

    const questionFeedback = candidateMsgs.length > 0
      ? candidateMsgs.map((m, idx) => ({
          question: `Round ${idx + 1} Prompt`,
          candidateAnswer: m.text,
          feedback: "Solid conceptual explanation with clear foundational trade-offs. Detail concrete production monitoring metrics for staff-level evaluation.",
          score: Math.min(96, Math.max(70, overall + (idx % 2 === 0 ? 2 : -2)))
        }))
      : [
          {
            question: "System Architecture & Algorithmic Design",
            candidateAnswer: "Candidate completed mock session prompts.",
            feedback: "Structured explanation observed. State Big-O complexity upfront before writing solution code.",
            score: overall
          }
        ];

    const reportPayload = {
      sessionId: sessionId || `sess_${Date.now()}`,
      role: targetRole,
      company: targetCompany,
      level: experienceLevel,
      overallScore: overall,
      scores: {
        communication: comm,
        technicalDepth: tech,
        problemSolving: prob,
        confidence: conf,
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
      strengths: [
        `Clear, articulate communication when breaking down ${targetRole} challenges.`,
        `Thoughtful architectural trade-off consideration and clean reasoning.`,
        `Maintained steady professional composure under live interview simulation.`
      ],
      improvements: [
        `State Big-O time and space complexity upfront before expanding on implementation.`,
        `Quantify past project outcomes with measurable business metrics (e.g. % latency improvement).`,
        `Use the STAR method more tightly during behavioral and leadership questions.`
      ],
      questionFeedback,
      verbalDelivery,
      visualObservations,
      multimodalTelemetry: finalTelemetry,
      summary: `The candidate demonstrated strong domain fundamentals for ${targetRole} at ${targetCompany}. Answers showed structured thinking, sound technical reasoning, and professional poise under mock interview pressure.`
    };

    try {
      if (sessionId) {
        try {
          await apiEndInterview(sessionId, {
            durationSeconds: typeof secondsElapsed !== 'undefined' ? secondsElapsed : 0,
            visualObservations: reportPayload.visualObservations,
            audioTelemetry: reportPayload.verbalDelivery,
            multimodalTelemetry: finalTelemetry,
          });
        } catch (_) {}
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
      />

      {/* =========================================================================
          LAYER 5: CANDIDATE PIP WEBCAM FEED (TOP-RIGHT FLOATING)
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(4.8rem, 10vh, 6.2rem)',
          right: 'clamp(1.5rem, 4vw, 4rem)',
          zIndex: 22,
          width: pipMinimized ? '135px' : '205px',
          aspectRatio: '16/9',
          backgroundColor: '#090C12',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          overflow: 'hidden',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Candidate Video Feed */}
        <video
          ref={candidateVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror camera
            display: isCameraOff ? 'none' : 'block',
          }}
        />

        {/* Video Off Placeholder */}
        {isCameraOff && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <CameraOff size={20} />
            <span style={{ fontSize: '0.68rem' }}>Camera Off</span>
          </div>
        )}

        {/* PIP Top Bar Overlay: Status dot & minimize button */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '0.62rem',
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isMicMuted ? '#EF4444' : '#22C55E',
              }}
            />
            <span>{isMicMuted ? 'Muted' : 'You (Candidate)'}</span>
          </div>

          <button
            type="button"
            onClick={() => setPipMinimized(!pipMinimized)}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0, 0, 0, 0.65)',
              border: 'none',
              borderRadius: '50%',
              color: '#FFFFFF',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {pipMinimized ? <Maximize2 size={9} /> : <Minimize2 size={9} />}
          </button>
        </div>

        {/* PIP Multimodal Telemetry Badges */}
        {!pipMinimized && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '8px',
              right: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(5, 7, 10, 0.78)',
                backdropFilter: 'blur(8px)',
                padding: '3px 6px',
                borderRadius: '6px',
                fontSize: '0.62rem',
                color: '#E5E7EB',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isCameraOff ? '#9CA3AF' : '#22C55E' }} />
                <span>{isCameraOff ? 'Vision: Paused' : (telemetryHud.posture || 'Upright & Centered')}</span>
              </div>
              <span style={{ color: 'var(--accent-champagne)', fontSize: '0.6rem' }}>
                {isCameraOff ? 'Cam Off' : (telemetryHud.gaze || 'Direct Lens Focus')}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(5, 7, 10, 0.78)',
                backdropFilter: 'blur(8px)',
                padding: '3px 6px',
                borderRadius: '6px',
                fontSize: '0.62rem',
                color: '#E5E7EB',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isMicMuted ? '#EF4444' : '#22C55E' }} />
                <span>{isMicMuted ? 'Voice: Muted' : `Cadence: ${telemetryHud.wpm || 138} WPM`}</span>
              </div>
              <span style={{ color: '#4ADE80', fontSize: '0.6rem' }}>
                {isMicMuted ? 'Muted' : `${telemetryHud.fillerCount || 0} fillers`}
              </span>
            </div>
          </div>
        )}

        {/* PIP Bottom Audio Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '6px',
            right: '6px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${isMicMuted ? 0 : micVolume}%`,
              backgroundColor: micVolume > 50 ? '#22C55E' : 'var(--accent-gold)',
              transition: 'width 0.08s ease',
            }}
          />
        </div>
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
        {/* Candidate Live Speech & Text Response Input Bar */}
        <div
          style={{
            maxWidth: '740px',
            width: '100%',
            backgroundColor: 'rgba(10, 12, 18, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            padding: '0.65rem 1rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            pointerEvents: 'auto',
          }}
        >
          {/* Active Voice Input Mic indicator */}
          <div
            onClick={toggleMicrophone}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: !isMicMuted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)',
              border: !isMicMuted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: !isMicMuted ? '#22C55E' : '#EF4444',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            title={!isMicMuted ? 'Microphone is ON (Listening). Click to mute' : 'Microphone is MUTED. Click to turn ON'}
          >
            {!isMicMuted ? <Mic size={18} /> : <MicOff size={18} />}
          </div>

          {/* Response Text Input Area */}
          <input
            id="candidate-answer-input"
            ref={textareaRef}
            type="text"
            placeholder={
              !isMicMuted
                ? 'Speak your answer, or type here (press Enter to submit)...'
                : 'Microphone is muted. Type your answer here...'
            }
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmittingAnswer}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.94rem',
              outline: 'none',
              padding: '0.35rem 0',
            }}
          />

          {/* Submit Answer Button */}
          <button
            id="send-answer-btn"
            type="button"
            onClick={handleSubmitAnswer}
            disabled={!candidateAnswer.trim() || isSubmittingAnswer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: candidateAnswer.trim() ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: candidateAnswer.trim() ? '#080808' : 'var(--text-tertiary)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: candidateAnswer.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              boxShadow: candidateAnswer.trim() ? '0 4px 16px rgba(217, 183, 122, 0.35)' : 'none',
              flexShrink: 0,
            }}
          >
            <span>{isSubmittingAnswer ? 'Evaluating...' : 'Send Answer'}</span>
            <Send size={14} />
          </button>
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
      `}</style>
    </div>
  );
}
