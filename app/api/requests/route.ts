import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "my" | "pending-l1" | "pending-ro"
  const userId = session.user.id;

  let requests;

  if (type === "pending-l1") {
    // L1 Manager: requests where current user is approver
    requests = await prisma.accessRequest.findMany({
      where: {
        approvalSteps: {
          some: {
            approverId: userId,
            approverRole: "L1_MANAGER",
            status: "PENDING",
          },
        },
        status: { in: ["PENDING"] },
      },
      include: {
        requestor: { select: { id: true, name: true, empId: true, position: true } },
        targetUser: { select: { id: true, name: true, empId: true, position: true } },
        system: { select: { id: true, systemName: true, systemCode: true } },
        requestRoles: { include: { role: { select: { id: true, roleName: true } } } },
        approvalSteps: { include: { approver: { select: { id: true, name: true } } }, orderBy: { sequence: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (type === "pending-ro") {
    // Role Owner: requests where current user is role owner approver
    requests = await prisma.accessRequest.findMany({
      where: {
        approvalSteps: {
          some: {
            approverId: userId,
            approverRole: "ROLE_OWNER",
            status: "PENDING",
          },
        },
        status: { in: ["PENDING", "L1_APPROVED"] },
      },
      include: {
        requestor: { select: { id: true, name: true, empId: true, position: true } },
        targetUser: { select: { id: true, name: true, empId: true, position: true } },
        system: { select: { id: true, systemName: true, systemCode: true } },
        requestRoles: { include: { role: { select: { id: true, roleName: true, roleOwner: { select: { id: true, name: true } } } } } },
        approvalSteps: { include: { approver: { select: { id: true, name: true } } }, orderBy: { sequence: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // My requests
    requests = await prisma.accessRequest.findMany({
      where: { requestorId: userId },
      include: {
        targetUser: { select: { id: true, name: true, empId: true } },
        system: { select: { id: true, systemName: true, systemCode: true } },
        requestRoles: { include: { role: { select: { id: true, roleName: true } } } },
        approvalSteps: { include: { approver: { select: { id: true, name: true } } }, orderBy: { sequence: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requestorId = session.user.id as string;

  const body = await req.json();
  const {
    targetUserId,
    requestType,
    systemId,
    justification,
    isTemporary,
    tempStart,
    tempEnd,
    roleIds,
  } = body;

  if (!targetUserId || !requestType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find target user's manager for L1 approval step
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { managerId: true, manager: true },
  });

  const request = await prisma.accessRequest.create({
    data: {
      requestorId,
      targetUserId,
      requestType,
      systemId: systemId || null,
      justification,
      isTemporary: isTemporary || false,
      tempStart: tempStart ? new Date(tempStart) : null,
      tempEnd: tempEnd ? new Date(tempEnd) : null,
      status: "PENDING",
      requestRoles: roleIds?.length
        ? { create: roleIds.map((roleId: string) => ({ roleId })) }
        : undefined,
    },
  });

  // Create L1 approval step
  if (targetUser?.managerId) {
    await prisma.approvalStep.create({
      data: {
        requestId: request.id,
        approverId: targetUser.managerId,
        approverRole: "L1_MANAGER",
        sequence: 1,
        status: "PENDING",
      },
    });
  }

  // Create Role Owner approval steps for each role
  if (roleIds?.length) {
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, roleOwnerId: true },
    });
    const uniqueOwners = new Set(roles.map((r) => r.roleOwnerId).filter(Boolean));
    let seq = 2;
    for (const ownerId of uniqueOwners) {
      if (ownerId) {
        await prisma.approvalStep.create({
          data: {
            requestId: request.id,
            approverId: ownerId,
            approverRole: "ROLE_OWNER",
            sequence: seq++,
            status: "PENDING",
          },
        });
      }
    }
  }

  // Notification for requestor
  await prisma.notification.create({
    data: {
      userId: requestorId,
      type: "ACCESS_REQUEST",
      title: "Access Request Submitted",
      message: `Your ${requestType.replace("_", " ")} request has been submitted and is pending approval.`,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
