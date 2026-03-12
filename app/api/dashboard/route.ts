import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [
    pendingApprovals,
    myRequests,
    myAccessCount,
    quickLinks,
    helpDocs,
  ] = await Promise.all([
    // Pending approvals where I am the approver
    prisma.approvalStep.count({
      where: { approverId: userId, status: "PENDING" },
    }),
    // My submitted requests
    prisma.accessRequest.count({
      where: { requestorId: userId },
    }),
    // My active system accesses
    prisma.userSystemAccess.count({
      where: { userId, status: "ACTIVE" },
    }),
    // Quick links for this user
    prisma.quickLink.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    }),
    // Top-level help documents
    prisma.helpDocument.findMany({
      where: { parentId: null },
      select: { id: true, title: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    pendingApprovals,
    myRequests,
    myAccessCount,
    quickLinks,
    helpDocs,
  });
}
