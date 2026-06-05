import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
export async function POST() {
  try {
    console.log("SYNC ROUTE HIT");
 
    const { userId } = await auth();
    console.log("userId:", userId);
 
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: userId not found" },
        { status: 401 },
      );
    }
 
    const clerkUser = await currentUser();
    console.log("clerkUser:", clerkUser?.id);
 
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 },
      );
    }
 
    const primaryEmail =
      clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "";
 
    console.log("primaryEmail:", primaryEmail);
 
    if (!primaryEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }
 
    const fullName =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
 
    const dbUser = await prisma.user.upsert({
      where: {
        clerkUserId: userId,
      },
      update: {
        email: primaryEmail,
        name: fullName, 
        imageUrl: clerkUser.imageUrl ?? null,
      },
      create: {
        clerkUserId: userId,
        email: primaryEmail,
        name: fullName,
        imageUrl: clerkUser.imageUrl ?? null,
        password: ""
      },
    });
 
    console.log("DB USER SYNCED:", dbUser.id);
 
    return NextResponse.json({
      success: true,
      user: dbUser,
    });
  } catch (error) {
    console.error("SYNC USER ERROR FULL:", error);
 
    return NextResponse.json(
      {
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}