import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// --- GET: Чатны түүхийг мессежүүдтэй нь хамт авах ---
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: dbUser.id },
      include: { messages: { orderBy: { createdAt: "asc" } } }, // Мессежүүдийг нь хамт татна
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json(session);
  } catch (error) {
    console.error("GET session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- DELETE: Чат устгах ---
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Эхлээд эзэмшигч мөн эсэхийг шалгана
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: dbUser.id },
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    console.error("DELETE session error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// --- PATCH: Чатны гарчиг (Title) засах ---
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;
    const body = await req.json();
    const title = body?.title?.trim();

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Шинэчлэхдээ userId-г давхар шалгах (Security Check)
    const updatedSession = await prisma.chatSession.updateMany({
      where: { id: sessionId, userId: dbUser.id },
      data: { title },
    });

    if (updatedSession.count === 0) {
      return NextResponse.json({ error: "Session not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ success: true, title });
  } catch (error) {
    console.error("PATCH session error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}