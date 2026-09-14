import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAdminAudit } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPPORT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Admin tickets GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPPORT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ticketId, status, priority, staffNotes, replyMessage } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Optional staff reply
    if (replyMessage && replyMessage.trim()) {
      await prisma.ticketMessage.create({
        data: {
          ticketId,
          userId: user.id,
          message: replyMessage.trim(),
          isStaff: true,
        },
      });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: status || (replyMessage ? "ANSWERED" : ticket.status),
        priority: priority || ticket.priority,
        staffNotes: staffNotes !== undefined ? staffNotes : ticket.staffNotes,
        updatedAt: new Date(),
      },
    });

    await logAdminAudit({
      userId: user.id,
      action: "TICKET_UPDATED",
      entity: "Ticket",
      entityId: ticketId,
      details: `Updated ticket #${ticket.ticketNumber} (Status: ${updated.status})`,
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update ticket" }, { status: 500 });
  }
}
