import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = (sessionClaims || {}) as Record<string, unknown>;
    const email =
      typeof claims.email === "string" && claims.email
        ? claims.email
        : `${userId}@clerk.local`;

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

    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          email,
          name,
          imageUrl,
        },
      });

      return NextResponse.json(dbUser);
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      dbUser = await prisma.user.update({
        where: { email },
        data: {
          clerkUserId: userId,
          name,
          imageUrl,
        },
      });

      return NextResponse.json(dbUser);
    }

    dbUser = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email,
        password: null,
        name,
        imageUrl,
      },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("sync-user error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
