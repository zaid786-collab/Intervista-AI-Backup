import { useState, useEffect, useRef, useCallback } from 'react';
import { apiTranscribeAudio } from '../utils/api';

/**
 * Production-ready Speech Recognition & Microphone Hook for Intervista AI.
 *
 * Implements real-time Speech-to-Text via Web Speech API (window.SpeechRecognition / window.webkitSpeechRecognition)
 * with robust resultIndex handling, finalized vs. interim text accumulation, manual editing support,
 * volume analysis, audio recording fallback, and seamless recovery from pauses and network drops.
 */
export function useSpeechRecognition({
  initialLanguage = 'en-IN',
  selectedMicId = null,
  sessionId = null,
  questionId = null,
  onAudioData = null,
} = {}) {
  // ─── State Machine ─────────────────────────────────────────────────────────
  const [micState, setMicState] = useState('idle'); // 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'transcript_ready' | 'error'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [error, setError] = useState(null);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // ─── Internal Refs ─────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const restartTimeoutRef = useRef(null);
  
  // committedFinalRef stores all finalized sentences for the current answer
  const committedFinalRef = useRef('');
  // interimRef stores temporary non-final speech
  const interimRef = useRef('');
  
  const isIntentionalRecordingRef = useRef(false);
  const isRecognitionStartingRef = useRef(false);
  const consecutiveErrorsRef = useRef(0);
  const activeLangRef = useRef(initialLanguage || 'en-IN');

  useEffect(() => {
    activeLangRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Format Duration MM:SS
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

  // ─── Acquire Microphone Stream ─────────────────────────────────────────────
  const acquireAudioStream = useCallback(async () => {
    let stream = null;

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
        console.warn('[useSpeechRecognition] Device ID audio constraint failed, falling back to default:', err);
      }
    }

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
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err2) {
          console.error('[useSpeechRecognition] Microphone permission failed:', err2);
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
        } else if (vol <= 8) {
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

  // ─── Start / Restart Browser Speech Recognition Engine ────────────────────
  const startSpeechEngine = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Browser speech recognition is not supported in this browser. Please use Google Chrome, Brave, Edge, or Safari.');
      return false;
    }

    if (isRecognitionStartingRef.current) return true;

    // Clean up existing recognition instance before recreating
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      const lang = activeLangRef.current || 'en-IN';
      recognition.lang = lang;

      recognition.onstart = () => {
        isRecognitionStartingRef.current = false;
        setIsListening(true);
        setMicState('listening');
        setError(null);
        consecutiveErrorsRef.current = 0;
      };

      recognition.onresult = (event) => {
        consecutiveErrorsRef.current = 0;
        let newlyFinalized = '';
        let currentInterim = '';

        // Process results using event.resultIndex as required by W3C standard
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const piece = item[0].transcript;
            if (item.isFinal) {
              newlyFinalized += (newlyFinalized ? ' ' : '') + piece.trim();
            } else {
              currentInterim += piece;
            }
          }
        }

        // Append any new finalized segment to committedFinalRef
        if (newlyFinalized.trim()) {
          const existing = committedFinalRef.current ? committedFinalRef.current.trim() : '';
          committedFinalRef.current = existing
            ? `${existing} ${newlyFinalized.trim()}`
            : newlyFinalized.trim();
        }

        interimRef.current = currentInterim.trim();
        setInterimTranscript(currentInterim.trim());

        // Derive full display text = committed final text + active interim text
        const base = committedFinalRef.current ? committedFinalRef.current.trim() : '';
        const combined = base
          ? (currentInterim.trim() ? `${base} ${currentInterim.trim()}` : base)
          : currentInterim.trim();

        setTranscript(combined);

        if (combined) {
          setIsCandidateSpeaking(true);
        }
      };

      recognition.onerror = (err) => {
        isRecognitionStartingRef.current = false;
        const errType = err.error;

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setError('Microphone access blocked. Please enable microphone permissions in your browser URL bar.');
          setMicState('error');
          isIntentionalRecordingRef.current = false;
        } else if (errType === 'language-not-supported' && activeLangRef.current !== 'en-US') {
          activeLangRef.current = 'en-US';
          setSelectedLanguage('en-US');
        } else if (errType === 'network') {
          consecutiveErrorsRef.current += 1;
          // Soft network warning; don't terminate immediately, let onend handle graceful backoff
          if (consecutiveErrorsRef.current >= 4) {
            console.warn('[useSpeechRecognition] Repeated network status from speech engine.');
          }
        } else if (errType !== 'no-speech' && errType !== 'aborted') {
          console.warn('[useSpeechRecognition] status:', errType);
        }
      };

      recognition.onend = () => {
        isRecognitionStartingRef.current = false;
        recognitionRef.current = null;

        // If candidate intentionally wants to record, automatically restart engine to maintain continuous listening
        if (isIntentionalRecordingRef.current) {
          const delay = consecutiveErrorsRef.current > 0 ? 500 : 120;
          restartTimeoutRef.current = setTimeout(() => {
            if (isIntentionalRecordingRef.current) {
              startSpeechEngine();
            }
          }, delay);
        } else {
          setIsListening(false);
          setMicState('transcript_ready');
        }
      };

      recognitionRef.current = recognition;
      isRecognitionStartingRef.current = true;
      recognition.start();
      return true;
    } catch (err) {
      isRecognitionStartingRef.current = false;
      if (err.name !== 'InvalidStateError') {
        console.warn('[useSpeechRecognition] Failed to start recognition engine:', err);
      }
      return false;
    }
  }, []);

  // ─── Start Recording (Action) ──────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null);
    setMicState('requesting_permission');
    isIntentionalRecordingRef.current = true;
    consecutiveErrorsRef.current = 0;

    try {
      // 1. Acquire Media Stream for audio analyser & MediaRecorder
      let stream = streamRef.current;
      if (!stream || stream.getAudioTracks().every(t => t.readyState === 'ended')) {
        stream = await acquireAudioStream();
      } else {
        stream.getAudioTracks().forEach(t => {
          t.enabled = true;
        });
      }

      // 2. Setup Analyser for volume visualization
      setupAudioAnalyser(stream);

      // 3. Setup Backup MediaRecorder
      setupMediaRecorder(stream);

      // 4. Start Duration Timer
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
    isRecognitionStartingRef.current = false;
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

    // Finalize speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    // Promote any leftover interim speech to committed text
    if (interimRef.current) {
      const existing = committedFinalRef.current ? committedFinalRef.current.trim() : '';
      committedFinalRef.current = existing
        ? `${existing} ${interimRef.current.trim()}`
        : interimRef.current.trim();
      interimRef.current = '';
    }

    const finalAnswer = committedFinalRef.current ? committedFinalRef.current.trim() : '';
    setTranscript(finalAnswer);
    setInterimTranscript('');

    // If Web Speech produced no text, attempt server-backed audio transcription fallback
    if (!finalAnswer && audioChunksRef.current.length > 0) {
      try {
        const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        if (audioBlob.size > 2000) {
          const sttRes = await apiTranscribeAudio({
            audioBlob,
            language: activeLangRef.current || selectedLanguage,
            sessionId,
            questionId,
          });
          if (sttRes?.success && sttRes.transcript) {
            committedFinalRef.current = sttRes.transcript;
            setTranscript(sttRes.transcript);
          }
        }
      } catch (err) {
        console.warn('[useSpeechRecognition] Server transcription fallback error:', err);
      }
    }

    setIsListening(false);
    setIsCandidateSpeaking(false);
    setMicState('transcript_ready');
  }, [selectedLanguage, sessionId, questionId]);

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
    committedFinalRef.current = '';
    interimRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
  }, []);

  // ─── Manual Transcript Update (for candidate manual typing & editing) ──────
  const setManualTranscript = useCallback((newText) => {
    committedFinalRef.current = newText;
    interimRef.current = '';
    setTranscript(newText);
    setInterimTranscript('');
  }, []);

  // ─── Switch Language ───────────────────────────────────────────────────────
  const switchLanguage = useCallback((langCode) => {
    setSelectedLanguage(langCode);
    activeLangRef.current = langCode;

    if (isIntentionalRecordingRef.current) {
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
    committedFinalRef.current = '';
    interimRef.current = '';
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
      isRecognitionStartingRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
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
