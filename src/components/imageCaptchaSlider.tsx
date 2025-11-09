"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, Check, ArrowRight, X } from "lucide-react";

interface ImageCaptchaSliderProps {
  onSuccess: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const CAPTCHA_IMAGES = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=150&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=150&fit=crop",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=300&h=150&fit=crop",
];

export function ImageCaptchaSlider({
  onSuccess,
  onClose,
  isOpen,
}: ImageCaptchaSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [maxPosition, setMaxPosition] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && trackRef.current && sliderRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const sliderWidth = sliderRef.current.offsetWidth;
      setMaxPosition(trackWidth - sliderWidth);

      setSliderPosition(0);
      setIsVerified(false);
      setIsDragging(false);
      setCurrentImage(0);
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    let newPosition = e.clientX - trackRect.left;

    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
    setSliderPosition(newPosition);

    if (newPosition >= maxPosition * 0.9) {
      setIsVerified(true);
      setSliderPosition(maxPosition);
    } else {
      setIsVerified(false);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (!isVerified) {
      setTimeout(() => {
        setSliderPosition(0);
      }, 300);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, maxPosition]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !trackRef.current) return;

    const touch = e.touches[0];
    const trackRect = trackRef.current.getBoundingClientRect();
    let newPosition = touch.clientX - trackRect.left;

    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
    setSliderPosition(newPosition);

    if (newPosition >= maxPosition * 0.9) {
      setIsVerified(true);
      setSliderPosition(maxPosition);
    } else {
      setIsVerified(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (!isVerified) {
      setTimeout(() => {
        setSliderPosition(0);
      }, 300);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    } else {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, maxPosition]);

  const handleSuccess = () => {
    if (isVerified) {
      onSuccess();
    }
  };

  const refreshCaptcha = () => {
    setCurrentImage((prev) => (prev + 1) % CAPTCHA_IMAGES.length);
    setSliderPosition(0);
    setIsVerified(false);
    setIsLoading(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    refreshCaptcha();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Security Verification
          </h3>
          <p className="text-sm text-gray-600">Slide to verify you are human</p>
        </div>

        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden mb-4">
            <div className="relative h-40 bg-gray-200 flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              )}
              <img
                src={CAPTCHA_IMAGES[currentImage]}
                alt="Captcha verification"
                className={`w-full h-full object-cover ${
                  isLoading ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded text-center">
                Slide the button to the right to verify
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={refreshCaptcha}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Image</span>
            </button>
          </div>

          <div
            ref={trackRef}
            className="relative bg-gray-200 rounded-full h-12 p-1 select-none"
          >
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-200 rounded-full"
                style={{
                  width: `${(sliderPosition / maxPosition) * 100}%`,
                  maxWidth: "100%",
                }}
              />
            </div>

            <div
              ref={sliderRef}
              className={`relative h-10 w-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 z-10 ${
                isVerified
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-white text-gray-600 shadow-md border border-gray-300"
              } ${isDragging ? "scale-105" : ""}`}
              style={{
                transform: `translateX(${sliderPosition}px)`,
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {isVerified ? (
                <Check className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </div>

            <div className="flex items-center justify-center h-full pointer-events-none">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  isVerified ? "text-white" : "text-gray-600"
                }`}
              >
                {isVerified ? "Verified!" : "Slide to verify"}
              </span>
            </div>
          </div>

          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>← Slide</span>
            <span>Verify →</span>
          </div>
        </div>

        {isVerified && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
            <div className="flex items-center justify-center text-green-700">
              <Check className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Verification successful! You are human.
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSuccess}
            disabled={!isVerified}
            className={`flex-1 ${
              isVerified
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isVerified ? "Continue to Dashboard" : "Verify First"}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This security check helps prevent automated programs from accessing
            the system
          </p>
        </div>
      </div>
    </div>
  );
}
