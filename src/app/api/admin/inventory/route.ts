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
      where: { deliveryType: "INSTANT_KEYS" },
      include: {
        inventory: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            timesDelivered: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });

    const stockData = products.map((p) => {
      const available = p.inventory.filter((i) => i.status === "AVAILABLE").length;
      const sold = p.inventory.filter((i) => i.status === "SOLD").length;
      const reserved = p.inventory.filter((i) => i.status === "RESERVED").length;

      return {
        id: p.id,
        title: p.title,
        coverImage: p.coverImage,
        available,
        sold,
        reserved,
        total: p.inventory.length,
      };
    });

    return NextResponse.json({ stock: stockData });
  } catch (error) {
    console.error("Admin inventory GET error:", error);
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { productId, content, notes } = await req.json();

    if (!productId || !content) {
      return NextResponse.json(
        { error: "Product ID and keys/credentials are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Split raw text by newline or comma
    const rawLines = content
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    if (rawLines.length === 0) {
      return NextResponse.json({ error: "No valid keys found in input" }, { status: 400 });
    }

    // Create inventory items in bulk
    const dataToInsert = rawLines.map((keySecret: string) => ({
      productId,
      content: keySecret,
      status: "AVAILABLE",
      notes: notes || null,
    }));

    await prisma.inventoryItem.createMany({
      data: dataToInsert,
    });

    await logAdminAudit({
      userId: user.id,
      action: "INVENTORY_BULK_IMPORT",
      entity: "Product",
      entityId: productId,
      details: `Imported ${rawLines.length} keys for "${product.title}"`,
    });

    return NextResponse.json({
      success: true,
      count: rawLines.length,
      message: `Successfully imported ${rawLines.length} credentials into inventory!`,
    });
  } catch (error: any) {
    console.error("Admin inventory import error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to import inventory" },
      { status: 500 }
    );
  }
}
