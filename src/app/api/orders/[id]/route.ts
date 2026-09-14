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

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { coverImage: true, slug: true, instructions: true } },
          },
        },
        payments: true,
        purchases: {
          include: {
            product: { select: { title: true, coverImage: true, instructions: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Permission check: admin/support or the owner of the order or guest order
    if (user && user.role !== "ADMIN" && user.role !== "SUPPORT" && order.userId && order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order details error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}
