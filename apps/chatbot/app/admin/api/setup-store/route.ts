import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Дэлгүүрийн нэр заавал хэрэгтэй" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Хэрэглэгч бүртгэлгүй байна" },
        { status: 404 },
      );
    }

    const newStore = await prisma.store.create({
      data: {
        name: name,
        description: description || null,
        ownerId: dbUser.id,
      },
    });

    return NextResponse.json({ success: true, store: newStore });
  } catch (error: any) {
    console.error("STORE_CREATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
