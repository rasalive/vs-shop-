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

    const products = await prisma.product.findMany({
      include: {
        category: true,
        features: true,
        _count: {
          select: { inventory: { where: { status: "AVAILABLE" } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        stock: p.deliveryType === "INSTANT_KEYS" ? p._count.inventory : p.stock,
      })),
    });
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      instructions,
      price,
      comparePrice,
      categoryId,
      coverImage,
      badge,
      deliveryType,
      deliveryTime,
      warrantyPeriod,
      features,
    } = body;

    if (!title || !price || !categoryId) {
      return NextResponse.json({ error: "Title, price, and category are required" }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newProduct = await prisma.product.create({
      data: {
        title,
        slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
        description: description || "",
        instructions: instructions || "Login credentials will appear in your Digital Vault immediately upon purchase.",
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        coverImage: coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
        badge: badge || null,
        deliveryType: deliveryType || "INSTANT_KEYS",
        deliveryTime: deliveryTime || "Instant Delivery (0-2 mins)",
        warrantyPeriod: warrantyPeriod || "Lifetime Warranty",
        features: features && features.length > 0
          ? {
              create: features.map((f: string) => ({ feature: f })),
            }
          : undefined,
      },
    });

    await logAdminAudit({
      userId: user.id,
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: newProduct.id,
      details: `Created product "${newProduct.title}" ($${newProduct.price})`,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, price, comparePrice, description, instructions, badge, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title,
        price: price ? parseFloat(price) : undefined,
        comparePrice: comparePrice !== undefined ? (comparePrice ? parseFloat(comparePrice) : null) : undefined,
        description,
        instructions,
        badge,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    await logAdminAudit({
      userId: user.id,
      action: "PRODUCT_UPDATED",
      entity: "Product",
      entityId: id,
      details: `Updated product "${updated.title}"`,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
  }
}
