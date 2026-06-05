import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const body = await req.json();
    const title = body?.title?.trim() || "New Chat";

    if (!clerkUserId) {
      return NextResponse.json(
        {
          id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          title,
          isGuest: true,
        },
        { status: 201 },
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not synced" }, { status: 404 });
    }

    const session = await prisma.chatSession.create({
      data: { title, userId: dbUser.id },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("create session error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
