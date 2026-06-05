import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
      select: { storeName: true }
    });

    return NextResponse.json({ 
      success: true, 
      storeName: user?.storeName ?? null 
    });
  } catch (error) {
    console.error("GET_STORE_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}