import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 },
      );
    }

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;

    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: { clerkUserId: clerkUser.id },
        data: {
          email,
          name,
          imageUrl: clerkUser.imageUrl ?? null,
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
          clerkUserId: clerkUser.id,
          name,
          imageUrl: clerkUser.imageUrl ?? null,
        },
      });

      return NextResponse.json(dbUser);
    }

    dbUser = await prisma.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email,
        password: null,
        name,
        imageUrl: clerkUser.imageUrl ?? null,
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
