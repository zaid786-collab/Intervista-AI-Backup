import { FilesetResolver, FaceLandmarker, ObjectDetector } from "@mediapipe/tasks-vision";
import { VISION_CONFIG } from "./visionConfig.js";

/**
 * Extract Euler Angles (pitch, yaw, roll in degrees) from a 4x4 column-major transformation matrix
 */
function extractEulerAngles(matrix) {
  if (!matrix || matrix.length < 16) {
    return { pitch: 0, yaw: 0, roll: 0 };
  }

  // Column-major indices:
  // [0  4  8 12]
  // [1  5  9 13]
  // [2  6 10 14]
  // [3  7 11 15]
  const m00 = matrix[0], m10 = matrix[1], m20 = matrix[2];
  const m01 = matrix[4], m11 = matrix[5], m21 = matrix[6];
  const m02 = matrix[8], m12 = matrix[9], m22 = matrix[10];

  const sy = Math.sqrt(m00 * m00 + m10 * m10);
  const singular = sy < 1e-6;

  let pitch, yaw, roll;
  if (!singular) {
    pitch = Math.atan2(m21, m22);
    yaw = Math.atan2(-m20, sy);
    roll = Math.atan2(m10, m00);
  } else {
    pitch = Math.atan2(-m12, m11);
    yaw = Math.atan2(-m20, sy);
    roll = 0;
  }

  const radToDeg = 180 / Math.PI;
  return {
    pitch: pitch * radToDeg,
    yaw: yaw * radToDeg,
    roll: roll * radToDeg,
  };
}

export class VisionAnalyzer {
  constructor(config = {}) {
    this.config = { ...VISION_CONFIG, ...config };
    this.landmarker = null;
    this.objectDetector = null;
    this.isReady = false;
    this.isLoading = false;
    this.usingMediaPipe = false;
    this.hasFailed = false;
    this.failureReason = null;

    // Mobile Phone tracking
    this.phoneDetectedSamples = 0;
    this.phonePosturalSamples = 0;

    // Offscreen canvas for luminance, lighting, and fallback frame processing
    this.offscreenCanvas = null;
    this.lastFrameData = null;
    this.lastCentroid = null;

    // Aggregation & State tracking
    this.totalSamples = 0;
    this.faceDetectedSamples = 0;
    this.cameraFacingSamples = 0;
    this.lookingAwaySamples = 0;
    this.multipleFacesSamples = 0;
    this.lowLightingSamples = 0;
    this.optimalLightingSamples = 0;

    // Expression counters
    this.expressionDistribution = {
      neutral: 0,
      positive: 0,
      surprised: 0,
      tense: 0,
      expressive: 0,
    };
    this.expressivenessScores = [];

    // Temporal tracking for debounced sustained events
    this.events = [];
    this.currentAttentionAwayStart = null;
    this.currentFaceMissingStart = null;
    this.lastProcessedTimestamp = 0;

    // Anti-flicker smoothing & hysteresis buffers
    this.recentDirections = [];
    this.recentExpressions = [];
    this.confirmedDirection = "camera_facing";
    this.pendingDirection = null;
    this.pendingDirectionCount = 0;
  }

  async initialize() {
    if (this.isReady || this.isLoading) return true;
    this.isLoading = true;
    this.hasFailed = false;

    // Set up canvas immediately so analysis can run with zero latency
    if (typeof document !== "undefined") {
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = 160;
      this.offscreenCanvas.height = 120;
    }
    // Mark as ready for fallback processing right away
    this.isReady = true;

    // Asynchronously attempt to initialize MediaPipe FaceLandmarker
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 4,
      });

      // Initialize real-time ObjectDetector for mobile phone detection
      try {
        this.objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "GPU",
          },
          scoreThreshold: 0.65,
          runningMode: "VIDEO",
        });
        console.log("[ComputerVision] MediaPipe ObjectDetector active with GPU delegate (Strict Mode >= 0.65).");
      } catch (objGpuErr) {
        try {
          this.objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
              delegate: "CPU",
            },
            scoreThreshold: 0.65,
            runningMode: "VIDEO",
          });
          console.log("[ComputerVision] MediaPipe ObjectDetector active with CPU delegate (Strict Mode >= 0.65).");
        } catch (objCpuErr) {
          console.warn("[ComputerVision] ObjectDetector init failed:", objCpuErr.message);
        }
      }

      this.usingMediaPipe = true;
      this.isLoading = false;
      console.log("[ComputerVision] MediaPipe FaceLandmarker active with GPU delegate.");
      return true;
    } catch (gpuErr) {
      console.warn("[ComputerVision] GPU delegate init failed, attempting CPU:", gpuErr.message);
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 4,
        });

        try {
          this.objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
              delegate: "CPU",
            },
            scoreThreshold: 0.18,
            runningMode: "VIDEO",
          });
          console.log("[ComputerVision] MediaPipe ObjectDetector active with CPU delegate.");
        } catch (objErr) {
          console.warn("[ComputerVision] ObjectDetector CPU fallback error:", objErr.message);
        }

        this.usingMediaPipe = true;
        this.isLoading = false;
        console.log("[ComputerVision] MediaPipe FaceLandmarker active with CPU fallback.");
        return true;
      } catch (cpuErr) {
        console.warn("[ComputerVision] MediaPipe CDN unavailable; active on local canvas vision engine:", cpuErr.message);
        this.usingMediaPipe = false;
        this.isLoading = false;
        return true;
      }
    }
  }

  /**
   * Process a single video frame with real-time eye gaze tracking
   * @param {HTMLVideoElement} videoElement
   * @param {number} timestampMs
   * @returns {Object|null} Live frame analysis result
   */
  analyzeFrame(videoElement, timestampMs = performance.now()) {
    if (!videoElement || videoElement.readyState < 2) {
      return null;
    }

    // Monotonic timestamp requirement for MediaPipe VIDEO mode
    const currentTime = timestampMs > this.lastProcessedTimestamp ? timestampMs : this.lastProcessedTimestamp + 1;
    this.lastProcessedTimestamp = currentTime;

    // Real-time mobile phone detection inference
    let phoneDetected = false;
    let phoneConfidence = 0;
    let candidateBoundingBox = null;

    if (this.objectDetector && videoElement) {
      try {
        const objResults = this.objectDetector.detectForVideo(videoElement, currentTime);
        if (objResults && objResults.detections && objResults.detections.length > 0) {
          for (const d of objResults.detections) {
            for (const cat of d.categories) {
              const name = (cat.categoryName || cat.displayName || "").toLowerCase().trim();
              // STRICT: Only match genuine cell phones / mobile phones with high confidence
              // Never match generic "device", "remote", "camera", or "electronic"
              if (name === "cell phone" || name === "mobile phone") {
                if (cat.score >= 0.70) {
                  phoneDetected = true;
                  phoneConfidence = Math.max(phoneConfidence, cat.score);
                  if (d.boundingBox) {
                    candidateBoundingBox = {
                      originX: d.boundingBox.originX || 0,
                      originY: d.boundingBox.originY || 0,
                      width: d.boundingBox.width || 0,
                      height: d.boundingBox.height || 0,
                    };
                  }
                }
              }
            }
          }
        }
      } catch (detErr) {
        // Continue without interrupting face analysis
      }
    }

    const phoneInfo = { phoneDetected, phoneConfidence, candidateBoundingBox };


    // If MediaPipe is active, run FaceLandmarker inference
    if (this.usingMediaPipe && this.landmarker) {
      try {
        const results = this.landmarker.detectForVideo(videoElement, currentTime);
        return this._processMediaPipeResults(results, videoElement, phoneInfo);
      } catch (err) {
        console.warn("[ComputerVision] MediaPipe frame error, utilizing canvas fallback:", err.message);
        return this._processCanvasFallback(videoElement, phoneInfo);
      }
    }

    // Otherwise, run lightweight canvas-based vision engine
    return this._processCanvasFallback(videoElement, phoneInfo);
  }

  /**
   * Process high-precision MediaPipe FaceLandmarker results
   */
  _processMediaPipeResults(results, videoElement, phoneInfo = {}) {
    this.totalSamples++;
    const now = Date.now();
    const faceCount = results.faceLandmarks ? results.faceLandmarks.length : 0;
    let phoneDetected = phoneInfo.phoneDetected || false;
    let phoneConfidence = phoneInfo.phoneConfidence || 0;

    // Sample lighting via offscreen canvas
    const lighting = this._sampleLighting(videoElement);
    if (lighting === "low_light") this.lowLightingSamples++;
    else this.optimalLightingSamples++;

    // --- 1. FACE DETECTION & VISIBILITY ---
    if (faceCount === 0) {
      if (!this.currentFaceMissingStart) {
        this.currentFaceMissingStart = now;
      }
      const faceMissingDuration = now - this.currentFaceMissingStart;
      const isSustainedMissing = faceMissingDuration >= this.config.faceMissingThresholdMs;

      const smoothedDir = this._applyHysteresisSmoothing("face_missing");

      return {
        timestamp: now,
        faceDetected: false,
        faceCount: 0,
        phoneDetected,
        phoneConfidence,
        direction: "face_missing",
        smoothedDirection: smoothedDir,
        expression: "neutral",
        lighting,
        isSustainedMissing,
        isSustainedAway: false,
        informationalTip: isSustainedMissing ? this.config.messages.faceMissing : null,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
      };
    }

    this.faceDetectedSamples++;
    if (faceCount > 1) {
      this.multipleFacesSamples++;
    }

    if (this.currentFaceMissingStart) {
      const durationSec = Math.round((now - this.currentFaceMissingStart) / 100) / 10;
      if (durationSec >= this.config.faceMissingThresholdMs / 1000) {
        this.events.push({
          type: "face_missing",
          timestamp: new Date(this.currentFaceMissingStart).toISOString(),
          duration: durationSec,
        });
      }
      this.currentFaceMissingStart = null;
    }

    // --- 2. HEAD POSE ESTIMATION (EULER ANGLES) ---
    let yaw = 0, pitch = 0, roll = 0;
    if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
      const angles = extractEulerAngles(results.facialTransformationMatrixes[0].data);
      yaw = angles.yaw;
      pitch = angles.pitch;
      roll = angles.roll;
    }

    // Blendshape extraction for eyes and facial movement
    const blendshapesMap = {};
    if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
      for (const cat of results.faceBlendshapes[0].categories) {
        blendshapesMap[cat.categoryName] = cat.score;
      }
    }

    // MediaPipe Eye Gaze Blendshapes
    const lookLeftScore = (blendshapesMap["eyeLookInRight"] || 0) + (blendshapesMap["eyeLookOutLeft"] || 0);
    const lookRightScore = (blendshapesMap["eyeLookInLeft"] || 0) + (blendshapesMap["eyeLookOutRight"] || 0);
    const lookUpScore = ((blendshapesMap["eyeLookUpLeft"] || 0) + (blendshapesMap["eyeLookUpRight"] || 0)) / 2;
    const lookDownScore = ((blendshapesMap["eyeLookDownLeft"] || 0) + (blendshapesMap["eyeLookDownRight"] || 0)) / 2;

    // Optional Iris landmark calculation if landmarks exist
    let irisGazeShift = 0;
    if (results.faceLandmarks && results.faceLandmarks[0] && results.faceLandmarks[0].length >= 478) {
      const lms = results.faceLandmarks[0];
      const leftInner = lms[133], leftOuter = lms[33], leftIris = lms[468];
      const eyeWidth = Math.abs(leftInner.x - leftOuter.x);
      if (eyeWidth > 0.01) {
        const irisRatio = (leftIris.x - Math.min(leftInner.x, leftOuter.x)) / eyeWidth;
        irisGazeShift = irisRatio - 0.5; // Negative = shifted one side, positive = shifted other side
      }
    }

    const { headPose, blendshapes } = this.config;
    let rawDirection = "camera_facing";

    // Combine head rotation and eye blendshape magnitudes to determine real-time gaze direction
    if (yaw > headPose.yawThresholdDeg || lookRightScore > blendshapes.gazeAwayThreshold * 1.4 || irisGazeShift < -0.15) {
      rawDirection = "looking_right";
    } else if (yaw < -headPose.yawThresholdDeg || lookLeftScore > blendshapes.gazeAwayThreshold * 1.4 || irisGazeShift > 0.15) {
      rawDirection = "looking_left";
    } else if (pitch < -headPose.pitchDownThresholdDeg || lookDownScore > blendshapes.gazeAwayThreshold) {
      rawDirection = "looking_down";
    } else if (pitch > headPose.pitchUpThresholdDeg || lookUpScore > blendshapes.gazeAwayThreshold) {
      rawDirection = "looking_up";
    }

    // --- 3. FACIAL EXPRESSION & COMPOSEMENT ---
    const smileScore = ((blendshapesMap["mouthSmileLeft"] || 0) + (blendshapesMap["mouthSmileRight"] || 0)) / 2;
    const surpriseScore = ((blendshapesMap["browInnerUp"] || 0) + (blendshapesMap["jawOpen"] || 0)) / 2;
    const tenseScore = ((blendshapesMap["browDownLeft"] || 0) + (blendshapesMap["browDownRight"] || 0) + (blendshapesMap["mouthFrownLeft"] || 0)) / 3;

    const expressivenessMag = Math.min(1, (smileScore * 1.5 + surpriseScore + tenseScore * 1.2));
    this.expressivenessScores.push(expressivenessMag);

    let rawExpression = "neutral";
    if (smileScore >= blendshapes.smileThreshold) {
      rawExpression = "positive";
    } else if (surpriseScore >= blendshapes.surpriseThreshold) {
      rawExpression = "surprised";
    } else if (tenseScore >= blendshapes.tenseThreshold) {
      rawExpression = "tense";
    } else if (expressivenessMag > 0.25) {
      rawExpression = "expressive";
    }

    // Apply anti-flicker hysteresis smoothing
    const smoothedDirection = this._applyHysteresisSmoothing(rawDirection);
    const smoothedExpression = this._smoothExpression(rawExpression);

    this._recordGazeStats(smoothedDirection, rawDirection, now);
    this.expressionDistribution[smoothedExpression] = (this.expressionDistribution[smoothedExpression] || 0) + 1;

    // Check sustained looking away (> 2000ms)
    const awayDuration = this.currentAttentionAwayStart ? now - this.currentAttentionAwayStart : 0;
    const isSustainedAway = awayDuration >= this.config.attentionThresholdMs;

    let informationalTip = null;
    if (faceCount > 1) {
      informationalTip = this.config.messages.multipleFaces;
    } else if (isSustainedAway) {
      informationalTip = this.config.messages.attentionAway;
    }

    // (Postural heuristics removed to prevent false positives when tilting head or reading code)

    if (phoneDetected) {
      this.phoneDetectedSamples++;
    }

    return {
      timestamp: now,
      faceDetected: true,
      faceCount,
      phoneDetected,
      phoneConfidence,
      direction: rawDirection,
      smoothedDirection,
      expression: smoothedExpression,
      lighting,
      isSustainedAway,
      isSustainedMissing: false,
      informationalTip,
      headPose: { yaw: Math.round(yaw), pitch: Math.round(pitch), roll: Math.round(roll) },
      expressivenessMag: Math.round(expressivenessMag * 100),
      candidateBoundingBox: phoneInfo.candidateBoundingBox || null,
    };

  }

  /**
   * Process frame using HTML5 Canvas pixel heuristics (instant, lightweight fallback)
   */
  _processCanvasFallback(videoElement, phoneInfo = {}) {
    this.totalSamples++;
    const now = Date.now();
    let phoneDetected = phoneInfo.phoneDetected || false;
    let phoneConfidence = phoneInfo.phoneConfidence || 0;

    if (!this.offscreenCanvas && typeof document !== "undefined") {
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = 160;
      this.offscreenCanvas.height = 120;
    }

    if (!this.offscreenCanvas) {
      return null;
    }

    const ctx = this.offscreenCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, 160, 120);
    const imgData = ctx.getImageData(0, 0, 160, 120);
    const data = imgData.data;

    // 1. Measure lighting & skin clusters
    let totalLum = 0;
    let samplePixels = 0;
    let skinX = 0, skinY = 0, skinCount = 0;
    let leftSkinX = 0, leftSkinCount = 0;
    let rightSkinX = 0, rightSkinCount = 0;

    for (let y = 10; y < 110; y += 4) {
      for (let x = 15; x < 145; x += 4) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLum += lum;
        samplePixels++;

        // Skin tone cluster heuristic
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) >= 10) {
          skinX += x;
          skinY += y;
          skinCount++;

          if (x < 75) {
            leftSkinX += x;
            leftSkinCount++;
          } else if (x > 85) {
            rightSkinX += x;
            rightSkinCount++;
          }
        }
      }
    }

    const avgLum = samplePixels > 0 ? totalLum / samplePixels : 120;
    let lighting = "optimal";
    if (avgLum < 45) {
      lighting = "low_light";
      this.lowLightingSamples++;
    } else {
      this.optimalLightingSamples++;
    }

    // 2. Face presence & Centroid
    if (skinCount < 22) {
      // Face missing
      if (!this.currentFaceMissingStart) this.currentFaceMissingStart = now;
      const faceMissingDuration = now - this.currentFaceMissingStart;
      const isSustainedMissing = faceMissingDuration >= this.config.faceMissingThresholdMs;
      const smoothedDir = this._applyHysteresisSmoothing("face_missing");

      return {
        timestamp: now,
        faceDetected: false,
        faceCount: 0,
        direction: "face_missing",
        smoothedDirection: smoothedDir,
        expression: "neutral",
        lighting,
        isSustainedMissing,
        isSustainedAway: false,
        informationalTip: isSustainedMissing ? this.config.messages.faceMissing : null,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
      };
    }

    this.faceDetectedSamples++;
    if (this.currentFaceMissingStart) {
      const durationSec = Math.round((now - this.currentFaceMissingStart) / 100) / 10;
      if (durationSec >= this.config.faceMissingThresholdMs / 1000) {
        this.events.push({
          type: "face_missing",
          timestamp: new Date(this.currentFaceMissingStart).toISOString(),
          duration: durationSec,
        });
      }
      this.currentFaceMissingStart = null;
    }

    const cx = (skinX / skinCount) / 160; // 0.0 to 1.0
    const cy = (skinY / skinCount) / 120; // 0.0 to 1.0

    // Approximate head pose & gaze from face centroid position
    let rawDirection = "camera_facing";
    let approxYaw = Math.round((cx - 0.5) * 80);
    let approxPitch = Math.round((cy - 0.42) * -70);

    if (cx < 0.38) {
      rawDirection = "looking_left";
    } else if (cx > 0.62) {
      rawDirection = "looking_right";
    } else if (cy > 0.54) {
      rawDirection = "looking_down";
    } else if (cy < 0.28) {
      rawDirection = "looking_up";
    }

    // 3. Movement and expressiveness delta
    let expressivenessMag = 0.35;
    if (this.lastFrameData) {
      let diff = 0;
      const prev = this.lastFrameData.data;
      for (let i = 0; i < data.length; i += 16) {
        diff += Math.abs(data[i] - prev[i]);
      }
      const avgDiff = diff / (data.length / 16);
      expressivenessMag = Math.min(1, Math.max(0.1, avgDiff / 25));
    }
    this.lastFrameData = imgData;
    this.expressivenessScores.push(expressivenessMag);

    let rawExpression = expressivenessMag > 0.4 ? "expressive" : "neutral";

    // Anti-flicker smoothing
    const smoothedDirection = this._applyHysteresisSmoothing(rawDirection);
    const smoothedExpression = this._smoothExpression(rawExpression);

    this._recordGazeStats(smoothedDirection, rawDirection, now);
    let faceCount = 1;
    if (leftSkinCount >= 20 && rightSkinCount >= 20) {
      const leftCx = leftSkinX / leftSkinCount;
      const rightCx = rightSkinX / rightSkinCount;
      if (rightCx - leftCx >= 40) {
        faceCount = 2;
        this.multipleFacesSamples++;
      }
    }

    // (Approximate yaw postural heuristics removed to prevent false positives)

    if (phoneDetected) {
      this.phoneDetectedSamples++;
    }

    const awayDuration = this.currentAttentionAwayStart ? now - this.currentAttentionAwayStart : 0;
    const isSustainedAway = awayDuration >= this.config.attentionThresholdMs;
    const informationalTip = faceCount > 1 
      ? this.config.messages.multipleFaces 
      : (isSustainedAway ? this.config.messages.attentionAway : null);

    return {
      timestamp: now,
      faceDetected: true,
      faceCount,
      phoneDetected,
      phoneConfidence,
      direction: rawDirection,
      smoothedDirection,
      expression: smoothedExpression,
      lighting,
      isSustainedAway,
      isSustainedMissing: false,
      informationalTip,
      headPose: { yaw: approxYaw, pitch: approxPitch, roll: 0 },
      expressivenessMag: Math.round(expressivenessMag * 100),
    };
  }

  /**
   * Fast canvas-level phone check disabled to avoid false positives on dark clothing / shadows
   */
  _detectPhoneCanvas(videoElement) {
    return false;
  }

  /**
   * Sample frame brightness to evaluate ambient lighting
   */
  _sampleLighting(videoElement) {
    if (!this.offscreenCanvas && typeof document !== "undefined") {
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = 160;
      this.offscreenCanvas.height = 120;
    }
    if (!this.offscreenCanvas) return "optimal";

    try {
      const ctx = this.offscreenCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return "optimal";
      ctx.drawImage(videoElement, 0, 0, 80, 60);
      const imgData = ctx.getImageData(0, 0, 80, 60);
      const d = imgData.data;
      let total = 0;
      for (let i = 0; i < d.length; i += 16) {
        total += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      const avg = total / (d.length / 16);
      return avg < 45 ? "low_light" : avg > 230 ? "overexposed" : "optimal";
    } catch {
      return "optimal";
    }
  }

  /**
   * Anti-flicker hysteresis smoothing: requires 2 consecutive agreeing frames before
   * transitioning states, completely eliminating rapid UI jitter
   */
  _applyHysteresisSmoothing(rawDirection) {
    if (rawDirection === this.confirmedDirection) {
      this.pendingDirection = null;
      this.pendingDirectionCount = 0;
      return this.confirmedDirection;
    }

    if (rawDirection === this.pendingDirection) {
      this.pendingDirectionCount++;
      // Require 2 consecutive frames before switching direction
      if (this.pendingDirectionCount >= 2) {
        this.confirmedDirection = rawDirection;
        this.pendingDirection = null;
        this.pendingDirectionCount = 0;
      }
    } else {
      this.pendingDirection = rawDirection;
      this.pendingDirectionCount = 1;
    }

    return this.confirmedDirection;
  }

  _smoothExpression(expression) {
    this.recentExpressions.push(expression);
    if (this.recentExpressions.length > this.config.smoothingWindow) {
      this.recentExpressions.shift();
    }
    return this.getMostFrequent(this.recentExpressions) || expression;
  }

  _recordGazeStats(smoothedDirection, rawDirection, now) {
    if (smoothedDirection === "camera_facing") {
      this.cameraFacingSamples++;
      if (this.currentAttentionAwayStart) {
        const durationSec = Math.round((now - this.currentAttentionAwayStart) / 100) / 10;
        if (durationSec >= this.config.attentionThresholdMs / 1000) {
          this.events.push({
            type: "attention_away",
            direction: rawDirection,
            timestamp: new Date(this.currentAttentionAwayStart).toISOString(),
            duration: durationSec,
          });
        }
        this.currentAttentionAwayStart = null;
      }
    } else {
      this.lookingAwaySamples++;
      if (!this.currentAttentionAwayStart) {
        this.currentAttentionAwayStart = now;
      }
    }
  }

  getMostFrequent(arr) {
    if (!arr || arr.length === 0) return null;
    const counts = {};
    let maxItem = arr[0];
    let maxCount = 1;
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
      if (counts[item] > maxCount) {
        maxCount = counts[item];
        maxItem = item;
      }
    }
    return maxItem;
  }

  /**
   * Finalize analysis and compute deterministic aggregated presentation scores.
   * Strictly separates empirical physical observations from cautious AI impressions.
   * @returns {Object} Complete Computer Vision presentation summary
   */
  getSummary() {
    if (this.totalSamples === 0) {
      return {
        available: false,
        message: "No camera presentation telemetry recorded (camera disabled or uninitialized).",
        attentionScore: null,
        engagementScore: null,
        presentationConfidence: null,
        facialExpressiveness: null,
        faceVisibility: 0,
        cameraFacingPercentage: 0,
        attentionAwayCount: 0,
        attentionAwayDuration: 0,
        faceMissingCount: 0,
        faceMissingDuration: 0,
        lightingQuality: "Unassessed",
        presentationStyle: {
          communicationPresence: "Not Assessed",
          expressiveness: "Not Assessed",
          cameraEngagement: "Not Assessed",
          visualAttentiveness: "Not Assessed",
          overallPresentation: "Not Assessed",
        },
        strengths: ["Audio and answer delivery evaluated."],
        improvements: ["Enable webcam during mock interview to receive visual engagement and lens focus feedback."],
        events: [],
        disclaimer:
          "Computer Vision metrics measure concrete presentation indicators (camera-facing percentage, face visibility, posture stability) and do NOT assess honesty, emotion, or psychological personality.",
      };
    }

    const total = Math.max(this.totalSamples, 1);
    const facePresent = Math.max(this.faceDetectedSamples, 1);

    // 1. Empirical signals
    const faceVisibility = Math.min(100, Math.round((this.faceDetectedSamples / total) * 100));
    const cameraFacingRatio = this.cameraFacingSamples / facePresent;
    const cameraFacingPct = Math.min(100, Math.round(cameraFacingRatio * 100));

    const attentionAwayEvents = this.events.filter((e) => e.type === "attention_away");
    const faceMissingEvents = this.events.filter((e) => e.type === "face_missing");

    const totalAwayDuration = Math.round(attentionAwayEvents.reduce((acc, e) => acc + (e.duration || 0), 0));
    const totalMissingDuration = Math.round(faceMissingEvents.reduce((acc, e) => acc + (e.duration || 0), 0));

    const eventPenalty = Math.min(20, attentionAwayEvents.length * 2 + faceMissingEvents.length * 3);
    const attentionScore = Math.max(
      30,
      Math.min(100, Math.round(cameraFacingPct * 0.75 + faceVisibility * 0.25 - eventPenalty))
    );

    const avgExpressiveness =
      this.expressivenessScores.length > 0
        ? this.expressivenessScores.reduce((a, b) => a + b, 0) / this.expressivenessScores.length
        : 0.35;
    const facialExpressiveness = Math.max(
      45,
      Math.min(95, Math.round(50 + avgExpressiveness * 50))
    );

    const { weights } = this.config;
    const engagementScore = Math.max(
      40,
      Math.min(
        100,
        Math.round(
          cameraFacingPct * weights.engagementScore.cameraFacing +
            faceVisibility * weights.engagementScore.faceVisibility +
            facialExpressiveness * weights.engagementScore.facialExpressiveness
        )
      )
    );

    const consistencyFactor = Math.max(0, 100 - eventPenalty * 2);
    const presentationConfidence = Math.max(
      45,
      Math.min(
        98,
        Math.round(
          cameraFacingPct * weights.presentationConfidence.cameraFacing +
            faceVisibility * weights.presentationConfidence.faceVisibility +
            consistencyFactor * weights.presentationConfidence.attentionConsistency +
            facialExpressiveness * weights.presentationConfidence.expressivenessStability
        )
      )
    );

    const lightingQuality =
      this.lowLightingSamples > total * 0.35
        ? "Low Ambient Light"
        : "Optimal Lighting";

    // 2. Cautious, observable presentation style categories
    const communicationPresence =
      presentationConfidence >= 82 ? "Strong" : presentationConfidence >= 65 ? "Moderate" : "Developing";
    const expressivenessCategory =
      facialExpressiveness >= 75 ? "High" : facialExpressiveness >= 60 ? "Moderate" : "Composed";
    const cameraEngagementCategory =
      cameraFacingPct >= 85 ? "High" : cameraFacingPct >= 70 ? "Consistent" : "Needs Focus";
    const visualAttentiveness =
      attentionScore >= 85 ? "Excellent" : attentionScore >= 70 ? "Good" : "Variable";
    const overallPresentation =
      presentationConfidence >= 80 && attentionScore >= 80 ? "Professional" : "Positive";

    // 3. Evidence-based strengths and actionable tips
    const strengths = [];
    const improvements = [];

    if (cameraFacingPct >= 80 && attentionScore >= 75) {
      strengths.push(`Maintained high camera engagement (${cameraFacingPct}%) during technical discussions.`);
    }
    if (faceVisibility >= 90) {
      strengths.push("Remained consistently centered and clearly framed within the camera view.");
    }
    if (facialExpressiveness >= 65) {
      strengths.push("Demonstrated responsive and engaged facial expressiveness while explaining concepts.");
    }
    if (attentionAwayEvents.length <= 2 && attentionScore >= 75) {
      strengths.push("Demonstrated steady visual focus with minimal sustained off-screen glances.");
    }
    if (strengths.length === 0) {
      strengths.push("Maintained steady camera presence throughout the mock interview.");
    }

    if (cameraFacingPct < 75 || attentionAwayEvents.length > 2) {
      improvements.push("Position your camera directly at eye level to keep your visual focus naturally on the interviewer.");
    }
    if (totalAwayDuration > 15) {
      improvements.push("Minimize prolonged downward glances when formulating architectural answers.");
    }
    if (this.lowLightingSamples > total * 0.35) {
      improvements.push("Increase front lighting to enhance camera clarity and face visibility.");
    }
    if (improvements.length === 0) {
      improvements.push("Continue this level of focused camera engagement in real technical interviews.");
    }

    return {
      available: true,
      attentionScore,
      engagementScore,
      presentationConfidence,
      facialExpressiveness,
      faceVisibility,
      cameraFacingPercentage: cameraFacingPct,
      attentionAwayCount: attentionAwayEvents.length,
      attentionAwayDuration: totalAwayDuration,
      faceMissingCount: faceMissingEvents.length,
      faceMissingDuration: totalMissingDuration,
      multipleFacesDetected: this.multipleFacesSamples > 3,
      lightingQuality,
      presentationStyle: {
        communicationPresence,
        expressiveness: expressivenessCategory,
        cameraEngagement: cameraEngagementCategory,
        visualAttentiveness,
        overallPresentation,
      },
      strengths,
      improvements,
      events: this.events.slice(-20),
      disclaimer:
        "Computer vision analysis is conducted entirely client-side. Raw video is never stored or transmitted. Metrics reflect observable presentation indicators and do not evaluate personality, truthfulness, emotions, or psychological traits.",
    };
  }

  destroy() {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // ignore
      }
      this.landmarker = null;
    }
    if (this.objectDetector) {
      try {
        this.objectDetector.close();
      } catch {
        // ignore
      }
      this.objectDetector = null;
    }
    this.isReady = false;
    this.isLoading = false;
    this.events = [];
    this.offscreenCanvas = null;
    this.lastFrameData = null;
  }
}
