import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPPORT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalUsers,
      totalOrders,
      completedOrders,
      pendingOrders,
      activeTickets,
      recentOrders,
      products,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.ticket.count({ where: { status: { in: ["OPEN", "CUSTOMER_REPLY"] } } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      prisma.product.findMany({
        include: {
          _count: { select: { inventory: { where: { status: "AVAILABLE" } } } },
        },
      }),
    ]);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const inventoryAlerts = products
      .filter((p) => p.deliveryType === "INSTANT_KEYS" && p._count.inventory <= 2)
      .map((p) => ({
        id: p.id,
        title: p.title,
        remaining: p._count.inventory,
      }));

    return NextResponse.json({
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        pendingOrders,
        totalUsers,
        activeTickets,
        inventoryAlerts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user?.name || "Guest",
        customerEmail: o.user?.email || "N/A",
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        itemsCount: o.items.length,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
