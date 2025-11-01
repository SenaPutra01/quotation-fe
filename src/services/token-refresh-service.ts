"use server";

import { cookies } from "next/headers";
import { refreshTokenAction } from "@/actions/auth-actions";

class TokenRefreshService {
  private isRefreshing = false;

  async scheduleTokenRefresh() {
    if (typeof window !== "undefined") return;

    try {
      const cookieStore = cookies();
      const tokenExpiry = (await cookieStore).get("tokenExpiry")?.value;

      if (!tokenExpiry) return;

      const expiryTime = parseInt(tokenExpiry);
      const timeUntilExpiry = expiryTime - Date.now();

      if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

          setTimeout(async () => {
            try {
              await refreshTokenAction();
            } catch (error) {
              console.error("❌ Background token refresh failed:", error);
            } finally {
              this.isRefreshing = false;
            }
          }, refreshTime);
        }
      }
    } catch (error) {
      console.error("Error scheduling token refresh:", error);
      this.isRefreshing = false;
    }
  }

  async checkAndRefreshToken() {
    try {
      const cookieStore = cookies();
      const tokenExpiry = (await cookieStore).get("tokenExpiry")?.value;

      if (!tokenExpiry) return false;

      const timeUntilExpiry = parseInt(tokenExpiry) - Date.now();

      if (timeUntilExpiry < 5 * 60 * 1000) {
        await refreshTokenAction();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in proactive token refresh:", error);
      return false;
    }
  }
}

export const tokenRefreshService = new TokenRefreshService();
