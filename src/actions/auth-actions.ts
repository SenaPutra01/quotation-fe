"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function loginAction(credentials: {
  email: string;
  password: string;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    await setAuthCookies(data.tokens);

    return {
      success: true,
      message: "Login successful",
      user: data.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function logoutAction() {
  let logoutSuccessful = false;

  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const logoutPromise = fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Logout timeout")), 3000)
        );

        const response = (await Promise.race([
          logoutPromise,
          timeoutPromise,
        ])) as Response;

        if (response.ok) {
          logoutSuccessful = true;
        } else {
          console.warn(
            "Logout API call failed, but continuing with local logout"
          );
        }
      } catch (error) {
        console.error("Error calling logout API:", error);
      }
    }

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("tokenExpiry");

    return { success: true, apiCallSuccessful: logoutSuccessful };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, apiCallSuccessful: false };
  } finally {
    redirect("/login");
  }
}

export async function refreshTokenAction(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("refreshToken")?.value;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      await setAuthCookies(data.tokens);

      return data.tokens.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logoutAction();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function getValidToken(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const tokenExpiry = cookieStore.get("tokenExpiry")?.value;

    const hasValidToken =
      accessToken &&
      tokenExpiry &&
      parseInt(tokenExpiry) - Date.now() > 60 * 1000;

    if (!hasValidToken) {
      try {
        return await refreshTokenAction();
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        throw new Error("Unable to obtain valid token");
      }
    }

    return accessToken;
  } catch (error) {
    console.error("Error in getValidToken:", error);
    throw error;
  }
}

export async function getAuthStatus() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    return {
      isAuthenticated: !!(accessToken && refreshToken),
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      hasAccessToken: false,
      hasRefreshToken: false,
    };
  }
}

async function setAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}) {
  const cookieStore = cookies();

  const expiryTime = Date.now() + 60 * 60 * 1000;

  (await cookieStore).set("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  (await cookieStore).set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  (await cookieStore).set("tokenExpiry", expiryTime.toString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
}
