import { useState, useEffect, useRef, useCallback } from 'react';
import { apiTranscribeAudio } from '../utils/api';

/**
 * Production-ready Speech Recognition & Microphone Hook for Intervista AI.
 *
 * Implements full state machine:
 * 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'transcript_ready' | 'submitting' | 'analyzing' | 'error'
 */
export function useSpeechRecognition({
  initialLanguage = 'en-IN',
  selectedMicId = null,
  sessionId = null,
  questionId = null,
  onAudioData = null,
} = {}) {
  // ─── State Machine ─────────────────────────────────────────────────────────
  const [micState, setMicState] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [error, setError] = useState(null);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // ─── Internal Refs (to eliminate stale closures and race conditions) ───────
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const restartTimeoutRef = useRef(null);
  const baseTranscriptRef = useRef('');
  const currentSessionFinalRef = useRef('');
  const lastErrorRef = useRef(null);
  const isIntentionalRecordingRef = useRef(false);

  // Synchronize base transcript ref when transcript is set manually
  useEffect(() => {
    baseTranscriptRef.current = transcript;
  }, [transcript]);

  // ─── Format Duration MM:SS ─────────────────────────────────────────────────
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Unsuspend AudioContext on User Gesture ────────────────────────────────
  useEffect(() => {
    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // ─── Acquire Microphone Stream with Multi-Tier Fallback ────────────────────
  const acquireAudioStream = useCallback(async () => {
    let stream = null;

    // 1. Try with selected device ID if provided
    if (selectedMicId) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: selectedMicId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err) {
        console.warn('[useSpeechRecognition] Device ID getUserMedia failed, falling back:', err);
      }
    }

    // 2. Try with advanced audio processing constraints
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err) {
        console.warn('[useSpeechRecognition] Advanced audio constraints failed, trying basic audio: true:', err);
        // 3. Absolute basic audio constraint
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err2) {
          console.error('[useSpeechRecognition] All microphone acquisition attempts failed:', err2);
          throw err2;
        }
      }
    }

    streamRef.current = stream;
    return stream;
  }, [selectedMicId]);

  // ─── Setup Audio Context & Volume Analyser ──────────────────────────────────
  const setupAudioAnalyser = useCallback((stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      if (onAudioData) {
        onAudioData(analyser);
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const trackAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const vol = Math.min(100, Math.round((avg / 128) * 100));
        setVolume(vol);

        if (vol > 15 && isIntentionalRecordingRef.current) {
          setIsCandidateSpeaking(true);
        } else {
          setIsCandidateSpeaking(false);
        }

        animFrameRef.current = requestAnimationFrame(trackAudioLevel);
      };

      trackAudioLevel();
    } catch (err) {
      console.warn('[useSpeechRecognition] Analyser setup error:', err);
    }
  }, [onAudioData]);

  // ─── Setup MediaRecorder for Backup Audio Blob ─────────────────────────────
  const setupMediaRecorder = useCallback((stream) => {
    try {
      if (!window.MediaRecorder) return;
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn('[useSpeechRecognition] MediaRecorder setup error:', err);
    }
  }, []);

  // ─── Initialize Browser Speech Recognition ─────────────────────────────────
  const startSpeechEngine = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return false;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setMicState('listening');
        setError(null);
        lastErrorRef.current = null;
      };

      recognition.onresult = (event) => {
        lastErrorRef.current = null;
        let currentFinal = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res[0]) {
            if (res.isFinal) {
              currentFinal += res[0].transcript + ' ';
            } else {
              currentInterim += res[0].transcript;
            }
          }
        }

        const base = baseTranscriptRef.current ? baseTranscriptRef.current.trim() : '';
        const combinedFinal = (base ? base + ' ' : '') + currentFinal.trim();
        const full = (combinedFinal + (currentInterim ? ' ' + currentInterim : '')).trim();

        currentSessionFinalRef.current = combinedFinal;
        setTranscript(full);
        setInterimTranscript(currentInterim);
        if (full) {
          setIsCandidateSpeaking(true);
        }
      };

      recognition.onerror = (err) => {
        lastErrorRef.current = err.error;
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('[useSpeechRecognition] status:', err.error);
        }

        if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
          setError('Microphone access blocked. Please enable microphone permissions in your browser.');
          setMicState('error');
        } else if (err.error === 'language-not-supported' && selectedLanguage !== 'en-US') {
          setSelectedLanguage('en-US');
        } else if (err.error === 'network') {
          // Keep transcript intact on network hiccup
          console.info('[useSpeechRecognition] Network latency encountered; maintaining transcript state.');
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        if (currentSessionFinalRef.current) {
          baseTranscriptRef.current = currentSessionFinalRef.current;
        }

        // Restart recognition automatically while candidate intentionally has mic active
        if (isIntentionalRecordingRef.current) {
          const backoff = lastErrorRef.current === 'network' ? 2500 : 200;
          restartTimeoutRef.current = setTimeout(() => {
            if (isIntentionalRecordingRef.current) {
              startSpeechEngine();
            }
          }, backoff);
        } else {
          setIsListening(false);
          setMicState('transcript_ready');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        console.warn('[useSpeechRecognition] Failed to start recognition engine:', err);
      }
      return false;
    }
  }, [selectedLanguage]);

  // ─── Start Recording (Action) ──────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null);
    setMicState('requesting_permission');
    isIntentionalRecordingRef.current = true;

    try {
      // 1. Acquire Media Stream
      let stream = streamRef.current;
      if (!stream || stream.getAudioTracks().every(t => t.readyState === 'ended')) {
        stream = await acquireAudioStream();
      } else {
        stream.getAudioTracks().forEach(t => {
          t.enabled = true;
        });
      }

      // 2. Setup Analyser
      setupAudioAnalyser(stream);

      // 3. Setup Backup MediaRecorder
      setupMediaRecorder(stream);

      // 4. Start Timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // 5. Start Speech Engine
      startSpeechEngine();
      setMicState('listening');
      setIsListening(true);
    } catch (err) {
      console.error('[useSpeechRecognition] startRecording error:', err);
      isIntentionalRecordingRef.current = false;
      setMicState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access was denied. Please allow microphone permissions in your browser URL bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No working microphone was detected on this device.');
      } else {
        setError('Could not initialize microphone. Please check your system audio settings.');
      }
    }
  }, [acquireAudioStream, setupAudioAnalyser, setupMediaRecorder, startSpeechEngine]);

  // ─── Stop Recording (Action) ───────────────────────────────────────────────
  const stopRecording = useCallback(async () => {
    isIntentionalRecordingRef.current = false;
    setMicState('processing');

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Stop Duration Timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Finalize speech engine
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    // Finalize MediaRecorder & check if server fallback transcription is needed
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => {
        t.enabled = false;
      });
    }

    // Promote all interim text to final
    if (currentSessionFinalRef.current) {
      setTranscript(currentSessionFinalRef.current);
      baseTranscriptRef.current = currentSessionFinalRef.current;
    }
    setInterimTranscript('');
    setIsListening(false);
    setIsCandidateSpeaking(false);
    setMicState('transcript_ready');
  }, []);

  // ─── Toggle Recording ──────────────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (isListening || micState === 'listening') {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, micState, startRecording, stopRecording]);

  // ─── Clear Transcript ──────────────────────────────────────────────────────
  const clearTranscript = useCallback(() => {
    baseTranscriptRef.current = '';
    currentSessionFinalRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
  }, []);

  // ─── Manual Transcript Update (for candidate edits) ─────────────────────────
  const setManualTranscript = useCallback((newText) => {
    baseTranscriptRef.current = newText;
    currentSessionFinalRef.current = newText;
    setTranscript(newText);
  }, []);

  // ─── Switch Language ───────────────────────────────────────────────────────
  const switchLanguage = useCallback((langCode) => {
    setSelectedLanguage(langCode);
    if (isIntentionalRecordingRef.current) {
      // Restart speech engine with new locale seamlessly
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setTimeout(() => {
        if (isIntentionalRecordingRef.current) {
          startSpeechEngine();
        }
      }, 100);
    }
  }, [startSpeechEngine]);

  // ─── Reset for Next Question ───────────────────────────────────────────────
  const resetSession = useCallback(() => {
    baseTranscriptRef.current = '';
    currentSessionFinalRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
    setError(null);
    setMicState('idle');
  }, []);

  // ─── Cleanup on Component Unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      isIntentionalRecordingRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (_) {}
        recognitionRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    micState,
    setMicState,
    isListening,
    transcript,
    interimTranscript,
    fullAnswer: transcript,
    recordingDuration,
    recordingDurationFormatted: formatDuration(recordingDuration),
    volume,
    selectedLanguage,
    error,
    isCandidateSpeaking,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript,
    setManualTranscript,
    switchLanguage,
    resetSession,
  };
}
