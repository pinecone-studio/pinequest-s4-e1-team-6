import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const stores = await prisma.store.findMany({
    include: { owner: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ stores });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { storeId, action } = await req.json(); // action: "approve" | "reject"
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store)
    return NextResponse.json({ error: "Store oldsongui" }, { status: 404 });

  if (action === "approve") {
    const owner = await prisma.user.findUnique({
      where: { id: store.ownerId },
    });
    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: store.ownerId },
        data: {
          role: owner?.role === "ADMIN" ? "ADMIN" : "STORE_OWNER",
          storeName: store.name,
        },
      }),
    ]);
  } else {
    await prisma.store.update({
      where: { id: storeId },
      data: { status: "REJECTED" },
    });
  }
  return NextResponse.json({ success: true });
}
