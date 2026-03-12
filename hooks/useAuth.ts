"use client";

/**
 * AdhikarPath Auth Hooks
 *
 * Client-side hooks for consuming authentication state.
 * All hooks depend on <SessionProvider> being present (app/providers.tsx).
 *
 * Usage:
 *   const user = useCurrentUser();
 *   const { canApproveRequests } = usePermissions();
 *   const { hasAccess } = useRBAC(["L1_MANAGER", "ADMIN"]);
 */

import { useSession } from "next-auth/react";
import type { AuthUser, UserPermissions, UserRole } from "@/lib/auth-types";
import { derivePermissions } from "@/lib/auth-types";

/** Returns the current authenticated user, or null if not logged in */
export function useCurrentUser(): AuthUser | null {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return session.user as AuthUser;
}

/**
 * Returns session status alongside the user.
 * Useful when you need to distinguish "loading" from "unauthenticated".
 */
export function useAuthStatus(): {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const { data: session, status } = useSession();
  return {
    user: status === "authenticated" ? (session?.user as AuthUser) : null,
    status,
  };
}

/**
 * Returns a set of boolean permission flags derived from the user's role.
 * All flags are false while loading or unauthenticated.
 */
export function usePermissions(): UserPermissions {
  const user = useCurrentUser();
  if (!user) {
    return {
      isEmployee: false,
      isManager: false,
      isRoleOwner: false,
      isAdmin: false,
      canApproveRequests: false,
      canManageRoles: false,
      canAccessAdmin: false,
      canCertifyAccess: false,
    };
  }
  return derivePermissions(user.role);
}

/**
 * Role-based access control check.
 *
 * @param requiredRoles - At least one of these roles grants access
 * @returns { hasAccess, isLoading }
 *
 * @example
 *   const { hasAccess } = useRBAC(["L1_MANAGER", "ADMIN"]);
 *   if (!hasAccess) return <AccessDenied />;
 */
export function useRBAC(requiredRoles: UserRole[]): {
  hasAccess: boolean;
  isLoading: boolean;
} {
  const { status } = useSession();
  const user = useCurrentUser();

  if (status === "loading") return { hasAccess: false, isLoading: true };
  if (!user) return { hasAccess: false, isLoading: false };

  return {
    hasAccess: requiredRoles.includes(user.role),
    isLoading: false,
  };
}

/** True while the session is being fetched from the server */
export function useIsAuthLoading(): boolean {
  const { status } = useSession();
  return status === "loading";
}
