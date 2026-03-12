import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth-types";

/**
 * Role-restricted paths.
 * Users whose role is NOT in the allowed list are redirected to /dashboard.
 * Extend this map to gate new routes without touching the middleware logic.
 */
const ROLE_RESTRICTED_PATHS: Record<string, UserRole[]> = {
  "/manager-dashboard": ["L1_MANAGER", "ADMIN"],
  "/role-owner-dashboard": ["ROLE_OWNER", "ADMIN"],
  "/access-review": ["ROLE_OWNER", "L1_MANAGER", "ADMIN"],
};

export default auth(function middleware(req) {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicPath =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/api/auth");

  // ── 1. Auth gate ─────────────────────────────────────────────────────────────
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Redirect authenticated users away from /login ─────────────────────────
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ── 3. RBAC — role-based path protection ─────────────────────────────────────
  if (isLoggedIn) {
    const userRole = (req.auth?.user as { role?: UserRole })?.role;

    for (const [path, allowedRoles] of Object.entries(ROLE_RESTRICTED_PATHS)) {
      if (nextUrl.pathname.startsWith(path)) {
        if (!userRole || !allowedRoles.includes(userRole)) {
          const redirectUrl = new URL("/dashboard", nextUrl);
          redirectUrl.searchParams.set("error", "unauthorized");
          return NextResponse.redirect(redirectUrl);
        }
        break;
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
