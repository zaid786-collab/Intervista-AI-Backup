import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  Play,
  RotateCw,
  ShieldCheck,
  ArrowRight,
  Info,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export default function DeviceSetupModal({
  isOpen,
  onClose,
  config,
  onEnterRoom,
}) {
  // Device lists
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [selectedMicId, setSelectedMicId] = useState('');

  // Permission & Stream States
  const [cameraStatus, setCameraStatus] = useState('checking'); // 'checking' | 'granted' | 'denied' | 'missing'
  const [micStatus, setMicStatus] = useState('checking');       // 'checking' | 'granted' | 'denied' | 'missing'
  const [screenStatus, setScreenStatus] = useState('idle');     // 'idle' | 'active' | 'denied'

  // Device Toggle States
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);

  // Mic Activity Level (0 - 100)
  const [micVolume, setMicVolume] = useState(0);
  const [hasVoiceDetected, setHasVoiceDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Speaker testing state
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);

  // Selected Interviewer Persona (Mr. J. Chen vs Sophia Sterling)
  const [interviewerPersona, setInterviewerPersona] = useState(config?.interviewerPersona || 'chen');

  // Media Stream references
  const videoPreviewRef = useRef(null);
  const screenPreviewRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Enumerate devices helper
  const updateDeviceList = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevs = devices.filter(d => d.kind === 'videoinput');
      const aDevs = devices.filter(d => d.kind === 'audioinput');

      setVideoDevices(vDevs);
      setAudioDevices(aDevs);

      if (vDevs.length > 0 && !selectedCameraId) setSelectedCameraId(vDevs[0].deviceId);
      if (aDevs.length > 0 && !selectedMicId) setSelectedMicId(aDevs[0].deviceId);
    } catch (err) {
      console.warn('Failed to enumerate media devices:', err);
    }
  };

  // Start Camera Stream
  const initCamera = async (deviceId = selectedCameraId) => {
    setErrorMessage('');
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('missing');
        setErrorMessage('Webcam access is not supported by this browser.');
        return;
      }

      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      setCameraStatus('granted');

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      await updateDeviceList();
    } catch (err) {
      console.warn('Camera permission or device error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('missing');
        setErrorMessage('No camera device was detected on your system.');
      } else {
        setCameraStatus('denied');
        setErrorMessage(`Camera error: ${err.message || 'Unable to access video device.'}`);
      }
    }
  };

  // Start Microphone Stream & Audio Analyzer
  const initMicrophone = async (deviceId = selectedMicId) => {
    try {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setMicStatus('missing');
        return;
      }

      const constraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;
      setMicStatus('granted');

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volPercent = Math.min(100, Math.round((average / 128) * 100));
        setMicVolume(volPercent);

        if (volPercent > 12) {
          setHasVoiceDetected(true);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      await updateDeviceList();
    } catch (err) {
      console.warn('Microphone permission or device error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicStatus('denied');
        setErrorMessage('Microphone access was denied. You may still proceed with text answers.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicStatus('missing');
        setErrorMessage('No microphone device was detected on your system.');
      } else {
        setMicStatus('denied');
      }
    }
  };

  // Toggle Screen Sharing test
  const handleToggleScreenShare = async () => {
    if (screenStatus === 'active') {
      stopScreenShare();
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setErrorMessage('Screen sharing is not supported by your browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      setScreenStatus('active');

      if (screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = stream;
        screenPreviewRef.current.play().catch(() => {});
      }

      // Handle user stopping screen share via browser floating bar
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('Screen share cancelled or error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setScreenStatus('idle'); // Cancelled by user - normal optional behaviour
      } else {
        setScreenStatus('denied');
        setErrorMessage('Could not initialize screen capture: ' + (err.message || 'Permission cancelled'));
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (screenPreviewRef.current) {
      screenPreviewRef.current.srcObject = null;
    }
    setScreenStatus('idle');
  };

  // Speaker Test Tone
  const playTestSpeakerTone = () => {
    try {
      setIsPlayingTestTone(true);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz (A4)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // Arpeggio to 880 Hz

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.75);

      setTimeout(() => {
        setIsPlayingTestTone(false);
        ctx.close().catch(() => {});
      }, 800);
    } catch (e) {
      setIsPlayingTestTone(false);
    }
  };

  // Start device checks on modal open
  useEffect(() => {
    if (isOpen) {
      initCamera();
      initMicrophone();
    } else {
      stopAllMedia();
    }
    return () => {
      stopAllMedia();
    };
  }, [isOpen]);

  // Clean teardown helper
  const stopAllMedia = () => {
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
    stopScreenShare();
  };

  const handleCameraChange = (e) => {
    const devId = e.target.value;
    setSelectedCameraId(devId);
    initCamera(devId);
  };

  const handleMicChange = (e) => {
    const devId = e.target.value;
    setSelectedMicId(devId);
    initMicrophone(devId);
  };

  const handleEnterInterview = () => {
    // Preserve stream references or state to hand off smoothly to the room
    const sessionSettings = {
      ...config,
      cameraStatus,
      micStatus,
      isCameraActive,
      isMicActive,
      isScreenShareActive: screenStatus === 'active',
      interviewerPersona,
      interviewerName: interviewerPersona === 'david' ? 'David Chen' : 'Sophia Sterling',
      interviewerTitle: interviewerPersona === 'david' ? 'Senior Engineering Director' : 'VP of Engineering',
      selectedCameraId,
      selectedMicId,
    };

    // Stop setup preview streams so the full interview room can acquire fresh tracks without conflicts
    stopAllMedia();

    if (onEnterRoom) {
      onEnterRoom(sessionSettings);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(14px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0C0D11',
          border: '1px solid rgba(217, 183, 122, 0.3)',
          borderRadius: '24px',
          maxWidth: '920px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 50px rgba(217, 183, 122, 0.1)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(217, 183, 122, 0.15)',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <Sparkles size={12} />
                Step 2 of 2 · Ready Room
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                Hardware & Identity Calibration
              </span>
            </div>
            <h2 className="serif-heading" style={{ fontSize: '1.85rem', margin: 0 }}>
              Device Permissions & <span style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Interview Setup</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Error Banner if permissions denied */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '1.75rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid: Left Column = Video & Mic Preview, Right Column = Configuration & Device Selectors */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}
          className="setup-grid"
        >
          {/* Left Column: Live Webcam Stream & Microphone Activity Visualizer */}
          <div>
            {/* Live Camera Box */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: '#05070A',
                borderRadius: '16px',
                overflow: 'hidden',
                border: cameraStatus === 'granted' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror candidate webcam preview
                  display: cameraStatus === 'granted' && isCameraActive ? 'block' : 'none',
                }}
              />

              {/* Inactive or Denied Camera Overlay */}
              {(!isCameraActive || cameraStatus !== 'granted') && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    color: 'var(--text-secondary)',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cameraStatus === 'denied' ? '#EF4444' : 'var(--text-secondary)',
                    }}
                  >
                    <CameraOff size={24} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {cameraStatus === 'denied' ? 'Camera Permission Denied' : 'Webcam Preview Off'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', maxWidth: '240px' }}>
                    {cameraStatus === 'denied'
                      ? 'Enable camera permissions in your address bar to see your video preview.'
                      : 'Camera preview is currently disabled. You can still test with microphone or text.'}
                  </div>
                </div>
              )}

              {/* Top Camera Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: cameraStatus === 'granted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.65)',
                  border: cameraStatus === 'granted' ? '1px solid #22C55E' : '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: cameraStatus === 'granted' ? '#4ADE80' : 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: cameraStatus === 'granted' ? '#22C55E' : '#EF4444',
                    boxShadow: cameraStatus === 'granted' ? '0 0 8px #22C55E' : 'none',
                  }}
                />
                <span>{cameraStatus === 'granted' ? 'Camera Live' : 'Camera Disconnected'}</span>
              </div>

              {/* Bottom Camera Toggle Button Overlay */}
              <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isCameraActive ? <Camera size={14} /> : <CameraOff size={14} color="#EF4444" />}
                  <span>{isCameraActive ? 'Mute Video' : 'Enable Video'}</span>
                </button>
              </div>
            </div>

            {/* Microphone Volume & Audio Activity Waveform */}
            <div
              style={{
                backgroundColor: '#12151E',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem 1.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: micStatus === 'granted' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: micStatus === 'granted' ? '#22C55E' : '#EF4444',
                    }}
                  >
                    {isMicActive && micStatus === 'granted' ? <Mic size={16} /> : <MicOff size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>
                      Microphone Activity Test
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {hasVoiceDetected
                        ? 'Voice input calibrated successfully!'
                        : 'Speak into your microphone to verify detection'}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: micVolume > 15 ? '#4ADE80' : 'var(--text-tertiary)',
                  }}
                >
                  {micVolume}%
                </span>
              </div>

              {/* Volume Indicator Bar */}
              <div
                style={{
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${micVolume}%`,
                    backgroundColor: micVolume > 60 ? '#22C55E' : micVolume > 20 ? 'var(--accent-gold)' : '#3B82F6',
                    boxShadow: micVolume > 15 ? '0 0 10px rgba(34, 197, 94, 0.6)' : 'none',
                    transition: 'width 0.08s ease-out',
                  }}
                />
              </div>

              {/* Simulated Waveform Bars for visual feedback */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '24px' }}>
                {[12, 28, 45, 65, 80, 50, 70, 90, 60, 40, 75, 85, 45, 30, 20].map((h, i) => {
                  const dynamicHeight = Math.max(4, Math.round((h * (micVolume + 10)) / 100));
                  return (
                    <div
                      key={i}
                      style={{
                        width: '3.5px',
                        height: `${dynamicHeight}px`,
                        backgroundColor: micVolume > 10 ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '2px',
                        transition: 'height 0.06s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Device Configuration, Speaker Test, Screen Share & Interviewer Persona */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Interviewer Persona Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.55rem' }}>
                Select AI Interviewer Persona
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setInterviewerPersona('chen')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: (interviewerPersona === 'chen' || interviewerPersona === 'david') ? 'rgba(56, 189, 248, 0.12)' : '#12151E',
                    border: (interviewerPersona === 'chen' || interviewerPersona === 'david') ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                    Mr. J. Chen
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600 }}>
                    Hiring Manager
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Corporate Executive Suite · Reference Simulation
                  </div>
                </div>

                <div
                  onClick={() => setInterviewerPersona('sophia')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: interviewerPersona === 'sophia' ? 'rgba(217, 183, 122, 0.12)' : '#12151E',
                    border: interviewerPersona === 'sophia' ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                    Sophia Sterling
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    VP of Engineering
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Architecture & Engineering Leadership Focus
                  </div>
                </div>
              </div>
            </div>

            {/* Camera Selector Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Camera Source
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedCameraId}
                  onChange={handleCameraChange}
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.25rem 0.7rem 0.95rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {videoDevices.length > 0 ? (
                    videoDevices.map((d, idx) => (
                      <option key={d.deviceId || idx} value={d.deviceId} style={{ backgroundColor: '#12151E' }}>
                        {d.label || `Camera ${idx + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="" style={{ backgroundColor: '#12151E' }}>Default System Camera</option>
                  )}
                </select>
                <ChevronDown size={15} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Microphone Selector Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Microphone Source
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedMicId}
                  onChange={handleMicChange}
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.25rem 0.7rem 0.95rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((d, idx) => (
                      <option key={d.deviceId || idx} value={d.deviceId} style={{ backgroundColor: '#12151E' }}>
                        {d.label || `Microphone ${idx + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="" style={{ backgroundColor: '#12151E' }}>Default System Microphone</option>
                  )}
                </select>
                <ChevronDown size={15} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Sound Output / Speaker Test Button */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Audio Output / Speaker Check
              </label>
              <button
                type="button"
                onClick={playTestSpeakerTone}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: isPlayingTestTone ? 'rgba(217, 183, 122, 0.2)' : '#12151E',
                  border: isPlayingTestTone ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isPlayingTestTone ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={15} />
                  <span>{isPlayingTestTone ? 'Playing Test Sound...' : 'Test Speaker Audio'}</span>
                </span>
                <Play size={13} />
              </button>
            </div>

            {/* Optional Screen Share Permission Test */}
            <div
              style={{
                backgroundColor: '#12151E',
                border: screenStatus === 'active' ? '1px solid #22C55E' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.9rem 1.1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Monitor size={16} color={screenStatus === 'active' ? '#22C55E' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFFFFF' }}>
                    Screen Sharing (Optional)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: screenStatus === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    color: screenStatus === 'active' ? '#4ADE80' : 'var(--text-tertiary)',
                  }}
                >
                  {screenStatus === 'active' ? 'Active' : 'Optional'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.75rem 0' }}>
                Share your screen if you would like to showcase architecture diagrams or code during the interview.
              </p>
              <button
                type="button"
                onClick={handleToggleScreenShare}
                style={{
                  padding: '0.5rem 0.95rem',
                  borderRadius: '8px',
                  backgroundColor: screenStatus === 'active' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  border: screenStatus === 'active' ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: screenStatus === 'active' ? '#F87171' : 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                {screenStatus === 'active' ? <MonitorOff size={13} /> : <Monitor size={13} />}
                <span>{screenStatus === 'active' ? 'Stop Screen Sharing' : 'Grant Screen Share Access'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Target Role & Company pill recap */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Simulating for:</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(217, 183, 122, 0.1)',
                border: '1px solid rgba(217, 183, 122, 0.25)',
                color: 'var(--accent-gold)',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
              }}
            >
              <strong>{config?.company || 'Top Tech'}</strong> · {config?.role || 'Software Engineer'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              ({config?.level || 'Mid Level'} · {config?.duration || '30 min'})
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.8rem 1.4rem',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleEnterInterview}
              className="btn-primary"
              style={{
                padding: '0.85rem 2.2rem',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-gold)',
                color: '#080808',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 4px 24px rgba(217, 183, 122, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Enter Interview Room</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .setup-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
