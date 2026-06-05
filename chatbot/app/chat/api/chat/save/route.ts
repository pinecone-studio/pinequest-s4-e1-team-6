import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const body = await req.json();

    const { chatId, messages, title } = body as {
      chatId: string;
      title?: string;
      messages: { role: string; content: string; imagePreview?: string }[];
    };

    if (!chatId || !messages?.length) {
      return NextResponse.json(
        { error: "chatId болон messages шаардлагатай" },
        { status: 400 },
      );
    }

    if (!clerkUserId || chatId.startsWith("guest_")) {
      return NextResponse.json({ success: true, guest: true });
    }

    const dbUser = await prisma.user.upsert({
      where: { clerkUserId },
      update: {},
      create: {
        clerkUserId,
        email: `${clerkUserId}@internal.user`,
        password: "CLERK_MANAGED",
        name: "User",
      },
    });

    const existingSession = await prisma.chatSession.findUnique({
      where: { id: chatId },
    });

    const finalTitle =
      body.title && body.title !== "Зургаар хайлт"
        ? body.title
        : existingSession?.title || "New Chat";

    const session = await prisma.chatSession.upsert({
      where: { id: chatId },
      update: {
        updatedAt: new Date(),
        title: finalTitle,
      },
      create: {
        id: chatId,
        userId: dbUser.id,
        title: finalTitle,
      },
    });

    await prisma.chatMessage.createMany({
      data: messages.map((m) => ({
        chatSessionId: session.id,
        role: m.role.toUpperCase() as "USER" | "ASSISTANT",
        content: m.content || "",
        imagePreview: m.imagePreview || null,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SAVE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
