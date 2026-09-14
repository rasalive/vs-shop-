import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        walletBalance: user.walletBalance,
        totalSpent: user.totalSpent,
      },
    });
  } catch (error) {
    console.error("Auth Me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
