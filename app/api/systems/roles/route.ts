import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const systemId = searchParams.get("systemId");
  const q = searchParams.get("q") || "";

  const roles = await prisma.role.findMany({
    where: {
      ...(systemId && { systemId }),
      ...(q && {
        OR: [
          { roleName: { contains: q, mode: "insensitive" } },
          { processHierarchyPath: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      system: { select: { id: true, systemName: true, systemCode: true } },
      roleOwner: { select: { id: true, name: true } },
    },
    orderBy: { roleName: "asc" },
    take: 100,
  });

  return NextResponse.json({ roles });
}
