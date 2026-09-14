import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAdminAudit } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { code, discountPercent, maxUses, expiresAt } = await req.json();

    if (!code || !discountPercent) {
      return NextResponse.json({ error: "Code and discount percentage are required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountPercent: parseFloat(discountPercent),
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    await logAdminAudit({
      userId: user.id,
      action: "COUPON_CREATED",
      entity: "Coupon",
      entityId: newCoupon.id,
      details: `Created coupon ${cleanCode} with ${discountPercent}% discount`,
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error: any) {
    console.error("Coupon create error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    await logAdminAudit({
      userId: user.id,
      action: "COUPON_DELETED",
      entity: "Coupon",
      entityId: id,
      details: `Deleted coupon ${id}`,
    });

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    console.error("Coupon delete error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete coupon" }, { status: 500 });
  }
}
