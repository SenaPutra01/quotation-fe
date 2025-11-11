"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  generateSliderCaptchaAction,
  verifySliderCaptchaAction,
} from "../actions/captcha-actions";

interface SliderCaptchaProps {
  onSuccess: (sessionId: string, position: number) => void;
  onError?: (error: string) => void;
}

interface CaptchaData {
  sessionId: string;
  backgroundImage: string;
  puzzlePiece: string;
  puzzleSize: number;
  puzzleY: number;
  canvasWidth: number;
}

export const SliderCaptcha: React.FC<SliderCaptchaProps> = ({
  onSuccess,
  onError,
}) => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string>("");
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartPosition = useRef<number>(0);

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    setLoading(true);
    setVerificationStatus("idle");
    setSliderPosition(0);
    setLastError("");

    try {
      const result = await generateSliderCaptchaAction();

      if (result.success && result.data) {
        setCaptchaData(result.data);

        setTimeout(() => {
          calculateScaleFactor();
        }, 100);
      } else {
        throw new Error(result.error || "Failed to load captcha");
      }
    } catch (error) {
      console.error("Failed to load captcha:", error);
      if (onError) {
        onError(
          error instanceof Error
            ? error.message
            : "Failed to load captcha. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateScaleFactor = useCallback(() => {
    if (!containerRef.current || !captchaData) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const originalCanvasWidth = captchaData.canvasWidth;

    const scale = containerWidth / originalCanvasWidth;
    setScaleFactor(scale);
  }, [captchaData]);

  const getScaledValue = useCallback(
    (value: number): number => {
      return Math.round(value * scaleFactor);
    },
    [scaleFactor]
  );

  const getOriginalValue = useCallback(
    (value: number): number => {
      return Math.round(value / scaleFactor);
    },
    [scaleFactor]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (verificationStatus === "success" || isVerifying) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;

      dragStartX.current = clientX;
      dragStartPosition.current = sliderPosition;
      setIsDragging(true);
      setVerificationStatus("idle");
      setLastError("");
    },
    [verificationStatus, isVerifying, sliderPosition]
  );

  const calculatePosition = useCallback(
    (clientX: number): number => {
      if (!containerRef.current || !captchaData) return 0;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const maxMove = getScaledValue(
        captchaData.canvasWidth - captchaData.puzzleSize
      );

      const deltaX = clientX - dragStartX.current;
      let newPosition = dragStartPosition.current + deltaX;

      newPosition = Math.max(0, Math.min(newPosition, maxMove));

      return Math.round(newPosition);
    },
    [captchaData, getScaledValue]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !captchaData) return;
      const newPosition = calculatePosition(e.clientX);
      setSliderPosition(newPosition);
    },
    [isDragging, captchaData, calculatePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !captchaData) return;
      e.preventDefault();
      const touch = e.touches[0];
      const newPosition = calculatePosition(touch.clientX);
      setSliderPosition(newPosition);
    },
    [isDragging, captchaData, calculatePosition]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isDragging || !captchaData) return;

    setIsDragging(false);

    const originalPosition = getOriginalValue(sliderPosition);

    await new Promise((resolve) => setTimeout(resolve, 100));

    setIsVerifying(true);

    try {
      console.log(
        "Verifying position - Scaled:",
        sliderPosition,
        "Original:",
        originalPosition
      );
      const result = await verifySliderCaptchaAction(
        captchaData.sessionId,
        originalPosition
      );

      if (result.success && result.data?.valid) {
        setVerificationStatus("success");
        onSuccess(captchaData.sessionId, originalPosition);
      } else {
        const errorMsg =
          result.data?.message || result.error || "Verification failed";
        let detailedError = errorMsg;

        if (errorMsg.includes("Off by")) {
          const difference = errorMsg.match(/Off by ([0-9.]+)px/)?.[1];
          detailedError = `Hampir tepat! Kurang ${difference}px. Coba lebih presisi.`;
          setLastError(difference || "");
        }

        throw new Error(detailedError);
      }
    } catch (error) {
      setVerificationStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again.";

      if (onError) {
        onError(errorMessage);
      }

      setTimeout(() => {
        loadCaptcha();
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  }, [
    isDragging,
    captchaData,
    sliderPosition,
    getOriginalValue,
    onSuccess,
    onError,
  ]);

  useEffect(() => {
    if (!isDragging) return;

    const mouseMoveHandler = handleMouseMove as EventListener;
    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      handleTouchMove(e);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", touchMoveHandler, {
      passive: false,
    });
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", touchMoveHandler);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      calculateScaleFactor();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateScaleFactor]);

  const sliderPercentage = captchaData
    ? (sliderPosition /
        getScaledValue(captchaData.canvasWidth - captchaData.puzzleSize)) *
      100
    : 0;

  if (loading) {
    return (
      <div className="slider-captcha-container">
        <div className="captcha-loading">
          <div className="spinner"></div>
          <p>Loading captcha...</p>
        </div>
      </div>
    );
  }

  if (!captchaData) {
    return (
      <div className="slider-captcha-container">
        <div className="captcha-error">
          <p>Failed to load captcha</p>
          <button onClick={loadCaptcha} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="slider-captcha-container">
      <div className="captcha-header">
        <span className="captcha-title">
          🔒 Geser puzzle ke posisi yang tepat
        </span>
        <button
          className="refresh-btn"
          onClick={loadCaptcha}
          disabled={isVerifying || verificationStatus === "success"}
          title="Refresh captcha"
          type="button"
        >
          🔄
        </button>
      </div>

      <div className="captcha-instructions">
        <p>Ratakan potongan puzzle dengan area kosong</p>
        {lastError && (
          <div className="precision-hint">
            <small>
              Percobaan terakhir: selisih {lastError}px - lebih presisi!
            </small>
          </div>
        )}
      </div>

      <div
        className="captcha-canvas-container"
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${captchaData.canvasWidth} / 200`,
          maxWidth: "400px",
          margin: "0 auto",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #e1e5e9",
          backgroundColor: "#f8f9fa",
        }}
      >
        <img
          src={captchaData.backgroundImage}
          alt="Captcha background"
          className="captcha-background"
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          className="puzzle-wrapper"
          style={{
            position: "absolute",
            left: `${sliderPosition}px`,
            top: `${getScaledValue(captchaData.puzzleY)}px`,
            width: `${getScaledValue(captchaData.puzzleSize)}px`,
            height: `${getScaledValue(captchaData.puzzleSize)}px`,
            cursor: isDragging ? "grabbing" : "grab",
            transition: isDragging ? "none" : "left 0.05s linear",
            zIndex: 10,
          }}
        >
          <img
            src={captchaData.puzzlePiece}
            alt="Puzzle piece"
            className="puzzle-piece"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
              border: "2px solid #ffffff",
            }}
          />
        </div>

        <div
          className="alignment-helper"
          style={{
            position: "absolute",
            top: `${getScaledValue(captchaData.puzzleY)}px`,
            height: `${getScaledValue(captchaData.puzzleSize)}px`,
            left: 0,
            right: 0,
            border: "1px dashed rgba(255, 255, 255, 0.6)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {verificationStatus === "success" && (
          <div className="verification-overlay success">
            <div className="status-icon">✓</div>
            <div className="status-text">Tepat! Terverifikasi</div>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="verification-overlay error">
            <div className="status-icon">↔</div>
            <div className="status-text">Perlu penyesuaian</div>
            <div className="error-detail">Geser perlahan untuk presisi</div>
          </div>
        )}
      </div>

      <div className="slider-control">
        <div className="slider-track">
          <div
            className="slider-progress"
            style={{ width: `${sliderPercentage}%` }}
          />
          <div className="slider-labels">
            <span className="label-start">Awal</span>
            <span className="label-end">Akhir</span>
          </div>
        </div>

        <div
          className={`slider-handle ${isDragging ? "dragging" : ""} ${
            verificationStatus === "success" ? "success" : ""
          } ${isVerifying ? "verifying" : ""}`}
          style={{ left: `${sliderPercentage}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          ref={sliderRef}
        >
          <span className="slider-icon">
            {verificationStatus === "success" ? "✓" : "↔"}
          </span>
        </div>
      </div>

      {isVerifying && (
        <div className="verifying-message">
          <span className="spinner-small"></span>
          Memverifikasi...
        </div>
      )}

      <div className="captcha-tips">
        <p>
          💡 <strong>Tips:</strong> Gunakan gerakan halus dan perhatikan garis
          bantu
        </p>
      </div>

      <style jsx>{`
        .slider-captcha-container {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          user-select: none;
        }

        .captcha-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .captcha-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .captcha-instructions {
          margin-bottom: 16px;
          text-align: center;
        }

        .captcha-instructions p {
          font-size: 14px;
          color: #666;
          margin: 0 0 6px 0;
        }

        .precision-hint {
          font-size: 12px;
          color: #dc3545;
          font-weight: 500;
        }

        .slider-control {
          position: relative;
          width: 100%;
          height: 60px;
          margin: 20px 0 12px;
        }

        .slider-track {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          transform: translateY(-50%);
        }

        .slider-progress {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #0056b3);
          border-radius: 3px;
          transition: width 0.1s ease;
        }

        .slider-labels {
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        .slider-handle {
          position: absolute;
          top: 50%;
          width: 48px;
          height: 48px;
          background: white;
          border: 3px solid #007bff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.1s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          z-index: 20;
        }

        .slider-handle.dragging {
          cursor: grabbing;
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .slider-handle.success {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }

        .slider-icon {
          font-size: 16px;
          font-weight: bold;
        }

        .refresh-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background-color: #f8f9fa;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .verifying-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
          margin: 12px 0;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .verification-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          z-index: 30;
        }

        .status-icon {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .status-text {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .error-detail {
          font-size: 14px;
          opacity: 0.8;
        }

        .captcha-tips {
          margin-top: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .captcha-tips p {
          font-size: 13px;
          color: #495057;
          margin: 0;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
