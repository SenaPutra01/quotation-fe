"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function TokenMonitor() {
  const router = useRouter();

  useEffect(() => {
    const checkTokenExpiry = () => {
      try {
        const tokenExpiry = document.cookie
          .split("; ")
          .find((row) => row.startsWith("tokenExpiry="))
          ?.split("=")[1];

        if (tokenExpiry) {
          const timeUntilExpiry = parseInt(tokenExpiry) - Date.now();

          if (timeUntilExpiry <= 0) {
            router.push("/login");
            return;
          }

          if (timeUntilExpiry < 2 * 60 * 1000) {
          }
        }
      } catch (error) {
        console.error("Error checking token expiry:", error);
      }
    };

    const interval = setInterval(checkTokenExpiry, 30000);

    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
