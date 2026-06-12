import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Nevtreegui" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Ner heregtei" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { stores: true },
  });
  if (!dbUser)
    return NextResponse.json({ error: "Burtgel oldsongui" }, { status: 404 });
  if (dbUser.stores.length > 0)
    return NextResponse.json(
      { error: "Huselt ilgeesen baina" },
      { status: 409 },
    );

  const store = await prisma.store.create({
    data: { name, description: description || null, ownerId: dbUser.id },
  });
  return NextResponse.json({ success: true, store });
}
