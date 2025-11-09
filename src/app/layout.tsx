import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { META_THEME_COLORS } from "@/lib/config";
import { TokenMonitor } from "@/components/auth/token-monitoring";
import { Toaster } from "sonner";
import { checkAndRefresh } from "../actions/token-actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quotations Morp",
  description: "Authentication app built with shadcn/ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  checkAndRefresh();
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="theme-color" content={META_THEME_COLORS.light} />
      <body className={inter.className}>
        <AuthProvider>
          <TokenMonitor />
          <Toaster position="top-right" richColors closeButton />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
