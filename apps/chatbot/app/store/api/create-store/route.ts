import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/isAdmin";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Nevtreegui baina" }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const existingStore = await prisma.store.findFirst({
      where: { ownerId: dbUser.id },
      orderBy: { createdAt: "asc" },
    });

    if (existingStore) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          storeName: existingStore.name,
          role: dbUser.role === "ADMIN" ? "ADMIN" : "STORE_OWNER",
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: `Танд аль хэдийн "${existingStore.name}" дэлгүүр байна.`,
          existingStore,
          storeName: existingStore.name,
        },
        { status: 409 },
      );
    }

    const storeWithSameName = await prisma.store.findFirst({
      where: { name },
      select: { id: true, name: true },
    });

    if (storeWithSameName) {
      return NextResponse.json(
        {
          success: false,
          error: `"${name}" нэртэй дэлгүүр бүртгэлтэй байна. Өөр нэр сонгоно уу.`,
        },
        { status: 409 },
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
        role: dbUser.role === "ADMIN" ? "ADMIN" : "STORE_OWNER",
      },
    });

    return NextResponse.json({
      success: true,
      store: newStore,
      storeName: name,
    });
  } catch (error: unknown) {
    console.error("CREATE_STORE_ERROR:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
