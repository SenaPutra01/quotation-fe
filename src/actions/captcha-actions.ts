"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function generateSliderCaptchaAction() {
  try {
    const result = await serverApiService.generateSliderCaptcha();

    return {
      success: true,
      data: result,
      message: "Captcha generated successfully",
    };
  } catch (error) {
    console.error("Error generating captcha:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate captcha",
    };
  }
}

export async function verifySliderCaptchaAction(
  sessionId: string,
  sliderPosition: number
) {
  try {
    const result = await serverApiService.verifySliderCaptcha(
      sessionId,
      sliderPosition
    );

    return {
      success: result.valid || false,
      data: result,
      message: result.message || "Captcha verification completed",
    };
  } catch (error) {
    console.error("Error verifying captcha:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to verify captcha",
    };
  }
}

export async function loginWithCaptchaAction(credentials: {
  email: string;
  password: string;
  captchaSessionId: string;
  sliderPosition: number;
}) {
  try {
    const result = await serverApiService.loginWithCaptcha(credentials);

    if (result.success && result.data?.tokens) {
      const cookieStore = await cookies();
      const { accessToken, refreshToken } = result.data.tokens;

      cookieStore.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      if (result.data.user) {
        cookieStore.set("userData", JSON.stringify(result.data.user), {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      revalidateTag("auth");

      return {
        success: true,
        data: result.data,
        message: result.message || "Login successful",
      };
    }

    return {
      success: false,
      error: result.message || "Login failed",
    };
  } catch (error) {
    console.error("Error during login with captcha:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}
