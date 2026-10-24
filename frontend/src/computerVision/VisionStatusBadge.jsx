import React, { useState, useEffect } from "react";
import { FaEye, FaRegSmile, FaInfoCircle, FaVideoSlash, FaTimes, FaExchangeAlt } from "react-icons/fa";

export function VisionStatusBadge({
  isModelReady,
  isModelLoading,
  faceDetected,
  faceCount = 1,
  phoneDetected = false,
  isVerifyingPhone = false,
  direction,
  expression,
  activeTip,
  lighting,
  isCameraOff,
  defaultPosition = "bottom-left",
}) {
  // Allow candidate to position the HUD badge at bottom-left or bottom-right
  const [position, setPosition] = useState(defaultPosition);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [lastTip, setLastTip] = useState(null);

  // When a new tip is triggered, un-dismiss it
  useEffect(() => {
    if (activeTip && activeTip !== lastTip) {
      setLastTip(activeTip);
      setTipDismissed(false);
    }
  }, [activeTip, lastTip]);

  const getDirectionLabel = (dir) => {
    if (isCameraOff || dir === "camera_off") return "Camera Paused";
    switch (dir) {
      case "camera_facing":
        return "Looking at screen";
      case "looking_left":
        return "Looking left";
      case "looking_right":
        return "Looking right";
      case "looking_up":
        return "Looking up";
      case "looking_down":
        return "Looking down";
      case "looking_away":
        return "Looking away";
      case "face_missing":
        return "Looking for face...";
      default:
        return "Looking at screen";
    }
  };

  const getExpressionLabel = (expr) => {
    switch (expr) {
      case "positive":
        return "Positive";
      case "surprised":
      case "expressive":
        return "Expressive";
      case "tense":
        return "Focused";
      default:
        return "Composed";
    }
  };

  const isLookingAtScreen = direction === "camera_facing";
  const dotClass = isCameraOff
    ? "dot-paused"
    : phoneDetected
    ? "dot-away"
    : isVerifyingPhone
    ? "dot-searching"
    : faceDetected
    ? isLookingAtScreen
      ? "dot-active"
      : "dot-away"
    : isModelReady
    ? "dot-searching"
    : "dot-loading";

  const isBottomLeft = position === "bottom-left";

  return (
    <div
      className={`vision-status-container ${isBottomLeft ? "pos-bottom-left" : "pos-bottom-right"}`}
      style={{
        position: "absolute",
        bottom: "8px",
        left: isBottomLeft ? "8px" : "auto",
        right: isBottomLeft ? "auto" : "8px",
        top: "auto",
        zIndex: 30,
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: isBottomLeft ? "flex-start" : "flex-end",
        gap: "5px",
        maxWidth: "calc(100% - 16px)",
        pointerEvents: "auto",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* 1. Main Status Pill (positioned at bottom so candidate face is 100% unobstructed) */}
      <div
        className="vision-status-pill"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "rgba(10, 14, 23, 0.90)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: isCameraOff
            ? "1px solid rgba(255, 255, 255, 0.15)"
            : phoneDetected
            ? "2px solid #EF4444"
            : isVerifyingPhone
            ? "1px solid rgba(245, 158, 11, 0.85)"
            : faceCount > 1
            ? "1px solid rgba(239, 68, 68, 0.7)"
            : isLookingAtScreen && faceDetected
            ? "1px solid rgba(16, 185, 129, 0.4)"
            : "1px solid rgba(245, 158, 11, 0.4)",
          borderRadius: "16px",
          padding: "3px 8px",
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "#F8FAFC",
          boxShadow: (phoneDetected || faceCount > 1)
            ? "0 4px 14px rgba(239, 68, 68, 0.45)"
            : isVerifyingPhone
            ? "0 4px 14px rgba(245, 158, 11, 0.4)"
            : "0 4px 14px rgba(0, 0, 0, 0.45)",
          transition: "border-color 0.25s ease, background-color 0.25s ease",
        }}
      >
        <span
          className={`vision-status-dot ${dotClass}`}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            flexShrink: 0,
            backgroundColor: isCameraOff
              ? "#94A3B8"
              : (phoneDetected || faceCount > 1)
              ? "#EF4444"
              : isVerifyingPhone
              ? "#F59E0B"
              : faceDetected
              ? isLookingAtScreen
                ? "#10B981"
                : "#F59E0B"
              : "#F59E0B",
            boxShadow: isCameraOff
              ? "none"
              : (phoneDetected || faceCount > 1)
              ? "0 0 8px #EF4444"
              : isVerifyingPhone
              ? "0 0 10px #F59E0B"
              : faceDetected
              ? isLookingAtScreen
                ? "0 0 8px #10B981"
                : "0 0 8px #F59E0B"
              : "0 0 6px #F59E0B",
          }}
        />

        <span className="vision-status-text" style={{ letterSpacing: "0.2px" }}>
          {isCameraOff
            ? "Camera Paused"
            : phoneDetected
            ? "Phone Detected!"
            : isVerifyingPhone
            ? "Analyzing Object..."
            : faceCount > 1
            ? `${faceCount} Faces Detected`
            : isModelLoading && !faceDetected
            ? "Vision Initializing..."
            : faceDetected
            ? getDirectionLabel(direction)
            : "Looking for face..."}
        </span>

        {isVerifyingPhone && !isCameraOff && !phoneDetected && (
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "#FEF3C7",
              background: "rgba(217, 119, 6, 0.75)",
              padding: "1px 5px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            🔍 AI Verifying
          </span>
        )}

        {phoneDetected && !isCameraOff && (
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 800,
              color: "#FFFFFF",
              background: "#EF4444",
              padding: "1px 5px",
              borderRadius: "4px",
              boxShadow: "0 0 8px rgba(239, 68, 68, 0.7)",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
            }}
            title="Mobile phone detected in view!"
          >
            📱 Phone In Use
          </span>
        )}

        {faceCount > 1 && !isCameraOff && (
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "#FFFFFF",
              background: "#EF4444",
              padding: "1px 5px",
              borderRadius: "4px",
              boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
            }}
            title="Multiple faces detected in camera"
          >
            ⚠️ Alert
          </span>
        )}

        {faceDetected && !isCameraOff && faceCount <= 1 && (
          <span
            className="vision-expression-tag"
            title="Facial expressiveness indicator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(217, 183, 122, 0.18)",
              border: "1px solid rgba(217, 183, 122, 0.3)",
              borderRadius: "8px",
              padding: "1px 5px",
              color: "var(--accent-champagne, #E6D5B8)",
              fontSize: "0.64rem",
              fontWeight: 600,
              marginLeft: "2px",
            }}
          >
            <FaRegSmile style={{ fontSize: "9px", marginRight: "3px" }} />
            {getExpressionLabel(expression)}
          </span>
        )}

        {lighting === "low_light" && faceDetected && !isCameraOff && (
          <span
            style={{
              fontSize: "0.60rem",
              fontWeight: 600,
              color: "#FBBF24",
              background: "rgba(245, 158, 11, 0.15)",
              padding: "1px 4px",
              borderRadius: "4px",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
            title="Ambient lighting is low"
          >
            Low Light
          </span>
        )}

        {/* Small corner-switch icon to toggle between bottom-left and bottom-right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPosition((prev) => (prev === "bottom-left" ? "bottom-right" : "bottom-left"));
          }}
          title={isBottomLeft ? "Move indicator to bottom-right" : "Move indicator to bottom-left"}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.45)",
            cursor: "pointer",
            padding: "1px 3px",
            display: "inline-flex",
            alignItems: "center",
            fontSize: "9px",
            marginLeft: "2px",
            borderRadius: "3px",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.45)")}
        >
          <FaExchangeAlt />
        </button>
      </div>

      {/* 2. Non-intrusive Informational Tip (strictly informational, auto-clearing & dismissible) */}
      {activeTip && !tipDismissed && !isCameraOff && (
        <div
          className="vision-info-tip"
          role="status"
          aria-live="polite"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
            background: faceCount > 1 ? "rgba(28, 10, 14, 0.94)" : "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: faceCount > 1 ? "1px solid rgba(239, 68, 68, 0.55)" : "1px solid rgba(217, 183, 122, 0.4)",
            color: "#FFFFFF",
            padding: "4px 8px",
            borderRadius: "7px",
            fontSize: "0.68rem",
            fontWeight: 500,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.5)",
            maxWidth: "250px",
            lineHeight: 1.3,
            animation: "tipFadeIn 0.25s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaInfoCircle
              style={{
                fontSize: "11px",
                color: faceCount > 1 ? "#EF4444" : "var(--accent-gold, #D9B77A)",
                flexShrink: 0,
              }}
            />
            <span>{activeTip}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTipDismissed(true);
            }}
            title="Dismiss notice"
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              padding: "0 2px",
              display: "flex",
              alignItems: "center",
              fontSize: "10px",
              marginLeft: "4px",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)")}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
