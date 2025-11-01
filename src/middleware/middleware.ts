import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tokenRefreshService } from "@/services/token-refresh-service";

const publicPaths = ["/login", "/register", "/api/public"];
const authPaths = ["/dashboard", "/users", "/api/protected"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth = authPaths.some((path) => pathname.startsWith(path));
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (requiresAuth && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && accessToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (requiresAuth && accessToken && refreshToken) {
    try {
      const response = NextResponse.next();

      const tokenExpiry = request.cookies.get("tokenExpiry")?.value;
      if (tokenExpiry) {
        const timeUntilExpiry = parseInt(tokenExpiry) - Date.now();

        if (timeUntilExpiry < 10 * 60 * 1000) {
          response.headers.set("x-token-expiring-soon", "true");
        }
      }

      return response;
    } catch (error) {
      console.error("Middleware auth check failed:", error);

      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
