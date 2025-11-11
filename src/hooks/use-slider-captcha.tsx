import { useState, useCallback } from "react";
import {
  generateSliderCaptchaAction,
  loginWithCaptchaAction,
  verifySliderCaptchaAction,
} from "../actions/captcha-actions";

interface CaptchaData {
  sessionId: string;
  backgroundImage: string;
  puzzlePiece: string;
  puzzleY: number;
  canvasWidth: number;
  canvasHeight: number;
  puzzleSize: number;
  expiresIn: number;
}

interface CaptchaState {
  verified: boolean;
  sessionId: string | null;
  position: number | null;
}

export const useSliderCaptcha = () => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [captchaState, setCaptchaState] = useState<CaptchaState>({
    verified: false,
    sessionId: null,
    position: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCaptchaState({
      verified: false,
      sessionId: null,
      position: null,
    });

    try {
      const result = await generateSliderCaptchaAction();

      if (result.success && result.data) {
        setCaptchaData(result.data);
      } else {
        throw new Error(result.error || "Failed to load captcha");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load captcha";
      setError(errorMessage);
      console.error("Captcha load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyCaptcha = useCallback(
    async (sliderPosition: number) => {
      if (!captchaData?.sessionId) {
        setError("No captcha session available");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await verifySliderCaptchaAction(
          captchaData.sessionId,
          sliderPosition
        );

        if (result.success && result.data?.valid) {
          setCaptchaState({
            verified: true,
            sessionId: captchaData.sessionId,
            position: sliderPosition,
          });
          return true;
        } else {
          setError(
            result.data?.message || result.error || "Verification failed"
          );
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Verification failed";
        setError(errorMessage);
        console.error("Captcha verification error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [captchaData]
  );

  const loginWithCaptcha = useCallback(
    async (credentials: { email: string; password: string }) => {
      if (
        !captchaState.verified ||
        !captchaState.sessionId ||
        !captchaState.position
      ) {
        setError("Please complete captcha verification first");
        return { success: false, error: "Captcha not verified" };
      }

      setLoading(true);
      setError(null);

      try {
        const result = await loginWithCaptchaAction({
          email: credentials.email,
          password: credentials.password,
          captchaSessionId: captchaState.sessionId,
          sliderPosition: captchaState.position,
        });

        if (result.success) {
          resetCaptcha();
          return {
            success: true,
            data: result.data,
            message: result.message,
          };
        } else {
          setError(result.error || "Login failed");
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        console.error("Login with captcha error:", err);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [captchaState, resetCaptcha]
  );

  const resetCaptcha = useCallback(() => {
    setCaptchaState({
      verified: false,
      sessionId: null,
      position: null,
    });
    setCaptchaData(null);
    setError(null);
  }, []);

  return {
    captchaData,
    captchaState,
    loading,
    error,
    loadCaptcha,
    verifyCaptcha,
    loginWithCaptcha,
    resetCaptcha,
  };
};
