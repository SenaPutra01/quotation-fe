"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/login-form";
import { SliderCaptcha } from "@/components/sliderCaptcha";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loginCompleted, setLoginCompleted] = useState(false);

  const redirectTo = searchParams.get("from") || "/dashboard";
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  useEffect(() => {}, [
    isAuthenticated,
    isLoading,
    showCaptcha,
    captchaVerified,
    loginCompleted,
  ]);

  useEffect(() => {
    if (
      isAuthenticated &&
      !isLoading &&
      loginCompleted &&
      !showCaptcha &&
      !captchaVerified
    ) {
      setShowCaptcha(true);
    }
  }, [
    isAuthenticated,
    isLoading,
    loginCompleted,
    showCaptcha,
    captchaVerified,
  ]);

  useEffect(() => {
    if (captchaVerified && isAuthenticated) {
      const timer = setTimeout(() => {
        console.log("Redirecting now...");
        router.replace(returnUrl);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [captchaVerified, isAuthenticated, router, returnUrl]);

  const handleCaptchaSuccess = (sessionId: string, position: number) => {
    setCaptchaVerified(true);
    setShowCaptcha(false);
  };

  const handleCaptchaError = (error: string) => {
    console.error("Captcha error:", error);
  };

  const handleCaptchaClose = () => {
    setShowCaptcha(false);

    if (isAuthenticated) {
      setCaptchaVerified(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginCompleted(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Icons.spinner className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && captchaVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.check className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Verification Successful!
          </h3>
          <p className="text-gray-600">Redirecting to dashboard...</p>
          <Icons.spinner className="h-6 w-6 animate-spin text-indigo-600 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && !showCaptcha && !captchaVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Icons.spinner className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Preparing verification...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex">
        <div className="hidden lg:flex flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-10"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-16 text-white w-full">
            <div className="max-w-2xl">
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
                    <Icons.logo className="h-12 w-12" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold mb-2">Shadcn Auth</h1>
                    <p className="text-xl text-indigo-100 opacity-90">
                      Enterprise Dashboard Solution
                    </p>
                  </div>
                </div>

                <h2 className="text-4xl font-bold mb-6 leading-tight">
                  Build Amazing Products <br />
                  <span className="text-indigo-200">With Powerful Tools</span>
                </h2>
                <p className="text-lg text-indigo-100 opacity-90 leading-relaxed">
                  Join thousands of companies that use our platform to
                  streamline their operations, analyze data in real-time, and
                  make better business decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:max-w-md xl:max-w-lg lg:mx-auto bg-white">
          <div className="mx-auto w-full max-w-sm">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Icons.logo className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Shadcn Auth
                </h1>
                <p className="text-sm text-gray-500">Professional Dashboard</p>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            <div className="mt-8">
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-white">i</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">
                    <strong>Security Notice:</strong> CAPTCHA verification is
                    required after login to ensure account security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCaptcha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Security Verification Required
                </h3>
                <button
                  onClick={handleCaptchaClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icons.x className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Complete the CAPTCHA to verify you're human and access your
                dashboard.
              </p>

              <SliderCaptcha
                onSuccess={handleCaptchaSuccess}
                onError={handleCaptchaError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
