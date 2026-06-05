import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const session = await prisma.chatSession.findFirst({
      where: { id, user: { clerkUserId } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return session ? NextResponse.json(session) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) { return NextResponse.json({ error: "Internal Error" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action, title } = body;

    const chat = await prisma.chatSession.findFirst({ where: { id, user: { clerkUserId } } });
    if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let data = {};
    if (action === "pin") data = { isPinned: !chat.isPinned };
    if (action === "rename") data = { title: title?.trim() || "Untitled" };
    if (action === "share") data = { isPublic: true };

    const updated = await prisma.chatSession.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) { return NextResponse.json({ error: "Update failed" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.chatSession.delete({ where: { id, user: { clerkUserId } } });

    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: "Delete failed" }, { status: 500 }); }
}