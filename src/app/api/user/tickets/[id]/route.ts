import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
        ...(user.role === "CUSTOMER" ? { userId: user.id } : {}),
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
        messages: {
          include: {
            user: { select: { name: true, avatar: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Ticket detail error:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
        ...(user.role === "CUSTOMER" ? { userId: user.id } : {}),
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isStaff = user.role === "ADMIN" || user.role === "SUPPORT";

    const [newMessage] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          message: message.trim(),
          isStaff,
        },
        include: {
          user: { select: { name: true, avatar: true, role: true } },
        },
      }),
      prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: isStaff ? "ANSWERED" : "CUSTOMER_REPLY",
          updatedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Ticket reply error:", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
