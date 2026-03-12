import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const businessId = searchParams.get("businessId");

  const systems = await prisma.system.findMany({
    where: {
      ...(q && {
        OR: [
          { systemName: { contains: q, mode: "insensitive" } },
          { systemCode: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(businessId && { businessId }),
    },
    include: {
      business: { select: { id: true, name: true, code: true } },
      _count: { select: { roles: true } },
    },
    orderBy: { systemName: "asc" },
  });

  return NextResponse.json({ systems });
}
