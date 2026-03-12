import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const currentUserId = session.user.id as string;

  const { id } = await params;
  const { action, comments } = await req.json(); // action: "approve" | "reject"

  const request = await prisma.accessRequest.findUnique({
    where: { id },
    include: { approvalSteps: { orderBy: { sequence: "asc" } } },
  });

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // Find the pending step for this approver
  const step = request.approvalSteps.find(
    (s) => s.approverId === currentUserId && s.status === "PENDING"
  );

  if (!step) {
    return NextResponse.json({ error: "No pending step for this approver" }, { status: 403 });
  }

  // Update the step
  await prisma.approvalStep.update({
    where: { id: step.id },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      comments,
      actedAt: new Date(),
    },
  });

  // Determine new request status
  let newStatus = request.status;
  if (action === "reject") {
    newStatus = "REJECTED";
  } else if (step.approverRole === "L1_MANAGER") {
    // Check if there are RO steps pending
    const roSteps = request.approvalSteps.filter((s) => s.approverRole === "ROLE_OWNER");
    newStatus = roSteps.length > 0 ? "L1_APPROVED" : "PROVISIONED";
  } else if (step.approverRole === "ROLE_OWNER") {
    const allApproved = request.approvalSteps
      .filter((s) => s.id !== step.id)
      .every((s) => s.status === "APPROVED");
    newStatus = allApproved ? "PROVISIONED" : "L1_APPROVED";
  }

  await prisma.accessRequest.update({
    where: { id },
    data: { status: newStatus },
  });

  // If provisioned, activate access
  if (newStatus === "PROVISIONED" && request.systemId) {
    await prisma.userSystemAccess.upsert({
      where: { userId_systemId: { userId: request.targetUserId, systemId: request.systemId } },
      update: { status: "ACTIVE" },
      create: {
        userId: request.targetUserId,
        systemId: request.systemId,
        status: "ACTIVE",
        validFrom: new Date(),
      },
    });

    // Assign roles
    const reqRoles = await prisma.requestRole.findMany({ where: { requestId: id } });
    for (const rr of reqRoles) {
      await prisma.userRoleAssignment.upsert({
        where: { userId_roleId: { userId: request.targetUserId, roleId: rr.roleId } },
        update: { status: "ACTIVE" },
        create: { userId: request.targetUserId, roleId: rr.roleId, status: "ACTIVE" },
      });
    }
  }

  // Notify requestor
  await prisma.notification.create({
    data: {
      userId: request.requestorId,
      type: "APPROVAL_UPDATE",
      title: action === "approve" ? "Request Approved" : "Request Rejected",
      message: `Your access request has been ${action === "approve" ? "approved" : "rejected"}${comments ? `: ${comments}` : ""}.`,
    },
  });

  return NextResponse.json({ success: true, status: newStatus });
}
