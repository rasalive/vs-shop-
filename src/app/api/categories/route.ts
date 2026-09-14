import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      image: c.image,
      productCount: c._count.products,
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
