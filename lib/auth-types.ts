/**
 * AdhikarPath Authentication Types
 *
 * Central type definitions for the authentication system.
 * Extend these types when adding new providers (SAML, LDAP, Okta, etc.)
 */

export type UserRole = "EMPLOYEE" | "L1_MANAGER" | "ROLE_OWNER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "DORMANT";

/** The canonical authenticated user object stored in JWT + session */
export interface AuthUser {
  id: string;
  empId: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  position?: string;
  orgUnit?: string;
  department?: string;
  businessUnit?: string;
}

/** Role display metadata */
export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: "Employee",
  L1_MANAGER: "L1 Manager",
  ROLE_OWNER: "Role Owner",
  ADMIN: "Administrator",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  EMPLOYEE: "bg-blue-100 text-blue-800",
  L1_MANAGER: "bg-green-100 text-green-800",
  ROLE_OWNER: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

/** Permission checks derived from role */
export interface UserPermissions {
  isEmployee: boolean;
  isManager: boolean;
  isRoleOwner: boolean;
  isAdmin: boolean;
  canApproveRequests: boolean;
  canManageRoles: boolean;
  canAccessAdmin: boolean;
  canCertifyAccess: boolean;
}

export function derivePermissions(role: UserRole): UserPermissions {
  return {
    isEmployee: role === "EMPLOYEE",
    isManager: role === "L1_MANAGER",
    isRoleOwner: role === "ROLE_OWNER",
    isAdmin: role === "ADMIN",
    canApproveRequests: role === "L1_MANAGER" || role === "ADMIN",
    canManageRoles: role === "ROLE_OWNER" || role === "ADMIN",
    canAccessAdmin: role === "ADMIN",
    canCertifyAccess: role === "ROLE_OWNER" || role === "L1_MANAGER" || role === "ADMIN",
  };
}
