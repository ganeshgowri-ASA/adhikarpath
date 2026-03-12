import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

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

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          empId: user.empId,
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position,
          orgUnit: user.orgUnit,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.empId = (user as { empId?: string }).empId;
        token.role = (user as { role?: string }).role;
        token.position = (user as { position?: string }).position;
        token.orgUnit = (user as { orgUnit?: string }).orgUnit;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { empId?: string }).empId = token.empId as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { position?: string }).position = token.position as string;
        (session.user as { orgUnit?: string }).orgUnit = token.orgUnit as string;
      }
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
});
