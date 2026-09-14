import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { phone, name, email } = await req.json();

    if (!phone || phone.trim().length < 8) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp phone number." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    const userEmail = email?.trim().toLowerCase() || `wa_${cleanPhone.replace("+", "")}@vortex.io`;
    const userName = name?.trim() || `Customer (${cleanPhone})`;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: userEmail },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          phone: cleanPhone,
          password: "FAST_LOGIN_AUTO",
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });
    } else {
      // Update phone or name if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: cleanPhone,
          ...(name?.trim() ? { name: userName } : {}),
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Fast login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("Fast login error:", error);
    return NextResponse.json(
      { error: "Failed to process fast login." },
      { status: 500 }
    );
  }
}
