"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SpinnerIcon,
  MailIcon,
  LockIcon,
  WarningIcon,
  LoginIcon,
} from "@/components/loginIcons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/dashboard";

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setIsLoading(false);
        throw new Error("Please fill in all fields");
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        setIsLoading(false);
        throw new Error("Please enter a valid email address");
      }

      await login({ email, password });

      router.replace(redirectTo);

      router.refresh();
    } catch (err) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;

        if (
          errorMessage.toLowerCase().includes("credentials") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("unauthorized") ||
          errorMessage.toLowerCase().includes("failed")
        ) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (
          errorMessage.toLowerCase().includes("network") ||
          errorMessage.toLowerCase().includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (errorMessage.includes("fill")) {
          errorMessage = errorMessage;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      onSubmit(e);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={handleKeyPress}
                  className="h-11 px-4 py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={handleKeyPress}
                  className="h-11 px-4 py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3"></div>
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg bg-red-50 p-4 border border-red-200 animate-in fade-in duration-300"
                role="alert"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <WarningIcon className="h-5 w-5 text-red-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                    <p className="text-sm text-red-600 mt-1">
                      If you continue to have issues, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white font-medium rounded-lg transition-colors duration-200 w-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LoginIcon className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            onClick={() => {}}
          >
            Contact administrator
          </button>
        </p>
      </div>

      {process.env.NEXT_PUBLIC_APP_ENV === "development" && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Debug Info:</strong>
            <br />
            Email: {email}
            <br />
            Password: {password ? "***" : "(empty)"}
            <br />
            Redirect to: {redirectTo}
            <br />
            Loading: {isLoading ? "Yes" : "No"}
            <br />
            Has Error: {error ? "Yes" : "No"}
            <br />
            Error Message: {error || "(none)"}
          </p>
        </div>
      )}
    </div>
  );
}
