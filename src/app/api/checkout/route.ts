import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendDiscordOrderNotification } from "@/lib/discord";
import { logAdminAudit } from "@/lib/audit";

interface CheckoutItem {
  id: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { items, paymentMethod, couponCode, customerEmail, customerName, customerPhone } = body as {
      items: CheckoutItem[];
      paymentMethod: string;
      couponCode?: string;
      customerEmail?: string;
      customerName?: string;
      customerPhone?: string;
    };

    if (!items || !items.length) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // Determine customer record
    let customerId = user?.id;
    let email = user?.email || customerEmail?.trim();
    let name = user?.name || customerName?.trim() || "Customer";

    if (!email) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    if (!customerId) {
      // Find or create customer
      let existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!existing) {
        existing = await prisma.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            password: "TEMPORARY_GUEST_PASSWORD",
            role: "CUSTOMER",
            phone: customerPhone || null,
          },
        });
      }
      customerId = existing.id;
    }

    // Fetch products
    const productIds = items.map((i) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        inventory: { where: { status: "AVAILABLE" } },
      },
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { error: "One or more products in your cart are unavailable" },
        { status: 400 }
      );
    }

    // Calculate subtotal and verify stock
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      productTitle: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
      deliveryType: string;
    }> = [];

    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.id);
      if (!prod) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      if (prod.deliveryType === "INSTANT_KEYS" && prod.inventory.length < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${prod.title}". Only ${prod.inventory.length} left.` },
          { status: 400 }
        );
      }

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;
      orderItemsData.push({
        productId: prod.id,
        productTitle: prod.title,
        unitPrice: prod.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        deliveryType: prod.deliveryType,
      });
    }

    // Coupon calculation
    let discountAmount = 0;
    let validCoupon = null;
    if (couponCode) {
      validCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (validCoupon && validCoupon.isActive) {
        discountAmount = Number(((subtotal * validCoupon.discountPercent) / 100).toFixed(2));
      }
    }

    const totalAmount = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));

    // Wallet balance check if paying with wallet
    if (paymentMethod === "WALLET") {
      const currentUserRecord = await prisma.user.findUnique({ where: { id: customerId } });
      if (!currentUserRecord || currentUserRecord.walletBalance < totalAmount) {
        return NextResponse.json(
          { error: "Insufficient wallet balance. Please add funds or choose another payment method." },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    // Perform atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // If paying with wallet, deduct balance
      if (paymentMethod === "WALLET") {
        await tx.user.update({
          where: { id: customerId },
          data: {
            walletBalance: { decrement: totalAmount },
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: customerId,
            type: "PURCHASE",
            amount: -totalAmount,
            description: `Order #${orderNumber}`,
          },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: customerId,
          subtotal,
          discountAmount,
          taxAmount: 0,
          totalAmount,
          currency: "USD",
          status: "COMPLETED", // Instant fulfilled
          paymentStatus: "PAID",
          paymentMethod: paymentMethod || "CARD",
          couponCode: validCoupon?.code || null,
          items: {
            create: orderItemsData.map((oi) => ({
              productId: oi.productId,
              productTitle: oi.productTitle,
              unitPrice: oi.unitPrice,
              quantity: oi.quantity,
              subtotal: oi.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Create Payment Record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          currency: "USD",
          gateway: paymentMethod,
          status: "SUCCESS",
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        },
      });

      // Increment coupon timesUsed if used
      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      // Digital Provisioning & Key Vault population
      const deliveredKeys: Array<{ productTitle: string; content: string }> = [];

      for (const item of items) {
        const prod = dbProducts.find((p) => p.id === item.id);
        if (!prod) continue;

        // Increment totalSold on product
        await tx.product.update({
          where: { id: prod.id },
          data: { totalSold: { increment: item.quantity } },
        });

        if (prod.deliveryType === "INSTANT_KEYS") {
          // Atomically reserve and grab available inventory items
          const keysToDeliver = await tx.inventoryItem.findMany({
            where: {
              productId: prod.id,
              status: "AVAILABLE",
            },
            take: item.quantity,
          });

          for (const key of keysToDeliver) {
            await tx.inventoryItem.update({
              where: { id: key.id },
              data: {
                status: "SOLD",
                orderId: order.id,
                timesDelivered: { increment: 1 },
              },
            });

            await tx.purchase.create({
              data: {
                userId: customerId,
                productId: prod.id,
                orderId: order.id,
                keySecret: key.content,
                notes: key.notes || prod.instructions,
              },
            });

            deliveredKeys.push({
              productTitle: prod.title,
              content: key.content,
            });
          }
        }
      }

      // Update customer total spent
      await tx.user.update({
        where: { id: customerId },
        data: { totalSpent: { increment: totalAmount } },
      });

      return { order, deliveredKeys };
    });

    // Notify Discord webhook in background
    sendDiscordOrderNotification({
      orderNumber: result.order.orderNumber,
      customerEmail: email,
      amount: totalAmount,
      itemCount: items.reduce((a, b) => a + b.quantity, 0),
      paymentMethod,
    }).catch(console.error);

    // Audit log
    logAdminAudit({
      userId: customerId,
      action: "ORDER_COMPLETED",
      entity: "Order",
      entityId: result.order.id,
      details: `Order #${result.order.orderNumber} completed for $${totalAmount} via ${paymentMethod}`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      totalAmount,
      deliveredKeys: result.deliveredKeys,
      message: "Order placed and fulfilled successfully!",
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: error?.message || "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
