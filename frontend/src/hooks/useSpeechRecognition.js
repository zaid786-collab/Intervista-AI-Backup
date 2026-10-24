import { useState, useEffect, useRef, useCallback } from 'react';
import { apiTranscribeAudio } from '../utils/api';

/**
 * Production-ready Speech Recognition & Microphone Hook for Intervista AI.
 *
 * Implements real-time Speech-to-Text via Web Speech API (window.SpeechRecognition / window.webkitSpeechRecognition)
 * with robust resultIndex handling, finalized vs. interim text accumulation, manual editing support,
 * volume analysis, background silence fallback to Groq Whisper, and seamless recovery from pauses and network drops.
 */
export function useSpeechRecognition({
  initialLanguage = 'en-IN',
  selectedMicId = null,
  sessionId = null,
  questionId = null,
  isInterviewerSpeaking = false,
  onAudioData = null,
} = {}) {
  // ─── State Machine ─────────────────────────────────────────────────────────
  const [micState, setMicState] = useState('idle'); // 'idle' | 'requesting_permission' | 'listening' | 'paused' | 'processing' | 'transcript_ready' | 'error'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [error, setError] = useState(null);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // ─── Internal Refs ─────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const restartTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // committedFinalRef stores all finalized sentences for the current answer
  const committedFinalRef = useRef('');
  // interimRef stores temporary non-final speech
  const interimRef = useRef('');

  const isIntentionalRecordingRef = useRef(false);
  const isRecognitionStartingRef = useRef(false);
  const isPausedBySystemRef = useRef(false);
  const isInterviewerSpeakingRef = useRef(isInterviewerSpeaking);
  const consecutiveErrorsRef = useRef(0);
  const activeLangRef = useRef(initialLanguage || 'en-IN');
  const lastSpeechTimeRef = useRef(0);
  const candidateHadVoiceRef = useRef(false);
  const isBackgroundTranscribingRef = useRef(false);

  // Hardware acoustic shield: mute mic tracks & stop recognition when AI is speaking
  useEffect(() => {
    isInterviewerSpeakingRef.current = isInterviewerSpeaking;
    if (isInterviewerSpeaking) {
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => { t.enabled = false; });
      }
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
      isRecognitionStartingRef.current = false;
      setIsListening(false);
      setMicState('paused');
    } else {
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => { t.enabled = true; });
      }
    }
  }, [isInterviewerSpeaking]);

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

  // ─── Background Server Fallback Trigger ────────────────────────────────────
  const attemptBackgroundTranscribe = useCallback(async () => {
    if (isBackgroundTranscribingRef.current || !audioChunksRef.current.length) return;
    const currentText = committedFinalRef.current.trim();
    // Only trigger auto-transcribe fallback if Web Speech produced no text or very little
    if (currentText.length > 25) return;

    const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const audioBlob = new Blob(audioChunksRef.current, { type: mime });
    if (audioBlob.size < 2000) return;

    isBackgroundTranscribingRef.current = true;
    setIsTranscribing(true);
    try {
      const res = await apiTranscribeAudio({
        audioBlob,
        language: activeLangRef.current || selectedLanguage,
        sessionId,
        questionId,
      });

      if (res?.success && res.transcript && res.transcript.trim()) {
        const serverText = res.transcript.trim();
        // Discard short hallucination phrases like "Thank you." on silence
        if (serverText.length > 3 && !/^(thank you\.?|you|bye)$/i.test(serverText)) {
          if (!committedFinalRef.current.trim()) {
            committedFinalRef.current = serverText;
            setTranscript(serverText);
          } else if (serverText.length > committedFinalRef.current.length * 1.5) {
            committedFinalRef.current = serverText;
            setTranscript(serverText);
          }
        }
      }
    } catch (e) {
      console.warn('[useSpeechRecognition] Auto-transcribe background error:', e);
    } finally {
      isBackgroundTranscribingRef.current = false;
      setIsTranscribing(false);
    }
  }, [selectedLanguage, sessionId, questionId]);

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

      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch (_) {}
        sourceNodeRef.current = null;
      }

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceNodeRef.current = source;

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

        if (vol > 14 && isIntentionalRecordingRef.current && !isPausedBySystemRef.current && !isInterviewerSpeakingRef.current && !(window.speechSynthesis && window.speechSynthesis.speaking)) {
          setIsCandidateSpeaking(true);
          lastSpeechTimeRef.current = Date.now();
          candidateHadVoiceRef.current = true;
        } else if (vol <= 8 || isInterviewerSpeakingRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) {
          setIsCandidateSpeaking(false);
          // If candidate was speaking and has now paused for 1.8 seconds, check fallback
          if (candidateHadVoiceRef.current && (Date.now() - lastSpeechTimeRef.current > 1800) && !isInterviewerSpeakingRef.current) {
            candidateHadVoiceRef.current = false;
            attemptBackgroundTranscribe();
          }
        }

        animFrameRef.current = requestAnimationFrame(trackAudioLevel);
      };

      trackAudioLevel();
    } catch (err) {
      console.warn('[useSpeechRecognition] Analyser setup error:', err);
    }
  }, [onAudioData, attemptBackgroundTranscribe]);

  // ─── Setup MediaRecorder for Backup Audio Blob ─────────────────────────────
  const setupMediaRecorder = useCallback((stream) => {
    try {
      if (!window.MediaRecorder) return;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        return; // already actively recording
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }

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
          // Ignore audio chunks captured while interviewer is speaking to prevent Whisper self-echo
          if (isInterviewerSpeakingRef.current || isPausedBySystemRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) {
            return;
          }
          audioChunksRef.current.push(event.data);
          setHasRecordedAudio(true);
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
    if (isPausedBySystemRef.current || isInterviewerSpeakingRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) {
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      // Client-side Web Speech not available, but audio recorder + backend Whisper will handle speech
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
        // Echo Shield: Discard any speech event captured while AI interviewer is speaking out loud
        if (isInterviewerSpeakingRef.current || isPausedBySystemRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) {
          return;
        }
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
          lastSpeechTimeRef.current = Date.now();
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
        }
      };

      recognition.onend = () => {
        isRecognitionStartingRef.current = false;
        recognitionRef.current = null;

        // Commit any pending interim transcript before restart so candidate words aren't lost
        if (interimRef.current && interimRef.current.trim()) {
          const existing = committedFinalRef.current ? committedFinalRef.current.trim() : '';
          committedFinalRef.current = existing
            ? `${existing} ${interimRef.current.trim()}`
            : interimRef.current.trim();
          interimRef.current = '';
          setInterimTranscript('');
          setTranscript(committedFinalRef.current);
        }

        // If candidate intentionally wants to record and not paused by system, maintain continuous listening
        if (isIntentionalRecordingRef.current && !isPausedBySystemRef.current) {
          const delay = consecutiveErrorsRef.current > 0 ? 400 : 70;
          restartTimeoutRef.current = setTimeout(() => {
            if (isIntentionalRecordingRef.current && !isPausedBySystemRef.current) {
              startSpeechEngine();
            }
          }, delay);
        } else if (!isPausedBySystemRef.current) {
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
      return false;
    }
  }, []);

  // ─── Start Recording (Action) ──────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    // If AI interviewer is currently speaking out loud, defer mic activation until speech completes
    if (isInterviewerSpeakingRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) {
      isPausedBySystemRef.current = true;
      return;
    }
    isPausedBySystemRef.current = false;
    setError(null);
    setMicState('listening');
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

  // ─── Pause Listening (used when Interviewer is speaking) ───────────────────
  const pauseListening = useCallback(() => {
    isPausedBySystemRef.current = true;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    // Mute hardware microphone tracks to prevent acoustic feedback
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = false; });
    }
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
    isRecognitionStartingRef.current = false;
    interimRef.current = '';
    setInterimTranscript('');
    setIsListening(false);
    setMicState('paused');
  }, []);

  // ─── Resume Listening (used when Interviewer finishes speaking) ────────────
  const resumeListening = useCallback(() => {
    isPausedBySystemRef.current = false;
    startRecording();
  }, [startRecording]);

  // ─── Stop Recording And Transcribe (Action with Full Fallback) ─────────────
  const stopRecordingAndTranscribe = useCallback(async () => {
    isIntentionalRecordingRef.current = false;
    isRecognitionStartingRef.current = false;
    isPausedBySystemRef.current = false;
    setMicState('processing');
    setIsTranscribing(true);

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
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

    // Promote any leftover interim speech to committed text
    if (interimRef.current && interimRef.current.trim()) {
      const existing = committedFinalRef.current ? committedFinalRef.current.trim() : '';
      committedFinalRef.current = existing
        ? `${existing} ${interimRef.current.trim()}`
        : interimRef.current.trim();
      interimRef.current = '';
    }

    // Flush final audio data from MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    // Short wait for MediaRecorder ondataavailable to receive final chunk
    await new Promise(r => setTimeout(r, 160));

    let finalAnswer = committedFinalRef.current ? committedFinalRef.current.trim() : '';

    // If Web Speech produced no text or very short response, request Groq Whisper server transcription
    if ((!finalAnswer || finalAnswer.length < 15) && audioChunksRef.current.length > 0) {
      try {
        const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        if (audioBlob.size > 1500) {
          const sttRes = await apiTranscribeAudio({
            audioBlob,
            language: activeLangRef.current || selectedLanguage,
            sessionId,
            questionId,
          });
          if (sttRes?.success && sttRes.transcript && sttRes.transcript.trim()) {
            const serverText = sttRes.transcript.trim();
            if (!/^(thank you\.?|you|bye)$/i.test(serverText)) {
              if (!finalAnswer || serverText.length > finalAnswer.length) {
                finalAnswer = serverText;
                committedFinalRef.current = serverText;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[useSpeechRecognition] Server transcription fallback error:', err);
      }
    }

    setTranscript(finalAnswer);
    setInterimTranscript('');
    setIsListening(false);
    setIsCandidateSpeaking(false);
    setIsTranscribing(false);
    setMicState('transcript_ready');

    return finalAnswer;
  }, [selectedLanguage, sessionId, questionId]);

  // ─── Stop Recording (Simple) ───────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    return stopRecordingAndTranscribe();
  }, [stopRecordingAndTranscribe]);

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
    audioChunksRef.current = [];
    setHasRecordedAudio(false);
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

    if (isIntentionalRecordingRef.current && !isPausedBySystemRef.current) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setTimeout(() => {
        if (isIntentionalRecordingRef.current && !isPausedBySystemRef.current) {
          startSpeechEngine();
        }
      }, 80);
    }
  }, [startSpeechEngine]);

  // ─── Reset for Next Question ───────────────────────────────────────────────
  const resetSession = useCallback(() => {
    committedFinalRef.current = '';
    interimRef.current = '';
    audioChunksRef.current = [];
    setHasRecordedAudio(false);
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
      isPausedBySystemRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch (_) {}
        sourceNodeRef.current = null;
      }

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
    hasRecordedAudio,
    isTranscribing,
    startRecording,
    stopRecording,
    stopRecordingAndTranscribe,
    pauseListening,
    resumeListening,
    toggleRecording,
    clearTranscript,
    setManualTranscript,
    switchLanguage,
    resetSession,
  };
}
