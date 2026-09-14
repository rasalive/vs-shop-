import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        walletBalance: true,
        walletTransactions: {
          orderBy: { createdAt: "desc" },
          take: 25,
        },
      },
    });

    return NextResponse.json({
      balance: userData?.walletBalance || 0,
      transactions: userData?.walletTransactions || [],
    });
  } catch (error) {
    console.error("Wallet API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet info" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method } = await req.json();
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: { increment: depositAmount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: depositAmount,
          description: `Wallet top-up via ${method || "Direct Pay"}`,
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      balance: updatedUser.walletBalance,
      message: `Successfully added $${depositAmount.toFixed(2)} to your Vortex wallet!`,
    });
  } catch (error) {
    console.error("Wallet deposit error:", error);
    return NextResponse.json({ error: "Failed to deposit funds" }, { status: 500 });
  }
}
