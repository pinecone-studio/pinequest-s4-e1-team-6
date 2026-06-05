import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Нэвтэрнэ үү" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not synced to database" },
        { status: 404 },
      );
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: dbUser.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("history error:", error);
    return NextResponse.json(
      {
        error: "Дата татахад алдаа гарлаа",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
