import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Nevtreegui baina" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Delguuriin ner zaaval heregtei" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Hereglegch burtgelgui baina" },
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

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        storeName: name,
        role: "STORE_OWNER",
      },
    });

    return NextResponse.json({
      success: true,
      store: newStore,
      storeName: name,
    });
  } catch (error: any) {
    console.error("CREATE_STORE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
