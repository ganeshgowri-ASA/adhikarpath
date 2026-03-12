import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const consultants = await prisma.consultant.findMany({
    include: {
      business: { select: { id: true, name: true, code: true } },
      sponsor: { select: { id: true, name: true, empId: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ consultants });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, businessId, category, validUntil } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const consultant = await prisma.consultant.create({
    data: {
      name,
      email,
      businessId: businessId || null,
      category,
      sponsorId: session.user.id,
      validUntil: validUntil ? new Date(validUntil) : null,
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ consultant }, { status: 201 });
}
