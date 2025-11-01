"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/login-form";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Icons.spinner className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Content (Lebar Lebar) */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />

        {/* Decorative Elements */}
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
                Join thousands of companies that use our platform to streamline
                their operations, analyze data in real-time, and make better
                business decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form dengan Background Putih */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:max-w-md xl:max-w-lg lg:mx-auto bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Icons.logo className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shadcn Auth</h1>
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
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
