import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { empId: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(role && { role: role as never }),
    },
    select: {
      id: true,
      empId: true,
      name: true,
      email: true,
      position: true,
      orgUnit: true,
      role: true,
      managerId: true,
      manager: { select: { id: true, name: true, empId: true } },
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return NextResponse.json({ users });
}
