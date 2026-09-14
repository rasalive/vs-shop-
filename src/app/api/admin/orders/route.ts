import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAdminAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPPORT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: true,
        payments: true,
        purchases: {
          select: { id: true, keySecret: true, productId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, status, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, purchases: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If approving a PENDING WhatsApp order to COMPLETED, fulfill keys if not yet delivered
    if (status === "COMPLETED" && existingOrder.purchases.length === 0) {
      for (const item of existingOrder.items) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            inventory: { where: { status: "AVAILABLE" }, take: item.quantity },
          },
        });

        if (prod && prod.deliveryType === "INSTANT_KEYS" && prod.inventory.length >= item.quantity) {
          for (const key of prod.inventory) {
            await prisma.inventoryItem.update({
              where: { id: key.id },
              data: {
                status: "SOLD",
                orderId: existingOrder.id,
                timesDelivered: { increment: 1 },
              },
            });

            if (existingOrder.userId) {
              await prisma.purchase.create({
                data: {
                  userId: existingOrder.userId,
                  productId: prod.id,
                  orderId: existingOrder.id,
                  keySecret: key.content,
                  notes: prod.instructions,
                },
              });
            }
          }
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status || existingOrder.status,
        paymentStatus: paymentStatus || existingOrder.paymentStatus,
      },
    });

    await logAdminAudit({
      userId: currentUser.id,
      action: "ORDER_STATUS_UPDATED",
      entity: "Order",
      entityId: orderId,
      details: `Updated Order #${updated.orderNumber} status to ${status || existingOrder.status}`,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order" }, { status: 500 });
  }
}
