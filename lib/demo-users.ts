/**
 * AdhikarPath Demo / Mock User Store
 *
 * Provides an in-memory user store for demo and development use when no
 * PostgreSQL database is provisioned (e.g. Vercel preview deployments).
 *
 * HOW IT WORKS:
 *  - lib/auth.ts tries Prisma first; if that throws (no DATABASE_URL / no DB),
 *    it falls through to findDemoUser() here.
 *  - In production with a real DB, these users are never consulted.
 *
 * TO ADD A DEMO USER:  push a new entry to DEMO_USERS below.
 */

import type { AuthUser, UserRole } from "@/lib/auth-types";

interface DemoCredential extends AuthUser {
  /** Plain-text password — only used for demo/mock auth, never stored in DB */
  _password: string;
}

const DEMO_USERS: DemoCredential[] = [
  {
    id: "demo-001",
    empId: "EMP001",
    name: "Gowri Ganesh",
    email: "gowri.ganesh@adhikarpath.com",
    _password: "GowriGanesh@2024",
    role: "EMPLOYEE" as UserRole,
    position: "Software Engineer",
    orgUnit: "Technology",
    department: "Engineering",
    businessUnit: "Digital Services",
  },
  {
    id: "demo-002",
    empId: "MGR001",
    name: "Amit Verma",
    email: "amit.verma@adhikarpath.com",
    _password: "TeamLead@2024",
    role: "L1_MANAGER" as UserRole,
    position: "Team Lead",
    orgUnit: "Technology",
    department: "Engineering",
    businessUnit: "Digital Services",
  },
  {
    id: "demo-003",
    empId: "RO001",
    name: "Deepak Nair",
    email: "deepak.nair@adhikarpath.com",
    _password: "Deepak@2024",
    role: "ROLE_OWNER" as UserRole,
    position: "System Administrator",
    orgUnit: "IT Operations",
    department: "Infrastructure",
    businessUnit: "Enterprise IT",
  },
  {
    id: "demo-004",
    empId: "ADM001",
    name: "Admin User",
    email: "admin@adhikarpath.com",
    _password: "Admin@2024",
    role: "ADMIN" as UserRole,
    position: "System Admin",
    orgUnit: "IT",
    department: "IT",
    businessUnit: "Enterprise IT",
  },
];

/**
 * Find and authenticate a demo user by email + password.
 * Returns the AuthUser (without the password field) on success, null on failure.
 */
export function findDemoUser(email: string, password: string): AuthUser | null {
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u._password === password
  );
  if (!match) return null;

  // Strip the internal _password field before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _password, ...authUser } = match;
  return authUser;
}

/** List all demo user emails (used for display on the login page) */
export function getDemoUserEmails(): string[] {
  return DEMO_USERS.map((u) => u.email);
}
