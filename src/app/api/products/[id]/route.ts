import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        category: true,
        features: true,
        images: { orderBy: { isPrimary: "desc" } },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            inventory: { where: { status: "AVAILABLE" } },
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Also fetch 4 related products in same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        _count: {
          select: { inventory: { where: { status: "AVAILABLE" } } },
        },
      },
      take: 4,
    });

    const stock =
      product.deliveryType === "INSTANT_KEYS"
        ? product._count.inventory
        : product.stock;

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        instructions: product.instructions,
        price: product.price,
        comparePrice: product.comparePrice,
        coverImage: product.coverImage,
        category: product.category,
        deliveryType: product.deliveryType,
        deliveryTime: product.deliveryTime,
        warrantyPeriod: product.warrantyPeriod,
        rating: product.rating,
        reviewCount: product.reviewCount,
        totalSold: product.totalSold,
        stock,
        badge: product.badge,
        features: product.features.map((f) => f.feature),
        images: product.images.map((img) => img.url),
        reviews: product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          isVerified: r.isVerified,
          createdAt: r.createdAt,
          userName: r.user.name,
          userAvatar: r.user.avatar,
        })),
      },
      related: related.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        price: r.price,
        comparePrice: r.comparePrice,
        coverImage: r.coverImage,
        stock: r.deliveryType === "INSTANT_KEYS" ? r._count.inventory : r.stock,
      })),
    });
  } catch (error) {
    console.error("Product detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
