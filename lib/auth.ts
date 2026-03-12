/**
 * AdhikarPath Authentication Configuration (NextAuth v5)
 *
 * ARCHITECTURE:
 *  - Credentials provider always present (email + password)
 *  - Google OAuth: enabled when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set
 *  - Microsoft Entra ID: enabled when MICROSOFT_CLIENT_ID + MICROSOFT_CLIENT_SECRET
 *    + MICROSOFT_TENANT_ID are set
 *  - Adding new providers (SAML, LDAP, Okta, GitHub…) = append to providerList below
 *
 * MOCK / DEMO MODE:
 *  - When DATABASE_URL is not set, or Prisma throws (no DB provisioned),
 *    the credentials provider falls back to the in-memory demo user store
 *    defined in lib/demo-users.ts.  Real DB users always take precedence.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { AuthUser, UserRole } from "@/lib/auth-types";

// ─── Schema ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Database lookup (graceful fallback if DB is unavailable) ──────────────────

async function findUserInDatabase(email: string): Promise<AuthUser & { password: string } | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        empId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        position: true,
        orgUnit: true,
        password: true,
      },
    });
    if (!user || user.status !== "ACTIVE") return null;
    return {
      id: user.id,
      empId: user.empId,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      position: user.position ?? undefined,
      orgUnit: user.orgUnit ?? undefined,
      password: user.password,
    };
  } catch {
    // DB not reachable — fall through to demo store
    return null;
  }
}

// ─── Provider list ─────────────────────────────────────────────────────────────
// To add a new provider (Okta, GitHub, SAML, etc.), just push it here
// following the same conditional pattern.

const credentialsProvider = CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials): Promise<AuthUser | null> {
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) return null;

    const { email, password } = parsed.data;

    // 1. Try real database first
    const dbUser = await findUserInDatabase(email);
    if (dbUser) {
      const passwordMatch = await bcrypt.compare(password, dbUser.password);
      if (!passwordMatch) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...authUser } = dbUser;
      return authUser;
    }

    // 2. Fall back to in-memory demo users (no DB required)
    const { findDemoUser } = await import("@/lib/demo-users");
    return findDemoUser(email, password);
  },
});

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

const microsoftProvider =
  process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
    ? MicrosoftEntraID({
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        // Tenant-specific issuer; omit for multi-tenant (common endpoint)
        ...(process.env.MICROSOFT_TENANT_ID
          ? { issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0` }
          : {}),
      })
    : null;

// ─── NextAuth config ───────────────────────────────────────────────────────────

export const authConfig: NextAuthConfig = {
  providers: [
    credentialsProvider,
    ...(googleProvider ? [googleProvider] : []),
    ...(microsoftProvider ? [microsoftProvider] : []),
    // 👇 Add new providers here: Okta, GitHub, SAML, etc.
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign-in, `user` is populated; persist custom fields to token
      if (user) {
        const u = user as AuthUser;
        token.id = u.id;
        token.empId = u.empId;
        token.role = u.role;
        token.position = u.position;
        token.orgUnit = u.orgUnit;
        token.department = u.department;
        token.businessUnit = u.businessUnit;
      }
      // For OAuth sign-ins, we could fetch/create the user in DB here
      if (account && account.provider !== "credentials") {
        // OAuth: set a default role for new SSO users
        if (!token.role) token.role = "EMPLOYEE" as UserRole;
        if (!token.empId) token.empId = `SSO-${token.sub?.slice(0, 8)}`;
      }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as AuthUser).empId = token.empId as string;
      (session.user as AuthUser).role = token.role as UserRole;
      (session.user as AuthUser).position = token.position as string | undefined;
      (session.user as AuthUser).orgUnit = token.orgUnit as string | undefined;
      (session.user as AuthUser).department = token.department as string | undefined;
      (session.user as AuthUser).businessUnit = token.businessUnit as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
