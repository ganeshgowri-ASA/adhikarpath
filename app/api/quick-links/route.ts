import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.quickLink.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { linkName, linkUrl, linkType } = body;

  if (!linkName || !linkUrl) {
    return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
  }

  const count = await prisma.quickLink.count({ where: { userId: session.user.id } });

  const link = await prisma.quickLink.create({
    data: {
      userId: session.user.id as string,
      linkName,
      linkUrl,
      linkType: linkType || "INTERNAL",
      sortOrder: count + 1,
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.quickLink.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
