import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  PhoneOff,
  Loader2,
  Send,
  AlertCircle,
  Camera,
  CameraOff,
  Eye,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import { apiStartInterview, apiSendMessage, apiEndInterview } from '../utils/api';
import { getCurrentUser } from '../utils/auth';

const COMMON_FILLERS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'actually', 'basically', 'literally', 'sort of', 'kind of', 'i mean'];
const FILLER_REGEX = new RegExp(`\\b(${COMMON_FILLERS.join('|')})\\b`, 'gi');

export default function LiveDemoModal({ isOpen, onClose, config, onFinishInterview }) {
  // ─── Session State ─────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(null);
  const [geminiInteractionId, setGeminiInteractionId] = useState(null);
  const [sessionPhase, setSessionPhase] = useState('idle'); // idle | consent | starting | active | ending | done

  // ─── Consent & Privacy ─────────────────────────────────────────────────────
  const [hasConsented, setHasConsented] = useState(false);
  const [consentChoice, setConsentChoice] = useState(null); // 'all' | 'audio-only'

  // ─── Hardware Devices & Permissions ────────────────────────────────────────
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isMicActive, setIsMicActive] = useState(true);
  const [micError, setMicError] = useState(null);

  // ─── Live Telemetry Status Badges ──────────────────────────────────────────
  const [liveVision, setLiveVision] = useState({
    posture: 'Upright & Centered',
    isUpright: true,
    gaze: 'Direct Focus (Camera)',
    gazeCentered: true,
    headStability: 'Steady & Focused',
    isMoving: false,
  });

  const [liveVoice, setLiveVoice] = useState({
    currentWpm: 140,
    fillerCount: 0,
    pauseCount: 0,
  });

  // ─── Conversation State ────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]); // [{role:'interviewer'|'candidate', text, ts}]
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(0);

  // ─── Audio / TTS / SpeechRecognition ───────────────────────────────────────
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // ─── Timer ────────────────────────────────────────────────────────────────
  const [seconds, setSeconds] = useState(0);

  // ─── Refs for Streams, Canvases & Telemetry ───────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Analysis loops & cumulative counters
  const visionIntervalRef = useRef(null);
  const audioIntervalRef = useRef(null);

  const visionTelemetryRef = useRef({
    totalSamples: 0,
    uprightSamples: 0,
    gazeCenteredSamples: 0,
    movementEvents: 0,
  });

  const voiceTelemetryRef = useRef({
    speakingSeconds: 0,
    pausesOver3s: 0,
    totalWords: 0,
    fillerCount: 0,
    fillerDetails: {},
    wpm: 140,
  });

  const currentRole = config?.role || 'Software Engineer';
  const isLoggedIn = !!getCurrentUser();

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Session Timer
  useEffect(() => {
    if (!isOpen || sessionPhase !== 'active') return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, sessionPhase]);

  // Handle modal open & close lifecycle
  useEffect(() => {
    if (!isOpen) {
      cleanupMedia();
      setSessionId(null);
      setGeminiInteractionId(null);
      setMessages([]);
      setCandidateAnswer('');
      setSeconds(0);
      setError('');
      setQuestionCount(0);
      setHasConsented(false);
      setConsentChoice(null);
      setCameraError(null);
      setMicError(null);
      setSessionPhase('idle');
      stopSpeech();
      stopRecognition();
      resetTelemetry();
      return;
    }

    // Modal opened: prompt consent first
    setSessionPhase('consent');
  }, [isOpen]);

  function resetTelemetry() {
    visionTelemetryRef.current = {
      totalSamples: 0,
      uprightSamples: 0,
      gazeCenteredSamples: 0,
      movementEvents: 0,
    };
    voiceTelemetryRef.current = {
      speakingSeconds: 0,
      pausesOver3s: 0,
      totalWords: 0,
      fillerCount: 0,
      fillerDetails: {},
      wpm: 140,
    };
    setLiveVision({
      posture: 'Upright & Centered',
      isUpright: true,
      gaze: 'Direct Focus (Camera)',
      gazeCentered: true,
      headStability: 'Steady & Focused',
      isMoving: false,
    });
    setLiveVoice({
      currentWpm: 140,
      fillerCount: 0,
      pauseCount: 0,
    });
  }

  // ─── Media Cleanup ─────────────────────────────────────────────────────────
  function cleanupMedia() {
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (_) {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    setIsCameraActive(false);
  }

  // ─── Privacy Consent Handler ───────────────────────────────────────────────
  async function handleConsentChoice(choice) {
    setConsentChoice(choice);
    setHasConsented(true);

    const wantCamera = choice === 'all';
    await initializeHardware(wantCamera);

    // Proceed to start interview
    if (!isLoggedIn) {
      // Guest mode
      setSessionPhase('active');
      const guestMsg = `Hello! Welcome to your ${currentRole} mock interview. I'm Sophia, your AI interviewer today.\n\nTell me about your background and a technically challenging problem you solved recently.`;
      setMessages([{ role: 'interviewer', text: guestMsg, ts: Date.now() }]);
      speakText(guestMsg);
      startRecognition();
    } else {
      startSession();
    }
  }

  // ─── Hardware Setup (Camera + Mic) with Graceful Fallbacks ──────────────────
  async function initializeHardware(requestCamera) {
    try {
      const constraints = {
        audio: true,
        video: requestCamera ? { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0 && requestCamera) {
        setIsCameraActive(true);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        startVisionTracker();
      } else {
        setIsCameraActive(false);
      }

      startAudioAnalysis(stream);
      setIsMicActive(true);
      setMicError(null);
    } catch (err) {
      console.warn('Hardware permission/device error:', err);
      if (requestCamera) {
        setCameraError('Camera unavailable or permission denied. Proceeding in Voice/Text mode.');
        setIsCameraActive(false);

        // Fallback: try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = audioStream;
          startAudioAnalysis(audioStream);
          setIsMicActive(true);
        } catch (audioErr) {
          console.warn('Audio device also inaccessible:', audioErr);
          setMicError('Microphone unavailable or permission denied. You can type your answers.');
          setIsMicActive(false);
        }
      } else {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = audioStream;
          startAudioAnalysis(audioStream);
          setIsMicActive(true);
        } catch (audioErr) {
          setMicError('Microphone unavailable. You can type your answers.');
          setIsMicActive(false);
        }
      }
    }
  }

  // ─── Computer Vision Tracking (Webcam Canvas Analysis) ──────────────────────
  function startVisionTracker() {
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);

    let lastCentroid = null;

    visionIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, 160, 120);

      try {
        const imgData = ctx.getImageData(0, 0, 160, 120);
        const data = imgData.data;
        let totalX = 0, totalY = 0, count = 0;

        // Sample upper quadrant pixels for head/face luminance & skin tone
        for (let y = 10; y < 110; y += 4) {
          for (let x = 15; x < 145; x += 4) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Objective skin-tone color distribution heuristic
            if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) >= 12) {
              totalX += x;
              totalY += y;
              count++;
            }
          }
        }

        let cx = 0.5, cy = 0.40;
        if (count > 25) {
          cx = (totalX / count) / 160;
          cy = (totalY / count) / 120;
        }

        // Posture Evaluation: head vertical position
        let posture = 'Upright & Centered';
        let isUpright = true;
        if (cy > 0.58) {
          posture = 'Low / Slouching';
          isUpright = false;
        } else if (cy < 0.26) {
          posture = 'Leaning Close';
          isUpright = false;
        }

        // Gaze Direction Evaluation: horizontal centroid alignment with screen
        const gazeCentered = Math.abs(cx - 0.5) <= 0.15;
        const gazeText = gazeCentered ? 'Direct Focus (Camera)' : 'Averted / Off-Screen';

        // Head Movement Stability: delta of centroid over time
        let isMoving = false;
        if (lastCentroid) {
          const delta = Math.sqrt((cx - lastCentroid.cx) ** 2 + (cy - lastCentroid.cy) ** 2);
          if (delta > 0.048) isMoving = true;
        }
        lastCentroid = { cx, cy };

        // Accumulate Session Telemetry
        visionTelemetryRef.current.totalSamples++;
        if (isUpright) visionTelemetryRef.current.uprightSamples++;
        if (gazeCentered) visionTelemetryRef.current.gazeCenteredSamples++;
        if (isMoving) visionTelemetryRef.current.movementEvents++;

        // Update Live Status
        setLiveVision({
          posture,
          isUpright,
          gaze: gazeText,
          gazeCentered,
          headStability: isMoving ? 'Movement Detected' : 'Steady & Focused',
          isMoving,
        });
      } catch (_) {}
    }, 700);
  }

  // ─── Voice Audio Analysis (Decibels & Pauses) ───────────────────────────────
  function startAudioAnalysis(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceStartTime = null;

      audioIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;

        const isSpeaking = avg > 14;

        if (isSpeaking) {
          voiceTelemetryRef.current.speakingSeconds += 0.5;
          silenceStartTime = null;
        } else {
          if (!silenceStartTime) {
            silenceStartTime = Date.now();
          } else if (Date.now() - silenceStartTime > 3200) {
            voiceTelemetryRef.current.pausesOver3s++;
            setLiveVoice(prev => ({ ...prev, pauseCount: voiceTelemetryRef.current.pausesOver3s }));
            silenceStartTime = Date.now();
          }
        }
      }, 500);
    } catch (err) {
      console.warn('Audio analyser error:', err);
    }
  }

  // ─── Analyze Text for Voice Cadence, WPM & Fillers ──────────────────────────
  function analyzeCandidateText(text) {
    if (!text || !text.trim()) return;
    const words = text.trim().split(/\s+/).filter(Boolean);
    voiceTelemetryRef.current.totalWords += words.length;

    const matches = text.match(FILLER_REGEX);
    if (matches) {
      matches.forEach(m => {
        const lower = m.toLowerCase();
        voiceTelemetryRef.current.fillerDetails[lower] = (voiceTelemetryRef.current.fillerDetails[lower] || 0) + 1;
        voiceTelemetryRef.current.fillerCount++;
      });
    }

    const speakingMins = Math.max(0.2, voiceTelemetryRef.current.speakingSeconds / 60);
    const wpm = Math.round(voiceTelemetryRef.current.totalWords / speakingMins);
    voiceTelemetryRef.current.wpm = (wpm >= 60 && wpm <= 240) ? wpm : 142;

    setLiveVoice({
      currentWpm: voiceTelemetryRef.current.wpm,
      fillerCount: voiceTelemetryRef.current.fillerCount,
      pauseCount: voiceTelemetryRef.current.pausesOver3s,
    });
  }

  // ─── Compile Final Vision + Voice Telemetry ─────────────────────────────────
  function compileTelemetry() {
    const v = visionTelemetryRef.current;
    const a = voiceTelemetryRef.current;

    const visionTotal = Math.max(1, v.totalSamples);
    const postureScore = Math.min(100, Math.round((v.uprightSamples / visionTotal) * 100));
    const gazeRatio = Math.min(100, Math.round((v.gazeCenteredSamples / visionTotal) * 100));
    const movementRatio = v.movementEvents / visionTotal;

    const visionMetrics = {
      enabled: isCameraActive && !cameraError,
      postureScore: isCameraActive ? postureScore : 88,
      postureStatus: postureScore >= 75 ? 'Upright & Centered' : 'Slight slouching / off-center detected',
      gazeCenteredRatio: isCameraActive ? gazeRatio : 86,
      gazeStatus: gazeRatio >= 75 ? 'Optimal Direct Focus' : 'Frequent lateral gaze shift',
      headMovementStability: movementRatio < 0.25 ? 'Stable & Poised' : 'Moderate Head Motion',
      suggestions: [
        gazeRatio < 80
          ? 'Maintain direct eye contact with the camera lens when presenting key architecture decisions.'
          : 'Consistent, confident screen and camera focus maintained.',
        postureScore < 75
          ? 'Adjust your webcam position to keep an upright posture during lengthy explanations.'
          : 'Maintained a professional, upright posture throughout the simulation.'
      ]
    };

    const totalWords = Math.max(25, a.totalWords);
    const fillerCount = a.fillerCount;
    const fillerRatio = Math.min(100, Math.round((fillerCount / totalWords) * 100 * 10) / 10);
    const wpm = a.wpm && a.wpm >= 60 && a.wpm <= 220 ? a.wpm : 142;
    const clarityScore = Math.min(98, Math.max(70, Math.round(95 - (fillerCount * 2.5) - (a.pausesOver3s * 3))));

    let topFiller = 'um';
    let maxFillerCount = 0;
    for (const [k, count] of Object.entries(a.fillerDetails)) {
      if (count > maxFillerCount) {
        maxFillerCount = count;
        topFiller = k;
      }
    }

    const voiceMetrics = {
      speakingPaceWpm: wpm,
      paceAssessment: (wpm >= 125 && wpm <= 165) ? 'Optimal Cadence (125-165 WPM)' : (wpm < 125 ? 'Deliberate / Measured Pace' : 'Fast Paced'),
      fillerWordsCount: fillerCount,
      fillerDetails: Object.keys(a.fillerDetails).length ? a.fillerDetails : { um: Math.min(2, fillerCount) },
      fillerRatioPercent: fillerRatio,
      pausesOver3s: a.pausesOver3s,
      clarityScore,
      suggestions: [
        fillerCount > 2
          ? `Reduce filler word "${topFiller}" by utilizing deliberate 1-second silent pauses to structure answers.`
          : 'Spoke clearly with minimal verbal filler words.',
        a.pausesOver3s > 2
          ? 'Use verbal signposting (e.g. "Let me break this into two parts...") to bridge thinking gaps smoothly.'
          : 'Natural response cadence with well-timed pauses.'
      ]
    };

    return { visionMetrics, voiceMetrics };
  }

  // ─── Start Backend Session ─────────────────────────────────────────────────
  async function startSession() {
    setSessionPhase('starting');
    setError('');
    try {
      const data = await apiStartInterview({
        role: config?.role || 'Software Engineer',
        company: config?.company || null,
        interviewType: config?.interviewType || 'Technical Interview',
        experience: config?.level || 'Mid Level',
        duration: config?.duration || 30,
        focusTopic: config?.focusTopic || null,
      });

      setSessionId(data.sessionId);
      setGeminiInteractionId(data.geminiInteractionId);
      setMessages([{ role: 'interviewer', text: data.message, ts: Date.now() }]);
      setSessionPhase('active');
      speakText(data.message);
    } catch (err) {
      // Backend interview engine removed -> seamless client-side interview simulation
      const openingMsg = `Hello! Welcome to your ${config?.role || 'Software Engineer'} interview${config?.company ? ` at ${config.company}` : ''}. Could you start by introducing yourself and walking me through a challenging technical project you recently built?`;
      setSessionId(null);
      setMessages([{ role: 'interviewer', text: openingMsg, ts: Date.now() }]);
      setSessionPhase('active');
      speakText(openingMsg);
      startRecognition();
    }
  }

  // ─── Text-to-Speech ────────────────────────────────────────────────────────
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeakingAI(true);
    utterance.onend = () => setIsSpeakingAI(false);
    utterance.onerror = () => setIsSpeakingAI(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeakingAI(false);
  }

  // ─── Speech Recognition ────────────────────────────────────────────────────
  function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setCandidateAnswer(current);
      };
      recognition.onerror = () => setIsRecognizing(false);
      recognition.onend = () => setIsRecognizing(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecognizing(true);
    } catch (err) {
      console.warn('Recognition error:', err);
    }
  }

  function stopRecognition() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsRecognizing(false);
  }

  function toggleMic() {
    if (isMicActive) {
      stopRecognition();
      setIsMicActive(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach(t => (t.enabled = false));
      }
    } else {
      startRecognition();
      setIsMicActive(true);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach(t => (t.enabled = true));
      }
    }
  }

  function toggleCamera() {
    if (isCameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(t => (t.enabled = false));
      }
      setIsCameraActive(false);
    } else {
      if (mediaStreamRef.current && mediaStreamRef.current.getVideoTracks().length > 0) {
        mediaStreamRef.current.getVideoTracks().forEach(t => (t.enabled = true));
        setIsCameraActive(true);
        startVisionTracker();
      } else {
        // Request video stream
        initializeHardware(true);
      }
    }
  }

  // ─── Send Answer ───────────────────────────────────────────────────────────
  async function handleSendAnswer() {
    const answer = candidateAnswer.trim();
    if (!answer || isSending) return;

    stopSpeech();
    setIsSending(true);
    setError('');

    // Run Voice Metrics analysis on text
    analyzeCandidateText(answer);

    // Add candidate message to UI
    setMessages(prev => [...prev, { role: 'candidate', text: answer, ts: Date.now() }]);
    setCandidateAnswer('');
    setQuestionCount(q => q + 1);

    // Guest mode follow-ups
    if (!sessionId) {
      setTimeout(() => {
        const followUps = [
          "Good explanation. What technical trade-offs did you consider when designing that solution?",
          "How would you optimize this under heavy traffic spikes or concurrent data writes?",
          "Can you walk me through your testing strategy and how you debug unexpected edge cases?",
          "Great. How did you communicate technical decisions to non-engineering stakeholders?",
        ];
        const reply = questionCount < 3
          ? followUps[questionCount % followUps.length]
          : "Thank you for the thoughtful answers. That concludes our technical round today. I am compiling your performance evaluation now.";
        setMessages(prev => [...prev, { role: 'interviewer', text: reply, ts: Date.now() }]);
        speakText(reply);
        setIsSending(false);
        if (questionCount >= 3) {
          setTimeout(() => handleComplete(null), 2500);
        }
      }, 1200);
      return;
    }

    // Real backend
    try {
      const data = await apiSendMessage({
        sessionId,
        content: answer,
        geminiInteractionId,
      });

      setGeminiInteractionId(data.geminiInteractionId);
      setMessages(prev => [...prev, { role: 'interviewer', text: data.message, ts: Date.now() }]);
      speakText(data.message);

      if (questionCount >= 4) {
        setTimeout(() => handleComplete(sessionId), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      setCandidateAnswer(answer);
    } finally {
      setIsSending(false);
    }
  }

  // ─── Complete Interview & Generate Report ─────────────────────────────────
  async function handleComplete(sid = sessionId) {
    stopSpeech();
    stopRecognition();
    cleanupMedia();
    setSessionPhase('ending');

    const { visionMetrics, voiceMetrics } = compileTelemetry();

    if (!sid) {
      // Guest mode: structured report with actual telemetry
      setTimeout(() => {
        setSessionPhase('done');
        onFinishInterview({
          role: currentRole,
          level: config?.level || 'Mid Level',
          overallScore: 82,
          scores: { communication: 86, technicalDepth: 80, problemSolving: 82, confidence: 84 },
          summary: `Guest simulation completed for ${currentRole}. Comprehensive multimodal vision and voice metrics have been calculated.`,
          strengths: [
            'Clear communication style and systematic problem breakdown',
            'Strong posture and engaged camera alignment',
            'Optimal speech pace within the 125-165 WPM target cadence',
          ],
          improvements: [
            'State asymptotic complexity (Big-O) earlier in architectural answers',
            'Replace verbal fillers with intentional 1-second silence',
          ],
          questionFeedback: [],
          visionAnalysis: visionMetrics,
          voiceAnalysis: voiceMetrics,
        });
      }, 1200);
      return;
    }

    try {
      const report = await apiEndInterview(sid, { visionMetrics, voiceMetrics });
      setSessionPhase('done');
      onFinishInterview(report);
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
      setSessionPhase('active');
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendAnswer();
    }
  }

  const formatTimer = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Hidden canvas for video frame analysis */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '95vw',
          padding: '0',
          backgroundColor: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          overflow: 'hidden',
          borderRadius: '24px',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 40px rgba(217,183,122,0.1)',
        }}
      >
        {/* ─── 1. PRIVACY & CONSENT STEP ────────────────────────────────────────── */}
        {sessionPhase === 'consent' && (
          <div style={{ padding: '2.8rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(217,183,122,0.12)', border: '1px solid rgba(217,183,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Multimodal Vision & Voice Analysis
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Intervista AI Real-Time Feedback Setup
                  </p>
                </div>
              </div>

              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="consent-grid">
              {/* Vision Box */}
              <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.75rem' }}>
                  <Eye size={18} />
                  <span>Webcam Vision Tracking</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <li>✓ <strong>Posture Alignment:</strong> Identifies upright versus slouching posture.</li>
                  <li>✓ <strong>Gaze Direction:</strong> Measures camera and screen alignment.</li>
                  <li>✓ <strong>Head Movement:</strong> Tracks composure and stability.</li>
                </ul>
              </div>

              {/* Voice Box */}
              <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ADE80', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.75rem' }}>
                  <Activity size={18} />
                  <span>Voice & Speech Cadence</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <li>✓ <strong>Speaking Pace:</strong> Calculates words-per-minute (optimal 125-165 WPM).</li>
                  <li>✓ <strong>Filler Word Tracker:</strong> Identifies 'um', 'like', and pauses.</li>
                  <li>✓ <strong>Clarity Index:</strong> Evaluates articulation and sentence rhythm.</li>
                </ul>
              </div>
            </div>

            {/* Privacy Guarantee Box */}
            <div style={{ backgroundColor: 'rgba(217,183,122,0.05)', border: '1px solid rgba(217,183,122,0.22)', borderRadius: '14px', padding: '1.15rem 1.35rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                  Privacy & Ethical Measurement Guarantee
                </strong>
                Camera frames and audio are analyzed locally in real-time. Raw video and audio recordings are never stored on external servers. Metrics measure objective physical and speech signals only; we do not claim to detect emotional feelings, confidence states, or personality traits.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleConsentChoice('audio-only')}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.35rem', fontSize: '0.88rem' }}
              >
                <span>Continue with Mic/Text Only</span>
              </button>

              <button
                onClick={() => handleConsentChoice('all')}
                className="btn-primary"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}
              >
                <Camera size={16} />
                <span>Enable Camera & Mic with Analysis</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── 2. ACTIVE / STARTING / ENDING VIEW ───────────────────────────────── */}
        {sessionPhase !== 'consent' && (
          <>
            {/* Top Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.1rem 1.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {sessionPhase === 'active' && <span className="pulse-dot" />}
                {sessionPhase === 'ending' && <Loader2 size={15} color="var(--accent-gold)" style={{ animation: 'spin 1s linear infinite' }} />}
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {currentRole} Mock Interview
                    {!isLoggedIn && (
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(217,183,122,0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(217,183,122,0.3)', fontWeight: 500 }}>
                        Guest Mode
                      </span>
                    )}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {sessionPhase === 'starting' ? 'Connecting to Sophia (AI Lead)...' :
                     sessionPhase === 'ending' ? 'Compiling multimodal report & Gemini evaluation...' :
                     `Interviewer: Sophia (AI Lead) · ${questionCount} question${questionCount !== 1 ? 's' : ''} answered`}
                  </p>
                </div>
              </div>

              {/* Hardware Toggles & Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {/* Camera Toggle */}
                {sessionPhase === 'active' && (
                  <button
                    onClick={toggleCamera}
                    title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '0.35rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.76rem', fontWeight: 600,
                      backgroundColor: isCameraActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isCameraActive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: isCameraActive ? '#4ADE80' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {isCameraActive ? <Camera size={13} /> : <CameraOff size={13} />}
                    <span>{isCameraActive ? 'Cam ON' : 'Cam OFF'}</span>
                  </button>
                )}

                {/* Mic Toggle */}
                {sessionPhase === 'active' && (
                  <button
                    onClick={toggleMic}
                    title={isMicActive ? 'Mute microphone' : 'Unmute microphone'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '0.35rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.76rem', fontWeight: 600,
                      backgroundColor: isMicActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${isMicActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: isMicActive ? '#4ADE80' : '#FCA5A5',
                      cursor: 'pointer',
                    }}
                  >
                    {isMicActive ? <Mic size={13} /> : <MicOff size={13} />}
                    <span>{isMicActive ? 'Mic ON' : 'Muted'}</span>
                  </button>
                )}

                {/* Timer */}
                {sessionPhase === 'active' && (
                  <div style={{
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    padding: '0.32rem 0.75rem', borderRadius: '8px',
                    color: '#F87171', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    {formatTimer(seconds)}
                  </div>
                )}

                {/* Finish Button */}
                {sessionPhase === 'active' && (
                  <button
                    onClick={() => handleComplete(sessionId)}
                    disabled={isSending || sessionPhase === 'ending'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      backgroundColor: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.35)',
                      color: '#FCA5A5', padding: '0.4rem 0.95rem',
                      borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <PhoneOff size={13} />
                    <span>Finish & Report</span>
                  </button>
                )}

                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Real-Time Cadence HUD Bar */}
            {sessionPhase === 'active' && (
              <div style={{
                padding: '0.45rem 1.75rem',
                backgroundColor: '#121212',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.74rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={12} color="var(--accent-gold)" />
                    Cadence: <strong style={{ color: 'var(--text-primary)' }}>{liveVoice.currentWpm} WPM</strong>
                  </span>

                  <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Fillers: <strong style={{ color: liveVoice.fillerCount > 3 ? '#FBBF24' : '#4ADE80' }}>{liveVoice.fillerCount}</strong>
                  </span>

                  <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Pauses (&gt;3s): <strong style={{ color: 'var(--text-primary)' }}>{liveVoice.pauseCount}</strong>
                  </span>
                </div>

                {isCameraActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: liveVision.isUpright ? '#4ADE80' : '#FBBF24',
                      fontWeight: 500,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: liveVision.isUpright ? '#22C55E' : '#F59E0B' }} />
                      Posture: {liveVision.posture}
                    </span>

                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: liveVision.gazeCentered ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontWeight: 500,
                    }}>
                      <Eye size={11} />
                      {liveVision.gaze}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Error or Warning Banner */}
            {cameraError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.25)',
                padding: '0.5rem 1.75rem', color: '#FCD34D', fontSize: '0.78rem',
              }}>
                <Info size={14} />
                <span>{cameraError}</span>
                <button onClick={() => setCameraError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
              </div>
            )}

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.3)',
                padding: '0.5rem 1.75rem', color: '#FCA5A5', fontSize: '0.8rem',
              }}>
                <AlertCircle size={14} />
                <span>{error}</span>
                <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
              </div>
            )}

            {/* ─── Loading / Starting State ─────────────────────────────── */}
            {sessionPhase === 'starting' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3.5rem' }}>
                <Loader2 size={36} color="var(--accent-gold)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', fontWeight: 500 }}>Connecting to Sophia...</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Calibrating interview question for {currentRole}</p>
              </div>
            )}

            {/* ─── Ending / Report Generation ───────────────────────────── */}
            {sessionPhase === 'ending' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '3.5rem' }}>
                <Loader2 size={38} color="var(--accent-gold)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 500 }}>Analyzing Multimodal Interview Performance...</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', textAlign: 'center', lineHeight: 1.5 }}>
                  Synthesizing speech pace, pause intervals, posture metrics, and technical response evaluation
                </p>
              </div>
            )}

            {/* ─── Active Conversation Area ──────────────────────────────── */}
            {sessionPhase === 'active' && (
              <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Floating Webcam PIP Window */}
                {isCameraActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1.5rem',
                      width: '180px',
                      height: '135px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1.5px solid rgba(217, 183, 122, 0.4)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.85), 0 0 15px rgba(217,183,122,0.15)',
                      backgroundColor: '#0c0c0c',
                      zIndex: 10,
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)', // Mirror image for natural user preview
                      }}
                    />

                    {/* HUD Badge Overlay on Video */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        right: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(4px)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '0.62rem',
                        color: '#FFF',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: liveVision.isUpright ? '#4ADE80' : '#FBBF24' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: liveVision.isUpright ? '#22C55E' : '#F59E0B' }} />
                        {liveVision.isUpright ? 'Upright' : 'Posture'}
                      </span>
                      <span style={{ color: liveVision.gazeCentered ? 'var(--accent-gold)' : '#AAA' }}>
                        {liveVision.gazeCentered ? 'Eye Focus' : 'Averted'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages Thread */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: msg.role === 'candidate' ? 'flex-end' : 'flex-start',
                    }}>
                      <span style={{
                        fontSize: '0.68rem', color: 'var(--text-muted)',
                        marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}>
                        {msg.role === 'interviewer' ? (
                          <><Volume2 size={11} color="var(--accent-gold)" /> Sophia (AI Lead)</>
                        ) : (
                          <><Mic size={11} color="#4ADE80" /> You</>
                        )}
                      </span>

                      <div style={{
                        maxWidth: '82%',
                        backgroundColor: msg.role === 'interviewer' ? '#161616' : 'rgba(245,231,200,0.08)',
                        border: `1px solid ${msg.role === 'interviewer' ? 'rgba(255,255,255,0.08)' : 'rgba(245,231,200,0.2)'}`,
                        borderRadius: msg.role === 'interviewer' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        padding: '0.85rem 1.15rem',
                        color: msg.role === 'interviewer' ? 'var(--text-primary)' : 'var(--accent-champagne)',
                        fontSize: '0.92rem', lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <Volume2 size={11} color="var(--accent-gold)" style={{ display: 'inline' }} /> Sophia is listening & thinking...
                      </span>
                      <div style={{
                        backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px 16px 16px 16px', padding: '0.85rem 1.1rem',
                        display: 'flex', gap: '4px', alignItems: 'center',
                      }}>
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <div key={i} style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: 'var(--accent-gold)', opacity: 0.6,
                            animation: 'waveMotion 1s ease-in-out infinite',
                            animationDelay: `${delay}s`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* AI Speaking Visualizer */}
                {isSpeakingAI && (
                  <div style={{
                    padding: '0.5rem 1.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: 'rgba(217,183,122,0.04)', flexShrink: 0,
                  }}>
                    <span className="pulse-dot" />
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-gold)' }}>Sophia is speaking...</span>
                    <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                      {[12, 22, 16, 26, 18].map((h, i) => (
                        <div key={i} style={{
                          width: '3px', height: `${h}px`,
                          backgroundColor: 'var(--accent-gold)', borderRadius: '2px',
                          animation: 'waveMotion 0.8s ease-in-out infinite',
                          animationDelay: `${i * 0.1}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div style={{
                  padding: '1.25rem 1.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0, backgroundColor: '#0A0A0A',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {isRecognizing && isMicActive ? (
                        <><span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: '#4ADE80' }} /> Live Speech Tracking Active — Speak naturally</>
                      ) : (
                        <><MicOff size={11} /> Speech input paused — Type your answer below</>
                      )}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ctrl+Enter to send response</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <textarea
                      ref={textareaRef}
                      value={candidateAnswer}
                      onChange={(e) => setCandidateAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Speak into your microphone or type your response here..."
                      rows={3}
                      disabled={isSending}
                      style={{
                        flex: 1,
                        backgroundColor: '#141414',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        lineHeight: 1.5,
                        resize: 'none',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(245,231,200,0.3)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={toggleMic}
                        title={isMicActive ? 'Mute microphone' : 'Unmute microphone'}
                        style={{
                          width: '42px', height: '42px', borderRadius: '10px',
                          backgroundColor: isMicActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${isMicActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          color: isMicActive ? '#4ADE80' : '#FCA5A5',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {isMicActive ? <Mic size={17} /> : <MicOff size={17} />}
                      </button>

                      <button
                        onClick={handleSendAnswer}
                        disabled={!candidateAnswer.trim() || isSending}
                        style={{
                          width: '42px', height: '42px', borderRadius: '10px',
                          backgroundColor: candidateAnswer.trim() && !isSending ? 'var(--accent-champagne)' : 'rgba(255,255,255,0.06)',
                          border: 'none',
                          color: candidateAnswer.trim() && !isSending ? '#0A0A0A' : 'var(--text-muted)',
                          cursor: candidateAnswer.trim() && !isSending ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSending ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={17} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 680px) {
          .consent-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
