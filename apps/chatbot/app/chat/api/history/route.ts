import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Нэвтэрнэ үү" }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!dbUser) {
      const claims = (sessionClaims || {}) as Record<string, unknown>;
      const email =
        typeof claims.email === "string" && claims.email
          ? claims.email
          : `${clerkUserId}@clerk.local`;
      const name =
        [
          typeof claims.first_name === "string" ? claims.first_name : "",
          typeof claims.last_name === "string" ? claims.last_name : "",
        ]
          .join(" ")
          .trim() ||
        (typeof claims.full_name === "string" ? claims.full_name : null) ||
        (typeof claims.username === "string" ? claims.username : null);
      const imageUrl =
        typeof claims.image_url === "string" ? claims.image_url : null;

      dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkUserId, name, imageUrl },
        create: { clerkUserId, email, password: null, name, imageUrl },
      });
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
