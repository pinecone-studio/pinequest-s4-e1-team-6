import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

// Маргаантай захиалгуудыг админ хянана
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const disputes = await prisma.order.findMany({
    where: { status: "DISPUTED" },
    include: {
      items: true,
      store: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { disputedAt: "desc" },
  });

  return NextResponse.json({ disputes });
}

// Маргааныг шийдвэрлэнэ: resolution = "REFUNDED" | "DELIVERED" | "CANCELLED"
export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderId, resolution } = await req.json();
  const allowed = ["REFUNDED", "DELIVERED", "CANCELLED"] as const;
  if (!orderId || !allowed.includes(resolution))
    return NextResponse.json(
      { error: "orderId болон зөв resolution шаардлагатай" },
      { status: 400 },
    );

  // REFUNDED-г CANCELLED төлвөөр илэрхийлнэ (схемд тусдаа enum байхгүй)
  const nextStatus = resolution === "REFUNDED" ? "CANCELLED" : resolution;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order)
    return NextResponse.json({ error: "Захиалга олдсонгүй" }, { status: 404 });

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      disputeResolved: true,
    },
  });

  return NextResponse.json({ success: true, order: updated });
}
