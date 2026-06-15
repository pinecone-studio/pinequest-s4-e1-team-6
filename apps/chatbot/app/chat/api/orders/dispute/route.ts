import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Хэрэглэгч өөрийн захиалга дээр маргаан мэдүүлнэ
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  const { orderId, reason } = await req.json();
  if (!orderId || !String(reason || "").trim())
    return NextResponse.json(
      { error: "Захиалга болон маргааны шалтгаан шаардлагатай" },
      { status: 400 },
    );

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!dbUser)
    return NextResponse.json({ error: "Бүртгэл олдсонгүй" }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { id: String(orderId), userId: dbUser.id },
  });
  if (!order)
    return NextResponse.json({ error: "Захиалга олдсонгүй" }, { status: 404 });

  if (order.status === "DISPUTED")
    return NextResponse.json(
      { error: "Энэ захиалгад маргаан аль хэдийн нээгдсэн байна" },
      { status: 409 },
    );

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "DISPUTED",
      disputeReason: String(reason).trim(),
      disputedAt: new Date(),
      disputeResolved: false,
    },
  });

  return NextResponse.json({ success: true, order: updated });
}
