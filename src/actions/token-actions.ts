"use server";

import { getAuthStatus, refreshTokenAction } from "@/actions/auth-actions";
import { cookies } from "next/headers";

export async function scheduleAutoRefresh() {
  if (typeof window !== "undefined") return;

  try {
    const authStatus = await getAuthStatus();
    if (!authStatus.isAuthenticated) return;

    const { cookies } = await import("next/headers");
    const tokenExpiry = (await cookies()).get("tokenExpiry")?.value;

    if (!tokenExpiry) return;

    const expiryTime = parseInt(tokenExpiry);
    const timeUntilExpiry = expiryTime - Date.now();

    if (timeUntilExpiry <= 0) return;

    const refreshTime = Math.max(timeUntilExpiry - 10 * 60 * 1000, 5000);

    console.log(`Scheduling auto-refresh in ${refreshTime / 1000} seconds`);

    setTimeout(async () => {
      try {
        await refreshTokenAction();
        await scheduleAutoRefresh();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, refreshTime);
  } catch (error) {
    console.error("Error in scheduleAutoRefresh:", error);
  }
}

export async function checkAndRefresh() {
  try {
    const authStatus = await getAuthStatus();
    if (!authStatus.isAuthenticated) return false;

    const cookieStore = await cookies();
    const tokenExpiry = cookieStore.get("tokenExpiry");

    if (!tokenExpiry || !tokenExpiry.value) return false;

    const expiryTime = parseInt(tokenExpiry.value);

    if (isNaN(expiryTime)) {
      console.error("Invalid token expiry time");
      return false;
    }

    const timeUntilExpiry = expiryTime - Date.now();

    if (timeUntilExpiry < 15 * 60 * 1000) {
      console.log("Token needs refresh, refreshing...");
      await refreshTokenAction();
      return true;
    }

    console.log(
      `Token still valid for ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`
    );
    return false;
  } catch (error) {
    console.error("Error in checkAndRefresh:", error);
    return false;
  }
}
