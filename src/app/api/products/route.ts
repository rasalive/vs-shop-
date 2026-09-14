import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };
    if (sort === "popular") orderBy = { totalSold: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        features: true,
        images: { orderBy: { isPrimary: "desc" } },
        _count: {
          select: {
            inventory: { where: { status: "AVAILABLE" } },
            reviews: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    const formatted = products.map((p) => {
      const stock = p.deliveryType === "INSTANT_KEYS" ? p._count.inventory : p.stock;
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        coverImage: p.coverImage,
        category: p.category,
        deliveryType: p.deliveryType,
        deliveryTime: p.deliveryTime,
        warrantyPeriod: p.warrantyPeriod,
        rating: p.rating,
        reviewCount: p.reviewCount,
        totalSold: p.totalSold,
        stock,
        badge: p.badge,
        features: p.features.map((f) => f.feature),
        images: p.images.map((img) => img.url),
      };
    });

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
