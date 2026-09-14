import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, signToken, setAuthCookie } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendDiscordOrderNotification } from "@/lib/discord";
import { logAdminAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      items,
      whatsappNumber,
      customerName,
      customerEmail,
      notes,
    } = body;

    if (!whatsappNumber || !whatsappNumber.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid WhatsApp phone number." },
        { status: 400 }
      );
    }

    if (!items || !items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // Customer resolution
    const cleanPhone = whatsappNumber.replace(/[^0-9+]/g, "");
    const email = user?.email || customerEmail?.trim() || `wa_${cleanPhone.replace("+", "")}@vortex.io`;
    const name = user?.name || customerName?.trim() || `WhatsApp Customer (${cleanPhone})`;

    let customerId = user?.id;
    if (!customerId) {
      let existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { phone: cleanPhone }],
        },
      });

      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            password: "WHATSAPP_AUTO_GUEST",
            phone: cleanPhone,
            role: "CUSTOMER",
          },
        });
      } else if (!existingUser.phone) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { phone: cleanPhone },
        });
      }
      customerId = existingUser.id;

      // Auto Fast-Login: Set JWT authentication cookie so the user is logged in
      try {
        const token = signToken({
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        });
        await setAuthCookie(token);
      } catch (tokenErr) {
        console.error("Auto login token error:", tokenErr);
      }
    } else {
      // Update phone on logged in user if not set
      await prisma.user.update({
        where: { id: customerId },
        data: { phone: cleanPhone },
      });
    }

    // Fetch products
    const productIds = items.map((i: any) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.id);
      if (!prod) continue;
      const itemSubtotal = prod.price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        productId: prod.id,
        productTitle: prod.title,
        unitPrice: prod.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const orderNumber = generateOrderNumber();

    // Create order with PENDING status specifically for WhatsApp manual payment / verification
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: customerId,
        subtotal,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: subtotal,
        currency: "USD",
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "WHATSAPP",
        notes: `WhatsApp: ${cleanPhone}. ${notes || ""}`,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Create pending payment log
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: subtotal,
        currency: "USD",
        gateway: "WHATSAPP",
        status: "PENDING",
        transactionId: `WA_${cleanPhone}_${orderNumber}`,
      },
    });

    // Generate prefilled WhatsApp link to admin support desk
    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+1234567890";
    const productSummary = orderItems.map((oi) => `${oi.quantity}x ${oi.productTitle}`).join(", ");
    const waText = encodeURIComponent(
      `Hello Vortex Support! 👋\nI just placed Order #${orderNumber} via WhatsApp.\nItems: ${productSummary}\nTotal: $${subtotal}\nMy WhatsApp: ${cleanPhone}\nPlease confirm my order and instructions!`
    );
    const whatsappRedirectUrl = `https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}?text=${waText}`;

    // Discord alert
    sendDiscordOrderNotification({
      orderNumber,
      customerEmail: `${email} (WA: ${cleanPhone})`,
      amount: subtotal,
      itemCount: items.reduce((a: number, b: any) => a + b.quantity, 0),
      paymentMethod: "WHATSAPP (PENDING VERIFICATION)",
    }).catch(console.error);

    logAdminAudit({
      userId: customerId,
      action: "WHATSAPP_ORDER_CREATED",
      entity: "Order",
      entityId: order.id,
      details: `New pending WhatsApp order #${orderNumber} from ${cleanPhone}`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "PENDING",
      totalAmount: subtotal,
      whatsappNumber: cleanPhone,
      whatsappRedirectUrl,
      message: "Order placed successfully! Your order is currently PENDING verification.",
    });
  } catch (error: any) {
    console.error("WhatsApp order API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process WhatsApp order." },
      { status: 500 }
    );
  }
}
