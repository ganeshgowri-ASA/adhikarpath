/**
 * NextAuth v5 TypeScript module augmentation
 *
 * Extends the default NextAuth Session, User, and JWT types with
 * AdhikarPath-specific fields so that session.user is fully typed
 * throughout the application.
 */

import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/auth-types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      empId: string;
      role: UserRole;
      position?: string;
      orgUnit?: string;
      department?: string;
      businessUnit?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    empId?: string;
    role?: UserRole;
    position?: string;
    orgUnit?: string;
    department?: string;
    businessUnit?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    empId?: string;
    role?: UserRole;
    position?: string;
    orgUnit?: string;
    department?: string;
    businessUnit?: string;
  }
}
