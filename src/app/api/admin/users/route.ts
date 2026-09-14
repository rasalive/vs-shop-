import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAdminAudit } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        walletBalance: true,
        totalSpent: true,
        createdAt: true,
        _count: {
          select: { orders: true, tickets: true, purchases: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, role, newPassword, walletAdjustment } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    let updatedUser;
    let auditDetails = "";

    switch (action) {
      case "BAN":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { status: "BANNED" },
        });
        auditDetails = `Banned user ${targetUser.email}`;
        break;

      case "UNBAN":
      case "ACTIVATE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { status: "ACTIVE" },
        });
        auditDetails = `Activated user ${targetUser.email}`;
        break;

      case "SUSPEND":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { status: "SUSPENDED" },
        });
        auditDetails = `Suspended user ${targetUser.email}`;
        break;

      case "MUTE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { status: "MUTED" },
        });
        auditDetails = `Muted user ${targetUser.email}`;
        break;

      case "CHANGE_ROLE":
        if (!role || !["ADMIN", "SUPPORT", "CUSTOMER"].includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role },
        });
        auditDetails = `Changed role of ${targetUser.email} to ${role}`;
        break;

      case "RESET_PASSWORD":
        const passwordToHash = newPassword || "VortexReset2026!";
        const hashedPassword = await hashPassword(passwordToHash);
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });
        auditDetails = `Reset password for ${targetUser.email}`;
        break;

      case "ADJUST_WALLET":
        const adjustment = parseFloat(walletAdjustment);
        if (isNaN(adjustment)) {
          return NextResponse.json({ error: "Invalid wallet adjustment" }, { status: 400 });
        }
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: adjustment } },
        });
        await prisma.walletTransaction.create({
          data: {
            userId,
            type: "ADMIN_ADJUST",
            amount: adjustment,
            description: `Manual admin balance adjustment`,
          },
        });
        auditDetails = `Adjusted wallet for ${targetUser.email} by $${adjustment}`;
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await logAdminAudit({
      userId: currentUser.id,
      action: `USER_MODERATION_${action}`,
      entity: "User",
      entityId: userId,
      details: auditDetails,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        walletBalance: updatedUser.walletBalance,
      },
      message: auditDetails,
    });
  } catch (error: any) {
    console.error("Admin user moderation error:", error);
    return NextResponse.json({ error: error?.message || "Action failed" }, { status: 500 });
  }
}
