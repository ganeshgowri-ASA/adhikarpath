import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || session.user.id;

  const accesses = await prisma.userSystemAccess.findMany({
    where: { userId },
    include: {
      system: {
        include: {
          business: { select: { id: true, name: true, code: true } },
          _count: { select: { roles: true } },
        },
      },
    },
    orderBy: { system: { systemName: "asc" } },
  });

  // Add role counts per system for this user
  const enriched = await Promise.all(
    accesses.map(async (a) => {
      const roleCount = await prisma.userRoleAssignment.count({
        where: {
          userId,
          role: { systemId: a.systemId },
          status: "ACTIVE",
        },
      });
      return { ...a, userRoleCount: roleCount };
    })
  );

  return NextResponse.json({ accesses: enriched });
}
